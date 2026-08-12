"""Portable file storage abstraction.

Works anywhere. Choose the backend with the STORAGE_BACKEND env var:

- "local"    (default) -> saves files to UPLOAD_DIR on the local filesystem and
                          serves them back through the FastAPI /api/files route.
                          Requires a persistent disk/volume on the host.
- "emergent"           -> uses Emergent-managed object storage (only works inside
                          the Emergent environment; needs EMERGENT_LLM_KEY).

The rest of the app only calls save_bytes() and read_bytes(); it does not care
which backend is active.
"""
import os
from pathlib import Path

import requests

BACKEND = (os.environ.get("STORAGE_BACKEND") or "local").strip().lower()

# ---- local filesystem backend ----
ROOT_DIR = Path(__file__).parent
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR") or (ROOT_DIR / "uploads")).resolve()

# ---- emergent backend ----
_STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
_STORAGE_URL = _STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
_EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
_storage_key = None

MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml"}


def init_storage(force: bool = False):
    """Prepare the active storage backend. Safe to call at startup."""
    if BACKEND == "emergent":
        return _emergent_init(force=force)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return "local"


def save_bytes(path: str, data: bytes, content_type: str) -> dict:
    if BACKEND == "emergent":
        return _emergent_put(path, data, content_type)
    full = _safe_local_path(path)
    full.parent.mkdir(parents=True, exist_ok=True)
    full.write_bytes(data)
    return {"path": path, "size": len(data)}


def read_bytes(path: str):
    if BACKEND == "emergent":
        return _emergent_get(path)
    full = _safe_local_path(path)
    if not full.exists():
        raise FileNotFoundError(path)
    ext = full.suffix.lstrip(".").lower()
    return full.read_bytes(), MIME_TYPES.get(ext, "application/octet-stream")


def _safe_local_path(path: str) -> Path:
    # prevent path traversal outside UPLOAD_DIR
    candidate = (UPLOAD_DIR / path).resolve()
    if not str(candidate).startswith(str(UPLOAD_DIR)):
        raise ValueError("Invalid path")
    return candidate


# ---- emergent helpers ----
def _emergent_init(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{_STORAGE_URL}/init", json={"emergent_key": _EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _emergent_put(path: str, data: bytes, content_type: str) -> dict:
    key = _emergent_init()
    resp = requests.put(f"{_STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = _emergent_init(force=True)
        resp = requests.put(f"{_STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def _emergent_get(path: str):
    key = _emergent_init()
    resp = requests.get(f"{_STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = _emergent_init(force=True)
        resp = requests.get(f"{_STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
