import { describe, expect, it } from "vitest";
import { oppositeCurrency, resolveCurrency } from "../src/content/display-mode";

const smartDecision = { displayMode: "smart" as const, walletBalance: 20, usdPrice: 19.99, walletCanPay: true };

describe("resolveCurrency", () => {
  it("respeta las preferencias fijas", () => {
    expect(resolveCurrency({ ...smartDecision, displayMode: "ars" })).toBe("ars");
    expect(resolveCurrency({ ...smartDecision, displayMode: "usd" })).toBe("usd");
  });

  it("muestra dólares si el saldo alcanza en modo inteligente", () => {
    expect(resolveCurrency(smartDecision)).toBe("usd");
    expect(resolveCurrency({ ...smartDecision, walletBalance: 19.99 })).toBe("usd");
  });

  it("muestra pesos si el saldo no alcanza o no puede usarse", () => {
    expect(resolveCurrency({ ...smartDecision, walletBalance: 5 })).toBe("ars");
    expect(resolveCurrency({ ...smartDecision, walletCanPay: false })).toBe("ars");
  });

  it("alterna monedas", () => {
    expect(oppositeCurrency("ars")).toBe("usd");
    expect(oppositeCurrency("usd")).toBe("ars");
  });
});
