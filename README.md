# 🏥 MediCare Smart Queue Hospital System

A secure, role‑based administration and appointment queue system for managing hospital staff, departments, doctor availability, patient bookings, and weekly analytics. Built with a focus on data integrity, transaction safety, clean architecture, and serverless-ready deployment.

![Admin Dashboard Screenshot](screenshots/dashboard.png)  <!-- Place screenshot in screenshots/dashboard.png -->

---

## 🚀 Features

- **Staff Management** – Full CRUD over Admins, Doctors, and Receptionists, including secure account creation and deactivation.
- **Cascade Deactivation** – Deactivating a staff member automatically cancels all future appointments in a single atomic database transaction.
- **Doctor Role‑Change Cascade** – Changing a doctor's role to a non-doctor role (admin, receptionist, patient) automatically cancels all their future scheduled appointments and unassigns them as department heads inside a secure Mongoose transaction.
- **Department Management** – Create departments, assign heads, and enforce dependency-guard deactivation (blocked if active staff or heads exist).
- **Time Slots & Timezone Alignment** – Robust doctor availability generation aligned to Egyptian local time (`Africa/Cairo`) to resolve timezone shifts.
- **Doctor Time Blocking** – Doctors can lock specific dates/times (e.g. meetings, breaks) to prevent patient bookings, with async error feedback.
- **Receptionist Queue & Appointment Booking** – Centralized management of today's queue, appointment creation for active patients, and status tracking (scheduled, attended, no-show, cancelled).
- **Real‑Time Analytics** – Weekly stats, attendance rates, and trends rendered with **Recharts** and refreshed via REST polling.
- **Secure Authentication** – JSON Web Tokens (access + refresh) stored in HTTP‑only, SameSite=Strict cookies with refresh token rotation.
- **Production‑Hardened** – Helmet, CORS, input sanitisation (mongo-sanitize), and rate limiting on login/refresh endpoints (loosened in development).

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Axios, Recharts, React Router DOM 7 |
| **Backend** | Express 5, Mongoose 9 (Node.js) |
| **Database** | MongoDB (local Docker replica set for dev transactions, Atlas replica set for prod) |
| **Auth** | JWT (bcryptjs, HTTP‑only cookies, refresh rotation) |
| **Real‑time** | REST polling — no Socket.IO |
| **Dev Tools** | ESLint + oxlint, eslint‑plugin-boundaries |

---

## 📁 Architecture

```text
NHA-4-161/
├── src/                    # React frontend (Vite + Tailwind v4)
│   ├── app/                # Main SPA entry & routing
│   ├── components/         # Shared frontend components (ProtectedRoute, Modal, Toast)
│   ├── context/            # AuthContext (session restore & interceptors)
│   ├── features/           # Feature modules: auth, dashboard, staff, departments, doctor-dashboard, patient-dashboard, receptionist
│   ├── hooks/              # Custom React hooks (useForm, useDarkMode)
│   └── services/           # Axios API services (api.js, patientApi.js, receptionistApi.js)
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database connection configuration
│   │   ├── controllers/    # Route controllers & rules validation
│   │   ├── middleware/     # Authentication & authorization guards
│   │   ├── models/         # Mongoose schemas: User, Department, Appointment, BlockTime
│   │   ├── routes/         # REST API routers
│   │   ├── services/       # Services layer & transaction cascades (staffService, departmentService)
│   │   ├── tests/          # Integration & cascade tests
│   │   └── utils/          # JWT signing utilities
│   └── seed.js             # Egyptian database seed script
├── docker-compose.yml      # Local MongoDB replica set container config
└── vercel.json             # SPA rewrites & Vercel deployment configuration
```

---

## ⚙️ Getting Started (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [Docker](https://www.docker.com/) (for local MongoDB replica set transactions)
- npm (comes with Node)

### 1. Clone the Repository

```bash
git clone https://github.com/nhahub/NHA-4-161.git
cd NHA-4-161
```

### 2. Start the Local MongoDB Replica Set

```bash
docker-compose up -d
```
This launches a single‑node replica set on `localhost:27017` with auto-initialization (`rs0`).

### 3. Install Dependencies

```bash
# Install root (Frontend) dependencies
npm install

# Install server (Backend) dependencies
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in `server/` (use `server/.env.example` as a template):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medicare?replicaSet=rs0
JWT_ACCESS_SECRET=your_jwt_access_secret_string
JWT_REFRESH_SECRET=your_jwt_refresh_secret_string
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```
No environment variables are needed for the frontend — Vite’s dev proxy forwards `/api` requests to `localhost:5000`.

### 5. Seed the Database

Run the seed script from the `server/` directory to clear old records and populate clean, linked Egyptian clinical test records (all roles, 12 appointments, 2 block times, and 6 departments):

```bash
cd server
node seed.js
```
*Note: All seeded users are configured with the password `Mediacare12345!`.*

### 6. Start the Development Servers

```bash
# Terminal 1: Backend Server (from server/ directory)
npm run dev       # Runs nodemon src/index.js

# Terminal 2: Frontend Client (from root directory)
npm run dev       # Runs Vite on http://localhost:5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Deployment

### Frontend (Vercel)
The client builds as a static SPA. `vercel.json` proxies all `/api/*` traffic to the backend host to maintain cookie security.

### Backend (Railway/Render)
Deploys as an Express application. Ensure your host supports CORS matching your frontend origin, cookies same-site configuration, and has `NODE_ENV=production`.

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Log in, sets cookie tokens |
| POST | `/auth/refresh` | Rotate JWT refresh tokens |
| POST | `/auth/logout` | Revoke session & clear cookies |
| GET | `/auth/me` | Fetch active user profile session |

### Staff Management (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/staff` | List staff members (`role` filter accepts `admin`, `doctor`, `receptionist`, `patient`) |
| POST | `/staff` | Register a new staff member |
| PUT | `/staff/:id` | Update staff details |
| DELETE | `/staff/:id` | Soft-delete staff member (cascades to future appointments) |

### Departments (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/departments` | List all departments |
| POST | `/departments` | Create a department |
| PUT | `/departments/:id/reassign-head` | Change department head |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/appointments/availability` | Fetch availability slots on a date |
| POST | `/appointments` | Book an appointment slot |
| PUT | `/appointments/:id` | Update appointment details/status |

---

## 🧪 Running Tests

Verify the cascade deactivation and role-change transaction logic using Node's native test runner:

```bash
cd server
npm test
```

---

## 📜 License

This project is licensed under the MIT License.
