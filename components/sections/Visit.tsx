import Image from "next/image";
import { faqs, shop, smsLink, telLink } from "@/lib/shop";
import { Reveal } from "../Reveal";

export function Visit() {
  return (
    <section id="faq" className="px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow mb-5">Good to know</p>
          <h2 className="heading">Before you book.</h2>
          <p className="mt-8 max-w-sm text-[18px] leading-relaxed text-bone/75">
            Leon works Monday to Saturday from 7 am. Ask the receptionist at any hour, or call or text him directly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={telLink} className="rounded-full bg-brass px-6 py-3.5 text-[15px] font-medium text-night transition-colors hover:bg-gold-deep">
              Call {shop.phoneDisplay}
            </a>
            <a href={smsLink("Hi Leon, ")} className="rounded-full border border-bone/25 px-6 py-3.5 text-[15px] font-medium transition-colors hover:border-bone">
              Text us
            </a>
          </div>
          <div className="relative mt-12 hidden aspect-[4/3] overflow-hidden rounded-[28px] lg:block">
            <Image src="/images/before2.jpg" alt="Before and after: a worn office carpet comes up clean" fill sizes="40vw" className="object-cover" />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <dl className="divide-y divide-rule border-y border-rule">
            {faqs.map((f) => (
              <div key={f.q} className="grid gap-2 py-6 sm:grid-cols-12 sm:gap-6">
                <dt className="text-[21px] font-extrabold leading-tight sm:col-span-5">{f.q}</dt>
                <dd className="text-[16px] leading-relaxed text-bone/70 sm:col-span-7">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
