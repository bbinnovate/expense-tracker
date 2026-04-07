"use client";

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionInput({ value, onChange }: DescriptionInputProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        placeholder="What is this for?"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 50))}
        className="bg-white/5 text-sm text-foreground placeholder:text-muted-foreground/50 rounded-full px-5 py-2 border-0 focus:outline-none focus:bg-white/8 text-center w-64 transition-colors"
      />
    </div>
  );
}
