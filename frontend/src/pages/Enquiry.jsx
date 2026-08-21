import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { api, formatApiError } from "@/lib/api";
import { useContent } from "@/hooks/useContent";
import { useCart } from "@/context/CartContext";
import Seo from "@/components/Seo";

const FAQS = [
  { q: "Do you supply packaging in bulk for restaurants and hotels?", a: "Yes. We are a B2B supplier specialising in bulk fulfilment for restaurants, cloud kitchens, caterers and hotels across Chennai." },
  { q: "How do I get a price quote?", a: "Add the products you need to your enquiry list, then fill this form with quantities and the 3 W's. Our team responds quickly with a customised quote." },
  { q: "Do you offer eco-friendly and compostable options?", a: "Absolutely — sugarcane plates and bowls, wooden cutlery, kraft paper products and corn-starch (PLA) items, all food-safe." },
  { q: "Which areas in Chennai do you deliver to?", a: "Across Chennai including Guindy, T. Nagar, Ambattur, Anna Nagar, OMR and nearby areas. Same-day dispatch for bulk orders." },
  { q: "Do you also supply cleaning and sanitization chemicals?", a: "Yes, through our Excel EliteClean range — cleaners, degreasers, disinfectants, and housekeeping supplies." },
];

const inputCls = "w-full bg-panel border border-line rounded-2xl px-5 py-4 text-ink placeholder:text-ink2/60 focus:outline-none focus:border-leaf focus:bg-surf transition-colors";
const selCls = "w-full bg-panel border border-line rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-leaf";

