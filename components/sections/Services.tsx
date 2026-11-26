"use client";

import Image from "next/image";
import { services } from "@/lib/shop";
import { useChat } from "../Chat";
import { Reveal } from "../Reveal";

const images: Record<string, { src: string; alt: string }> = {
  carpet: { src: "lines", alt: "Freshly cleaned beige carpet with even extraction lines" },
  vacate: { src: "before3", alt: "Before and after: a stained carpet in an empty room comes up clean" },
  tile: { src: "tile", alt: "A cleaning wand lifting grime off a hard floor, half done" },
  upholstery: { src: "couch", alt: "A clean cream fabric sofa in afternoon light" },
  rugs: { src: "fresh", alt: "A freshly cleaned textured carpet" },
  vinyl: { src: "commercial", alt: "A clean commercial floor under a row of chairs" },
};

export function Services() {
  const { openChat } = useChat();
  return (
    <section id="services" className="px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5">What we clean</p>
            <h2 className="heading">
              Carpets, tiles, sofas. <span className="text-gradient">Done properly.</span>
            </h2>
          </div>
          <p className="max-w-md text-[17px] leading-relaxed text-bone/70 lg:col-span-5">
            Most homes come in between $200 and $500 for carpets, depending on the rooms and their condition. Leon confirms a clear price before he starts, with no surprises.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.06} className="group flex flex-col overflow-hidden rounded-[28px] bg-paper shadow-[0_1px_0_var(--color-rule)]">
              <div className="relative aspect-[16/10] overflow-hidden bg-coal">
                <Image src={`/images/${images[s.id].src}.jpg`} alt={images[s.id].alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-gold-deep">{s.short}</p>
                <h3 className="mt-3 font-display text-[24px] font-semibold leading-tight">{s.name}</h3>
                <p className="mt-2 flex-1 text-[16px] leading-relaxed text-bone/70">{s.text}</p>
                <button
                  type="button"
                  onClick={() => openChat(`I'd like to book ${s.name.toLowerCase()}.`)}
                  className="mt-6 inline-flex w-fit items-center gap-2 text-[15px] font-semibold text-gold-deep transition-transform duration-500 hover:translate-x-1"
                >
                  Find a time →
                </button>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-[15px] text-ash">Commercial carpets, offices and strata: call or text Leon for a quote.</p>
      </div>
    </section>
  );
}
