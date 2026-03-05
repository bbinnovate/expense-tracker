"use client";

import { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { MonthHeader } from "./MonthHeader";
import { ExpensePieChart } from "./ExpensePieChart";
import { BudgetTable } from "./BudgetTable";
import { ExpenseLog } from "./ExpenseLog";
import { Category, Expense, HouseholdMember } from "@/types/expense";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OverviewLogProps {
  categories: Category[];
  expenses: Expense[];
  members: HouseholdMember[];
  getSpentByCategory: (categoryId: string, month?: string) => number;
  getTotalSpent: (month?: string) => number;
  getBudget: (categoryId: string, month?: string) => number;
  onSetBudget: (categoryId: string, amount: number) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onExport: () => void;
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

  return (
    <div className="flex flex-col min-h-full pb-16 animate-fade-in">
      <MonthHeader
        currentMonth={currentMonth}
        onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
        onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
        showNavigation
      />

      <div className="flex-1 px-3">
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-secondary mb-4 h-9">
            <TabsTrigger
              value="chart"
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Chart
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Budgets
            </TabsTrigger>
            <TabsTrigger
              value="log"
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-0">
            <ExpensePieChart
              categories={categories}
              getSpentByCategory={(id) => getSpentByCategory(id, monthKey)}
              totalSpent={getTotalSpent(monthKey)}
            />
          </TabsContent>

          <TabsContent value="budget" className="mt-0">
            <BudgetTable
              categories={categories}
              getSpentByCategory={(id) => getSpentByCategory(id, monthKey)}
              getBudget={(id) => getBudget(id, monthKey)}
              onSetBudget={onSetBudget}
            />
          </TabsContent>

          <TabsContent value="log" className="mt-0">
            <ExpenseLog
              expenses={expenses}
              categories={categories}
              members={members}
              onEditExpense={onEditExpense}
              onDeleteExpense={onDeleteExpense}
              onExport={onExport}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
