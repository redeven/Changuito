import { parseUsdPrice } from "../../shared/money";
import { effectiveArsPerUsd } from "../../shared/taxes";
import { type CartSummaryPanelState, CartSummaryPanel } from "../components/cart-summary-panel";
import type { FeatureContext, PageFeature } from "./page-feature";

type CartTotalLocation = {
  checkoutBlock: Element;
  totalUsd: number;
};

function findCartTotal(): CartTotalLocation | null {
  const cartItemsPanel = document.querySelector(".Panel.Focusable:has(+ .Panel.Focusable)");
  const checkoutBlock = cartItemsPanel?.nextElementSibling?.querySelector("div:has(> button.Primary)");
  if (!checkoutBlock) return null;
  const totalElement = [...checkoutBlock.querySelectorAll("div:not(:has(*))")].find((element) =>
    element.textContent?.trim().startsWith("$"),
  );
  const totalUsd = totalElement ? parseUsdPrice(totalElement.textContent ?? "") : null;
  return totalUsd === null ? null : { checkoutBlock, totalUsd };
}

function isSameState(previous: CartSummaryPanelState | null, next: CartSummaryPanelState): boolean {
  return (
    previous !== null &&
    previous.totalUsd === next.totalUsd &&
    previous.walletBalance === next.walletBalance &&
    previous.arsPerUsd === next.arsPerUsd
  );
}

export class CartSummary implements PageFeature {
  private readonly panel = new CartSummaryPanel();
  private renderedState: CartSummaryPanelState | null = null;

  refresh({ settings, exchangeRate, walletBalance }: FeatureContext): void {
    const cartTotal = exchangeRate ? findCartTotal() : null;
    if (!cartTotal || !exchangeRate) {
      this.panel.unmount();
      return;
    }

    const state: CartSummaryPanelState = {
      totalUsd: cartTotal.totalUsd,
      walletBalance,
      arsPerUsd: effectiveArsPerUsd(exchangeRate.sellRate, settings),
    };
    if (!isSameState(this.renderedState, state)) {
      this.panel.update(state);
      this.renderedState = state;
    }
    if (this.panel.host.nextElementSibling !== cartTotal.checkoutBlock) {
      this.panel.mount(cartTotal.checkoutBlock, "beforebegin");
    }
  }
}
