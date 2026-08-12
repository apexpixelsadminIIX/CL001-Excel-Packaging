# Excel Packaging and Taste Foods — Client Handoff & Documentation

Complete guide to run, configure, host, and maintain the website.

---

## 1. What this is

A production-ready, fully responsive B2B marketing website + lightweight CMS for **Excel Packaging and Taste Foods** (Chennai). It includes a public marketing site and a private admin dashboard to manage all content without touching code.

**Public pages**
- `/` — Home (hero image carousel, "Since 2019" story, category cards, featured products, why-us, Instagram/social carousel, testimonials, CTA)
- `/catalog` — E-Catalog (filterable products, eco-first ordering, custom-quote banner)
- `/cleaning` — Cleaning & Hospitality Chemicals (EliteCare division, self-contained)
- `/about` — About Us (mission/vision, 3 pillars)
- `/enquiry` — Contact + bulk enquiry form + Google Map + FAQ
- Shared footer + navigation on every page

**Private**
- `/admin/login` and `/admin` — password-protected CMS dashboard (NOT linked in public nav)

---

## 2. Tech stack & architecture

- **Frontend**: React 19 (Create React App / craco), Tailwind CSS, framer-motion (animations), Lenis (smooth scroll), react-helmet-async (SEO). Talks to the backend via `REACT_APP_BACKEND_URL`.
- **Backend**: FastAPI (Python). All routes are prefixed with `/api`. JWT admin auth.
- **Database**: MongoDB. Content, enquiries, admin user, uploaded-file records, Instagram cache.
- **File/image storage**: portable — local filesystem by default (`STORAGE_BACKEND=local`), Emergent object storage optional.

**Data flow**: All site content lives in MongoDB and is edited via the admin. The frontend reads published content from `/api/content`. The admin edits a private **Draft** and clicks **Publish** to push changes live.

---

## 3. Repository structure

```
/app
├── backend/
│   ├── server.py          # FastAPI app: auth, content (draft/live), enquiries, uploads, Instagram, settings
│   ├── content_data.py    # DEFAULT seed content (products, categories, hero, social, contact…)
│   ├── storage.py         # Portable storage (local filesystem / Emergent)
│   ├── requirements.txt
│   ├── .env               # Backend config (see section 5)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/         # Home, About, Catalog, Cleaning, Enquiry, admin/*
│   │   ├── components/    # Navbar, Footer, HeroCarousel, SocialCarousel, ProductCard, Seo, Reveal…
│   │   ├── hooks/useContent.js
│   │   ├── context/AuthContext.jsx
│   │   └── lib/api.js
│   ├── public/            # index.html, robots.txt, sitemap.xml
│   ├── .env               # REACT_APP_BACKEND_URL
│   └── .env.example
├── DEPLOYMENT.md          # Hosting-anywhere guide
└── CLIENT_HANDOFF.md      # This file
```

---

## 4. Credentials (CHANGE BEFORE HANDOVER)

| What | Value | Where to change |
|------|-------|-----------------|
| **Admin login email** | `admin@excelpackaging.in` | `backend/.env` → `ADMIN_EMAIL` |
| **Admin password** | `Excel@2019` | `backend/.env` → `ADMIN_PASSWORD` |
| Admin dashboard URL | `https://<yourdomain>/admin` | — |
| JWT signing secret | (pre-set random hex) | `backend/.env` → `JWT_SECRET` (generate a new one for production) |

> After changing `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`, restart the backend. The admin account is re-seeded/updated automatically on startup.
>
> Generate a fresh JWT secret: `python -c "import secrets; print(secrets.token_hex(32))"`

---

## 5. Environment variables

### backend/.env
```
MONGO_URL="mongodb://localhost:27017"     # dev; use MongoDB Atlas URI in production
DB_NAME="excel_packaging"                 # database name
CORS_ORIGINS="*"                          # set to your frontend URL in production
JWT_SECRET="<64-char random hex>"         # CHANGE for production
ADMIN_EMAIL="admin@excelpackaging.in"     # CHANGE
ADMIN_PASSWORD="Excel@2019"               # CHANGE
STORAGE_BACKEND="local"                   # "local" (portable) or "emergent"
UPLOAD_DIR="./uploads"                    # local storage folder (needs a persistent disk)
EMERGENT_LLM_KEY=""                       # only if STORAGE_BACKEND="emergent"
INSTAGRAM_API_VERSION="v23.0"             # optional; Instagram Graph API version
```

