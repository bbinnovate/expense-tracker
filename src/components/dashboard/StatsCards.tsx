import { Users, Receipt, IndianRupee, Smartphone, MonitorSmartphone } from "lucide-react";

interface StatsCardsProps {
  totalUsers: number;
  totalExpenses: number;
  totalSpent: number;
  activeDevices: number;
  pwaInstalls: number;
}

function formatAmount(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}

export default function StatsCards({ totalUsers, totalExpenses, totalSpent, activeDevices, pwaInstalls }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      topBorder: "#3b82f6",
      iconOpacity: "rgba(59,130,246,0.12)",
      labelColor: "rgba(96,165,250,0.8)",
    },
    {
      label: "Total Expenses",
      value: totalExpenses.toString(),
      icon: Receipt,
      topBorder: "hsl(45,95%,55%)",
      iconOpacity: "hsl(45 95% 55% / 0.12)",
      labelColor: "hsl(45 95% 55% / 0.8)",
    },
    {
      label: "Total Spent",
      value: `₹${formatAmount(totalSpent)}`,
      icon: IndianRupee,
      topBorder: "hsl(150,50%,40%)",
      iconOpacity: "hsl(150 50% 40% / 0.12)",
      labelColor: "hsl(150 50% 50% / 0.9)",
    },
    {
      label: "PWA Installs",
      value: pwaInstalls.toString(),
      icon: MonitorSmartphone,
      topBorder: "#14b8a6",
      iconOpacity: "rgba(20,184,166,0.12)",
      labelColor: "rgba(45,212,191,0.85)",
    },
    {
      label: "Push Devices",
      value: activeDevices.toString(),
      icon: Smartphone,
      topBorder: "#a855f7",
      iconOpacity: "rgba(168,85,247,0.12)",
      labelColor: "rgba(192,132,252,0.85)",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl bg-card border border-border group hover:border-border/80 transition-all duration-300"
            style={{
              borderTop: `2px solid ${stat.topBorder}`,
              animationDelay: `${i * 80}ms`,
            }}
          >
            {/* Large decorative background icon */}
            <Icon
              className="absolute -right-4 -bottom-4 w-20 h-20 sm:-right-5 sm:-bottom-5 sm:w-28 sm:h-28 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
              style={{ color: stat.iconOpacity }}
            />

            <div className="relative p-4 sm:p-5">
              <p
                className="text-[9px] font-bold uppercase mb-2 sm:mb-3"
                style={{ letterSpacing: "0.14em", color: stat.labelColor }}
              >
                {stat.label}
              </p>
              <p className="text-2xl sm:text-[2rem] leading-none font-bold font-mono tracking-tight text-foreground">
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
