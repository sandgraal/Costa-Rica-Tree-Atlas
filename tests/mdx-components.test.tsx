/**
 * MDX Component Integration Tests
 *
 * These tests ensure that all MDX components used in tree content files
 * are properly defined and can handle the props they receive from content.
 */

import { describe, it, expect } from "vitest";
import { DataTable } from "@/components/mdx";

describe("DataTable Component", () => {
  it('should accept "rows" prop (current standard)', () => {
    const props = {
      headers: ["Column 1", "Column 2"],
      rows: [
        ["Value 1", "Value 2"],
        ["Value 3", "Value 4"],
      ],
    };

    // This should not throw
    expect(() => {
      // Simulate what MDX does - just verify the component accepts these props
      const component = DataTable(props);
      expect(component).toBeDefined();
    }).not.toThrow();
  });

  it('should accept "data" prop (legacy support)', () => {
    const props = {
      headers: ["Column 1", "Column 2"],
      data: [
        ["Value 1", "Value 2"],
        ["Value 3", "Value 4"],
      ],
    };

    // This should not throw
    expect(() => {
      const component = DataTable(props);
      expect(component).toBeDefined();
    }).not.toThrow();
  });

  it("should handle empty data gracefully", () => {
    const props = {
      headers: ["Column 1", "Column 2"],
      rows: [],
    };

    expect(() => {
      const component = DataTable(props);
      expect(component).toBeDefined();
    }).not.toThrow();
  });

  it("should handle undefined data (no crash)", () => {
    const props = {
      headers: ["Column 1", "Column 2"],
    };

    expect(() => {
      const component = DataTable(props);
      expect(component).toBeDefined();
    }).not.toThrow();
  });

  it("should render table structure", () => {
    const props = {
      headers: ["Language", "Name"],
      data: [
        ["English", "Oak"],
        ["Spanish", "Roble"],
      ],
    };

    const component = DataTable(props);
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
  });
});
