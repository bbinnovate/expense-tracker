"use client";

export function AdBannerTop() {
  return (
    <div className="w-full h-[50px] bg-muted/30 border-b border-border flex items-center justify-center shrink-0">
      <span className="text-xs text-muted-foreground/40 tracking-widest uppercase">Ad</span>
    </div>
  );
}

export function AdBannerInline() {
  return (
    <div className="w-full h-[50px] bg-muted/30 border-y border-border flex items-center justify-center">
      <span className="text-xs text-muted-foreground/40 tracking-widest uppercase">Ad</span>
    </div>
  );
}
