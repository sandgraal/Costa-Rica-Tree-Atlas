/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  text: string;
  label: string;
}

export function CitationCopyButton({ text, label }: Props) {
  const t = useTranslations("cite");
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write blocked; degrade silently — the text is still
      // visible and selectable.
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="text-xs text-primary hover:text-primary-dark underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm no-print"
      aria-label={t("copyAriaLabel", { format: label })}
    >
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
