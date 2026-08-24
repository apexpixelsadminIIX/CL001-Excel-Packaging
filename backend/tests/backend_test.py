import copy

import pytest
import requests

from conftest import BASE_URL

INTERNAL = ["hsn", "base_price", "gst", "total_price", "notes"]


# ---------- Health ----------
class TestHealth:
    def test_root(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/", timeout=30)
        assert r.status_code == 200
        assert "message" in r.json()


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self, api_client, test_credentials):
        r = api_client.post(f"{BASE_URL}/api/auth/login", json=test_credentials, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d.get("token"), str) and len(d["token"]) > 20
        assert d["user"]["email"] == test_credentials["email"].lower()
        assert d["user"]["role"] == "admin"

    def test_login_invalid_password(self, api_client, test_credentials):
        r = api_client.post(f"{BASE_URL}/api/auth/login",
                            json={"email": test_credentials["email"], "password": "wrong-pass-123"}, timeout=30)
        assert r.status_code == 401

    def test_login_unknown_user(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/auth/login",
                            json={"email": "nobody@example.test", "password": "x"}, timeout=30)
        assert r.status_code == 401

    def test_me_requires_auth(self, api_client):
        r = requests.get(f"{BASE_URL}/api/auth/me", timeout=30)
        assert r.status_code == 401

    def test_me_bad_token(self):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": "Bearer notatoken"}, timeout=30)
        assert r.status_code == 401

    def test_me_ok(self, admin_client, test_credentials):
        r = admin_client.get(f"{BASE_URL}/api/auth/me", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == test_credentials["email"].lower()
        assert "password_hash" not in d
        assert "_id" not in d

    def test_bcrypt_hash_format(self):
        """bcrypt hash stored in mongo should start with $2b$"""
        import asyncio
        import os
        from motor.motor_asyncio import AsyncIOMotorClient
        from dotenv import dotenv_values
        env = dotenv_values("/app/backend/.env")
        mongo = os.environ.get("MONGO_URL") or env.get("MONGO_URL")
        dbname = os.environ.get("DB_NAME") or env.get("DB_NAME")
        if not mongo:
            pytest.skip("no MONGO_URL")

        async def go():
            c = AsyncIOMotorClient(mongo)
            u = await c[dbname].users.find_one({"role": "admin"})
            c.close()
            return u
        user = asyncio.get_event_loop().run_until_complete(go())
        assert user is not None
        assert user["password_hash"].startswith("$2b$")


# ---------- Public content ----------
class TestPublicContent:
    def test_content_shape(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/content", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert "categories" not in d, "legacy 'categories' key still present in /api/content"
        assert "products" not in d, "legacy 'products' key still present in /api/content"
        assert "settings" not in d
        assert "_id" not in d
        assert isinstance(d.get("catalog"), list) and len(d["catalog"]) == 9
        for key in ["hero_slides", "contact", "cleaning_products", "story"]:
            assert key in d

    def test_no_internal_fields_leaked(self, api_client):
        d = api_client.get(f"{BASE_URL}/api/content", timeout=30).json()
        for cat in d["catalog"]:
            for p in cat.get("products", []):
                for f in INTERNAL:
                    assert f not in p, f"internal field {f} leaked on product {p.get('name')}"

    def test_featured_flags_present(self, api_client):
        d = api_client.get(f"{BASE_URL}/api/content", timeout=30).json()
        featured = [p["name"] for c in d["catalog"] for p in c.get("products", []) if p.get("featured")]
        assert len(featured) >= 1
        for name in ["Food Containers", "Plates", "Pet Bottles", "Tissues"]:
            assert name in featured, f"expected seed featured product missing: {name}"

    def test_contact_details(self, api_client):
        c = api_client.get(f"{BASE_URL}/api/content", timeout=30).json()["contact"]
        blob = " ".join(str(v) for v in c.values())
        assert "Ganapathy Nagar" in blob
        assert "600032" in blob
        assert "98417 35178" in blob or "9841735178" in blob
        assert c.get("email") == "exlpackaging@gmail.com"
        assert "919841735178" in blob


# ---------- Admin content / draft-publish ----------
class TestDraftPublish:
    def test_admin_content_requires_auth(self):
        for path in ["/api/admin/content", "/api/admin/content/status", "/api/admin/enquiries"]:
            r = requests.get(f"{BASE_URL}{path}", timeout=30)
            assert r.status_code == 401, path

    def test_put_content_requires_auth(self):
        r = requests.put(f"{BASE_URL}/api/content", json={"story": {}}, timeout=30)
        assert r.status_code == 401

    def test_publish_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/admin/publish", timeout=30)
        assert r.status_code == 401

    def test_featured_toggle_draft_publish_roundtrip(self, admin_client, api_client):
        # baseline live content
        live = api_client.get(f"{BASE_URL}/api/content", timeout=30).json()
        original_featured = sorted(p["name"] for c in live["catalog"] for p in c.get("products", []) if p.get("featured"))

        admin = admin_client.get(f"{BASE_URL}/api/admin/content", timeout=30)
        assert admin.status_code == 200
        doc = admin.json()
        catalog = copy.deepcopy(doc["catalog"])

        # pick a non-featured product in a non-eliteclean category and flag it
        target = None
        for ci, cat in enumerate(catalog):
            if cat.get("id") == "eliteclean":
                continue
            for pi, p in enumerate(cat.get("products", [])):
                if not p.get("featured"):
                    target = (ci, pi, p["name"])
                    break
            if target:
                break
        assert target, "no non-featured product available to test toggle"
        ci, pi, name = target
        catalog[ci]["products"][pi]["featured"] = True

        # save draft
        r = admin_client.put(f"{BASE_URL}/api/content", json={"catalog": catalog}, timeout=60)
        assert r.status_code == 200

        # draft not live yet
        pub = api_client.get(f"{BASE_URL}/api/content", timeout=30).json()
        pub_featured = sorted(p["name"] for c in pub["catalog"] for p in c.get("products", []) if p.get("featured"))
        assert pub_featured == original_featured, "draft leaked into live content before publish"

        st = admin_client.get(f"{BASE_URL}/api/admin/content/status", timeout=30)
        assert st.status_code == 200 and st.json()["has_unpublished"] is True

        # publish
        r = admin_client.post(f"{BASE_URL}/api/admin/publish", timeout=60)
        assert r.status_code == 200 and r.json().get("published") is True

        pub = api_client.get(f"{BASE_URL}/api/content", timeout=30).json()
        pub_featured = [p["name"] for c in pub["catalog"] for p in c.get("products", []) if p.get("featured")]
        assert name in pub_featured, f"published featured flag for {name} not reflected in /api/content"
        assert "settings" not in pub

        # revert
        catalog[ci]["products"][pi]["featured"] = False
        r = admin_client.put(f"{BASE_URL}/api/content", json={"catalog": catalog}, timeout=60)
        assert r.status_code == 200
        r = admin_client.post(f"{BASE_URL}/api/admin/publish", timeout=60)
        assert r.status_code == 200
        pub = api_client.get(f"{BASE_URL}/api/content", timeout=30).json()
        restored = sorted(p["name"] for c in pub["catalog"] for p in c.get("products", []) if p.get("featured"))
        assert restored == original_featured

    def test_publish_without_draft_returns_400(self, admin_client):
        admin_client.post(f"{BASE_URL}/api/admin/discard", timeout=30)
        r = admin_client.post(f"{BASE_URL}/api/admin/publish", timeout=30)
        assert r.status_code == 400

    def test_discard_draft(self, admin_client, api_client):
        doc = admin_client.get(f"{BASE_URL}/api/admin/content", timeout=30).json()
        story = copy.deepcopy(doc.get("story", {}))
        tmp = dict(story)
        tmp["title"] = "TEST_DRAFT_TITLE"
        r = admin_client.put(f"{BASE_URL}/api/content", json={"story": tmp}, timeout=60)
        assert r.status_code == 200
        assert admin_client.get(f"{BASE_URL}/api/admin/content/status", timeout=30).json()["has_unpublished"] is True
        r = admin_client.post(f"{BASE_URL}/api/admin/discard", timeout=30)
        assert r.status_code == 200
        assert admin_client.get(f"{BASE_URL}/api/admin/content/status", timeout=30).json()["has_unpublished"] is False
        live = api_client.get(f"{BASE_URL}/api/content", timeout=30).json()
        assert live.get("story", {}).get("title") != "TEST_DRAFT_TITLE"


# ---------- Enquiries ----------
class TestEnquiries:
    created = []

    def test_create_enquiry_with_items(self, api_client, admin_client):
        payload = {
            "company_name": "TEST_QA Foods Pvt Ltd",
            "contact_name": "TEST_QA Tester",
            "email": "qa@example.test",
            "phone": "9999999999",
            "what": "Food Containers",
            "when": "Next week",
            "where": "Chennai",
            "division": "packaging",
            "items": [{"category": "Plastic Containers", "product": "Food Containers",
                       "size": "500ml", "type": "Screen Printing", "moq": "10000 pcs", "quantity": "20000"}],
            "remarks": "TEST_automated",
        }
        r = api_client.post(f"{BASE_URL}/api/enquiries", json=payload, timeout=30)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d["success"] is True and isinstance(d["id"], str)
        TestEnquiries.created.append(d["id"])

        rows = admin_client.get(f"{BASE_URL}/api/admin/enquiries", timeout=30)
        assert rows.status_code == 200
        found = [x for x in rows.json() if x.get("id") == d["id"]]
        assert found, "enquiry not persisted"
        e = found[0]
        assert e["company_name"] == payload["company_name"]
        assert "Food Containers" in e.get("items_text", "")
        assert "10000 pcs" in e.get("items_text", "")
        assert "_id" not in e

    def test_create_enquiry_validation(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/enquiries", json={"company_name": "TEST_x"}, timeout=30)
        assert r.status_code == 422

    def test_export_csv(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/admin/enquiries/export", timeout=60)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        assert "company_name" in r.text.splitlines()[0]


# ---------- Settings / Instagram ----------
class TestSettingsAndIG:
    def test_settings_requires_auth(self):
        assert requests.get(f"{BASE_URL}/api/admin/settings", timeout=30).status_code == 401

    def test_get_settings(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/admin/settings", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), dict)

    def test_ig_status(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/admin/instagram/status", timeout=30)
        assert r.status_code == 200
        assert "connected" in r.json()

    def test_ig_feed_public(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/instagram/feed", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json().get("data"), list)


# ---------- Cleanup ----------
@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    import os
    from pymongo import MongoClient
    from dotenv import dotenv_values
    env = dotenv_values("/app/backend/.env")
    mongo = os.environ.get("MONGO_URL") or env.get("MONGO_URL")
    dbname = os.environ.get("DB_NAME") or env.get("DB_NAME")
    if mongo and TestEnquiries.created:
        c = MongoClient(mongo)
        c[dbname].enquiries.delete_many({"id": {"$in": TestEnquiries.created}})
        c.close()
