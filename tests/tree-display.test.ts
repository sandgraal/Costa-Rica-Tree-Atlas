import { describe, expect, it } from "vitest";
import {
  getAmbiguousCommonNameSet,
  hasAmbiguousCommonName,
} from "@/lib/tree-display";

describe("tree-display helpers", () => {
  it("finds common names that appear more than once", () => {
    const ambiguous = getAmbiguousCommonNameSet([
      { title: "Alcornoque" },
      { title: "Ceiba" },
      { title: "Alcornoque" },
      { title: "Cocobolo" },
    ]);

    expect([...ambiguous]).toEqual(["Alcornoque"]);
    expect(hasAmbiguousCommonName("Alcornoque", ambiguous)).toBe(true);
    expect(hasAmbiguousCommonName("Ceiba", ambiguous)).toBe(false);
  });

  it("returns an empty set when all common names are unique", () => {
    const ambiguous = getAmbiguousCommonNameSet([
      { title: "Ceiba" },
      { title: "Cocobolo" },
      { title: "Cenízaro" },
    ]);

    expect(ambiguous.size).toBe(0);
  });
});
