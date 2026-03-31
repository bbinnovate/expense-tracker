"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const valueStr = format(date, "yyyy-MM-dd");

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground px-1">Date</div>
      <label className="flex items-center gap-2 w-full h-12 px-3 bg-secondary rounded-xl cursor-pointer">
        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="flex-1 flex items-baseline gap-2">
          <span className="text-foreground font-medium">{format(date, "d MMM yyyy")}</span>
          {isToday && <span className="text-sm text-muted-foreground">Today</span>}
        </span>
        <input
          type="date"
          value={valueStr}
          onChange={(e) => e.target.value && onDateChange(parseISO(e.target.value))}
          className="absolute opacity-0 w-0 h-0"
        />
      </label>
    </div>
  );
}
