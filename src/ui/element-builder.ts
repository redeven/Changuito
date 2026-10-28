type EventHandlers = {
  [EventName in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[EventName]) => void;
};

export type ElementOptions = {
  className?: string;
  attributes?: Record<string, string>;
  on?: EventHandlers;
};

export type Child = Node | string | false | null | undefined;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName,
  options: ElementOptions = {},
  children: readonly Child[] = []
): HTMLElementTagNameMap[TagName] {
  const element = document.createElement(tagName);
  if (options.className) element.className = options.className;
  for (const [name, value] of Object.entries(options.attributes ?? {})) element.setAttribute(name, value);
  for (const [eventName, handler] of Object.entries(options.on ?? {})) {
    element.addEventListener(eventName, handler as EventListener);
  }
  element.append(...children.filter((child): child is Node | string => Boolean(child)));
  return element;
}
