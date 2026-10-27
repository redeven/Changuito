import { describe, expect, it } from "vitest";
import { analyzeRegionalPrice, findNearestPricingTier } from "../src/content/regional/regional-analysis";
import { describeRegionalPrice } from "../src/content/regional/regional-summary";

const fullPriceGame = { usInitial: 19.99, usFinal: 19.99, regionalInitial: 0, regionalFinal: 0, discountPercent: 0 };

function analyzeAtRegionalPrice(regionalFinal: number) {
  return analyzeRegionalPrice({ ...fullPriceGame, regionalInitial: regionalFinal, regionalFinal });
}

describe("findNearestPricingTier", () => {
  it("elige el escalón más cercano al precio en dólares", () => {
    expect(findNearestPricingTier(19.99).latamRecommendedPrice).toBe(10.99);
    expect(findNearestPricingTier(21).usdPrice).toBe(19.99);
    expect(findNearestPricingTier(500).usdPrice).toBe(199.99);
  });
});

describe("analyzeRegionalPrice", () => {
  it("detecta juegos sin precio regional", () => {
    const analysis = analyzeAtRegionalPrice(19.99);
    expect(analysis.status).toBe("none");
    expect(describeRegionalPrice(analysis)).toContain("No tiene precio regional");
  });

  it("considera bueno un precio igual al sugerido", () => {
    const analysis = analyzeAtRegionalPrice(10.99);
    expect(analysis.status).toBe("fair");
    expect(analysis.differencePercent).toBe(0);
    expect(describeRegionalPrice(analysis)).toBe("El precio regional coincide con el sugerido por Valve.");
  });

  it("usa el límite de 25% para separar bueno de elevado y muy bueno", () => {
    expect(analyzeAtRegionalPrice(10.99 * 1.25).status).toBe("fair");
    expect(analyzeAtRegionalPrice(10.99 * 1.3).status).toBe("elevated");
    expect(analyzeAtRegionalPrice(10.99 * 0.75).status).toBe("fair");
    expect(analyzeAtRegionalPrice(10.99 * 0.7).status).toBe("cheap");
  });

  it("marca como excelente un precio dentro del 20% del valor PPP", () => {
    expect(analyzeAtRegionalPrice(4.39).status).toBe("excellent");
    expect(analyzeAtRegionalPrice(5.26).status).toBe("excellent");
    expect(analyzeAtRegionalPrice(4.39 * 1.25).status).toBe("cheap");
  });

  it("aplica el descuento de Estados Unidos al precio sugerido", () => {
    const analysis = analyzeRegionalPrice({
      usInitial: 19.99,
      usFinal: 9.99,
      regionalInitial: 10.99,
      regionalFinal: 5.49,
      discountPercent: 50,
    });
    expect(analysis.suggestedFinal).toBeCloseTo(5.495);
    expect(analysis.status).toBe("fair");
  });

  it("describe diferencias sin mencionar al publisher", () => {
    expect(describeRegionalPrice(analyzeAtRegionalPrice(10.99 * 1.4))).toBe(
      "El precio regional es 40% más alto que el sugerido por Valve.",
    );
    expect(describeRegionalPrice(analyzeAtRegionalPrice(10.99 * 0.6))).toBe(
      "El precio regional es 40% más bajo que el sugerido por Valve.",
    );
  });
});
