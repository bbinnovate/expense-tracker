"use client";

import { useEffect, useState } from "react";
import StatsCards from "./StatsCards";
import CategoryChart from "./CategoryChart";
import UserTable from "./UserTable";
import RecentExpenses from "./RecentExpenses";

interface DashboardData {
  totalUsers: number;
  totalExpenses: number;
  totalSpent: number;
  activeDevices: number;
  pwaInstalls: number;
  recentExpenses: Array<{
    id: string;
    userId: string;
    amount: number;
    categoryId: string;
    description: string;
    date: string;
    whoSpent: string;
  }>;
  users: Array<{
    userId: string;
    expenseCount: number;
    totalSpent: number;
    lastActive: string;
    deviceCount: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    total: number;
    count: number;
  }>;
}

interface AdminDashboardProps {
  password: string;
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-card border border-border animate-pulse ${className}`} />
  );
}

export default function AdminDashboard({ password }: AdminDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/dashboard?password=${encodeURIComponent(password)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setLoadedAt(new Date());
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <SkeletonCard className="h-80" />
          <SkeletonCard className="h-80" />
        </div>
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <p className="text-xs font-mono text-destructive/80">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      {/* Refresh row */}
      <div className="flex items-center justify-end gap-3 mb-1">
        {loadedAt && (
          <span className="text-[10px] font-mono text-muted-foreground/40">
            fetched {loadedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <button
          onClick={load}
          className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50 hover:text-primary transition-colors"
        >
          Refresh
        </button>
      </div>

      <StatsCards
        totalUsers={data.totalUsers}
        totalExpenses={data.totalExpenses}
        totalSpent={data.totalSpent}
        activeDevices={data.activeDevices}
        pwaInstalls={data.pwaInstalls}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CategoryChart data={data.categoryBreakdown} />
        <RecentExpenses expenses={data.recentExpenses} />
      </div>

      <UserTable users={data.users} />
    </div>
  );
}
