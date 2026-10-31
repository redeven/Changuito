import priceOverlayStyles from '../../static/price-overlay.css';
import { startContent } from '../content/app';
import { registerMenuCommand } from '../platform/userscript';

function injectPageStyles(): void {
  const style = document.createElement('style');
  style.textContent = priceOverlayStyles;
  (document.head ?? document.documentElement).append(style);
}

async function start(): Promise<void> {
  injectPageStyles();
  const { openSettings } = await startContent();
  registerMenuCommand('Configuración de Changuito', openSettings);
}

void start();
