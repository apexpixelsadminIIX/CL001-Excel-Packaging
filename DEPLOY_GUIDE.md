# Deployment Guide — Excel Packaging & Taste Foods

This is a full-stack app, so it deploys in **two parts**:

1. **Frontend** (React) → **Vercel _or_ Netlify** (static hosting)
2. **Backend** (FastAPI) + **Database** (MongoDB) → **Render _or_ Railway** + **MongoDB Atlas**

> Vercel/Netlify only serve static files — they cannot run the Python API or the
> database. That is why the backend + DB live on Render/Railway + Atlas.

```
Browser ──► Vercel/Netlify (React site)
                 │  calls  ${REACT_APP_BACKEND_URL}/api/...
                 ▼
        Render/Railway (FastAPI)  ──►  MongoDB Atlas
```

---

## Part 1 — Database: MongoDB Atlas (free)

1. Create a free account at https://www.mongodb.com/atlas and create a **free M0 cluster**.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere) so your backend host can connect.
4. **Connect → Drivers** → copy the connection string, e.g.:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Keep this string — it is your `MONGO_URL`.

The database and collections are created automatically on first run. To load the
starter catalog/content, see **"Seeding content"** at the bottom.

---

## Part 2 — Backend: FastAPI

The backend lives in `/backend`. It needs these environment variables:

| Variable | Example | Notes |
|---|---|---|
| `MONGO_URL` | `mongodb+srv://...` | From Atlas (Part 1) |
| `DB_NAME` | `excel_packaging` | Any name you like |
| `CORS_ORIGINS` | `https://www.your-domain.com` | Your frontend URL(s), comma-separated |
| `JWT_SECRET` | 64-char random hex | `python -c "import secrets;print(secrets.token_hex(32))"` |
| `ADMIN_EMAIL` | `admin@excelpackaging.in` | Admin CMS login |
| `ADMIN_PASSWORD` | *(strong password)* | Admin CMS login |
| `UPLOAD_DIR` | `/var/data/uploads` | Must point at a **persistent disk** |

> **Image uploads:** files uploaded via the Admin CMS are saved to `UPLOAD_DIR`.
> Attach a persistent disk/volume and point `UPLOAD_DIR` at it, otherwise CMS
> uploads are lost on redeploy. (The starter catalog images are bundled into the
> frontend under `/assets`, so they do **not** depend on the backend disk.)

### Option A — Render (recommended)

A ready-made blueprint is included at `backend/render.yaml`.

1. Push this repo to GitHub.
2. Render → **New + → Blueprint** → select the repo. Render reads `backend/render.yaml`.
3. Fill the prompted env vars (`MONGO_URL`, `CORS_ORIGINS`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
4. Deploy. Your API will be at `https://excel-backend.onrender.com`.
5. Test: open `https://excel-backend.onrender.com/api/content` → should return JSON.

*(Manual setup instead of blueprint: New Web Service → Root Directory `backend` →
Build `pip install -r requirements.txt` → Start
`uvicorn server:app --host 0.0.0.0 --port $PORT` → add the env vars → add a Disk
mounted at `/var/data/uploads` and set `UPLOAD_DIR=/var/data/uploads`.)*

### Option B — Railway

1. Push this repo to GitHub.
2. Railway → **New Project → Deploy from GitHub repo**.
3. Set the service **Root Directory** to `backend`. Railway auto-detects Python and
   uses the included `Procfile` (`uvicorn server:app --host 0.0.0.0 --port $PORT`).
4. **Variables** → add all env vars from the table above.
5. Add a **Volume** and set its mount path as `UPLOAD_DIR` (e.g. `/data/uploads`).
6. Deploy. Copy the public URL (e.g. `https://excel-backend.up.railway.app`).
7. Test: `.../api/content` returns JSON.

---

## Part 3 — Frontend: React

The frontend lives in `/frontend`. It needs **one** build-time variable:

| Variable | Value |
|---|---|
| `REACT_APP_BACKEND_URL` | Your backend URL from Part 2 (no trailing slash) |

### Option A — Vercel

1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory:** `frontend`.
3. Framework preset: **Create React App** (auto-detected via `frontend/vercel.json`).
4. **Environment Variables:** add `REACT_APP_BACKEND_URL = https://your-backend...`.
5. Deploy. `frontend/vercel.json` already adds the SPA rewrite so deep links work.

### Option B — Netlify

1. Netlify → **Add new site → Import an existing project** → pick the repo.
2. **Base directory:** `frontend`.
3. Build command `yarn build`, Publish directory `frontend/build` (also set in `netlify.toml`).
4. **Environment Variables:** add `REACT_APP_BACKEND_URL`.
5. Deploy. `netlify.toml` + `public/_redirects` handle the SPA fallback.

---

## Part 4 — Connect the two

1. After the frontend is live, copy its URL (e.g. `https://www.your-domain.com`).
2. Set the backend `CORS_ORIGINS` to that URL and redeploy the backend.
3. Open the site → the catalog, enquiry form and `/admin` should all work.

---

## Part 5 — Final SEO touch-ups (after you have a domain)

Find-and-replace `https://YOUR-DOMAIN.com` with your real domain in:

- `frontend/public/sitemap.xml`
- `frontend/public/robots.txt`

(The page titles, canonical tags and Open Graph URLs are generated automatically
from the live domain — no change needed there.)

Optional analytics: in `frontend/public/index.html` there is a commented Google
Analytics (GA4) block — uncomment it and paste your `G-XXXXXXXXXX` Measurement ID.

---

## Seeding content

On first deploy the database is empty. The starter catalog + site content ships in
`backend/content_data.py` and is written on startup if the DB has no content
document. Log in at `/admin` (with `ADMIN_EMAIL` / `ADMIN_PASSWORD`) to edit
everything (hero, categories, products, contact, testimonials) — changes save as a
draft and go live when you hit **Publish**.

---

## Local development

```bash
# Backend
cd backend
cp .env.example .env          # fill in values
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend (new terminal)
cd frontend
cp .env.example .env          # set REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start
```

## Enquiries → Google Sheet (optional)
The enquiry form can post to a Google Apps Script webhook so submissions land in a
Google Sheet. Paste your Apps Script Web App URL in **Admin → Settings**.
