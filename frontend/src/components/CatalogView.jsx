import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { resolveImg } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import Lightbox from "@/components/Lightbox";

export default function CatalogView({ categories = [], lockCategory = false }) {
  const { addItem } = useCart();
  const [active, setActive] = useState("all");
  const [lb, setLb] = useState({ images: [], index: null });

  const cats = categories;
  const shownCats = useMemo(() => {
    if (lockCategory) return cats;
    return active === "all" ? cats : cats.filter((c) => c.id === active);
  }, [cats, active, lockCategory]);

  const openLb = (images) => setLb({ images: images?.length ? images : [], index: 0 });
  const navLb = (d) => setLb((s) => ({ ...s, index: (s.index + d + s.images.length) % s.images.length }));

  const enquire = (cat, p) => {
    addItem({
      categoryId: cat.id, category: cat.name, product: p.name,
      size: p.sizes?.[0] || "", type: p.types?.[0] || "",
      sizes: p.sizes || [], types: p.types || [], moq: p.moq || [],
      image: p.image,
    });
    toast.success(`${p.name} added to your enquiry list.`);
  };

  return (
    <>
      {!lockCategory && (
        <div className="flex flex-wrap gap-3 mb-12" data-testid="catalog-filters">
          <button onClick={() => setActive("all")} data-testid="filter-all"
            className={`px-5 py-2.5 rounded-full border font-bold text-xs uppercase tracking-widest transition-colors ${active === "all" ? "bg-leaf text-white border-leaf" : "border-line text-ink2 hover:border-leaf bg-surf"}`}>
            All Categories
          </button>
          {cats.map((c) => (
            <button key={c.id} onClick={() => setActive(c.id)} data-testid={`filter-${c.id}`}
              className={`px-5 py-2.5 rounded-full border font-bold text-xs uppercase tracking-widest transition-colors ${active === c.id ? "bg-leaf text-white border-leaf" : "border-line text-ink2 hover:border-leaf bg-surf"}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {shownCats.map((cat) => (
        <section key={cat.id} className="mb-16" data-testid={`catalog-cat-${cat.id}`}>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">{cat.name}</h2>
            <span className="text-xs font-bold text-ink2 bg-panel px-3 py-1 rounded-full">{cat.products.length} lines</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cat.products.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                className="bg-surf border border-line rounded-[1.6rem] overflow-hidden shadow-card flex flex-col" data-testid={`product-${p.id}`}>
                <button onClick={() => openLb(p.images)} className="aspect-square bg-panel overflow-hidden group relative" aria-label={`View images of ${p.name}`} data-testid={`product-image-${p.id}`}>
                  <img src={resolveImg(p.image)} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-expand" /></span>
                </button>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[10px] font-bold text-leaf uppercase tracking-widest mb-1">{cat.name}</p>
                  <h3 className="text-lg font-bold text-ink leading-tight mb-3">{p.name}</h3>
                  {p.sizes?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {p.sizes.slice(0, 6).map((s) => <span key={s} className="text-[11px] bg-panel text-ink2 px-2 py-1 rounded-md font-medium">{s}</span>)}
                      {p.sizes.length > 6 && <span className="text-[11px] text-ink2 px-1 py-1">+{p.sizes.length - 6}</span>}
                    </div>
                  )}
                  {p.types?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.types.map((t) => <span key={t} className="text-[11px] bg-sun/25 text-ink px-2 py-1 rounded-md font-semibold">{t}</span>)}
                    </div>
                  )}
                  <button onClick={() => enquire(cat, p)} data-testid={`enquire-${p.id}`}
                    className="mt-auto w-full bg-leaf text-white py-3 rounded-xl font-bold text-sm hover:bg-ink transition-colors flex items-center justify-center gap-2">
                    <i className="fa-solid fa-plus" /> Enquire
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      <Lightbox images={lb.images} index={lb.index} onClose={() => setLb({ images: [], index: null })} onNav={navLb} />
    </>
  );
}
