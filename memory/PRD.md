# Excel Packaging and Taste Foods — PRD

## Original Problem Statement
Production-ready, fully responsive B2B marketing website for "Excel Packaging and Taste Foods" (Chennai supplier of food containers, eco disposables, hygiene/housekeeping supplies). Built from provided Tailwind HTML reference drafts, elevated to Awwwards-level with framer-motion + Lenis. New palette: Sandy/Sunflower Yellow + Sunset Orange accents, Pastel/Pistachio Green supporting surfaces, ink text, off-white surfaces. Plus Jakarta Sans + Font Awesome 6.

## Architecture
- **Frontend**: React 19 (CRA/craco), Tailwind (custom brand tokens), framer-motion (scroll reveals, masked-line hero reveals, micro-interactions), Lenis (smooth momentum scroll), react-router-dom. `@/` alias.
- **Backend**: FastAPI + MongoDB (motor). JWT admin auth (bcrypt). Site content stored in `site_content` doc, enquiries in `enquiries`. Seeded on startup from `content_data.py`.
- **Content model**: single source of truth in backend; frontend reads `/api/content`; admin edits via `/api/content` (PUT).

## User Personas
- B2B buyers (restaurants, cloud kitchens, hotels) browsing catalog & submitting bulk enquiries.
- Site owner (admin) managing images/content and reviewing enquiries.

## Core Requirements (static)
- Pages: Home, About, E-Catalog, Cleaning & Hospitality (EliteCare), Enquiry/Contact, Admin CMS.
- Single shared full footer everywhere. Consistent nav with active state.
- Eco-first product priority sort (eco → plastic → paper → cornstarch → foil).
- Unique image per product. "Since 2019" branding.

