import { requestExchangeRate } from "../shared/exchange-rate";
import { loadSettings, onSettingsChanged } from "../shared/settings";
import { SettingsForm } from "../ui/settings-form";

async function start(): Promise<void> {
  const form = new SettingsForm();
  form.mount(document.body, "beforeend");
  const [settings, exchangeRate] = await Promise.all([loadSettings(), requestExchangeRate()]);
  form.update({ settings, exchangeRate });
  onSettingsChanged((changedSettings) => form.update({ settings: changedSettings, exchangeRate }));
}

void start();
