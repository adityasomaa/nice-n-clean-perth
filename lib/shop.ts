// Single source of truth for the business: used by the homepage and the receptionist.
// Sourced from nicencleanperth.au (home, services, FAQs, service areas) and Google Maps
// (329 reviews, 5.0; opening hours), Nov 2026.

export const shop = {
  name: "Nice N Clean",
  fullName: "Nice N Clean Carpet, Tile & Grout Cleaning",
  owner: "Leon",
  since: 1981,
  area: "Perth's southern and coastal suburbs",
  phoneDisplay: "0417 915 839",
  phone: "61417915839",
  email: "leon@nicencleanperth.au",
  facebook: "https://www.facebook.com/nnccarpetcleaning",
  instagram: "https://www.instagram.com/nicencleancarpetcleaning/",
  website: "https://www.nicencleanperth.au",
  rating: 5.0,
  reviewCount: 329,
  hours: "Monday to Friday 7 am to 6 pm, Saturday 7 am to 1:30 pm, closed Sunday",
};

/** Who can take a booking: Leon does every job (see schedule.pools). */
export type Pool = "leon";

export type Service = {
  id: string;
  name: string;
  minutes: number;
  pool: Pool;
  short: string;
  text: string;
  /** Kept for the template's components: no service here is free. */
  free: boolean;
  test: boolean;
};

// How long each job is booked for is a placeholder until Leon confirms it (a 3-bedroom carpet clean takes 1–2 hours).
export const services: Service[] = [
  { id: "carpet", name: "Carpet cleaning", minutes: 120, pool: "leon", short: "Most homes $200–$500", text: "Truck-mounted hot water extraction for every carpet type: wool, synthetic, Berber and frieze. Dry in 2–4 hours.", free: false, test: false },
  { id: "vacate", name: "Vacate carpet clean", minutes: 180, pool: "leon", short: "For end of lease and rental inspections", text: "A full deep clean of every carpeted room before you hand back the keys.", free: false, test: false },
  { id: "tile", name: "Tile & grout cleaning", minutes: 120, pool: "leon", short: "Priced by area", text: "High-pressure rotary cleaning for kitchens, bathrooms, laundries and alfresco areas, with sealing available.", free: false, test: false },
  { id: "upholstery", name: "Upholstery & mattress cleaning", minutes: 90, pool: "leon", short: "Priced by piece", text: "Low-moisture cleaning for sofas, armchairs, ottomans, bedheads, mattresses and car interiors.", free: false, test: false },
  { id: "rugs", name: "Rug cleaning", minutes: 60, pool: "leon", short: "Priced by rug", text: "Area rugs cleaned on site and left fresh, usually in well under an hour.", free: false, test: false },
  { id: "vinyl", name: "Vinyl floor cleaning", minutes: 120, pool: "leon", short: "Priced by area", text: "Deep cleaning for vinyl and hybrid floors that a mop can't shift.", free: false, test: false },
];

export const serviceNames = services.map((s) => s.name);
export const serviceByName = (name: string) => services.find((s) => s.name === name);

export const suburbs = [
  "Fremantle", "East Fremantle", "South Fremantle", "Bicton", "Palmyra", "Attadale", "Spearwood", "Coolbellup", "Yangebup", "Beaconsfield",
  "Coogee", "North Coogee", "Port Coogee", "Lake Coogee", "Bibra Lake", "Kardinya", "Melville", "Canning Vale", "South Perth", "Cockburn",
  "Applecross", "Claremont", "Nedlands", "Cottesloe", "Mosman Park", "Hamilton Hill",
];

export const steps = [
  { title: "Pre-inspection", text: "Leon checks your carpets and points out heavy stains and pet zones before he starts." },
  { title: "Pre-treatment", text: "A pre-spray loosens embedded dirt and breaks down stains." },
  { title: "Hot water extraction", text: "Truck-mounted equipment injects hot water deep into the pile and pulls it back out with the dirt." },
  { title: "Spot treatment & walk-through", text: "Stubborn marks get targeted treatment, then you check the result together." },
];

// What customers say again and again in 329 five-star reviews, and what the website promises
export const promises = [
  { title: "Family owned since 1981", text: "You deal with Leon directly: not a call centre, not a subcontractor." },
  { title: "Honest price up front", text: "A clear price before any work starts. No hidden charges, no upsell." },
  { title: "Safe for kids & pets", text: "Eco-friendly, non-toxic solutions that are safe once dry. Tell Leon about allergies." },
  { title: "100% satisfaction", text: "Not happy? Leon comes back and re-cleans at no charge." },
];

export const faqs = [
  { q: "How much does it cost?", a: "Most homes are $200 to $500 depending on the rooms, their size and condition. Tile and grout, upholstery and vinyl are priced by area. Leon confirms a clear price before he starts." },
  { q: "How long until it's dry?", a: "Usually 2 to 4 hours. Open a few windows or run a fan, and stay off it in shoes until it's dry." },
  { q: "Can you get pet stains out?", a: "Most respond well. Urine needs a separate enzyme treatment to remove the odour at its source; Leon tells you honestly what's achievable." },
  { q: "Do I need to move furniture?", a: "Clear small items like coffee tables, dining chairs and toys. Leon works around sofas and beds." },
  { q: "How long does a job take?", a: "A standard 3-bedroom home takes about 1 to 2 hours." },
  { q: "How often should carpets be cleaned?", a: "Once a year for most homes, every 6 months with pets or young kids. It also protects most carpet warranties." },
];

export const reviews = [
  { name: "Christine May", tag: "Carpets", text: "My carpet had been abused by pets and messy humans for several years. Today Leon and Gordon performed a carpet cleaning miracle in a short time at a very reasonable price." },
  { name: "Kristen Panizza", tag: "Carpets & rug", text: "Puppy toilet training is no joke, but they managed to lift the wee stains and get rid of the lingering smells. Super professional, thorough, and such a relief." },
  { name: "April McGeorge", tag: "Carpets", text: "Very professional work, was done quickly and the carpets were all dry by the evening! Much faster than when I hired someone else a few years back." },
  { name: "Kristina Hojckova", tag: "Two rugs", text: "Leon and his dad arrived right on time and cleaned two of our rugs beautifully in just 30 minutes and they smell amazing now." },
];

export const smsLink = (text?: string) => `sms:+${shop.phone}${text ? `?&body=${encodeURIComponent(text)}` : ""}`;
export const telLink = `tel:+${shop.phone}`;
