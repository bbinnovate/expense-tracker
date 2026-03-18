"use client";

import { useCallback } from "react";
import { Delete, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function NumericKeypad({
  value,
  onChange,
  onSubmit,
  disabled,
}: NumericKeypadProps) {
  const handleKeyPress = useCallback(
    (key: string) => {
      if (disabled) return;

      if (key === "delete") {
        onChange(value.slice(0, -1));
        return;
      }

      if (key === ".") {
        if (value.includes(".")) return;
        onChange(value + ".");
        return;
      }

      // Prevent leading zeros (except for "0.")
      if (value === "0" && key !== ".") {
        onChange(key);
        return;
      }

      // Limit decimal places to 2
      const parts = value.split(".");
      if (parts[1] && parts[1].length >= 2) return;

      // Limit total length
      if (value.length >= 10) return;

      onChange(value + key);
    },
    [value, onChange, disabled],
  );

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "delete"],
  ];

  const displayAmount = value || "0";
  const numericAmount = parseFloat(displayAmount) || 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Amount Display */}
      <div className="text-center py-6">
        <div className="text-muted-foreground text-sm mb-2">Amount</div>
        <div className="amount-display text-foreground">
          <span className="text-muted-foreground text-3xl mr-1">₹</span>
          {numericAmount.toLocaleString("en-IN", {
            minimumFractionDigits: displayAmount.includes(".")
              ? displayAmount.split(".")[1]?.length || 0
              : 0,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-3 px-2">
        {keys.map((row) =>
          row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              disabled={disabled}
              className={cn(
                "keypad-button h-16 select-none",
                key === "delete" && "keypad-button-delete",
              )}
            >
              {key === "delete" ? <Delete className="w-6 h-6" /> : key}
            </button>
          )),
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={disabled || !value || parseFloat(value) === 0}
        className={cn(
          "mx-2 h-14 rounded-xl font-semibold text-lg",
          "flex items-center justify-center gap-2",
          "transition-all duration-200",
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          value && parseFloat(value) > 0 && "animate-pulse-glow",
        )}
      >
        <Check className="w-5 h-5" />
        Save Expense
      </button>
    </div>
  );
}
