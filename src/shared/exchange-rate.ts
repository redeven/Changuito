import { platform } from '#platform';
import type { ExchangeRateSourceId } from './exchange-rate-sources';
import { loadSettings } from './settings';

export type ExchangeRate = {
  sourceId: ExchangeRateSourceId;
  rate: number;
  sourceDate: string;
  fetchedAt: number;
};

export const GET_EXCHANGE_RATE_MESSAGE = 'changuito:get-exchange-rate';

export type GetExchangeRateMessage = { type: typeof GET_EXCHANGE_RATE_MESSAGE; sourceId: ExchangeRateSourceId };

export function isGetExchangeRateMessage(message: unknown): message is GetExchangeRateMessage {
  return (message as GetExchangeRateMessage | undefined)?.type === GET_EXCHANGE_RATE_MESSAGE;
}

export async function requestExchangeRate(): Promise<ExchangeRate | null> {
  const { exchangeRateSourceId } = await loadSettings();
  return platform.requestExchangeRate(exchangeRateSourceId);
}
