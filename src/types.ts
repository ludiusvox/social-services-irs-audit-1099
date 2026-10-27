export type ScreenId = 'overview' | 'log' | 'ledger' | 'tax-and-analytics';

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'paypal' | 'deposit' | 'card' | 'mastercard';

export interface ReceiptData {
  id: string;
  fileName: string;
  imageUrl: string;
  thumbnailUrl?: string;
  ocrAmount?: string;
  ocrConfidence?: number;
  timestamp: string;
  fileSize: string;
  title: string;
  taxDeductibleType?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  counterparty: string;
  category: string;
  categoryLine?: string; // e.g. "Line 27a", "Line 9", "Line 18"
  date: string; // YYYY-MM-DD
  time?: string;
  paymentMethod: PaymentMethod;
  accountLabel?: string; // e.g. "Card • 8812", "PayPal", "Cash", "Cash in Hand"
  memo?: string;
  tag?: string; // e.g. "Audit Alert", "Invoice #104", "Client Mtg", "Equip", "No Invoice", "Consulting", "Verified"
  taxTag?: string; // e.g. "Meals 50%", "100% Write-off", "Tax Exempt", "Class C Inc."
  hasReceipt: boolean;
  missingProofReason?: 'Audit Alert' | 'No Invoice' | 'Missing Proof' | 'Missing Invoice PDF';
  receipt?: ReceiptData;
  group: 'Today' | 'Yesterday' | 'Last Week' | 'Earlier';
  createdAt: number;
}

export interface CashFlowDay {
  day: string;
  label: string;
  inflow: number;
  outflow: number;
  isToday?: boolean;
}
