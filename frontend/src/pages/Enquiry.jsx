import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { api, formatApiError } from "@/lib/api";
import { useContent } from "@/hooks/useContent";
import Seo from "@/components/Seo";

const EMPTY = {
  company_name: "", contact_name: "", email: "", phone: "",
  products_offered: "", products_required: "", quantity: "",
  what: "", when: "", where: "", division: "packaging",
};

const FAQS = [
  { q: "Do you supply packaging in bulk for restaurants and hotels?", a: "Yes. We are a B2B supplier and specialise in bulk fulfilment for restaurants, cloud kitchens, caterers and hotels across Chennai. Share your monthly quantity in the enquiry form for a custom quote." },
  { q: "What is the minimum order quantity?", a: "Minimum quantities vary by product. Most food containers, eco disposables and foils are supplied by the case/carton. Tell us your requirement and we'll advise the most economical order size." },
  { q: "Do you offer eco-friendly and compostable options?", a: "Absolutely. Our eco range includes sugarcane bagasse plates and bowls, wooden cutlery, kraft paper products and corn-starch (PLA) items — all biodegradable and food-safe." },
  { q: "Which areas in Chennai do you deliver to?", a: "We deliver across Chennai including Guindy, T. Nagar, Ambattur, Anna Nagar, OMR and surrounding areas. Same-day dispatch is available for bulk orders." },
  { q: "Do you also supply cleaning and sanitization chemicals?", a: "Yes, through our EliteCare division — glass and floor cleaners, degreasers, hospital-grade disinfectants, and laundry & kitchen hygiene supplies for hospitality businesses." },
  { q: "How do I get a price quote?", a: "Fill in the enquiry form on this page with your company name, products required, quantity and the 3 W's (What, When, Where). Our team responds quickly with a customised quote." },
];

