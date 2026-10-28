import type { ExchangeRate } from '../shared/exchange-rate';
import { EXCHANGE_RATE_SOURCES, type ExchangeRateSourceId } from '../shared/exchange-rate-sources';
import { formatArs } from '../shared/money';
import { type DisplayMode, type Settings, type SidebarStyle, saveSettings } from '../shared/settings';
import { effectiveArsPerUsd } from '../shared/taxes';
import { h } from './element-builder';
import { ShadowComponent } from './shadow-component';

export type SettingsFormState = {
  settings: Settings;
  exchangeRate: ExchangeRate | null;
};

type PercentSettingKey = 'nationalTaxPercent' | 'provincialTaxPercent';

const SAVE_DELAY_MS = 400;

const settingsFormStyles = `
  .form {
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding: 20px;
  }

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .title {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: var(--steam-link);
  }

  .version {
    font-size: 12px;
  }

  .close-button {
    border: 0;
    background: none;
    color: var(--steam-text-muted);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
  }

  .close-button:hover {
    color: var(--steam-text-bright);
  }

  section h3 {
    margin: 0 0 14px;
    font-size: 14px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--steam-link);
  }

  .field + .field {
    margin-top: 18px;
  }

  .field label {
    display: block;
    margin-bottom: 6px;
  }

  .field small {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: var(--steam-text-muted);
  }

  .percent-input {
    width: 110px;
  }

  .exchange-rate {
    margin-top: 18px;
    padding-top: 8px;
  }

  .exchange-rate p {
    margin: 0 0 6px;
  }
`;

function debounce<Args extends unknown[]>(callback: (...args: Args) => void, delayMs: number): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delayMs);
  };
}

function populateSelect<Value extends string>(
  select: HTMLSelectElement,
  options: ReadonlyArray<[Value, string]>
): HTMLSelectElement {
  select.className = 'field-input';
  select.append(...options.map(([value, text]) => h('option', { attributes: { value } }, [text])));
  return select;
}

function selectField<Value extends string>(
  id: string,
  label: string,
  help: string,
  select: HTMLSelectElement,
  options: ReadonlyArray<[Value, string]>
): HTMLElement {
  populateSelect(select, options);
  select.id = id;
  return h('div', { className: 'field' }, [
    h('label', { attributes: { for: select.id } }, [label]),
    select,
    h('small', {}, [help]),
  ]);
}

function percentField(id: string, label: string, input: HTMLInputElement): HTMLElement {
  input.type = 'number';
  input.min = '0';
  input.step = '0.01';
  input.id = id;
  return h('div', { className: 'field' }, [
    h('label', { attributes: { for: input.id } }, [label]),
    h('div', { className: 'field-input percent-input' }, [input, h('span', { className: 'muted' }, ['%'])]),
  ]);
}

export class SettingsForm extends ShadowComponent {
  private readonly displayModeSelect = h('select');
  private readonly sidebarStyleSelect = h('select');
  private readonly exchangeRateSourceSelect = h('select', { attributes: { 'aria-label': 'Cotización del dólar' } });
  private readonly nationalTaxInput = h('input');
  private readonly provincialTaxInput = h('input');
  private readonly exchangeRateSection = h('div', { className: 'exchange-rate' });

  constructor(onClose?: () => void) {
    super('changuito-settings-form', settingsFormStyles);
    this.replaceContent(this.buildForm(onClose));
    this.bindInputs();
  }

  update({ settings, exchangeRate }: SettingsFormState): void {
    this.syncValue(this.displayModeSelect, settings.displayMode);
    this.syncValue(this.sidebarStyleSelect, settings.sidebarStyle);
    this.syncValue(this.exchangeRateSourceSelect, settings.exchangeRateSourceId);
    this.syncValue(this.nationalTaxInput, String(settings.nationalTaxPercent));
    this.syncValue(this.provincialTaxInput, String(settings.provincialTaxPercent));
    this.exchangeRateSection.replaceChildren(...this.exchangeRateDetails(settings, exchangeRate));
  }

