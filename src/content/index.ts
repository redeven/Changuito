import { requestExchangeRate } from '../shared/exchange-rate';
import { loadSettings, onSettingsChanged } from '../shared/settings';
import { DomWatcher } from './dom-watcher';
import { CartSummary } from './features/cart-summary';
import type { FeatureContext, PageFeature } from './features/page-feature';
import { ProductSidebar } from './features/product-sidebar';
import { SearchPriceRange } from './features/search-price-range';
import { SettingsEntry } from './features/settings-entry';
import { PriceOverlay } from './price-overlay';
import { type StorePage, detectStorePage } from './routes';
import { readWalletBalance } from './wallet';

function createPageFeatures(page: StorePage): PageFeature[] {
  switch (page.kind) {
    case 'product':
      return [new ProductSidebar(page.productType, page.productId)];
    case 'cart':
      return [new CartSummary()];
    case 'search':
      return [new SearchPriceRange()];
    default:
      return [];
  }
}

async function start(): Promise<void> {
  const page = detectStorePage(new URL(window.location.href));
  const [settings, exchangeRate] = await Promise.all([loadSettings(), requestExchangeRate()]);
  let context: FeatureContext = { settings, exchangeRate, walletBalance: readWalletBalance() };

  const features = [new SettingsEntry(), ...createPageFeatures(page)];
  let priceOverlay: PriceOverlay | null = null;

  const syncPriceOverlay = () => {
    if (!context.exchangeRate) return;
    const pricingContext = {
      settings: context.settings,
      exchangeRate: context.exchangeRate,
      walletBalance: context.walletBalance,
    };
    if (priceOverlay) {
      priceOverlay.updateContext(pricingContext);
      return;
    }
    priceOverlay = new PriceOverlay({ ...pricingContext, walletCanPay: page.kind !== 'walletFunding' });
    priceOverlay.process([document.body]);
  };

  const refreshFeatures = () => features.forEach((feature) => feature.refresh(context));

  const updateContext = (changes: Partial<FeatureContext>) => {
    context = { ...context, ...changes };
    syncPriceOverlay();
    refreshFeatures();
  };

  syncPriceOverlay();
  refreshFeatures();

  new DomWatcher((changedRoots) => {
    priceOverlay?.process(changedRoots);
    const walletBalance = readWalletBalance();
    if (walletBalance === context.walletBalance) refreshFeatures();
    else updateContext({ walletBalance });
  }).start();

  onSettingsChanged(async (changedSettings) => {
    const isSourceChanged = changedSettings.exchangeRateSourceId !== context.settings.exchangeRateSourceId;
    updateContext({ settings: changedSettings });
    if (isSourceChanged) updateContext({ exchangeRate: await requestExchangeRate() });
  });
}

void start();
