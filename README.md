# IRM Control Tower

Internal dashboard / "control tower" web app for a Natural Resources business unit.
Frontend (React + TypeScript + Ant Design + Highcharts) and backend (Node + TypeScript + Express, mock data today, **Databricks-ready** tomorrow) live side-by-side in this repo.

```
.
├── backend/        # Node + Express + TS API (mock fixtures now)
├── frontend/       # Vite + React 19 + TS + antd + Highcharts
├── Design Reference/   # Figma screen exports + brand guideline PDFs
└── PLAN.md         # Phase 0 design notes — read this first
```

## Prerequisites

- **Node.js 20+** (developed against 24.x)
- **npm 10+**
- Windows / macOS / Linux all fine

## Quick start

Two terminals:

```bash
# Terminal 1 — API
cd backend
cp .env.example .env
npm install
npm run dev          # http://localhost:4000/api/health
```

```bash
# Terminal 2 — UI
cd frontend
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

The UI proxies API calls to `VITE_API_BASE_URL` (defaults to `http://localhost:4000/api`).

## Scripts

### backend

| Script           | Purpose                              |
|------------------|--------------------------------------|
| `npm run dev`    | tsx watcher, reloads on save         |
| `npm run build`  | type-check + emit `dist/`            |
| `npm start`      | run compiled output                  |
| `npm run lint`   | ESLint over `src/**/*.ts`            |
| `npm run typecheck` | `tsc --noEmit`                    |

### frontend

| Script           | Purpose                              |
|------------------|--------------------------------------|
| `npm run dev`    | Vite dev server                      |
| `npm run build`  | `tsc -b && vite build`               |
| `npm run preview`| serve the production build           |
| `npm run lint`   | ESLint (flat config)                 |

## Architecture at a glance

### Backend layered structure

```
backend/src/
├── routes/         # express routers per resource
├── controllers/    # request/response shaping
├── services/       # business logic
├── repositories/   # data-access seam — mock impl today, Databricks tomorrow
├── mocks/          # deterministic typed fixtures
├── types/          # shared TS types + API envelope helpers
├── middleware/     # errorHandler, zod validators
├── config/         # env loader
├── app.ts          # express app composition
└── server.ts       # listen()
```

The **repository** layer is the swap point. In Phase 5 we will reimplement
each repository against Databricks SQL — controllers and services do not change.
The active implementation is selected by `DATA_SOURCE=mock|databricks` in `.env`.

### Frontend

```
frontend/src/
├── api/            # axios instance + typed client functions
├── components/     # AppShell (Sider + Header + Content), Logo, ...
├── pages/          # finance/, placeholder pages
├── theme/          # design tokens, antd ConfigProvider, fonts
├── types/          # API types
├── routes.tsx      # React Router v6 routes
└── main.tsx        # QueryClient + ThemeProvider + RouterProvider
```

State strategy:

- **Server state** → TanStack Query
- **Per-page filters** → local `useState`
- **Theme (light/dark)** → React Context wrapping antd's `ConfigProvider`
- No Zustand yet — will add only if a real cross-route need appears

### Design system

- Tokens in `frontend/src/theme/tokens.ts` — brand palette is **purple-dominant**, with secondary green / blue / orange used sparingly per the brand guideline.
- Typography uses **Poppins** (Google Fonts) as a close fallback for the licensed corporate typeface. Swap in the official WOFF2 files by editing only `frontend/src/theme/fonts.css` — every other file already references `--font-brand` / the `Poppins` family name.
- The header bar is solid brand purple (no gradients — the brand gradient is reserved for the logo only).

## Roadmap

- **Phase 2** — Mock API endpoints with realistic fixtures across Apr 2025 → Feb 2026.
- **Phase 3** — Build out Finance pages (Overview, Sales, Revenue, Working Capital, Profitability) per `PLAN.md` and the Figma references.
- **Phase 4** — Lint / typecheck / polish.
- **Phase 5 — Databricks integration** — implement `repositories/` against `@databricks/sql`, gated by `DATA_SOURCE=databricks`. Service principal + SQL warehouse setup walkthrough lives here when we get to it.
