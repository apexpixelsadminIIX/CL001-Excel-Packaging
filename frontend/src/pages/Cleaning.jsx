import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { useContent } from "@/hooks/useContent";
import Seo from "@/components/Seo";
import { resolveImg } from "@/lib/api";

// Self-contained "Cleaning & Hospitality Chemicals" (EliteCare) page.
// Kept modular so it can later be spun off into a standalone site/subdomain.

const FEATURES = [
  { icon: "fa-flask-vial", title: "High Concentration", body: "Economical dilutable formulas designed for large-scale hospitality operations." },
  { icon: "fa-shield-virus", title: "Clinical Standards", body: "Hospital-grade disinfectants that kill 99.9% of food-borne pathogens and viruses." },
  { icon: "fa-droplet", title: "Residue Free", body: "Formulated for food-contact surfaces, leaving a crystal-clear finish every time." },
];

export default function Cleaning() {
  const { data } = useContent();
  const [active, setActive] = useState("all");
  const filters = data?.cleaning_filters || [];
  const products = data?.cleaning_products || [];

  const shown = useMemo(
    () => (active === "all" ? products : products.filter((p) => p.category === active)),
    [products, active]
  );

  return (
    <div className="bg-bg">
      <Seo
        title="Cleaning & Hospitality Chemicals — Sanitization & Housekeeping Supplies Chennai"
        description="Excel EliteCare: commercial-grade cleaning and sanitization chemicals for hotels, hospitals and food service in Chennai. Glass & floor cleaners, heavy-duty degreasers, hospital-grade disinfectants, laundry and kitchen hygiene supplies — bulk B2B supply."
        keywords="cleaning chemicals Chennai, sanitization supplies, housekeeping chemicals, hospitality cleaning supplies, disinfectant supplier Chennai, floor cleaner concentrate, degreaser, kitchen hygiene chemicals, laundry chemicals B2B"
        path="/cleaning"
      />
      <Navbar />

      {/* Hero */}
      <header className="pt-40 pb-20 px-6 md:px-12 relative overflow-hidden" data-testid="cleaning-hero">
        <div className="absolute top-24 right-0 w-[36rem] h-[36rem] bg-leaf/15 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-leaf font-bold tracking-[0.25em] uppercase text-xs mb-6 bg-panel border border-line rounded-full px-4 py-2">
                <i className="fa-solid fa-sparkles" /> Excel EliteCare Division
              </span>
            </Reveal>
            <h1 className="text-5xl md:text-7xl font-extrabold text-ink mb-4 leading-[0.95] tracking-tighter">
              <span className="block overflow-hidden"><motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>Cleaning &amp;</motion.span></span>
              <span className="block overflow-hidden"><motion.span className="block text-leaf" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>Hospitality Chemicals</motion.span></span>
            </h1>
            <Reveal delay={0.3}>
              <p className="text-lg md:text-xl text-ink2 max-w-lg leading-relaxed mb-9">
                Commercial-grade cleaning solutions for hotels, hospitals, and food service. High-concentration formulas for maximum efficiency and superior sanitisation standards.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#catalog" className="bg-leaf text-white px-8 py-4 rounded-full font-bold hover:bg-ink transition-colors">Explore Formulas</a>
                <Link to="/enquiry?division=elitecare" className="border border-line text-ink px-8 py-4 rounded-full font-bold hover:bg-ink hover:text-white transition-colors">Get Quote</Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <div className="bg-surf p-4 rounded-jumbo shadow-card">
              <img src={resolveImg(data?.categories?.find((c) => c.id === "clean")?.image)} alt="Professional cleaning chemicals" className="rounded-[2.4rem] w-full aspect-[4/3] object-cover" />
            </div>
          </Reveal>
        </div>
      </header>

      {/* Features */}
      <section className="py-16 px-6 md:px-12 border-y border-line bg-panel/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="flex gap-5">
                <i className={`fa-solid ${f.icon} text-leaf text-3xl mt-1`} />
                <div>
                  <h4 className="text-ink font-bold mb-2">{f.title}</h4>
                  <p className="text-sm text-ink2 leading-relaxed">{f.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <main id="catalog" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-14" data-testid="cleaning-filters">
          <button
            onClick={() => setActive("all")}
            data-testid="clean-filter-all"
            className={`px-6 py-3 rounded-full border font-bold text-xs uppercase tracking-widest transition-colors ${active === "all" ? "bg-leaf text-white border-leaf" : "border-line text-ink2 hover:border-leaf bg-surf"}`}
          >
            All Chemicals
          </button>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              data-testid={`clean-filter-${f.id}`}
              className={`px-6 py-3 rounded-full border font-bold text-xs uppercase tracking-widest transition-colors ${active === f.id ? "bg-leaf text-white border-leaf" : "border-line text-ink2 hover:border-leaf bg-surf"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="cleaning-grid">
          {shown.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-surf border border-line rounded-jumbo p-6 group hover:border-leaf transition-colors shadow-card"
              data-testid={`cleaning-card-${p.id}`}
            >
              <div className="aspect-video rounded-[1.4rem] overflow-hidden mb-7 relative bg-panel">
                <img src={resolveImg(p.image)} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-4 left-4 bg-leaf text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">{p.category_label}</span>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-3">{p.name}</h3>
              <p className="text-ink2 text-sm leading-relaxed mb-7 min-h-[60px]">{p.desc}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-sunset uppercase tracking-widest">{p.tag}</span>
                <Link to={`/enquiry?division=elitecare&product=${encodeURIComponent(p.name)}`} className="w-12 h-12 bg-panel rounded-full flex items-center justify-center text-ink hover:bg-leaf hover:text-white transition-colors" aria-label={`Enquire about ${p.name}`}>
                  <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Audit CTA */}
        <div className="mt-28 border-t border-line pt-20 text-center" data-testid="cleaning-cta">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-extrabold text-ink mb-6 tracking-tight">Request an EliteCare Audit</h2>
            <p className="text-ink2 text-lg mb-10 max-w-2xl mx-auto">Our specialists can assess your hygiene needs and suggest the perfect chemical mix for your specific facility requirements.</p>
            <Link to="/enquiry?division=elitecare" className="inline-flex items-center gap-3 bg-leaf text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-ink transition-colors">
              Start Consultation <i className="fa-solid fa-clipboard-check" />
            </Link>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
