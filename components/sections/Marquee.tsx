const words = ["Hot water extraction", "Dry in 2–4 hours", "Safe for kids & pets", "Pet stains & odours", "Tile & grout", "Upholstery & rugs", "100% satisfaction guarantee"];

export function Marquee() {
  const row = [...words, ...words];
  return (
    <div className="overflow-hidden border-y border-rule bg-coal py-5" aria-hidden>
      <div className="marquee-track flex w-max gap-12 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-12 font-display text-[20px] font-semibold text-bone/70">
            {w}
            <span className="size-1.5 rounded-full bg-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}
