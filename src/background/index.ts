import { get } from 'es-toolkit/compat';
import { type ExchangeRate, isGetExchangeRateMessage } from '../shared/exchange-rate';
import { type ExchangeRateSourceId, findExchangeRateSource } from '../shared/exchange-rate-sources';
import { parseLocalizedNumber } from '../shared/money';
import { loadSettings } from '../shared/settings';

const EXCHANGE_RATE_STORAGE_KEY = 'exchangeRate';
const EXCHANGE_RATE_TTL_MS = 60 * 60 * 1000;

const pendingRefreshes = new Map<ExchangeRateSourceId, Promise<ExchangeRate | null>>();

async function readCachedExchangeRate(sourceId: ExchangeRateSourceId): Promise<ExchangeRate | null> {
  const stored = await browser.storage.local.get(EXCHANGE_RATE_STORAGE_KEY);
  const cached = stored[EXCHANGE_RATE_STORAGE_KEY] as ExchangeRate | undefined;
  return cached?.sourceId === sourceId && typeof cached.rate === 'number' ? cached : null;
}

function isFresh(exchangeRate: ExchangeRate): boolean {
  return Date.now() - exchangeRate.fetchedAt < EXCHANGE_RATE_TTL_MS;
}

function parseRateValue(value: unknown, locale: string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') return parseLocalizedNumber(value, locale);
  return null;
}

async function fetchExchangeRate(sourceId: ExchangeRateSourceId): Promise<ExchangeRate> {
  const source = findExchangeRateSource(sourceId);
  const response = await fetch(source.url);
  if (!response.ok) throw new Error(`${source.name} respondió ${response.status}`);
  const body: unknown = await response.json();
  const rate = parseRateValue(get(body, source.valuePath), source.locale);
  if (!rate) throw new Error(`${source.name} no devolvió un valor válido en "${source.valuePath}"`);
  const sourceDate = source.datePath ? String(get(body, source.datePath) ?? '') : '';
  return { sourceId, rate, sourceDate, fetchedAt: Date.now() };
}

async function refreshExchangeRate(
  sourceId: ExchangeRateSourceId,
  cached: ExchangeRate | null
): Promise<ExchangeRate | null> {
  try {
    const exchangeRate = await fetchExchangeRate(sourceId);
    await browser.storage.local.set({ [EXCHANGE_RATE_STORAGE_KEY]: exchangeRate });
    return exchangeRate;
  } catch (error) {
    console.warn('Changuito: no se pudo actualizar la cotización', error);
    return cached;
  }
}

async function getExchangeRate(): Promise<ExchangeRate | null> {
  const { exchangeRateSourceId: sourceId } = await loadSettings();
  const cached = await readCachedExchangeRate(sourceId);
  if (cached && isFresh(cached)) return cached;
  let pendingRefresh = pendingRefreshes.get(sourceId);
  if (!pendingRefresh) {
    pendingRefresh = refreshExchangeRate(sourceId, cached).finally(() => pendingRefreshes.delete(sourceId));
    pendingRefreshes.set(sourceId, pendingRefresh);
  }
  return pendingRefresh;
}

browser.runtime.onMessage.addListener((message: unknown) => {
  if (isGetExchangeRateMessage(message)) return getExchangeRate();
  return undefined;
});
