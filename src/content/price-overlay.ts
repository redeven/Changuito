import type { ExchangeRate } from '../shared/exchange-rate';
import { findUsdPrice, formatArs, formatUsd } from '../shared/money';
import type { Settings } from '../shared/settings';
import { convertUsdToArs } from '../shared/taxes';
import { type Currency, oppositeCurrency, resolveCurrency } from './display-mode';
import { PRICE_SOURCE_ATTRIBUTE, findPriceCandidates, findPriceGroup, readPriceMatch } from './price-targets';

export type PricingContext = {
  settings: Settings;
  exchangeRate: ExchangeRate;
  walletBalance: number;
  walletCanPay: boolean;
};

const USD_ATTRIBUTE = 'data-changuito-usd';
const DISPLAY_ATTRIBUTE = 'data-changuito-display';
const CURRENCY_ATTRIBUTE = 'data-changuito-currency';
const FONT_SIZE_PROPERTY = '--changuito-font-size';
const overlayAttributes = [PRICE_SOURCE_ATTRIBUTE, USD_ATTRIBUTE, DISPLAY_ATTRIBUTE, CURRENCY_ATTRIBUTE];

type PriceMeasurement = {
  element: Element & ElementCSSInlineStyle;
  source: string;
  usdAmount: number;
  fontSize: string | null;
};

function readUsdAmount(element: Element): number {
  return Number(element.getAttribute(USD_ATTRIBUTE));
}

function hasFontSizeProperty(element: ElementCSSInlineStyle): boolean {
  return element.style.getPropertyValue(FONT_SIZE_PROPERTY) !== '';
}

function clearOverlay(element: Element): void {
  for (const attribute of overlayAttributes) element.removeAttribute(attribute);
}

function setAttributeIfChanged(element: Element, name: string, value: string): void {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

export class PriceOverlay {
  private forcedCurrencyByGroup = new WeakMap<Element, Currency>();

  constructor(private context: PricingContext) {
    document.addEventListener('click', (event) => this.handleClick(event), { capture: true });
  }

  updateContext(changes: Partial<PricingContext>): void {
    if (changes.settings && changes.settings !== this.context.settings) this.forcedCurrencyByGroup = new WeakMap();
    this.context = { ...this.context, ...changes };
    this.renderGroups(this.processedGroupsWithin(document));
  }

  process(roots: Iterable<Node>): void {
    const measurements: PriceMeasurement[] = [];
    const elementsToClear: Element[] = [];

    for (const root of roots) {
      for (const element of findPriceCandidates(root)) {
        const priceMatch = readPriceMatch(element);
        const source = element.textContent ?? '';
        if (!priceMatch) {
          if (element.hasAttribute(PRICE_SOURCE_ATTRIBUTE)) elementsToClear.push(element);
          continue;
        }
        if (element.getAttribute(PRICE_SOURCE_ATTRIBUTE) === source) continue;
        const styledElement = element as PriceMeasurement['element'];
        const fontSize = hasFontSizeProperty(styledElement) ? null : getComputedStyle(element).fontSize;
        measurements.push({ element: styledElement, source, usdAmount: priceMatch.amount, fontSize });
      }
    }

    elementsToClear.forEach(clearOverlay);
    for (const { element, source, usdAmount, fontSize } of measurements) {
      element.setAttribute(PRICE_SOURCE_ATTRIBUTE, source);
      element.setAttribute(USD_ATTRIBUTE, String(usdAmount));
      if (fontSize) element.style.setProperty(FONT_SIZE_PROPERTY, fontSize);
    }
    this.renderGroups(new Set(measurements.map(({ element }) => findPriceGroup(element))));
  }

  private processedGroupsWithin(root: ParentNode): Set<Element> {
    return new Set([...root.querySelectorAll(`[${USD_ATTRIBUTE}]`)].map(findPriceGroup));
  }

  private pricedElementsOf(group: Element): Element[] {
    return [...group.querySelectorAll(`[${USD_ATTRIBUTE}]`)].filter((element) => findPriceGroup(element) === group);
  }

  private renderGroups(groups: Iterable<Element>): void {
    for (const group of groups) this.renderGroup(group);
  }

  private renderGroup(group: Element): void {
    const pricedElements = this.pricedElementsOf(group);
    if (pricedElements.length === 0) return;
    const currency = this.forcedCurrencyByGroup.get(group) ?? this.automaticCurrencyFor(pricedElements);
    for (const element of pricedElements) this.renderPrice(element, currency);
  }

  private automaticCurrencyFor(pricedElements: readonly Element[]): Currency {
    const { settings, walletBalance, walletCanPay } = this.context;
    const finalUsdPrice = Math.min(...pricedElements.map(readUsdAmount));
    return resolveCurrency({ displayMode: settings.displayMode, walletBalance, usdPrice: finalUsdPrice, walletCanPay });
  }

  private renderPrice(element: Element, currency: Currency): void {
    const source = element.getAttribute(PRICE_SOURCE_ATTRIBUTE) ?? '';
    const priceMatch = findUsdPrice(source);
    if (!priceMatch) return;
    const formattedPrice = currency === 'ars' ? this.formatInArs(priceMatch.amount) : formatUsd(priceMatch.amount);
    setAttributeIfChanged(element, DISPLAY_ATTRIBUTE, source.trim().replace(priceMatch.matchedText, formattedPrice));
    setAttributeIfChanged(element, CURRENCY_ATTRIBUTE, currency);
  }

  private formatInArs(usdAmount: number): string {
    const { exchangeRate, settings } = this.context;
    return formatArs(convertUsdToArs(usdAmount, exchangeRate.rate, settings));
  }

  private handleClick(event: MouseEvent): void {
    const clickedPrice = event.target instanceof Element ? event.target.closest(`[${DISPLAY_ATTRIBUTE}]`) : null;
    if (!clickedPrice) return;
    event.preventDefault();
    event.stopPropagation();
    const group = findPriceGroup(clickedPrice);
    const displayedCurrency = (clickedPrice.getAttribute(CURRENCY_ATTRIBUTE) as Currency | null) ?? 'usd';
    this.forcedCurrencyByGroup.set(group, oppositeCurrency(displayedCurrency));
    this.renderGroup(group);
  }
}
