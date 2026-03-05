"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Category } from "@/types/expense";

interface ExpensePieChartProps {
  categories: Category[];
  getSpentByCategory: (categoryId: string) => number;
  totalSpent: number;
}

const COLORS = [
  "hsl(150, 60%, 45%)",
  "hsl(200, 70%, 50%)",
  "hsl(320, 70%, 60%)",
  "hsl(270, 50%, 55%)",
  "hsl(340, 65%, 55%)",
  "hsl(45, 85%, 50%)",
  "hsl(25, 80%, 50%)",
  "hsl(175, 65%, 50%)",
  "hsl(0, 70%, 55%)",
  "hsl(220, 30%, 50%)",
];

export function ExpensePieChart({
  categories,
  getSpentByCategory,
  totalSpent,
}: ExpensePieChartProps) {
  const data = categories
    .map((category, index) => ({
      name: category.name,
      value: getSpentByCategory(category.id),
      color: COLORS[index % COLORS.length],
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <div className="text-4xl mb-3">📊</div>
        <div className="text-sm">No expenses this month</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="hsl(220, 18%, 11%)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Total Display */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground">Total Spent</div>
        <div className="text-3xl font-bold text-foreground font-mono">
          ₹{totalSpent.toLocaleString("en-IN")}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / totalSpent) * 100).toFixed(1);
          return (
            <div
              key={item.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {percentage}%
                </span>
                <span className="text-sm font-medium font-mono">
                  ₹{item.value.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
