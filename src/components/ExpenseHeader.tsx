"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ExpenseHeaderProps {
  currentMonth: Date;
  date: Date;
  onDateChange: (date: Date) => void;
  totalSpent: number;
}

export function ExpenseHeader({
  currentMonth,
  date,
  onDateChange,
  totalSpent,
}: ExpenseHeaderProps) {
  const isToday =
    format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="px-3 pt-2 pb-2">
      <div className="flex items-center justify-between bg-secondary/50 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">{format(currentMonth, "MMM yyyy")}</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-xs font-semibold text-primary">₹{totalSpent.toLocaleString("en-IN")}</span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto py-0.5 px-2 hover:bg-secondary rounded-lg gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-medium text-foreground">{format(date, "d MMM")}</span>
              {isToday && <span className="text-[10px] text-muted-foreground">Today</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border-border" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && onDateChange(d)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
