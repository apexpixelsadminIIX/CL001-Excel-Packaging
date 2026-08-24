import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import Marquee from "@/components/Marquee";
import SocialCarousel from "@/components/SocialCarousel";
import { Reveal } from "@/components/Reveal";
import { useContent, useInstagramFeed } from "@/hooks/useContent";
import { resolveImg } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";

const WHY = [
  { icon: "fa-award", title: "Quality Standards", body: "100% food-grade materials ensuring maximum safety for consumers.", bg: "bg-leaf/20", ic: "bg-leaf text-white" },
  { icon: "fa-hand-sparkles", title: "Hygiene-First", body: "Rigorous handling protocols to maintain zero-contamination standards.", bg: "bg-sun/25", ic: "bg-sun text-ink" },
  { icon: "fa-seedling", title: "Eco-Conscious", body: "Comprehensive range of biodegradable disposables for modern brands.", bg: "bg-pistachio/50", ic: "bg-leaf text-white" },
  { icon: "fa-truck-fast", title: "Fast Delivery", body: "Optimised bulk fulfilment network for quick local turnaround in Chennai.", bg: "bg-sunset/15", ic: "bg-sunset text-white" },
];

export default function Home() {
  const { data } = useContent();
  const slides = data?.hero_slides || [];
  const story = data?.story || {};
  const catalog = data?.catalog || [];
  const categories = catalog.length
    ? catalog.slice(0, 8).map((c) => ({
        id: c.id, title: c.name, desc: c.desc || `${c.products?.length || 0} product lines`,
        image: c.image, link: c.id === "eliteclean" ? "/cleaning" : `/catalog`,
        highlight: c.id === "eliteclean",
      }))
    : [];
  const testimonials = data?.testimonials || [];
  const manualSocial = data?.social_posts || [];
  const igEnabled = !!data?.instagram_enabled;
  const { data: igFeed } = useInstagramFeed(igEnabled);
  const social = igEnabled && igFeed && igFeed.length > 0 ? igFeed : manualSocial;
  const featured = catalog
    .filter((cat) => cat.id !== "eliteclean")
    .flatMap((cat) => (cat.products || []).map((p) => ({ ...p, category_label: cat.name })))
    .filter((p) => p.featured)
    .slice(0, 4);

  const c = data?.contact || {};
  const businessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Excel Packaging and Taste Foods",
    image: "/assets/759ad57b24c38f65.jpeg",
    description: "Chennai-based B2B supplier of food-grade packaging, eco-friendly disposables, aluminium foil products, and cleaning & hospitality chemicals.",
    url: typeof window !== "undefined" ? window.location.origin : "",
    telephone: c.phone || "+91 98765 43210",
    email: c.email || "enquiry@excelpackaging.in",
    address: {
      "@type": "PostalAddress",
      streetAddress: c.address_line1 || "Industrial Estate, Guindy",
      addressLocality: "Chennai",
      addressRegion: "Tamil Nadu",
      postalCode: "600032",
      addressCountry: "IN",
    },
    areaServed: "Chennai, Tamil Nadu",
    priceRange: "₹₹",
    foundingDate: "2019",
    sameAs: [c.instagram, c.linkedin, c.facebook].filter(Boolean),
  };

  return (
    <div className="bg-bg">
      <Seo
        title="B2B Food Packaging, Eco Disposables & Cleaning Supplies in Chennai"
        description="Excel Packaging and Taste Foods — Chennai's trusted B2B supplier of food-safe containers, eco-friendly disposables, sugarcane bagasse products, wraps & aluminium foils, and cleaning & sanitization chemicals. Bulk packaging for restaurants, cloud kitchens & hotels since 2019."
        keywords="food packaging Chennai, chennai food packaging, eco friendly packaging, food safe packaging, wraps and foils, aluminium foil containers, bulk packaging for food products, B2B food packaging, food containers Chennai, biodegradable disposables, sugarcane bagasse plates, cleaning chemicals, sanitization supplies, hospitality chemicals Chennai"
        path="/"
        jsonLd={businessLd}
      />
      <Navbar />
      <HeroCarousel slides={slides} />

      {/* Marquee */}
      <section className="py-2 bg-pistachio/40 border-y border-line">
        <Marquee items={["Food Containers", "Eco Disposables", "Foil Products", "Hygiene Chemicals", "Bulk Supply", "Since 2019"]} />
      </section>

      {/* Our Story */}
      <section className="py-24 md:py-32 px-6 md:px-12 overflow-hidden" data-testid="story-section">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <Reveal className="relative">
            <div className="absolute -top-10 -left-10 w-56 h-56 bg-pistachio/50 rounded-full blur-3xl z-0" />
            <div className="relative z-10 bg-surf p-4 rounded-jumbo shadow-card">
              <img src={resolveImg(story.image)} alt="Excel Packaging warehouse" className="rounded-[2.4rem] w-full aspect-[4/5] object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-4 md:-right-8 bg-leaf p-8 md:p-10 rounded-[2rem] shadow-cardhover z-20 text-white">
              <p className="text-4xl md:text-5xl font-extrabold">{story.established || "2019"}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest mt-1">Established</p>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="text-leaf font-bold tracking-[0.2em] uppercase mb-5 text-sm">{story.eyebrow || "Our Journey"}</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-ink mb-7 leading-[1.02] tracking-tight">
                {story.heading}
              </h2>
              <p className="text-lg text-ink2 leading-relaxed mb-9">{story.body}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <h4 className="text-3xl font-extrabold text-ink mb-1">{story.stat1_value}</h4>
                  <p className="text-xs text-ink2 font-semibold uppercase tracking-wider">{story.stat1_label}</p>
                </div>
                <div>
                  <h4 className="text-3xl font-extrabold text-ink mb-1">{story.stat2_value}</h4>
                  <p className="text-xs text-ink2 font-semibold uppercase tracking-wider">{story.stat2_label}</p>
                </div>
              </div>
              <Link to="/about" data-testid="story-read-more" className="inline-flex items-center gap-3 text-ink font-bold group">
                Read Our Full Story
                <span className="w-11 h-11 rounded-full border border-line flex items-center justify-center group-hover:bg-sunset group-hover:text-white group-hover:border-sunset transition-colors">
                  <i className="fa-solid fa-arrow-right" />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Core Categories */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-panel rounded-jumbo mx-3 md:mx-4" data-testid="categories-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <Reveal>
              <p className="text-leaf font-bold tracking-[0.2em] uppercase mb-4 text-sm">Inventory Highlights</p>
              <h2 className="text-4xl md:text-6xl font-extrabold text-ink tracking-tight">Core Categories</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Link to="/catalog" data-testid="view-ecatalog" className="bg-sunset text-white px-8 py-4 rounded-full font-bold shadow-card hover:bg-ink transition-colors inline-flex items-center gap-3">
                View E-Catalog <i className="fa-solid fa-file-lines" />
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={cat.link}
                  data-testid={`category-${cat.id}`}
                  className={`block rounded-[2.2rem] p-6 h-full transition-transform duration-500 hover:-translate-y-2 ${cat.highlight ? "bg-ink" : "bg-surf shadow-card hover:shadow-cardhover"}`}
                >
                  <div className="aspect-square rounded-[1.6rem] overflow-hidden mb-6 bg-panel">
                    <img src={resolveImg(cat.image)} alt={cat.title} className="w-full h-full object-cover" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${cat.highlight ? "text-white" : "text-ink"}`}>{cat.title}</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${cat.highlight ? "text-white/60" : "text-ink2"}`}>{cat.desc}</p>
                  <span className={`text-xs font-bold uppercase tracking-widest ${cat.highlight ? "text-sun" : "text-sunset"}`}>
                    {cat.highlight ? "Visit EliteCare" : "Explore"} <i className="fa-solid fa-arrow-right ml-1" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 bg-sun/15 rounded-jumbo mx-3 md:mx-4" data-testid="featured-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
              <Reveal>
                <p className="text-sunset font-bold tracking-[0.2em] uppercase mb-4 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-star" /> Featured Picks
                </p>
                <h2 className="text-4xl md:text-6xl font-extrabold text-ink tracking-tight">This Season's Best</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <Link to="/catalog" data-testid="featured-view-all" className="inline-flex items-center gap-3 text-ink font-bold group">
                  View All Products
                  <span className="w-11 h-11 rounded-full border border-line flex items-center justify-center group-hover:bg-sunset group-hover:text-white group-hover:border-sunset transition-colors">
                    <i className="fa-solid fa-arrow-right" />
                  </span>
                </Link>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} accent="sunset" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Partner */}
      <section className="py-24 md:py-32 px-6 md:px-12" data-testid="why-section">
        <div className="max-w-3xl mb-16">
          <Reveal>
            <p className="text-leaf font-bold tracking-[0.2em] uppercase mb-4 text-sm">Value Proposition</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-ink tracking-tight">Why Partner With Us?</h2>
          </Reveal>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.08}>
              <div className={`${w.bg} p-8 rounded-[2rem] border border-line/50 hover:-translate-y-1 transition-transform duration-300 h-full`}>
                <div className={`w-14 h-14 ${w.ic} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-card`}>
                  <i className={`fa-solid ${w.icon}`} />
                </div>
                <h4 className="text-xl font-bold text-ink mb-3">{w.title}</h4>
                <p className="text-ink2 text-sm leading-relaxed">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Social Media */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-pistachio/30 rounded-jumbo mx-3 md:mx-4" data-testid="social-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
            <Reveal>
              <p className="text-sunset font-bold tracking-[0.2em] uppercase mb-4 text-sm">@excelpackaging</p>
              <h2 className="text-4xl md:text-6xl font-extrabold text-ink tracking-tight">Follow Our Journey</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex gap-3">
                <a href={data?.contact?.instagram || "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-full font-bold hover:bg-sunset transition-colors">
                  <i className="fa-brands fa-instagram" /> Instagram
                </a>
              </div>
            </Reveal>
          </div>
          <SocialCarousel posts={social} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 px-6 md:px-12" data-testid="testimonials-section">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-14 text-ink tracking-tight max-w-2xl">What Our Partners Say</h2>
        </Reveal>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.1}>
              <div className={`p-9 rounded-[2rem] shadow-card border-t-4 h-full flex flex-col ${["bg-leaf/15 border-leaf", "bg-sunset/10 border-sunset", "bg-pistachio/40 border-leaf"][i % 3]}`}>
                <i className="fa-solid fa-quote-left text-sunset text-3xl mb-5" />
                <p className="text-ink text-lg mb-7 leading-relaxed font-medium flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-4 border-t border-ink/10 pt-6">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
                  <div>
                    <p className="font-bold text-ink">{t.name}</p>
                    <p className="text-xs text-ink2 uppercase tracking-wider font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12">
        <Reveal>
          <div className="max-w-7xl mx-auto bg-leaf rounded-jumbo p-10 md:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-ink mb-6 tracking-tight">Ready to Stock Up?</h2>
              <p className="text-ink/70 text-lg mb-10 max-w-2xl mx-auto">We specialise in bulk fulfilment for restaurants and hotel chains across Chennai. Get a customised quote today.</p>
              <Link to="/enquiry" data-testid="home-cta" className="inline-flex items-center gap-3 bg-ink text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-sunset transition-colors">
                Get Custom Quote <i className="fa-solid fa-paper-plane" />
              </Link>
            </div>
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-sun/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-white/30 rounded-full blur-3xl" />
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
