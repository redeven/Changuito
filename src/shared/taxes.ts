import type { Settings } from "./settings";

export type TaxSettings = Pick<Settings, "nationalTaxPercent" | "provincialTaxPercent">;

export function totalTaxPercent(taxes: TaxSettings): number {
  return taxes.nationalTaxPercent + taxes.provincialTaxPercent;
}

export function effectiveArsPerUsd(sellRate: number, taxes: TaxSettings): number {
  return sellRate * (1 + totalTaxPercent(taxes) / 100);
}

export function convertUsdToArs(usdAmount: number, sellRate: number, taxes: TaxSettings): number {
  return usdAmount * effectiveArsPerUsd(sellRate, taxes);
}
