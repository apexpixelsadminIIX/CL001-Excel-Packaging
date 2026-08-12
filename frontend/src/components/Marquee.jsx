export default function Marquee({ items = [], className = "" }) {
  const loop = [...items, ...items];
  return (
    <div className={`relative overflow-hidden ${className}`} data-testid="brand-marquee">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center">
            <span className="px-8 py-6 text-4xl md:text-6xl font-bold tracking-tight text-ink/90">
              {item}
            </span>
            <span className="text-sunset text-3xl">
              <i className="fa-solid fa-leaf" aria-hidden="true" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
