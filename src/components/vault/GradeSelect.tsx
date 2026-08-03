import { GraduationCap } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const GRADE_OPTIONS = [
  { value: "9th Grade", label: "9th Grade · Freshman" },
  { value: "10th Grade", label: "10th Grade · Sophomore" },
  { value: "11th Grade", label: "11th Grade · Junior" },
  { value: "12th Grade", label: "12th Grade · Senior" },
] as const;

type GradeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function GradeSelect({ value, onChange, disabled }: GradeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled ?? false}>
      <SelectTrigger
        aria-label="Select grade level"
        className="h-11 w-full rounded-xl border-border bg-surface-raised px-3 font-semibold sm:w-[220px]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <GraduationCap className="h-4 w-4 shrink-0 text-primary-glow" />
          <SelectValue placeholder="Select grade" />
        </span>
      </SelectTrigger>
      <SelectContent className="rounded-xl border-border bg-surface-raised">
        {GRADE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="rounded-lg">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
