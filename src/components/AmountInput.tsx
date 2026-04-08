"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, disabled }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Only allow numbers and one decimal point
      if (!/^\d*\.?\d{0,2}$/.test(newValue) && newValue !== "") {
        return;
      }

      onChange(newValue);
    };

    const displayAmount = value || "0";

    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground text-2xl mr-1">₹</span>
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder="0"
            size={Math.max(1, (value || "0").length)}
            className={cn(
              "amount-display text-foreground bg-transparent border-none outline-none",
              "text-center",
              "placeholder:text-muted-foreground/50",
              "focus:ring-0",
            )}
          />
        </div>
        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>
    );
  },
);

AmountInput.displayName = "AmountInput";
