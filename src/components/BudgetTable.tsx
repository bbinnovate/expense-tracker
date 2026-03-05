"use client";

import { Category } from "@/types/expense";
import { cn } from "@/lib/utils";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BudgetTableProps {
  categories: Category[];
  getSpentByCategory: (categoryId: string) => number;
  getBudget: (categoryId: string) => number;
  onSetBudget: (categoryId: string, amount: number) => void;
}

export function BudgetTable({
  categories,
  getSpentByCategory,
  getBudget,
  onSetBudget,
}: BudgetTableProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [budgetValue, setBudgetValue] = useState("");

  const handleEditBudget = (category: Category) => {
    setEditingCategory(category);
    setBudgetValue(getBudget(category.id).toString());
  };

  const handleSaveBudget = () => {
    if (editingCategory) {
      onSetBudget(editingCategory.id, parseFloat(budgetValue) || 0);
      setEditingCategory(null);
      setBudgetValue("");
    }
  };

  const getStatus = (spent: number, budget: number) => {
    if (budget === 0) return "neutral";
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return "over";
    if (percentage >= 80) return "warning";
    return "good";
  };

  return (
    <>
      <div className="space-y-3">
        {categories.map((category) => {
          const spent = getSpentByCategory(category.id);
          const budget = getBudget(category.id);
          const status = getStatus(spent, budget);
          const remaining = budget - spent;
          const percentage =
            budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

          return (
            <div key={category.id} className="expense-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {category.name}
                  </span>
                </div>
                <button
                  onClick={() => handleEditBudget(category)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="budget-bar mb-2">
                <div
                  className={cn(
                    "budget-bar-fill",
                    status === "good" && "bg-success",
                    status === "warning" && "bg-warning",
                    status === "over" && "bg-destructive",
                    status === "neutral" && "bg-muted-foreground",
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Spent: </span>
                  <span className="font-medium text-foreground">
                    ₹{spent.toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget: </span>
                  <span className="font-medium text-foreground">
                    {budget > 0 ? `₹${budget.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>
              </div>

              {budget > 0 && (
                <div
                  className={cn(
                    "text-sm mt-2 font-medium",
                    status === "good" && "text-success",
                    status === "warning" && "text-warning",
                    status === "over" && "text-destructive",
                  )}
                >
                  {remaining >= 0
                    ? `₹${remaining.toLocaleString("en-IN")} remaining`
                    : `₹${Math.abs(remaining).toLocaleString("en-IN")} over budget`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!editingCategory}
        onOpenChange={() => setEditingCategory(null)}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Set Budget for {editingCategory?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                value={budgetValue}
                onChange={(e) => setBudgetValue(e.target.value)}
                placeholder="Enter monthly budget"
                className="pl-8 h-12 bg-secondary border-0 text-lg"
              />
            </div>
            <Button onClick={handleSaveBudget} className="w-full h-12">
              Save Budget
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
