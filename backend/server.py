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

from content_data import DEFAULT_CONTENT, PRIORITY

INTERNAL_PRODUCT_FIELDS = ["hsn", "base_price", "gst", "total_price", "notes"]


def _strip_catalog_internal(catalog):
    out = []
    for c in (catalog or []):
        c = dict(c)
        c["products"] = [{k: v for k, v in p.items() if k not in INTERNAL_PRODUCT_FIELDS} for p in c.get("products", [])]
        out.append(c)
    return out

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"

app = FastAPI()
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("excel")

from storage import init_storage, save_bytes, read_bytes, MIME_TYPES


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


class EnquiryItem(BaseModel):
    category: Optional[str] = ""
    product: str
    size: Optional[str] = ""
    type: Optional[str] = ""
    moq: Optional[str] = ""
    quantity: Optional[str] = ""


class EnquiryInput(BaseModel):
    company_name: str
    contact_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    products_offered: Optional[str] = ""
    products_required: Optional[str] = ""
    quantity: Optional[str] = ""
    what: str
    when: str
    where: str
    division: Optional[str] = "packaging"
    items: Optional[List[EnquiryItem]] = None
    remarks: Optional[str] = ""


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


# ---------- Content routes (Draft / Live) ----------
PUB_ID = "site"
DRAFT_ID = "site_draft"


async def _strip_public(doc: dict) -> dict:
    doc = dict(doc)
    doc.pop("_id", None)
    settings = doc.get("settings", {}) or {}
    # never leak operational secrets publicly
    doc["instagram_enabled"] = bool(settings.get("instagram_enabled") and settings.get("instagram", {}).get("access_token"))
    doc.pop("settings", None)
    if "catalog" in doc:
        doc["catalog"] = _strip_catalog_internal(doc["catalog"])
    return doc


@api.get("/content")
async def get_content():
    doc = await db.site_content.find_one({"_id": PUB_ID})
    if not doc:
        await db.site_content.insert_one(dict(DEFAULT_CONTENT))
        doc = await db.site_content.find_one({"_id": PUB_ID})
    return await _strip_public(doc)


@api.put("/content")
async def update_content(payload: dict, admin: dict = Depends(get_current_admin)):
    # Saves to the DRAFT copy — never touches the live site until Publish.
    payload.pop("_id", None)
    payload.pop("settings", None)  # settings live on the published doc only
    base = await db.site_content.find_one({"_id": DRAFT_ID}) or await db.site_content.find_one({"_id": PUB_ID}) or dict(DEFAULT_CONTENT)
    base = dict(base)
    base.update(payload)
    base["_id"] = DRAFT_ID
    await db.site_content.replace_one({"_id": DRAFT_ID}, base, upsert=True)
    out = dict(base)
    out.pop("_id", None)
    return out


@api.get("/admin/content")
async def get_admin_content(admin: dict = Depends(get_current_admin)):
    # Returns the draft (what you're editing); falls back to published.
    doc = await db.site_content.find_one({"_id": DRAFT_ID}) or await db.site_content.find_one({"_id": PUB_ID})
    if not doc:
        await db.site_content.insert_one(dict(DEFAULT_CONTENT))
        doc = await db.site_content.find_one({"_id": PUB_ID})
    doc = dict(doc)
    doc.pop("_id", None)
    doc["has_unpublished"] = bool(await db.site_content.find_one({"_id": DRAFT_ID}))
    return doc


@api.get("/admin/content/status")
async def content_status(admin: dict = Depends(get_current_admin)):
    return {"has_unpublished": bool(await db.site_content.find_one({"_id": DRAFT_ID}))}


@api.post("/admin/publish")
async def publish_content(admin: dict = Depends(get_current_admin)):
    draft = await db.site_content.find_one({"_id": DRAFT_ID})
    if not draft:
        raise HTTPException(status_code=400, detail="No changes to publish.")
    pub = await db.site_content.find_one({"_id": PUB_ID}) or {}
    draft = dict(draft)
    draft["_id"] = PUB_ID
    draft["settings"] = pub.get("settings", draft.get("settings", {}))  # preserve live settings
    await db.site_content.replace_one({"_id": PUB_ID}, draft, upsert=True)
    await db.site_content.delete_one({"_id": DRAFT_ID})
    return {"published": True}


@api.post("/admin/discard")
async def discard_draft(admin: dict = Depends(get_current_admin)):
    await db.site_content.delete_one({"_id": DRAFT_ID})
    return {"discarded": True}


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
    # Build a readable, price-free summary of line items for admin/CSV/Sheet
    if enq.get("items"):
        parts = []
        for it in enq["items"]:
            attrs = [a for a in [it.get("size"), it.get("type"), it.get("moq")] if a]
            label = it.get("product", "")
            if attrs:
                label += " (" + ", ".join(attrs) + ")"
            if it.get("quantity"):
                label += " x " + str(it["quantity"])
            parts.append(label)
        enq["items_text"] = "; ".join(parts)
        if not enq.get("products_required"):
            enq["products_required"] = enq["items_text"]
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
    cur = await db.site_content.find_one({"_id": "site"}, {"settings": 1})
    merged = {**((cur or {}).get("settings", {}) or {}), **payload}
    await db.site_content.update_one({"_id": "site"}, {"$set": {"settings": merged}}, upsert=True)
    return merged


