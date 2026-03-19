"use client";

import { Input } from "@/components/ui/input";

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionInput({ value, onChange }: DescriptionInputProps) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground px-1">
        Description (optional)
      </div>
      <Input
        type="text"
        inputMode="text"
        autoComplete="off"
        placeholder="e.g., milk packet, uber ride"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 50))}
        className="h-10 bg-secondary border-0 text-foreground placeholder:text-muted-foreground rounded-xl text-sm"
      />
    </div>
  );
}