  private buildForm(onClose?: () => void): HTMLElement {
    const version = browser.runtime.getManifest().version;
    return h('div', { className: 'form' }, [
      h('header', {}, [
        h('div', {}, [
          h('p', { className: 'title' }, ['Configuración de Changuito']),
          h('span', { className: 'version muted' }, [`Versión ${version}`]),
        ]),
        onClose &&
          h(
            'button',
            {
              className: 'close-button',
              attributes: { 'type': 'button', 'aria-label': 'Cerrar' },
              on: { click: onClose },
            },
            ['×']
          ),
      ]),
      h('section', {}, [
        h('h3', {}, ['Cotización']),
        h('div', { className: 'field' }, [
          populateSelect<ExchangeRateSourceId>(
            this.exchangeRateSourceSelect,
            EXCHANGE_RATE_SOURCES.map((source) => [source.id, source.name])
          ),
        ]),
      ]),
      h('section', {}, [
        h('h3', {}, ['Impuestos']),
        percentField('national-tax', 'Impuestos nacionales', this.nationalTaxInput),
        percentField('provincial-tax', 'Impuestos provinciales', this.provincialTaxInput),
        this.exchangeRateSection,
      ]),
      h('section', {}, [
        h('h3', {}, ['Visualización']),
        selectField<DisplayMode>(
          'display-mode',
          'Preferencia de visualización de precios',
          'El modo inteligente muestra el precio en dólares cuando tu saldo de Steam alcanza para pagarlo, y en pesos cuando no.',
          this.displayModeSelect,
          [
            ['smart', 'Modo inteligente'],
            ['ars', 'Por defecto en pesos'],
            ['usd', 'Por defecto en dólares'],
          ]
        ),
        selectField<SidebarStyle>(
          'sidebar-style',
          'Paneles en la barra lateral',
          'Paneles de cotización y análisis de precio regional en la página de cada juego.',
          this.sidebarStyleSelect,
          [
            ['normal', 'Normal'],
            ['compact', 'Minificados'],
            ['hidden', 'Ocultos'],
          ]
        ),
      ]),
    ]);
  }

  private bindInputs(): void {
    this.displayModeSelect.addEventListener('change', () => {
      void saveSettings({ displayMode: this.displayModeSelect.value as DisplayMode });
    });
    this.sidebarStyleSelect.addEventListener('change', () => {
      void saveSettings({ sidebarStyle: this.sidebarStyleSelect.value as SidebarStyle });
    });
    this.exchangeRateSourceSelect.addEventListener('change', () => {
      void saveSettings({ exchangeRateSourceId: this.exchangeRateSourceSelect.value as ExchangeRateSourceId });
    });
    this.bindPercentInput(this.nationalTaxInput, 'nationalTaxPercent');
    this.bindPercentInput(this.provincialTaxInput, 'provincialTaxPercent');
  }

  private bindPercentInput(input: HTMLInputElement, settingKey: PercentSettingKey): void {
    const savePercent = debounce(() => {
      const percent = input.valueAsNumber;
      if (Number.isFinite(percent) && percent >= 0) void saveSettings({ [settingKey]: percent });
    }, SAVE_DELAY_MS);
    input.addEventListener('input', savePercent);
  }

  private syncValue(field: HTMLInputElement | HTMLSelectElement, value: string): void {
    if (this.root.activeElement !== field && field.value !== value) field.value = value;
  }

  private exchangeRateDetails(settings: Settings, exchangeRate: ExchangeRate | null): HTMLElement[] {
    if (!exchangeRate) return [h('p', { className: 'muted' }, ['No se pudo obtener la cotización del dólar.'])];
    return [
      h('p', { className: 'highlight' }, [
        `1 USD ≈ ${formatArs(effectiveArsPerUsd(exchangeRate.rate, settings))} con impuestos`,
      ]),
      ...(exchangeRate.sourceDate
        ? [h('p', { className: 'muted' }, [`Cotización del ${exchangeRate.sourceDate}`])]
        : []),
    ];
  }
}
