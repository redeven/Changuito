import type { ExchangeRateSource } from './exchange-rate-sources';

export const EXCHANGE_RATE_SOURCES = [
  {
    id: 'ambito-official',
    name: 'Dólar oficial (Ámbito)',
    url: 'https://mercados.ambito.com//dolar/oficial/variacion',
    valuePath: 'venta',
    locale: 'es-AR',
    datePath: 'fecha',
  },
] as const satisfies readonly ExchangeRateSource[];
