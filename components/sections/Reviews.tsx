import { reviews, shop } from "@/lib/shop";
import { Reveal } from "../Reveal";

export function Reviews() {
  return (
    <section id="reviews" className="bg-steel px-4 py-24 text-bone sm:px-8 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-5">What customers say</p>
            <h2 className="heading">
              {shop.rating.toFixed(1)} stars from {shop.reviewCount} Google reviews.
            </h2>
          </div>
          <p className="max-w-sm text-[17px] leading-relaxed text-bone/70 lg:col-span-4">
            The words that come up most: on time, friendly, and carpets that look new again.
          </p>
        </Reveal>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={(i % 2) * 0.08} className="flex w-[84vw] shrink-0 snap-start flex-col justify-between gap-6 rounded-[28px] bg-paper p-7 sm:w-auto lg:p-9">
              <div>
                <p className="text-[15px] tracking-[0.2em] text-gold-deep">★★★★★</p>
                <p className="mt-4 text-[20px] font-semibold leading-snug lg:text-[22px]">&ldquo;{r.text}&rdquo;</p>
              </div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-muted">
                {r.name} <span className="text-seal">· {r.tag}</span>
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
