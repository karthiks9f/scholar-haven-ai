import { useEffect, useRef } from "react";
import { LayoutGrid, LogOut, NotebookPen, Search, UserRound, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


type TopNavProps = {
  email: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSignOut: () => void;
};

export function TopNav({ email, query, onQueryChange, onSignOut }: TopNavProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (event.key === "Escape" && document.activeElement === inputRef.current) {
        onQueryChange("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onQueryChange]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-center gap-3">
          <span className="period-pill grid h-10 w-10 shrink-0 place-items-center rounded-2xl">
            <Zap className="h-5 w-5" />
          </span>
          <span className="font-display truncate text-lg font-extrabold tracking-tight sm:text-xl">
            StudentVault <span className="gradient-text">⚡</span>
          </span>
          <nav className="ml-1 hidden items-center gap-1 md:flex">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-surface-raised [&.active]:text-foreground"
            >
              <LayoutGrid className="h-4 w-4" />
              Classes
            </Link>
            <Link
              to="/revision"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-surface-raised [&.active]:text-foreground"
            >
              <NotebookPen className="h-4 w-4" />
              Revision
            </Link>
          </nav>
        </div>


        <div className="relative order-3 col-span-2 lg:order-none lg:col-span-1 lg:max-w-lg lg:justify-self-center">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search subjects, teachers or links…"
            aria-label="Quick search"
            className="h-11 rounded-xl border-border bg-surface-raised pr-20 pl-9 placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-border-bright bg-secondary px-2 py-1 font-sans text-[11px] font-semibold text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold">Logged in as Student</p>
            <p className="max-w-[13rem] truncate text-[11px] text-muted-foreground">{email}</p>
          </div>
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border-bright bg-surface-raised">
            <UserRound className="h-5 w-5 text-primary-glow" />
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-background bg-success" />
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={onSignOut}
            className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
