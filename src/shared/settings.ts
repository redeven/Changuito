import {
  DEFAULT_EXCHANGE_RATE_SOURCE_ID,
  type ExchangeRateSourceId,
  exchangeRateSourceIds,
} from './exchange-rate-sources';

export type DisplayMode = 'smart' | 'ars' | 'usd';
export type SidebarStyle = 'normal' | 'compact' | 'hidden';

export type Settings = {
  displayMode: DisplayMode;
  nationalTaxPercent: number;
  provincialTaxPercent: number;
  sidebarStyle: SidebarStyle;
  exchangeRateSourceId: ExchangeRateSourceId;
};

export const DEFAULT_SETTINGS: Readonly<Settings> = {
  displayMode: 'smart',
  nationalTaxPercent: 21,
  provincialTaxPercent: 0,
  sidebarStyle: 'normal',
  exchangeRateSourceId: DEFAULT_EXCHANGE_RATE_SOURCE_ID,
};

const SETTINGS_STORAGE_KEY = 'settings';
const displayModes: readonly DisplayMode[] = ['smart', 'ars', 'usd'];
const sidebarStyles: readonly SidebarStyle[] = ['normal', 'compact', 'hidden'];

function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return options.includes(value as T);
}

function isValidPercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function normalizeSettings(stored: unknown): Settings {
  const candidate = (stored ?? {}) as Partial<Record<keyof Settings, unknown>>;
  return {
    displayMode: isOneOf(displayModes, candidate.displayMode) ? candidate.displayMode : DEFAULT_SETTINGS.displayMode,
    nationalTaxPercent: isValidPercent(candidate.nationalTaxPercent)
      ? candidate.nationalTaxPercent
      : DEFAULT_SETTINGS.nationalTaxPercent,
    provincialTaxPercent: isValidPercent(candidate.provincialTaxPercent)
      ? candidate.provincialTaxPercent
      : DEFAULT_SETTINGS.provincialTaxPercent,
    sidebarStyle: isOneOf(sidebarStyles, candidate.sidebarStyle)
      ? candidate.sidebarStyle
      : DEFAULT_SETTINGS.sidebarStyle,
    exchangeRateSourceId: isOneOf(exchangeRateSourceIds, candidate.exchangeRateSourceId)
      ? candidate.exchangeRateSourceId
      : DEFAULT_SETTINGS.exchangeRateSourceId,
  };
}

export async function loadSettings(): Promise<Settings> {
  const stored = await browser.storage.sync.get(SETTINGS_STORAGE_KEY);
  return normalizeSettings(stored[SETTINGS_STORAGE_KEY]);
}

export async function saveSettings(changes: Partial<Settings>): Promise<void> {
  const current = await loadSettings();
  await browser.storage.sync.set({ [SETTINGS_STORAGE_KEY]: normalizeSettings({ ...current, ...changes }) });
}

export function onSettingsChanged(listener: (settings: Settings) => void): void {
  browser.storage.onChanged.addListener((changes, areaName) => {
    const settingsChange = changes[SETTINGS_STORAGE_KEY];
    if (areaName === 'sync' && settingsChange) listener(normalizeSettings(settingsChange.newValue));
  });
}
