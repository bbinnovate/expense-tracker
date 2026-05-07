"use client";

import { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { MonthHeader } from "./MonthHeader";
import { ExpensePieChart } from "./ExpensePieChart";
import { BudgetTable } from "./BudgetTable";
import { ExpenseLog } from "./ExpenseLog";
import { Category, Expense, HouseholdMember } from "@/types/expense";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";

interface OverviewLogProps {
  categories: Category[];
  expenses: Expense[];
  members: HouseholdMember[];
  getSpentByCategory: (categoryId: string, month?: string) => number;
  getTotalSpent: (month?: string) => number;
  getBudget: (categoryId: string) => number;
  onSetBudget: (categoryId: string, amount: number) => Promise<void>;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onExport: (month: string) => void;
}

export function OverviewLog({
  categories,
  expenses,
  members,
  getSpentByCategory,
  getTotalSpent,
  getBudget,
  onSetBudget,
  onEditExpense,
  onDeleteExpense,
  onExport,
}: OverviewLogProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));

  return (
    <div className="flex flex-col h-full pb-nav animate-fade-in overflow-hidden">
      <MonthHeader
        currentMonth={currentMonth}
        onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
        onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
        showNavigation
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Tabs defaultValue="log" className="w-full">
          <div className="sticky top-0 z-10 bg-background px-3 pb-2">
            <TabsList className="w-full grid grid-cols-3 bg-secondary h-11">
              <TabsTrigger value="log" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Log
              </TabsTrigger>
              <TabsTrigger value="budget" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Budgets
              </TabsTrigger>
              <TabsTrigger value="chart" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Chart
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="log" className="mt-2 px-3">
            {monthExpenses.length > 0 && (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => onExport(monthKey)}
                  className="mb-3 h-9 inline-flex items-center justify-center gap-1.5 rounded-md bg-secondary px-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  Download CSV
                </button>
              </div>
            )}
            <ExpenseLog
              expenses={monthExpenses}
              categories={categories}
              members={members}
              onEditExpense={onEditExpense}
              onDeleteExpense={onDeleteExpense}
            />
          </TabsContent>

          <TabsContent value="budget" className="mt-2 px-3">
            <BudgetTable
              categories={categories}
              getSpentByCategory={(id) => getSpentByCategory(id, monthKey)}
              getBudget={getBudget}
              onSetBudget={onSetBudget}
            />
          </TabsContent>

          <TabsContent value="chart" className="mt-2 px-3">
            <ExpensePieChart
              categories={categories}
              getSpentByCategory={(id) => getSpentByCategory(id, monthKey)}
              totalSpent={getTotalSpent(monthKey)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
