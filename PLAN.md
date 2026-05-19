# Dashboard Control Tower — Plan (Phase 0)

> Brand: **adani | Natural Resources** — "IRM Control Tower"
> User chrome: notifications bell, theme toggle (light/dark), user avatar ("Hemil Mistry")

## 1. Design reference inventory

Six Figma exports were provided in `Design Reference/`, plus 4 brand-guideline pages in `Design Reference/Brand Guidelines/`:

| # | Screen | Purpose |
|---|--------|---------|
| 1 | Finance Overview | KPI grid + Forex Movement widget |
| 2 | Revenue (breakdown) | Segment cards + donut + ledger table |
| 3 | Gross Margin Profitability — Port wise | Column chart by port + vessel table |
| 4 | Gross Margin Profitability — Segment wise | Column chart by segment + vessel table |
| 5 | Working Capital | Same shape as Revenue (segment cards + donut + ledger table) |
| 6 | Sales Overview | Portwise (horizontal bar) + Zonewise + Segmentwise (grouped columns) |

### Common shell
- **Left Sider (collapsible):** Finance (expanded → Overview, Sales, Approved Budget), Logistics, Marketing, Legal, Planning, Sourcing, Customs, Commercial.
- **Top bar:** purple→blue gradient header with `adani | Natural Resources` lockup, bell, theme toggle, user menu.
- **Page header:** breadcrumb + screen title + right-aligned filters (Port / Segment / Date Range as relevant).
- **Background:** very light gray; cards are white with soft shadows and rounded corners.

### Per-screen details

**Screen 1 — Finance / Overview**
- 2×3 grid of KPI cards: Revenue (970 Cr, ▲12%), Sales (5.1 MMT, ▼7%), Profitability (114 Cr, ▲8%), Working Capital (970 Cr, ▲12%), Dispatch (5.1 MMT, ▼7%), Inventory Days (24, ▲8%).
- Each card: icon badge, "open" external-link icon, value, unit, **inline sparkline**, "vs last week" delta.
- Right column: **Forex Movement** card — line chart Mon→Sun with range dropdown ("All"), plus Exchange Rate + Month Average summary tiles below.
- Filter: Date Range.

**Screen 2 — Finance / Revenue**
- Section "Revenue Breakdown": four mini cards (SNS 86.6 Cr, SEB 24.5 Cr, TPH 4.6 Cr, Sagarmala 54.9 Cr) on the left; donut on the right showing Total 170 Cr with tooltip on hover (e.g. SNS 28% / 86.6 Cr).
- Section: search + ledger table — columns: Company Code, Account Number, Profit Centre, Segment, Grouping, Debit, Credit.
- Filters: Port, Date Range.

**Screen 3 — Gross Margin Profitability (Port wise)**
- Tabs: **Port wise** | Segment wise.
- Column chart "Port Wise Analysis" — one bar per port with value labels.
- Vessel table: Batch ID, Vessel, Grade, Origin, Port, Segment, Profit.
- Filters: Port, Date Range.

**Screen 4 — Gross Margin Profitability (Segment wise)**
- Same as Screen 3 but Segment-wise column chart (TPH, SNS, SEB, Sagarmala, Old). Filter: **Segment** (instead of Port). Profit column shows negative values in parentheses.

**Screen 5 — Working Capital**
- Identical layout to Screen 2 but titled "Working Capital". Same breakdown cards + donut + ledger table.

**Screen 6 — Sales Overview**
- Title: "Sales Overview", filter: Date Range.
- **Portwise** card (left, tall): horizontal bar chart — one row per port (Krishnapatnam, Paradip, Hazira, Gangavaram, Dahej, Dhamra, Mundra, Navlakhi, TUNA, Karaikal, Gopalpura) with **two grouped bars per port** (Budget — light blue, Actual — navy). Value labels in MMT next to each bar.
- **Zonewise** card (right top): vertical grouped column chart — Zone 1…Zone 6 on the x-axis, y-axis in "1000 metric tons (MT)" (0–500k). Two series: Budget (light blue), Actual (purple).
- **Segmentwise** card (right bottom): vertical grouped column chart — segments on the x-axis, two series Budget (light blue) / Actual (navy).

### Not designed (in-app placeholders only)
- Approved Budget sub-page
- Logistics, Marketing, Legal, Planning, Sourcing, Customs, Commercial sections — sidebar entries exist, page bodies will render a friendly "Coming soon" placeholder.

