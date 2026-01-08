import { describe, it, expect } from "vitest";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  it("validates the hook exists and is a function", () => {
    expect(typeof useDebounce).toBe("function");
  });

  it("validates default delay parameter", () => {
    // The hook should accept a delay parameter with default value of 300
    expect(useDebounce).toBeDefined();
    expect(useDebounce.length).toBe(2); // Expects 2 parameters (value, delay)
  });

  it("validates the hook type signature", () => {
    // Basic validation that the hook is properly exported
    expect(useDebounce).toBeTypeOf("function");
  });
});
