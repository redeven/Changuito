import type { ExchangeRate } from "../../shared/exchange-rate";
import type { Settings } from "../../shared/settings";

export type FeatureContext = {
  settings: Settings;
  exchangeRate: ExchangeRate | null;
  walletBalance: number;
};

export interface PageFeature {
  refresh(context: FeatureContext): void;
}
