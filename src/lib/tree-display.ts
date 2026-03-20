import type { TreeBase } from "@/types/tree";

type TreeTitleSummary = Pick<TreeBase, "title">;

export function getAmbiguousCommonNameSet<T extends TreeTitleSummary>(
  trees: T[]
): Set<string> {
  const titleCounts = new Map<string, number>();

  for (const tree of trees) {
    titleCounts.set(tree.title, (titleCounts.get(tree.title) ?? 0) + 1);
  }

  return new Set(
    [...titleCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([title]) => title)
  );
}

export function hasAmbiguousCommonName(
  title: string,
  ambiguousCommonNames: ReadonlySet<string>
): boolean {
  return ambiguousCommonNames.has(title);
}
