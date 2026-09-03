# Deployment Guide — Excel Packaging & Taste Foods

Your site has three moving parts:

1. **Frontend** (React) — static site
2. **Backend** (FastAPI) — the API
3. **MongoDB** (database) + **Object storage** (for images you upload in the CMS)

Vercel/Netlify can only host the **frontend**. The backend + database run elsewhere.

```
Browser ─► Netlify/Vercel (React) ─► Railway (FastAPI + MongoDB) ─► Cloudflare R2 (uploaded images)
```

---

# ⭐ Recommended path (least friction)

**Frontend → Netlify** · **Backend + MongoDB → Railway** · **Uploaded images → Cloudflare R2**

This avoids MongoDB Atlas entirely — Railway gives you a MongoDB database with one click.

## Step 1 — Push the code to GitHub
Use the **"Save to GitHub"** button in the Emergent chat. Everything below reads from that repo.

## Step 2 — Object storage: Cloudflare R2 (free, ~5 min)
CMS image uploads need durable storage or they vanish on redeploy. R2 is free (10 GB, no egress fees).

1. Sign up at https://dash.cloudflare.com → open **R2** (left sidebar) → enable it (may ask for a card, but the 10 GB tier is free).
2. **Create bucket** → name it e.g. `excel-uploads` → Create.
3. Back on the R2 overview page, copy your **S3 API endpoint** — looks like
   `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
4. **Manage R2 API Tokens** → **Create API Token** → permission **Object Read & Write** →
   **Create**. Copy the **Access Key ID** and **Secret Access Key** (shown once!).

You now have 4 values: bucket name, endpoint, access key ID, secret access key.

## Step 3 — Backend + MongoDB on Railway
1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo** → pick your repo.
2. Open the created service → **Settings** → set **Root Directory** to `backend`.
   Railway auto-detects Python and runs the included `Procfile`
   (`uvicorn server:app --host 0.0.0.0 --port $PORT`).
3. Add the database: in the project canvas click **+ New → Database → Add MongoDB**.
   Railway provisions it and exposes a connection variable named `MONGO_URL`
   (under the MongoDB service → **Variables** → `MONGO_URL` / `MONGO_PUBLIC_URL`).
4. Open your **backend** service → **Variables** → add:

   | Variable | Value |
   |---|---|
   | `MONGO_URL` | reference the MongoDB service's `MONGO_URL` (type `${{` and pick it) |
   | `DB_NAME` | `excel_packaging` |
   | `CORS_ORIGINS` | your Netlify URL (add after Step 4), e.g. `https://your-site.netlify.app` |
   | `JWT_SECRET` | a long random string — `python -c "import secrets;print(secrets.token_hex(32))"` |
   | `ADMIN_EMAIL` | `admin@excelpackaging.in` |
   | `ADMIN_PASSWORD` | *(a strong password)* |
   | `S3_BUCKET` | your R2 bucket name |
   | `S3_ACCESS_KEY_ID` | R2 Access Key ID |
   | `S3_SECRET_ACCESS_KEY` | R2 Secret Access Key |
   | `S3_ENDPOINT_URL` | your R2 endpoint (`https://<ACCOUNT_ID>.r2.cloudflarestorage.com`) |
   | `S3_REGION` | `auto` |

5. **Settings → Networking → Generate Domain** to get a public URL, e.g.
   `https://excel-backend.up.railway.app`.
6. Test: open `https://<your-backend>/api/content` → should return JSON.

## Step 4 — Frontend on Netlify
1. Netlify → **Add new site → Import an existing project** → pick your repo.
2. **Base directory:** `frontend`  ·  Build command `yarn build`  ·  Publish directory `frontend/build`
   (these are also in `frontend/netlify.toml`).
3. **Environment variables** → add:
   `REACT_APP_BACKEND_URL = https://<your-backend>.up.railway.app` (no trailing slash).
4. Deploy. Copy the Netlify URL.

## Step 5 — Connect them
1. Put the Netlify URL into the backend's `CORS_ORIGINS` variable on Railway → it redeploys.
2. Open your Netlify site → catalog, enquiry form, and `/admin` should all work.
3. Log into `/admin` (your `ADMIN_EMAIL` / `ADMIN_PASSWORD`), edit content, click **Publish**,
   and upload a product image to confirm R2 storage works.

Done. 🎉

---

# Alternatives

### Frontend on Vercel (instead of Netlify)
1. Vercel → **Add New → Project** → import the repo → **Root Directory:** `frontend`.
2. Framework preset: **Create React App** (auto-detected via `frontend/vercel.json`).
3. Env var: `REACT_APP_BACKEND_URL`. Deploy. SPA routing is handled by `vercel.json`.

### Backend on Render + MongoDB Atlas (instead of Railway)
Use this if you specifically want Render. Render has **no managed MongoDB**, so you also
need MongoDB Atlas.

**Atlas (database):**
1. https://www.mongodb.com/atlas → sign up → **Create → M0 (free)** cluster.
2. **Database Access** → add a user (username + password).
3. **Network Access** → **Add IP → Allow access from anywhere** (`0.0.0.0/0`).
4. Cluster → **Connect → Drivers** → Python → copy the string:
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   (URL-encode special characters in the password: `@`→`%40`, `#`→`%23`, etc.)

**Render (backend):** a blueprint is included at `backend/render.yaml`.
1. Render → **New + → Blueprint** → select the repo (it reads `backend/render.yaml`).
2. Fill the prompted env vars: `MONGO_URL` (the Atlas string), `CORS_ORIGINS`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and the `S3_*` values from R2.
3. Deploy → API at `https://excel-backend.onrender.com`. Test `/api/content`.

### Fully managed (no external setup)
Emergent's own **Deploy** button hosts frontend + backend + database + custom domain
(~50 credits/month). Zero third-party accounts needed.

---

# After you have a custom domain
Find-and-replace `https://YOUR-DOMAIN.com` with your real domain in:
- `frontend/public/sitemap.xml`
- `frontend/public/robots.txt`

(Page titles, canonical tags and Open Graph URLs are generated from the live domain
automatically — nothing to change there.)

Optional analytics: uncomment the Google Analytics (GA4) block in
`frontend/public/index.html` and paste your `G-XXXXXXXXXX` Measurement ID.

---

# Environment variables reference

**Backend** (Railway/Render):
`MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
`S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT_URL`, `S3_REGION`
(see `backend/.env.example`).

**Frontend** (Netlify/Vercel):
`REACT_APP_BACKEND_URL` (see `frontend/.env.example`).

---

# Local development
```bash
# Backend
cd backend && cp .env.example .env    # fill in values
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend (new terminal)
cd frontend && cp .env.example .env   # REACT_APP_BACKEND_URL=http://localhost:8001
yarn install && yarn start
```

# Notes
- **Seeding:** on first run the backend writes the starter catalog/content automatically.
  Edit everything in `/admin` (Draft → Publish).
- **Starter images** are bundled in `frontend/public/assets`, so they work with no object
  storage. R2/S3 is only for *new* images uploaded through the CMS.
- **Enquiries → Google Sheet (optional):** paste your Google Apps Script Web App URL in
  **Admin → Settings** to log submissions to a sheet.
