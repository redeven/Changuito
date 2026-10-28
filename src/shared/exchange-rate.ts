import type { ExchangeRateSourceId } from './exchange-rate-sources';

export type ExchangeRate = {
  sourceId: ExchangeRateSourceId;
  rate: number;
  sourceDate: string;
  fetchedAt: number;
};

export const GET_EXCHANGE_RATE_MESSAGE = 'changuito:get-exchange-rate';

export type GetExchangeRateMessage = { type: typeof GET_EXCHANGE_RATE_MESSAGE };

export function isGetExchangeRateMessage(message: unknown): message is GetExchangeRateMessage {
  return (message as GetExchangeRateMessage | undefined)?.type === GET_EXCHANGE_RATE_MESSAGE;
}

export async function requestExchangeRate(): Promise<ExchangeRate | null> {
  const message: GetExchangeRateMessage = { type: GET_EXCHANGE_RATE_MESSAGE };
  return browser.runtime.sendMessage(message);
}
