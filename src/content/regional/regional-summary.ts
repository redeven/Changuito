import {
  MATCHING_DIFFERENCE_LIMIT_PERCENT,
  type RegionalPriceAnalysis,
  type RegionalPriceStatus,
} from './regional-analysis';

export const REGIONAL_STATUS_SCALE: readonly RegionalPriceStatus[] = ['none', 'elevated', 'fair', 'cheap', 'excellent'];

export const REGIONAL_STATUS_LABELS: Readonly<Record<RegionalPriceStatus, string>> = {
  none: 'Sin precio regional',
  elevated: 'Elevado',
  fair: 'Bueno',
  cheap: 'Muy bueno',
  excellent: 'Excelente',
};

function describeDifferenceFromSuggested(differencePercent: number): string {
  if (Math.abs(differencePercent) <= MATCHING_DIFFERENCE_LIMIT_PERCENT) {
    return 'El precio regional coincide con el sugerido por Valve.';
  }
  const direction = differencePercent > 0 ? 'más alto' : 'más bajo';
  return `El precio regional es ${Math.abs(differencePercent)}% ${direction} que el sugerido por Valve.`;
}

export function describeRegionalPrice(analysis: RegionalPriceAnalysis): string {
  switch (analysis.status) {
    case 'none':
      return 'No tiene precio regional: cuesta lo mismo que en Estados Unidos.';
    case 'excellent':
      return 'El precio regional está cerca del valor por paridad de poder adquisitivo (PPP) sugerido por Valve.';
    default:
      return describeDifferenceFromSuggested(analysis.differencePercent);
  }
}
