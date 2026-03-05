"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { format } from "date-fns";
import { AmountInput } from "./AmountInput";
import { CategorySelector } from "./CategorySelector";
import { CategoryManager } from "./CategoryManager";
import { WhoSelector } from "./WhoSelector";
import { DescriptionInput } from "./DescriptionInput";
import { ExpenseHeader } from "./ExpenseHeader";
import { Category, WhoSpent, HouseholdMember } from "@/types/expense";
import { toast } from "sonner";

interface ExpenseEntryProps {
  categories: Category[];
  members: HouseholdMember[];
  onAddExpense: (expense: {
    amount: number;
    categoryId: string;
    whoSpent: WhoSpent;
    description: string;
    date: string;
  }) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onAddMember: (name: string) => Promise<HouseholdMember | void>;
  onDeleteMember: (id: string) => void;
  totalSpent: number;
  onCanSubmitChange: (canSubmit: boolean) => void;
  submitRef: React.MutableRefObject<(() => void) | null>;
}

export function ExpenseEntry({
  categories,
  members,
  onAddExpense,
  onUpdateCategory,
  onAddMember,
  onDeleteMember,
  totalSpent,
  onCanSubmitChange,
  submitRef,
}: ExpenseEntryProps) {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [whoSpent, setWhoSpent] = useState<WhoSpent>("me");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canSubmit = !!(amount && parseFloat(amount) > 0 && categoryId);

  useEffect(() => {
    onCanSubmitChange(canSubmit);
  }, [canSubmit, onCanSubmitChange]);

  const handleSubmit = useCallback(() => {
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0 || !categoryId) return;

    onAddExpense({
      amount: numAmount,
      categoryId,
      whoSpent,
      description: description.trim(),
      date: format(date, "yyyy-MM-dd"),
    });

    setAmount("");
    setCategoryId(null);
    setWhoSpent("me");
    setDescription("");
    setDate(new Date());

    toast.success("Expense saved!", {
      description: `₹${numAmount.toLocaleString("en-IN")} added`,
      position: "top-center",
      duration: 2500,
      style: {
        background: "hsl(45 95% 55%)",
        color: "hsl(0 0% 7%)",
        border: "none",
        fontWeight: "600",
        fontSize: "14px",
      },
    });

    inputRef.current?.focus();
  }, [amount, categoryId, whoSpent, description, date, onAddExpense]);

  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit, submitRef]);

  return (
    <div className="flex flex-col min-h-full pb-16 animate-fade-in">
      <ExpenseHeader
        currentMonth={new Date()}
        date={date}
        onDateChange={setDate}
        totalSpent={totalSpent}
      />

      <div className="flex-1 px-3 space-y-3">
        <AmountInput ref={inputRef} value={amount} onChange={setAmount} />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs text-muted-foreground">Category</div>
            <CategoryManager
              categories={categories}
              onUpdateCategory={onUpdateCategory}
            />
          </div>
          <CategorySelector
            categories={categories}
            selected={categoryId}
            onSelect={setCategoryId}
          />
        </div>

        <WhoSelector
          selected={whoSpent}
          members={members}
          onSelect={setWhoSpent}
          onAddMember={onAddMember}
          onDeleteMember={onDeleteMember}
        />

        <DescriptionInput value={description} onChange={setDescription} />
      </div>
    </div>
  );
}
