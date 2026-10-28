import { findStandaloneUsdPrice, findUsdPrice, type UsdPriceMatch } from '../shared/money';
import { REACT_HEADER_ACTIONS_SELECTOR } from './steam-header';

export const PRICE_SOURCE_ATTRIBUTE = 'data-changuito-source';

const pricesWithSurroundingTextSelector = [
  '.updateSubscriptionOptionPrice',
  '.transactionRowAmountDue',
  '.itemSubtext',
  '.game_area_purchase_game_dropdown_menu_item_text',
  '.game_area_purchase_game_dropdown_selection span',
  '.giftcard_text',
].join(',');

const excludedPriceContainersSelector = [
  '#header_wallet_balance',
  REACT_HEADER_ACTIONS_SELECTOR,
  'script',
  'style',
  'textarea',
  'input',
  'select',
  '[contenteditable]',
].join(',');

const priceGroupSelector = [
  '.discount_block',
  '.discount_prices',
  '.StoreSalePriceWidgetContainer',
  '[class*=StoreSalePriceWidgetContainer]',
].join(',');

export function readPriceMatch(element: Element): UsdPriceMatch | null {
  if (element.childElementCount > 0 || element.closest(excludedPriceContainersSelector)) return null;
  const text = element.textContent ?? '';
  if (!text.includes('$')) return null;
  return (
    findStandaloneUsdPrice(text) ?? (element.matches(pricesWithSurroundingTextSelector) ? findUsdPrice(text) : null)
  );
}

function elementsWithDollarSignText(root: Node): Set<Element> {
  const elements = new Set<Element>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let textNode = walker.currentNode; textNode; textNode = walker.nextNode() as Node) {
    if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent?.includes('$') && textNode.parentElement) {
      elements.add(textNode.parentElement);
    }
  }
  return elements;
}

function previouslyProcessedElements(root: Node): Element[] {
  if (!(root instanceof Element)) return [];
  const descendants = [...root.querySelectorAll(`[${PRICE_SOURCE_ATTRIBUTE}]`)];
  return root.hasAttribute(PRICE_SOURCE_ATTRIBUTE) ? [root, ...descendants] : descendants;
}

export function findPriceCandidates(root: Node): Set<Element> {
  const candidates = elementsWithDollarSignText(root);
  for (const element of previouslyProcessedElements(root)) candidates.add(element);
  return candidates;
}

export function findPriceGroup(element: Element): Element {
  return element.closest(priceGroupSelector) ?? element.parentElement ?? element;
}
