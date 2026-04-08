"use client";

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionInput({ value, onChange }: DescriptionInputProps) {
  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        placeholder="What is this for?"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 50))}
        className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 border-none outline-none text-center w-64 pb-1.5"
      />
      <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
}