### Brand guidelines (extracted from `Design Reference/Brand Guidelines/`)
- **Primary palette:** Purple (the dominant Adani colour — given prominence), Grey, White, Black.
- **Secondary palette:** Green, Blue, Orange — for accents and to break monotony in body copy/mnemonics.
- **Gradient:** the Adani purple→blue gradient is **reserved for the Adani logo only**. The Figma exports apply it to the header bar — we will **not** follow the Figma here. Header bar will be **solid Adani purple**. No gradients on text, icons, backgrounds, or buttons anywhere in the app.
- **Typography:** the official brand font is a licensed corporate typeface not available on the web. Closest free match is **Poppins** (geometric sans-serif with matching Light / Regular / Medium / SemiBold / Bold weights). Loaded via Google Fonts initially. CSS exposes a `--font-brand` variable so swapping in the official WOFF2 files later is a one-line change in `frontend/src/theme/fonts.css` — no other code touches the font name.
- **Conflict-resolution rule:** when Figma and brand guidelines disagree, **brand guidelines win**.
- **Naming rule:** the brand name does **not** appear anywhere in the codebase — not in variable names, CSS classes, file names, comments, copy, or commit messages. The product is referred to as **"IRM Control Tower"** (or just "Control Tower"); brand-specific design tokens are namespaced `--brand-*`.
- Tokens captured for code (to be pinned by sampling the guideline swatches during scaffolding):
  - `--brand-purple: #5E267F` (primary — dominant)
  - `--brand-purple-dark: #3A1A57`
  - `--brand-grey: #6B6B6B`
  - `--brand-black: #000000`
  - `--brand-white: #FFFFFF`
  - Secondary (used sparingly to break monotony): `--brand-green`, `--brand-blue`, `--brand-orange`
  - `--font-brand: "Poppins", system-ui, sans-serif;` (swap to the official font later by editing this one declaration)
  - For Sales chart series we'll use **purple + grey** (or purple + secondary blue) for Budget/Actual rather than Figma's light-blue/navy pairing, since the navy reads as a non-brand colour. To be confirmed during build — I'll show the first chart and let you sign off on the series colours before propagating.
  - Page background: light grey/white; body text: near-black; header bar: solid `--brand-purple` with white text and icons.

## 2. Routes (frontend)

| Path | Page | Source |
|------|------|--------|
| `/` | redirects to `/finance/overview` | — |
| `/finance/overview` | Finance Overview | Screen 1 |
| `/finance/revenue` | Revenue Breakdown | Screen 2 |
| `/finance/working-capital` | Working Capital | Screen 5 |
| `/finance/profitability` | Gross Margin Profitability (tabs) | Screens 3 + 4 |
| `/finance/sales` | Sales Overview | Screen 6 |
| `/finance/approved-budget` | Placeholder | — |
| `/logistics`, `/marketing`, `/legal`, `/planning`, `/sourcing`, `/customs`, `/commercial` | Placeholder | — |
| `*` | 404 | — |

> KPI cards on the Overview link to their detail pages via the external-link icon (Revenue→`/finance/revenue`, Working Capital→`/finance/working-capital`, Profitability→`/finance/profitability`, etc.). Dispatch and Inventory Days will deep-link to placeholders for now.

## 3. API endpoints (mock-backed)

Base path: `/api`. Response envelope: `{ data, meta?, error? }`. All endpoints support optional `dateRange=YYYY-MM-DD:YYYY-MM-DD`.

| Method | Path | Query | Response shape (`data`) |
|--------|------|-------|-------------------------|
| GET | `/health` | — | `{ status: "ok" }` |
| GET | `/finance/overview` | `dateRange?` | `{ kpis: KPI[], forex: ForexResponse }` |
| GET | `/finance/kpis` | `dateRange?` | `KPI[]` |
| GET | `/finance/forex` | `range?=all\|week\|month` | `ForexResponse` |
| GET | `/finance/revenue` | `port?`, `dateRange?` | `{ breakdown: BreakdownItem[], donut: DonutResponse, ledger: LedgerRow[] }` |
| GET | `/finance/working-capital` | `port?`, `dateRange?` | same shape as `/finance/revenue` |
| GET | `/finance/profitability` | `mode=port\|segment`, `port?`, `segment?`, `dateRange?` | `{ chart: ProfitabilityBar[], vessels: VesselRow[] }` |
| GET | `/finance/sales` | `dateRange?` | `{ portwise: BudgetActualRow[], zonewise: BudgetActualRow[], segmentwise: BudgetActualRow[] }` |
| GET | `/filters/ports` | — | `string[]` |
| GET | `/filters/segments` | — | `string[]` |
| GET | `/filters/zones` | — | `string[]` |

Errors use envelope: `{ error: { code, message } }` with appropriate HTTP status.

## 4. Shared TypeScript types

