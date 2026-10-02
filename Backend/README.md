# CareGrid Healthcare Management System - Backend API

A complete Node.js Express backend with Neon PostgreSQL database connection and interactive Swagger UI documentation for testing and verifying GET, POST, PUT, and DELETE APIs.

---

## 🚀 Quick Start

### 1. Run Backend Alone
Open a terminal in `Backend` (or from the project root):
```bash
# From root directory:
npm run dev:backend

# Or from Backend directory:
cd Backend
npm run dev
```

The server starts at `http://localhost:5000`.

### 2. Run Both Backend and Frontend Together (Single Command)
From the project root:
```bash
npm run dev:all
```
This runs:
- **Backend**: `http://localhost:5000` (API & Swagger)
- **Frontend**: `http://localhost:5173` (Vite React app)

---

## 📖 Swagger API Documentation
Open your browser and navigate to:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

From the Swagger UI, you can interactively test and check:
- **GET APIs**:
  - `GET /api/patients` - List all patients (supports query filter by status, department, search)
  - `GET /api/patients/{id}` - Get patient details by ID
  - `GET /api/vitals` - List all recorded vitals
  - `GET /api/vitals/patient/{patientId}` - Get vitals for a patient
  - `GET /api/wards/wards` - List all hospital wards
  - `GET /api/wards/beds` - List beds (filter by status or ward)
  - `GET /api/blood/inventory` - Check blood bank stock
  - `GET /api/blood/requests` - List transfusion requests
  - `GET /api/pharmacy/medicines` - List pharmacy stock
  - `GET /api/pharmacy/prescriptions` - List prescriptions
  - `GET /api/billing` - List all billing invoices
  - `GET /api/billing/{id}` - Get invoice by ID
  - `GET /api/organs` - List available organ donations
  - `GET /api/timeline/patient/{patientId}` - Patient care timeline
  - `GET /api/notifications` - System alerts & notifications
  - `GET /api/auth/users` - Registered users

- **DELETE APIs**:
  - `DELETE /api/patients/{id}` - Delete patient & free bed
  - `DELETE /api/vitals/{id}` - Delete vitals entry
  - `DELETE /api/wards/beds/{id}` - Delete bed
  - `DELETE /api/blood/requests/{id}` - Delete blood request
  - `DELETE /api/pharmacy/medicines/{id}` - Remove medicine from inventory
  - `DELETE /api/pharmacy/prescriptions/{id}` - Delete prescription
  - `DELETE /api/billing/{id}` - Delete invoice
  - `DELETE /api/organs/{id}` - Delete organ donor record
  - `DELETE /api/timeline/{id}` - Delete timeline event
  - `DELETE /api/notifications/{id}` - Delete notification
  - `DELETE /api/auth/users/{id}` - Delete user

- **POST & PUT APIs**:
  - Create & Update patients, record vitals, register medicines, create bills, register users, and authenticate with JWT.

---

## 🗄️ Database (Neon PostgreSQL)
Connection string is configured in `.env`:
```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_eNu0zE5WlcYp@ep-old-lab-b536l99o-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=caregrid-secret-key-2026-secure-jwt
CORS_ORIGIN=*
```

### Auto Schema & Seeding
The backend automatically verifies and creates all tables on startup and seeds initial sample records if empty:
```bash
npm run db:init
```

---

## 📂 Project Structure
```
Backend/
├── .env
├── .env.example
├── package.json
├── server.js               # Express application entrypoint
├── README.md
└── src/
    ├── config/
    │   ├── db.js          # Neon PostgreSQL pool setup
    │   ├── initDb.js      # Table definitions & seed data
    │   └── swagger.js     # OpenAPI 3.0 / Swagger UI definition
    ├── controllers/       # Route business logic (patients, vitals, billing, etc.)
    ├── middleware/        # JWT authMiddleware & global errorHandler
    └── routes/            # REST API endpoints
```
