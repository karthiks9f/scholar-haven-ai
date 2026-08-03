import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LINK_CATEGORIES, normalizeUrl, type LinkCategory } from "@/lib/vault";

type AddLinkDialogProps = {
  subject: string;
  saving: boolean;
  onAdd: (input: { title: string; url: string; category: LinkCategory }) => Promise<void>;
};

export function AddLinkDialog({ subject, saving, onAdd }: AddLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<LinkCategory>("Google Drive");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await onAdd({ title: title.trim(), url: normalizeUrl(url), category });
    setTitle("");
    setUrl("");
    setCategory("Google Drive");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-bright bg-transparent px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:border-primary hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Add Link
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-border-bright bg-popover sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold">New resource link</DialogTitle>
          <DialogDescription>Saved to {subject}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-title">Title</Label>
            <Input
              id="link-title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Unit 5 study guide"
              className="h-11 rounded-xl border-border bg-surface-raised"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://drive.google.com/…"
              className="h-11 rounded-xl border-border bg-surface-raised"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-category">Category tag</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as LinkCategory)}>
              <SelectTrigger
                id="link-category"
                className="h-11 rounded-xl border-border bg-surface-raised"
              >
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border-bright bg-popover">
                {LINK_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={saving}
              className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary-glow"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
