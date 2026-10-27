import { VALVE_LATAM_PRICING_TIERS, type ValvePricingTier } from "./valve-pricing-tables";

export type RegionalPriceStatus = "none" | "elevated" | "fair" | "cheap" | "excellent";

export type ProductPrices = {
  usInitial: number;
  usFinal: number;
  regionalInitial: number;
  regionalFinal: number;
  discountPercent: number;
};

export type RegionalPriceAnalysis = ProductPrices & {
  status: RegionalPriceStatus;
  differencePercent: number;
  suggestedInitial: number;
  suggestedFinal: number;
  purchasingPowerFinal: number;
};

export const FAIR_DIFFERENCE_LIMIT_PERCENT = 25;
export const PURCHASING_POWER_TOLERANCE_PERCENT = 20;
export const MATCHING_DIFFERENCE_LIMIT_PERCENT = 1;

export function findNearestPricingTier(usdPrice: number): ValvePricingTier {
  return VALVE_LATAM_PRICING_TIERS.reduce((nearest, tier) =>
    Math.abs(tier.usdPrice - usdPrice) < Math.abs(nearest.usdPrice - usdPrice) ? tier : nearest,
  );
}

function applyDiscount(price: number, discountPercent: number): number {
  return (price * (100 - discountPercent)) / 100;
}

function percentDifference(actual: number, reference: number): number {
  return Math.round(((actual - reference) / reference) * 100);
}

function statusFromSuggestedDifference(differencePercent: number): RegionalPriceStatus {
  if (differencePercent > FAIR_DIFFERENCE_LIMIT_PERCENT) return "elevated";
  if (differencePercent < -FAIR_DIFFERENCE_LIMIT_PERCENT) return "cheap";
  return "fair";
}

function isNearPurchasingPowerPrice(regionalFinal: number, purchasingPowerFinal: number): boolean {
  const relativeDistance = Math.abs(regionalFinal - purchasingPowerFinal) / purchasingPowerFinal;
  return relativeDistance * 100 <= PURCHASING_POWER_TOLERANCE_PERCENT;
}

export function analyzeRegionalPrice(prices: ProductPrices): RegionalPriceAnalysis {
  const tier = findNearestPricingTier(prices.usInitial);
  const suggestedInitial = tier.latamRecommendedPrice;
  const suggestedFinal = applyDiscount(tier.latamRecommendedPrice, prices.discountPercent);
  const purchasingPowerFinal = applyDiscount(tier.latamPurchasingPowerPrice, prices.discountPercent);
  const differencePercent = percentDifference(prices.regionalFinal, suggestedFinal);
  const hasRegionalPrice = prices.regionalFinal !== prices.usFinal;

  const status: RegionalPriceStatus = !hasRegionalPrice
    ? "none"
    : isNearPurchasingPowerPrice(prices.regionalFinal, purchasingPowerFinal)
      ? "excellent"
      : statusFromSuggestedDifference(differencePercent);

  return { ...prices, status, differencePercent, suggestedInitial, suggestedFinal, purchasingPowerFinal };
}
