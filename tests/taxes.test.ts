import { describe, expect, it } from "vitest";
import { convertUsdToArs, effectiveArsPerUsd, totalTaxPercent } from "../src/shared/taxes";

const taxes = { nationalTaxPercent: 21, provincialTaxPercent: 2 };

describe("impuestos", () => {
  it("suma impuestos nacionales y provinciales", () => {
    expect(totalTaxPercent(taxes)).toBe(23);
  });

  it("aplica los impuestos sobre la cotización oficial", () => {
    expect(effectiveArsPerUsd(1000, taxes)).toBeCloseTo(1230);
  });

  it("convierte dólares a pesos con impuestos incluidos", () => {
    expect(convertUsdToArs(10, 1000, taxes)).toBeCloseTo(12300);
    expect(convertUsdToArs(10, 1000, { nationalTaxPercent: 0, provincialTaxPercent: 0 })).toBeCloseTo(10000);
  });
});
