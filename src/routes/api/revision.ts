import { createFileRoute } from "@tanstack/react-router";

type RevisionBody = { topic?: string; subject?: string; grade?: string };

const SYSTEM_PROMPT = `You are "Snap Notes", a revision-sheet generator for a high school student.
Produce an ultra-scannable revision sheet the student can read in 2 minutes right before a test.

STRICT RULES
- Never mention or link to any website, app, video, channel or external resource. No URLs, no markdown links.
- Everything the student needs must be inside the sheet itself.

FORMAT (markdown, tight, no long paragraphs):
## <Topic>
**In one line:** one-sentence definition.
**Must-know points** — 5 to 7 bullets, each under 15 words, bolding key terms.
**Formulas / rules / key dates** — only if relevant; show them plainly.
**Worked snap example** — one tiny example solved in 2-3 steps.
**Common mistakes** — 2 bullets.
**Quick self-check** — 3 short questions, then **Answers:** on one line.

Keep the whole sheet under 250 words. Match the difficulty to the student's grade.`;

export const Route = createFileRoute("/api/revision")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as RevisionBody;
        const topic = String(body.topic ?? "").trim().slice(0, 300);
        const subject = String(body.subject ?? "General").trim().slice(0, 120);
        const grade = String(body.grade ?? "9th Grade").trim().slice(0, 60);
        if (!topic) return new Response("A topic is required", { status: 400 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured", { status: 500 });

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
              {
                role: "user",
                content: `Make a revision snap-note sheet.\nTopic: ${topic}\nSubject: ${subject}\nGrade: ${grade}`,
              },
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text();
          console.error(`AI gateway error [${upstream.status}]: ${detail}`);
          const message =
            upstream.status === 429
              ? "Too many sheets at once — try again in a moment."
              : upstream.status === 402
                ? "The AI workspace is out of credits. Add credits to keep generating sheets."
                : "Could not build that revision sheet right now.";
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
                    const event = JSON.parse(payload) as { type?: string; delta?: string };
                    if (event.type === "response.output_text.delta" && event.delta) {
                      controller.enqueue(encoder.encode(event.delta));
                    }
                  } catch {
                    // ignore partial / keepalive frames
                  }
                }
              }
            } catch (error) {
              console.error("Revision stream failed", error);
            } finally {
              controller.close();
              reader.releaseLock();
            }
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
