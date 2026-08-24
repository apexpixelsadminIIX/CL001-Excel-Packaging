"""Portable local file storage.

Saves uploaded files to UPLOAD_DIR on the local filesystem and serves them
back through the FastAPI /api/files route. Requires a persistent disk/volume
on the host (set UPLOAD_DIR to point at the mounted volume in production).

The rest of the app only calls save_bytes() and read_bytes().
"""
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR") or (ROOT_DIR / "uploads")).resolve()

MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml"}


def init_storage(force: bool = False):
    """Prepare the storage directory. Safe to call at startup."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return "local"


def save_bytes(path: str, data: bytes, content_type: str) -> dict:
    full = _safe_local_path(path)
    full.parent.mkdir(parents=True, exist_ok=True)
    full.write_bytes(data)
    return {"path": path, "size": len(data)}


def read_bytes(path: str):
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
