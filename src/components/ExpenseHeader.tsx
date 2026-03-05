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
    <div className="px-3 pt-3 pb-2 space-y-2">
      <div className="flex items-stretch gap-2">
        <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 flex flex-col justify-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Month
          </div>
          <div className="text-base font-semibold text-foreground">
            {format(currentMonth, "MMM yyyy")}
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 h-auto flex-col items-start justify-center gap-0.5 py-2 px-3",
                "bg-secondary/50 rounded-lg hover:bg-secondary/70",
              )}
            >
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider w-full text-left">
                Date
              </div>
              <div className="flex items-center gap-1.5 text-foreground w-full">
                <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium">
                  {isToday ? "Today" : format(date, "d MMM")}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-popover border-border"
            align="end"
          >
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

      <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-md bg-card/50 border border-border/50">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          This month:
        </span>
        <span className="text-xs font-mono font-medium text-primary">
          ₹{totalSpent.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
