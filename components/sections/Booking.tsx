"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { serviceByName, services, shop, smsLink } from "@/lib/shop";
import { Reveal } from "../Reveal";
import { DatePicker } from "../ui/DatePicker";
import { Select, type Option } from "../ui/Select";

const serviceOptions: Option[] = services.map((s) => ({ value: s.name, label: s.name, hint: `${s.minutes} min` }));

const inputCls =
  "h-14 w-full rounded-2xl border border-line bg-paper px-5 text-[16px] outline-none transition-colors placeholder:text-muted/70 hover:border-ink/30 focus:border-ink";
const labelCls = "mb-2 block text-[13px] font-extrabold text-ink/70";

type Confirmed = { code: string; service: string; job: string; weekday: string; time: string; ends: string; address: string; next_steps: string };

export function Booking() {
  const [service, setService] = useState("");
  const [job, setJob] = useState("");
  const [suburb, setSuburb] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [free, setFree] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [range, setRange] = useState<{ min: Date; max: Date } | null>(null);
  const chosen = serviceByName(service);

  // Set after mount: reading the clock during render breaks prerendering
  useEffect(() => {
    const min = new Date();
    setRange({ min, max: new Date(min.getTime() + 60 * 86_400_000) });
  }, []);

  useEffect(() => {
    if (!date || !service) return;
    let live = true;
    setFree(null);
    setTime("");
    fetch(`/api/booking?service=${encodeURIComponent(service)}&date=${date}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { free_times: string[] }) => live && setFree(d.free_times))
      .catch(() => live && setFree([]));
    return () => {
      live = false;
    };
  }, [service, date]);

  const slots = useMemo<Option[]>(() => (free ?? []).map((v) => ({ value: v, label: v })), [free]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!service || !date || !time || !job.trim() || !suburb.trim() || !name.trim() || !phone.trim()) {
      setError("Please choose an appointment, date and time, and add what needs cleaning, your address, name and mobile.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile: phone, service, date, time, job, address: suburb, notes }),
      });
      const data = await res.json();
      if (data.booked) {
        setConfirmed(data);
      } else if (data.free_times) {
        setFree(data.free_times);
        setTime("");
        setError("That time was just taken. Please pick another.");
      } else {
        setError(data.reason ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection lost. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="book" className="bg-steel px-4 py-24 text-ink sm:px-8 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow mb-5">Book online</p>
          <h2 className="heading">Book Leon <span className="text-gradient">in a minute.</span></h2>
          <p className="mt-6 max-w-sm text-[18px] leading-relaxed text-ink/70">
            Pick a free time and it goes straight into Leon&apos;s calendar. No form to wait on and no phone tag while he&apos;s on a job.
          </p>
          <div className="mt-10 max-w-sm rounded-[24px] bg-ink p-6 text-paper">
            <p className="font-tag text-[10px] font-bold uppercase tracking-[0.24em] text-gold">Good to know</p>
            <p className="mt-3 font-display text-[22px] font-semibold leading-snug">Price before we start.</p>
            <p className="mt-2 text-[16px] leading-relaxed text-paper/75">
              Most homes are $200 to $500 for carpets. Leon texts you a clear price before the day, and confirms it after a quick look on arrival. No surprises.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
          {confirmed ? (
            <div className="flex min-h-[520px] flex-col justify-center rounded-[28px] bg-ink p-7 text-paper sm:p-10" role="status">
              <p className="eyebrow !text-gold">You&apos;re booked</p>
              <p className="mt-5 text-[clamp(1.6rem,2.8vw,2.4rem)] font-extrabold leading-tight">
                {confirmed.weekday} at {confirmed.time}
              </p>
              <dl className="mt-8 space-y-3 text-[17px]">
                <div>
                  <dt className="text-paper/55">Booking code</dt>
                  <dd className="font-medium">{confirmed.code}</dd>
                </div>
                <div>
                  <dt className="text-paper/55">Address</dt>
                  <dd className="font-medium">
                    {confirmed.address} · until about {confirmed.ends}
                  </dd>
                </div>
                <div>
                  <dt className="text-paper/55">Service</dt>
                  <dd className="font-medium">{confirmed.service}</dd>
                </div>
                <div>
                  <dt className="text-paper/55">The job</dt>
                  <dd className="font-medium">{confirmed.job}</dd>
                </div>
              </dl>
              <p className="mt-8 text-[15px] leading-relaxed text-paper/75">{confirmed.next_steps}</p>
              <p className="mt-4 text-[15px] text-paper/65">
                Need to change it?{" "}
                <a href={smsLink(`Hi Leon, I'd like to change booking ${confirmed.code}.`)} className="underline underline-offset-4">
                  Text {shop.phoneDisplay}
                </a>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5 rounded-[28px] bg-sand p-5 sm:grid-cols-2 sm:p-8">
              <div className="sm:col-span-2">
                <Select label="Service" required placeholder="Choose one" options={serviceOptions} value={service} onChange={setService} />
              </div>
              <DatePicker label="Date" required value={date} onChange={setDate} min={range?.min} max={range?.max} />
              <Select
                label="Time"
                required
                placeholder={!date || !service ? "Pick a service and date" : free === null ? "Checking…" : slots.length ? "Choose a time" : "Nothing free that day"}
                options={slots}
                value={time}
                onChange={setTime}
                disabled={!date || !service || !slots.length}
              />
              <div className="sm:col-span-2">
                <label htmlFor="b-job" className={labelCls}>
                  What needs cleaning? <span className="text-seal">*</span>
                </label>
                <input id="b-job" className={inputCls} value={job} onChange={(e) => setJob(e.target.value)} placeholder="3 bedrooms and lounge, dog wee stain · or 3-seater sofa" maxLength={300} />
              </div>
              {(
                <div className="sm:col-span-2">
                  <label htmlFor="b-suburb" className={labelCls}>
                    Address <span className="text-seal">*</span>
                  </label>
                  <input id="b-suburb" className={inputCls} value={suburb} onChange={(e) => setSuburb(e.target.value)} autoComplete="address-level2" placeholder="Street and suburb" maxLength={160} />
                </div>
              )}
              <div>
                <label htmlFor="b-name" className={labelCls}>
                  Your name <span className="text-seal">*</span>
                </label>
                <input id="b-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Full name" maxLength={80} />
              </div>
              <div>
                <label htmlFor="b-phone" className={labelCls}>
                  Mobile <span className="text-seal">*</span>
                </label>
                <input id="b-phone" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="04xx xxx xxx" maxLength={24} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="b-notes" className={labelCls}>
                  Anything we should know?
                </label>
                <textarea
                  id="b-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={400}
                  placeholder="Allergies or no harsh chemicals, parking, rental inspection date…"
                  className="w-full resize-none rounded-2xl border border-line bg-paper px-5 py-4 text-[16px] outline-none transition-colors placeholder:text-muted/70 hover:border-ink/30 focus:border-ink"
                />
              </div>
              <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[15px] text-ink/70" aria-live="polite">
                  {error ? <span className="font-medium text-seal">{error}</span> : chosen ? `${chosen.name}: ${chosen.short}` : "Confirmed the moment you book."}
                </p>
                <button
                  type="submit"
                  disabled={sending}
                  className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-[16px] font-medium text-paper transition-colors hover:bg-seal disabled:opacity-60"
                >
                  {sending ? "Booking…" : "Book now"}
                  <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
