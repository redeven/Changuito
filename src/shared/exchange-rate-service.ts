import { get } from 'es-toolkit/compat';
import type { ExchangeRate } from './exchange-rate';
import { type ExchangeRateSourceId, findExchangeRateSource } from './exchange-rate-sources';
import { parseLocalizedNumber } from './money';

const EXCHANGE_RATE_TTL_MS = 60 * 60 * 1000;

export type ExchangeRateServiceAdapter = {
  fetchJson(url: string): Promise<unknown>;
  readCache(): Promise<unknown>;
  writeCache(exchangeRate: ExchangeRate): Promise<void>;
};

function isFresh(exchangeRate: ExchangeRate): boolean {
  return Date.now() - exchangeRate.fetchedAt < EXCHANGE_RATE_TTL_MS;
}

function parseRateValue(value: unknown, locale: string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') return parseLocalizedNumber(value, locale);
  return null;
}

export function createExchangeRateService({ fetchJson, readCache, writeCache }: ExchangeRateServiceAdapter) {
  const pendingRefreshes = new Map<ExchangeRateSourceId, Promise<ExchangeRate | null>>();

  async function readCachedExchangeRate(sourceId: ExchangeRateSourceId): Promise<ExchangeRate | null> {
    const cached = (await readCache()) as ExchangeRate | undefined;
    return cached?.sourceId === sourceId && typeof cached.rate === 'number' ? cached : null;
  }

  async function fetchExchangeRate(sourceId: ExchangeRateSourceId): Promise<ExchangeRate> {
    const source = findExchangeRateSource(sourceId);
    const body = await fetchJson(source.url).catch((error: unknown) => {
      throw new Error(`${source.name} ${error instanceof Error ? error.message : String(error)}`);
    });
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
      await writeCache(exchangeRate);
      return exchangeRate;
    } catch (error) {
      console.warn('Changuito: no se pudo actualizar la cotización', error);
      return cached;
    }
  }

  return async function getExchangeRate(sourceId: ExchangeRateSourceId): Promise<ExchangeRate | null> {
    const cached = await readCachedExchangeRate(sourceId);
    if (cached && isFresh(cached)) return cached;
    let pendingRefresh = pendingRefreshes.get(sourceId);
    if (!pendingRefresh) {
      pendingRefresh = refreshExchangeRate(sourceId, cached).finally(() => pendingRefreshes.delete(sourceId));
      pendingRefreshes.set(sourceId, pendingRefresh);
    }
    return pendingRefresh;
  };
}