export default function Enquiry() {
  const { data } = useContent();
  const c = data?.contact || {};
  const catalog = data?.catalog || [];
  const { items, addItem, removeItem, updateItem, clear } = useCart();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ company_name: "", contact_name: "", email: "", phone: "", division: "packaging", what: "", when: "", where: "", remarks: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  // Add-product selector
  const [selCat, setSelCat] = useState("");
  const [selProd, setSelProd] = useState("");
  useEffect(() => { setSelProd(""); }, [selCat]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const catObj = catalog.find((x) => x.id === selCat);
  const prodObj = catObj?.products.find((p) => p.id === selProd);

  const addSelected = () => {
    if (!catObj || !prodObj) return toast.error("Choose a category and product.");
    addItem({ categoryId: catObj.id, category: catObj.name, product: prodObj.name, size: prodObj.sizes?.[0] || "", type: prodObj.types?.[0] || "", sizes: prodObj.sizes || [], types: prodObj.types || [], moq: prodObj.moq || [], image: prodObj.image });
    toast.success(`${prodObj.name} added.`);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.company_name) return toast.error("Company name is required.");
    if (items.length === 0) return toast.error("Add at least one product to your enquiry.");
    if (!form.what || !form.when || !form.where) return toast.error("Please fill the 3 W's (What, When, Where).");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: items.map((it) => ({ category: it.category, product: it.product, size: it.size, type: it.type, quantity: it.quantity })),
      };
      await api.post("/enquiries", payload);
      setDone(true);
      clear();
      toast.success("Enquiry submitted! Our team will reach out shortly.");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactBlocks = [
    { icon: "fa-phone", label: "Direct Line", value: c.phone || "+91 98417 35178" },
    { icon: "fa-envelope", label: "Business Email", value: c.email || "exlpackaging@gmail.com" },
    { icon: "fa-location-dot", label: "Chennai Hub", value: `${c.address_line1 || "No 4, 38, Ganapathy Nagar 2nd St, Ekkatuthangal, Chennai, Tamil Nadu 600032"} ${c.address_line2 || ""}`.trim() },
  ];
  const mapAddress = `Excel Packaging and Taste Foods, ${[c.address_line1 || "No 4, 38, Ganapathy Nagar 2nd St, Ekkatuthangal, Chennai, Tamil Nadu 600032", c.address_line2].filter(Boolean).join(", ")}`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`;
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  return (
    <div className="bg-bg">
      <Seo title="Contact & Bulk Enquiry — Get a Custom Quote in Chennai"
        description="Request a custom quote for bulk food packaging, eco disposables or cleaning chemicals in Chennai. Build your product list and send your requirement — fast response for restaurants, hotels and cloud kitchens."
        keywords="food packaging quote Chennai, bulk packaging enquiry, B2B packaging quote, custom packaging Chennai"
        path="/enquiry" jsonLd={faqLd} />
      <Navbar />
      <main className="pt-36 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-14 items-start">
          {/* Left contact */}
          <div className="w-full lg:w-4/12">
            <Reveal>
              <p className="text-leaf font-bold tracking-widest uppercase text-xs mb-4">Request a Quote</p>
              <h1 className="text-5xl md:text-6xl font-extrabold text-ink mb-8 leading-[1.02] tracking-tighter">Build your<br />enquiry list.</h1>
              <p className="text-lg text-ink2 leading-relaxed mb-10">Chennai's preferred B2B partner for bulk packaging and hospitality supplies since 2019.</p>
            </Reveal>
            <div className="space-y-6">
              {contactBlocks.map((b) => (
                <div key={b.label} className="flex gap-5 items-center">
                  <div className="w-14 h-14 bg-panel rounded-2xl flex items-center justify-center text-leaf text-xl shrink-0"><i className={`fa-solid ${b.icon}`} /></div>
                  <div><p className="text-[10px] font-bold text-ink2 uppercase tracking-widest mb-1">{b.label}</p><p className="text-lg font-bold text-ink">{b.value}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right form */}
          <div className="w-full lg:w-8/12">
            {done ? (
              <div className="bg-surf rounded-jumbo p-10 md:p-16 border border-line shadow-card text-center" data-testid="enquiry-success">
                <div className="w-20 h-20 bg-leaf/15 rounded-full flex items-center justify-center text-leaf text-4xl mx-auto mb-6"><i className="fa-solid fa-circle-check" /></div>
                <h2 className="text-3xl font-bold text-ink mb-4">Enquiry Received!</h2>
                <p className="text-ink2 mb-8">Thank you. Our team will review your product list and get back to you with a customised quote shortly.</p>
                <button onClick={() => setDone(false)} data-testid="enquiry-another" className="bg-ink text-white px-8 py-4 rounded-full font-bold hover:bg-sunset transition-colors">Submit Another Enquiry</button>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-surf rounded-jumbo p-7 md:p-10 border border-line shadow-card" data-testid="enquiry-form">
                <h2 className="text-2xl font-bold text-ink mb-1">Enquiry Form</h2>
                <p className="text-ink2 text-sm mb-6">No pricing — just your requirement. Fields marked * are required.</p>

                {/* Add product */}
                <div className="bg-panel rounded-2xl p-4 mb-6" data-testid="add-product-panel">
                  <p className="text-xs font-bold text-leaf uppercase tracking-widest mb-3">Add a product</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select data-testid="add-category" className={selCls} value={selCat} onChange={(e) => setSelCat(e.target.value)}>
                      <option value="">Category…</option>
                      {catalog.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <select data-testid="add-product-select" className={selCls} value={selProd} onChange={(e) => setSelProd(e.target.value)} disabled={!catObj}>
                      <option value="">Product…</option>
                      {catObj?.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button type="button" onClick={addSelected} data-testid="add-product-btn" className="bg-ink text-white rounded-xl px-4 py-3 text-sm font-bold hover:bg-leaf transition-colors">+ Add to list</button>
                  </div>
                </div>

                {/* Line items */}
                <div className="mb-6" data-testid="enquiry-items">
                  <p className="text-xs font-bold text-ink2 uppercase tracking-widest mb-3">Your products ({items.length})</p>
                  {items.length === 0 && <p className="text-sm text-ink2 bg-panel rounded-xl p-4">No products yet — add from the E-Catalog or the selector above.</p>}
                  <div className="space-y-3">
                    {items.map((it) => (
                      <div key={it.uid} className="border border-line rounded-2xl p-4" data-testid={`line-${it.uid}`}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div><p className="font-bold text-ink text-sm">{it.product}</p><p className="text-[11px] text-ink2 uppercase tracking-wider">{it.category}</p></div>
                          <button type="button" onClick={() => removeItem(it.uid)} data-testid={`remove-line-${it.uid}`} aria-label="Remove" className="text-sunset hover:bg-sunset hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"><i className="fa-solid fa-trash-can text-sm" /></button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {it.sizes?.length > 0 && (
                            <select className={selCls} value={it.size} onChange={(e) => updateItem(it.uid, { size: e.target.value })} data-testid={`size-${it.uid}`}>
                              {it.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          )}
                          {it.types?.length > 0 && (
                            <select className={selCls} value={it.type} onChange={(e) => updateItem(it.uid, { type: e.target.value })} data-testid={`type-${it.uid}`}>
                              {it.types.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          )}
                          <input className={selCls} placeholder="Quantity *" value={it.quantity} onChange={(e) => updateItem(it.uid, { quantity: e.target.value })} data-testid={`qty-${it.uid}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business line */}
                <div className="flex gap-2 mb-6 bg-panel p-1.5 rounded-full w-max">
                  {[["packaging", "Packaging"], ["elitecare", "EliteClean Chemicals"]].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setForm((f) => ({ ...f, division: val }))} data-testid={`division-${val}`}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors ${form.division === val ? "bg-leaf text-white" : "text-ink2"}`}>{label}</button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className="text-xs font-bold text-ink2 uppercase mb-2 block">Company / Business Name *</label><input data-testid="input-company" className={inputCls} value={form.company_name} onChange={set("company_name")} placeholder="e.g. Spice Village Restaurant" /></div>
                  <div><label className="text-xs font-bold text-ink2 uppercase mb-2 block">Contact Person</label><input data-testid="input-contact" className={inputCls} value={form.contact_name} onChange={set("contact_name")} placeholder="Your name" /></div>
                  <div><label className="text-xs font-bold text-ink2 uppercase mb-2 block">Phone</label><input data-testid="input-phone" className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+91 ..." /></div>
                  <div className="md:col-span-2"><label className="text-xs font-bold text-ink2 uppercase mb-2 block">Email</label><input data-testid="input-email" type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="you@business.com" /></div>
                </div>

                <div className="mt-6 p-5 bg-panel rounded-2xl">
                  <p className="text-xs font-bold text-leaf uppercase tracking-widest mb-4">The 3 W's</p>
                  <div className="space-y-4">
                    <div><label className="text-xs font-bold text-ink2 uppercase mb-2 block">What — exact requirement *</label><textarea data-testid="input-what" rows={2} className={inputCls} value={form.what} onChange={set("what")} placeholder="Branding, lids, special specs etc." /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-ink2 uppercase mb-2 block">When — timeline *</label><input data-testid="input-when" className={inputCls} value={form.when} onChange={set("when")} placeholder="e.g. within 2 weeks" /></div>
                      <div><label className="text-xs font-bold text-ink2 uppercase mb-2 block">Where — delivery location *</label><input data-testid="input-where" className={inputCls} value={form.where} onChange={set("where")} placeholder="Delivery area in Chennai" /></div>
                    </div>
                    <div><label className="text-xs font-bold text-ink2 uppercase mb-2 block">Remarks</label><input data-testid="input-remarks" className={inputCls} value={form.remarks} onChange={set("remarks")} placeholder="Anything else we should know" /></div>
                  </div>
                </div>

                <button type="submit" disabled={submitting} data-testid="enquiry-submit"
                  className="mt-8 w-full bg-leaf text-white py-5 rounded-2xl font-bold text-lg hover:bg-ink transition-colors disabled:opacity-60 flex items-center justify-center gap-3">
                  {submitting ? "Submitting..." : (<>Submit Enquiry <i className="fa-solid fa-paper-plane" /></>)}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Map + FAQ */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto pb-8" data-testid="map-faq">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="bg-surf p-4 rounded-jumbo shadow-card border border-line">
            <h2 className="text-2xl font-bold text-ink px-2 pt-2 pb-4 flex items-center gap-3"><i className="fa-solid fa-location-dot text-leaf" /> Find Us in Chennai</h2>
            <iframe title="Excel Packaging location" src={mapSrc} className="w-full h-[340px] rounded-[1.8rem] border-0" loading="lazy" data-testid="google-map" />
          </div>
          <div data-testid="faq-section">
            <p className="text-leaf font-bold tracking-widest uppercase text-xs mb-3">Questions</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink mb-8 tracking-tight">Frequently Asked</h2>
            <div className="space-y-3">
              {FAQS.map((f, i) => {
                const o = openFaq === i;
                return (
                  <div key={i} className={`rounded-2xl border transition-colors ${o ? "border-leaf bg-leaf/10" : "border-line bg-surf"}`}>
                    <button onClick={() => setOpenFaq(o ? -1 : i)} data-testid={`faq-toggle-${i}`} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"><span className="font-bold text-ink text-sm md:text-base">{f.q}</span><i className={`fa-solid fa-chevron-down text-ink2 transition-transform ${o ? "rotate-180" : ""}`} /></button>
                    <div className={`grid transition-all duration-300 ${o ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><div className="overflow-hidden"><p className="px-5 pb-5 text-ink2 text-sm leading-relaxed">{f.a}</p></div></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
