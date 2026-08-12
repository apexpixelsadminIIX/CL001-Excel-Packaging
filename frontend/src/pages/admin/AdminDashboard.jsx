import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api, API, resolveImg } from "@/lib/api";

const TABS = [
  { id: "enquiries", label: "Enquiries", icon: "fa-inbox" },
  { id: "hero", label: "Hero Carousel", icon: "fa-images" },
  { id: "categories", label: "Categories", icon: "fa-grip" },
  { id: "products", label: "Products", icon: "fa-box" },
  { id: "cleaning", label: "Cleaning", icon: "fa-spray-can-sparkles" },
  { id: "social", label: "Social & Videos", icon: "fa-hashtag" },
  { id: "contact", label: "Contact", icon: "fa-address-book" },
  { id: "settings", label: "Settings", icon: "fa-gear" },
];

const CAT_LABELS = { eco: "Eco-Friendly", plastic: "Plastic", paper: "Paper", cornstarch: "Corn Starch (PLA)", foil: "Aluminum Foil" };
const CLEAN_LABELS = { housekeeping: "Housekeeping", laundry: "Laundry Care", kitchen: "Kitchen Hygiene", sanitization: "Sanitization" };
const selCls = "w-full bg-panel border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-leaf";

function ImgField({ label, value, onChange, testid }) {
  const [busy, setBusy] = useState(false);
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(data.url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error("Upload failed. Try a smaller image (max 10MB).");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };
  return (
    <div>
      {label && <label className="text-[11px] font-bold text-ink2 uppercase tracking-wide mb-1 block">{label}</label>}
      <div className="flex gap-3 items-center">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-panel border border-line shrink-0">
          {value ? <img src={resolveImg(value)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-ink2/40"><i className="fa-solid fa-image" /></div>}
        </div>
        <input data-testid={testid} className="flex-1 bg-panel border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-leaf" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL or upload →" />
        <label className={`shrink-0 cursor-pointer bg-ink text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-leaf transition-colors ${busy ? "opacity-60 pointer-events-none" : ""}`} data-testid={testid ? `${testid}-upload` : "upload"}>
          {busy ? <i className="fa-solid fa-spinner fa-spin" /> : <><i className="fa-solid fa-arrow-up-from-bracket mr-1" /> Upload</>}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
        </label>
      </div>
    </div>
  );
}

function Txt({ label, value, onChange, area, testid }) {
  const cls = "w-full bg-panel border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-leaf";
  return (
    <div>
      {label && <label className="text-[11px] font-bold text-ink2 uppercase tracking-wide mb-1 block">{label}</label>}
      {area ? (
        <textarea data-testid={testid} rows={2} className={cls} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input data-testid={testid} className={cls} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { admin, ready, logout } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState("enquiries");
  const [content, setContent] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [webhook, setWebhook] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready && !admin) nav("/admin/login");
  }, [ready, admin, nav]);

  useEffect(() => {
    if (!admin) return;
    api.get("/admin/content").then(({ data }) => setContent(data)).catch(() => {});
    api.get("/admin/enquiries").then(({ data }) => setEnquiries(data)).catch(() => {});
    api.get("/admin/settings").then(({ data }) => setWebhook(data.sheets_webhook_url || "")).catch(() => {});
  }, [admin]);

  const update = (key, value) => setContent((c) => ({ ...c, [key]: value }));
  const updateItem = (key, idx, field, value) =>
    setContent((c) => {
      const arr = [...c[key]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...c, [key]: arr };
    });
  const addItem = (key, tmpl) =>
    setContent((c) => ({ ...c, [key]: [...(c[key] || []), { id: `${key.slice(0, 4)}-${Date.now()}`, ...tmpl }] }));
  const removeItem = (key, idx) =>
    setContent((c) => ({ ...c, [key]: c[key].filter((_, i) => i !== idx) }));
  const setCategory = (key, idx, catId, labels) =>
    setContent((c) => {
      const arr = [...c[key]];
      arr[idx] = { ...arr[idx], category: catId, category_label: labels[catId] };
      return { ...c, [key]: arr };
    });

  const save = async () => {
    setSaving(true);
    try {
      const { settings, ...rest } = content;
      await api.put("/content", rest);
      qc.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Content saved & published.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", { sheets_webhook_url: webhook });
      toast.success("Settings saved.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    try {
      const res = await api.get("/admin/enquiries/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "enquiries.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed.");
    }
  };

  if (!ready || !admin || !content) {
    return <div className="min-h-screen bg-bg flex items-center justify-center text-ink2">Loading dashboard…</div>;
  }

  const Card = ({ children }) => <div className="bg-surf border border-line rounded-2xl p-5 space-y-3">{children}</div>;

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-ink text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 font-extrabold">
          <span className="w-8 h-8 bg-leaf rounded-lg flex items-center justify-center text-xs">EX</span>
          Excel <span className="text-leaf">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white">View Site <i className="fa-solid fa-arrow-up-right-from-square text-xs ml-1" /></a>
          {tab !== "enquiries" && tab !== "settings" && (
            <button data-testid="admin-save" onClick={save} disabled={saving} className="bg-leaf px-5 py-2.5 rounded-full text-sm font-bold hover:bg-sunset transition-colors disabled:opacity-60">
              {saving ? "Saving…" : "Save & Publish"}
            </button>
          )}
          <button data-testid="admin-logout" onClick={() => { logout(); nav("/admin/login"); }} className="bg-white/10 px-4 py-2.5 rounded-full text-sm font-bold hover:bg-white/20">Logout</button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="md:w-56 p-4 md:py-8 flex md:flex-col gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${tab === t.id ? "bg-leaf text-white" : "text-ink2 hover:bg-panel"}`}
            >
              <i className={`fa-solid ${t.icon}`} /> {t.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
          {tab === "enquiries" && (
            <section data-testid="admin-enquiries">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-ink">Enquiries <span className="text-ink2 font-medium text-lg">({enquiries.length})</span></h2>
                <button data-testid="export-csv" onClick={exportCsv} className="bg-ink text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-leaf transition-colors"><i className="fa-solid fa-download mr-2" />Export CSV</button>
              </div>
              <div className="space-y-4">
                {enquiries.length === 0 && <p className="text-ink2">No enquiries yet.</p>}
                {enquiries.map((e) => (
                  <div key={e.id} className="bg-surf border border-line rounded-2xl p-5" data-testid="enquiry-row">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="font-bold text-ink">{e.company_name} {e.contact_name && <span className="text-ink2 font-medium">· {e.contact_name}</span>}</h3>
                      <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${e.division === "elitecare" ? "bg-leaf/15 text-leaf" : "bg-sun/20 text-ink"}`}>{e.division}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm text-ink2">
                      <p><b className="text-ink">Required:</b> {e.products_required}</p>
                      <p><b className="text-ink">Quantity:</b> {e.quantity}</p>
                      {e.products_offered && <p><b className="text-ink">Offers:</b> {e.products_offered}</p>}
                      {e.phone && <p><b className="text-ink">Phone:</b> {e.phone}</p>}
                      {e.email && <p><b className="text-ink">Email:</b> {e.email}</p>}
                      <p><b className="text-ink">What:</b> {e.what}</p>
                      <p><b className="text-ink">When:</b> {e.when}</p>
                      <p><b className="text-ink">Where:</b> {e.where}</p>
                    </div>
                    <p className="text-[11px] text-ink2/60 mt-3">{new Date(e.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "hero" && (
            <section className="space-y-4" data-testid="admin-hero">
              <h2 className="text-2xl font-extrabold text-ink mb-2">Hero Carousel Slides</h2>
              {content.hero_slides?.map((s, i) => (
                <Card key={s.id}>
                  <ImgField label={`Slide ${i + 1} image`} value={s.image} onChange={(v) => updateItem("hero_slides", i, "image", v)} testid={`hero-img-${i}`} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Txt label="Eyebrow" value={s.eyebrow} onChange={(v) => updateItem("hero_slides", i, "eyebrow", v)} />
                    <Txt label="CTA label" value={s.cta_label} onChange={(v) => updateItem("hero_slides", i, "cta_label", v)} />
                    <Txt label="Title lead" value={s.title_lead} onChange={(v) => updateItem("hero_slides", i, "title_lead", v)} />
                    <Txt label="Title accent" value={s.title_accent} onChange={(v) => updateItem("hero_slides", i, "title_accent", v)} />
                    <Txt label="CTA link" value={s.cta_link} onChange={(v) => updateItem("hero_slides", i, "cta_link", v)} />
                  </div>
                </Card>
              ))}
            </section>
          )}

          {tab === "categories" && (
            <section className="space-y-4" data-testid="admin-categories">
              <h2 className="text-2xl font-extrabold text-ink mb-2">Category Cards</h2>
              {content.categories?.map((c, i) => (
                <Card key={c.id}>
                  <ImgField label={c.title} value={c.image} onChange={(v) => updateItem("categories", i, "image", v)} testid={`cat-img-${i}`} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Txt label="Title" value={c.title} onChange={(v) => updateItem("categories", i, "title", v)} />
                    <Txt label="Description" value={c.desc} onChange={(v) => updateItem("categories", i, "desc", v)} />
                  </div>
                </Card>
              ))}
            </section>
          )}

          {tab === "products" && (
            <section className="space-y-4" data-testid="admin-products">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-extrabold text-ink">Products ({content.products?.length})</h2>
                <button
                  data-testid="add-product"
                  onClick={() => addItem("products", { name: "New Product", category: "eco", category_label: CAT_LABELS.eco, badge: "In Stock", desc: "", image: "" })}
                  className="bg-leaf text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-ink transition-colors"
                >
                  <i className="fa-solid fa-plus mr-2" />Add Product
                </button>
              </div>
              {content.products?.map((p, i) => (
                <Card key={p.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-leaf uppercase tracking-widest">{p.category_label}</span>
                    <button data-testid={`remove-product-${i}`} onClick={() => removeItem("products", i)} aria-label="Remove product" className="w-9 h-9 rounded-full text-sunset hover:bg-sunset hover:text-white flex items-center justify-center transition-colors">
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                  <ImgField label={p.name} value={p.image} onChange={(v) => updateItem("products", i, "image", v)} testid={`prod-img-${i}`} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Txt label="Name" value={p.name} onChange={(v) => updateItem("products", i, "name", v)} />
                    <Txt label="Badge" value={p.badge} onChange={(v) => updateItem("products", i, "badge", v)} />
                    <div>
                      <label className="text-[11px] font-bold text-ink2 uppercase tracking-wide mb-1 block">Category</label>
                      <select data-testid={`prod-cat-${i}`} className={selCls} value={p.category} onChange={(e) => setCategory("products", i, e.target.value, CAT_LABELS)}>
                        {Object.entries(CAT_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-3"><Txt label="Description" area value={p.desc} onChange={(v) => updateItem("products", i, "desc", v)} /></div>
                  </div>
                </Card>
              ))}
            </section>
          )}

          {tab === "cleaning" && (
            <section className="space-y-4" data-testid="admin-cleaning">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-extrabold text-ink">Cleaning & Hospitality ({content.cleaning_products?.length})</h2>
                <button
                  data-testid="add-cleaning"
                  onClick={() => addItem("cleaning_products", { name: "New Chemical", category: "housekeeping", category_label: CLEAN_LABELS.housekeeping, tag: "New", desc: "", image: "" })}
                  className="bg-leaf text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-ink transition-colors"
                >
                  <i className="fa-solid fa-plus mr-2" />Add Product
                </button>
              </div>
              {content.cleaning_products?.map((p, i) => (
                <Card key={p.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-leaf uppercase tracking-widest">{p.category_label}</span>
                    <button data-testid={`remove-cleaning-${i}`} onClick={() => removeItem("cleaning_products", i)} aria-label="Remove product" className="w-9 h-9 rounded-full text-sunset hover:bg-sunset hover:text-white flex items-center justify-center transition-colors">
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                  <ImgField label={p.name} value={p.image} onChange={(v) => updateItem("cleaning_products", i, "image", v)} testid={`clean-img-${i}`} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Txt label="Name" value={p.name} onChange={(v) => updateItem("cleaning_products", i, "name", v)} />
                    <Txt label="Tag" value={p.tag} onChange={(v) => updateItem("cleaning_products", i, "tag", v)} />
                    <div>
                      <label className="text-[11px] font-bold text-ink2 uppercase tracking-wide mb-1 block">Category</label>
                      <select data-testid={`clean-cat-${i}`} className={selCls} value={p.category} onChange={(e) => setCategory("cleaning_products", i, e.target.value, CLEAN_LABELS)}>
                        {Object.entries(CLEAN_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-3"><Txt label="Description" area value={p.desc} onChange={(v) => updateItem("cleaning_products", i, "desc", v)} /></div>
                  </div>
                </Card>
              ))}
            </section>
          )}

          {tab === "social" && (
            <section className="space-y-4" data-testid="admin-social">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-extrabold text-ink">Social Posts & Videos ({content.social_posts?.length})</h2>
                <button
                  data-testid="add-social"
                  onClick={() => addItem("social_posts", { platform: "instagram", image: "", caption: "New post", link: "https://instagram.com" })}
                  className="bg-leaf text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-ink transition-colors"
                >
                  <i className="fa-solid fa-plus mr-2" />Add Post
                </button>
              </div>
              <p className="text-sm text-ink2 mb-2">These appear in the Home page social carousel (one slide at a time). Set the image/thumbnail, caption, platform and outbound link.</p>
              {content.social_posts?.map((s, i) => (
                <Card key={s.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-leaf uppercase tracking-widest">Post {i + 1}</span>
                    <button data-testid={`remove-social-${i}`} onClick={() => removeItem("social_posts", i)} aria-label="Remove post" className="w-9 h-9 rounded-full text-sunset hover:bg-sunset hover:text-white flex items-center justify-center transition-colors">
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                  <ImgField label={`Image / thumbnail (${s.platform})`} value={s.image} onChange={(v) => updateItem("social_posts", i, "image", v)} testid={`social-img-${i}`} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-ink2 uppercase tracking-wide mb-1 block">Platform</label>
                      <select data-testid={`social-platform-${i}`} className={selCls} value={s.platform} onChange={(e) => updateItem("social_posts", i, "platform", e.target.value)}>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                      </select>
                    </div>
                    <Txt label="Link" value={s.link} onChange={(v) => updateItem("social_posts", i, "link", v)} />
                    <div className="md:col-span-3"><Txt label="Caption" value={s.caption} onChange={(v) => updateItem("social_posts", i, "caption", v)} /></div>
                  </div>
                </Card>
              ))}
            </section>
          )}

          {tab === "contact" && (
            <section className="space-y-4 max-w-2xl" data-testid="admin-contact">
              <h2 className="text-2xl font-extrabold text-ink mb-2">Contact & Social Links</h2>
              <Card>
                <Txt label="Phone (display)" value={content.contact?.phone} onChange={(v) => update("contact", { ...content.contact, phone: v })} />
                <Txt label="Phone (tel link, digits only)" value={content.contact?.phone_link} onChange={(v) => update("contact", { ...content.contact, phone_link: v })} />
                <Txt label="Email" value={content.contact?.email} onChange={(v) => update("contact", { ...content.contact, email: v })} />
                <Txt label="Address line 1" value={content.contact?.address_line1} onChange={(v) => update("contact", { ...content.contact, address_line1: v })} />
                <Txt label="Address line 2" value={content.contact?.address_line2} onChange={(v) => update("contact", { ...content.contact, address_line2: v })} />
                <Txt label="Instagram URL" value={content.contact?.instagram} onChange={(v) => update("contact", { ...content.contact, instagram: v })} />
                <Txt label="LinkedIn URL" value={content.contact?.linkedin} onChange={(v) => update("contact", { ...content.contact, linkedin: v })} />
                <Txt label="Facebook URL" value={content.contact?.facebook} onChange={(v) => update("contact", { ...content.contact, facebook: v })} />
              </Card>
            </section>
          )}

          {tab === "settings" && (
            <section className="space-y-4 max-w-2xl" data-testid="admin-settings">
              <h2 className="text-2xl font-extrabold text-ink mb-2">Google Sheet Sync</h2>
              <Card>
                <p className="text-sm text-ink2">Paste your Google Apps Script Web App URL below. Every new enquiry will be POSTed to it so it appends a row to your connected Google Sheet. Leave blank to disable (enquiries are always saved here regardless).</p>
                <Txt label="Apps Script Web App URL" value={webhook} onChange={setWebhook} testid="webhook-input" />
                <button data-testid="save-settings" onClick={saveSettings} disabled={saving} className="bg-leaf text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-ink transition-colors disabled:opacity-60">{saving ? "Saving…" : "Save Settings"}</button>
                <details className="text-xs text-ink2 mt-2">
                  <summary className="cursor-pointer font-bold">How to set up the Google Sheet</summary>
                  <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>Open your Google Sheet → Extensions → Apps Script.</li>
                    <li>Paste a doPost(e) script that appends JSON.parse(e.postData.contents) as a row.</li>
                    <li>Deploy → New deployment → Web app → Anyone → copy the URL.</li>
                    <li>Paste that URL here and Save.</li>
                  </ol>
                </details>
              </Card>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
