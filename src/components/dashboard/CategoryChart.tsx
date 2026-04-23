"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryData {
  category: string;
  total: number;
  count: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

function formatAmount(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${Math.round(n)}`;
}

function formatCategory(id: string) {
  return id
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const BAR_COLORS = [
  "hsl(45,95%,55%)",
  "hsl(200,80%,55%)",
  "hsl(270,70%,65%)",
  "hsl(150,50%,45%)",
  "hsl(30,90%,55%)",
  "hsl(340,70%,60%)",
  "hsl(180,60%,50%)",
  "hsl(60,80%,50%)",
  "hsl(310,60%,60%)",
  "hsl(110,50%,50%)",
];

export default function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-card border-border rounded-2xl">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-xs text-muted-foreground">No data</p>
        </CardContent>
      </Card>
    );
  }

  const max = data[0].total;
  const grandTotal = data.reduce((s, d) => s + d.total, 0);

  return (
    <Card className="bg-card border-border rounded-2xl">
      <CardHeader className="pb-4 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Spending by Category
          </CardTitle>
          <span className="text-[10px] font-mono text-muted-foreground/60">
            {formatAmount(grandTotal)} total
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex flex-col gap-3.5">
          {data.map((item, i) => {
            const pct = (item.total / max) * 100;
            const sharePct = ((item.total / grandTotal) * 100).toFixed(0);
            const color = BAR_COLORS[i % BAR_COLORS.length];

            return (
              <div key={item.category} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <span className="text-xs text-foreground/80 font-medium">
                      {formatCategory(item.category)}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 font-mono">
                      {item.count}×
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums">
                      {sharePct}%
                    </span>
                    <span className="text-xs font-mono font-semibold text-foreground tabular-nums">
                      {formatAmount(item.total)}
                    </span>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: color,
                      boxShadow: `0 0 6px ${color}60`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
