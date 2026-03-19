interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

/** Centered page title + optional subtitle. Used across index/listing pages. */
export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={`mb-8 text-center ${className ?? ""}`}>
      <h1 className="text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light mb-3">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
