"use client";

import { Plus, Check, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTab = "add" | "overview";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onSave: () => void;
  canSave: boolean;
}

export function BottomNav({
  activeTab,
  onTabChange,
  onSave,
  canSave,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border safe-bottom z-50">
      <div className="flex items-center max-w-lg mx-auto h-14">
        {/* Add - 25% */}
        <button
          onClick={() => onTabChange("add")}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 h-full",
            "w-1/4 text-muted-foreground transition-colors",
            activeTab === "add" && "text-primary",
          )}
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-medium">Add</span>
        </button>

        {/* Save - 50% */}
        <button
          onClick={onSave}
          disabled={!canSave}
          className={cn(
            "flex items-center justify-center gap-2 h-10 mx-2",
            "w-1/2 rounded-xl font-semibold text-sm",
            "transition-all duration-200",
            "bg-primary text-primary-foreground",
            "active:scale-[0.97]",
            "disabled:opacity-30 disabled:cursor-not-allowed",
            canSave && "animate-pulse-glow",
          )}
        >
          <Check className="w-4 h-4" />
          Save
        </button>

        {/* Overview - 25% */}
        <button
          onClick={() => onTabChange("overview")}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 h-full",
            "w-1/4 text-muted-foreground transition-colors",
            activeTab === "overview" && "text-primary",
          )}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-xs font-medium">Overview</span>
        </button>
      </div>
      <div className="flex flex-col items-center pt-1 pb-1 gap-1">
        <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <a
          href="https://bombayblokes.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors"
        >
          made by <span className="text-primary/80 font-medium">Bombay Blokes</span>
        </a>
      </div>
    </nav>
  );
}
