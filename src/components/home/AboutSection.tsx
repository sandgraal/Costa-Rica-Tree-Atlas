export function AboutSection({
  openSource,
  description,
}: {
  openSource: string;
  description: string;
}) {
  return (
    <>
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22V8M5 12l7-10 7 10M5 12a7 7 0 0 0 14 0" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4">
        {openSource}
      </h2>
      <p className="text-muted-foreground text-lg">{description}</p>
    </>
  );
}
