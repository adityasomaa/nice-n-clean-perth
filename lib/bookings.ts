import { randomBytes } from "node:crypto";
import { del, list, put } from "@vercel/blob";
import { closingTime, describeDate, freeInstructors, freeSlots, isDate, nextFreeDay, today, toMinutes, toTime, type Entry } from "./schedule";
import { serviceByName, type Service } from "./shop";

export type Booking = {
  code: string;
  name: string;
  mobile: string;
  service: string;
  date: string;
  time: string;
  job: string;
  address: string;
  notes: string;
  channel: string;
  createdAt: string;
};

export type BookingRequest = Pick<Booking, "name" | "mobile" | "service" | "date" | "time" | "job" | "address" | "notes">;
export type AvailabilityRequest = Pick<Booking, "service" | "date">;
export type Sender = { channel: string; sender: string };

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

// One private blob per booking, its name holding the time, length and consultant,
// so reading the calendar never opens a file. Blobs refuse to overwrite and each claim is
// re-checked after writing, so two customers racing for the same time can't both win.
const pathFor = (date: string, time: string, minutes: number, slot: number) => `bookings/${date}/${time.replace(":", "")}-${minutes}-${slot}.json`;

async function entries() {
  const found: (Entry & { pathname: string })[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "bookings/", cursor });
    for (const { pathname } of page.blobs) {
      const [, date, file] = pathname.split("/");
      const [time, minutes, slot] = file.replace(".json", "").split("-");
      found.push({ pathname, date, start: toMinutes(`${time.slice(0, 2)}:${time.slice(2)}`), minutes: +minutes, instructor: +slot });
    }
    cursor = page.cursor;
  } while (cursor);
  return found;
}

/** Claims the slot. False means someone else just took the time. */
async function reserve(booking: Booking, service: Service, slot: number) {
  const start = toMinutes(booking.time);
  const path = pathFor(booking.date, booking.time, service.minutes, slot);
  let written = false;
  try {
    await put(path, JSON.stringify(booking), { access: "private", contentType: "application/json" });
    written = true;
    const others = (await entries()).filter((e) => e.pathname !== path);
    if (freeInstructors(service.pool, booking.date, start, service.minutes, others).includes(slot)) return true;
  } catch (err) {
    if (!(err instanceof Error && err.message.includes("already exists"))) throw err;
  }
  if (written) await del(path);
  return false;
}

// Best-effort per-instance limit, so one visitor can't fill the calendar.
const recent = new Map<string, number[]>();
function limited(sender: string) {
  const now = Date.now();
  const times = (recent.get(sender) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.set(sender, times);
  if (recent.size > 5000) recent.clear();
  return times.length >= MAX_PER_WINDOW;
}

const slotsFor = (service: Service, date: string, taken: Entry[]) => freeSlots(service.pool, date, service.minutes, 1, taken);

export async function availability({ service: name, date }: AvailabilityRequest) {
  const service = serviceByName(name);
  if (!service) return { date, free_times: [] };
  const taken = await entries();
  const free = slotsFor(service, date, taken);
  if (free.length) return { date, weekday: describeDate(date), service: service.name, free_times: free, session_minutes: service.minutes };
  // Say why, so "nothing left today" isn't reported as "fully booked"
  const why =
    date === today() ? "No more appointment times today." : !closingTime(date) ? "Leon doesn't book jobs that day." : "Fully booked that day.";
  return {
    date,
    free_times: [],
    why,
    next_available: nextFreeDay(service.pool, date, service.minutes, 1, taken),
  };
}

/** Used by every channel: the receptionist's tool and the website form. */
export async function createBooking(input: BookingRequest, from: Sender) {
  const name = input.name.trim().slice(0, 80);
  const mobile = input.mobile.replace(/[^\d+]/g, "");
  const digits = mobile.replace(/\D/g, "");
  const job = input.job.trim().slice(0, 300);
  const address = input.address.trim().slice(0, 160);
  const service = serviceByName(input.service);
  if (name.length < 2) return { booked: false as const, reason: "The customer's name is missing." };
  if (digits.length < 8 || digits.length > 15) return { booked: false as const, reason: "That mobile number doesn't look complete." };
  if (!service) return { booked: false as const, reason: "That isn't one of the services." };
  if (job.length < 2) return { booked: false as const, reason: "The job details are missing: how many rooms or which items, and any stains, pets or odours." };
  if (address.length < 3) return { booked: false as const, reason: "The address is missing: at least the street and suburb." };
  if (limited(from.sender)) return { booked: false as const, reason: "Too many bookings from this visitor. Please call or text Leon." };

  const taken = await entries();
  const refused = {
    booked: false as const,
    reason: "That time isn't free.",
    free_times: isDate(input.date) ? slotsFor(service, input.date, taken) : [],
  };
  if (!refused.free_times.includes(input.time)) return refused;

  const start = toMinutes(input.time);
  const code = `NC-${randomBytes(2).toString("hex").toUpperCase()}`;
  const slot = freeInstructors(service.pool, input.date, start, service.minutes, taken)[0];
  const ok = await reserve(
    {
      code,
      name,
      mobile,
      service: service.name,
      date: input.date,
      time: input.time,
      job,
      address,
      notes: input.notes.trim().slice(0, 500),
      channel: from.channel,
      createdAt: new Date().toISOString(),
    },
    service,
    slot,
  );
  if (!ok) return refused;

  recent.get(from.sender)?.push(Date.now());
  return {
    booked: true as const,
    code,
    service: service.name,
    job,
    weekday: describeDate(input.date),
    time: input.time,
    ends: toTime(start + service.minutes),
    address,
    next_steps: "Leon texts you to confirm the price before the day, and the exact price is set on arrival after a quick look, with no surprises. Clear small items like coffee tables, chairs and toys beforehand.",
  };
}
