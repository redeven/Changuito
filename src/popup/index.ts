import { requestExchangeRate } from '../shared/exchange-rate';
import { loadSettings, onSettingsChanged } from '../shared/settings';
import { SettingsForm } from '../ui/settings-form';

async function start(): Promise<void> {
  const form = new SettingsForm();
  form.mount(document.body, 'beforeend');
  let [settings, exchangeRate] = await Promise.all([loadSettings(), requestExchangeRate()]);
  form.update({ settings, exchangeRate });
  onSettingsChanged(async (changedSettings) => {
    const isSourceChanged = changedSettings.exchangeRateSourceId !== settings.exchangeRateSourceId;
    settings = changedSettings;
    form.update({ settings, exchangeRate });
    if (!isSourceChanged) return;
    exchangeRate = await requestExchangeRate();
    form.update({ settings, exchangeRate });
  });
}

void start();
