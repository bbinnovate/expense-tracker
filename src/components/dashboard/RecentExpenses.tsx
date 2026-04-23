import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecentExpense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  whoSpent: string;
}

interface RecentExpensesProps {
  expenses: RecentExpense[];
}

const CATEGORY_MAP: [string, string][] = [
  ["groceries", "#22c55e"],
  ["milk", "#38bdf8"],
  ["baby", "#f472b6"],
  ["house-help", "#f59e0b"],
  ["nanny", "#fb923c"],
  ["utilities", "#facc15"],
  ["rent", "#f87171"],
  ["transport", "#60a5fa"],
  ["eating-out", "#fb923c"],
  ["restaurant", "#f97316"],
  ["shopping", "#c084fc"],
  ["health", "#fb7185"],
  ["entertainment", "#818cf8"],
  ["education", "#22d3ee"],
  ["subscription", "#a78bfa"],
  ["travel", "#2dd4bf"],
];

function getCategoryColor(categoryId: string): string {
  const lower = categoryId.toLowerCase();
  for (const [key, color] of CATEGORY_MAP) {
    if (lower.includes(key)) return color;
  }
  return "hsl(45,95%,55%)";
}

function formatDate(date: string) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return date;
  }
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}

function formatCategory(id: string) {
  return id
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function truncateId(id: string) {
  return id.length > 8 ? `${id.slice(0, 6)}…` : id;
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card className="bg-card border-border rounded-2xl">
      <CardHeader className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Recent Expenses
          </CardTitle>
          <span className="text-[10px] font-mono text-muted-foreground/50">
            last {expenses.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="px-3 pb-3 flex flex-col gap-0.5">
            {expenses.map((expense, i) => {
              const color = getCategoryColor(expense.categoryId);
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/20 transition-colors group cursor-default"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Colored left accent */}
                  <div
                    className="w-0.5 h-8 rounded-full flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                    style={{ background: color }}
                  />

                  {/* Icon circle */}
                  <div
                    className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-black/70"
                    style={{ background: `${color}25`, border: `1px solid ${color}30` }}
                  >
                    {formatCategory(expense.categoryId).charAt(0)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/85 font-medium truncate leading-tight">
                      {expense.description || formatCategory(expense.categoryId)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">
                      {truncateId(expense.userId)} · {formatDate(expense.date)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-mono font-semibold tabular-nums" style={{ color }}>
                      <span className="text-[10px] opacity-60">₹</span>
                      {formatAmount(expense.amount)}
                    </p>
                  </div>
                </div>
              );
            })}

            {expenses.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <p className="text-xs text-muted-foreground/50">No expenses found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
