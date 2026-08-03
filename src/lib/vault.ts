import {
  BookMarked,
  FolderOpen,
  GraduationCap,
  Layers,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";

export const LINK_CATEGORIES = [
  "Google Drive",
  "Quizlet",
  "Canvas",
  "Syllabus",
  "Other",
] as const;

export type LinkCategory = (typeof LINK_CATEGORIES)[number];

export type ResourceLink = {
  id: string;
  class_id: string;
  title: string;
  url: string;
  category: string;
  created_at: string;
};

export type ClassRecord = {
  id: string;
  period: number;
  subject: string;
  teacher: string;
  teacher_email: string;
  room: string | null;
  resource_links: ResourceLink[];
};

export const categoryIcon: Record<string, LucideIcon> = {
  "Google Drive": FolderOpen,
  Quizlet: Layers,
  Canvas: GraduationCap,
  Syllabus: BookMarked,
  Other: LinkIcon,
};

export function iconForCategory(category: string): LucideIcon {
  return categoryIcon[category] ?? LinkIcon;
}

export function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return value;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
