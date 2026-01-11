"use client";

import { getMDXComponent } from "next-contentlayer2/hooks";
import { mdxComponents } from "@/components/mdx";
import { AutoGlossaryLink } from "@/components/AutoGlossaryLink";

interface MDXRendererProps {
  code: string;
  glossaryTerms?: Array<{ term: string; slug: string; locale: string }>;
  enableGlossaryLinks?: boolean;
}

export function MDXRenderer({
  code,
  glossaryTerms = [],
  enableGlossaryLinks = true,
}: MDXRendererProps) {
  const MDXContent = getMDXComponent(code);

  if (enableGlossaryLinks && glossaryTerms.length > 0) {
    return (
      <AutoGlossaryLink glossaryTerms={glossaryTerms}>
        <MDXContent components={mdxComponents} />
      </AutoGlossaryLink>
    );
  }

  return <MDXContent components={mdxComponents} />;
}
