# AGENTS.md

## Project: CareGrid.io — frontend repo (only)

Unified digital platform for hospital care, blood & organ coordination. This repo contains **only the frontend**. Backend is developed separately by teammates with Spring Boot.

- **Never add Java, Spring Boot, database, or backend code here.**
- Do not commit mock data inside components; all data flows through a service/API abstraction layer so mock services can later be swapped for Spring Boot REST clients with the same interface.
- Build the app **phase by phase** — one feature/module at a time, verified before moving on. Do not generate the whole application in one pass.

## Stack

React.js · TypeScript · Vite · Tailwind CSS · React Router · shadcn/ui · Lucide React · Recharts · React Hook Form · Zod

## Architecture rules

- Every feature reads/writes through a service layer (e.g. `src/services`). Components never call HTTP endpoints or inline hardcoded data directly.
- Service interfaces should mirror likely REST endpoints (list/get/create/update/delete) so the Spring Boot swap-in is mechanical.
- Mock data must be realistic fictional data (realistic names, clinical values, formatting) suitable for a university lab demo.

## Module inventory

Landing page · Auth UI · Role-based dashboard · Patient management · Family portal · Organ matching · Organ waiting list · Ischemia monitoring · Living donor registry · Smart blood bank · Blood donor management · Emergency blood SOS · Ward & bed management · E-prescription · Pharmacy inventory · Billing · Insurance claims · Digital discharge

## Conventions

- Add new shadcn/ui components with `npx shadcn@latest add <name>` — never hand-write them into `src/components/ui`.
- Keep components in `src/components`, pages/routes in `src/pages`, shared data access in `src/services`.
- Imperial-free, professional and accessible UI; forms: React Hook Form + Zod validation.

## Commands

Baseline is a Vite React-TS scaffold; standard `npm` scripts otherwise apply:
- `npm run dev` — dev server
- `npm run build` — production build
- `tsc --noEmit` — typecheck (not wired into `npm run build` by default; run it)
- `npm run lint` — lint before submitting changes

If a `package.json` exists, trust its scripts over these defaults.