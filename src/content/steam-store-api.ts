import type { ProductType } from "./routes";

export type CountryCode = "us" | "ar";

export type PriceOverview = {
  initial: number;
  final: number;
  discountPercent: number;
};

type SteamPrice = {
  initial: number;
  final: number;
  discount_percent: number;
};

type SteamProductEntry = {
  success: boolean;
  data?: {
    steam_appid?: number;
    price_overview?: SteamPrice;
    price?: SteamPrice;
  };
};

type SteamDetailsResponse = Record<string, SteamProductEntry>;

function detailsUrl(productType: ProductType, productId: string, countryCode: CountryCode): string {
  return productType === "app"
    ? `https://store.steampowered.com/api/appdetails?appids=${productId}&cc=${countryCode}&filters=price_overview`
    : `https://store.steampowered.com/api/packagedetails?packageids=${productId}&cc=${countryCode}`;
}

function findProductEntry(response: SteamDetailsResponse, productId: string): SteamProductEntry | undefined {
  const entries = Object.values(response);
  return (
    response[productId] ??
    entries.find((entry) => String(entry.data?.steam_appid) === productId) ??
    (entries.length === 1 ? entries[0] : undefined)
  );
}

export async function fetchPriceOverview(
  productType: ProductType,
  productId: string,
  countryCode: CountryCode,
): Promise<PriceOverview | null> {
  const response = await fetch(detailsUrl(productType, productId, countryCode), { credentials: "omit" });
  if (!response.ok) return null;
  const entry = findProductEntry((await response.json()) as SteamDetailsResponse, productId);
  const steamPrice = entry?.success ? (entry.data?.price_overview ?? entry.data?.price) : undefined;
  if (!steamPrice) return null;
  return {
    initial: steamPrice.initial / 100,
    final: steamPrice.final / 100,
    discountPercent: steamPrice.discount_percent,
  };
}
