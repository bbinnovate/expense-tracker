"use client";

import { Category } from "@/types/expense";
import { cn } from "@/lib/utils";
import { Edit2, EyeOff, Eye } from "lucide-react";
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
  onSetBudget: (categoryId: string, amount: number) => Promise<void>;
}

function statusOf(spent: number, budget: number) {
  if (budget === 0) return "neutral";
  const pct = (spent / budget) * 100;
  if (pct >= 100) return "over";
  if (pct >= 80) return "warning";
  return "good";
}

const STATUS_ORDER = { over: 0, warning: 1, good: 2, neutral: 3 };

export function BudgetTable({
  categories,
  getSpentByCategory,
  getBudget,
  onSetBudget,
}: BudgetTableProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [budgetValue, setBudgetValue] = useState("");
  const [showNoBudget, setShowNoBudget] = useState(false);

  const handleEditBudget = (category: Category) => {
    setEditingCategory(category);
    setBudgetValue(getBudget(category.id) > 0 ? getBudget(category.id).toString() : "");
  };

  const handleSaveBudget = async () => {
    if (editingCategory) {
      try {
        await onSetBudget(editingCategory.id, parseFloat(budgetValue) || 0);
        setEditingCategory(null);
        setBudgetValue("");
      } catch (err) {
        console.error("[setBudget] failed:", err);
      }
    }
  };

  // Compute summary
  const budgetedCategories = categories.filter((c) => getBudget(c.id) > 0);
  const totalBudget = budgetedCategories.reduce((s, c) => s + getBudget(c.id), 0);
  const totalSpentOnBudgeted = budgetedCategories.reduce((s, c) => s + getSpentByCategory(c.id), 0);
  const overallPct = totalBudget > 0 ? Math.min((totalSpentOnBudgeted / totalBudget) * 100, 100) : 0;
  const overallRemaining = totalBudget - totalSpentOnBudgeted;
  const overallStatus = statusOf(totalSpentOnBudgeted, totalBudget);

  // Sort: overspent → warning → good → neutral
  const sorted = [...categories].sort(
    (a, b) =>
      STATUS_ORDER[statusOf(getSpentByCategory(a.id), getBudget(a.id))] -
      STATUS_ORDER[statusOf(getSpentByCategory(b.id), getBudget(b.id))],
  );
  const visible = sorted.filter((c) => showNoBudget || getBudget(c.id) > 0);
  const hiddenCount = sorted.filter((c) => getBudget(c.id) === 0).length;

  return (
    <>
      {/* Summary card */}
      {totalBudget > 0 && (
        <div className={cn(
          "rounded-2xl p-4 mb-5 border",
          overallStatus === "over" ? "bg-destructive/10 border-destructive/25" :
          overallStatus === "warning" ? "bg-warning/10 border-warning/25" :
          "bg-success/10 border-success/20",
        )}>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">This month</div>
              <div className="text-2xl font-bold text-foreground">
                ₹{totalSpentOnBudgeted.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-muted-foreground">
                of ₹{totalBudget.toLocaleString("en-IN")} budgeted
              </div>
            </div>
            <div className={cn(
              "text-4xl font-bold tabular-nums",
              overallStatus === "over" ? "text-destructive" :
              overallStatus === "warning" ? "text-warning" : "text-success",
            )}>
              {Math.round(overallPct)}%
            </div>
          </div>
          <div className="h-2 rounded-full bg-black/20 overflow-hidden mb-2">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                overallStatus === "over" ? "bg-destructive" :
                overallStatus === "warning" ? "bg-warning" : "bg-success",
              )}
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className={cn(
            "text-xs font-medium",
            overallStatus === "over" ? "text-destructive" :
            overallStatus === "warning" ? "text-warning" : "text-success",
          )}>
            {overallRemaining >= 0
              ? `₹${overallRemaining.toLocaleString("en-IN")} remaining`
              : `₹${Math.abs(overallRemaining).toLocaleString("en-IN")} over budget`}
          </div>
        </div>
      )}

      {/* Category rows */}
      <div className="space-y-2">
        {visible.map((category) => {
          const spent = getSpentByCategory(category.id);
          const budget = getBudget(category.id);
          const status = statusOf(spent, budget);
          const pct = budget > 0 ? (spent / budget) * 100 : 0;
          const barPct = Math.min(pct, 100);
          const remaining = budget - spent;

          return (
            <div key={category.id} className={cn(
              "expense-card",
              status === "over" && "border-destructive/30",
              status === "warning" && "border-warning/30",
            )}>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex-1 text-sm font-medium text-foreground truncate">{category.name}</span>
                {budget > 0 && (
                  <span className={cn(
                    "text-xs font-semibold shrink-0",
                    status === "over" ? "text-destructive" :
                    status === "warning" ? "text-warning" : "text-success",
                  )}>
                    {pct > 100 ? `+${Math.round(pct - 100)}% over` : `${Math.round(pct)}%`}
                  </span>
                )}
                <button
                  onClick={() => handleEditBudget(category)}
                  className="p-1 rounded-md hover:bg-secondary transition-colors shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {budget > 0 ? (
                <>
                  <div className="relative h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        status === "over" ? "bg-destructive" :
                        status === "warning" ? "bg-warning" : "bg-success",
                      )}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">₹{spent.toLocaleString("en-IN")}</span>
                    <span className={cn(
                      "font-medium",
                      status === "over" ? "text-destructive" :
                      status === "warning" ? "text-warning" : "text-success",
                    )}>
                      {remaining >= 0
                        ? `₹${remaining.toLocaleString("en-IN")} left`
                        : `₹${Math.abs(remaining).toLocaleString("en-IN")} over`}
                    </span>
                    <span className="text-muted-foreground">₹{budget.toLocaleString("en-IN")}</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted-foreground">
                  ₹{spent.toLocaleString("en-IN")} spent · no budget set
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Toggle no-budget categories */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowNoBudget((v) => !v)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-2 transition-colors"
        >
          {showNoBudget ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showNoBudget ? "Hide" : `Show ${hiddenCount}`} categories without budget
        </button>
      )}

      {/* Edit budget dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>Budget · {editingCategory?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                type="number"
                value={budgetValue}
                onChange={(e) => setBudgetValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveBudget()}
                placeholder="Monthly budget"
                className="pl-8 h-12 bg-secondary border-0 text-lg"
                autoFocus
              />
            </div>
            <Button onClick={handleSaveBudget} className="w-full h-12">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
