# CareGrid.io

**A Unified Digital Platform for Hospital Care, Blood & Organ Coordination**

> **25 modules** · 35 routes · 6 role-based dashboards
> Frontend-only. Every module reads and writes through a service layer that
> mirrors REST, so the Spring Boot backend can be swapped in without touching
> a single component.

```bash
npm install && npm run dev     # → http://localhost:5173
```

Demo password for every account: `Caregrid@2026` — full account list and
sign-in steps in [Getting Started](#getting-started).

---

## All Modules

Detail routes are listed under their parent module.

### Core clinical modules

| # | Module | Route(s) | Service |
|---|---|---|---|
| 1 | Landing Page | `/` | — |
| 2 | Authentication UI | `/login`, `/register`, `/forgot-password` | `AuthService` |
| 3 | Role-Based Dashboard | `/app/dashboard` | `DashboardService` |
| 4 | Patient Management | `/app/patients`, `/app/patients/:patientId` | `PatientService` |
| 5 | Family Portal | `/app/family` | `FamilyService` |
| 6 | Vitals Monitoring | `/app/vitals`, `/app/vitals/:patientId` | `VitalsService` |
| 7 | Ward & Bed Management | `/app/wards` | `WardService` |
| 8 | Organ Matching | `/app/organ/matching` | `OrganService` |
| 9 | Organ Waiting List | `/app/organ/waiting-list` | `OrganService` |
| 10 | Ischemia Monitoring | `/app/organ/ischemia` | `OrganService` |
| 11 | Living Donor Registry | `/app/organ/living-donors`, `/app/organ/donors` | `OrganService` |
| 12 | Smart Blood Bank | `/app/blood/inventory` | `BloodService` |
| 13 | Blood Donor Management | `/app/blood/donors` | `BloodService` |
| 14 | Blood Requests | `/app/blood/requests` | `BloodService` |
| 15 | Emergency Blood SOS | `/app/blood/sos` | `BloodService` |

### Operational modules — latest work

| # | Module | Route(s) | Service |
|---|---|---|---|
| 16 | Pharmacy Overview | `/app/pharmacy` | `PharmacyService` |
| 17 | E-Prescription | `/app/pharmacy/prescriptions`, `/app/pharmacy/prescriptions/:prescriptionId` | `PharmacyService` |
| 18 | Pharmacy Inventory | `/app/pharmacy/inventory` | `PharmacyService` |
| 19 | Pharmacy Safety Alerts | `/app/pharmacy/alerts` | `PharmacyService` |
| 20 | Billing | `/app/billing` | `BillingService` |
| 21 | Invoice Management | `/app/billing/invoices`, `/app/billing/invoices/:invoiceId` | `BillingService` |
| 22 | Insurance Claims | `/app/billing/claims`, `/app/billing/claims/:claimId` | `BillingService` |
| 23 | Digital Discharge | `/app/discharge`, `/app/discharge/:patientId` | `DischargeService` |
| 24 | Notifications | `/app/notifications` | `NotificationService` |
| 25 | Settings | `/app/settings` | `SettingsService` |

**What makes modules 16–25 worth reviewing.** Billing, claims and discharge
are cross-linked: each discharge mirrors its invoice, and both datasets assert
their invariants at load, so the ledgers cannot silently disagree. Discharge
checklists are owner-scoped, settings take an explicit `userId` rather than a
fixed demo user, and the topbar notification popover and the full page share
one role-scoped feed.

### Where the code lives

| Area | Path | Contents |
|---|---|---|
| Domain models | `src/types/` | `billing`, `discharge`, `notifications`, `settings` — status unions and interfaces |
| Business rules | `src/lib/` | `billing`, `discharge`, `format`, `table`, `roles` — pure functions, no React |
| Fictional data | `src/data/mock/` | `billing`, `discharge`, `notifications`, `settings` — each with an import-time assertion guard |
| Service contracts | `src/services/` | REST-shaped interfaces plus the mock implementations they resolve to |
| Module UI | `src/components/billing/`, `settings/`, `notifications/` | Status badges, money breakdown, charts, panels, rows |
| Pages | `src/pages/app/` | One file per route, all lazy-loaded |
| Routes | `src/routes/`, `src/config/app-navigation.ts` | Route tree and role-aware navigation |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React.js 19 (TypeScript) |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| UI components | shadcn/ui · Radix UI · Lucide React |
| Server state | TanStack React Query |
| Client state | Zustand (session + minimal global UI state only) |
| Charts | Recharts |
| Forms | React Hook Form · Zod |

## Repository Scope

This repository is **frontend-only**.

- **Included:** React UI, service abstraction layer with mock data, design
  system, documentation.
- **Not included (developed by teammates):** Java / Spring Boot backend,
  database schemas, and REST API server code.

Nothing in this app performs a real clinical, financial or identity action.
Billing, insurance claims, discharge, medication and vital data are **fictional
demo data**, and every money value is in Bangladeshi Taka (BDT / `৳`).

## Architecture

The frontend follows a clean **service/API abstraction** pattern:

- All features interact with data through a dedicated service layer
  (`src/services`).
- Services currently run on **realistic fictional mock data** for frontend
  development.
- Service interfaces mirror REST-style operations (list / get / create /
  update / delete), so the mock services can later be **swapped for Spring
  Boot REST API clients without changing UI code**.
- Domain models live in `src/types`, pure business rules in `src/lib`, and
  fixtures in `src/data/mock`.

```
React Components (UI)
        |
        v
Service/API Abstraction Layer
        |
        +-- Mock Services (now)
        +-- Spring Boot REST API clients (later)
```

### Demo data integrity

Billing and discharge fixtures are cross-linked, and both mock datasets run an
assertion guard at import time (`assertLedgerIsConsistent` and
`assertDischargeDatasetIsConsistent`). The invariants are:

- `gross − insurance − paid − waived = outstanding`
- A paid invoice has a zero outstanding balance; a draft or cancelled invoice
  carries no payment or coverage.
- A claim's claimed amount equals its linked invoice's gross amount, and a
  settled claim's history ends on its current status.
- A `ready` discharge has complete documentation, no open required checklist
  items, a settled balance and no outstanding coordination items.

If a fixture is edited and breaks one of these rules, the app fails loudly at
load rather than showing an inconsistent ledger.

### Design decisions worth knowing

- **Cross-linked ledgers.** A discharge's billing snapshot is generated from
  its invoice, so `gross − insurance − paid − waived = outstanding` holds by
  construction. Editing one without the other fails at load.
- **Owner-scoped checklists.** Each discharge checklist item names its owning
  team, and only that role can close it — a pharmacist cannot tick off a
  doctor's sign-off.
- **Explicit userId in settings.** Profile operations take the session user's
  id rather than reading a fixed demo user, so the same contract works against
  an authenticated backend.
- **One notification feed.** The topbar popover and the full page share a
  single role-scoped React Query feed; read state lives in the browser, not on
  a server.
- **Guards over silent drift.** Where two datasets must agree, the mock asserts
  the invariant at import and throws a specific message rather than rendering
  a wrong number.

## Try the Demo

All modules run on fictional demo data with a shared password:
`Caregrid@2026`. The full sign-in walkthrough and account list are in
[Getting Started](#getting-started).

## Roles and Access

Every account sees only the navigation its role allows, and action buttons
are gated to the roles that own them:

| Role | Sees |
|---|---|
| Doctor / Nurse | Clinical, wards, organ, discharge release |
| Blood bank coordinator | Blood bank modules only |
| Pharmacist | Pharmacy modules only |
| Billing officer | Billing, invoices, claims |
| Patient / family | Dashboard and family portal only |

Role checks live in `src/lib/roles.ts`. They are **rendering affordances for
the demo, not an authorization mechanism** — real RBAC arrives with the
backend.

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18 or newer (`node --version`) |
| npm | 9 or newer, bundled with Node |

No database, API server or environment variables are required. Every module
runs on in-memory fictional demo data.

### Run it locally

```bash
# 1. install dependencies
npm install

# 2. start the development server
npm run dev
```

Vite prints a local URL, usually `http://localhost:5173`. Open it in your
browser. The app loads the public landing page with no login required.

### Sign in

1. Go to `/login`.
2. Pick any demo account below, or type the email manually.
3. Enter the shared password `Caregrid@2026`.
4. You are redirected to `/app/dashboard`, and the sidebar, KPIs and
   notification feed adapt to the selected role.

| Role | Email | Sees |
|---|---|---|
| Doctor | `shahid.hasan@caregrid.io` | Clinical, wards, organ, discharge release |
| Nurse | `ayesha.malik@caregrid.io` | Clinical, wards, organ, discharge release |
| Blood Bank Coordinator | `fatima.noor@caregrid.io` | Blood bank modules |
| Pharmacist | `imran.chowdhury@caregrid.io` | Pharmacy modules |
| Billing Officer | `rana.khan@caregrid.io` | Billing, invoices, claims |
| Patient / Family | `tanvir.ahmed@caregrid.io` | Dashboard and family portal only |

The session is held in a Zustand store with `localStorage` persistence, so
a refresh keeps you signed in. Use the profile menu → **Sign out** to clear
it.

### Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Typecheck (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

### Verify the project is healthy

```bash
npm run lint     # expect: no errors
npm run build    # expect: "built in Xs"
```

If the billing or discharge fixtures ever disagree with each other, the app
fails at load with a specific assertion message rather than rendering a
wrong ledger. See [Demo data integrity](#demo-data-integrity).

### Troubleshooting

| Symptom | Fix |
|---|---|
| `npx.ps1 cannot be loaded because running scripts is disabled` | PowerShell execution policy. Run through `cmd /c npx ...`, or call the binary directly: `& "C:\Program Files\nodejs\node.exe" ".\node_modules\typescript\bin\tsc" -b --noEmit` |
| Port 5173 already in use | Vite picks the next free port automatically; use the URL it prints |
| `Cannot find module '@/components/ui/...'` | Run `npm install` — the `@` alias is resolved by Vite and `tsconfig.app.json`, not by Node |
| Changes not appearing | Confirm the dev server is running and hard-reload the browser |

## Project Structure

```
src/
├── components/          # Reusable UI
│   ├── ui/              # shadcn/ui primitives (via shadcn CLI)
│   ├── common/          # Higher-order: DataTable, PageHeader, KpiCard, states...
│   ├── charts/          # Theme-aware Recharts wrappers
│   ├── billing/         # Money + billing/discharge status presentation
│   ├── settings/        # Settings panels
│   ├── layout/          # App shell: sidebar, topbar, notification centre
│   ├── brand/           # Logo / brand primitives
│   └── theme/           # ThemeProvider (system/light/dark)
├── layouts/             # PublicLayout, AppLayout (sidebar + topbar shell)
├── routes/              # Route tree + lazy route components (public, app)
├── pages/               # Route-level pages grouped by module
│   ├── public/          # Landing, auth, 404
│   └── app/             # Authenticated module pages
├── services/            # Data-access layer (mock APIs, REST-shaped signatures)
├── data/mock/           # Centralized fictional mock data
├── types/               # Domain models + status unions
├── hooks/               # React Query hooks (queries/mutations)
├── store/               # Zustand session + UI store only
├── config/  lib/        # Navigation config; pure business rules
└── App.tsx  main.tsx    # Providers + router + entry
```

## Roadmap

Work is delivered in **6 phases**, each verified before the next begins. All
25 modules in the table above are complete.

| Phase | Scope | Modules |
|---|---|---|
| 1 — Foundation ✅ | Vite + TS scaffold, Tailwind v4, shadcn/ui, React Router, React Query, Zustand, layout & theme, service layer, landing page | 1 |
| 2 — Auth & Dashboard ✅ | Authentication UI and role-based dashboard | 2–3 |
| 3 — Patient-facing ✅ | Patient management, family portal, vitals, ward & bed | 4–7 |
| 4 — Organ coordination ✅ | Organ matching, waiting list, ischemia monitoring, living donor registry | 8–11 |
| 5 — Blood bank ✅ | Smart blood bank, blood donor management, blood requests, emergency SOS | 12–15 |
| 6 — Clinical & admin ✅ | Pharmacy overview, e-prescription, inventory, safety alerts, billing, invoices, claims, digital discharge, notifications, settings | 16–25 |

**Next:** swap the mock services for Spring Boot REST clients with the same
interfaces, and move role checks from the UI to server-side enforcement.

## Team

| Role | Developer | GitHub |
|---|---|---|
| Frontend Developer | **Zafar Muhammad Amran** (`amransuui`) | [@JakariaShrabon](https://github.com/JakariaShrabon) |
| Backend (Spring Boot) | Team — developed separately | — |

Repository: <https://github.com/JakariaShrabon/CareGrid>
Active branch: `Zafar-Muhammad-Amran`

