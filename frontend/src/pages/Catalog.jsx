import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { useContent, sortByPriority } from "@/hooks/useContent";
import Seo from "@/components/Seo";

export default function Catalog() {
  const { data } = useContent();
  const [params, setParams] = useSearchParams();
  const [active, setActive] = useState(params.get("cat") || "all");

  useEffect(() => {
    setActive(params.get("cat") || "all");
  }, [params]);

  const filters = data?.catalog_filters || [];
  const products = data?.products || [];

  const shown = useMemo(() => {
    const sorted = sortByPriority(products);
    return active === "all" ? sorted : sorted.filter((p) => p.category === active);
  }, [products, active]);

  const setCat = (id) => {
    setActive(id);
    if (id === "all") setParams({});
    else setParams({ cat: id });
  };

  return (
    <div className="bg-bg">
      <Seo
        title="E-Catalog — Food Containers, Eco Disposables, Paper, Foil & PLA"
        description="Browse Excel Packaging's full e-catalog: eco-friendly sugarcane disposables, PP & PET food containers, kraft paper boxes & cups, aluminium foil containers and corn-starch (PLA) products. Bulk B2B supply across Chennai."
        keywords="food containers Chennai, eco friendly disposables, sugarcane bagasse plates, PP containers, PET boxes, kraft paper boxes, aluminium foil containers, corn starch PLA products, wraps and foils, bulk food packaging Chennai"
        path="/catalog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Excel Packaging E-Catalog",
          itemListElement: shown.slice(0, 30).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: p.name,
              description: p.desc,
              image: (p.image || "").startsWith("/api/") ? undefined : p.image,
              category: p.category_label,
              brand: { "@type": "Brand", name: "Excel Packaging and Taste Foods" },
              offers: {
                "@type": "Offer",
                availability: "https://schema.org/InStock",
                priceCurrency: "INR",
                price: "0",
                priceValidUntil: "2027-12-31",
                seller: { "@type": "Organization", name: "Excel Packaging and Taste Foods" },
              },
            },
          })),
        }}
      />
      <Navbar />

      {/* Hero */}
      <header className="pt-40 pb-16 px-6 md:px-12 bg-panel rounded-b-jumbo" data-testid="catalog-hero">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-leaf font-bold tracking-widest uppercase text-xs mb-4">Official Product Guide</p>
            <h1 className="text-4xl md:text-7xl font-extrabold text-ink mb-6 tracking-tighter">Disposables E-Catalog</h1>
            <p className="text-lg md:text-xl text-ink2 max-w-2xl leading-relaxed">
              Chennai's comprehensive B2B supply of food-grade containers, an eco-friendly range, and paper &amp; foil solutions — sorted eco-first.
            </p>
          </Reveal>
        </div>
      </header>

      <main className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-14" data-testid="catalog-filters">
          <button
            onClick={() => setCat("all")}
            data-testid="filter-all"
            className={`px-6 py-3 rounded-full border font-bold text-xs uppercase tracking-widest transition-colors ${active === "all" ? "bg-leaf text-white border-leaf" : "border-line text-ink2 hover:border-leaf bg-surf"}`}
          >
            All Products
          </button>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setCat(f.id)}
              data-testid={`filter-${f.id}`}
              className={`px-6 py-3 rounded-full border font-bold text-xs uppercase tracking-widest transition-colors ${active === f.id ? "bg-leaf text-white border-leaf" : "border-line text-ink2 hover:border-leaf bg-surf"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8" data-testid="product-grid">
          {shown.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-24 bg-ink rounded-jumbo p-10 md:p-20 text-center relative overflow-hidden" data-testid="catalog-cta">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Need a Custom Quote?</h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">We specialise in bulk fulfilment for restaurants and hotel chains in Chennai. Contact us for customised quotes and logistics.</p>
            <Link to="/enquiry" className="inline-flex items-center gap-3 bg-sun text-ink px-10 py-5 rounded-full font-bold text-lg hover:bg-sunset hover:text-white transition-colors">
              Get Custom Quote <i className="fa-solid fa-paper-plane" />
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
