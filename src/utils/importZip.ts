import JSZip from 'jszip';
import { Transaction, PaymentMethod, TransactionType } from '../types';
import { getGroupForDate } from './dateGrouping';

export async function importTransactionsFromZip(file: File): Promise<Transaction[]> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const csvFile = loadedZip.file('Schedule_C_Ledger_2026.csv');
  if (!csvFile) {
    throw new Error('CSV file "Schedule_C_Ledger_2026.csv" not found in zip');
  }

  const csvText = await csvFile.async('string');
  const lines = csvText.split('\n');
  const transactions: Transaction[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // A simple CSV parser (does not handle commas inside quotes perfectly if they exist, but good enough for generated format)
    const row = [];
    let insideQuote = false;
    let currentValue = '';
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    row.push(currentValue);

    if (row.length >= 12) {
      const [
        id,
        date,
        typeStr,
        amountStr,
        counterparty,
        category,
        categoryLine,
        paymentMethodStr,
        accountLabel,
        proofStatus,
        receiptFile,
        taxClassification,
        memoNotes
      ] = row;

      const type: TransactionType = typeStr.toLowerCase() === 'income' ? 'income' : 'expense';
      const paymentMethod: PaymentMethod = (paymentMethodStr.toLowerCase() || 'cash') as PaymentMethod;
      const amount = parseFloat(amountStr);

      const hasReceipt = proofStatus === 'Verified Photo';
      const createdAt = Date.now() - i * 1000;

      transactions.push({
        id: id || `tx-imported-${Date.now()}-${i}`,
        type,
        amount: isNaN(amount) ? 0 : amount,
        counterparty: counterparty?.replace(/""/g, '"') || '',
        category: category?.replace(/""/g, '"') || '',
        categoryLine: categoryLine?.replace(/""/g, '"') || '',
        date,
        paymentMethod,
        accountLabel,
        hasReceipt,
        memo: memoNotes?.replace(/""/g, '"') || '',
        taxTag: taxClassification,
        group: getGroupForDate(date, createdAt),
        createdAt,
      });
    }
  }

  return transactions;
}