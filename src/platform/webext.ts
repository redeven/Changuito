import { GET_EXCHANGE_RATE_MESSAGE, type GetExchangeRateMessage } from '../shared/exchange-rate';
import type { Platform } from './types';

export const platform: Platform = {
  get version() {
    return browser.runtime.getManifest().version;
  },

  assetUrl(path) {
    return browser.runtime.getURL(path);
  },

  async loadValue(key) {
    const stored = await browser.storage.sync.get(key);
    return stored[key];
  },

  async saveValue(key, value) {
    await browser.storage.sync.set({ [key]: value });
  },

  onValueChanged(key, listener) {
    browser.storage.onChanged.addListener((changes, areaName) => {
      const change = changes[key];
      if (areaName === 'sync' && change) listener(change.newValue);
    });
  },

  requestExchangeRate(sourceId) {
    const message: GetExchangeRateMessage = { type: GET_EXCHANGE_RATE_MESSAGE, sourceId };
    return browser.runtime.sendMessage(message);
  },
};
