import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveImg } from "@/lib/api";

export default function Lightbox({ images = [], index, onClose, onNav }) {
  const open = index !== null && index !== undefined && index >= 0;

  const handleKey = useCallback((e) => {
    if (!open) return;
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") onNav(1);
    if (e.key === "ArrowLeft") onNav(-1);
  }, [open, onClose, onNav]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  let touchX = null;
  const onTouchStart = (e) => { touchX = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) onNav(dx < 0 ? 1 : -1);
    touchX = null;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] bg-ink/90 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} data-testid="lightbox"
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        >
          <button onClick={onClose} data-testid="lightbox-close" aria-label="Close" className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25">
            <i className="fa-solid fa-xmark text-xl" />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onNav(-1); }} data-testid="lightbox-prev" aria-label="Previous" className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25">
                <i className="fa-solid fa-arrow-left" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onNav(1); }} data-testid="lightbox-next" aria-label="Next" className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25">
                <i className="fa-solid fa-arrow-right" />
              </button>
            </>
          )}
          <motion.img
            key={index}
            src={resolveImg(images[index])}
            alt=""
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <span className="absolute bottom-6 text-white/80 text-sm font-bold">{index + 1} / {images.length}</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
