# Deployment Guide — Excel Packaging and Taste Foods

This project is a standard, portable full‑stack app and can be hosted **anywhere**:

- **Frontend**: React (Create React App / craco) — a static build. Host on Vercel, Netlify, Cloudflare Pages, S3+CloudFront, Nginx, etc.
- **Backend**: FastAPI (Python) — a long‑running server. Host on Railway, Render, Fly.io, a VPS, Docker, etc.
- **Database**: MongoDB — use MongoDB Atlas (free tier works) or any MongoDB instance.
- **Image uploads**: portable local‑filesystem storage by default (no third‑party account needed).

> Note: Vercel/Netlify host the **frontend** only. The FastAPI backend and MongoDB must be hosted on a server that stays running (Railway/Render/VPS). Point the frontend at that backend via `REACT_APP_BACKEND_URL`.

---

## 1. Backend (FastAPI)

Environment variables (see `backend/.env.example`):

| Var | Purpose |
|-----|---------|
| `MONGO_URL` | MongoDB connection string (Atlas or self‑hosted) |
| `DB_NAME` | Database name |
| `CORS_ORIGINS` | Your frontend URL(s), comma‑separated |
| `JWT_SECRET` | Random 64‑char hex for signing admin tokens |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | CMS login (change for production) |
| `STORAGE_BACKEND` | `local` (default) or `emergent` |
| `UPLOAD_DIR` | Where local uploads are stored (needs a persistent disk/volume) |

Run:
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

All API routes are under `/api`. Uploaded images are served from `/api/files/...`.

**Persistent storage:** with `STORAGE_BACKEND=local`, attach a persistent volume mounted at `UPLOAD_DIR` (e.g. a Railway/Render disk). If your host has an ephemeral filesystem and you don't attach a disk, uploaded images are lost on redeploy — in that case switch to an S3/Cloudinary bucket (see storage.py to add an S3 backend) or keep using external image URLs.

## 2. Frontend (React)

Set `REACT_APP_BACKEND_URL` to your deployed backend URL, then build:
```bash
cd frontend
yarn install
yarn build      # outputs static files in frontend/build
```
Deploy the `build/` folder to Vercel/Netlify/etc.

- On **Vercel**: set Root Directory to `frontend`, Build Command `yarn build`, Output `build`, and add env var `REACT_APP_BACKEND_URL`.
- On **Netlify**: Base `frontend`, Build `yarn build`, Publish `frontend/build`, add the same env var. Add a SPA redirect: `/* /index.html 200`.

## 3. Database

Create a free MongoDB Atlas cluster, copy the connection string into `MONGO_URL`. Collections are created automatically. The admin user and site content self‑seed on first boot.

## 4. Google Sheet sync (optional)

In the CMS → Settings, paste your Google Apps Script Web App URL. Every enquiry is also saved in MongoDB regardless.

## 5. First run checklist

- [ ] Backend reachable and `/api/content` returns JSON
- [ ] `REACT_APP_BACKEND_URL` on the frontend points to the backend
- [ ] `CORS_ORIGINS` on the backend includes the frontend URL
- [ ] Log in at `/admin` and confirm image upload works
- [ ] Changed `ADMIN_PASSWORD` and `JWT_SECRET` from defaults
