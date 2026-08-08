import { BookOpen, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { iconForCategory, type ClassRecord } from "@/lib/vault";

type ClassCardProps = {
  record: ClassRecord;
  onTeach: (topic?: string) => void;
};

export function ClassCard({ record, onTeach }: ClassCardProps) {
  return (
    <article className="glass glass-hover flex flex-col rounded-3xl p-5 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <span className="period-pill inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase">
            Period {record.period}
          </span>
          <h3 className="font-display mt-3 truncate text-xl font-extrabold tracking-tight">
            {record.subject}
          </h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {record.teacher}
            {record.room ? ` · ${record.room}` : ""}
          </p>
        </div>
        <a
          href={`mailto:${record.teacher_email}`}
          aria-label={`Email ${record.teacher}`}
          title={record.teacher_email}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-raised text-muted-foreground transition-all hover:border-primary hover:text-primary-glow"
        >
          <Mail className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-5 flex-1 space-y-2">
        {record.resource_links.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            Choose the class lesson below to begin learning.
          </p>
        ) : null}
        {record.resource_links.map((link) => {
          const Icon = iconForCategory(link.category);
          return (
            <Button
              key={link.id}
              type="button"
              variant="ghost"
              onClick={() => onTeach(link.title)}
              className="group h-auto w-full justify-start gap-3 rounded-xl border border-transparent bg-surface-raised px-3 py-2.5 text-left hover:border-border-bright hover:bg-accent"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary-glow">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{link.title}</span>
                <span className="block text-[11px] font-normal text-muted-foreground">
                  In-app lesson · explanation & practice
                </span>
              </span>
              <BookOpen className="h-4 w-4 shrink-0 text-primary-glow opacity-70 transition-opacity group-hover:opacity-100" />
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        onClick={() => onTeach()}
        className="mt-4 h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary-glow"
      >
        <Sparkles className="h-4 w-4" />
        Teach me {record.subject}
      </Button>
    </article>
  );
}
