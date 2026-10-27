export type UsdPriceMatch = {
  amount: number;
  matchedText: string;
};

const usdPricePattern = /\$\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)(?:\s*USD)?/;
const standaloneUsdPricePattern = new RegExp(`^${usdPricePattern.source}$`);

const argentineNumberFormat = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function toUsdPriceMatch(match: RegExpExecArray | null): UsdPriceMatch | null {
  if (!match?.[1]) return null;
  const amount = Number(match[1].replaceAll(",", ""));
  return Number.isFinite(amount) ? { amount, matchedText: match[0] } : null;
}

export function findUsdPrice(text: string): UsdPriceMatch | null {
  if (text.includes("ARS")) return null;
  return toUsdPriceMatch(usdPricePattern.exec(text));
}

export function findStandaloneUsdPrice(text: string): UsdPriceMatch | null {
  return toUsdPriceMatch(standaloneUsdPricePattern.exec(text.trim()));
}

export function parseUsdPrice(text: string): number | null {
  return findUsdPrice(text)?.amount ?? null;
}

export function parseArgentineDecimal(text: string): number | null {
  const normalized = text.trim().replaceAll(".", "").replace(",", ".");
  if (normalized === "") return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

export function formatArs(amount: number): string {
  return `ARS$ ${argentineNumberFormat.format(amount)}`;
}

export function formatUsd(amount: number): string {
  return `USD$ ${argentineNumberFormat.format(amount)}`;
}

export function formatPercent(percent: number): string {
  return `${argentineNumberFormat.format(percent).replace(/,00$/, "")}%`;
}
