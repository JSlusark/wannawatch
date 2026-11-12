import { describe, expect, it } from "vitest";

import { toPositiveInteger } from "./urlParams";

describe("toPositiveInteger", () => {
  it("reads a whole number above 0", () => {
    expect(toPositiveInteger("531178")).toBe(531178);
  });

  it.each(["abc", "0", "-3", "2.5", "", " "])("refuses %j", (value) => {
    expect(toPositiveInteger(value)).toBeNull();
  });

  it("refuses a missing or repeated value", () => {
    expect(toPositiveInteger(undefined)).toBeNull();
    expect(toPositiveInteger(["1", "2"])).toBeNull();
  });
});
