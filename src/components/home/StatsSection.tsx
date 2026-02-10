interface HomeStat {
  value: number;
  label: string;
  icon: string;
}

interface StatsSectionProps {
  stats: HomeStat[];
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/50"
        >
          <div className="mb-2 text-3xl">{stat.icon}</div>
          <div className="mb-1 text-3xl font-bold text-primary">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
