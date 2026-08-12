import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { resolveImg } from "@/lib/api";

export default function HeroCarousel({ slides = [] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback((i) => setIndex((i + count) % count), [count]);
  const next = useCallback(() => setIndex((p) => (p + 1) % count), [count]);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, count]);

  if (!count) return <div className="h-[70vh] bg-panel" />;
  const slide = slides[index];

  return (
    <header className="relative h-[92vh] min-h-[560px] w-full overflow-hidden" data-testid="hero-carousel">
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id || index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.img
            src={resolveImg(slide.image)}
            alt={slide.title_lead + " " + slide.title_accent}
            className="w-full h-full object-cover"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/35 to-ink/25" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-20 flex flex-col justify-end md:justify-center px-6 md:px-16 pb-28 md:pb-0 max-w-6xl">
        <AnimatePresence mode="wait">
          <motion.div key={slide.id || index} className="pt-24">
            <div className="overflow-hidden mb-5">
              <motion.p
                className="inline-flex items-center gap-2 text-white/90 text-xs md:text-sm font-bold tracking-[0.28em] uppercase bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2"
                initial={{ y: "120%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="w-2 h-2 rounded-full bg-sun" /> {slide.eyebrow}
              </motion.p>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[0.95] tracking-tighter">
              <span className="block overflow-hidden">
                <motion.span className="block" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
                  {slide.title_lead}
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span className="block text-sun" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                  {slide.title_accent}
                </motion.span>
              </span>
            </h1>
            <motion.div
              className="mt-9"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Link
                to={slide.cta_link || "/catalog"}
                data-testid="hero-cta"
                className="inline-flex items-center gap-3 bg-sun text-ink px-8 py-4 rounded-full font-bold text-base hover:bg-sunset hover:text-white transition-colors shadow-lg"
              >
                {slide.cta_label || "View Products"} <i className="fa-solid fa-arrow-right" />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-6 md:left-16 z-30 flex items-center gap-4">
        <div className="flex gap-2.5" data-testid="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              data-testid={`hero-dot-${i}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-12 bg-sun" : "w-6 bg-white/50 hover:bg-white/80"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 right-6 md:right-16 z-30 flex gap-3">
        <button onClick={() => go(index - 1)} data-testid="hero-prev" aria-label="Previous slide" className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-ink transition-colors">
          <i className="fa-solid fa-arrow-left" />
        </button>
        <button onClick={() => go(index + 1)} data-testid="hero-next" aria-label="Next slide" className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-ink transition-colors">
          <i className="fa-solid fa-arrow-right" />
        </button>
      </div>
    </header>
  );
}
