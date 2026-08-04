import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Loader2, Timer } from "lucide-react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { AuthGate } from "@/components/vault/AuthGate";
import { ClassCard } from "@/components/vault/ClassCard";
import { PomodoroTimer } from "@/components/vault/PomodoroTimer";
import { StudyBuddy } from "@/components/vault/StudyBuddy";
import { TopNav } from "@/components/vault/TopNav";
import { GradeSelect } from "@/components/vault/GradeSelect";
import { Button } from "@/components/ui/button";
import type { ClassRecord, LinkCategory } from "@/lib/vault";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "StudentVault — Class Links, Schedule & AI Study Buddy" },
      {
        name: "description",
        content:
          "StudentVault keeps every class period, teacher contact and study link in one dark dashboard, with a Pomodoro timer and an AI Study Buddy.",
      },
      { property: "og:title", content: "StudentVault — Your class resource dashboard" },
      {
        property: "og:description",
        content:
          "One dashboard for your six class periods, resource links, focus timer and AI Study Buddy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [query, setQuery] = useState("");
  const [timerOpen, setTimerOpen] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    void supabase.auth.getSession().then(({ data: sessionData }) => {
      setSession(sessionData.session);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const classesQuery = useQuery({
    queryKey: ["classes", session?.user.id],
    enabled: Boolean(session),
    queryFn: async (): Promise<ClassRecord[]> => {
      const load = async () => {
        const { data, error } = await supabase
          .from("classes")
          .select("id, period, subject, teacher, teacher_email, room, resource_links(*)")
          .order("period", { ascending: true });
        if (error) throw error;
        return (data ?? []) as unknown as ClassRecord[];
      };

      let records = await load();
      if (records.length === 0) {
        const { error } = await supabase.rpc("seed_starter_schedule");
        if (error) throw error;
        records = await load();
      }
      return records.map((record) => ({
        ...record,
        resource_links: [...record.resource_links].sort((a, b) =>
          a.created_at.localeCompare(b.created_at),
        ),
      }));
    },
  });

  type Profile = { grade: string; second_language: string };

  const profileQuery = useQuery({
    queryKey: ["profile", session?.user.id],
    enabled: Boolean(session),
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("grade, second_language")
        .maybeSingle();
      if (error) throw error;
      if (data) return data;
      const { data: created, error: insertError } = await supabase
        .from("student_profiles")
        .insert({ user_id: session!.user.id })
        .select("grade, second_language")
        .single();
      if (insertError) throw insertError;
      return created;
    },
  });

  const setProfile = useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const next: Profile = {
        grade: profileQuery.data?.grade ?? "9th Grade",
        second_language: profileQuery.data?.second_language ?? "Kannada",
        ...patch,
      };
      const { error } = await supabase
        .from("student_profiles")
        .upsert({ user_id: session!.user.id, ...next }, { onConflict: "user_id" });
      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      queryClient.setQueryData(["profile", session?.user.id], next);
      toast.success("Saved");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save your settings"),
  });

  const addLink = useMutation({

    mutationFn: async (input: {
      classId: string;
      title: string;
      url: string;
      category: LinkCategory;
    }) => {
      const { error } = await supabase.from("resource_links").insert({
        class_id: input.classId,
        title: input.title,
        url: input.url,
        category: input.category,
        user_id: session!.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Link added");
      void queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not add link"),
  });

  const removeLink = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from("resource_links").delete().eq("id", linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Link removed");
      void queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not remove link"),
  });

  const filtered = useMemo(() => {
    const records = classesQuery.data ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records
      .map((record) => {
        const matchesClass =
          record.subject.toLowerCase().includes(needle) ||
          record.teacher.toLowerCase().includes(needle) ||
          `period ${record.period}`.includes(needle);
        const links = record.resource_links.filter(
          (link) =>
            link.title.toLowerCase().includes(needle) ||
            link.category.toLowerCase().includes(needle) ||
            link.url.toLowerCase().includes(needle),
        );
        if (matchesClass) return record;
        if (links.length > 0) return { ...record, resource_links: links };
        return null;
      })
      .filter((record): record is ClassRecord => record !== null);
  }, [classesQuery.data, query]);

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

      <main className="mx-auto max-w-7xl px-4 pt-8 pb-28 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              <CalendarDays className="h-3.5 w-3.5" /> Today's schedule
              {gradeQuery.data ? <span className="text-primary-glow">· {gradeQuery.data}</span> : null}
            </p>
            <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your <span className="gradient-text">six periods</span>, all in one vault
            </h1>
          </div>
          <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-1 sm:shrink-0">
            <GradeSelect
              value={gradeQuery.data ?? ""}
              disabled={gradeQuery.isPending || setGrade.isPending}
              onChange={(grade) => setGrade.mutate(grade)}
            />
            <Button
              onClick={() => setTimerOpen((prev) => !prev)}
              className="h-12 shrink-0 rounded-2xl bg-primary px-5 font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-primary-glow"
            >
              <Timer className="h-4 w-4" />
              {timerOpen ? "Hide study session" : "Start Study Session"}
            </Button>
          </div>

        </div>

        {timerOpen ? (
          <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <PomodoroTimer />
          </div>
        ) : null}

        {classesQuery.isPending ? (
          <div className="mt-10 grid place-items-center rounded-3xl border border-border py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
          </div>
        ) : classesQuery.isError ? (
          <p className="mt-10 rounded-3xl border border-destructive/40 p-6 text-sm text-destructive">
            We couldn't load your schedule. Refresh to try again.
          </p>
        ) : (
          <>
            <section
              aria-label="Class periods"
              className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {filtered.map((record) => (
                <ClassCard
                  key={record.id}
                  record={record}
                  saving={addLink.isPending}
                  onAddLink={async (input) => {
                    await addLink.mutateAsync({ classId: record.id, ...input });
                  }}
                  onRemoveLink={(linkId) => removeLink.mutate(linkId)}
                />
              ))}
            </section>
            {filtered.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                Nothing matches “{query}”. Try another subject, teacher or link name.
              </p>
            ) : null}
          </>
        )}
      </main>

      <StudyBuddy />
    </div>
  );
}
