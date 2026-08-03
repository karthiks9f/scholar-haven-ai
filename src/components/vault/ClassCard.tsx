import { ArrowUpRight, Mail, Trash2 } from "lucide-react";

import { AddLinkDialog } from "@/components/vault/AddLinkDialog";
import {
  hostnameOf,
  iconForCategory,
  type ClassRecord,
  type LinkCategory,
} from "@/lib/vault";

type ClassCardProps = {
  record: ClassRecord;
  saving: boolean;
  onAddLink: (input: { title: string; url: string; category: LinkCategory }) => Promise<void>;
  onRemoveLink: (linkId: string) => void;
};

export function ClassCard({ record, saving, onAddLink, onRemoveLink }: ClassCardProps) {
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

      <ul className="mt-5 flex-1 space-y-2">
        {record.resource_links.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            No links yet for this class.
          </li>
        ) : null}
        {record.resource_links.map((link) => {
          const Icon = iconForCategory(link.category);
          return (
            <li key={link.id} className="group flex items-center gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-transparent bg-surface-raised px-3 py-2.5 transition-all hover:border-border-bright hover:bg-accent"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary-glow">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{link.title}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {link.category} · {hostnameOf(link.url)}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <button
                type="button"
                aria-label={`Remove ${link.title}`}
                onClick={() => onRemoveLink(link.id)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive focus-visible:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <AddLinkDialog subject={record.subject} saving={saving} onAdd={onAddLink} />
    </article>
  );
}
