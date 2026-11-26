import { availability, createBooking, type BookingRequest } from "@/lib/bookings";
import { clientIp, sameOrigin } from "@/lib/guard";
import { isDate } from "@/lib/schedule";

// The website's booking form: same calendar and rules as the receptionist.

const MAX_BODY_BYTES = 2_000;
const FIELDS = ["name", "mobile", "service", "date", "time", "job", "address", "notes"] as const;
const json = (status: number, body: object) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const date = q.get("date") ?? "";
  const service = q.get("service") ?? "";
  if (!isDate(date) || !service) return json(400, { error: "Invalid request" });
  try {
    return json(200, await availability({ service, date }));
  } catch (err) {
    console.error("[booking] availability error", err instanceof Error ? err.message : err);
    return json(500, { error: "Something went wrong" });
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json(403, { error: "Forbidden" });
  if (!req.headers.get("content-type")?.startsWith("application/json")) return json(415, { error: "Unsupported media type" });

  let input: BookingRequest | null = null;
  try {
    const raw = await req.text();
    const body = raw.length > MAX_BODY_BYTES ? null : JSON.parse(raw);
    if (body && FIELDS.every((f) => typeof body[f] === "string")) input = body;
  } catch {
    input = null;
  }
  if (!input) return json(400, { error: "Invalid request" });

  try {
    const result = await createBooking(input, { channel: "form", sender: clientIp(req) });
    return json(result.booked ? 200 : 409, result);
  } catch (err) {
    console.error("[booking] create error", err instanceof Error ? err.message : err);
    return json(500, { error: "Something went wrong" });
  }
}
