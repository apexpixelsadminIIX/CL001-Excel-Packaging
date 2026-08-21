"""Default seed content for Excel Packaging and Taste Foods.
This is the single source of truth for site content. The admin dashboard
edits a MongoDB copy of this structure; the frontend reads from /api/content.
"""

IMG = {
    "hero_containers": "https://static.prod-images.emergentagent.com/jobs/27c2a22b-2eb8-4581-be09-f7ea1e7181d7/images/7ddde47ff37c0e3a47b6d09a90b4a21011329048c9b46e091ebd8c23463c7985.jpeg",
    "hero_eco": "https://static.prod-images.emergentagent.com/jobs/27c2a22b-2eb8-4581-be09-f7ea1e7181d7/images/759ad57b24c38f656bc4edf16f9c437a8a614e4d9a349effd643f309d034608a.jpeg",
    "hero_offer": "https://static.prod-images.emergentagent.com/jobs/27c2a22b-2eb8-4581-be09-f7ea1e7181d7/images/ada3dbf5f92b00e1efd7daefc053706e37fd730fd722cb767a9b879bc841879a.jpeg",
    "cat_containers": "https://static.prod-images.emergentagent.com/jobs/27c2a22b-2eb8-4581-be09-f7ea1e7181d7/images/8efb8393bd6f03b4851e204bea43baa437e92c26d431e0236864f0fc0667b9c6.jpeg",
    "cat_eco": "https://static.prod-images.emergentagent.com/jobs/27c2a22b-2eb8-4581-be09-f7ea1e7181d7/images/cdb67cdd58fd0a4ee88fc9097b597d1edf44575aef58c934de0c503a0e5b3268.jpeg",
    "cat_foil": "https://static.prod-images.emergentagent.com/jobs/27c2a22b-2eb8-4581-be09-f7ea1e7181d7/images/4805863ac5aec6cc4714dd128dc2430dd2d0d7fcd4ac259333afa61621f4fb79.jpeg",
    "cat_clean": "https://static.prod-images.emergentagent.com/jobs/27c2a22b-2eb8-4581-be09-f7ea1e7181d7/images/cd6bfe45aa7f4d29cf0b89f0ce8e6a4fa97aecca78a577a29d5a1b23b605b175.jpeg",
    "pp_container": "https://static.prod-images.emergentagent.com/jobs/27c2a22b-2eb8-4581-be09-f7ea1e7181d7/images/5fd2a6dccfc68301978c82063701289aed1b55467a2b2332ba24a2b598710e74.jpeg",
    "pet_box": "https://static.prod-images.emergentagent.com/jobs/27c2a22b-2eb8-4581-be09-f7ea1e7181d7/images/9889aa141ec0dacea9417cfb53f96c943a1419e5e60055f43dab5a6a26db5aea.jpeg",
    "pla_container": "https://static.prod-images.emergentagent.com/jobs/27c2a22b-2eb8-4581-be09-f7ea1e7181d7/images/a1538802c3c9e3f62217a48548dbf6fbcadc03ac44cb4eca0f37b593a63f5d76.jpeg",
    "sugarcane_plates": "https://images.unsplash.com/photo-1727021024931-90c226e8448d?w=900&q=80",
    "eco_box_green": "https://images.pexels.com/photos/12725408/pexels-photo-12725408.jpeg?auto=compress&cs=tinysrgb&w=900",
    "eco_box_kitchen": "https://images.unsplash.com/photo-1597514402413-17eac2b501c0?w=900&q=80",
    "box_coffee": "https://images.unsplash.com/photo-1648587456176-4969b0124b12?w=900&q=80",
    "kraft_open": "https://images.unsplash.com/photo-1575833948662-cc99178abbb8?w=900&q=80",
    "kraft_bags": "https://images.unsplash.com/photo-1648544365218-188e3d07dcac?w=900&q=80",
    "paper_cup": "https://images.unsplash.com/photo-1598908314732-07113901949e?w=900&q=80",
    "cups_top": "https://images.pexels.com/photos/7319334/pexels-photo-7319334.jpeg?auto=compress&cs=tinysrgb&w=900",
    "wooden_cutlery": "https://images.unsplash.com/photo-1769610712905-efbfdb66a4d6?w=900&q=80",
    "wooden_spoons": "https://images.unsplash.com/photo-1648582268945-4206c1490ed7?w=900&q=80",
    "foil_tray": "https://images.unsplash.com/photo-1779939855722-3941c77d2fb0?w=900&q=80",
    "clean_brown": "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=900&q=80",
    "clean_yellow": "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=900&q=80",
    "clean_blue": "https://images.pexels.com/photos/4440564/pexels-photo-4440564.jpeg?auto=compress&cs=tinysrgb&w=900",
    "clean_lab": "https://images.pexels.com/photos/5146985/pexels-photo-5146985.jpeg?auto=compress&cs=tinysrgb&w=900",
    "clean_colorful": "https://images.pexels.com/photos/5217889/pexels-photo-5217889.jpeg?auto=compress&cs=tinysrgb&w=900",
    "clean_bucket": "https://images.pexels.com/photos/3177257/pexels-photo-3177257.jpeg?auto=compress&cs=tinysrgb&w=900",
    "warehouse": "https://images.unsplash.com/photo-1773125929765-99d4d67e831d?w=1200&q=80",
    "chennai": "https://images.pexels.com/photos/9432498/pexels-photo-9432498.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "eco_box_delivery": "https://images.pexels.com/photos/12725411/pexels-photo-12725411.jpeg?auto=compress&cs=tinysrgb&w=900",
    "warehouse2": "https://images.unsplash.com/photo-1766040923580-16ad32fae8b4?w=900&q=80",
}

