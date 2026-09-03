"""Portable S3-compatible object storage for user-uploaded files.

Works with any S3-compatible provider (Cloudflare R2, AWS S3, Backblaze B2,
MinIO, DigitalOcean Spaces, etc.) — no dependency on any specific platform.

Configure via environment variables:
    S3_BUCKET             (required) bucket name
    S3_ACCESS_KEY_ID      (required) access key
    S3_SECRET_ACCESS_KEY  (required) secret key
    S3_ENDPOINT_URL       (optional) custom endpoint — required for R2/B2/Spaces,
                          leave empty for AWS S3. e.g. https://<accountid>.r2.cloudflarestorage.com
    S3_REGION             (optional) region; use "auto" for Cloudflare R2 (default)

The rest of the app only calls save_bytes() and read_bytes().
"""
import os

import boto3
from botocore.config import Config

MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml"}

_BUCKET = os.environ.get("S3_BUCKET")
_ENDPOINT = os.environ.get("S3_ENDPOINT_URL") or None
_REGION = os.environ.get("S3_REGION") or "auto"
_ACCESS_KEY = os.environ.get("S3_ACCESS_KEY_ID")
_SECRET_KEY = os.environ.get("S3_SECRET_ACCESS_KEY")

_client = None


def _configured() -> bool:
    return bool(_BUCKET and _ACCESS_KEY and _SECRET_KEY)


def _get_client():
    global _client
    if not _configured():
        raise RuntimeError(
            "Object storage is not configured. Set S3_BUCKET, S3_ACCESS_KEY_ID and "
            "S3_SECRET_ACCESS_KEY (and S3_ENDPOINT_URL for Cloudflare R2 / non-AWS providers)."
        )
    if _client is None:
        _client = boto3.client(
            "s3",
            endpoint_url=_ENDPOINT,
            region_name=_REGION,
            aws_access_key_id=_ACCESS_KEY,
            aws_secret_access_key=_SECRET_KEY,
            config=Config(signature_version="s3v4"),
        )
    return _client


def init_storage(force: bool = False):
    """Called once at startup. Returns the active mode; never raises."""
    if not _configured():
        return "unconfigured"
    if force:
        global _client
        _client = None
    return "s3"


def save_bytes(path: str, data: bytes, content_type: str) -> dict:
    _get_client().put_object(Bucket=_BUCKET, Key=path, Body=data, ContentType=content_type)
    return {"path": path, "size": len(data)}


def read_bytes(path: str):
    obj = _get_client().get_object(Bucket=_BUCKET, Key=path)
    data = obj["Body"].read()
    ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""
    content_type = obj.get("ContentType") or MIME_TYPES.get(ext, "application/octet-stream")
    return data, content_type
