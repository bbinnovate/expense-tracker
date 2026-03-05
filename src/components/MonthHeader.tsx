"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="flex items-center justify-center gap-4 py-4">
      {showNavigation && (
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
      <div className="text-center">
        <div className="text-2xl font-semibold text-foreground">
          {format(currentMonth, "MMMM")}
        </div>
        <div className="text-sm text-muted-foreground">
          {format(currentMonth, "yyyy")}
        </div>
      </div>
      {showNavigation && (
        <button
          onClick={onNextMonth}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
