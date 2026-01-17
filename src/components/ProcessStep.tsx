interface ProcessStepProps {
  number: number;
  title: string;
  icon: string;
  children: React.ReactNode;
}

export function ProcessStep({
  number,
  title,
  icon,
  children,
}: ProcessStepProps) {
  return (
    <div className="flex-1 text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-sm font-semibold text-primary mb-1">
        {number}. {title}
      </div>
      <p className="text-xs text-muted-foreground">{children}</p>
    </div>
  );
}

export function ProcessArrow() {
  return (
    <div className="hidden md:flex items-center justify-center text-2xl text-muted-foreground">
      →
    </div>
  );
}
