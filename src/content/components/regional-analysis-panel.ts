import { formatArs, formatUsd } from "../../shared/money";
import type { Settings } from "../../shared/settings";
import type { RegionalPriceAnalysis, RegionalPriceStatus } from "../regional/regional-analysis";
import { REGIONAL_STATUS_LABELS, REGIONAL_STATUS_SCALE, describeRegionalPrice } from "../regional/regional-summary";
import { h } from "../../ui/element-builder";
import { ShadowComponent } from "../../ui/shadow-component";
import { sidebarHeading } from "./sidebar-heading";

export type RegionalAnalysisPanelState = {
  analysis: RegionalPriceAnalysis;
  settings: Settings;
  convertToArs: (usdAmount: number) => number;
};

const VALVE_PRICING_TOOL_URL = "https://partner.steamgames.com/pricing/explorer";

const regionalAnalysisPanelStyles = `
  .meter {
    display: flex;
    gap: 6px;
    margin-top: 14px;
  }

  .meter-step {
    position: relative;
    flex: 1 1 0;
    min-width: fit-content;
    padding-top: 5px;
    border-top: 7px solid currentColor;
    font-size: 11px;
    text-align: center;
    opacity: 0.25;
  }

  .meter-step.selected {
    opacity: 1;
  }

  .meter-step.selected::before {
    content: "";
    position: absolute;
    top: -22px;
    left: 50%;
    transform: translateX(-50%);
    border-top: 12px solid currentColor;
    border-right: 6px solid transparent;
    border-left: 6px solid transparent;
  }

  .meter-step.none { color: #b94b53; }
  .meter-step.elevated { color: #e68f0d; }
  .meter-step.fair { color: #e6cf0f; }
  .meter-step.cheap { color: #84b114; }
  .meter-step.excellent { color: #71f569; }

  .summary {
    margin: 0;
    color: var(--steam-text-bright);
  }

  .price-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .price-row + .price-row {
    margin-top: 10px;
  }

  .price-values {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px;
  }

  .disclaimer {
    margin: 14px 0 0;
    font-size: 11px;
  }

  .disclaimer a {
    color: var(--steam-text-muted);
    text-decoration: underline;
  }
`;

type PriceRowValues = {
  label: string;
  finalUsd: number;
  initialUsd: number;
  arsEquivalent?: number;
};

function meterStep(status: RegionalPriceStatus, selectedStatus: RegionalPriceStatus): HTMLElement {
  const className = `meter-step ${status}${status === selectedStatus ? " selected" : ""}`;
  return h("div", { className }, [REGIONAL_STATUS_LABELS[status]]);
}

function priceRow({ label, finalUsd, initialUsd, arsEquivalent }: PriceRowValues): HTMLElement {
  const hasDiscount = initialUsd > finalUsd;
  return h("div", { className: "price-row" }, [
    h("span", { className: "muted" }, [label]),
    h("span", { className: "price-values" }, [
      h("span", { className: "highlight" }, [formatUsd(finalUsd)]),
      hasDiscount && h("span", { className: "strikethrough" }, [formatUsd(initialUsd)]),
      arsEquivalent !== undefined && h("span", { className: "muted" }, [`≈ ${formatArs(arsEquivalent)}`]),
    ]),
  ]);
}

export class RegionalAnalysisPanel extends ShadowComponent {
  constructor() {
    super("changuito-regional-analysis", regionalAnalysisPanelStyles);
  }

  update({ analysis, settings, convertToArs }: RegionalAnalysisPanelState): void {
    const isCompact = settings.sidebarStyle === "compact";
    this.replaceContent(
      sidebarHeading("Análisis de precio regional"),
      h("div", { className: "sidebar-block" }, [
        h("div", { className: "meter" }, REGIONAL_STATUS_SCALE.map((status) => meterStep(status, analysis.status))),
        h("hr", { className: "divider" }),
        h("p", { className: "summary" }, [describeRegionalPrice(analysis)]),
        !isCompact && h("hr", { className: "divider" }),
        !isCompact &&
          h("div", {}, [
            priceRow({
              label: "Precio sugerido por Valve para Argentina",
              finalUsd: analysis.suggestedFinal,
              initialUsd: analysis.suggestedInitial,
            }),
            priceRow({
              label: "Precio actual en Argentina",
              finalUsd: analysis.regionalFinal,
              initialUsd: analysis.regionalInitial,
              arsEquivalent: convertToArs(analysis.regionalFinal),
            }),
            priceRow({
              label: "Precio actual en Estados Unidos",
              finalUsd: analysis.usFinal,
              initialUsd: analysis.usInitial,
            }),
          ]),
        !isCompact &&
          h("p", { className: "disclaimer muted" }, [
            "Análisis basado en la ",
            h("a", { attributes: { href: VALVE_PRICING_TOOL_URL, target: "_blank", rel: "noopener noreferrer" } }, [
              "herramienta oficial de precios regionales de Valve",
            ]),
            ".",
          ]),
      ]),
    );
  }
}
