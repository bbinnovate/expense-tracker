"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Expense, Category, HouseholdMember } from "@/types/expense";
import { Edit2, Trash2, Download } from "lucide-react";
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

interface ExpenseLogProps {
  expenses: Expense[];
  categories: Category[];
  members: HouseholdMember[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onExport: () => void;
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

  const sorted = [...expenses].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const getCategoryInfo = (categoryId: string) => {
    return (
      categories.find((c) => c.id === categoryId) || {
        name: categoryId,
      }
    );
  };

  const handleDelete = () => {
    if (deleteId) {
      onDeleteExpense(deleteId);
      setDeleteId(null);
    }
  };

  const groupedExpenses = sorted.reduce(
    (acc, expense) => {
      const date = expense.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(expense);
      return acc;
    },
    {} as Record<string, Expense[]>,
  );

  return (
    <div className="animate-fade-in">
      <button
        onClick={onExport}
        className="w-full mb-3 py-2 px-3 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors text-xs"
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </button>

      {Object.keys(groupedExpenses).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-xs">No expenses this month</div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedExpenses).map(([date, dayExpenses]) => (
            <div key={date}>
              <div className="text-xs text-muted-foreground mb-1.5 px-1">
                {format(parseISO(date), "EEEE, MMM d")}
              </div>
              <div className="space-y-1.5">
                {dayExpenses.map((expense) => {
                  const category = getCategoryInfo(expense.categoryId);
                  return (
                    <div key={expense.id} className="expense-card p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="font-semibold text-foreground font-mono text-sm">
                              ₹{expense.amount.toLocaleString("en-IN")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {category.name}
                            </div>
                            {expense.description && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {expense.description}
                              </div>
                            )}
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {members.find((m) => m.id === expense.whoSpent)
                                ?.name ?? expense.whoSpent}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => onEditExpense(expense)}
                            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => setDeleteId(expense.id)}
                            className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border-0">
              Cancel
            </AlertDialogCancel>
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
