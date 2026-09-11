# Project guide

Dashboard "control tower" web app — a React 19 + TS frontend and a Node + TS + Express
backend. Runs on deterministic mock data today, with a clean seam to swap in a Databricks
backend later. Product name in UI/copy: **IRM Control Tower**.

## Architecture

- `frontend/` — Vite + React 19 + TS, antd, Highcharts, axios, TanStack Query.
- `backend/` — Node + TS + Express + zod. Layered: routes → controllers → services →
  repositories, with a mock repository implementation.
- **The repository layer is the abstraction seam.** Controllers and services must keep
  working unchanged when the data source swaps from mocks to Databricks
  (`DATA_SOURCE=mock|databricks`, planned). Do not leak data-source specifics upward.
- Mock fixtures are deterministic and span roughly Apr 2025 → Feb 2026.

## Hard conventions

### 1. No brand name anywhere in the code
The client's brand name must **never** appear in identifiers, file names, CSS classes,
variables, comments, UI copy, README, or commit messages. Use neutral names:
`--brand-purple` (not the brand), `BrandLogo`, product name "IRM Control Tower".
Logo asset lives at `frontend/src/assets/logo.svg`. Say "brand guidelines" in comments,
not the company name.

**Authorized display-copy exceptions** (brand name allowed *on screen only*, verbatim
from Figma — never in identifiers/files/comments):
- **Market Share** screen: the two chart series and the **Share** filter options are
  labelled with the brand name / "Non-<brand>". These live in a single display constant
  (data keys stay `own` / `nonOwn`) and in `SHARE_LIST` in `mocks/catalog.ts`.
- **Debtors** screen (Finance): sample customer names in the mock book
  (`frontend/src/mocks/finance/debtors.ts`, `SEED_CUSTOMERS`) may include the brand name
  as display data.

Do not "fix" or strip the brand strings in those two authorized spots. Everywhere else,
the no-brand-name rule holds unless the user authorizes a new exception.

### 2. Colors come only from `theme/tokens.ts`
No color literal (`#hex`, `rgb(...)`, `rgba(...)`) may appear in any component, page, or
chart-helper file. `frontend/src/theme/tokens.ts` is the single source of truth.
- Components read theme-aware colors via `useBrandTokens()`.
- Static helpers / column builders / chart-option builders import `brand`, `chartPalette`,
  `donutColors`, etc. directly from `tokens.ts`.
- New color → add it to `tokens.ts` first (reuse an existing `brand.*` token if it matches),
  then reference it. New module palettes follow the `marketingColors` / `logisticsColors`
  named-export pattern.
- Verify: `grep -rn '#[0-9a-fA-F]\{3,8\}\|rgba\?(' <files>` returns nothing outside `tokens.ts`.

### 3. Stack is strict
antd + Highcharts (**not** Recharts/Chart.js), Express, zod. Zustand only if clearly
justified. Currency/units shown as "Cr" / "MMT" / "Days" with the full raw value in an
antd Tooltip on hover. Font: Poppins as the fallback for the licensed brand font; the
`--font-brand` variable exists so swapping in the official WOFF2 is a one-line change.

### 4. Design source of truth
Brand guidelines override Figma when they conflict (e.g. the gradient is logo-only; the
header bar must be solid purple even though Figma shows a gradient). See `PLAN.md` for the
phased build and the Figma screen inventory.
