import type { ExchangeRate } from "../../shared/exchange-rate";
import { formatArs, formatPercent } from "../../shared/money";
import type { Settings } from "../../shared/settings";
import { effectiveArsPerUsd, totalTaxPercent } from "../../shared/taxes";
import { h } from "../../ui/element-builder";
import { ShadowComponent } from "../../ui/shadow-component";
import { sidebarHeading } from "./sidebar-heading";

export type ExchangeRatePanelState = {
  exchangeRate: ExchangeRate;
  settings: Settings;
};

const exchangeRatePanelStyles = `
  .rate {
    margin: 0;
    font-size: 15px;
    color: var(--steam-text-bright);
  }

  .details {
    margin: 6px 0 0;
    font-size: 12px;
  }
`;

export class ExchangeRatePanel extends ShadowComponent {
  constructor() {
    super("changuito-exchange-rate", exchangeRatePanelStyles);
  }

  update({ exchangeRate, settings }: ExchangeRatePanelState): void {
    const isCompact = settings.sidebarStyle === "compact";
    const arsPerUsd = effectiveArsPerUsd(exchangeRate.sellRate, settings);
    this.replaceContent(
      sidebarHeading("Cotización del dólar"),
      h("div", { className: "sidebar-block" }, [
        h("p", { className: "rate" }, [`1 USD ≈ ${formatArs(arsPerUsd)}`]),
        !isCompact &&
          h("p", { className: "details muted" }, [
            `Dólar oficial ${formatArs(exchangeRate.sellRate)} + ${formatPercent(totalTaxPercent(settings))} de impuestos ` +
              `(${formatPercent(settings.nationalTaxPercent)} nacionales y ${formatPercent(settings.provincialTaxPercent)} provinciales).`,
          ]),
        !isCompact &&
          h("p", { className: "details muted" }, [`Cotización del ${exchangeRate.sourceDate} · Fuente: Ámbito`]),
      ]),
    );
  }
}
