"use client";

import type { Tree } from "contentlayer/generated";
import { TreeCard } from "./tree";

interface TreeCardWithFavoriteProps {
  tree: Tree;
}

/**
 * TreeCardWithFavorite - Legacy wrapper component
 * @deprecated Use TreeCard from ./tree with showFavorite=true instead
 */
export function TreeCardWithFavorite({ tree }: TreeCardWithFavoriteProps) {
  return (
    <TreeCard
      tree={tree}
      locale={tree.locale as "en" | "es"}
      showFavorite={true}
    />
  );
}
