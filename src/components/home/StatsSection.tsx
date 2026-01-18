"use client";

import { memo } from "react";

export const StatsSection = memo(function StatsSection({
  speciesCount,
  familiesCount,
  statusCount,
  locale,
}: {
  speciesCount: number;
  familiesCount: number;
  statusCount: number;
  locale: string;
}) {
  const stats = [
    {
      value: speciesCount,
      label: locale === "es" ? "Especies Documentadas" : "Documented Species",
      icon: "🌳",
    },
    {
      value: familiesCount,
      label: locale === "es" ? "Familias Botánicas" : "Botanical Families",
      icon: "🌿",
    },
    {
      value: statusCount,
      label:
        locale === "es" ? "Estados de Conservación" : "Conservation Statuses",
      icon: "🛡️",
    },
    {
      value: 2,
      label: locale === "es" ? "Idiomas" : "Languages",
      icon: "🌐",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-xl p-6 border border-border text-center hover:border-primary/50 transition-colors"
        >
          <div className="text-3xl mb-2">{stat.icon}</div>
          <div className="text-3xl font-bold text-primary mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
});
