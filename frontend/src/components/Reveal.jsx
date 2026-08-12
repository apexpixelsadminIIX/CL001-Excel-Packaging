import { motion } from "framer-motion";

export function Reveal({ children, delay = 0, y = 32, className = "", once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Masked line reveal for headings (line animates up from behind a clip mask)
export function MaskLine({ children, delay = 0, className = "" }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default Reveal;
