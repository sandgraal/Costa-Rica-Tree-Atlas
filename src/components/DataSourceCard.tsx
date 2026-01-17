interface DataSourceCardProps {
  name: string;
  icon: string;
  description: string;
  whatWeUse: string;
  whyItMatters: string;
  link: string;
  ctaText: string;
}

export function DataSourceCard({
  name,
  icon,
  description,
  whatWeUse,
  whyItMatters,
  link,
  ctaText,
}: DataSourceCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">{icon}</div>
        <h3 className="text-xl font-semibold text-foreground">{name}</h3>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {/* What We Use */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-primary-dark dark:text-primary-light mb-2">
          What We Use
        </h4>
        <p className="text-sm text-foreground/80">{whatWeUse}</p>
      </div>

      {/* Why It Matters */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-primary-dark dark:text-primary-light mb-2">
          Why It Matters
        </h4>
        <p className="text-sm text-foreground/80">{whyItMatters}</p>
      </div>

      {/* CTA Button */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
      >
        {ctaText}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
}
