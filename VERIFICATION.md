# CareGrid.io — Feature Verification Checklist

Frontend demo checklist covering all 10 core modules (Zafar branch).

Shared demo password for every account: `Caregrid@2026`

| Role | Login email |
|---|---|
| Doctor | `shahid.hasan@caregrid.io` |
| Nurse | `ayesha.malik@caregrid.io` |
| Blood Bank Coordinator | `fatima.noor@caregrid.io` |
| Pharmacist | `imran.chowdhury@caregrid.io` |
| Billing Officer | `rana.khan@caregrid.io` |
| Patient / Family | `tanvir.ahmed@caregrid.io` |

## Login & role checks

- [ ] Wrong password shows an error, no session created
- [ ] `shahid.hasan@caregrid.io` / `Caregrid@2026` lands on `/app/dashboard` with the full sidebar (all groups)
- [ ] `tanvir.ahmed@caregrid.io` / `Caregrid@2026` sees only Dashboard, Family Portal, Notifications
- [ ] Logged-out visiting `/app/patients` redirects to `/login`
- [ ] Logged-in visiting `/login` bounces to `/app`

## 1–4 Clinical core

- [ ] Landing `/` renders hero + sections, no white screen
- [ ] Dashboard `/app/dashboard` -> KPI cards + admissions/discharges chart + alerts
- [ ] Patients `/app/patients` -> search, filters (status/ward/doctor), sort, pagination
- [ ] Patient detail `/app/patients/P-2026-1054` -> identity, ward/bed, care team, meds, timeline

## 5 Family portal

- [ ] As `tanvir.ahmed@caregrid.io`, `/app/family` shows Farzana's read-only care snapshot
- [ ] Latest vitals, upcoming care, billing summary, discharge status, notifications all render
- [ ] No edit/add controls visible (read-only)
- [ ] As a doctor, a "demo preview" banner shows; content still visible

## 6–9 Organ care

- [ ] Matching `/app/organ/matching` -> ranked candidates, filters, detail drawer with score
- [ ] Waiting list `/app/organ/waiting-list` -> priority, organ, blood group, status badges, update action
- [ ] Ischemia `/app/organ/ischemia` -> ticking CIT timers, safe/expiring/critical colors
- [ ] Living donors `/app/organ/living-donors` -> 4 KPI cards; sortable headers incl. Availability; filter + search; drawer opens

## 10 Blood bank

- [ ] Inventory `/app/blood/inventory` -> 8x4 matrix, Safe/Low/Critical bands; `O-`/`AB-` rows show valid expiry
- [ ] Donors `/app/blood/donors` -> statuses incl. `donated_recently` (56-day rule), drawer
- [ ] Requests `/app/blood/requests` -> urgency + status workflow badges
- [ ] SOS `/app/blood/sos` -> units secured vs required, broadcast states

## Extras

- [ ] Vitals `/app/vitals/:patientId`, Wards `/app/wards`, Pharmacy `/app/pharmacy/prescriptions` load
- [ ] Billing/Insurance/Discharge sidebar links -> friendly "coming in next phase" page, not 404