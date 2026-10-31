import githubIcon from '../../static/icons/links/github.svg';
import { createExchangeRateService } from '../shared/exchange-rate-service';
import type { Platform } from './types';

const EXCHANGE_RATE_STORAGE_KEY = 'exchangeRate';

const assetUrls: Readonly<Record<string, string>> = {
  'icons/links/github.svg': `data:image/svg+xml,${encodeURIComponent(githubIcon)}`,
};

const localListeners = new Map<string, Set<(value: unknown) => void>>();

function parseStoredValue(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function writeRawValue(key: string, raw: string): Promise<void> {
  return GM.setValue(key, raw);
}

function requestJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    GM.xmlHttpRequest({
      method: 'GET',
      url,
      anonymous: true,
      onload: ({ status, responseText }) => {
        if (status < 200 || status >= 300) {
          reject(new Error(`respondió ${status}`));
          return;
        }
        try {
          resolve(JSON.parse(responseText));
        } catch (error) {
          reject(error);
        }
      },
      onerror: () => reject(new Error('no respondió')),
      ontimeout: () => reject(new Error('no respondió a tiempo')),
    });
  });
}

export function registerMenuCommand(caption: string, onClick: () => void): void {
  GM.registerMenuCommand?.(caption, onClick);
}

export const platform: Platform = {
  version: __CHANGUITO_VERSION__,

  assetUrl(path) {
    return assetUrls[path] ?? '';
  },

  async loadValue(key) {
    return parseStoredValue(await GM.getValue(key));
  },

  async saveValue(key, value) {
    await writeRawValue(key, JSON.stringify(value));
    localListeners.get(key)?.forEach((listener) => listener(value));
  },

  onValueChanged(key, listener) {
    const listeners = localListeners.get(key) ?? new Set();
    listeners.add(listener);
    localListeners.set(key, listeners);
    if (typeof GM_addValueChangeListener !== 'function') return;
    GM_addValueChangeListener(key, (_name, _oldValue, newValue, remote) => {
      if (remote) listener(parseStoredValue(newValue));
    });
  },

  requestExchangeRate: createExchangeRateService({
    fetchJson: requestJson,
    readCache: () => platform.loadValue(EXCHANGE_RATE_STORAGE_KEY),
    writeCache: (exchangeRate) => writeRawValue(EXCHANGE_RATE_STORAGE_KEY, JSON.stringify(exchangeRate)),
  }),
};
