import { describe, expect, it } from "vitest";
import { findStandaloneUsdPrice, findUsdPrice, formatArs, formatUsd, parseArgentineDecimal, parseUsdPrice } from "../src/shared/money";

describe("parseUsdPrice", () => {
  it.each([
    ["$19.99", 19.99],
    ["$1,234.56", 1234.56],
    ["$5.69 USD", 5.69],
    ["$5", 5],
    ["Menos de $10.00", 10],
  ])("lee %s", (text, expected) => {
    expect(parseUsdPrice(text)).toBe(expected);
  });

  it("ignora textos sin precio o en pesos", () => {
    expect(parseUsdPrice("Gratis")).toBeNull();
    expect(parseUsdPrice("ARS$ 1.234,56")).toBeNull();
  });
});

describe("findStandaloneUsdPrice", () => {
  it("acepta un precio solo, con espacios o sufijo USD", () => {
    expect(findStandaloneUsdPrice("  $59.99  ")?.amount).toBe(59.99);
    expect(findStandaloneUsdPrice("$59.99 USD")?.amount).toBe(59.99);
  });

  it("rechaza precios rodeados de texto", () => {
    expect(findStandaloneUsdPrice("Comprar por $59.99")).toBeNull();
  });
});

describe("findUsdPrice", () => {
  it("devuelve el texto exacto que coincide, incluyendo el sufijo USD", () => {
    expect(findUsdPrice("$9.99 USD / mes")?.matchedText).toBe("$9.99 USD");
  });
});

describe("parseArgentineDecimal", () => {
  it("lee el formato de Ámbito", () => {
    expect(parseArgentineDecimal("1560,40")).toBe(1560.4);
    expect(parseArgentineDecimal("1.560,40")).toBe(1560.4);
  });

  it("rechaza valores vacíos o inválidos", () => {
    expect(parseArgentineDecimal("")).toBeNull();
    expect(parseArgentineDecimal("abc")).toBeNull();
  });
});

describe("formato", () => {
  it("usa separadores argentinos", () => {
    expect(formatArs(31840)).toBe("ARS$ 31.840,00");
    expect(formatUsd(19.99)).toBe("USD$ 19,99");
  });
});
