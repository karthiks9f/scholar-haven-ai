import { Languages } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LANGUAGE_OPTIONS = [
  { value: "Kannada", label: "Kannada · ಕನ್ನಡ" },
  { value: "Sanskrit", label: "Sanskrit · संस्कृतम्" },
  { value: "Hindi", label: "Hindi · हिन्दी" },
] as const;

type LanguageSelectProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function LanguageSelect({ value, onChange, disabled }: LanguageSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled ?? false}>
      <SelectTrigger
        aria-label="Select second language"
        className="h-11 w-full rounded-xl border-border bg-surface-raised px-3 font-semibold sm:w-[210px]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Languages className="h-4 w-4 shrink-0 text-primary-glow" />
          <SelectValue placeholder="2nd language" />
        </span>
      </SelectTrigger>
      <SelectContent className="z-[80] rounded-xl border-border bg-popover shadow-2xl">
        {LANGUAGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="rounded-lg">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
