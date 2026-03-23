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
import { useFCMContext } from "@/context/FCMContext";

function SuccessPopup({ amount, category, onDone }: { amount: number; category: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3.5 bg-emerald-950/80 border border-emerald-700/40 px-5 py-4 rounded-2xl shadow-lg animate-in fade-in zoom-in-95 duration-150 min-w-[200px]">
        <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <span className="text-emerald-400 text-base font-bold">✓</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="text-[13px] font-semibold text-emerald-100">₹{amount.toLocaleString("en-IN")} · {category}</div>
          <div className="text-xs text-emerald-400">Expense saved</div>
        </div>
      </div>
    </div>
  );
}

interface ExpenseEntryProps {
  categories: Category[];
  members: HouseholdMember[];
  onAddExpense: (expense: {
    amount: number;
    categoryId: string;
    whoSpent: WhoSpent;
    description: string;
    date: string;
  }) => Promise<unknown>;
  onAddCategory: (name: string) => Promise<Category>;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => Promise<void>;
  onReorderCategories: (ids: string[]) => Promise<void>;
  getBudget: (categoryId: string) => number;
  getSpentByCategory: (categoryId: string) => number;
  onSetBudget: (categoryId: string, amount: number) => Promise<void>;
  onAddMember: (name: string) => Promise<HouseholdMember | void>;
  onUpdateMember: (id: string, name: string) => Promise<void>;
  onDeleteMember: (id: string) => void;
  totalSpent: number;
  onCanSubmitChange: (canSubmit: boolean) => void;
  submitRef: React.MutableRefObject<(() => Promise<void>) | null>;
}

export function ExpenseEntry({
  categories,
  members,
  onAddExpense,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  getBudget,
  getSpentByCategory,
  onSetBudget,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  totalSpent,
  onCanSubmitChange,
  submitRef,
}: ExpenseEntryProps) {
  const { notify } = useFCMContext();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [whoSpent, setWhoSpent] = useState<WhoSpent>("me");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [successData, setSuccessData] = useState<{ amount: number; category: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  const canSubmit = !!(amount && parseFloat(amount) > 0 && categoryId);

  useEffect(() => {
    onCanSubmitChange(canSubmit);
  }, [canSubmit, onCanSubmitChange]);

  const handleSubmit = useCallback(async () => {
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0 || !categoryId) return;

    try {
      const result = await onAddExpense({
        amount: numAmount,
        categoryId,
        whoSpent,
        description: description.trim(),
        date: format(date, "yyyy-MM-dd"),
      }) as { streakMilestone?: number | null } | undefined;

      setAmount("");
      setCategoryId(null);
      setWhoSpent("me");
      setDescription("");
      setDate(new Date());

      const categoryName = categories.find((c) => c.id === categoryId)?.name ?? "Uncategorized";
      setSuccessData({ amount: numAmount, category: categoryName });

      const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

      // Budget alerts
      const budget = getBudget(categoryId);
      if (budget > 0) {
        const prevSpent = getSpentByCategory(categoryId);
        const newSpent = prevSpent + numAmount;
        const prevPct = (prevSpent / budget) * 100;
        const newPct = (newSpent / budget) * 100;

        if (newSpent > budget) {
          notify(
            "Oops, over budget 😬",
            `${categoryName} hit ${fmt(newSpent)} — budget is ${fmt(budget)}`
          );
        } else if (newPct >= 80 && prevPct < 80) {
          notify(
            "Heads up! 👀",
            `${categoryName} is at ${Math.round(newPct)}% of your budget (${fmt(newSpent)} / ${fmt(budget)})`
          );
        }
      }

      // Large single expense alert (> 50% of budget, or > ₹5000 if no budget set)
      const largeThreshold = budget > 0 ? budget * 0.5 : 5000;
      if (numAmount >= largeThreshold && numAmount >= 500) {
        notify(
          "Big spend! 💸",
          `${fmt(numAmount)} in ${categoryName} — is that right?`
        );
      }

      // Streak milestone
      const milestone = result?.streakMilestone;
      if (milestone) {
        const msgs: Record<number, string> = {
          3:  "3 days logging in a row — nice start! 🙌",
          7:  "A whole week of tracking! You're on a roll 🔥",
          14: "2 weeks straight — you've got this habit down 💪",
          30: "30 days! You're basically a finance pro now 🏆",
        };
        notify("Logging streak!", msgs[milestone] ?? `${milestone} days in a row!`);
      }

      inputRef.current?.focus();
    } catch (err) {
      console.error("[addExpense] failed:", err);
      toast.error("Failed to save expense", {
        description: "Check your connection and try again.",
        position: "top-center",
        duration: 3000,
        style: {
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: "1rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          fontWeight: "600",
          fontSize: "14px",
        },
      });
    }
  }, [amount, categoryId, whoSpent, description, date, onAddExpense, categories, getBudget, getSpentByCategory, notify]);

  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit, submitRef]);

  return (
    <>
    {successData !== null && (
      <SuccessPopup amount={successData.amount} category={successData.category} onDone={() => setSuccessData(null)} />
    )}
    <div className="flex flex-col h-[100dvh] overflow-hidden pb-nav animate-fade-in">
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
            <div className="text-sm text-muted-foreground">Category</div>
            <CategoryManager
              categories={categories}
              onAddCategory={onAddCategory}
              onUpdateCategory={onUpdateCategory}
              onDeleteCategory={onDeleteCategory}
              onReorderCategories={onReorderCategories}
              getBudget={getBudget}
              onSetBudget={onSetBudget}
            />
          </div>
          <CategorySelector
            categories={categories}
            selected={categoryId}
            onSelect={setCategoryId}
            getBudget={getBudget}
            getSpentByCategory={getSpentByCategory}
          />
        </div>

        <WhoSelector
          selected={whoSpent}
          members={members}
          onSelect={setWhoSpent}
          onAddMember={onAddMember}
          onUpdateMember={onUpdateMember}
          onDeleteMember={onDeleteMember}
        />

        <DescriptionInput value={description} onChange={setDescription} />
      </div>
    </div>
    </>
  );
}