# ---------- Instagram feed sync (Instagram API with Instagram Login) ----------
IG_VERSION = os.environ.get("INSTAGRAM_API_VERSION", "v23.0")
IG_GRAPH = f"https://graph.instagram.com/{IG_VERSION}"


async def _ig_settings():
    doc = await db.site_content.find_one({"_id": "site"}, {"settings": 1})
    return ((doc or {}).get("settings", {}) or {}).get("instagram", {}) or {}


async def _ig_save(patch: dict):
    cur = await db.site_content.find_one({"_id": "site"}, {"settings": 1})
    settings = (cur or {}).get("settings", {}) or {}
    settings["instagram"] = {**(settings.get("instagram", {}) or {}), **patch}
    await db.site_content.update_one({"_id": "site"}, {"$set": {"settings": settings}}, upsert=True)


class InstagramConnectInput(BaseModel):
    ig_user_id: str
    access_token: str


@api.get("/admin/instagram/status")
async def ig_status(admin: dict = Depends(get_current_admin)):
    s = await _ig_settings()
    count = await db.instagram_media.count_documents({})
    return {
        "connected": bool(s.get("access_token") and s.get("ig_user_id")),
        "username": s.get("username"),
        "enabled": bool((await _root_settings()).get("instagram_enabled")),
        "media_count": count,
        "last_synced": s.get("last_synced"),
    }


async def _root_settings():
    doc = await db.site_content.find_one({"_id": "site"}, {"settings": 1})
    return (doc or {}).get("settings", {}) or {}


@api.post("/admin/instagram/connect")
async def ig_connect(body: InstagramConnectInput, admin: dict = Depends(get_current_admin)):
    try:
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.get(f"{IG_GRAPH}/{body.ig_user_id}", params={"fields": "id,username,account_type", "access_token": body.access_token})
        r.raise_for_status()
        profile = r.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not verify Instagram account: {e}")
    if profile.get("account_type") not in ("BUSINESS", "CREATOR"):
        raise HTTPException(status_code=400, detail="The Instagram account must be a Business or Creator account.")
    now = datetime.now(timezone.utc)
    await _ig_save({
        "ig_user_id": body.ig_user_id,
        "access_token": body.access_token,
        "username": profile.get("username"),
        "token_issued_at": now.isoformat(),
    })
    return {"connected": True, "username": profile.get("username")}


@api.post("/admin/instagram/disconnect")
async def ig_disconnect(admin: dict = Depends(get_current_admin)):
    await _ig_save({"ig_user_id": "", "access_token": "", "username": None})
    await db.instagram_media.delete_many({})
    return {"connected": False}


@api.post("/admin/instagram/toggle")
async def ig_toggle(payload: dict, admin: dict = Depends(get_current_admin)):
    enabled = bool(payload.get("enabled"))
    await update_settings({"instagram_enabled": enabled}, admin)
    return {"enabled": enabled}


@api.post("/admin/instagram/sync")
async def ig_sync(admin: dict = Depends(get_current_admin)):
    s = await _ig_settings()
    if not (s.get("access_token") and s.get("ig_user_id")):
        raise HTTPException(status_code=400, detail="Connect an Instagram account first.")
    try:
        async with httpx.AsyncClient(timeout=25) as c:
            r = await c.get(
                f"{IG_GRAPH}/{s['ig_user_id']}/media",
                params={"fields": "id,media_type,media_url,thumbnail_url,caption,permalink,timestamp", "limit": 24, "access_token": s["access_token"]},
            )
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Instagram sync failed: {e}")
    items = data.get("data", [])
    for it in items:
        await db.instagram_media.replace_one({"_id": it["id"]}, {"_id": it["id"], **it, "synced_at": datetime.now(timezone.utc).isoformat()}, upsert=True)
    await _ig_save({"last_synced": datetime.now(timezone.utc).isoformat()})
    return {"synced": len(items)}


@api.get("/instagram/feed")
async def ig_feed():
    if not (await _root_settings()).get("instagram_enabled"):
        return {"data": []}
    rows = await db.instagram_media.find({}, {"synced_at": 0}).sort("timestamp", -1).limit(24).to_list(24)
    out = []
    for it in rows:
        out.append({
            "id": it.get("_id"),
            "platform": "instagram",
            "image": it.get("thumbnail_url") if it.get("media_type") == "VIDEO" else it.get("media_url"),
            "caption": (it.get("caption") or "Instagram post")[:160],
            "link": it.get("permalink"),
            "video_url": "",
        })
    return {"data": out}


@api.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    ext = (file.filename.rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "bin")
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Please upload an image (jpg, png, webp, gif, svg).")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Max 10MB.")
    content_type = file.content_type or MIME_TYPES[ext]
    path = f"excel-packaging/uploads/{uuid.uuid4()}.{ext}"
    result = save_bytes(path, data, content_type)
    canonical = result["path"]
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": canonical,
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    # Return a RELATIVE url so the site stays portable across any backend host.
    return {"path": canonical, "url": f"/api/files/{canonical}"}


@api.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path})
    try:
        data, content_type = read_bytes(path)
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
