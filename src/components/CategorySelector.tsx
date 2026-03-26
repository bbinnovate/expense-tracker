"use client";

import { Category } from "@/types/expense";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  categories: Category[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
  getBudget?: (categoryId: string) => number;
  getSpentByCategory?: (categoryId: string) => number;
}

export function CategorySelector({
  categories,
  selected,
  onSelect,
  getBudget,
  getSpentByCategory,
}: CategorySelectorProps) {
  return (
    <div className="relative">
      <div className="max-h-[38vh] overflow-y-auto pb-4">
        <div className="grid grid-cols-2 gap-1.5">
          {categories.map((category) => {
            const budget = getBudget?.(category.id) ?? 0;
            const spent = getSpentByCategory?.(category.id) ?? 0;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            const isOver = percentage > 100;
            const barColor =
              isOver ? "bg-red-500" :
              percentage >= 80 ? "bg-red-500" :
              percentage >= 40 ? "bg-yellow-500" :
              "bg-green-500";

            return (
              <button
                key={category.id}
                onClick={() => onSelect(selected === category.id ? null : category.id)}
                className={cn(
                  "category-chip relative h-10 text-sm px-3 flex items-center justify-between overflow-hidden",
                  selected === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                <span className="truncate text-left">{category.name}</span>
                {selected !== category.id && (
                  <span className={cn(
                    "text-[10px] font-semibold shrink-0 ml-1",
                    budget > 0
                      ? isOver ? "text-red-500" : percentage >= 80 ? "text-red-500" : percentage >= 40 ? "text-yellow-500" : "text-green-500"
                      : "text-muted-foreground"
                  )}>
                    {budget > 0
                      ? isOver ? `+${Math.round(percentage - 100)}%` : `${Math.round(percentage)}%`
                      : spent > 0 ? `₹${spent >= 1000 ? `${(spent / 1000).toFixed(1)}k` : Math.round(spent)}` : ""}
                  </span>
                )}
                {selected !== category.id && (budget > 0 || spent > 0) && (
                  <div
                    className={cn("absolute bottom-0 left-0 h-[3px] transition-all duration-500",
                      budget > 0 ? barColor : "bg-muted-foreground/30"
                    )}
                    style={{ width: budget > 0 ? `${Math.min(Math.max(percentage, 4), 100)}%` : "100%" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
