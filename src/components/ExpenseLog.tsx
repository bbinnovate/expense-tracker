"use client";

import { useState, useMemo } from "react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { Expense, Category, HouseholdMember } from "@/types/expense";
import { Edit2, Trash2, Download, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ExpenseLogProps {
  expenses: Expense[];
  categories: Category[];
  members: HouseholdMember[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onExport: () => void;
}

// Simple stable color from category id
const COLORS = [
  "#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa",
  "#34d399", "#facc15", "#38bdf8", "#f87171", "#a3e635",
];
function categoryColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return COLORS[h % COLORS.length];
}

function formatDay(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEE, MMM d");
}

export function ExpenseLog({
  expenses,
  categories,
  members,
  onEditExpense,
  onDeleteExpense,
  onExport,
}: ExpenseLogProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterMember, setFilterMember] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  const getMemberName = (id: string) =>
    members.find((m) => m.id === id)?.name ?? id;

  // Unique dates with expenses, sorted descending
  const activeDates = useMemo(() => {
    const dates = [...new Set(expenses.map((e) => e.date))];
    return dates.sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  const filtered = useMemo(() => {
    return [...expenses]
      .filter((e) => !filterCategory || e.categoryId === filterCategory)
      .filter((e) => !filterMember || e.whoSpent === filterMember)
      .filter((e) => !filterDate || e.date === filterDate)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime() ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [expenses, filterCategory, filterMember, filterDate]);

  const grouped = useMemo(() =>
    filtered.reduce((acc, e) => {
      if (!acc[e.date]) acc[e.date] = [];
      acc[e.date].push(e);
      return acc;
    }, {} as Record<string, Expense[]>),
  [filtered]);

  // Only show categories/members that appear in this month's expenses
  const activeCategories = useMemo(() =>
    categories.filter((c) => expenses.some((e) => e.categoryId === c.id)),
  [categories, expenses]);

  const activeMembers = useMemo(() =>
    members.filter((m) => expenses.some((e) => e.whoSpent === m.id)),
  [members, expenses]);

  const hasFilter = filterCategory || filterMember || filterDate;

  const handleDelete = () => {
    if (deleteId) { onDeleteExpense(deleteId); setDeleteId(null); }
  };

  return (
    <div className="animate-fade-in">
      {/* Sticky header: day + filter chips */}
      <div className="sticky top-0 z-10 bg-background pb-2">
      {/* Day selector */}
      {activeDates.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-2">
          {/* All chip */}
          <button
            onClick={() => setFilterDate(null)}
            className={cn(
              "shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-sm transition-colors",
              filterDate === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground",
            )}
          >
            <span className="font-semibold text-base leading-tight">All</span>
            <span className="text-xs opacity-70">days</span>
          </button>

          {/* Vertical divider */}
          <div className="w-px h-8 bg-border shrink-0" />

          {/* Day chips */}
          {activeDates.map((date) => {
            const d = parseISO(date);
            const isSelected = filterDate === date;
            return (
              <button
                key={date}
                onClick={() => setFilterDate(isSelected ? null : date)}
                className={cn(
                  "shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-sm transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                <span className="font-semibold text-base leading-tight">{format(d, "d")}</span>
                <span className="text-xs opacity-70">{format(d, "EEE")}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter + export row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar">
          {/* Category filters */}
          {activeCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(filterCategory === c.id ? null : c.id)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 text-sm px-3 py-2 rounded-full transition-colors",
                filterCategory === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: categoryColor(c.id) }}
              />
              {c.name}
            </button>
          ))}
          {/* Member filters (only if >1 active member) */}
          {activeMembers.length > 1 && activeMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMember(filterMember === m.id ? null : m.id)}
              className={cn(
                "shrink-0 text-sm px-3 py-2 rounded-full transition-colors",
                filterMember === m.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {m.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {hasFilter && (
            <button
              onClick={() => { setFilterCategory(null); setFilterMember(null); setFilterDate(null); }}
              className="p-2.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={onExport}
            className="p-2.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
      </div>{/* end sticky header */}

      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-sm">
            {hasFilter ? "No expenses match this filter" : "No expenses this month"}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dayExpenses]) => {
            const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);
            return (
              <div key={date} className="expense-card overflow-hidden">
                {/* Day header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {formatDay(date)}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground font-mono">
                    ₹{dayTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Expense rows */}
                <div className="divide-y divide-border/40">
                  {dayExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center gap-3 px-3 py-3">
                      {/* Color dot */}
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: categoryColor(expense.categoryId) }}
                      />

                      {/* Category + description */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {getCategoryName(expense.categoryId)}
                        </div>
                        {(expense.description || expense.whoSpent !== "me") && (
                          <div className="text-xs text-muted-foreground/60 truncate mt-0.5">
                            {[
                              expense.description,
                              expense.whoSpent !== "me" ? getMemberName(expense.whoSpent) : null,
                            ].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>

                      {/* Amount */}
                      <span className="font-semibold text-primary font-mono text-base shrink-0">
                        ₹{expense.amount.toLocaleString("en-IN")}
                      </span>

                      {/* Actions */}
                      <div className="flex gap-0.5 shrink-0">
                        <button
                          onClick={() => onEditExpense(expense)}
                          className="p-2 rounded-md hover:bg-secondary transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground/50" />
                        </button>
                        <button
                          onClick={() => setDeleteId(expense.id)}
                          className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive/60" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-sm bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