```ts
type Trend = "up" | "down";
type IconKey = "revenue" | "sales" | "profitability" | "workingCapital" | "dispatch" | "inventoryDays";

interface KPI {
  id: IconKey;
  label: string;
  value: number;
  unit: "Cr" | "MMT" | "Days";
  deltaPct: number;          // signed, e.g. -7 or 12
  trend: Trend;
  spark: number[];           // 12-ish points for the sparkline
  href: string;              // deep link path
}

interface ForexPoint { day: string; rate: number; } // "MON"..."SUN" or ISO date
interface ForexResponse {
  points: ForexPoint[];
  exchangeRate: number;
  monthAverage: number;
  range: "all" | "week" | "month";
}

interface BreakdownItem { segment: string; value: number; unit: "Cr"; }
interface DonutResponse { total: number; unit: "Cr"; slices: { segment: string; value: number; pct: number; }[]; }

interface LedgerRow {
  companyCode: string;
  accountNumber: string;
  profitCentre: string;
  segment: string;
  grouping: string;
  debit: number;
  credit: number;
}

interface ProfitabilityBar { category: string; value: number; }

interface BudgetActualRow { category: string; budget: number; actual: number; unit: "MMT" | "MT"; }
interface VesselRow {
  batchId: string;
  vessel: string;
  grade: string;
  origin: string;
  port: string;
  segment: string;
  profit: number; // negative allowed
}

interface ApiEnvelope<T> { data: T; meta?: Record<string, unknown>; error?: { code: string; message: string } }
```

Types live in `backend/src/types/` and are duplicated in `frontend/src/types/` for now (no shared workspace yet — keeps each app self-contained).

## 5. Charts (Highcharts)

| Where | Chart type | Notes |
|-------|------------|-------|
| KPI card sparkline | `areaspline` (gradient fill, no axes, no legend) | green for up, red for down |
| Forex Movement | `spline` | x: weekday categories, y: rate, single series |
| Revenue / Working Capital donut | `pie` with `innerSize: 70%` | tooltip shows segment + % + value |
| Profitability — Port wise | `column` | one series, value labels |
| Profitability — Segment wise | `column` | one series, value labels |
| Sales — Portwise | `bar` (horizontal) | two grouped series: Budget + Actual, data labels in MMT |
| Sales — Zonewise | `column` | two grouped series: Budget (light blue) + Actual (purple), y in 1000 MT |
| Sales — Segmentwise | `column` | two grouped series: Budget + Actual (navy) |

All charts go through a thin `<Chart options={...} />` wrapper that disables `credits`, applies a shared theme (Adani purple/blue palette, system font), and merges defaults.

## 6. State management

**Recommendation: do NOT install Zustand yet.**

- **Server state →** TanStack Query (caches, dedupes, handles loading/error states).
- **Per-page filters (date range, port, segment) →** local `useState` in the page. They don't cross routes in the designs.
- **Theme (light/dark) →** Ant Design `ConfigProvider` switched via a tiny React Context (one boolean). Doesn't justify Zustand.
- **User/auth →** mocked static object for now; no global store needed.

If a need for cross-route shared state appears later (e.g. global "selected port" applied across the Finance section), revisit and add Zustand then.

## 7. Project layout

```
backend/
  src/
    routes/        # express routers per resource
    controllers/   # request/response shaping
    services/      # business logic
    repositories/  # data access; mock impl now, Databricks later
    mocks/         # typed fixtures (deterministic)
    types/         # shared TS types
    middleware/    # errorHandler, validate(zod)
    config/        # env loader
    app.ts
    server.ts
  .env.example
  requests.http
frontend/
  src/
    api/           # axios instance + typed clients
    components/    # Chart, KpiCard, AppShell, etc.
    pages/finance/ # overview, revenue, working-capital, profitability, ...
    pages/placeholder/
    types/
    theme/
    routes.tsx
    main.tsx
```

## 8. Decisions (confirmed)

1. **Sales sub-page** → real page per Screen 6 (Portwise / Zonewise / Segmentwise budget-vs-actual).
2. **Dispatch & Inventory Days KPI cards** → deep-link to placeholder pages (no design yet).
3. **Theme toggle** → fully functional light/dark via Ant Design `ConfigProvider`. Colors and typography pinned to the Figma exports; brand-guideline rules respected (purple is dominant, gradient reserved for header chrome only).
4. **Date range** → mock data seeded across **Apr 2025 → Feb 2026** with per-month variation so the date filter produces visibly different shapes when sliced.
5. **Currency formatting** → keep "Cr" / "MMT" / "Days" in the UI; show the full raw value (with thousands separators) inside an Ant Design `Tooltip` on hover. Applied to KPI cards, breakdown cards, donut tooltips, and `Debit` / `Credit` / `Profit` table cells.

---

**Phase 0 stops here.** Awaiting your green-light to proceed to Phase 1 (scaffolding).
