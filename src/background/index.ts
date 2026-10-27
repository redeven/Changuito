import { type ExchangeRate, isGetExchangeRateMessage } from "../shared/exchange-rate";
import { parseArgentineDecimal } from "../shared/money";

const AMBITO_OFFICIAL_RATE_URL = "https://mercados.ambito.com//dolar/oficial/variacion";
const EXCHANGE_RATE_STORAGE_KEY = "exchangeRate";
const EXCHANGE_RATE_TTL_MS = 60 * 60 * 1000;

type AmbitoRateResponse = {
  venta?: string;
  fecha?: string;
};

let pendingRefresh: Promise<ExchangeRate | null> | null = null;

async function readCachedExchangeRate(): Promise<ExchangeRate | null> {
  const stored = await browser.storage.local.get(EXCHANGE_RATE_STORAGE_KEY);
  return (stored[EXCHANGE_RATE_STORAGE_KEY] as ExchangeRate | undefined) ?? null;
}

function isFresh(exchangeRate: ExchangeRate): boolean {
  return Date.now() - exchangeRate.fetchedAt < EXCHANGE_RATE_TTL_MS;
}

async function fetchAmbitoExchangeRate(): Promise<ExchangeRate> {
  const response = await fetch(AMBITO_OFFICIAL_RATE_URL);
  if (!response.ok) throw new Error(`Ámbito respondió ${response.status}`);
  const body = (await response.json()) as AmbitoRateResponse;
  const sellRate = parseArgentineDecimal(body.venta ?? "");
  if (!sellRate) throw new Error("Ámbito no devolvió un valor de venta válido");
  return { sellRate, sourceDate: body.fecha ?? "", fetchedAt: Date.now() };
}

async function refreshExchangeRate(cached: ExchangeRate | null): Promise<ExchangeRate | null> {
  try {
    const exchangeRate = await fetchAmbitoExchangeRate();
    await browser.storage.local.set({ [EXCHANGE_RATE_STORAGE_KEY]: exchangeRate });
    return exchangeRate;
  } catch (error) {
    console.warn("Changuito: no se pudo actualizar la cotización", error);
    return cached;
  }
}

async function getExchangeRate(): Promise<ExchangeRate | null> {
  const cached = await readCachedExchangeRate();
  if (cached && isFresh(cached)) return cached;
  pendingRefresh ??= refreshExchangeRate(cached).finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
}

browser.runtime.onMessage.addListener((message: unknown) => {
  if (isGetExchangeRateMessage(message)) return getExchangeRate();
  return undefined;
});
