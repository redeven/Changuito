import { h } from '../../ui/element-builder';
import { SettingsForm, type SettingsFormState } from '../../ui/settings-form';
import { ShadowComponent } from '../../ui/shadow-component';

const settingsPanelStyles = `
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }

  .panel {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 100000;
    width: min(380px, 100vw);
    height: 100vh;
    overflow-y: auto;
    background-color: var(--steam-modal-background);
    box-shadow: -12px -1px 22px -8px rgba(0, 0, 0, 0.75);
    transform: translateX(100%);
    visibility: hidden;
    transition: transform 0.25s ease, visibility 0.25s;
  }

  .open .backdrop {
    opacity: 1;
    pointer-events: auto;
  }

  .open .panel {
    transform: translateX(0);
    visibility: visible;
  }
`;

export class SettingsPanel extends ShadowComponent {
  private readonly container: HTMLElement;
  private readonly form = new SettingsForm(() => this.close());
  private readonly closeOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.close();
  };

  constructor() {
    super('changuito-settings-panel', settingsPanelStyles);
    this.container = h('div', {}, [
      h('div', { className: 'backdrop', on: { click: () => this.close() } }),
      h(
        'aside',
        {
          className: 'panel',
          attributes: { 'role': 'dialog', 'aria-modal': 'true', 'aria-label': 'Configuración de Changuito' },
        },
        [this.form.host]
      ),
    ]);
    this.replaceContent(this.container);
  }

  open(): void {
    this.container.classList.add('open');
    document.addEventListener('keydown', this.closeOnEscape);
  }

  close(): void {
    this.container.classList.remove('open');
    document.removeEventListener('keydown', this.closeOnEscape);
  }

  update(state: SettingsFormState): void {
    this.form.update(state);
  }
}
