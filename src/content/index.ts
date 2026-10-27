import { requestExchangeRate } from "../shared/exchange-rate";
import { loadSettings, onSettingsChanged } from "../shared/settings";
import { DomWatcher } from "./dom-watcher";
import { CartSummary } from "./features/cart-summary";
import type { FeatureContext, PageFeature } from "./features/page-feature";
import { ProductSidebar } from "./features/product-sidebar";
import { SearchPriceRange } from "./features/search-price-range";
import { SettingsEntry } from "./features/settings-entry";
import { PriceOverlay } from "./price-overlay";
import { type StorePage, detectStorePage } from "./routes";
import { readWalletBalance } from "./wallet";

function createPageFeatures(page: StorePage): PageFeature[] {
  switch (page.kind) {
    case "product":
      return [new ProductSidebar(page.productType, page.productId)];
    case "cart":
      return [new CartSummary()];
    case "search":
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
  const priceOverlay = exchangeRate
    ? new PriceOverlay({
        settings,
        exchangeRate,
        walletBalance: context.walletBalance,
        walletCanPay: page.kind !== "walletFunding",
      })
    : null;

  const refreshFeatures = () => features.forEach((feature) => feature.refresh(context));

  const updateContext = (changes: Partial<FeatureContext>) => {
    context = { ...context, ...changes };
    priceOverlay?.updateContext({ settings: context.settings, walletBalance: context.walletBalance });
    refreshFeatures();
  };

  priceOverlay?.process([document.body]);
  refreshFeatures();

  new DomWatcher((changedRoots) => {
    priceOverlay?.process(changedRoots);
    const walletBalance = readWalletBalance();
    if (walletBalance === context.walletBalance) refreshFeatures();
    else updateContext({ walletBalance });
  }).start();

  onSettingsChanged((changedSettings) => updateContext({ settings: changedSettings }));
}

void start();
