import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { AuthGate } from "@/components/vault/AuthGate";

export const Route = createFileRoute("/signin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in to StudentVault — Free Study Dashboard" },
      {
        name: "description",
        content:
          "Sign in or create a free StudentVault account to unlock your class schedule, AI lessons and revision snap notes. Have an access key? Enter it here.",
      },
      { property: "og:title", content: "Sign in to StudentVault" },
      {
        property: "og:description",
        content: "Create a free StudentVault account or enter your access key.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://scholar-haven-ai.lovable.app/signin" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://scholar-haven-ai.lovable.app/signin" }],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    void supabase.auth.getSession().then(({ data: sessionData }) => {
      setSession(sessionData.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) void navigate({ to: "/dashboard" });
  }, [session, navigate]);

  if (!ready || session) {
    return (
      <div className="relative z-10 grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
      </div>
    );
  }

  return <AuthGate />;
}
