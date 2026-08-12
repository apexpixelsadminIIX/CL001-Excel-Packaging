from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid
import io
import csv
import logging
import bcrypt
import jwt
import httpx
import requests

from content_data import DEFAULT_CONTENT, PRIORITY

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"

app = FastAPI()
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("excel")


# ---------- Object storage ----------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "excel-packaging"
storage_key = None
MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml"}


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------- Auth helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(email: str) -> str:
    payload = {"sub": email, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_admin(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"email": payload.get("sub")}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------- Models ----------
class LoginInput(BaseModel):
    email: str
    password: str


class EnquiryInput(BaseModel):
    company_name: str
    contact_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    products_offered: Optional[str] = ""
    products_required: str
    quantity: str
    what: str
    when: str
    where: str
    division: Optional[str] = "packaging"


# ---------- Auth routes ----------
@api.post("/auth/login")
async def login(data: LoginInput):
    user = await db.users.find_one({"email": data.email.lower().strip()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["email"])
    return {"token": token, "user": {"email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}}


@api.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


# ---------- Content routes ----------
@api.get("/content")
async def get_content():
    doc = await db.site_content.find_one({"_id": "site"})
    if not doc:
        await db.site_content.insert_one(dict(DEFAULT_CONTENT))
        doc = dict(DEFAULT_CONTENT)
    doc.pop("_id", None)
    doc.get("settings", {}).pop("sheets_webhook_url", None)  # don't leak webhook publicly
    return doc


@api.put("/content")
async def update_content(payload: dict, admin: dict = Depends(get_current_admin)):
    payload.pop("_id", None)
    await db.site_content.update_one({"_id": "site"}, {"$set": payload}, upsert=True)
    doc = await db.site_content.find_one({"_id": "site"})
    doc.pop("_id", None)
    return doc


@api.get("/admin/content")
async def get_admin_content(admin: dict = Depends(get_current_admin)):
    doc = await db.site_content.find_one({"_id": "site"})
    if not doc:
        await db.site_content.insert_one(dict(DEFAULT_CONTENT))
        doc = await db.site_content.find_one({"_id": "site"})
    doc.pop("_id", None)
    return doc


# ---------- Enquiry routes ----------
async def push_to_google_sheet(enq: dict):
    doc = await db.site_content.find_one({"_id": "site"}, {"settings": 1})
    url = (doc or {}).get("settings", {}).get("sheets_webhook_url", "")
    if not url:
        return
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            await c.post(url, json=enq)
    except Exception as e:
        logger.warning(f"Google Sheet sync failed: {e}")


@api.post("/enquiries")
async def create_enquiry(data: EnquiryInput):
    enq = data.model_dump()
    enq["id"] = str(uuid.uuid4())
    enq["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.enquiries.insert_one(dict(enq))
    await push_to_google_sheet(enq)
    return {"success": True, "id": enq["id"]}


@api.get("/admin/enquiries")
async def list_enquiries(admin: dict = Depends(get_current_admin)):
    items = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items


@api.get("/admin/enquiries/export")
async def export_enquiries(admin: dict = Depends(get_current_admin)):
    items = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    fields = ["created_at", "company_name", "contact_name", "email", "phone",
              "products_offered", "products_required", "quantity", "what", "when", "where", "division"]
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=fields, extrasaction="ignore")
    w.writeheader()
    for it in items:
        w.writerow(it)
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=enquiries.csv"})


@api.get("/admin/settings")
async def get_settings(admin: dict = Depends(get_current_admin)):
    doc = await db.site_content.find_one({"_id": "site"}, {"settings": 1, "_id": 0})
    return (doc or {}).get("settings", {})


@api.put("/admin/settings")
async def update_settings(payload: dict, admin: dict = Depends(get_current_admin)):
    await db.site_content.update_one({"_id": "site"}, {"$set": {"settings": payload}}, upsert=True)
    return payload


@api.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    ext = (file.filename.rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "bin")
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Please upload an image (jpg, png, webp, gif, svg).")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Max 10MB.")
    content_type = file.content_type or MIME_TYPES[ext]
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, content_type)
    canonical = result["path"]
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": canonical,
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"path": canonical, "url": f"/api/files/{canonical}"}


@api.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path})
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
    ct = (record or {}).get("content_type") or content_type
    return Response(content=data, media_type=ct, headers={"Cache-Control": "public, max-age=31536000"})


@api.get("/")
async def root():
    return {"message": "Excel Packaging API"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # seed admin
    admin_email = os.environ["ADMIN_EMAIL"].lower().strip()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email, "password_hash": hash_password(admin_pw),
            "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
        logger.info("Seeded admin user")
    elif not verify_password(admin_pw, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})
    # seed content
    if not await db.site_content.find_one({"_id": "site"}):
        await db.site_content.insert_one(dict(DEFAULT_CONTENT))
        logger.info("Seeded site content")
    # init object storage
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    client.close()
