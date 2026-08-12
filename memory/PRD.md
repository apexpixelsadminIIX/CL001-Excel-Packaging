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