## Implemented (2026-06)
- Home: auto-rotating hero carousel (dot+arrow nav, parallax scale, masked-line reveals), Our Story w/ 2019 badge, Core Categories + View E-Catalog CTA, editorial marquee, Why Partner, Social grid (bento), Testimonials, CTA banner, shared footer.
- About: masked-line hero, mission/vision, numbered 3-pillars manifesto.
- E-Catalog: filter pills (All/Eco/Plastic/Paper/Corn Starch PLA/Aluminum Foil), eco-first sort, 15 unique-image products, Need-a-Custom-Quote banner.
- Cleaning & Hospitality (EliteCare): self-contained modular page, hero, features, filterable 7-product grid, audit CTA.
- Enquiry: embedded form (company, contact, phone, email, products offered/required, quantity, 3 W's, division toggle) → saves to MongoDB. Success state.
- Admin CMS (/admin, JWT): Enquiries list + CSV export; editors for Hero slides, Categories, Products, Cleaning products, Social/Videos, Contact links; Settings for Google Sheet webhook. Image replacement via URL with live thumbnail preview.
- Google Sheet sync: enquiries POST to an owner-supplied Google Apps Script Web App URL (set in Admin > Settings). DB is always source of truth.

## Admin credentials
- admin@excelpackaging.in / Excel@2019 (see /app/memory/test_credentials.md)

## Prioritized Backlog / Remaining
- P0: Owner to paste real Google Apps Script webhook URL (Admin > Settings) to activate live Sheet sync; provide real contact phone/email/address (Admin > Contact) and real Instagram/YouTube links + post thumbnails (Admin > Social).
- P1: Direct file-upload for images (currently URL-based); embed live Instagram/YouTube feeds via official widgets.
- P2: Product detail pages; multi-image galleries; add/remove products & slides from Admin (currently edit-in-place).

## Update — 2026-07 (Business contact details)
- Real business address set (one line): "No 4, 38, Ganapathy Nagar 2nd St, Ekkatuthangal, Chennai, Tamil Nadu 600032".
- Phone: +91 98417 35178 (link +919841735178). Email: exlpackaging@gmail.com.
- Updated in backend seed (content_data.py), live MongoDB `site_content` doc (_id="site"), and fallback defaults in Footer.jsx & Enquiry.jsx.
- Google Map embed on Enquiry auto-generates from the address fields — now points to the new location.

## Update — 2026-07 (WhatsApp enquiry + Custom Branding variants)
- WhatsApp: "Send list on WhatsApp" button on Enquiry page composes the full product list + form details and opens wa.me. Number from contact.whatsapp (default 919841735178), CMS-editable via Admin > Contact.
- Custom Branding (Category 8) restructured per Excel "Custom Branding" sheet: product = item (Tissues, Food Containers, SOS Paper Bags, GR Sheets); Type/Method dropdown = printing methods (Custom Printing / Screen Printing (Lid & Bottom) / IML); new MOQ dropdown = MOQ options.
- Enquiry line items now render Size / Type-Method / MOQ / Quantity with labels. Backend EnquiryItem gained `moq`; included in items_text summary (CSV/Sheet). CatalogView shows MOQ chips.
- Files: frontend Enquiry.jsx, CatalogView.jsx, admin/AdminDashboard.jsx; backend server.py, content_data.py, catalog_seed.py. Live DB (site_content) updated for catalog + contact.whatsapp.

## Update — 2026-07 (Floating WhatsApp button)
- Added persistent floating WhatsApp button (components/WhatsAppFab.jsx) rendered globally in App.js. Uses contact.whatsapp number, hidden on /admin routes, pulse animation, data-testid="floating-whatsapp".

## Update — 2026-07 (Emergent de-branding + Vercel/Netlify deploy setup)
De-branding (zero Emergent traces in the shipped app):
- Removed Emergent loader + PostHog analytics from public/index.html; added commented GA4 placeholder.
- Downloaded the 14 seed images off Emergent CDN into frontend/public/assets/ and rewrote all refs (content_data.py, catalog_seed.py, Home.jsx, Seo.jsx) + live DB to /assets/*.
- Seo.jsx now builds absolute OG image from window origin (no hardcoded domain).
- sitemap.xml / robots.txt use placeholder https://YOUR-DOMAIN.com (find-and-replace on go-live).
- storage.py simplified to local-only; removed unused `requests` import + STORAGE_BACKEND import in server.py.
- requirements.txt: removed emergentintegrations + emergent-hosted litellm wheel (would break pip install on Render/Railway).
- package.json/craco: removed @emergentbase/visual-edits (would break yarn install off-platform).
- Cleaned backend/.env.example + .env (dropped EMERGENT_LLM_KEY/STORAGE_BACKEND); cleaned testIds comments/keys.
- .gitignore: excluded .emergent/ and .gitconfig (platform files, kept locally, not shipped); added !.env.example exceptions.
- Note: .emergent/ and .gitconfig are git-tracked platform files; never part of the deployed build (Vercel builds frontend/, Render runs backend/). User can `git rm -r --cached .emergent .gitconfig` in their own clone to drop them.

Deployment files added:
- frontend/vercel.json, netlify.toml, public/_redirects (SPA fallback), .env.example.
- backend/Procfile, render.yaml, runtime.txt (python-3.11.16), .env.example.
- DEPLOY_GUIDE.md: full step-by-step for Vercel/Netlify (frontend) + Render/Railway (backend) + MongoDB Atlas. Removed old DEPLOYMENT.md & DEPLOY_VERCEL_NETLIFY.md; cleaned CLIENT_HANDOFF.md.

Verified: production `yarn build` succeeds (188 kB gz), 14 assets copied, built index.html clean of emergent/posthog; homepage renders with 0 broken images; backend /api/content 200.

## Update — 2026-07 (Admin consolidation — single catalog source of truth)
Bug: user reported admin "not updated with products/categories". Root cause: admin had 3 overlapping editors (legacy Categories + Products tabs + real Catalog Master). User chose option (a): consolidate.
- Removed legacy "Categories" and "Products" admin tabs (AdminDashboard.jsx TABS + render blocks); removed unused BulkUpload/bulkAssign/CAT_LABELS.
- Homepage "Featured Products" now derives from Master Catalog products with a `featured` flag (Home.jsx) instead of legacy `products`.
- Added a per-product "Featured on homepage" toggle in Catalog (Master) editor + a live featured counter (warns when >4, since homepage caps at 4).
- Removed legacy top-level `categories`/`products` from seed (content_data.py) and live DB; seeded 4 featured catalog products (Food Containers, Plates, Pet Bottles, Tissues) in catalog_seed.py + DB.
- Verified by testing_agent (iteration_1.json): 25/25 backend tests, all frontend flows pass, draft->publish roundtrip works, no internal fields leaked. Backend regression suite added at /app/backend/tests/.
- Known/optional (not blocking): homepage featured cap of 4 (now surfaced via counter); non-idempotent content seed (existing DB not auto-updated by seed changes — we update DB directly); one catalog product still uses an Unsplash URL.
