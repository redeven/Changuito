import { formatArs, formatUsd } from "../../shared/money";
import { h } from "../../ui/element-builder";
import { ShadowComponent } from "../../ui/shadow-component";

export type CartSummaryPanelState = {
  totalUsd: number;
  walletBalance: number;
  arsPerUsd: number;
};

const cartSummaryPanelStyles = `
  :host {
    margin-bottom: 16px;
  }

  .summary-row + .summary-row {
    margin-top: 10px;
  }

  .summary-label {
    display: block;
    font-size: 12px;
  }

  .summary-value {
    font-size: 15px;
    color: var(--steam-text-bright);
  }

  .rate-hint {
    margin-left: 6px;
    font-size: 11px;
  }
`;

function summaryRow(label: string, value: string, hint?: string): HTMLElement {
  return h("div", { className: "summary-row" }, [
    h("span", { className: "summary-label muted" }, [label]),
    h("span", { className: "summary-value" }, [value]),
    hint && h("span", { className: "rate-hint muted" }, [hint]),
  ]);
}

export class CartSummaryPanel extends ShadowComponent {
  constructor() {
    super("changuito-cart-summary", cartSummaryPanelStyles);
  }

  update({ totalUsd, walletBalance, arsPerUsd }: CartSummaryPanelState): void {
    const remainingUsd = totalUsd - walletBalance;
    const canCombineWalletAndCard = walletBalance > 0 && remainingUsd > 0;
    this.replaceContent(
      h("div", { className: "sidebar-block" }, [
        summaryRow("Total pagando con saldo de Steam", formatUsd(totalUsd)),
        summaryRow("Total aproximado pagando con tarjeta", formatArs(totalUsd * arsPerUsd), `(1 USD ≈ ${formatArs(arsPerUsd)})`),
        canCombineWalletAndCard &&
          summaryRow(
            "Total pagando con saldo + tarjeta",
            `${formatUsd(walletBalance)} + ${formatArs(remainingUsd * arsPerUsd)}`,
          ),
      ]),
    );
  }
}
