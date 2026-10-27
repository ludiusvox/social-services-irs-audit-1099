import { Transaction, CashFlowDay } from '../types';

export const INITIAL_RECEIPTS: Record<string, any> = {
  apexSampleScan: {
    id: 'rc-apexsamplescan',
    fileName: 'IMG_20240518_APX.jpg',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="%23d3e4fe"/><text x="200" y="300" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="%230b1c30">Apex Design</text><text x="200" y="340" font-family="sans-serif" font-size="20" text-anchor="middle" fill="%23006c4a">Verified Voucher</text></svg>',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23d3e4fe"/><text x="50" y="55" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="%230b1c30">Apex</text></svg>',
    title: 'Apex Design Deliverable Proof',
    ocrAmount: '$142.50',
    ocrConfidence: 100,
    timestamp: 'May 18, 2024 · 14:32 PM',
    fileSize: '2.4 MB',
    taxDeductibleType: 'Client Inflow Verification',
  },
  officeDepot: {
    id: 'rc-officedepot',
    fileName: 'OfficeDepot_Receipt_8812.jpg',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="%23dce9ff"/><text x="200" y="300" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="%230b1c30">Office Depot</text><text x="200" y="340" font-family="sans-serif" font-size="20" text-anchor="middle" fill="%23006c4a">Thermal Slip</text></svg>',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23dce9ff"/><text x="50" y="55" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="%230b1c30">OD</text></svg>',
    title: 'Office Depot Thermal Slip',
    ocrAmount: '$142.50',
    ocrConfidence: 99,
    timestamp: 'Oct 23, 2024 · 12:15 PM',
    fileSize: '1.1 MB',
    taxDeductibleType: 'Office Supplies (Line 22)',
  }
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const CASH_FLOW_WEEK: CashFlowDay[] = [
  { day: 'M', label: 'Monday', inflow: 0, outflow: 0 },
  { day: 'T', label: 'Tuesday', inflow: 0, outflow: 0 },
  { day: 'W', label: 'Wednesday', inflow: 0, outflow: 0 },
  { day: 'T', label: 'Thursday', inflow: 0, outflow: 0, isToday: true },
  { day: 'F', label: 'Friday', inflow: 0, outflow: 0 },
  { day: 'S', label: 'Sat / Sun', inflow: 0, outflow: 0 },
];
