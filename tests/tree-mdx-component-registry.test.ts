import { describe, expect, it } from "vitest";
import { allTrees } from "contentlayer/generated";
import { mdxServerComponents } from "@/components/mdx/server-components";
import { mdxClientComponents } from "@/components/mdx/client-components";

const MDX_CLIENT_COMPONENTS = Object.keys(
  mdxClientComponents
) as readonly string[];

const CUSTOM_COMPONENT_TAG_REGEX = /<([A-Z][A-Za-z0-9]*)\b/g;

describe("Tree MDX component registry", () => {
  it("should only use components available to ServerMDXContent", () => {
    const availableComponents = new Set([
      ...Object.keys(mdxServerComponents),
      ...MDX_CLIENT_COMPONENTS,
      "TreeGallery",
    ]);

    const missingByTree = new Map<string, Set<string>>();

    for (const tree of allTrees) {
      const usedComponents = new Set<string>();
      let match: RegExpExecArray | null;

      CUSTOM_COMPONENT_TAG_REGEX.lastIndex = 0;
      while (
        (match = CUSTOM_COMPONENT_TAG_REGEX.exec(tree.body.raw)) !== null
      ) {
        usedComponents.add(match[1]);
      }

      for (const componentName of usedComponents) {
        if (!availableComponents.has(componentName)) {
          const treeKey = `${tree.locale}/trees/${tree.slug}`;
          const existing = missingByTree.get(treeKey) ?? new Set<string>();
          existing.add(componentName);
          missingByTree.set(treeKey, existing);
        }
      }
    }

    const missingSummary = [...missingByTree.entries()]
      .map(
        ([treeKey, missing]) => `${treeKey}: ${[...missing].sort().join(", ")}`
      )
      .sort()
      .join("\n");

    expect(
      missingByTree.size,
      missingSummary ||
        "One or more tree files reference MDX components that are not registered"
    ).toBe(0);
  });
});
