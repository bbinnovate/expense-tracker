"use client";

import { Category } from "@/types/expense";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  categories: Category[];
  selected: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategorySelector({
  categories,
  selected,
  onSelect,
}: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={cn(
            "category-chip bg-secondary text-secondary-foreground text-xs py-2 px-3",
            selected === category.id && "category-chip-selected",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
