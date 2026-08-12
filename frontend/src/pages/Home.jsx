import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import Marquee from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { useContent } from "@/hooks/useContent";
import { resolveImg } from "@/lib/api";

const WHY = [
  { icon: "fa-award", title: "Quality Standards", body: "100% food-grade materials ensuring maximum safety for consumers." },
  { icon: "fa-hand-sparkles", title: "Hygiene-First", body: "Rigorous handling protocols to maintain zero-contamination standards." },
  { icon: "fa-seedling", title: "Eco-Conscious", body: "Comprehensive range of biodegradable disposables for modern brands." },
  { icon: "fa-truck-fast", title: "Fast Delivery", body: "Optimised bulk fulfilment network for quick local turnaround in Chennai." },
];

export default function Home() {
  const { data } = useContent();
  const slides = data?.hero_slides || [];
  const story = data?.story || {};
  const categories = data?.categories || [];
  const testimonials = data?.testimonials || [];
  const social = data?.social_posts || [];

  return (
    <div className="bg-bg">
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
              <p className="text-leaf font-bold tracking-[0.2em] uppercase mb-5 text-sm">Since 2019</p>
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
              <div className="bg-surf p-8 rounded-[2rem] border border-line hover:border-leaf transition-colors h-full">
                <div className="w-14 h-14 bg-panel rounded-2xl flex items-center justify-center text-2xl text-leaf mb-6">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {social.map((post, i) => (
              <motion.a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noreferrer"
                data-testid={`social-post-${post.id}`}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                className={`group relative rounded-[1.4rem] overflow-hidden aspect-square ${i % 5 === 0 ? "col-span-2 row-span-2 aspect-auto" : ""}`}
              >
                <img src={resolveImg(post.image)} alt={post.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-ink">
                  <i className={`fa-brands ${post.platform === "youtube" ? "fa-youtube" : "fa-instagram"}`} />
                </div>
                <p className="absolute bottom-0 left-0 right-0 p-4 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">{post.caption}</p>
              </motion.a>
            ))}
          </div>
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
              <div className="p-9 bg-surf rounded-[2rem] shadow-card border border-line h-full flex flex-col">
                <i className="fa-solid fa-quote-left text-sun text-3xl mb-5" />
                <p className="text-ink text-lg mb-7 leading-relaxed font-medium flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-4 border-t border-line pt-6">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
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
