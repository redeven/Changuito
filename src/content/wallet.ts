import { findStandaloneUsdPrice, parseUsdPrice } from '../shared/money';
import { findReactHeaderActions } from './steam-header';

const pendingBalanceMarkers = ['Pendiente', 'Pending'];

function readClassicHeaderBalance(): number | null {
  const balanceText = document.querySelector('#header_wallet_balance')?.textContent;
  if (balanceText === undefined || balanceText === null) return null;
  return parseUsdPrice(removePendingBalance(balanceText));
}

function readReactHeaderBalance(): number | null {
  const headerActions = findReactHeaderActions();
  if (!headerActions) return null;
  for (const leaf of headerActions.querySelectorAll('div:not(:has(*))')) {
    const balance = findStandaloneUsdPrice(leaf.textContent ?? '');
    if (balance) return balance.amount;
  }
  return null;
}

function removePendingBalance(text: string): string {
  const pendingIndexes = pendingBalanceMarkers.map((marker) => text.indexOf(marker)).filter((index) => index >= 0);
  return pendingIndexes.length > 0 ? text.slice(0, Math.min(...pendingIndexes)) : text;
}

export function readWalletBalance(): number {
  return readClassicHeaderBalance() ?? readReactHeaderBalance() ?? 0;
}
