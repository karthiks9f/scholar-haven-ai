import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpenCheck, Loader2, NotebookPen, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { AuthGate } from "@/components/vault/AuthGate";
import { TopNav } from "@/components/vault/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SUBJECTS = [
  "2nd Language",
  "Mathematics",
  "Science",
  "Social Science",
  "Computer Science",
  "English",
] as const;

type Sheet = {
  id: string;
  topic: string;
  subject: string;
  grade: string;
  content: string;
  created_at: string;
  last_reviewed_at: string | null;
};

export const Route = createFileRoute("/revision")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Revision Sheets — Instant Snap Notes | StudentVault" },
      {
        name: "description",
        content:
          "Generate instant snap-note revision sheets for any topic, save them to your vault and re-read them before every test.",
      },
      { property: "og:title", content: "StudentVault Revision — instant snap notes" },
      {
        property: "og:description",
        content:
          "Type a topic and get a two-minute revision sheet with must-know points, formulas and a self-check.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RevisionPage,
});

function RevisionPage() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECTS[1]);
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const draftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    void supabase.auth.getSession().then(({ data: sessionData }) => {
      setSession(sessionData.session);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const profileQuery = useQuery({
    queryKey: ["profile", session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("grade, second_language")
        .maybeSingle();
      if (error) throw error;
      return data ?? { grade: "9th Grade", second_language: "Kannada" };
    },
  });

  const sheetsQuery = useQuery({
    queryKey: ["revision-sheets", session?.user.id],
    enabled: Boolean(session),
    queryFn: async (): Promise<Sheet[]> => {
      const { data, error } = await supabase
        .from("revision_sheets")
        .select("id, topic, subject, grade, content, created_at, last_reviewed_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Sheet[];
    },
  });

  const saveSheet = useMutation({
    mutationFn: async (sheet: { topic: string; subject: string; grade: string; content: string }) => {
      const { error } = await supabase.from("revision_sheets").insert({
        user_id: session!.user.id,
        ...sheet,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["revision-sheets", session?.user.id] });
      setDraft("");
      setTopic("");
      toast.success("Saved to your revision shelf");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save that sheet"),
  });

  const deleteSheet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("revision_sheets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["revision-sheets", session?.user.id] });
      toast.success("Sheet removed");
    },
  });

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    const cleanTopic = topic.trim();
    if (!cleanTopic) return;
    setGenerating(true);
    setDraft("");
    try {
      const grade = profileQuery.data?.grade ?? "9th Grade";
      const resolvedSubject =
        subject === "2nd Language"
          ? `2nd Language · ${profileQuery.data?.second_language ?? "Kannada"}`
          : subject;
      const response = await fetch("/api/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: cleanTopic, subject: resolvedSubject, grade }),
      });
      if (!response.ok || !response.body) {
        throw new Error(await response.text());
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setDraft(text);
        draftRef.current?.scrollIntoView({ block: "nearest" });
      }
      if (!text.trim()) throw new Error("The sheet came back empty — try again.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build that sheet");
    } finally {
      setGenerating(false);
    }
  }

  async function openSheet(sheet: Sheet) {
    const next = openId === sheet.id ? null : sheet.id;
    setOpenId(next);
    if (next) {
      await supabase
        .from("revision_sheets")
        .update({ last_reviewed_at: new Date().toISOString() })
        .eq("id", sheet.id);
      void queryClient.invalidateQueries({ queryKey: ["revision-sheets", session?.user.id] });
    }
  }

  const filteredSheets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const sheets = sheetsQuery.data ?? [];
    if (!needle) return sheets;
    return sheets.filter(
      (sheet) =>
        sheet.topic.toLowerCase().includes(needle) || sheet.subject.toLowerCase().includes(needle),
    );
  }, [sheetsQuery.data, query]);

  if (!authReady) {
    return (
      <div className="relative z-10 grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
      </div>
    );
  }

  if (!session) return <AuthGate />;

  return (
    <div className="relative z-10 min-h-screen">
      <TopNav
        email={session.user.email ?? "student"}
        query={query}
        onQueryChange={setQuery}
        onSignOut={() => {
          void supabase.auth.signOut().then(() => {
            queryClient.clear();
            toast.success("Signed out");
          });
        }}
      />

      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 sm:px-6">
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          <NotebookPen className="h-3.5 w-3.5" /> Revision
        </p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Instant <span className="gradient-text">snap notes</span> for any topic
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Type a topic, get a two-minute revision sheet — must-know points, formulas, a snap example
          and a self-check. Save it and re-read it before the test.
        </p>

        <form onSubmit={generate} className="glass mt-7 rounded-3xl p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                maxLength={200}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. Quadratic equations, Photosynthesis, French Revolution"
                className="h-11 rounded-xl border-border bg-surface-raised"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface-raised px-3 text-sm sm:w-56"
              >
                {SUBJECTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            type="submit"
            disabled={generating || !topic.trim()}
            className="mt-4 h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-primary-glow sm:w-auto sm:px-6"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Writing your sheet…" : "Generate snap notes"}
          </Button>
        </form>

        {draft ? (
          <section ref={draftRef} className="glass mt-6 rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold">New sheet · {topic || "Untitled"}</h2>
              <Button
                onClick={() =>
                  saveSheet.mutate({
                    topic: topic.trim() || "Untitled topic",
                    subject,
                    grade: profileQuery.data?.grade ?? "9th Grade",
                    content: draft,
                  })
                }
                disabled={generating || saveSheet.isPending}
                variant="outline"
                className="h-10 rounded-xl border-border-bright bg-surface-raised hover:bg-accent"
              >
                {saveSheet.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BookOpenCheck className="h-4 w-4" />
                )}
                Save sheet
              </Button>
            </div>
            <div className="prose prose-invert prose-sm mt-4 max-w-none">
              <ReactMarkdown components={{ a: ({ children }) => <span>{children}</span> }}>
                {draft}
              </ReactMarkdown>
            </div>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Your revision shelf</h2>
          {sheetsQuery.isPending ? (
            <div className="mt-6 grid place-items-center rounded-3xl border border-border py-14">
              <Loader2 className="h-5 w-5 animate-spin text-primary-glow" />
            </div>
          ) : filteredSheets.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No saved sheets yet. Generate one above and hit “Save sheet”.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {filteredSheets.map((sheet) => (
                <li key={sheet.id} className="glass rounded-2xl p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => void openSheet(sheet)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="font-display truncate text-base font-bold">{sheet.topic}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {sheet.subject} · {sheet.grade}
                        {sheet.last_reviewed_at
                          ? ` · last read ${new Date(sheet.last_reviewed_at).toLocaleDateString()}`
                          : ""}
                      </p>
                    </button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => void openSheet(sheet)}
                        className="h-9 rounded-xl text-primary-glow hover:bg-accent"
                      >
                        {openId === sheet.id ? "Close" : "Read"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${sheet.topic}`}
                        onClick={() => deleteSheet.mutate(sheet.id)}
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-accent hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {openId === sheet.id ? (
                    <div className="prose prose-invert prose-sm mt-4 max-w-none border-t border-border pt-4">
                      <ReactMarkdown components={{ a: ({ children }) => <span>{children}</span> }}>
                        {sheet.content}
                      </ReactMarkdown>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
