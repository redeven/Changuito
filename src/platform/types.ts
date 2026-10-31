import type { ExchangeRate } from '../shared/exchange-rate';
import type { ExchangeRateSourceId } from '../shared/exchange-rate-sources';

export type Platform = {
  version: string;
  assetUrl(path: string): string;
  loadValue(key: string): Promise<unknown>;
  saveValue(key: string, value: unknown): Promise<void>;
  onValueChanged(key: string, listener: (value: unknown) => void): void;
  requestExchangeRate(sourceId: ExchangeRateSourceId): Promise<ExchangeRate | null>;
};