from catalog_seed import CATALOG

# Category sort priority: eco first, then plastic, paper, corn starch (pla), foil
PRIORITY = {"eco": 1, "plastic": 2, "paper": 3, "cornstarch": 4, "foil": 5}

DEFAULT_CONTENT = {
    "_id": "site",
    "hero_slides": [
        {"id": "s1", "eyebrow": "Chennai's Trusted B2B Supplier", "title_lead": "Superior Packaging for",
         "title_accent": "Food Excellence", "image": IMG["hero_containers"],
         "cta_label": "View E-Catalog", "cta_link": "/catalog"},
        {"id": "s2", "eyebrow": "Sustainable Solutions", "title_lead": "Eco-Friendly",
         "title_accent": "Disposables Range", "image": IMG["hero_eco"],
         "cta_label": "Explore Eco Range", "cta_link": "/catalog?cat=eco"},
        {"id": "s3", "eyebrow": "Bulk Order Offer", "title_lead": "Save More on Your",
         "title_accent": "First Bulk Order", "image": IMG["hero_offer"],
         "cta_label": "Get a Quote", "cta_link": "/enquiry"},
    ],
    "story": {
        "eyebrow": "Since 2019",
        "heading": "Partnering with Chennai's Food Industry",
        "body": "Operating since 2019, Excel Packaging and Taste Foods has become a cornerstone for food service businesses in Chennai. We specialise in food-grade packaging that bridges the gap between hygiene and aesthetic presentation.",
        "image": IMG["warehouse"],
        "stat1_value": "100%", "stat1_label": "Food Grade Materials",
        "stat2_value": "Bulk", "stat2_label": "Fulfillment Ready",
        "established": "2019",
    },
    "categories": [
        {"id": "containers", "title": "Food Containers", "desc": "Microwavable PP and PET containers in all standard sizes.", "image": IMG["cat_containers"], "link": "/catalog?cat=plastic"},
        {"id": "eco", "title": "Eco Range", "desc": "Compostable sugarcane products and wooden cutlery solutions.", "image": IMG["cat_eco"], "link": "/catalog?cat=eco"},
        {"id": "foil", "title": "Foil Products", "desc": "Heat-retentive foil containers and premium kitchen foils.", "image": IMG["cat_foil"], "link": "/catalog?cat=foil"},
        {"id": "clean", "title": "Cleaning & Hospitality", "desc": "Professional housekeeping and cleaning chemicals.", "image": IMG["cat_clean"], "link": "/cleaning", "highlight": True},
    ],
    "products": [
        # ECO (priority 1)
        {"id": "p-sugarcane", "name": "Sugarcane Bagasse Plates", "category": "eco", "category_label": "Eco-Friendly", "badge": "In Stock", "featured": True, "desc": "100% biodegradable and sturdy, moisture resistant. Available in 7, 9 and 12 inch sizes.", "image": IMG["sugarcane_plates"]},
        {"id": "p-bagasse-box", "name": "Bagasse Clamshell Boxes", "category": "eco", "category_label": "Eco-Friendly", "badge": "Best Seller", "desc": "Compostable hinged meal boxes, leak-resistant and microwave safe for hot takeaway food.", "image": IMG["eco_box_green"]},
        {"id": "p-bagasse-bowls", "name": "Bagasse Bowls & Trays", "category": "eco", "category_label": "Eco-Friendly", "badge": "In Stock", "desc": "Deep compostable bowls and compartment trays for curries, rice and multi-course meals.", "image": IMG["cat_eco"]},
        {"id": "p-wooden-cutlery", "name": "Wooden Cutlery Sets", "category": "eco", "category_label": "Eco-Friendly", "badge": "Popular", "desc": "Smooth birch wood forks, spoons and knives. Splinter-free and fully compostable.", "image": IMG["wooden_cutlery"]},
        # PLASTIC (priority 2)
        {"id": "p-pp", "name": "PP Microwavable Containers", "category": "plastic", "category_label": "Plastic", "badge": "Bulk Supply", "featured": True, "desc": "High-quality PP containers, leak-proof and heat resistant up to 120°C with snap lids.", "image": IMG["pp_container"]},
        {"id": "p-pet", "name": "PET Hinged Deli Boxes", "category": "plastic", "category_label": "Plastic", "badge": "In Stock", "desc": "Crystal-clear PET salad and deli boxes with tamper-evident hinged lids.", "image": IMG["pet_box"]},
        {"id": "p-portion", "name": "Clear Portion Cups", "category": "plastic", "category_label": "Plastic", "badge": "Bulk Supply", "desc": "Stackable portion cups with lids for sauces, chutneys and dressings.", "image": IMG["cat_containers"]},
        # PAPER (priority 3)
        {"id": "p-kraft-box", "name": "Kraft Meal Boxes", "category": "paper", "category_label": "Paper", "badge": "In Stock", "featured": True, "desc": "Premium kraft paper boxes with grease-proof lining for fried snacks and meals.", "image": IMG["kraft_open"]},
        {"id": "p-paper-cup", "name": "Ripple Paper Cups", "category": "paper", "category_label": "Paper", "badge": "Popular", "desc": "Double-wall ripple cups for hot beverages, 8oz to 16oz with matching lids.", "image": IMG["paper_cup"]},
        {"id": "p-kraft-bags", "name": "Kraft Carry Bags", "category": "paper", "category_label": "Paper", "badge": "In Stock", "desc": "Twisted-handle kraft bags for takeaway and retail, multiple sizes available.", "image": IMG["kraft_bags"]},
        {"id": "p-cups-lids", "name": "Takeaway Cups with Lids", "category": "paper", "category_label": "Paper", "badge": "Bulk Supply", "desc": "Coated paper cups with sip-through lids, ideal for cafes and cloud kitchens.", "image": IMG["cups_top"]},
        # CORN STARCH / PLA (priority 4)
        {"id": "p-pla-tray", "name": "PLA Compartment Trays", "category": "cornstarch", "category_label": "Corn Starch (PLA)", "badge": "Eco Alternative", "desc": "Corn-starch based compostable trays, a plant-based alternative to plastic for meal takeaway.", "image": IMG["pla_container"]},
        {"id": "p-pla-cutlery", "name": "Corn Starch Cutlery", "category": "cornstarch", "category_label": "Corn Starch (PLA)", "badge": "Compostable", "desc": "Heat-tolerant CPLA cutlery that composts fully, sturdier than standard bioplastics.", "image": IMG["wooden_spoons"]},
        # ALUMINIUM FOIL (priority 5)
        {"id": "p-foil-container", "name": "Foil Take-away Containers", "category": "foil", "category_label": "Aluminum Foil", "badge": "B2B Only", "desc": "Rectangular foil containers with board lids for hot, heat-retentive takeaway meals.", "image": IMG["foil_tray"]},
        {"id": "p-foil-roll", "name": "Aluminium Foil Rolls & Wrap", "category": "foil", "category_label": "Aluminum Foil", "badge": "Bulk Supply", "desc": "Extra-thick commercial-grade foil rolls and containers for maximum heat retention.", "image": IMG["cat_foil"]},
    ],
    "catalog_filters": [
        {"id": "eco", "label": "Eco-Friendly"},
        {"id": "plastic", "label": "Plastic"},
        {"id": "paper", "label": "Paper"},
        {"id": "cornstarch", "label": "Corn Starch (PLA)"},
        {"id": "foil", "label": "Aluminum Foil"},
    ],
    "cleaning_products": [
        {"id": "c-glass", "name": "Glass & Multi-Surface Cleaner", "category": "housekeeping", "category_label": "Housekeeping", "tag": "Streak Free", "desc": "Professional glass cleaner concentrate. Streak-free finish on windows, mirrors and stainless steel.", "image": IMG["clean_brown"]},
        {"id": "c-degreaser", "name": "Heavy Duty Degreaser", "category": "kitchen", "category_label": "Kitchen Hygiene", "tag": "Fast Acting", "desc": "Rapid-action formula for grills, ovens and chimney ducts. Non-corrosive and food-surface safe.", "image": IMG["clean_yellow"]},
        {"id": "c-floor", "name": "Floor Cleaner Concentrate", "category": "housekeeping", "category_label": "Housekeeping", "tag": "Economical", "desc": "High-dilution floor cleaner with long-lasting fragrance for lobbies and high-traffic areas.", "image": IMG["clean_blue"]},
        {"id": "c-disinfectant", "name": "Hospital-Grade Disinfectant", "category": "sanitization", "category_label": "Sanitization", "tag": "Kills 99.9%", "desc": "Clinical disinfectant that kills 99.9% of food-borne pathogens and viruses on contact.", "image": IMG["clean_lab"]},
        {"id": "c-softener", "name": "Fabric Softener Plus", "category": "laundry", "category_label": "Laundry Care", "tag": "Hotel Grade", "desc": "High-efficiency softener for hotel linens. Long-lasting fragrance and fibre protection.", "image": IMG["cat_clean"]},
        {"id": "c-detergent", "name": "Laundry Detergent Concentrate", "category": "laundry", "category_label": "Laundry Care", "tag": "Low Foam", "desc": "Industrial low-foam detergent engineered for commercial washing machines and heavy loads.", "image": IMG["clean_colorful"]},
        {"id": "c-toilet", "name": "Toilet & Bathroom Cleaner", "category": "housekeeping", "category_label": "Housekeeping", "tag": "Descaling", "desc": "Thick acidic formula that removes limescale, stains and germs from restroom surfaces.", "image": IMG["clean_bucket"]},
    ],
    "cleaning_filters": [
        {"id": "housekeeping", "label": "Housekeeping"},
        {"id": "laundry", "label": "Laundry Care"},
        {"id": "kitchen", "label": "Kitchen Hygiene"},
        {"id": "sanitization", "label": "Sanitization"},
    ],
    "testimonials": [
        {"id": "t1", "quote": "Significant improvement in our delivery quality. Their leak-proof containers are a game changer for our takeaway business.", "name": "Rajesh Verma", "role": "Owner, Spice Village", "avatar": "https://i.pravatar.cc/150?img=12"},
        {"id": "t2", "quote": "Transitioning to their eco-range was seamless. Quality is consistent, and the aesthetic matches our organic brand perfectly.", "name": "Ananya Iyer", "role": "Director, Green Eats", "avatar": "https://i.pravatar.cc/150?img=45"},
        {"id": "t3", "quote": "Excel is our one-stop shop for both hygiene chemicals and disposables. Reliable delivery and very professional service.", "name": "David Chen", "role": "Ops Manager, Grand Hotels", "avatar": "https://i.pravatar.cc/150?img=33"},
    ],
    "social_posts": [
        {"id": "sp1", "platform": "instagram", "image": IMG["eco_box_delivery"], "caption": "Fresh batch of compostable meal boxes shipped across Chennai 🌿", "link": "https://instagram.com"},
        {"id": "sp2", "platform": "instagram", "image": IMG["box_coffee"], "caption": "Cafe-ready cups & boxes for our cloud kitchen partners ☕", "link": "https://instagram.com"},
        {"id": "sp3", "platform": "youtube", "image": IMG["hero_offer"], "video_url": "https://www.youtube.com/watch?v=jNQXAC9IVRw", "caption": "Watch: How we quality-check every food-grade batch", "link": "https://youtube.com"},
        {"id": "sp4", "platform": "instagram", "image": IMG["sugarcane_plates"], "caption": "Sugarcane bagasse plates — sturdy, sleak-proof, 100% compostable", "link": "https://instagram.com"},
        {"id": "sp5", "platform": "instagram", "image": IMG["eco_box_kitchen"], "caption": "Behind the scenes at our Guindy fulfilment hub 📦", "link": "https://instagram.com"},
        {"id": "sp6", "platform": "youtube", "image": IMG["warehouse2"], "caption": "Bulk logistics: same-day dispatch for Chennai orders", "link": "https://youtube.com"},
        {"id": "sp7", "platform": "instagram", "image": IMG["foil_tray"], "caption": "Heat-retentive foil containers keeping meals hot on the go 🔥", "link": "https://instagram.com"},
    ],
    "contact": {
        "phone": "+91 98765 43210",
        "phone_link": "+919876543210",
        "email": "enquiry@excelpackaging.in",
        "address_line1": "Industrial Estate, Guindy,",
        "address_line2": "Chennai, Tamil Nadu 600032",
        "instagram": "https://instagram.com",
        "linkedin": "https://linkedin.com",
        "facebook": "https://facebook.com",
    },
    "about_page": {
        "hero_lead": "Empowering the",
        "hero_accent": "Food Service",
        "hero_tail": "Industry",
        "hero_body": "Excel Packaging and Taste Foods is Chennai's premier B2B supplier of food-grade packaging, eco-friendly disposables, and professional-grade hygiene chemicals.",
        "mission": "To provide innovative, sustainable, and high-quality packaging solutions that ensure safety and enhance the presentation for food service businesses across Chennai.",
        "vision": "To be the most trusted and efficient supply partner for the hospitality industry, leading the region's transition to a 100% eco-friendly disposables future.",
        "image": IMG["warehouse"],
        "pillars": [
            {"num": "01", "icon": "fa-certificate", "title": "100% Food-Grade", "body": "Every container and disposable we supply meets rigorous food safety standards, ensuring no chemical migration or taste alteration."},
            {"num": "02", "icon": "fa-earth-asia", "title": "Eco-Conscious Focus", "body": "Operating since 2019, we have consistently expanded our range of biodegradable sugarcane products and sustainable alternatives."},
            {"num": "03", "icon": "fa-truck-ramp-box", "title": "Bulk Fulfillment", "body": "Our Guindy-based logistics hub is optimised for the demanding delivery timelines of Chennai's top restaurants and hotels."},
        ],
    },
    "settings": {
        "sheets_webhook_url": "",  # Google Apps Script Web App URL for Sheet sync
    },
    "catalog": CATALOG,
}
