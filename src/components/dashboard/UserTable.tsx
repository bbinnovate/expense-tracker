import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";

interface UserData {
  userId: string;
  expenseCount: number;
  totalSpent: number;
  lastActive: string;
  deviceCount: number;
}

interface UserTableProps {
  users: UserData[];
}

function formatAmount(n: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
}

function formatDate(date: string) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  } catch {
    return date;
  }
}

function truncateId(id: string) {
  return id.length > 14 ? `${id.slice(0, 9)}…${id.slice(-4)}` : id;
}

function getInitial(id: string) {
  return id.charAt(0).toUpperCase();
}

const AVATAR_COLORS = [
  ["#3b82f6", "#1d4ed8"],
  ["hsl(45,95%,55%)", "hsl(35,90%,45%)"],
  ["#a855f7", "#7e22ce"],
  ["hsl(150,50%,40%)", "hsl(150,50%,25%)"],
  ["#f43f5e", "#be123c"],
  ["#06b6d4", "#0e7490"],
];

export default function UserTable({ users }: UserTableProps) {
  const maxSpent = users[0]?.totalSpent || 1;

  return (
    <Card className="bg-card border-border rounded-2xl overflow-hidden">
      <CardHeader className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Users
          </CardTitle>
          <span className="text-[10px] font-mono text-muted-foreground/50">
            {users.length} total
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
        {/* Column headers */}
        <div className="grid grid-cols-[2rem_1fr_7rem_6rem_5rem_7rem] items-center px-4 sm:px-5 py-2 border-y border-border/50 min-w-[480px]">
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">#</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">User</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 text-right">Spent</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 text-right">Expenses</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 text-right">Devices</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 text-right pr-0">Last Active</span>
        </div>

        <div className="divide-y divide-border/30 min-w-[480px]">
          {users.map((user, i) => {
            const [from, to] = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const spentPct = (user.totalSpent / maxSpent) * 100;

            return (
              <div
                key={user.userId}
                className="grid grid-cols-[2rem_1fr_7rem_6rem_5rem_7rem] items-center px-4 sm:px-5 py-3 hover:bg-muted/15 transition-colors group"
              >
                {/* Rank */}
                <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums">
                  {i + 1}
                </span>

                {/* User */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {getInitial(user.userId)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-foreground/80 truncate">
                      {truncateId(user.userId)}
                    </p>
                    {/* Spend bar */}
                    <div className="mt-1 h-0.5 w-20 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${spentPct}%`,
                          background: from,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Total Spent */}
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-foreground tabular-nums">
                    {formatAmount(user.totalSpent)}
                  </span>
                </div>

                {/* Expense count */}
                <div className="text-right">
                  <span className="text-xs text-foreground/70 tabular-nums font-mono">
                    {user.expenseCount}
                  </span>
                </div>

                {/* Devices */}
                <div className="flex items-center justify-end gap-1">
                  {user.deviceCount > 0 ? (
                    <>
                      <Smartphone className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-xs font-mono text-foreground/60">{user.deviceCount}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground/30">—</span>
                  )}
                </div>

                {/* Last Active */}
                <div className="text-right">
                  <span className="text-[10px] font-mono text-muted-foreground/50">
                    {formatDate(user.lastActive)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        </div>

        {users.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-xs text-muted-foreground/50">No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
