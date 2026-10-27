export const CLASSIC_HEADER_ACTIONS_SELECTOR = "#global_action_menu";
export const REACT_HEADER_ACTIONS_SELECTOR = "header > div > nav + div";

const reactFiberKeyPrefix = "__reactFiber$";

type PageElement = Element & { wrappedJSObject?: object };

export function findReactHeaderActions(): Element | null {
  return document.querySelector(REACT_HEADER_ACTIONS_SELECTOR);
}

export function isRenderedByReact(element: Element): boolean {
  const pageObject = (element as PageElement).wrappedJSObject ?? element;
  return Object.keys(pageObject).some((key) => key.startsWith(reactFiberKeyPrefix));
}
