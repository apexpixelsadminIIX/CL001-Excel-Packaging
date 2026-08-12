# Deploying on Vercel / Netlify — Complete Step-by-Step Guide

This site has **three parts**: Frontend (React), Backend (FastAPI), Database (MongoDB).
Vercel/Netlify host the **frontend only**. The backend and database must run on a always-on host. This guide covers all three end to end.

```
[ Browser ]  →  Frontend (Vercel/Netlify)  →  Backend API (Render/Railway)  →  MongoDB Atlas
```

---

## STEP 1 — Database: MongoDB Atlas (free)

1. Create an account at https://www.mongodb.com/cloud/atlas and create a **free M0 cluster**.
2. **Database Access** → Add a database user (username + password).
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere) so your backend host can connect.
4. **Connect → Drivers** → copy the connection string, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`
   Keep this for `MONGO_URL`.

---

## STEP 2 — Backend: Render (or Railway)

The FastAPI backend can't run on Vercel/Netlify; host it on Render (free tier works) or Railway.

### On Render
1. Push the project to a GitHub repo.
2. https://render.com → **New → Web Service** → connect the repo.
3. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Environment variables** (Render → Environment):
   ```
   MONGO_URL      = <your Atlas connection string>
   DB_NAME        = excel_packaging
   CORS_ORIGINS   = https://<your-frontend-domain>     (fill after Step 3; can use * temporarily)
   JWT_SECRET     = <64-char random hex>
   ADMIN_EMAIL    = admin@excelpackaging.in
   ADMIN_PASSWORD = <a strong password>
   STORAGE_BACKEND= local
   UPLOAD_DIR     = /var/data/uploads
   ```
5. **Add a persistent disk** (Render → Disks): mount path `/var/data`, ~1 GB. This keeps admin-uploaded images across redeploys. (Skip and use external storage only if you don't need uploads to persist.)
6. Deploy. Note the public backend URL, e.g. `https://excel-backend.onrender.com`.
7. Test: open `https://excel-backend.onrender.com/api/content` — you should see JSON.

> Render free tier sleeps after inactivity (first request may take ~30s to wake). Upgrade to a paid instance for always-on.

### On Railway (alternative)
- New Project → Deploy from repo → set Root Directory `backend`, Start Command `uvicorn server:app --host 0.0.0.0 --port $PORT`, add the same env vars, add a Volume mounted at `UPLOAD_DIR`.

---

## STEP 3A — Frontend on **Vercel**

1. https://vercel.com → **Add New → Project** → import the GitHub repo.
2. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`
3. **Environment Variables**:
   ```
   REACT_APP_BACKEND_URL = https://excel-backend.onrender.com   (your Step 2 URL, NO trailing slash)
   ```
4. **Deploy**. Vercel gives you a URL like `https://excel-packaging.vercel.app`.
5. SPA routing works automatically on Vercel for CRA. (If you ever see 404s on refresh of `/catalog`, add a `vercel.json` in `frontend/` with a rewrite of all routes to `/index.html`.)

`frontend/vercel.json` (only if needed):
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## STEP 3B — Frontend on **Netlify**

1. https://app.netlify.com → **Add new site → Import an existing project** → pick the repo.
2. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `yarn build`
   - **Publish directory**: `frontend/build`
3. **Environment variables** (Site settings → Environment):
   ```
   REACT_APP_BACKEND_URL = https://excel-backend.onrender.com
   ```
4. **SPA redirect (required)** — create `frontend/public/_redirects` containing:
   ```
   /*    /index.html   200
   ```
   (This makes `/catalog`, `/admin`, etc. work on refresh.)
5. Deploy. Netlify gives a URL like `https://excel-packaging.netlify.app`.

---

## STEP 4 — Connect the pieces

1. Copy your final **frontend URL** and set it on the backend host:
   `CORS_ORIGINS = https://<your-frontend-domain>` → redeploy/restart the backend.
2. Reload the frontend. Content should load from the backend. Log in at `/admin`.

---

## STEP 5 — Custom domain

- **Vercel**: Project → Settings → Domains → add `www.yourdomain.com` and follow the DNS records.
- **Netlify**: Site → Domain management → add domain → follow DNS.
- Point your registrar's DNS (A/CNAME) as instructed. SSL is automatic.
- (Optional) put the backend on a subdomain like `api.yourdomain.com` and update `REACT_APP_BACKEND_URL` + `CORS_ORIGINS` accordingly.

---

## STEP 6 — Post-deploy SEO

1. Edit `frontend/public/sitemap.xml` and `frontend/public/robots.txt` — replace the preview URL with your real domain. Redeploy.
2. Google Search Console → add your domain → verify (DNS or the provided method) → **submit** `https://<yourdomain>/sitemap.xml`.
3. Complete the Google Business Profile (guide provided separately).

---

## STEP 7 — Final smoke test

- [ ] `https://<frontend>` loads with images and animations
- [ ] `/catalog`, `/cleaning`, `/about`, `/enquiry` load and refresh without 404
- [ ] Submit a test enquiry → appears in `/admin → Enquiries`
- [ ] Log in to `/admin`, upload an image, **Publish**, confirm it shows on the site
- [ ] `CORS_ORIGINS` matches the frontend URL (no console CORS errors)
- [ ] Changed `ADMIN_PASSWORD` and `JWT_SECRET` from defaults

---

### Environment variables quick reference

**Backend (Render/Railway):** `MONGO_URL, DB_NAME, CORS_ORIGINS, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, STORAGE_BACKEND=local, UPLOAD_DIR`
**Frontend (Vercel/Netlify):** `REACT_APP_BACKEND_URL`

That's the entire deployment. If uploads don't persist, ensure the backend disk/volume is mounted at `UPLOAD_DIR`, or switch to S3/Cloudinary storage.
