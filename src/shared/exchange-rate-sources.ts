import { EXCHANGE_RATE_SOURCES } from './exchange-rate-sources.data';

export { EXCHANGE_RATE_SOURCES };

export type ExchangeRateSource = {
  id: string;
  name: string;
  url: string;
  valuePath: string;
  locale: string;
  datePath?: string;
};

export type ExchangeRateSourceId = (typeof EXCHANGE_RATE_SOURCES)[number]['id'];

export const DEFAULT_EXCHANGE_RATE_SOURCE_ID: ExchangeRateSourceId = 'ambito-official';

export const exchangeRateSourceIds: readonly ExchangeRateSourceId[] = EXCHANGE_RATE_SOURCES.map((source) => source.id);

export function findExchangeRateSource(id: ExchangeRateSourceId): ExchangeRateSource {
  return EXCHANGE_RATE_SOURCES.find((source) => source.id === id) ?? EXCHANGE_RATE_SOURCES[0];
}
