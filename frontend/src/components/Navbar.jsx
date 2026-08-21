import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "E-Catalog" },
  { to: "/cleaning", label: "Cleaning & Hospitality" },
  { to: "/about", label: "About" },
  { to: "/enquiry", label: "Contact" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-4 flex justify-between items-center pointer-events-none">
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`flex items-center gap-6 pointer-events-auto rounded-full border transition-all duration-300 ${
          scrolled ? "bg-surf/90 border-line shadow-card backdrop-blur-xl" : "bg-surf/70 border-line/60 backdrop-blur-md"
        } pl-4 pr-3 md:pl-6 md:pr-4 py-2.5`}
      >
        <Link to="/" data-testid="nav-logo" className="text-lg md:text-xl font-extrabold tracking-tight text-ink flex items-center gap-2">
          <span className="w-8 h-8 bg-leaf rounded-xl flex items-center justify-center text-white text-[11px] font-extrabold">EX</span>
          <span className="hidden sm:inline">Excel <span className="text-leaf">Packaging</span></span>
        </Link>
        <div className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/[^a-z]/g, "-")}`}
              className={`text-sm font-semibold nav-underline transition-colors ${
                isActive(l.to) ? "text-ink active" : "text-ink2 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <Link
          to="/enquiry"
          data-testid="nav-cart"
          aria-label="Enquiry cart"
          className="relative w-11 h-11 flex items-center justify-center rounded-full bg-surf border border-line text-ink shadow-card hover:bg-sun transition-colors"
        >
          <i className="fa-solid fa-clipboard-list" />
          {count > 0 && (
            <span data-testid="cart-count" className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-sunset text-white text-[11px] font-bold rounded-full flex items-center justify-center">{count}</span>
          )}
        </Link>
        <Link
          to="/enquiry"
          data-testid="nav-get-quote"
          className="hidden md:inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-sunset transition-colors shadow-card"
        >
          Get a Quote <i className="fa-solid fa-arrow-right text-xs" />
        </Link>
        <button
          data-testid="nav-mobile-toggle"
          onClick={() => setOpen(true)}
          className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full bg-surf border border-line text-ink shadow-card"
          aria-label="Open menu"
        >
          <i className="fa-solid fa-bars-staggered" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-bg px-6 pt-24 pointer-events-auto lg:hidden"
            data-testid="mobile-menu"
          >
            <button
              onClick={() => setOpen(false)}
              data-testid="mobile-menu-close"
              className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center rounded-full bg-panel text-ink"
              aria-label="Close menu"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
            <div className="flex flex-col gap-6 mt-6">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                >
                  <Link
                    to={l.to}
                    className={`text-3xl font-bold ${isActive(l.to) ? "text-leaf" : "text-ink"}`}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                to="/enquiry"
                className="mt-6 inline-flex justify-center items-center gap-2 bg-sunset text-white px-8 py-4 rounded-full font-bold"
              >
                Get a Quote <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
