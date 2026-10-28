export type ProductType = 'app' | 'sub';

export type StorePage =
  | { kind: 'product'; productType: ProductType; productId: string }
  | { kind: 'search' }
  | { kind: 'cart' }
  | { kind: 'walletFunding' }
  | { kind: 'other' };

const productPathPattern = /^\/(app|sub)\/(\d+)/;
const walletFundingPathPrefixes = ['/steamaccount/addfunds', '/digitalgiftcards'];

export function detectStorePage(url: URL): StorePage {
  if (url.hostname !== 'store.steampowered.com') return { kind: 'other' };

  const productMatch = productPathPattern.exec(url.pathname);
  if (productMatch?.[1] && productMatch[2]) {
    return { kind: 'product', productType: productMatch[1] as ProductType, productId: productMatch[2] };
  }
  if (url.pathname.startsWith('/search')) return { kind: 'search' };
  if (url.pathname.startsWith('/cart')) return { kind: 'cart' };
  if (walletFundingPathPrefixes.some((prefix) => url.pathname.startsWith(prefix))) return { kind: 'walletFunding' };
  return { kind: 'other' };
}
