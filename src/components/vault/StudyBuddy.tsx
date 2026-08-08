import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageSquarePlus, Send, Sparkle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  {
    label: "Teach me a topic",
    prompt:
      "Teach me quadratic equations from scratch for my Mathematics class — explain it, show a fully worked example step by step, then give me 2 practice questions with solutions at the end. Don't send me to any website.",
  },
  {
    label: "Explain it simpler",
    prompt:
      "Explain photosynthesis for my Science class as if I'm hearing it for the first time — simple words, an analogy, and the full process step by step. Teach it here, no links.",
  },
  {
    label: "Quiz me & explain",
    prompt:
      "Quiz me with 3 questions on my Social Science unit, then explain the correct answer for each one so I actually understand it.",
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "seed-1",
    role: "assistant",
    content:
      "**Hey! I'm your Study Buddy ⚡**\n\nI don't hand out links — I teach you the topic right here. Tell me what you're stuck on and I'll:\n\n- **Explain** it from scratch in plain words\n- **Work through** an example step by step\n- **Quiz you** and explain every answer",
  },
  {
    id: "seed-2",
    role: "user",
    content: "Can you teach me how to find the slope of a line? I have a Maths test Thursday.",
  },
  {
    id: "seed-3",
    role: "assistant",
    content:
      "**Slope = steepness of a line**\n\nIt answers: for every step right, how far do we go up or down?\n\n**The rule:** slope m = (y₂ − y₁) ÷ (x₂ − x₁) — \"rise over run\".\n\n**Worked example** — points (2, 3) and (6, 11):\n\n- Rise: 11 − 3 = **8**\n- Run: 6 − 2 = **4**\n- m = 8 ÷ 4 = **2** → the line climbs 2 units for every 1 unit right.\n\n**Watch out:** subtract the y's and x's in the *same* order, or you get the sign wrong.\n\n**Your turn:** find the slope through (1, 5) and (4, −1). Tell me your answer and I'll check your working.",
  },
];


export function StudyBuddy() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open && !streaming) inputRef.current?.focus();
  }, [open, streaming]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || streaming) return;

    const history = [...messages, { id: crypto.randomUUID(), role: "user" as const, content: question }];
    const replyId = crypto.randomUUID();
    setMessages([...history, { id: replyId, role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok || !response.body) {
        const detail = await response.text();
        throw new Error(detail || "Study Buddy is unavailable right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((message) => (message.id === replyId ? { ...message, content: answer } : message)),
        );
      }
      if (!answer.trim()) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === replyId
              ? { ...message, content: "_I didn't get an answer back — try asking again._" }
              : message,
          ),
        );
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Something went wrong.";
      setMessages((prev) =>
        prev.map((message) => (message.id === replyId ? { ...message, content: `⚠️ ${detail}` } : message)),
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="period-pill fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold transition-transform hover:scale-[1.03] sm:right-6 sm:bottom-6"
      >
        <Bot className="h-5 w-5" />
        Ask AI Study Buddy
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close AI panel"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <aside className="glass relative flex h-full w-full max-w-md flex-col border-l border-border-bright sm:rounded-l-3xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="period-pill grid h-10 w-10 shrink-0 place-items-center rounded-2xl">
                  <Sparkle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display truncate text-base font-extrabold">Study Buddy AI</p>
                  <p className="text-[11px] text-muted-foreground">
                    {streaming ? "Teaching…" : "Teaches your topics — no links"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="New conversation"
                  onClick={() => setMessages(INITIAL_MESSAGES)}
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div ref={scrollRef} className="scroll-slim flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[92%] text-sm leading-relaxed",
                      message.role === "user"
                        ? "rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 font-medium text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {message.role === "assistant" && !message.content ? (
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                      </span>
                    ) : (
                      <div className="space-y-2 [&_a]:text-primary-glow [&_a]:underline [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:font-bold">
                        <ReactMarkdown
                          components={{
                            a: ({ children }) => <span>{children}</span>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={streaming}
                    onClick={() => void send(item.prompt)}
                    className="rounded-xl border border-border bg-surface-raised px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-all hover:border-primary hover:text-foreground disabled:opacity-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void send(input);
                }}
                className="mt-3 flex items-end gap-2"
              >
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send(input);
                    }
                  }}
                  rows={2}
                  placeholder="Paste notes, a topic, or an assignment…"
                  className="max-h-40 min-h-[3rem] flex-1 resize-none rounded-xl border-border bg-surface-raised text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={streaming || !input.trim()}
                  aria-label="Send message"
                  className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow"
                >
                  {streaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
