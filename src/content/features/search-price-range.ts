import { formatArs, parseUsdPrice } from "../../shared/money";
import { convertUsdToArs } from "../../shared/taxes";
import { SearchPriceHint } from "../components/search-price-hint";
import type { FeatureContext, PageFeature } from "./page-feature";

const PRICE_RANGE_DISPLAY_SELECTOR = "#price_range_display";

export class SearchPriceRange implements PageFeature {
  private readonly hint = new SearchPriceHint();

  refresh({ settings, exchangeRate }: FeatureContext): void {
    const rangeDisplay = document.querySelector(PRICE_RANGE_DISPLAY_SELECTOR);
    if (!rangeDisplay || !exchangeRate) return;
    if (!this.hint.isMounted) this.hint.mount(rangeDisplay, "afterend");

    const maximumUsd = parseUsdPrice(rangeDisplay.textContent ?? "");
    const hint = maximumUsd === null ? "" : `Menos de ${formatArs(convertUsdToArs(maximumUsd, exchangeRate.sellRate, settings))}`;
    this.hint.update(hint);
  }
}
