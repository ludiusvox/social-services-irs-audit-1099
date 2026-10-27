---
name: LedgerLens
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#40000c'
  on-tertiary-container: '#f83256'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes a high-clarity, precision-oriented fintech aesthetic engineered for modern bookkeeping and mobile accounting. It projects unwavering dependability, audit-grade accuracy, and operational composure. 

Targeting business owners, freelancers, and financial operators, the experience replaces financial ambiguity with calm, instantaneous clarity. The design style combines Corporate Modern precision with warm utility: deep structural slate establishes authority, functional ledger tones delineate credits from debits, and clean micro-interactions evoke confidence in every reconciled transaction. Whitespace is disciplined and purposeful, avoiding decorative noise in favor of scan-friendly figures, structured balance cards, and immediate accounting transparency.

## Colors
The color architecture relies on a crisp slate foundation paired with semantic fiscal indicators that reflect real-world double-entry clarity:

- **Primary (`#0F172A`)**: Deep slate navy applied to core structural anchors, primary buttons, major balances, navigation bars, and top-tier typography.
- **Secondary (`#059669`)**: Crisp emerald green dedicated to credit movements, verified receipts, positive reconciliations, cash inflows, and active health states.
- **Tertiary (`#E11D48`)**: Balanced rose red employed strictly for debits, accounts payable, expense outflows, and critical threshold warnings.
- **Neutral (`#64748B`)**: Slate gray calibrated for secondary captions, transactional timestamps, field labels, and standard neutral states.
- **Surface Foundations**: Canvas background rests on clean slate white (`#F8FAFC`), layering up to pure white (`#FFFFFF`) for interactive cards and input surfaces, with border dividers locked at delicate slate neutral (`#E2E8F0`).
- **Auxiliary Accents**: Warm amber (`#D97706`) is reserved for pending reconciliations, draft states, and unverified receipts.

## Typography
The system enforces a dual-type approach: **Manrope** lends geometric structure and balanced authority to high-impact numerical totals and titles, while **Inter** delivers maximum legibility for transactional tables, ledger annotations, and dense data labels.

Numbers, transaction rows, and accounting entries must consistently feature tabular numerals (`font-feature-settings: 'tnum' on, 'cv05' on`) to ensure pristine vertical alignment across currency columns. Negative figures never rely on color alone; they require standardized prefix minus signs or bracketed accounting format for unambiguous financial audits.

## Layout & Spacing
The layout relies on a mobile-first 4-column responsive grid on handheld viewports, scaling to 8 columns on tablet devices and 12 columns on desktop workstations. 

Outer margins lock at `1rem` on mobile screens to preserve maximum horizontal real estate for ledger tables, widening smoothly across desktop resolutions. Elements follow a strict 4px/8px incremental cadence. Transaction rows adhere to unified heights (`48px` compact, `64px` default) to maximize visual rhythm and ease scanning on mobile devices. Ledger entries maintain `space-sm` between line items, while analytical summary tiles stack with `space-md` gaps.

## Elevation & Depth
Elevation emphasizes structured tonal surfaces backed by subtle, tinted ambient shadows rather than stark drop shadows. This preserves daylight readability and keeps the interface professional.

- **Level 0 (Flat)**: Baseline canvas at `#F8FAFC` without shadow.
- **Level 1 (Card Rest)**: Cards sit on `#FFFFFF` bordered by a crisp `1px solid #E2E8F0` hairline border and supported by an ultra-diffused shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Dropdowns & Popovers)**: Active menus, filter flyouts, and floating transaction badges use `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.
- **Level 3 (Modal / Receipt Scanner Overlays)**: Full-page bottom sheets, scanner previews, and account switchers employ `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04)` over a 40% deep slate backdrop scrim.

## Shapes
A roundedness level of `2` provides a friendly yet structured appearance:

- Standard input fields, actionable list cards, and segmented balance controls use base roundedness (`0.5rem` / `8px`).
- Analytical dashboard widgets, ledger summary cards, and bottom sheets adopt large roundedness (`1rem` / `16px`).
- Receipt preview thumbnails, transaction icons, and category glyph backgrounds adopt extra-large roundedness (`1.5rem` / `24px`).
- Payment method chips (Cash, PayPal, Stripe), filter tags, and operational badges default to full pill radius (`9999px`) to distinguish categorical metadata from primary card containers.

## Components

### Buttons
- **Primary**: Solid Deep Slate Navy (`#0F172A`) with pure white text, `0.5rem` radius, 44px minimum touch target, paired with `Inter SemiBold` 14px.
- **Secondary**: Clear surface with a hairline slate border (`#CBD5E1`) and navy typography. On hover or press, transitions to `#F1F5F9`.
- **Destructive**: Rose background (`#FFE4E6`) with `#E11D48` text for non-reversible ledger deletions or reconciliation discards.

### Status Pills & Payment Method Tags
- Status pills utilize a pill radius (`9999px`), `space-xs` vertical and `space-sm` horizontal padding, paired with `label-sm` typography:
  - **Cash**: `#ECFDF5` emerald surface with `#047857` text.
  - **PayPal**: `#EFF6FF` soft blue surface with `#1D4ED8` text.
  - **Pending / Unreconciled**: `#FEF3C7` warm amber surface with `#B45309` text.
  - **Expense**: `#FFF1F2` soft rose surface with `#BE123C` text.

### Receipt Badges
- Miniature indicators affixed to transaction rows displaying paper receipt states.
- Reconciled receipts show an emerald document icon with a subtle micro checkmark badge. Unattached transactions show a dashed slate pill prompting user attachment.

### Lists & Ledger Rows
- Each transaction row spans full card width with an icon container (rounded `0.75rem`), two-line metadata (Merchant / Category and Account / Date), and right-aligned amount displays.
- Amounts utilize tabular numerals with credit figures in `#059669` prefixed by `+` and debit figures in `#0F172A` (or `#E11D48` if flagged) prefixed by `-`.

### Input Fields
- Form elements use `#FFFFFF` background, `1px solid #CBD5E1` resting border, and `0.5rem` corner radius.
- Numerical fields display persistent currency symbols (`$`, `€`, `£`) anchored to the left in `#64748B`. Focus states replace the border with a 2px ring in deep slate navy (`#0F172A`).

### Cards & Summary Tiles
- White canvas (`#FFFFFF`) with `1rem` corner radius and Level 1 elevation.
- Net balance and cashflow cards incorporate subtle top accents or muted background gradients transitioning from pure white to `#F8FAFC`.

### Data Visualization Charts
- Financial sparklines and cash flow bar charts use crisp geometric curves without drop shadows.
- Inflow vectors use solid `#059669`, expense trend lines utilize `#E11D48`, and baseline project lines remain neutral slate `#94A3B8` with 1.5px stroke width. Vertical grid lines remain unobtrusive at 1px `#F1F5F9`.