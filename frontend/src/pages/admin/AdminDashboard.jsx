import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Reorder, useDragControls } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api, API, resolveImg, formatApiError } from "@/lib/api";

const TABS = [
  { id: "enquiries", label: "Enquiries", icon: "fa-inbox" },
  { id: "hero", label: "Hero Carousel", icon: "fa-images" },
  { id: "categories", label: "Categories", icon: "fa-grip" },
  { id: "products", label: "Products", icon: "fa-box" },
  { id: "cleaning", label: "Cleaning", icon: "fa-spray-can-sparkles" },
  { id: "social", label: "Social & Videos", icon: "fa-hashtag" },
  { id: "instagram", label: "Instagram Sync", icon: "fa-camera-retro" },
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

function SortableItem({ value, label, onRemove, removeTestid, children }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      dragControls={controls}
      className="bg-surf border border-line rounded-2xl p-5 space-y-3 list-none"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onPointerDown={(e) => controls.start(e)}
            aria-label="Drag to reorder"
            data-testid={removeTestid ? `${removeTestid}-drag` : "drag-handle"}
            className="cursor-grab active:cursor-grabbing text-ink2 hover:text-ink w-8 h-8 flex items-center justify-center touch-none"
          >
            <i className="fa-solid fa-grip-vertical" />
          </button>
          <span className="text-xs font-bold text-leaf uppercase tracking-widest">{label}</span>
        </div>
        {onRemove && (
          <button
            data-testid={removeTestid}
            onClick={onRemove}
            aria-label="Remove"
            className="w-9 h-9 rounded-full text-sunset hover:bg-sunset hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-trash-can" />
          </button>
        )}
      </div>
      {children}
    </Reorder.Item>
  );
}

