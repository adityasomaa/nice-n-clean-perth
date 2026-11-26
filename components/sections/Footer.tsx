import { shop, smsLink, telLink } from "@/lib/shop";
import { Wordmark } from "../Mark";
import { TransitionLink } from "../PageTransition";

export function Footer() {
  return (
    <footer className="bg-coal text-bone">
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <Wordmark className="text-[clamp(1.6rem,4.5vw,2.4rem)] text-bone" />
          <p className="max-w-sm text-[17px] leading-relaxed text-bone/70">Carpet, tile and grout, upholstery and rug cleaning across Perth's southern and coastal suburbs, family owned since 1981.</p>
        </div>
        <div className="mt-14 grid gap-8 border-t border-rule pt-8 text-[15px] text-bone/65 sm:grid-cols-3">
          <div>
            <p className="text-bone">{shop.name}</p>
            <p className="mt-1">Coolbellup, Perth WA</p>
            <p className="mt-1">Mon–Fri 7–6 · Sat 7–1:30</p>
          </div>
          <div>
            <a href={telLink} className="block hover:text-bone">
              Call {shop.phoneDisplay}
            </a>
            <a href={smsLink("Hi Leon, ")} className="mt-1 block hover:text-bone">
              Text Leon
            </a>
            <a href={`mailto:${shop.email}`} className="mt-1 block hover:text-bone">
              {shop.email}
            </a>
            <a href={shop.facebook} target="_blank" rel="noopener noreferrer" className="mt-1 block hover:text-bone">
              Facebook
            </a>
          </div>
          <div className="flex flex-col gap-1 sm:items-end">
            <p>By appointment</p>
            <p>100% satisfaction guarantee</p>
            <TransitionLink href="/" className="hover:text-bone">
              Back to top ↑
            </TransitionLink>
          </div>
        </div>
        <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.24em] text-bone/40">© 2026 {shop.name}. Perth, Western Australia.</p>
      </div>
    </footer>
  );
}
