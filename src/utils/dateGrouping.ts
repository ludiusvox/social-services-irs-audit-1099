import { Transaction } from '../types';

/**
 * Dynamically computes the relative time group for a transaction based on the current system date.
 * Guarantees transactions transition seamlessly across day rollovers:
 * Today -> Yesterday -> Last Week -> Earlier
 */
export function getGroupForDate(txDateStr?: string, txCreatedAt?: number): 'Today' | 'Yesterday' | 'Last Week' | 'Earlier' {
  const now = new Date();
  const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let txTime: number;

  if (txDateStr) {
    const parts = txDateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      txTime = new Date(year, month, day).getTime();
    } else {
      const d = new Date(txDateStr);
      txTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }
  } else if (txCreatedAt) {
    const d = new Date(txCreatedAt);
    txTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  } else {
    return 'Today';
  }

  if (isNaN(txTime)) {
    return 'Today';
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor((todayReset - txTime) / msPerDay);

  if (diffDays <= 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return 'Last Week';
  } else {
    return 'Earlier';
  }
}

/**
 * Normalizes all transactions in a list so their `group` property reflects current day status.
 */
export function normalizeTransactionGroups(transactions: Transaction[]): Transaction[] {
  return transactions.map((tx) => ({
    ...tx,
    group: getGroupForDate(tx.date, tx.createdAt),
  }));
}
