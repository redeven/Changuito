import type { Settings } from './settings';

export type TaxSettings = Pick<Settings, 'nationalTaxPercent' | 'provincialTaxPercent'>;

export function totalTaxPercent(taxes: TaxSettings): number {
  return taxes.nationalTaxPercent + taxes.provincialTaxPercent;
}

export function effectiveArsPerUsd(rate: number, taxes: TaxSettings): number {
  return rate * (1 + totalTaxPercent(taxes) / 100);
}

export function convertUsdToArs(usdAmount: number, rate: number, taxes: TaxSettings): number {
  return usdAmount * effectiveArsPerUsd(rate, taxes);
}
