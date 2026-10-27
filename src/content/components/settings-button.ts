import { h } from "../../ui/element-builder";
import { ShadowComponent } from "../../ui/shadow-component";

const settingsButtonStyles = `
  :host {
    display: inline-flex;
    align-items: center;
    height: 24px;
    margin-right: 6px;
    align-self: flex-start;
    vertical-align: top;
  }

  button {
    padding: 0;
    border: 0;
    background: none;
    font-size: 17px;
    line-height: 1;
    cursor: pointer;
    transition: transform 0.25s ease;
  }

  button:hover,
  button:focus-visible {
    transform: rotate(20deg);
  }
`;

export class SettingsButton extends ShadowComponent {
  constructor(onActivate: () => void) {
    super("changuito-settings-button", settingsButtonStyles);
    this.replaceContent(
      h(
        "button",
        {
          attributes: { type: "button", title: "Configuración de Changuito", "aria-label": "Configuración de Changuito" },
          on: { click: onActivate },
        },
        ["🧉"],
      ),
    );
  }
}
