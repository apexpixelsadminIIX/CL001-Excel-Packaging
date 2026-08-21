import { useLocation } from "react-router-dom";
import { useContent } from "@/hooks/useContent";

export default function WhatsAppFab() {
  const { pathname } = useLocation();
  const { data } = useContent();
  if (pathname.startsWith("/admin")) return null;

  const number = (data?.contact?.whatsapp || data?.contact?.phone_link || "919841735178").replace(/\D/g, "");
  const msg = "Hello Excel Packaging, I'd like to enquire about your products.";
  const href = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat with us on WhatsApp"
      data-testid="floating-whatsapp"
      className="group fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-full bg-[#25D366] pl-4 pr-5 py-3.5 text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-all duration-300 hover:bg-[#1da851] hover:scale-105"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" aria-hidden="true" />
      <i className="fa-brands fa-whatsapp relative text-2xl" />
      <span className="relative hidden sm:inline text-sm font-bold">Chat with us</span>
    </a>
  );
}
