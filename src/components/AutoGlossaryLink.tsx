"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface GlossaryTerm {
  term: string;
  slug: string;
  locale: string;
  simpleDefinition?: string;
}

interface AutoGlossaryLinkProps {
  children: React.ReactNode;
  glossaryTerms: GlossaryTerm[];
  enableTooltips?: boolean; // Optional: allow disabling tooltips
}

/**
 * Component that automatically converts glossary terms in text to interactive tooltips.
 *
 * How it works:
 * 1. Receives text content and list of glossary terms
 * 2. For each text node, searches for glossary term matches
 * 3. Wraps matched terms in GlossaryTooltip components with hover definitions
 * 4. Links only first occurrence per paragraph to avoid over-linking
 * 5. Shows definition on hover/focus for better UX
 */
export function AutoGlossaryLink({
  children,
  glossaryTerms,
  enableTooltips = true,
}: AutoGlossaryLinkProps) {
  const params = useParams();
  const locale = params.locale as string;

  // Filter terms for current locale
  const termPatterns = useMemo(() => {
    if (!glossaryTerms || glossaryTerms.length === 0) return [];

    return glossaryTerms
      .filter((t) => t.locale === locale)
      .map((t) => ({
        term: t.term,
        slug: t.slug,
        simpleDefinition: t.simpleDefinition || "",
      }))
      .sort((a, b) => b.term.length - a.term.length); // Sort by length (longest first) to match longer terms before shorter ones
  }, [glossaryTerms, locale]);

  const processText = (text: string): React.ReactNode[] => {
    if (!text || typeof text !== "string") return [text];
    if (termPatterns.length === 0) return [text];

    const result: React.ReactNode[] = [];
    let remainingText = text;
    const linkedTerms = new Set<string>(); // Track which terms we've already linked in this text

    let key = 0;

    while (remainingText.length > 0) {
      let matched = false;

      // Try to find a glossary term in the remaining text
      for (const { term, slug, simpleDefinition } of termPatterns) {
        const matchIndex = findWholeWordMatchIndex(remainingText, term);

        if (matchIndex !== -1) {
          const matchedText = remainingText.substring(
            matchIndex,
            matchIndex + term.length
          );
          const termLower = term.toLowerCase();

          // Only link if we haven't already linked this term in this text
          if (!linkedTerms.has(termLower)) {
            // Add text before the match
            if (matchIndex > 0) {
              result.push(remainingText.substring(0, matchIndex));
            }

            // Add the linked term with tooltip (if enabled and definition available)
            if (enableTooltips && simpleDefinition) {
              result.push(
                <GlossaryTooltip
                  key={`glossary-${slug}-${key++}`}
                  term={term}
                  definition={simpleDefinition}
                  slug={slug}
                >
                  {matchedText}
                </GlossaryTooltip>
              );
            } else {
              // Fallback to basic link if tooltips disabled
              result.push(
                <span
                  key={`glossary-${slug}-${key++}`}
                  className="text-primary hover:text-primary-dark underline decoration-dotted underline-offset-2 transition-colors"
                >
                  {matchedText}
                </span>
              );
            }

            linkedTerms.add(termLower);
            remainingText = remainingText.substring(
              matchIndex + matchedText.length
            );
            matched = true;
            break;
          }
        }
      }

      // If no match found, add the rest of the text and exit
      if (!matched) {
        result.push(remainingText);
        break;
      }
    }

    return result.length > 0 ? result : [text];
  };

  const processNode = (node: React.ReactNode): React.ReactNode => {
    // If it's a string, process it for glossary terms
    if (typeof node === "string") {
      return processText(node);
    }

    // If it's an array, process each element
    if (Array.isArray(node)) {
      return node.map((child, index) => (
        <React.Fragment key={index}>{processNode(child)}</React.Fragment>
      ));
    }

    // If it's a React element, recurse into its children
    // But skip certain elements where we don't want to add links
    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
      const element = node;

      // Don't process children of these elements
      const skipElements = [
        "a",
        "code",
        "pre",
        "Link",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ];

      if (
        typeof element.type === "string" &&
        skipElements.includes(element.type)
      ) {
        return node;
      }

      // If element has children, process them
      if (
        element.props &&
        typeof element.props === "object" &&
        "children" in element.props
      ) {
        const { children: originalChildren, ...restProps } = element.props as {
          children?: React.ReactNode;
        };
        return React.cloneElement(
          element,
          restProps,
          processNode(originalChildren)
        );
      }
    }

    return node;
  };

  return <>{processNode(children)}</>;
}

function isWordChar(char: string): boolean {
  return /^[A-Za-z0-9_]$/.test(char);
}

function findWholeWordMatchIndex(text: string, term: string): number {
  if (!text || !term) return -1;

  const textLower = text.toLowerCase();
  const termLower = term.toLowerCase();

  let fromIndex = 0;
  while (fromIndex < text.length) {
    const index = textLower.indexOf(termLower, fromIndex);
    if (index === -1) return -1;

    const before = index > 0 ? text[index - 1] : "";
    const afterIndex = index + term.length;
    const after = afterIndex < text.length ? text[afterIndex] : "";

    const startsOnBoundary = index === 0 || !isWordChar(before);
    const endsOnBoundary = afterIndex === text.length || !isWordChar(after);

    if (startsOnBoundary && endsOnBoundary) {
      return index;
    }

    fromIndex = index + 1;
  }

  return -1;
}
