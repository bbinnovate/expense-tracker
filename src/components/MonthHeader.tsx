"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

interface MonthHeaderProps {
  currentMonth: Date;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  showNavigation?: boolean;
}

export function MonthHeader({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  showNavigation = false,
}: MonthHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        {showNavigation && (
          <button onClick={onPrevMonth} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <div>
          <span className="text-lg font-semibold text-foreground">{format(currentMonth, "MMMM")}</span>
          <span className="text-lg font-semibold text-muted-foreground ml-1.5">{format(currentMonth, "yyyy")}</span>
        </div>
        {showNavigation && (
          <button onClick={onNextMonth} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <UserButton />
    </div>
  );
}
