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

- Node.js (v18+ / v26)
- JDK 21 (`export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"`)
- Android SDK & Platform Tools (`/home/aaronl/Android/Sdk`)

### Installation

```bash
# Clone the repository
git clone https://github.com/ludiusvox/social-services-irs-audit-1099.git
cd social-services-irs-audit-1099

# Install dependencies (using legacy peer deps for Vite 8 / Tailwind v4 compatibility)
npm install --legacy-peer-deps
```

### Development Server

```bash
npm run dev
```

### Building & Signing for Android

1. **Build web bundle & sync to Capacitor**:
   ```bash
   npm run build
   npx cap copy android
   ```

2. **Android Keystore (`release.jks` / `release.keystore`)**:
   The app is configured for signed release builds using `android/app/release.jks` (and `release.keystore`). A secure release signing key can be generated with:
   ```bash
   keytool -genkey -v -keystore android/app/release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ledgerlens-key -storepass ledgerlens123 -keypass ledgerlens123
   ```

3. **Compile APK**:
   ```bash
   cd android
   export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
   ./gradlew assembleRelease
   # or for debug:
   ./gradlew assembleDebug
   ```

   The compiled release APK is generated at:
   `android/app/build/outputs/apk/release/app-release.apk`

---

## Testing in Emulator

1. List available virtual devices:
   ```bash
   /home/aaronl/Android/Sdk/emulator/emulator -list-avds
   ```
2. Start emulator:
   ```bash
   /home/aaronl/Android/Sdk/emulator/emulator -avd Medium_Phone_API_37.0 -no-audio -no-snapshot-load &
   ```
3. Install and run built APK:
   ```bash
   export PATH="/home/aaronl/Android/Sdk/platform-tools:$PATH"
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## License

MIT
