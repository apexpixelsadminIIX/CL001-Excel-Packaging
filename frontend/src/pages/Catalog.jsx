import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CatalogView from "@/components/CatalogView";
import { Reveal } from "@/components/Reveal";
import { useContent } from "@/hooks/useContent";
import Seo from "@/components/Seo";

export default function Catalog() {
  const { data } = useContent();
  const catalog = (data?.catalog || []).filter((c) => c.id !== "eliteclean");

  return (
    <div className="bg-bg">
      <Seo
        title="E-Catalog — Food Containers, Eco Disposables, Beverage, Foil & More"
        description="Browse Excel Packaging's full B2B e-catalog: plastic & eco-friendly food containers, disposable cutlery, beverage packaging, napkins, general supplies and custom branding. Bulk supply across Chennai — enquire for a quote."
        keywords="food containers Chennai, eco friendly disposables, beverage packaging, paper cups, napkins, aluminium foil, disposable cutlery, custom branded packaging, bulk food packaging Chennai"
        path="/catalog"
      />
      <Navbar />
      <header className="pt-40 pb-16 px-6 md:px-12 bg-panel rounded-b-jumbo" data-testid="catalog-hero">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-leaf font-bold tracking-widest uppercase text-xs mb-4">Official Product Guide</p>
            <h1 className="text-4xl md:text-7xl font-extrabold text-ink mb-6 tracking-tighter">Product E-Catalog</h1>
            <p className="text-lg md:text-xl text-ink2 max-w-2xl leading-relaxed">
              Explore our full B2B range across 8 categories. Tap any product image to view it larger, and hit <b>Enquire</b> to build your quote list — no pricing, just a fast custom quote.
            </p>
          </Reveal>
        </div>
      </header>

      <main className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
        <CatalogView categories={catalog} />

        <div className="mt-16 bg-ink rounded-jumbo p-10 md:p-20 text-center relative overflow-hidden" data-testid="catalog-cta">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to Enquire?</h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">Add the products you need, then head to the enquiry form to send us your requirement with sizes and quantities.</p>
            <Link to="/enquiry" className="inline-flex items-center gap-3 bg-sun text-ink px-10 py-5 rounded-full font-bold text-lg hover:bg-sunset hover:text-white transition-colors">
              Go to Enquiry <i className="fa-solid fa-clipboard-list" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-leaf/20 rounded-full blur-3xl -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sunset/20 rounded-full blur-3xl -ml-40 -mb-40" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
