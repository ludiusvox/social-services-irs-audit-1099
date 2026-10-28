import Dexie, { Table } from 'dexie';
import { Transaction, UserProfile } from '../types';

export interface AppSetting {
  key: string;
  value: any;
}

export class LedgerLensDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  userProfile!: Table<UserProfile & { id: string }, string>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('LedgerLensNoSQLDB');

    // Schema definition for Dexie embedded NoSQL database
    this.version(1).stores({
      transactions: 'id, type, date, createdAt, paymentMethod, group, hasReceipt',
      userProfile: 'id',
      settings: 'key',
    });
  }
}

export const db = new LedgerLensDatabase();

/**
 * Requests persistent storage from the Web/Android WebView engine
 * to prevent the OS or browser from clearing the embedded database.
 */
export async function enablePersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      console.log(`[LedgerLens NoSQL] Storage persisted: ${isPersisted}`);
      return isPersisted;
    }
  } catch (e) {
    console.warn('[LedgerLens NoSQL] Failed to request persistent storage', e);
  }
  return false;
}
