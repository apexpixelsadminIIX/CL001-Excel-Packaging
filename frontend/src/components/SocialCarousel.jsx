import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveImg } from "@/lib/api";

function parseEmbed(url) {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) {
    return {
      type: "youtube",
      src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&rel=0&playsinline=1&loop=1&playlist=${yt[1]}`,
    };
  }
  // Instagram post / reel / tv
  const ig = url.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/);
  if (ig) {
    const kind = url.includes("/reel/") ? "reel" : url.includes("/tv/") ? "tv" : "p";
    return { type: "instagram", src: `https://www.instagram.com/${kind}/${ig[1]}/embed` };
  }
  return null;
}

export default function SocialCarousel({ posts = [] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const count = posts.length;

  const paginate = useCallback(
    (d) => {
      setDir(d);
      setIndex((p) => (p + d + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count <= 1) return;
    // Don't auto-advance while a video slide is playing.
    if (parseEmbed(posts[index]?.video_url)) return;
    const t = setInterval(() => paginate(1), 5500);
    return () => clearInterval(t);
  }, [paginate, count, index, posts]);

  if (!count) return null;
  const post = posts[index];
  const embed = parseEmbed(post.video_url);

  const variants = {
    enter: (d) => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 0.96 }),
  };

  return (
    <div className="relative max-w-4xl mx-auto" data-testid="social-carousel">
      <div className="flex items-center gap-4 md:gap-8">
        {/* Prev */}
        <button
          onClick={() => paginate(-1)}
          data-testid="social-prev"
          aria-label="Previous post"
          className="hidden md:flex shrink-0 w-14 h-14 rounded-full bg-surf border border-line text-ink items-center justify-center hover:bg-ink hover:text-white transition-colors shadow-card"
        >
          <i className="fa-solid fa-arrow-left" />
        </button>

        {/* Slide */}
        <div className="relative flex-1 overflow-hidden rounded-jumbo">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noreferrer"
              data-testid={`social-slide-${post.id}`}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group block bg-surf border border-line rounded-jumbo overflow-hidden shadow-card"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative aspect-square md:aspect-auto md:min-h-[380px] overflow-hidden bg-ink">
                  {embed ? (
                    <iframe
                      title={post.caption}
                      src={embed.src}
                      className="absolute inset-0 w-full h-full"
                      style={{ border: 0 }}
                      allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
                      allowFullScreen
                      scrolling="no"
                      data-testid={`social-embed-${post.id}`}
                    />
                  ) : (
                    <img src={resolveImg(post.image)} alt={post.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                  <span className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 text-ink text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none">
                    <i className={`fa-brands ${post.platform === "youtube" ? "fa-youtube text-sunset" : "fa-instagram text-leaf"}`} />
                    {post.platform === "youtube" ? "YouTube" : "Instagram"}
                    {embed && <i className="fa-solid fa-circle-play text-sunset ml-1" />}
                  </span>
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <p className="text-sunset text-xs font-bold uppercase tracking-[0.2em] mb-4">{embed ? "Now Playing" : "Latest Post"}</p>
                  <p className="text-ink text-xl md:text-2xl font-bold leading-snug mb-6">{post.caption}</p>
                  <span className="inline-flex items-center gap-2 text-ink font-bold text-sm">
                    {post.platform === "youtube" ? "Watch on YouTube" : "View on Instagram"}
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.a>
          </AnimatePresence>
        </div>

        {/* Next */}
        <button
          onClick={() => paginate(1)}
          data-testid="social-next"
          aria-label="Next post"
          className="hidden md:flex shrink-0 w-14 h-14 rounded-full bg-leaf text-white items-center justify-center hover:bg-ink transition-colors shadow-card"
        >
          <i className="fa-solid fa-arrow-right" />
        </button>
      </div>

      {/* Bottom controls: mobile arrows + counter + dots + swipe hint */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex md:hidden items-center gap-4">
          <button onClick={() => paginate(-1)} aria-label="Previous" className="w-12 h-12 rounded-full bg-surf border border-line text-ink flex items-center justify-center"><i className="fa-solid fa-arrow-left" /></button>
          <button onClick={() => paginate(1)} data-testid="social-next-mobile" aria-label="Next" className="w-12 h-12 rounded-full bg-leaf text-white flex items-center justify-center"><i className="fa-solid fa-arrow-right" /></button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-ink tabular-nums">{String(index + 1).padStart(2, "0")}</span>
          <div className="flex gap-2" data-testid="social-dots">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
                data-testid={`social-dot-${i}`}
                aria-label={`Go to post ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-10 bg-sunset" : "w-4 bg-ink/20 hover:bg-ink/40"}`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-ink2 tabular-nums">{String(count).padStart(2, "0")}</span>
        </div>
        <p className="text-xs font-semibold text-ink2 uppercase tracking-[0.2em] flex items-center gap-2 animate-pulse">
          Slide for more <i className="fa-solid fa-arrow-right-long" />
        </p>
      </div>
    </div>
  );
}
