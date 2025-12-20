"use client";

interface PrintButtonProps {
  label: string;
}

export function PrintButton({ label }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
    >
      {label}
    </button>
  );
}
