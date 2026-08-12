from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
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


@app.on_event("shutdown")
async def shutdown():
    client.close()