### frontend/.env
```
REACT_APP_BACKEND_URL=https://<your-backend-domain>   # no trailing slash
```

**Rules:** never hardcode these in code; the frontend must always call the backend through `REACT_APP_BACKEND_URL`, and the backend must use `MONGO_URL`/`DB_NAME` from env.

---

## 6. THINGS TO TWEAK BEFORE LAUNCH (checklist)

1. **Admin password + JWT secret** — change in `backend/.env` (section 4).
2. **Real contact details** — log into `/admin` → **Contact** tab → set real phone, email, address, and Instagram/LinkedIn/Facebook URLs → **Publish**. (This updates the footer everywhere, the Contact page, the Google Map, and the SEO/LocalBusiness data.)
3. **Google Sheet for enquiries** (optional) — see section 8.
4. **Instagram feed** (optional) — see section 9.
5. **Product & category images** — replace via `/admin` (Upload button or paste URL) if you want real photography instead of the current stock/generated images.
6. **SEO domain** — in `frontend/public/sitemap.xml` and `frontend/public/robots.txt`, replace the preview URL with your real domain. Then verify the site in **Google Search Console** and submit `https://<yourdomain>/sitemap.xml`.
7. **Set up Google Business Profile** — see the separate guide already provided (create profile, categories, verify, photos, reviews). Keep the Name/Address/Phone identical to the website.
8. **Persistent storage** — if hosting yourself, mount a persistent disk at `UPLOAD_DIR` so admin-uploaded images survive redeploys (or switch to S3/Cloudinary).

---

## 7. Using the Admin CMS (`/admin`)

Log in with the admin credentials. The dashboard has these tabs:

- **Enquiries** — view every submitted enquiry; **Export CSV**.
- **Hero Carousel** — edit/reorder (drag handle) hero slides; upload images; edit headings/CTAs.
- **Categories** — edit/reorder the Home category cards; upload images.
- **Products** — add / remove / **reorder** products; set category, badge, description, image (upload or URL); **Featured** star toggle (featured items show first on Home + catalog); **Bulk Image Upload** (drop many photos and match to products).
- **Cleaning** — same add/remove/reorder for EliteCare chemical products.
- **Social & Videos** — add/remove/reorder carousel posts; paste a YouTube/Instagram link to auto-play video inline.
- **Instagram Sync** — connect a real Instagram feed (section 9).
- **Contact** — phone, email, address, social links.
- **Settings** — Google Sheet webhook (section 8).

**Draft → Publish workflow**
- Editing saves to a private **Draft** (the live site is unaffected).
- **Save Draft** stores your changes; **Preview** opens the site showing your draft (only you see it); **Publish Live** pushes the draft to the public site; **Discard** reverts to the live version.
- A "Unpublished changes" badge appears when you have an unpublished draft.

---

## 8. Google Sheet for enquiries (optional)

Enquiries are always saved in the database (and visible in the Enquiries tab). To ALSO push each new enquiry into a Google Sheet:

