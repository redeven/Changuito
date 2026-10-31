type GMRequestDetails = {
  method: 'GET';
  url: string;
  anonymous?: boolean;
  onload?: (response: { status: number; responseText: string }) => void;
  onerror?: () => void;
  ontimeout?: () => void;
};

type GMValueChangeListener = (name: string, oldValue: unknown, newValue: unknown, remote: boolean) => void;

declare const GM: {
  getValue(key: string): Promise<unknown>;
  setValue(key: string, value: unknown): Promise<void>;
  xmlHttpRequest(details: GMRequestDetails): void;
  registerMenuCommand?: (caption: string, onClick: () => void) => void;
};
declare const GM_addValueChangeListener: ((key: string, listener: GMValueChangeListener) => void) | undefined;

declare const __CHANGUITO_VERSION__: string;

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
