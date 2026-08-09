import { useState } from "react";
import { GraduationCap, KeyRound, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { redeemAccessKey } from "@/lib/guest-access.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthGate() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const redeem = useServerFn(redeemAccessKey);

  async function handleAccessKey(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await redeem({ data: { key: accessKey } });
      if (!result.ok) {
        toast.error("That access key isn't valid.");
        return;
      }
      const { error } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: result.tokenHash,
      });
      if (error) throw error;
      toast.success("Welcome in — guest access granted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not use that key");
    } finally {
      setBusy(false);
    }
  }


  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setSentConfirmation(true);
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    setBusy(false);
  }

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass w-full max-w-md rounded-3xl p-7 sm:p-9">
        <div className="flex items-center gap-3">
          <span className="period-pill grid h-11 w-11 shrink-0 place-items-center rounded-2xl">
            <Zap className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display truncate text-2xl font-extrabold tracking-tight">
              StudentVault
            </h1>
            <p className="text-xs text-muted-foreground">Your classes, links and study tools.</p>
          </div>
        </div>

        {sentConfirmation ? (
          <div className="mt-7 rounded-2xl border border-border-bright bg-surface-raised p-5 text-sm">
            <p className="font-semibold">Confirm your email</p>
            <p className="mt-1 text-muted-foreground">
              We sent a confirmation link to <span className="text-foreground">{email}</span>. Open
              it, then come back and sign in.
            </p>
            <Button
              variant="ghost"
              className="mt-4 px-0 text-primary-glow hover:bg-transparent hover:text-primary-glow"
              onClick={() => {
                setSentConfirmation(false);
                setMode("signin");
              }}
            >
              Back to sign in
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">School email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@northridgehs.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-border bg-surface-raised"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-border bg-surface-raised"
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary-glow"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mode === "signup" ? "Create my vault" : "Enter my vault"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={handleGoogle}
              className="h-11 w-full rounded-xl border-border-bright bg-surface-raised hover:bg-accent"
            >
              <GraduationCap className="h-4 w-4" />
              Continue with Google
            </Button>

            {showKey ? (
              <form onSubmit={handleAccessKey} className="mt-4 space-y-2">
                <Label htmlFor="access-key">Access key</Label>
                <Input
                  id="access-key"
                  type="password"
                  required
                  autoComplete="off"
                  placeholder="Paste the key you were given"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="h-11 rounded-xl border-border bg-surface-raised"
                />
                <Button
                  type="submit"
                  disabled={busy}
                  variant="outline"
                  className="h-11 w-full rounded-xl border-border-bright bg-surface-raised hover:bg-accent"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  Enter without an account
                </Button>
              </form>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowKey(true)}
                className="mt-3 h-10 w-full rounded-xl text-muted-foreground hover:text-foreground"
              >
                <KeyRound className="h-4 w-4" />
                I have an access key
              </Button>
            )}


            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signup" ? "Already have a vault?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="font-semibold text-primary-glow transition-colors hover:text-foreground"
              >
                {mode === "signup" ? "Sign in" : "Create an account"}
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
