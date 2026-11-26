import Anthropic from "@anthropic-ai/sdk";
import { availability, createBooking, type AvailabilityRequest, type BookingRequest, type Sender } from "./bookings";
import { serviceNames, shop } from "./shop";
import { contextBlock, SYSTEM_PROMPT } from "./prompt";

// The receptionist itself, independent of where the conversation happens: the website's
// /api/chat is one channel, and WhatsApp or Instagram can call reply() the same way.

const MODEL = "claude-haiku-5-5";
// Room for adaptive thinking, tool calls and a confirmation; 400 could end in an empty reply.
const MAX_OUTPUT_TOKENS = 2000;
const MAX_TOOL_ROUNDS = 4;

const client = new Anthropic();

const SERVICE = { type: "string", enum: serviceNames, description: "The service, exactly as named in the list." };

const TOOLS: Anthropic.Tool[] = [
  {
    name: "check_availability",
    description:
      "List Leon's free job start times on a date for a service, in Perth time. Returns the next day with free times when that date has none.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        service: SERVICE,
        date: { type: "string", description: "The date, as YYYY-MM-DD." },
      },
      required: ["service", "date"],
      additionalProperties: false,
    },
  },
  {
    name: "book_appointment",
    description:
      "Book a cleaning job with Leon. It is booked the moment this succeeds, so call it only once the customer has chosen the service and time and given a name, mobile number, the job details and the address.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The customer's full name." },
        mobile: { type: "string", description: "A mobile number, as given." },
        service: SERVICE,
        date: { type: "string", description: "The date, as YYYY-MM-DD." },
        time: { type: "string", description: "A time from check_availability, as HH:MM." },
        job: { type: "string", description: "What needs cleaning, e.g. '3 bedrooms, lounge and hallway, dog urine stain in the lounge' or '3-seater fabric sofa and 2 rugs'." },
        address: { type: "string", description: "The street address and suburb, as given (at least the suburb)." },
        notes: { type: "string", description: "Anything else they mentioned: allergies or no harsh chemicals, parking, a rental inspection date, access instructions. Empty if none." },
      },
      required: ["name", "mobile", "service", "date", "time", "job", "address", "notes"],
      additionalProperties: false,
    },
  },
];

async function runTool(tool: Anthropic.ToolUseBlock, from: Sender): Promise<Anthropic.ToolResultBlockParam> {
  try {
    const result =
      tool.name === "check_availability"
        ? await availability(tool.input as AvailabilityRequest)
        : await createBooking(tool.input as BookingRequest, from);
    return { type: "tool_result", tool_use_id: tool.id, content: JSON.stringify(result) };
  } catch (err) {
    console.error("[receptionist] tool error", tool.name, err instanceof Error ? err.message : err);
    return { type: "tool_result", tool_use_id: tool.id, is_error: true, content: "The calendar is unavailable right now." };
  }
}

/** Streams the receptionist's reply, running its tools along the way. */
export async function* reply(messages: Anthropic.MessageParam[], from: Sender): AsyncGenerator<string> {
  const convo = [...messages];
  let sent = false;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      tools: TOOLS,
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        { type: "text", text: contextBlock() },
      ],
      messages: convo,
    });

    // Text is held until the round ends: if the round ends in a tool call, its text is dropped.
    // Otherwise the model sometimes names times before checking the calendar and then corrects
    // itself ("Wait, I need to correct that") in the same reply.
    let held = "";
    let done = false;
    try {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") held += event.delta.text;
      }
      done = true;
    } finally {
      if (!done) stream.abort(); // the visitor left mid-reply
    }

    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      yield "I can't help with that here. Please call or text Leon on 0417 915 839.";
      return;
    }
    if (final.stop_reason !== "tool_use") {
      if (held.trim()) {
        yield held;
        sent = true;
      }
      if (final.stop_reason === "max_tokens" && sent) yield "…";
      if (!sent) {
        console.error("[receptionist] no text in reply", final.stop_reason);
        yield `Sorry, I couldn't answer that just now. Please call or text Leon on ${shop.phoneDisplay}`;
      }
      return;
    }

    const calls = final.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    convo.push({ role: "assistant", content: final.content });
    convo.push({ role: "user", content: await Promise.all(calls.map((c) => runTool(c, from))) });
  }

  console.error("[receptionist] ran out of tool rounds");
  yield `Sorry, I couldn't finish that. Please call or text Leon on ${shop.phoneDisplay}`;
}
