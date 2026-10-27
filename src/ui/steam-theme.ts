export const steamThemeStyles = `
  :host {
    all: initial;
    display: block;
    font-family: "Motiva Sans", Arial, Helvetica, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    color: #c6d4df;
    --steam-text: #c6d4df;
    --steam-text-muted: #8f98a0;
    --steam-text-bright: #ffffff;
    --steam-link: #67c1f5;
    --steam-accent-green: #beee11;
    --steam-heading-background: rgba(0, 0, 0, 0.2);
    --steam-block-background: linear-gradient(90deg, rgba(0, 0, 0, 0.5) 5%, rgba(0, 0, 0, 0.65) 95%);
    --steam-block-text: #969696;
    --steam-modal-background: #16202d;
    --steam-input-background: rgba(0, 0, 0, 0.4);
    --steam-input-border: #000000;
    --steam-input-shadow: #45556c;
    --steam-divider: #273747;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  a {
    color: var(--steam-link);
    text-decoration: none;
  }

  a:hover {
    color: var(--steam-text-bright);
  }

  .sidebar-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 18px;
    background-image: var(--steam-block-background);
    background-color: var(--steam-heading-background);
    backdrop-filter: blur(7px);
    font-size: 16px;
    color: var(--steam-text-bright);
  }

  .sidebar-heading-credit {
    font-size: 10px;
    font-weight: 300;
    white-space: nowrap;
    opacity: 0.5;
  }

  .sidebar-block {
    margin-bottom: 8px;
    padding: 16px;
    background: var(--steam-block-background);
    backdrop-filter: blur(7px);
    font-size: 14px;
    color: var(--steam-block-text);
  }

  .divider {
    height: 1px;
    margin: 10px 0;
    border: 0;
    background-color: var(--steam-divider);
  }

  .muted {
    color: var(--steam-text-muted);
  }

  .highlight {
    color: var(--steam-text-bright);
  }

  .strikethrough {
    color: #738895;
    text-decoration: line-through;
    font-size: 0.85em;
  }

  .field-input {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 5px 8px;
    border: 1px solid var(--steam-input-border);
    border-radius: 3px;
    box-shadow: 1px 1px 0 var(--steam-input-shadow);
    background-color: var(--steam-input-background);
    color: var(--steam-text-bright);
    font: inherit;
  }

  .field-input input {
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    -moz-appearance: textfield;
  }

  select.field-input {
    cursor: pointer;
  }

  select.field-input option {
    background-color: var(--steam-modal-background);
  }

  .steam-button {
    padding: 0 15px;
    border: 0;
    border-radius: 2px;
    background: linear-gradient(to right, #47bfff 5%, #1a44c2 60%);
    color: var(--steam-text-bright);
    font: inherit;
    line-height: 30px;
    cursor: pointer;
  }

  .steam-button:hover {
    background: linear-gradient(to right, #47bfff 5%, #1a44c2 40%);
  }
`;
