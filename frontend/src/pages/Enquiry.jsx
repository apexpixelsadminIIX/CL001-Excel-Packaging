import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { api, formatApiError } from "@/lib/api";
import { useContent } from "@/hooks/useContent";

const EMPTY = {
  company_name: "", contact_name: "", email: "", phone: "",
  products_offered: "", products_required: "", quantity: "",
  what: "", when: "", where: "", division: "packaging",
};

export default function Enquiry() {
  const { data } = useContent();
  const c = data?.contact || {};
  const [params] = useSearchParams();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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

  return (
    <div className="bg-bg">
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
      <Footer />
    </div>
  );
}
