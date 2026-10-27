export type DomChangeHandler = (changedRoots: readonly Node[]) => void;

const extensionTagPrefix = "CHANGUITO-";

function isExtensionNode(node: Node): boolean {
  return node.nodeName.startsWith(extensionTagPrefix);
}

function isTextNode(node: Node): boolean {
  return node.nodeType === Node.TEXT_NODE;
}

function changesTextContent(mutation: MutationRecord): boolean {
  return [...mutation.addedNodes, ...mutation.removedNodes].some(isTextNode);
}

export class DomWatcher {
  private readonly pendingRoots = new Set<Node>();
  private isFrameScheduled = false;
  private readonly observer = new MutationObserver((mutations) => this.collect(mutations));

  constructor(private readonly onChange: DomChangeHandler) {}

  start(target: Node = document.body): void {
    this.observer.observe(target, { childList: true, subtree: true, characterData: true });
  }

  stop(): void {
    this.observer.disconnect();
    this.pendingRoots.clear();
  }

  private collect(mutations: readonly MutationRecord[]): void {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        this.enqueue(mutation.target.parentElement);
        continue;
      }
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeType === Node.ELEMENT_NODE) this.enqueue(addedNode);
      }
      if (changesTextContent(mutation)) this.enqueue(mutation.target);
    }
    this.scheduleFlush();
  }

  private enqueue(node: Node | null): void {
    if (node && !isExtensionNode(node)) this.pendingRoots.add(node);
  }

  private scheduleFlush(): void {
    if (this.isFrameScheduled || this.pendingRoots.size === 0) return;
    this.isFrameScheduled = true;
    requestAnimationFrame(() => this.flush());
  }

  private flush(): void {
    this.isFrameScheduled = false;
    const connectedRoots = [...this.pendingRoots].filter((root) => root.isConnected);
    this.pendingRoots.clear();
    if (connectedRoots.length > 0) this.onChange(connectedRoots);
  }
}
