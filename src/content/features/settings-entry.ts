import { SettingsButton } from '../components/settings-button';
import { SettingsPanel } from '../components/settings-panel';
import { CLASSIC_HEADER_ACTIONS_SELECTOR, findReactHeaderActions, isRenderedByReact } from '../steam-header';
import type { FeatureContext, PageFeature } from './page-feature';

const MAX_REACT_HEADER_CHECKS = 20;

export class SettingsEntry implements PageFeature {
  private readonly panel = new SettingsPanel();
  private readonly button = new SettingsButton(() => this.panel.open());
  private lastContext: FeatureContext | null = null;
  private remainingReactHeaderChecks = MAX_REACT_HEADER_CHECKS;
  private isReactHeaderCheckScheduled = false;

  refresh(context: FeatureContext): void {
    if (!this.panel.isMounted) this.panel.mount(document.body, 'beforeend');
    if (!this.button.isMounted) this.mountButton();
    if (context === this.lastContext) return;
    this.lastContext = context;
    this.panel.update(context);
  }

  private mountButton(): void {
    const classicHeaderActions = document.querySelector(CLASSIC_HEADER_ACTIONS_SELECTOR);
    if (classicHeaderActions) {
      this.button.mount(classicHeaderActions, 'afterbegin');
      return;
    }
    const reactHeaderActions = findReactHeaderActions();
    if (!reactHeaderActions) return;
    if (isRenderedByReact(reactHeaderActions)) this.button.mount(reactHeaderActions, 'afterbegin');
    else this.scheduleReactHeaderCheck();
  }

  private scheduleReactHeaderCheck(): void {
    if (this.isReactHeaderCheckScheduled || this.remainingReactHeaderChecks === 0) return;
    this.isReactHeaderCheckScheduled = true;
    this.remainingReactHeaderChecks -= 1;
    requestIdleCallback(() => {
      this.isReactHeaderCheckScheduled = false;
      if (!this.button.isMounted) this.mountButton();
    });
  }
}
