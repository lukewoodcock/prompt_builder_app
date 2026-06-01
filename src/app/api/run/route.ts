import { NextResponse } from "next/server";
import { runRequestSchema } from "@/lib/validation";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";

/**
 * GET /api/run — reports whether the optional LLM feature is enabled.
 * The client uses this to decide whether to show the "Send to model" button.
 * The API key itself is never returned, only a boolean.
 */
export function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.ANTHROPIC_API_KEY) });
}

/**
 * POST /api/run — sends the assembled prompt (and optional prefill) to the
 * Anthropic Messages API. The API key is read server-side only.
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "LLM feature is disabled. Set ANTHROPIC_API_KEY on the server to enable it.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = runRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { prompt, prefill, model } = parsed.data;

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    { role: "user", content: prompt },
  ];
  // Prefill becomes the start of the assistant turn, if provided.
  if (prefill && prefill.trim() !== "") {
    messages.push({ role: "assistant", content: prefill });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        max_tokens: 4096,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Anthropic API error (${res.status}).`, details: errText },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text =
      data.content
        ?.filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("") ?? "";

    // Re-attach the prefill so the client sees the full assistant message.
    return NextResponse.json({ text: (prefill || "") + text });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to reach the Anthropic API.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}
