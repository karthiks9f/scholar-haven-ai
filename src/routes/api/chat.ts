import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatBody = { messages?: ChatMessage[] };

const SYSTEM_PROMPT = `You are "Study Buddy AI", a friendly, high-energy study assistant for a high school student using the StudentVault dashboard.
Their classes are: Period 1 AP European History, Period 2 Pre-Calculus, Period 3 Biology, Period 4 English Literature, Period 5 Computer Science, Period 6 Art & Design.
Always answer in tight, structured markdown bullet points with short bold labels. Keep answers under 200 words unless the student asks for more.
Never invent grades or teacher messages. If the student pastes notes, summarize them faithfully.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("AI is not configured", { status: 500 });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-5.6-sol",
            stream: true,
            store: false,
            input: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages.slice(-14).map((m) => ({
                role: m.role,
                content: String(m.content ?? "").slice(0, 8000),
              })),
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text();
          console.error(`AI gateway error [${upstream.status}]: ${detail}`);
          const message =
            upstream.status === 429
              ? "Study Buddy is getting a lot of questions right now — try again in a moment."
              : upstream.status === 402
                ? "The AI workspace is out of credits. Add credits to keep chatting."
                : "Study Buddy could not answer that right now.";
          return new Response(message, { status: upstream.status === 429 ? 429 : 502 });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const payload = trimmed.slice(5).trim();
                  if (!payload || payload === "[DONE]") continue;
                  try {
                    const event = JSON.parse(payload) as {
                      type?: string;
                      delta?: string;
                    };
                    if (event.type === "response.output_text.delta" && event.delta) {
                      controller.enqueue(encoder.encode(event.delta));
                    }
                  } catch {
                    // ignore partial / non-JSON keepalive frames
                  }
                }
              }
            } catch (error) {
              console.error("AI stream failed", error);
            } finally {
              controller.close();
              reader.releaseLock();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