function BulkUpload({ products, onAssign }) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    const uploaded = [];
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f);
      try {
        const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        uploaded.push({ url: data.url, name: f.name, target: "" });
      } catch {
        toast.error(`Failed: ${f.name}`);
      }
    }
    setItems((prev) => [...prev, ...uploaded]);
    setBusy(false);
    e.target.value = "";
  };

  const setTarget = (idx, pid) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, target: pid } : it)));

  const autoFillEmpties = () => {
    const empties = products.filter((p) => !p.image).map((p) => p.id);
    setItems((prev) => {
      let k = 0;
      return prev.map((it) => (it.target ? it : (k < empties.length ? { ...it, target: empties[k++] } : it)));
    });
    toast.message("Assigned uploads to products missing images. Review and Apply.");
  };

  const apply = () => {
    const assigns = items.filter((it) => it.target);
    if (!assigns.length) return toast.error("Pick a product for at least one image.");
    onAssign(assigns);
    setItems([]);
    setOpen(false);
    toast.success(`Matched ${assigns.length} image(s). Remember to Save & Publish.`);
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-ink flex items-center gap-2"><i className="fa-solid fa-layer-group text-leaf" /> Bulk Image Upload</h3>
          <p className="text-xs text-ink2 mt-1">Drop several photos at once, then match each to a product.</p>
        </div>
        <button data-testid="bulk-toggle" onClick={() => setOpen((o) => !o)} className="text-sm font-bold text-leaf">{open ? "Hide" : "Open"}</button>
      </div>

      {open && (
        <div className="mt-4 space-y-4" data-testid="bulk-panel">
          <label className={`block border-2 border-dashed border-line rounded-2xl p-6 text-center cursor-pointer hover:border-leaf transition-colors ${busy ? "opacity-60 pointer-events-none" : ""}`}>
            <i className="fa-solid fa-cloud-arrow-up text-2xl text-leaf mb-2" />
            <p className="text-sm font-bold text-ink">{busy ? "Uploading…" : "Click to select multiple images"}</p>
            <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} data-testid="bulk-input" />
          </label>

          {items.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">{items.length} uploaded</span>
                <button onClick={autoFillEmpties} className="text-xs font-bold text-sunset" data-testid="bulk-autofill">Auto-match to products missing images</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 bg-surf border border-line rounded-xl p-3">
                    <img src={resolveImg(it.url)} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <select data-testid={`bulk-target-${i}`} className="flex-1 bg-panel border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-leaf" value={it.target} onChange={(e) => setTarget(i, e.target.value)}>
                      <option value="">— assign to product —</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button data-testid="bulk-apply" onClick={apply} className="bg-leaf text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-ink transition-colors">Match Images</button>
            </>
          )}
        </div>
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
  const [hasDraft, setHasDraft] = useState(false);
  const [ig, setIg] = useState({ connected: false, username: null, enabled: false, media_count: 0, last_synced: null });
  const [igForm, setIgForm] = useState({ ig_user_id: "", access_token: "" });

  useEffect(() => {
    if (ready && !admin) nav("/admin/login");
  }, [ready, admin, nav]);

  const refreshIg = () => api.get("/admin/instagram/status").then(({ data }) => setIg(data)).catch(() => {});

  useEffect(() => {
    if (!admin) return;
    api.get("/admin/content").then(({ data }) => { setContent(data); setHasDraft(!!data.has_unpublished); }).catch(() => {});
    api.get("/admin/enquiries").then(({ data }) => setEnquiries(data)).catch(() => {});
    api.get("/admin/settings").then(({ data }) => setWebhook(data.sheets_webhook_url || "")).catch(() => {});
    refreshIg();
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
  const bulkAssign = (assigns) =>
    setContent((c) => {
      const map = Object.fromEntries(assigns.map((a) => [a.target, a.url]));
      return { ...c, products: c.products.map((p) => (map[p.id] ? { ...p, image: map[p.id] } : p)) };
    });

  const save = async () => {
    setSaving(true);
    try {
      const { settings, has_unpublished, ...rest } = content;
      await api.put("/content", rest);
      setHasDraft(true);
      qc.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Draft saved. Preview it, then Publish to go live.");
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    try {
      const { settings, has_unpublished, ...rest } = content;
      await api.put("/content", rest); // ensure latest edits are in the draft
      await api.post("/admin/publish");
      setHasDraft(false);
      qc.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Published! Your changes are now live.");
    } catch (e) {
      toast.error("Publish failed.");
    } finally {
      setSaving(false);
    }
  };

  const discardDraft = async () => {
    setSaving(true);
    try {
      await api.post("/admin/discard");
      const { data } = await api.get("/admin/content");
      setContent(data);
      setHasDraft(false);
      toast.success("Draft discarded. Back to the live version.");
    } catch {
      toast.error("Could not discard draft.");
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

  const igConnect = async () => {
    setSaving(true);
    try {
      const { data } = await api.post("/admin/instagram/connect", igForm);
      toast.success(`Connected @${data.username}. Now click Sync.`);
      setIgForm({ ig_user_id: "", access_token: "" });
      await refreshIg();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Connection failed.");
    } finally {
      setSaving(false);
    }
  };
  const igSync = async () => {
    setSaving(true);
    try {
      const { data } = await api.post("/admin/instagram/sync");
      toast.success(`Synced ${data.synced} post(s).`);
      qc.invalidateQueries({ queryKey: ["instagram-feed"] });
      await refreshIg();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Sync failed.");
    } finally {
      setSaving(false);
    }
  };
  const igToggle = async (enabled) => {
    await api.post("/admin/instagram/toggle", { enabled }).catch(() => {});
    qc.invalidateQueries({ queryKey: ["instagram-feed"] });
    await refreshIg();
  };
  const igDisconnect = async () => {
    await api.post("/admin/instagram/disconnect").catch(() => {});
    await refreshIg();
    toast.success("Instagram disconnected.");
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
          {hasDraft && (
            <span data-testid="unpublished-badge" className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-ink bg-sun px-3 py-1.5 rounded-full">
              <i className="fa-solid fa-circle-dot" /> Unpublished changes
            </span>
          )}
          <a href="/?preview=1" target="_blank" rel="noreferrer" data-testid="admin-preview" className="text-sm text-white/80 hover:text-white font-semibold">
            <i className="fa-solid fa-eye mr-1" /> Preview
          </a>
          {hasDraft && (
            <button data-testid="admin-discard" onClick={discardDraft} disabled={saving} className="text-sm text-white/60 hover:text-white font-semibold">Discard</button>
          )}
          {tab !== "enquiries" && tab !== "settings" && tab !== "instagram" && (
            <button data-testid="admin-save" onClick={save} disabled={saving} className="bg-white/10 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/20 transition-colors disabled:opacity-60">
              {saving ? "Saving…" : "Save Draft"}
            </button>
          )}
          <button data-testid="admin-publish" onClick={publish} disabled={saving} className="bg-leaf px-5 py-2.5 rounded-full text-sm font-bold hover:bg-sunset transition-colors disabled:opacity-60">
            Publish Live
          </button>
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
              <h2 className="text-2xl font-extrabold text-ink mb-1">Hero Carousel Slides</h2>
              <p className="text-xs text-ink2 flex items-center gap-2 mb-2"><i className="fa-solid fa-grip-vertical" /> Drag the handle to reorder how slides appear in the hero.</p>
              <Reorder.Group axis="y" values={content.hero_slides} onReorder={(vals) => update("hero_slides", vals)} className="space-y-4">
                {content.hero_slides?.map((s, i) => (
                  <SortableItem key={s.id} value={s} label={`Slide ${i + 1}`}>
                    <ImgField label="Image" value={s.image} onChange={(v) => updateItem("hero_slides", i, "image", v)} testid={`hero-img-${i}`} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Txt label="Eyebrow" value={s.eyebrow} onChange={(v) => updateItem("hero_slides", i, "eyebrow", v)} />
                      <Txt label="CTA label" value={s.cta_label} onChange={(v) => updateItem("hero_slides", i, "cta_label", v)} />
                      <Txt label="Title lead" value={s.title_lead} onChange={(v) => updateItem("hero_slides", i, "title_lead", v)} />
                      <Txt label="Title accent" value={s.title_accent} onChange={(v) => updateItem("hero_slides", i, "title_accent", v)} />
                      <Txt label="CTA link" value={s.cta_link} onChange={(v) => updateItem("hero_slides", i, "cta_link", v)} />
                    </div>
                  </SortableItem>
                ))}
              </Reorder.Group>
            </section>
          )}

          {tab === "categories" && (
            <section className="space-y-4" data-testid="admin-categories">
              <h2 className="text-2xl font-extrabold text-ink mb-1">Category Cards</h2>
              <p className="text-xs text-ink2 flex items-center gap-2 mb-2"><i className="fa-solid fa-grip-vertical" /> Drag the handle to reorder the Home page category cards.</p>
              <Reorder.Group axis="y" values={content.categories} onReorder={(vals) => update("categories", vals)} className="space-y-4">
                {content.categories?.map((c, i) => (
                  <SortableItem key={c.id} value={c} label={c.title}>
                    <ImgField label="Image" value={c.image} onChange={(v) => updateItem("categories", i, "image", v)} testid={`cat-img-${i}`} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Txt label="Title" value={c.title} onChange={(v) => updateItem("categories", i, "title", v)} />
                      <Txt label="Description" value={c.desc} onChange={(v) => updateItem("categories", i, "desc", v)} />
                    </div>
                  </SortableItem>
                ))}
              </Reorder.Group>
            </section>
          )}

          {tab === "products" && (
            <section className="space-y-4" data-testid="admin-products">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-extrabold text-ink">Products ({content.products?.length})</h2>
                <button
                  data-testid="add-product"
                  onClick={() => addItem("products", { name: "New Product", category: "eco", category_label: CAT_LABELS.eco, badge: "In Stock", featured: false, desc: "", image: "" })}
                  className="bg-leaf text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-ink transition-colors"
                >
                  <i className="fa-solid fa-plus mr-2" />Add Product
                </button>
              </div>
              <BulkUpload products={content.products || []} onAssign={bulkAssign} />
              <p className="text-xs text-ink2 flex items-center gap-2"><i className="fa-solid fa-grip-vertical" /> Drag the handle to reorder. Featured products appear first on the Home page and Catalog.</p>
              <Reorder.Group axis="y" values={content.products} onReorder={(vals) => update("products", vals)} className="space-y-4">
                {content.products?.map((p, i) => (
                  <SortableItem key={p.id} value={p} label={p.category_label} onRemove={() => removeItem("products", i)} removeTestid={`remove-product-${i}`}>
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
                    <button
                      type="button"
                      data-testid={`featured-toggle-${i}`}
                      onClick={() => updateItem("products", i, "featured", !p.featured)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${p.featured ? "bg-sun text-ink" : "bg-panel text-ink2 hover:text-ink"}`}
                    >
                      <i className={`fa-${p.featured ? "solid" : "regular"} fa-star`} /> {p.featured ? "Featured" : "Mark as Featured"}
                    </button>
                  </SortableItem>
                ))}
              </Reorder.Group>
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
              <p className="text-xs text-ink2 flex items-center gap-2"><i className="fa-solid fa-grip-vertical" /> Drag the handle to reorder how products appear on the EliteCare page.</p>
              <Reorder.Group axis="y" values={content.cleaning_products} onReorder={(vals) => update("cleaning_products", vals)} className="space-y-4">
                {content.cleaning_products?.map((p, i) => (
                  <SortableItem key={p.id} value={p} label={p.category_label} onRemove={() => removeItem("cleaning_products", i)} removeTestid={`remove-cleaning-${i}`}>
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
                  </SortableItem>
                ))}
              </Reorder.Group>
            </section>
          )}

          {tab === "social" && (
            <section className="space-y-4" data-testid="admin-social">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-extrabold text-ink">Social Posts & Videos ({content.social_posts?.length})</h2>
                <button
                  data-testid="add-social"
                  onClick={() => addItem("social_posts", { platform: "instagram", image: "", video_url: "", caption: "New post", link: "https://instagram.com" })}
                  className="bg-leaf text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-ink transition-colors"
                >
                  <i className="fa-solid fa-plus mr-2" />Add Post
                </button>
              </div>
              <p className="text-sm text-ink2">These appear in the Home page social carousel (one slide at a time). Add a YouTube or Instagram <b>video/reel link</b> to auto-play it inline; otherwise the image is shown. Drag to reorder.</p>
              <Reorder.Group axis="y" values={content.social_posts} onReorder={(vals) => update("social_posts", vals)} className="space-y-4">
                {content.social_posts?.map((s, i) => (
                  <SortableItem key={s.id} value={s} label={`Post ${i + 1} · ${s.platform}`} onRemove={() => removeItem("social_posts", i)} removeTestid={`remove-social-${i}`}>
                    <ImgField label="Fallback image / thumbnail" value={s.image} onChange={(v) => updateItem("social_posts", i, "image", v)} testid={`social-img-${i}`} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-ink2 uppercase tracking-wide mb-1 block">Platform</label>
                        <select data-testid={`social-platform-${i}`} className={selCls} value={s.platform} onChange={(e) => updateItem("social_posts", i, "platform", e.target.value)}>
                          <option value="instagram">Instagram</option>
                          <option value="youtube">YouTube</option>
                        </select>
                      </div>
                      <Txt label="Profile / outbound link" value={s.link} onChange={(v) => updateItem("social_posts", i, "link", v)} />
                      <Txt label="Video / Reel link (auto-play embed)" value={s.video_url} onChange={(v) => updateItem("social_posts", i, "video_url", v)} testid={`social-video-${i}`} />
                      <div className="md:col-span-3"><Txt label="Caption" value={s.caption} onChange={(v) => updateItem("social_posts", i, "caption", v)} /></div>
                    </div>
                  </SortableItem>
                ))}
              </Reorder.Group>
            </section>
          )}

          {tab === "instagram" && (
            <section className="space-y-4 max-w-2xl" data-testid="admin-instagram">
              <h2 className="text-2xl font-extrabold text-ink mb-2">Instagram Feed Sync</h2>
              <div className="bg-surf border border-line rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${ig.connected ? "bg-leaf" : "bg-line"}`} />
                    <span className="font-bold text-ink" data-testid="ig-status">
                      {ig.connected ? `Connected as @${ig.username}` : "Not connected"}
                    </span>
                  </div>
                  {ig.connected && (
                    <button onClick={igDisconnect} className="text-xs font-bold text-sunset">Disconnect</button>
                  )}
                </div>

                {ig.connected ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-ink2">
                      <span>{ig.media_count} post(s) cached</span>
                      {ig.last_synced && <span>· last synced {new Date(ig.last_synced).toLocaleString()}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button data-testid="ig-sync" onClick={igSync} disabled={saving} className="bg-leaf text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-ink transition-colors disabled:opacity-60">
                        <i className="fa-solid fa-rotate mr-2" />{saving ? "Syncing…" : "Sync now"}
                      </button>
                      <button
                        data-testid="ig-toggle"
                        onClick={() => igToggle(!ig.enabled)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-colors ${ig.enabled ? "bg-sun text-ink" : "bg-panel text-ink2 hover:text-ink"}`}
                      >
                        <i className={`fa-${ig.enabled ? "solid" : "regular"} fa-circle-check mr-2`} />
                        {ig.enabled ? "Showing on Home" : "Show feed on Home"}
                      </button>
                    </div>
                    <p className="text-xs text-ink2">When enabled, the Home carousel shows your real Instagram posts instead of the manual ones.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-ink2">Connect your Instagram <b>Business/Creator</b> account. Paste the Instagram-scoped User ID and a long-lived Access Token from your Meta app.</p>
                    <Txt label="Instagram User ID" value={igForm.ig_user_id} onChange={(v) => setIgForm((f) => ({ ...f, ig_user_id: v }))} testid="ig-userid" />
                    <Txt label="Long-lived Access Token" value={igForm.access_token} onChange={(v) => setIgForm((f) => ({ ...f, access_token: v }))} testid="ig-token" />
                    <button data-testid="ig-connect" onClick={igConnect} disabled={saving} className="bg-leaf text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-ink transition-colors disabled:opacity-60">
                      {saving ? "Connecting…" : "Connect Instagram"}
                    </button>
                    <details className="text-xs text-ink2 mt-2">
                      <summary className="cursor-pointer font-bold">How to get these credentials</summary>
                      <ol className="list-decimal ml-5 mt-2 space-y-1">
                        <li>Convert your Instagram account to Business or Creator.</li>
                        <li>Create a Meta Business app at developers.facebook.com and add the Instagram product (API with Instagram Login).</li>
                        <li>Grant the <code>instagram_business_basic</code> permission and generate a long-lived access token.</li>
                        <li>Copy your Instagram User ID and the token here. Tokens last 60 days and auto-refresh.</li>
                      </ol>
                    </details>
                  </>
                )}
              </div>
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