export default function Enquiry() {
  const { data } = useContent();
  const c = data?.contact || {};
  const [params] = useSearchParams();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const product = params.get("product");
    const division = params.get("division");
    setForm((f) => ({
      ...f,
      products_required: product ? product : f.products_required,
      division: division === "elitecare" ? "elitecare" : "packaging",
    }));
  }, [params]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.company_name || !form.products_required || !form.quantity || !form.what || !form.when || !form.where) {
      toast.error("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/enquiries", form);
      setDone(true);
      toast.success("Enquiry submitted! Our team will reach out shortly.");
      setForm(EMPTY);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactBlocks = [
    { icon: "fa-phone", label: "Direct Line", value: c.phone || "+91 98765 43210" },
    { icon: "fa-envelope", label: "Business Email", value: c.email || "enquiry@excelpackaging.in" },
    { icon: "fa-location-dot", label: "Chennai Hub", value: `${c.address_line1 || "Industrial Estate, Guindy,"} ${c.address_line2 || "Chennai, TN 600032"}` },
  ];

  const inputCls = "w-full bg-panel border border-line rounded-2xl px-5 py-4 text-ink placeholder:text-ink2/60 focus:outline-none focus:border-leaf focus:bg-surf transition-colors";

  const mapAddress = `Excel Packaging and Taste Foods, ${c.address_line1 || "Industrial Estate, Guindy"}, ${c.address_line2 || "Chennai, Tamil Nadu 600032"}`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="bg-bg">
      <Seo
        title="Contact & Bulk Enquiry — Get a Custom Food Packaging Quote in Chennai"
        description="Request a custom quote for bulk food packaging, eco disposables or cleaning chemicals in Chennai. Contact Excel Packaging and Taste Foods by phone, email or the enquiry form — fast response for restaurants, hotels and cloud kitchens."
        keywords="food packaging quote Chennai, bulk packaging enquiry, contact food packaging supplier Chennai, B2B packaging quote, custom packaging Chennai"
        path="/enquiry"
        jsonLd={faqLd}
      />
      <Navbar />
      <main className="pt-36 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-start">
          {/* Left: contact */}
          <div className="w-full lg:w-5/12">
            <Reveal>
              <p className="text-leaf font-bold tracking-widest uppercase text-xs mb-4">Request a Quote</p>
              <h1 className="text-5xl md:text-6xl font-extrabold text-ink mb-8 leading-[1.02] tracking-tighter">Have a requirement?<br />Let's Talk.</h1>
              <p className="text-lg text-ink2 leading-relaxed mb-12">Operating since 2019, we are Chennai's preferred partner for bulk packaging and hospitality chemicals.</p>
            </Reveal>
            <div className="space-y-8">
              {contactBlocks.map((b, i) => (
                <Reveal key={b.label} delay={i * 0.08}>
                  <div className="flex gap-5 items-center">
                    <div className="w-14 h-14 bg-panel rounded-2xl flex items-center justify-center text-leaf text-xl shrink-0"><i className={`fa-solid ${b.icon}`} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-ink2 uppercase tracking-widest mb-1">{b.label}</p>
                      <p className="text-lg font-bold text-ink">{b.value}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="w-full lg:w-7/12">
            <Reveal>
              {done ? (
                <div className="bg-surf rounded-jumbo p-10 md:p-16 border border-line shadow-card text-center" data-testid="enquiry-success">
                  <div className="w-20 h-20 bg-leaf/15 rounded-full flex items-center justify-center text-leaf text-4xl mx-auto mb-6"><i className="fa-solid fa-circle-check" /></div>
                  <h2 className="text-3xl font-bold text-ink mb-4">Enquiry Received!</h2>
                  <p className="text-ink2 mb-8">Thank you. Our team will review your requirement and get back to you with a customised quote shortly.</p>
                  <button onClick={() => setDone(false)} data-testid="enquiry-another" className="bg-ink text-white px-8 py-4 rounded-full font-bold hover:bg-sunset transition-colors">Submit Another Enquiry</button>
                </div>
              ) : (
                <form onSubmit={submit} className="bg-surf rounded-jumbo p-7 md:p-12 border border-line shadow-card" data-testid="enquiry-form">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-leaf/15 rounded-2xl flex items-center justify-center text-leaf text-2xl"><i className="fa-solid fa-clipboard-list" /></div>
                    <div>
                      <h2 className="text-2xl font-bold text-ink">Official Enquiry Form</h2>
                      <p className="text-ink2 text-sm">Fields marked * are required.</p>
                    </div>
                  </div>

                  {/* Division toggle */}
                  <div className="flex gap-2 mb-6 bg-panel p-1.5 rounded-full w-max">
                    {[["packaging", "Packaging"], ["elitecare", "EliteCare Chemicals"]].map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, division: val }))}
                        data-testid={`division-${val}`}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors ${form.division === val ? "bg-leaf text-white" : "text-ink2"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">Company / Business Name *</label>
                      <input data-testid="input-company" className={inputCls} value={form.company_name} onChange={set("company_name")} placeholder="e.g. Spice Village Restaurant" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">Contact Person</label>
                      <input data-testid="input-contact" className={inputCls} value={form.contact_name} onChange={set("contact_name")} placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">Phone</label>
                      <input data-testid="input-phone" className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+91 ..." />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">Email</label>
                      <input data-testid="input-email" type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="you@business.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">Products You Currently Offer</label>
                      <input data-testid="input-offered" className={inputCls} value={form.products_offered} onChange={set("products_offered")} placeholder="e.g. South Indian meals, biryani takeaway" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">Products Required from Excel *</label>
                      <input data-testid="input-required" className={inputCls} value={form.products_required} onChange={set("products_required")} placeholder="e.g. Sugarcane plates, PP containers" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">Quantity Required *</label>
                      <input data-testid="input-quantity" className={inputCls} value={form.quantity} onChange={set("quantity")} placeholder="e.g. 5000 units / month" />
                    </div>
                  </div>

                  <div className="mt-6 p-5 bg-panel rounded-2xl">
                    <p className="text-xs font-bold text-leaf uppercase tracking-widest mb-4">The 3 W's</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">What — exact requirement / spec *</label>
                        <textarea data-testid="input-what" rows={2} className={inputCls} value={form.what} onChange={set("what")} placeholder="Size, material, branding, lids etc." />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">When — timeline / date needed *</label>
                          <input data-testid="input-when" className={inputCls} value={form.when} onChange={set("when")} placeholder="e.g. within 2 weeks" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">Where — delivery location *</label>
                          <input data-testid="input-where" className={inputCls} value={form.where} onChange={set("where")} placeholder="Delivery area in Chennai" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    data-testid="enquiry-submit"
                    className="mt-8 w-full bg-leaf text-white py-5 rounded-2xl font-bold text-lg hover:bg-ink transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
                  >
                    {submitting ? "Submitting..." : (<>Submit Enquiry <i className="fa-solid fa-paper-plane" /></>)}
                  </button>
                  <div className="flex justify-center gap-8 mt-6 text-xs font-bold uppercase tracking-widest text-ink2/60">
                    <span className="flex items-center gap-2"><i className="fa-solid fa-bolt-lightning" /> Quick Response</span>
                    <span className="flex items-center gap-2"><i className="fa-solid fa-lock" /> Secure Submission</span>
                  </div>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </main>

      {/* Map + FAQ */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto pb-8" data-testid="map-faq">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Map */}
          <Reveal>
            <div className="bg-surf p-4 rounded-jumbo shadow-card border border-line">
              <h2 className="text-2xl font-bold text-ink px-2 pt-2 pb-4 flex items-center gap-3">
                <i className="fa-solid fa-location-dot text-leaf" /> Find Us in Chennai
              </h2>
              <iframe
                title="Excel Packaging location on Google Maps"
                src={mapSrc}
                className="w-full h-[360px] rounded-[1.8rem] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                data-testid="google-map"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-4 ml-2 text-sm font-bold text-ink hover:text-sunset transition-colors"
                data-testid="open-in-maps"
              >
                Open in Google Maps <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
              </a>
            </div>
          </Reveal>

          {/* FAQ */}
          <Reveal delay={0.1}>
            <div data-testid="faq-section">
              <p className="text-leaf font-bold tracking-widest uppercase text-xs mb-3">Questions</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-ink mb-8 tracking-tight">Frequently Asked</h2>
              <div className="space-y-3">
                {FAQS.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={i} className={`rounded-2xl border transition-colors ${open ? "border-leaf bg-leaf/10" : "border-line bg-surf"}`}>
                      <button
                        onClick={() => setOpenFaq(open ? -1 : i)}
                        data-testid={`faq-toggle-${i}`}
                        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
                        aria-expanded={open}
                      >
                        <span className="font-bold text-ink text-sm md:text-base">{f.q}</span>
                        <i className={`fa-solid fa-chevron-down text-ink2 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <p className="px-5 pb-5 text-ink2 text-sm leading-relaxed">{f.a}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
