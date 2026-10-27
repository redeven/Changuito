import { h } from "../../ui/element-builder";
import { ShadowComponent } from "../../ui/shadow-component";

const searchPriceHintStyles = `
  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--steam-text-muted);
  }
`;

export class SearchPriceHint extends ShadowComponent {
  private readonly text = h("p");

  constructor() {
    super("changuito-search-price-hint", searchPriceHintStyles);
    this.replaceContent(this.text);
  }

  update(hint: string): void {
    if (this.text.textContent !== hint) this.text.textContent = hint;
  }
}