1. Create a Google Sheet.
2. **Extensions → Apps Script**, paste:
   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var d = JSON.parse(e.postData.contents);
     if (sheet.getLastRow() === 0) {
       sheet.appendRow(["Time","Company","Contact","Email","Phone","Products Offered","Products Required","Quantity","What","When","Where","Division"]);
     }
     sheet.appendRow([d.created_at, d.company_name, d.contact_name, d.email, d.phone,
       d.products_offered, d.products_required, d.quantity, d.what, d.when, d.where, d.division]);
     return ContentService.createTextOutput("ok");
   }
   ```
3. **Deploy → New deployment → Web app**, Execute as *Me*, Who has access *Anyone*. Copy the Web App URL.
4. In `/admin` → **Settings**, paste the URL and Save.

---

## 9. Instagram feed sync (optional)

Shows your latest real Instagram posts in the Home carousel.

**You need** (Meta requirement — Basic Display API is retired):
- An Instagram **Business or Creator** account
- A **Meta Developer app** (Business type) with the "Instagram API with Instagram Login" product
- Your **Instagram-scoped User ID** and a **long-lived Access Token** (valid 60 days; the backend refreshes it)

**Steps**: `/admin` → **Instagram Sync** → paste User ID + token → **Connect** → **Sync now** → toggle **Show feed on Home**. When enabled, the Home carousel shows only your real posts. Re-sync anytime to fetch new posts.

Not connected? The carousel simply uses the manual posts you add in **Social & Videos**.

---

## 10. Running locally (development)

```bash
# Backend
cd backend
pip install -r requirements.txt
# ensure MongoDB is running, and backend/.env is set
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (new terminal)
cd frontend
yarn install
# set frontend/.env: REACT_APP_BACKEND_URL=http://localhost:8001
yarn start        # opens http://localhost:3000
```

The admin user and all default content self-seed on first backend startup.

---

## 11. Hosting the final website

The site is portable and can be hosted anywhere. Two paths:

### Option A — Emergent (simplest, recommended)
One-click deploy with managed database, storage, and custom domain. No code changes. (Use the Deploy option in the Emergent platform.)

### Option B — Self-host (Vercel/Netlify + Railway/Render + MongoDB Atlas)
See **DEPLOYMENT.md** for full steps. Summary:
- **Database**: create a MongoDB Atlas cluster → put its URI in `MONGO_URL`.
- **Backend**: deploy `backend/` on Railway/Render/Fly/VPS running `uvicorn server:app --host 0.0.0.0 --port 8001`. Set all `backend/.env` vars. Attach a **persistent disk** at `UPLOAD_DIR` (for image uploads). Set `CORS_ORIGINS` to your frontend URL.
- **Frontend**: set `REACT_APP_BACKEND_URL` to the backend URL, run `yarn build`, deploy the `build/` folder. On Netlify add SPA redirect `/* /index.html 200`.
- Update `sitemap.xml` / `robots.txt` with the real domain and submit to Search Console.

> Reminder: Vercel/Netlify host only the **frontend**. The FastAPI backend + MongoDB must run on a server that stays up.

---

## 12. SEO (already implemented)

- Per-page title, meta description, keywords, canonical, Open Graph + Twitter cards (react-helmet-async).
- Structured data: **LocalBusiness** (Home), **Product** for every catalog item, **FAQPage** (Contact), **ItemList** (catalog).
- `sitemap.xml` + `robots.txt` (blocks `/admin`).
- Target keywords: food packaging Chennai, eco-friendly, wraps & foils, food safe, bulk/B2B food packaging, food containers, cleaning chemicals, sanitization, etc.

**After launch**: update the domain in sitemap/robots, verify in Google Search Console, submit the sitemap, and complete the Google Business Profile.

---

## 13. Maintenance & troubleshooting

- **Change content** → `/admin`, edit, Publish.
- **Backend not responding** → check it's running and `MONGO_URL` is reachable; check logs.
- **Images not showing after redeploy (self-host)** → `UPLOAD_DIR` isn't persistent; attach a disk or use external storage.
- **Login fails** → confirm `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `backend/.env`, restart backend.
- **Enquiries not in Google Sheet** → re-check the Apps Script Web App URL in Settings (DB copy always works regardless).
- **CORS errors in browser** → set `CORS_ORIGINS` to your exact frontend URL.

---

## 14. API reference (all under `/api`)

Public:
- `GET /content` — published site content
- `POST /enquiries` — submit an enquiry
- `GET /instagram/feed` — cached Instagram posts (if enabled)
- `GET /files/{path}` — serves uploaded images

Admin (require `Authorization: Bearer <token>`):
- `POST /auth/login`, `GET /auth/me`
- `GET /admin/content`, `PUT /content` (save draft), `POST /admin/publish`, `POST /admin/discard`, `GET /admin/content/status`
- `GET /admin/enquiries`, `GET /admin/enquiries/export`
- `POST /admin/upload`
- `GET/PUT /admin/settings`
- `POST /admin/instagram/connect|sync|toggle|disconnect`, `GET /admin/instagram/status`

---

*Handover prepared for Excel Packaging and Taste Foods. All content is editable from `/admin` — no code needed for day-to-day updates.*
