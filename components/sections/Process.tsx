import Image from "next/image";
import { promises, shop, steps } from "@/lib/shop";
import { Reveal } from "../Reveal";

export function Process() {
  return (
    <section id="about" className="bg-ink px-4 py-24 text-paper sm:px-8 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5 lg:pr-8">
            <p className="eyebrow mb-5 !text-gold">Family owned since {shop.since}</p>
            <h2 className="heading">
              Leon turns up. <span className="text-gradient">Leon does the job.</span>
            </h2>
            <p className="mt-6 max-w-md text-[18px] leading-relaxed text-paper/75">
              No call centre and no subcontractors. Leon, often with his dad Gordon, brings the truck-mounted equipment to your door and doesn&apos;t leave until it&apos;s right.
            </p>
            <div className="relative mt-10 aspect-[16/7] overflow-hidden rounded-[28px]">
              <Image src="/images/van.jpg" alt="The Nice N Clean van parked in a driveway outside a brick home" fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {promises.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.05} className="border-t border-paper/15 pt-5">
                  <h3 className="font-display text-[22px] font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-paper/70">{p.text}</p>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-14 rounded-[28px] bg-paper/[0.06] p-6 sm:p-8">
              <p className="eyebrow mb-6 !text-gold">How a clean works</p>
              <ol className="space-y-5">
                {steps.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[44px_1fr] gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-gold font-display text-[15px] font-bold text-ink">{i + 1}</span>
                    <p className="text-[16px] leading-relaxed text-paper/75">
                      <span className="font-semibold text-paper">{s.title}.</span> {s.text}
                    </p>
                  </li>
                ))}
              </ol>
            </Reveal>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:gap-4">
              <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                <Image src="/images/before1.jpg" alt="Before and after: a dirty carpet next to the clean half" fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover" />
              </Reveal>
              <Reveal delay={0.08} className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                <Image src="/images/wand.jpg" alt="The cleaning wand pulling a clean stripe through a grey carpet" fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover" />
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
