import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CatalogView from "@/components/CatalogView";
import { Reveal } from "@/components/Reveal";
import { useContent } from "@/hooks/useContent";
import Seo from "@/components/Seo";

const FEATURES = [
  { icon: "fa-flask-vial", title: "High Concentration", body: "Economical dilutable formulas for large-scale hospitality operations." },
  { icon: "fa-shield-virus", title: "Clinical Standards", body: "Sanitisation-grade products for food-safe environments." },
  { icon: "fa-droplet", title: "Residue Free", body: "Formulated for food-contact surfaces, leaving a clean finish." },
];

export default function Cleaning() {
  const { data } = useContent();
  const elite = (data?.catalog || []).filter((c) => c.id === "eliteclean");

  return (
    <div className="bg-bg">
      <Seo
        title="Excel EliteClean — Cleaning, Sanitization & Housekeeping Supplies Chennai"
        description="Excel EliteClean: commercial-grade cleaning chemicals, housekeeping supplies, cleaning tools and consumables for hotels, hospitals and food service in Chennai. Bulk B2B supply — enquire for a quote."
        keywords="cleaning chemicals Chennai, sanitization supplies, housekeeping chemicals, hospitality cleaning supplies, disinfectant supplier Chennai, cleaning tools B2B"
        path="/cleaning"
      />
      <Navbar />
      <header className="pt-40 pb-16 px-6 md:px-12 relative overflow-hidden" data-testid="cleaning-hero">
        <div className="absolute top-24 right-0 w-[36rem] h-[36rem] bg-leaf/15 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-leaf font-bold tracking-[0.25em] uppercase text-xs mb-6 bg-panel border border-line rounded-full px-4 py-2">
              <i className="fa-solid fa-sparkles" /> Excel EliteClean Division
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-ink mb-6 leading-[0.95] tracking-tighter">Cleaning &amp;<br /><span className="text-leaf">Hospitality Chemicals</span></h1>
            <p className="text-lg md:text-xl text-ink2 max-w-2xl leading-relaxed mb-8">Commercial-grade cleaning, sanitization and housekeeping supplies for hotels, hospitals and food service. Tap any product to view it larger and enquire for a quote.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#catalog" className="bg-leaf text-white px-8 py-4 rounded-full font-bold hover:bg-ink transition-colors">Explore Range</a>
              <Link to="/enquiry?division=elitecare" className="border border-line text-ink px-8 py-4 rounded-full font-bold hover:bg-ink hover:text-white transition-colors">Get Quote</Link>
            </div>
          </Reveal>
        </div>
      </header>

      <section className="py-14 px-6 md:px-12 border-y border-line bg-panel/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-5">
              <i className={`fa-solid ${f.icon} text-leaf text-3xl mt-1`} />
              <div><h4 className="text-ink font-bold mb-2">{f.title}</h4><p className="text-sm text-ink2 leading-relaxed">{f.body}</p></div>
            </div>
          ))}
        </div>
      </section>

      <main id="catalog" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <CatalogView categories={elite} lockCategory />
        <div className="mt-12 border-t border-line pt-16 text-center" data-testid="cleaning-cta">
          <h2 className="text-3xl md:text-5xl font-extrabold text-ink mb-6 tracking-tight">Request an EliteClean Quote</h2>
          <p className="text-ink2 text-lg mb-10 max-w-2xl mx-auto">Add the products you need and send us your requirement for a customised bulk quote.</p>
          <Link to="/enquiry?division=elitecare" className="inline-flex items-center gap-3 bg-leaf text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-ink transition-colors">Go to Enquiry <i className="fa-solid fa-clipboard-list" /></Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
