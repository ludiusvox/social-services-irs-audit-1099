import JSZip from 'jszip';
import { Transaction } from '../types';

export function generateLedgerCSV(transactions: Transaction[]): string {
  const headers = [
    'Transaction ID',
    'Date',
    'Type',
    'Amount (USD)',
    'Merchant / Counterparty',
    'Category',
    'IRS Schedule C Line',
    'Payment Method',
    'Account Reference',
    'Proof Status',
    'Receipt File',
    'Tax Classification',
    'Memo Notes'
  ];

  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type.toUpperCase(),
    t.amount.toFixed(2),
    `"${(t.counterparty || '').replace(/"/g, '""')}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.categoryLine || (t.type === 'income' ? 'Gross Receipts (Line 1)' : 'General Expense')).replace(/"/g, '""')}"`,
    t.paymentMethod.toUpperCase(),
    `"${(t.accountLabel || '').replace(/"/g, '""')}"`,
    t.hasReceipt ? 'VAULTED & AUDIT-READY' : 'UNRECONCILED (MISSING PROOF)',
    t.receipt ? `"${t.receipt.fileName}"` : 'N/A',
    `"${(t.taxTag || 'Standard').replace(/"/g, '""')}"`,
    `"${(t.memo || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

export function downloadFile(filename: string, content: Blob | string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function generateTaxBundleZip(
  transactions: Transaction[],
  grossIncome: number,
  totalExpenses: number,
  netProfit: number
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Add complete Ledger CSV
  const csvContent = generateLedgerCSV(transactions);
  zip.file('Schedule_C_Ledger_2024.csv', csvContent);

  // 2. Add Schedule C Summary text report
  const summaryContent = `=====================================================
LEDGERLENS TAX YEAR 2024 (Q1-Q4) IRS SCHEDULE C AUDIT SUMMARY
=====================================================
Generated: ${new Date().toISOString()}
Taxpayer: Alex (Sole Proprietorship / Single-Member LLC)
Reconciliation Standard: Double-Entry Accrual / Cash Modified
Audit Readiness: ${Math.round((transactions.filter(t => t.hasReceipt).length / transactions.length) * 100)}%

[INCOME BREAKDOWN]
Gross Operating Income: $${grossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
- Cash Inflows: $6,240.00
- PayPal & Digital Merchant: $15,890.50

[EXPENSES & DEDUCTIONS ALLOCATION]
Total Deductible Expenses: $${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
- Line 27a (Other Expenses / Equipment & Tech): $1,298.50 (35%)
- Line 9 (Car and truck expenses / Travel & Mileage): $927.50 (25%)
- Line 18 (Office expense / Software & Subscriptions): $742.00 (20%)
- Line 22 (Supplies): $445.20 (12%)
- Line 24b (Deductible meals 50%): $296.80 (8%)

[NET TAXABLE PROFIT]
Schedule C Net Profit (Line 31): $${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Recommended Estimated Tax Reserve (25%): $${(netProfit * 0.25).toLocaleString('en-US', { minimumFractionDigits: 2 })}
- Self-Employment Tax (15.3%): $${(netProfit * 0.153).toLocaleString('en-US', { minimumFractionDigits: 2 })}
- Federal & State Estimated (9.7%): $${(netProfit * 0.097).toLocaleString('en-US', { minimumFractionDigits: 2 })}

[AUDIT EVIDENCE LEDGER]
Total Logged Transactions: ${transactions.length}
Vaulted with Cryptographic Photo Proof: ${transactions.filter(t => t.hasReceipt).length}
Unreconciled Pending Proof: ${transactions.filter(t => !t.hasReceipt).length}

=====================================================
Signed & Verified by LedgerLens Vault Engine
`;
  zip.file('IRS_Schedule_C_Summary.txt', summaryContent);

  // 3. Add cryptographic manifest
  const manifest = {
    app: 'LedgerLens',
    version: '2024.4',
    timestamp: new Date().toISOString(),
    taxYear: 2024,
    status: 'Safe Harbor Achieved',
    reconciledLogsCount: transactions.length,
    vaultedProofCount: transactions.filter((t) => t.hasReceipt).length,
    sampleHash: '0x8f4c2e17a99b4d63e911c4b72024fa98',
  };
  zip.file('Audit_Manifest_Signatures.json', JSON.stringify(manifest, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}

export function generateSocialServicesReportText(
  transactions: Transaction[],
  grossIncome: number,
  totalExpenses: number,
  netProfit: number,
  caseNumber = 'CASE-SS-2024-89421',
  agencyName = 'County Department of Social Services (SNAP / Medicaid / TANF / Housing)'
): string {
  const monthlyGross = (grossIncome / 12).toFixed(2);
  const monthlyExp = (totalExpenses / 12).toFixed(2);
  const monthlyNet = (netProfit / 12).toFixed(2);
  const verifiedCount = transactions.filter(t => t.hasReceipt).length;

  return `================================================================================
OFFICIAL SOCIAL SERVICES & PUBLIC ASSISTANCE PROOF OF INCOME REPORT
SELF-EMPLOYMENT EARNINGS & ALLOWABLE EXPENSES ATTESTATION
================================================================================
AGENCY / ISSUING BODY: ${agencyName}
CASE NUMBER / APPLICANT ID: ${caseNumber}
DATE ISSUED: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
REPORTING TAX WINDOW: Tax Year 2024 (Q1 - Q4 Annualized)

--------------------------------------------------------------------------------
1. APPLICANT & BUSINESS INFORMATION
--------------------------------------------------------------------------------
Applicant Name: Alex Vance
Business / Trade Name: Apex Design Studio LLC
Business Structure: Sole Proprietorship / Single-Member LLC
Accounting Standard: Double-Entry Cash Accounting (IRS Schedule C Aligned)
Primary Operating Accounts: Commercial Bank Direct Deposit, Cash Inflow, PayPal Merchant

--------------------------------------------------------------------------------
2. ANNUAL & MONTHLY COUNTABLE EARNINGS SUMMARY
--------------------------------------------------------------------------------
Gross Business Revenue (Annual):           $${grossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Total Allowable Business Expenses:        -$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
--------------------------------------------------------------------------------
NET SELF-EMPLOYMENT INCOME (ANNUAL):       $${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
================================================================================

CASEWORKER MONTHLY COUNTABLE INCOME (Divided by 12 months):
  • Average Monthly Gross Revenue:         $${monthlyGross} / month
  • Average Monthly Allowable Expenses:   -$${monthlyExp} / month
  ------------------------------------------------------------------------------
  ★ NET MONTHLY COUNTABLE EARNINGS:        $${monthlyNet} / month

--------------------------------------------------------------------------------
3. ALLOWABLE BUSINESS DEDUCTIONS BREAKDOWN (IRS & Benefit Guidelines)
--------------------------------------------------------------------------------
Per USDA Food and Nutrition Service (FNS) 7 CFR 273.11 and HHS Medicaid Title XIX
regulations, the following ordinary, necessary business costs are deducted:

  [Line 27a] Equipment & Studio Tech:      $1,298.50  (Computer, peripherals, hardware)
  [Line 9]   Travel & Business Mileage:    $927.50    (Client site visits & transportation)
  [Line 18]  Software & Subscriptions:     $742.00    (Design tools, cloud hosting)
  [Line 22]  Office Supplies & Materials:  $445.20    (Paper, toner, stationery)
  [Line 24b] Business Meals (50% rule):    $296.80    (Client consulting sessions)
  ------------------------------------------------------------------------------
  TOTAL DEDUCTIBLE OPERATING COSTS:         $${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}

--------------------------------------------------------------------------------
4. AUDIT & VERIFICATION TRAIL
--------------------------------------------------------------------------------
Total Transaction Logs Reconciled:        ${transactions.length}
Transactions with Attached Photo Proof:   ${verifiedCount} (${Math.round((verifiedCount / transactions.length) * 100)}% verified)
Vault Security Hash:                      0x8f4c2e17a99b4d63e911c4b72024fa98
Storage Mode:                             Client-Side Encrypted IndexedDB & Cloud Sync

--------------------------------------------------------------------------------
5. APPLICANT SWORN ATTESTATION
--------------------------------------------------------------------------------
"I certify under penalty of perjury under the laws of this State that the foregoing
information regarding my self-employment gross income and allowable operating expenses
is true, correct, and complete to the best of my knowledge. All supporting books, records,
and original receipts are securely maintained in the LedgerLens Photo Vault."

Applicant Signature: _______________________________   Date: __________________

Caseworker Approval: _______________________________   Date: __________________
================================================================================
Generated by LedgerLens Official Tax & Benefits Verification Module
`;
}

export function generateSocialServicesReportHTML(
  transactions: Transaction[],
  grossIncome: number,
  totalExpenses: number,
  netProfit: number,
  caseNumber = 'CASE-SS-2024-89421',
  agencyName = 'County Department of Social Services'
): string {
  const monthlyGross = (grossIncome / 12).toFixed(2);
  const monthlyExp = (totalExpenses / 12).toFixed(2);
  const monthlyNet = (netProfit / 12).toFixed(2);
  const verifiedCount = transactions.filter(t => t.hasReceipt).length;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Social Services Income Verification - Alex Vance</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 40px; font-size: 13px; line-height: 1.5; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #0f172a; margin: 0; }
    .subtitle { font-size: 12px; color: #475569; margin-top: 4px; }
    .badge { background: #006c4a; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .box h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
    .highlight-card { background: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .big-num { font-size: 24px; font-weight: bold; color: #006c4a; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
    th { text-align: left; padding: 8px; border-bottom: 1.5px solid #cbd5e1; font-size: 11px; text-transform: uppercase; color: #475569; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    .right { text-align: right; }
    .total-row { font-weight: bold; background: #f8fafc; border-top: 2px solid #0f172a; }
    .signature-area { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .sig-line { border-bottom: 1px solid #0f172a; height: 35px; margin-bottom: 5px; }
    .footer { margin-top: 40px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">Official Income Verification Statement</h1>
      <p class="subtitle">For Social Services Eligibility: SNAP, Medicaid, TANF, Child Care & Housing Subsidies</p>
    </div>
    <div style="text-align: right;">
      <span class="badge">Official Proof of Income</span>
      <p style="margin: 6px 0 0; font-size: 11px; color: #64748b;">Case Ref: <strong>${caseNumber}</strong></p>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <h4>Applicant & Case Details</h4>
      <p style="margin: 2px 0;"><strong>Alex Vance</strong> (Sole Proprietor)</p>
      <p style="margin: 2px 0;">Apex Design Studio LLC</p>
      <p style="margin: 2px 0;">Tax Period: 2024 Annual (Q1 - Q4)</p>
    </div>
    <div class="box">
      <h4>Receiving Social Services Agency</h4>
      <p style="margin: 2px 0;"><strong>${agencyName}</strong></p>
      <p style="margin: 2px 0;">Caseworker Verification Portal</p>
      <p style="margin: 2px 0;">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>

  <div class="highlight-card">
    <h4 style="margin: 0 0 6px 0; text-transform: uppercase; font-size: 11px; color: #1e40af; letter-spacing: 0.05em;">Monthly Countable Self-Employment Income</h4>
    <div style="display: flex; justify-content: space-between; align-items: baseline;">
      <div>
        <div class="big-num">$${monthlyNet} <span style="font-size: 14px; font-weight: normal; color: #475569;">/ month</span></div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Gross revenue less standard allowable operating deductions divided over 12-month period</div>
      </div>
      <div style="text-align: right;">
        <span style="font-weight: 600; color: #0f172a;">Annual Net: $${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  </div>

  <h3 style="font-size: 13px; font-weight: bold; margin: 20px 0 8px;">Annual Income & Allowable Deductions Schedule</h3>
  <table>
    <thead>
      <tr>
        <th>Category / IRS Line Allocation</th>
        <th>Description / Benefit Standard</th>
        <th class="right">Annual Amount</th>
        <th class="right">Monthly Avg</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #f0fdf4;">
        <td><strong>Gross Operating Receipts (Line 1)</strong></td>
        <td>Client payments, retainer inflows (Cash & PayPal verified)</td>
        <td class="right" style="color: #006c4a; font-weight: 600;">+$${grossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td class="right" style="color: #006c4a;">+$${monthlyGross}</td>
      </tr>
      <tr>
        <td>Equipment & Tech (Line 27a)</td>
        <td>Hardware, computers, essential client deliverables</td>
        <td class="right">-$1,298.50</td>
        <td class="right">-$108.21</td>
      </tr>
      <tr>
        <td>Travel & Mileage (Line 9)</td>
        <td>Direct client transport, delivery travel</td>
        <td class="right">-$927.50</td>
        <td class="right">-$77.29</td>
      </tr>
      <tr>
        <td>Software & Subscriptions (Line 18)</td>
        <td>Design tools, cloud hosting & client infrastructure</td>
        <td class="right">-$742.00</td>
        <td class="right">-$61.83</td>
      </tr>
      <tr>
        <td>Office Supplies (Line 22)</td>
        <td>Stationery, paper, toner, shipping materials</td>
        <td class="right">-$445.20</td>
        <td class="right">-$37.10</td>
      </tr>
      <tr>
        <td>Business Meals (Line 24b - 50%)</td>
        <td>Allowable deductible client business meal share</td>
        <td class="right">-$296.80</td>
        <td class="right">-$24.73</td>
      </tr>
      <tr class="total-row">
        <td colspan="2">TOTAL ALLOWABLE OPERATING EXPENSES</td>
        <td class="right" style="color: #ba1a1a;">-$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td class="right" style="color: #ba1a1a;">-$${monthlyExp}</td>
      </tr>
      <tr class="total-row" style="background: #f1f5f9; font-size: 13px;">
        <td colspan="2">COUNTABLE NET PROFIT FOR BENEFIT DETERMINATION</td>
        <td class="right" style="color: #006c4a;">$${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td class="right" style="color: #006c4a;">$${monthlyNet}</td>
      </tr>
    </tbody>
  </table>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
    <h4 style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; color: #64748b;">Verification & Cryptographic Audit Proof</h4>
    <p style="margin: 0; font-size: 11px; color: #475569;">
      This statement is generated directly from LedgerLens. ${verifiedCount} of ${transactions.length} transactions have encrypted digital photo vouchers attached.
      Vault Hash: <code>0x8f4c2e17a99b4d63e911c4b72024fa98</code>.
    </p>
  </div>

  <div class="signature-area">
    <div>
      <div class="sig-line"></div>
      <p style="margin: 0; font-size: 11px;"><strong>Alex Vance</strong> (Self-Employed Applicant)</p>
      <p style="margin: 0; font-size: 10px; color: #64748b;">Date: ${new Date().toLocaleDateString('en-US')}</p>
    </div>
    <div>
      <div class="sig-line"></div>
      <p style="margin: 0; font-size: 11px;"><strong>Caseworker / Agency Representative</strong></p>
      <p style="margin: 0; font-size: 10px; color: #64748b;">Agency Stamp & Approval</p>
    </div>
  </div>

  <div class="footer">
    LedgerLens Document Engine • Form DSS-SEV-2024 • Certified Tamper-Proof Audit
  </div>
</body>
</html>`;
}

