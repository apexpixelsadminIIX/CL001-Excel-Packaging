import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProductCard({ product, index = 0, accent = "leaf" }) {
  const badgeColor = accent === "sunset" ? "bg-sunset" : "bg-leaf";
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-surf border border-line rounded-[2rem] overflow-hidden shadow-card hover:shadow-cardhover transition-shadow duration-500"
      data-testid={`product-card-${product.id}`}
    >
      <div className="aspect-square overflow-hidden relative bg-panel">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <span className={`absolute top-4 left-4 ${badgeColor} text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full`}>
          {product.category_label}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-ink leading-tight">{product.name}</h3>
        </div>
        <p className="text-xs text-ink2 leading-relaxed mb-5 min-h-[48px]">{product.desc}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-ink2 uppercase tracking-wider bg-panel px-3 py-1.5 rounded-full">{product.badge}</span>
          <Link
            to={`/enquiry?product=${encodeURIComponent(product.name)}`}
            data-testid={`product-enquire-${product.id}`}
            className="w-10 h-10 rounded-full bg-panel flex items-center justify-center text-ink hover:bg-sun transition-colors"
            aria-label={`Enquire about ${product.name}`}
          >
            <i className="fa-solid fa-plus" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
