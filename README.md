# LedgerLens — 1099 Tax Ledger & Social Services Audit Engine

**LedgerLens** is a mobile-first Android and Web application designed for 1099 gig workers, freelancers, sole proprietors, and benefit recipients. It provides real-time IRS Schedule C expense tracking, receipt audit proofing, automatic tax reserve allocation, and countable income statement generation for social services benefit programs.

---

## Key Features

- **Embedded Persistent NoSQL Database (Dexie.js / IndexedDB)**: Offline-first, durable document store with automatic non-volatile storage persistence (`navigator.storage.persist()`) preventing data loss across day rollovers and app restarts.
- **Dynamic Day Rollover Ledger**: Intelligent date grouping engine that automatically normalizes transactions into relative time periods (`Today`, `Yesterday`, `Last Week`, `Earlier Records`).
- **IRS Schedule C Line Item Mapping**: Automatic categorization into Schedule C lines including Line 1 (Gross Receipts), Line 9 (Car & Travel), Line 18 (Software), Line 22 (Office Supplies), Line 24b (Meals), and Line 27a (Equipment).
- **Social Services Income Verification**: Export official proof-of-income PDF statements directly to the Android `Documents/` folder for SNAP, Medicaid, TANF, Section 8, and Child Care subsidies.
- **Receipt Photo Vault & OCR Verification**: Native camera integration (`@capacitor/camera`) with thermal slip receipt scanning, thumbnail caching, and audit readiness metrics.
- **Tax Reserve Safe Harbor**: Real-time calculation and one-tap allocation of the recommended 25% safe-harbor estimated tax reserve (Self-Employment + Federal/State).
- **Export & Share Package**: Generate full `.zip` tax packages (CSV ledger + Schedule C summary report + cryptographic manifest) or share directly via email.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Mobile Runtime**: Capacitor 8 (Android)
- **Database**: Dexie.js (Embedded NoSQL on IndexedDB)
- **Build Tool**: Vite 8
- **PDF & Document Engine**: `html2pdf.js`, `jszip`

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- JDK 21 / Android SDK (for Android builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/ludiusvox/social-services-irs-audit-1099.git
cd social-services-irs-audit-1099

# Install dependencies
npm install --legacy-peer-deps
```

### Development Server

```bash
npm run dev
```

### Building for Android

```bash
# Build web bundle
npm run build

# Sync assets to Capacitor Android
npx cap copy android

# Compile signed Release APK
cd android
.\gradlew.bat assembleRelease
```

The compiled release signed APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## License

MIT
