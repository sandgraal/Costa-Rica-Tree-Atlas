interface ImpactStatProps {
  value: string;
  label: string;
  icon: string;
}

export function ImpactStat({ value, label, icon }: ImpactStatProps) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-primary mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
