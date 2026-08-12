import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { motion } from "framer-motion";
import { useContent } from "@/hooks/useContent";

export default function About() {
  const { data } = useContent();
  const a = data?.about_page || {};
  const pillars = a.pillars || [];

  return (
    <div className="bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 md:px-12 relative overflow-hidden" data-testid="about-hero">
        <div className="absolute top-24 right-0 w-[40rem] h-[40rem] bg-pistachio/30 rounded-full blur-3xl -z-0" />
        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal>
            <p className="text-leaf font-bold tracking-[0.3em] uppercase text-xs mb-6">Since 2019</p>
          </Reveal>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-ink mb-8 leading-[0.95] tracking-tighter">
            <span className="block overflow-hidden"><motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>{a.hero_lead || "Empowering the"}</motion.span></span>
            <span className="block overflow-hidden"><motion.span className="block italic text-leaf" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>{a.hero_accent || "Food Service"}</motion.span></span>
            <span className="block overflow-hidden"><motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}>{a.hero_tail || "Industry"}</motion.span></span>
          </h1>
          <Reveal delay={0.3}>
            <p className="text-xl text-ink2 leading-relaxed max-w-2xl">{a.hero_body}</p>
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto" data-testid="mission-vision">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Reveal>
            <div className="bg-surf p-10 md:p-12 rounded-jumbo border border-line shadow-card h-full">
              <div className="w-16 h-16 bg-panel rounded-2xl flex items-center justify-center text-leaf text-3xl mb-8"><i className="fa-solid fa-bullseye" /></div>
              <h2 className="text-3xl font-bold text-ink mb-5">Our Mission</h2>
              <p className="text-ink2 text-lg leading-relaxed">{a.mission}</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="bg-ink p-10 md:p-12 rounded-jumbo text-white h-full">
              <div className="w-16 h-16 bg-leaf rounded-2xl flex items-center justify-center text-white text-3xl mb-8"><i className="fa-solid fa-eye" /></div>
              <h2 className="text-3xl font-bold mb-5">Our Vision</h2>
              <p className="text-white/60 text-lg leading-relaxed">{a.vision}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pillars — numbered manifesto */}
      <section className="py-24 px-6 md:px-12 bg-panel rounded-jumbo mx-3 md:mx-4 my-16" data-testid="pillars-section">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          <Reveal className="w-full lg:w-1/2">
            <div className="bg-surf p-4 rounded-jumbo shadow-card">
              <img src={a.image} alt="Excel Packaging Chennai warehouse" className="rounded-[2.4rem] w-full aspect-square object-cover" />
            </div>
          </Reveal>
          <div className="w-full lg:w-1/2">
            <Reveal>
              <h2 className="text-4xl md:text-5xl font-extrabold text-ink mb-12 tracking-tight">Built on Three Core Pillars</h2>
            </Reveal>
            <div className="space-y-10">
              {pillars.map((p, i) => (
                <Reveal key={p.num} delay={i * 0.1}>
                  <div className="flex gap-6 items-start">
                    <span className="text-5xl md:text-6xl font-extrabold text-sun leading-none">{p.num}</span>
                    <div className="pt-1">
                      <h4 className="text-xl font-bold text-ink mb-2 flex items-center gap-3">
                        <i className={`fa-solid ${p.icon} text-leaf`} /> {p.title}
                      </h4>
                      <p className="text-ink2 leading-relaxed">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
