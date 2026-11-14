# Changelog

All notable changes to the **LedgerLens** project will be documented in this file.

---

## [1.5.0] - 2026-11-14

### Added
- **2027 Tax Year & Quarter Selection**: Added full support for 2027 tax quarters (`Tax Year 2027 (Q1–Q4)`, `Q1 2027`, `Q2 2027`, `Q3 2027`, `Q4 2027`) alongside 2026 quarters.
- **Dynamic Period Analytics Filtering**: Selecting a specific tax year or quarter dynamically filters income, expenses, Schedule C line items, tax reserve allocations, and report metadata.
- **ZIP Archive Analytics Import**: Added ability to restore or import transaction ledgers directly from exported `.ZIP` packages containing `Schedule_C_Ledger_*.csv` files into the embedded NoSQL store (Dexie.js / IndexedDB).
- **Import UI Suite**: Added an "Import Analytics & Ledger (.ZIP)" card in the Tax & Analytics section.

### Fixed
- **Form Seed Data Bug (C-01)**: Fixed issue where new transaction entry forms were pre-filled with a sample `$142.50` amount and a placeholder `apexSampleScan` receipt photo. The form now opens completely blank.
- **Tax Reserve Calculation (C-02)**: Fixed hardcoded `$4,605.00` tax reserve display in favor of dynamic `25%` safe harbor estimations (`Math.max(0, netProfit * 0.25)`).
- **Android File Sharing & FileProvider Paths**: Updated `file_paths.xml` to include `<files-path>`, `<cache-path>`, `<external-files-path>`, and `<external-cache-path>`. Fixed `blob:` URI sharing issues on Android by writing exported `.ZIP`, `.CSV`, and `.HTML` files through Capacitor `Filesystem` and generating native `content://` URIs for `Share.share`.
- **Expense Category Defaults (M-04)**: Toggling transaction type from Income to Expense automatically switches the default category from `Client Payment` to `Office Supplies`.
- **Overview Dashboard Greetings & Growth Badge (M-01, M-05)**: Overview header now displays time-sensitive greetings ("Good morning", "Good afternoon", "Good evening") and hides the static `+14.2%` growth badge when insufficient transaction history is present.
- **Profile Modal Sign Out Prompt (S-01)**: Added a confirmation prompt before signing out to reassure users that their local ledger data remains safely stored on their device.

---

## [1.4.0] - 2026-11-12

### Added
- **Medicaid & FICA Tax Analytics**: Added Medicaid/ACA premium estimations (5%) and FICA / SECA self-employment tax calculations (15.3% on 92.35% SE net income).
- **Capacitor Native Sharing Suite**: Integrated `@capacitor/filesystem` and `@capacitor/share` for saving PDF/CSV tax exports to mobile device storage.

---

## [1.3.0] - 2026-10-30

### Added
- **App Icon & Branding Update**: Generated adaptive Android launcher icons and updated brand styling.
- **Build Configurations**: Configured release keystore signing rules and Gradle release tasks.

---

## [1.2.0] - 2026-10-28

### Fixed
- **Layout Spacing & UI Polish**: Improved edge-to-edge padding, modal sheet transitions, and dark mode contrast ratios.

---

## [1.1.0] - 2026-10-27

### Added
- **Embedded NoSQL Persistence**: Integrated Dexie.js (IndexedDB) with automatic non-volatile storage persistence requests.
- **Day Rollover Engine**: Normalizes transaction dates into relative groupings (`Today`, `Yesterday`, `Last Week`, `Earlier`).

---

## [1.0.0] - 2026-10-25

### Added
- Initial release of **LedgerLens** for Android and Web.
