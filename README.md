# CareGrid.io

## A Unified Digital Platform for Hospital Care, Blood & Organ Coordination

CareGrid.io is a modern healthcare management frontend designed to provide a unified digital interface for hospital operations, patient care, blood bank coordination, organ donation workflows, pharmacy management, billing, discharge, notifications, and role-based dashboards.

**Frontend Developer:** Zafar Muhammad Amran  
**GitHub:** https://github.com/amransuui  
**Backend:** Not implemented yet — planned for future Spring Boot REST API integration.

---

## 🌐 Live Demo

**Live Website:**  
https://care-grid-healthcare-management-sys.vercel.app/

---

## 📦 GitHub Repository

https://github.com/amransuui/CareGrid-Healthcare-Management-System

---

# 📋 Project Overview

CareGrid.io is a frontend-first healthcare management system built with modern React technologies.

The application provides professional interfaces for different healthcare roles and covers major hospital workflows including:

- Patient Management
- Family Portal
- Vitals Monitoring
- Ward & Bed Management
- Organ Matching
- Organ Waiting List
- Ischemia Monitoring
- Living Donor Registry
- Smart Blood Bank
- Blood Donor Management
- Blood Requests
- Emergency Blood SOS
- Pharmacy Management
- E-Prescription
- Pharmacy Inventory
- Pharmacy Safety Alerts
- Billing
- Invoice Management
- Insurance Claims
- Digital Discharge
- Notifications
- Settings
- Role-Based Dashboards

---

# 🚀 Features & Modules

| # | Module | Routes |
|---|---|---|
| 1 | Landing Page | `/` |
| 2 | Authentication | `/login`, `/register`, `/forgot-password` |
| 3 | Role-Based Dashboard | `/app/dashboard` |
| 4 | Patient Management | `/app/patients`, `/app/patients/:patientId` |
| 5 | Family Portal | `/app/family` |
| 6 | Vitals Monitoring | `/app/vitals`, `/app/vitals/:patientId` |
| 7 | Ward & Bed Management | `/app/wards` |
| 8 | Organ Matching | `/app/organ/matching` |
| 9 | Organ Waiting List | `/app/organ/waiting-list` |
| 10 | Ischemia Monitoring | `/app/organ/ischemia` |
| 11 | Living Donor Registry | `/app/organ/living-donors`, `/app/organ/donors` |
| 12 | Smart Blood Bank | `/app/blood/inventory` |
| 13 | Blood Donor Management | `/app/blood/donors` |
| 14 | Blood Requests | `/app/blood/requests` |
| 15 | Emergency Blood SOS | `/app/blood/sos` |
| 16 | Pharmacy Overview | `/app/pharmacy` |
| 17 | E-Prescription | `/app/pharmacy/prescriptions`, `/app/pharmacy/prescriptions/:prescriptionId` |
| 18 | Pharmacy Inventory | `/app/pharmacy/inventory` |
| 19 | Pharmacy Safety Alerts | `/app/pharmacy/alerts` |
| 20 | Billing | `/app/billing` |
| 21 | Invoice Management | `/app/billing/invoices`, `/app/billing/invoices/:invoiceId` |
| 22 | Insurance Claims | `/app/billing/claims`, `/app/billing/claims/:claimId` |
| 23 | Digital Discharge | `/app/discharge`, `/app/discharge/:patientId` |
| 24 | Notifications | `/app/notifications` |
| 25 | Settings | `/app/settings` |

---

# 🛠️ Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router v7

## UI

- shadcn/ui
- Radix UI
- Lucide React

## State & Data

- TanStack React Query
- Zustand

## Visualization

- Recharts

## Forms & Validation

- React Hook Form
- Zod

---

# 🏗️ Architecture

CareGrid.io follows a frontend-first architecture.

```text
React UI
    ↓
Pages & Components
    ↓
Services / API Abstraction
    ↓
Mock Data
    ↓
Future Spring Boot REST API
```

The service layer separates UI components from data access so that the current mock implementation can later be replaced by Spring Boot REST APIs without major UI restructuring.

---

# 🔌 Backend Status

The current implementation is **frontend-only**.

The Spring Boot backend has **not been implemented yet**.

The frontend has been structured so that a future Spring Boot REST API can be integrated through the existing service/API abstraction layer.

---

# 👨‍💻 Developer

## Zafar Muhammad Amran

**Role:** Frontend Developer

**GitHub:**  
https://github.com/amransuui

**Repository:**  
https://github.com/amransuui/CareGrid-Healthcare-Management-System

The current frontend implementation of CareGrid.io was developed and maintained by **Zafar Muhammad Amran**.

---

# 📊 Demo Data

The project uses mock healthcare data for demonstrating frontend workflows.

The application does not perform real clinical, financial, identity, or medical operations.

All displayed healthcare information is demonstration data.

---

# 🔐 Demo Accounts

**Demo Password:**

```text
Caregrid@2026
```

| Role | Demo Account |
|---|---|
| Doctor | shahid.hasan@caregrid.io |
| Nurse | ayesha.malik@caregrid.io |
| Blood Bank Coordinator | fatima.noor@caregrid.io |
| Pharmacist | imran.chowdhury@caregrid.io |
| Billing Officer | rana.khan@caregrid.io |
| Patient / Family | tanvir.ahmed@caregrid.io |

---

# 💻 Requirements

- Node.js 18 or higher
- npm 9 or higher

Check installed versions:

```bash
node --version
npm --version
```

---

# ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/amransuui/CareGrid-Healthcare-Management-System.git
```

Enter the project directory:

```bash
cd CareGrid-Healthcare-Management-System
```

Install dependencies:

```bash
npm install
```

---

# ▶️ Run Development Server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173/
```

---

# 🏭 Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# 🧹 Lint

Run ESLint:

```bash
npm run lint
```

---

# 📁 Project Structure

```text
CareGrid/
├── public/
├── src/
│   ├── components/
│   ├── config/
│   ├── data/
│   │   └── mock/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── store/
│   └── types/
├── .env.example
├── AGENTS.md
├── README.md
├── VERIFICATION.md
├── components.json
├── index.html
├── package.json
└── vite.config.ts
```

---

# 🔄 Development Approach

The project follows a modular frontend architecture with:

- Reusable React components
- Type-safe TypeScript
- Responsive UI
- Role-based navigation
- Service/API abstraction
- Mock data separation
- Form validation
- Consistent design system
- Maintainable routing structure

---

# 🛣️ Future Development

The next major development phase is backend integration.

Planned improvements include:

1. Spring Boot REST API
2. Database integration
3. Real authentication
4. Server-side role authorization
5. Persistent patient data
6. Real blood inventory management
7. Real organ donor workflows
8. Pharmacy backend
9. Billing backend
10. Insurance claim processing
11. Notification services
12. Production security and auditing

---

# 📌 Project Status

**Current Status:** Frontend implementation completed

**Backend Status:** Not implemented yet

**Deployment:** Live on Vercel

**Live URL:**  
https://care-grid-healthcare-management-sys.vercel.app/

---

# 📄 License

This project is developed for academic and demonstration purposes.
