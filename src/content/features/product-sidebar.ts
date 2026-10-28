import { convertUsdToArs } from '../../shared/taxes';
import { ExchangeRatePanel } from '../components/exchange-rate-panel';
import { RegionalAnalysisPanel } from '../components/regional-analysis-panel';
import { type RegionalPriceAnalysis, analyzeRegionalPrice } from '../regional/regional-analysis';
import type { ProductType } from '../routes';
import { fetchPriceOverview } from '../steam-store-api';
import type { FeatureContext, PageFeature } from './page-feature';

const SIDEBAR_SELECTOR = '.rightcol.game_meta_data';

async function fetchRegionalAnalysis(
  productType: ProductType,
  productId: string
): Promise<RegionalPriceAnalysis | null> {
  const [usPrice, regionalPrice] = await Promise.all([
    fetchPriceOverview(productType, productId, 'us'),
    fetchPriceOverview(productType, productId, 'ar'),
  ]);
  if (!usPrice || !regionalPrice) return null;
  return analyzeRegionalPrice({
    usInitial: usPrice.initial,
    usFinal: usPrice.final,
    regionalInitial: regionalPrice.initial,
    regionalFinal: regionalPrice.final,
    discountPercent: usPrice.discountPercent,
  });
}

export class ProductSidebar implements PageFeature {
  private readonly exchangeRatePanel = new ExchangeRatePanel();
  private readonly regionalAnalysisPanel = new RegionalAnalysisPanel();
  private analysis: RegionalPriceAnalysis | null = null;
  private lastContext: FeatureContext | null = null;
  private latestContext: FeatureContext | null = null;

  constructor(productType: ProductType, productId: string) {
    fetchRegionalAnalysis(productType, productId)
      .then((analysis) => {
        this.analysis = analysis;
        this.lastContext = null;
        if (this.latestContext) this.refresh(this.latestContext);
      })
      .catch((error: unknown) => console.warn('Changuito: no se pudo obtener el precio regional', error));
  }

  refresh(context: FeatureContext): void {
    this.latestContext = context;
    const sidebar = document.querySelector(SIDEBAR_SELECTOR);
    const { settings, exchangeRate } = context;
    if (!sidebar || !exchangeRate || settings.sidebarStyle === 'hidden') {
      this.exchangeRatePanel.unmount();
      this.regionalAnalysisPanel.unmount();
      return;
    }

    const isContextUnchanged = context === this.lastContext;
    this.lastContext = context;

    if (!isContextUnchanged) this.exchangeRatePanel.update({ exchangeRate, settings });
    if (this.analysis && !isContextUnchanged) {
      this.regionalAnalysisPanel.update({
        analysis: this.analysis,
        settings,
        convertToArs: (usdAmount) => convertUsdToArs(usdAmount, exchangeRate.rate, settings),
      });
    }
    this.placePanelsTogether(sidebar);
  }

  private placePanelsTogether(sidebar: Element): void {
    const topPanel = this.analysis ? this.regionalAnalysisPanel : this.exchangeRatePanel;
    if (!topPanel.isMounted) topPanel.mount(sidebar, 'afterbegin');
    if (topPanel !== this.exchangeRatePanel && this.exchangeRatePanel.host.previousElementSibling !== topPanel.host) {
      this.exchangeRatePanel.mount(topPanel.host, 'afterend');
    }
  }
}
