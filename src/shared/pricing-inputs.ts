import { type ExchangeRate, requestExchangeRate } from './exchange-rate';
import { type Settings, loadSettings, onSettingsChanged } from './settings';

export type PricingInputs = {
  settings: Settings;
  exchangeRate: ExchangeRate | null;
};

export async function loadPricingInputs(): Promise<PricingInputs> {
  const [settings, exchangeRate] = await Promise.all([loadSettings(), requestExchangeRate()]);
  return { settings, exchangeRate };
}

export function onPricingInputsChanged(initial: PricingInputs, listener: (inputs: PricingInputs) => void): void {
  let current = initial;
  onSettingsChanged(async (settings) => {
    const isSourceChanged = settings.exchangeRateSourceId !== current.settings.exchangeRateSourceId;
    current = { ...current, settings };
    listener(current);
    if (!isSourceChanged) return;
    const exchangeRate = await requestExchangeRate();
    const isSourceStillSelected = settings.exchangeRateSourceId === current.settings.exchangeRateSourceId;
    if (!isSourceStillSelected) return;
    current = { ...current, exchangeRate };
    listener(current);
  });
}
