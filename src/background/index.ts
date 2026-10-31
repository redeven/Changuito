import { type ExchangeRate, isGetExchangeRateMessage } from '../shared/exchange-rate';
import { exchangeRateSourceIds } from '../shared/exchange-rate-sources';
import { createExchangeRateService } from '../shared/exchange-rate-service';
import { loadSettings } from '../shared/settings';

const EXCHANGE_RATE_STORAGE_KEY = 'exchangeRate';

const getExchangeRate = createExchangeRateService({
  async fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`respondió ${response.status}`);
    return response.json();
  },
  async readCache() {
    const stored = await browser.storage.local.get(EXCHANGE_RATE_STORAGE_KEY);
    return stored[EXCHANGE_RATE_STORAGE_KEY];
  },
  async writeCache(exchangeRate) {
    await browser.storage.local.set({ [EXCHANGE_RATE_STORAGE_KEY]: exchangeRate });
  },
});

async function getRequestedExchangeRate(requestedSourceId: unknown): Promise<ExchangeRate | null> {
  const sourceId = exchangeRateSourceIds.find((id) => id === requestedSourceId);
  return getExchangeRate(sourceId ?? (await loadSettings()).exchangeRateSourceId);
}

browser.runtime.onMessage.addListener((message: unknown) => {
  if (isGetExchangeRateMessage(message)) return getRequestedExchangeRate(message.sourceId);
  return undefined;
});
