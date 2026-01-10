"use client";

import { getMDXComponent } from "next-contentlayer2/hooks";
import { mdxComponents } from "@/components/mdx";

interface MDXRendererProps {
  code: string;
}

export function MDXRenderer({ code }: MDXRendererProps) {
  const MDXContent = getMDXComponent(code);
  return <MDXContent components={mdxComponents} />;
}
