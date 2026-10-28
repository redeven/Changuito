import type { DisplayMode } from '../shared/settings';

export type Currency = 'ars' | 'usd';

export type CurrencyDecision = {
  displayMode: DisplayMode;
  walletBalance: number;
  usdPrice: number;
  walletCanPay: boolean;
};

export function resolveCurrency({ displayMode, walletBalance, usdPrice, walletCanPay }: CurrencyDecision): Currency {
  if (displayMode === 'ars') return 'ars';
  if (displayMode === 'usd') return 'usd';
  return walletCanPay && walletBalance >= usdPrice ? 'usd' : 'ars';
}

export function oppositeCurrency(currency: Currency): Currency {
  return currency === 'ars' ? 'usd' : 'ars';
}
