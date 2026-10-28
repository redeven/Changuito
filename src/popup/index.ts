import { loadPricingInputs, onPricingInputsChanged } from '../shared/pricing-inputs';
import { SettingsForm } from '../ui/settings-form';

async function start(): Promise<void> {
  const form = new SettingsForm();
  form.mount(document.body, 'beforeend');
  const pricingInputs = await loadPricingInputs();
  form.update(pricingInputs);
  onPricingInputsChanged(pricingInputs, (changedInputs) => form.update(changedInputs));
}

void start();
