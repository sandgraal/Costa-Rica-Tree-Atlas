"use client";

import React from "react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden my-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-primary/5 hover:bg-primary/10 flex items-center justify-between text-left transition-colors"
      >
        <span className="font-semibold text-foreground">{title}</span>
        <span
          className={`transition-transform text-primary ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-4 bg-card border-t border-border mdx-accordion-content">
          {children}
        </div>
      )}
    </div>
  );
}
