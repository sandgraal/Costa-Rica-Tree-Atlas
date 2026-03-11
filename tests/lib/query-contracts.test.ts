import { describe, expect, it } from "vitest";
import {
  buildCompareToolHref,
  buildTreesProvinceHref,
  getLocaleSearchIndex,
} from "@/lib/query-contracts";

describe("query contracts", () => {
  it("returns locale-specific search entries from grouped payload", () => {
    const payload = {
      en: [{ slug: "ceiba" }, { slug: "guanacaste" }],
      es: [{ slug: "ceiba" }],
    };

    expect(getLocaleSearchIndex(payload, "en")).toEqual([
      { slug: "ceiba" },
      { slug: "guanacaste" },
    ]);
    expect(getLocaleSearchIndex(payload, "es")).toEqual([{ slug: "ceiba" }]);
  });

  it("returns payload as-is for array response shape", () => {
    const payload = [{ slug: "ceiba" }];
    expect(getLocaleSearchIndex(payload, "en")).toEqual(payload);
  });

  it("falls back to empty array when locale is missing", () => {
    expect(getLocaleSearchIndex({ en: [{ slug: "ceiba" }] }, "es")).toEqual([]);
  });

  it("builds trees page province query links", () => {
    expect(buildTreesProvinceHref("guanacaste")).toBe(
      "/trees?province=guanacaste"
    );
    expect(buildTreesProvinceHref()).toBe("/trees");
  });

  it("encodes special characters in province query links", () => {
    expect(buildTreesProvinceHref("province with spaces")).toBe(
      "/trees?province=province+with+spaces"
    );
    expect(buildTreesProvinceHref("a&b=c")).toBe("/trees?province=a%26b%3Dc");
  });

  it("builds compare tool links with trees query key", () => {
    expect(buildCompareToolHref(["mango", "espavel"])).toBe(
      "/compare?trees=mango,espavel"
    );
  });

  it("encodes special characters in compare tool links", () => {
    expect(buildCompareToolHref(["a&b", "c=d"])).toBe(
      "/compare?trees=a%26b,c%3Dd"
    );
  });
});
