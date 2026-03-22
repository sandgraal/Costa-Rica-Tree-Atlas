"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ShareLinkProps {
  title?: string;
  copiedText?: string;
  className?: string;
}

export function ShareLink({
  title,
  copiedText,
  className = "",
}: ShareLinkProps) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);
  const resolvedTitle = title ?? t("copyLink");
  const resolvedCopiedText = copiedText ?? t("copied");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error(t("failedToCopy"), err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-sm font-medium transition-colors ${className}`}
      aria-label={resolvedTitle}
    >
      {copied ? (
        <>
          <svg
            className="w-4 h-4 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-success">{resolvedCopiedText}</span>
        </>
      ) : (
        <>
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>{resolvedTitle}</span>
        </>
      )}
    </button>
  );
}
