import { Link } from "react-router-dom";
import { useContent } from "@/hooks/useContent";

export default function Footer() {
  const { data } = useContent();
  const c = data?.contact || {};
  return (
    <footer className="bg-ink text-white pt-24 md:pt-32 pb-10 px-6 md:px-12 rounded-t-jumbo mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
        <div className="md:col-span-4">
          <Link to="/" className="text-2xl font-extrabold tracking-tight mb-6 inline-block">
            Excel <span className="text-leaf">Packaging</span>
          </Link>
          <p className="text-white/50 max-w-sm leading-relaxed mb-8">
            B2B supplier of food-grade packaging, eco-friendly disposables, and hospitality chemicals. Based in Chennai since 2019.
          </p>
          <div className="flex gap-3">
            <a href={c.instagram || "#"} target="_blank" rel="noreferrer" data-testid="footer-instagram" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-sunset transition-colors"><i className="fa-brands fa-instagram" /></a>
            <a href={c.linkedin || "#"} target="_blank" rel="noreferrer" data-testid="footer-linkedin" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-sunset transition-colors"><i className="fa-brands fa-linkedin-in" /></a>
            <a href={c.facebook || "#"} target="_blank" rel="noreferrer" data-testid="footer-facebook" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-sunset transition-colors"><i className="fa-brands fa-facebook-f" /></a>
          </div>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-bold mb-6 uppercase tracking-[0.2em] text-xs text-sun">Contact</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-location-dot text-sunset mt-1" />
              <span>{c.address_line1 || "No 4, 38, Ganapathy Nagar 2nd St, Ekkatuthangal, Chennai, Tamil Nadu 600032"}{c.address_line2 ? <><br />{c.address_line2}</> : null}</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="fa-solid fa-phone text-sunset" />
              <a href={`tel:${c.phone_link || ""}`} className="hover:text-white transition-colors">{c.phone || "+91 98417 35178"}</a>
            </li>
            <li className="flex items-center gap-3">
              <i className="fa-solid fa-envelope text-sunset" />
              <a href={`mailto:${c.email || ""}`} className="hover:text-white transition-colors">{c.email || "exlpackaging@gmail.com"}</a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold mb-6 uppercase tracking-[0.2em] text-xs text-sun">Socials</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li><a href={c.instagram || "#"} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
            <li><a href={c.linkedin || "#"} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
            <li><a href={c.facebook || "#"} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-bold mb-6 uppercase tracking-[0.2em] text-xs text-sun">Quick Links</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/catalog" className="hover:text-white transition-colors">Products</Link></li>
            <li><Link to="/cleaning" className="hover:text-white transition-colors">Cleaning & Hospitality</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/40">© 2026 Excel Packaging and Taste Foods. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-white/40">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
