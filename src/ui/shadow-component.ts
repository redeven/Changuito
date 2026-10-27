import { steamThemeStyles } from "./steam-theme";

export type ExtensionTagName = `changuito-${string}`;

export abstract class ShadowComponent {
  readonly host: HTMLElement;
  protected readonly root: ShadowRoot;
  private readonly styleElement: HTMLStyleElement;

  protected constructor(tagName: ExtensionTagName, componentStyles: string, hostClassName = "") {
    this.host = document.createElement(tagName);
    if (hostClassName) this.host.className = hostClassName;
    this.root = this.host.attachShadow({ mode: "closed" });
    this.styleElement = document.createElement("style");
    this.styleElement.textContent = `${steamThemeStyles}\n${componentStyles}`;
    this.root.append(this.styleElement);
  }

  get isMounted(): boolean {
    return this.host.isConnected;
  }

  mount(target: Element, position: InsertPosition): void {
    target.insertAdjacentElement(position, this.host);
  }

  unmount(): void {
    this.host.remove();
  }

  protected replaceContent(...nodes: Node[]): void {
    this.root.replaceChildren(this.styleElement, ...nodes);
  }
}
