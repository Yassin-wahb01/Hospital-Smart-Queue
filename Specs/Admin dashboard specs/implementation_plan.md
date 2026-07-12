# Hospital Admin Dashboard — Implementation Plan

## Overview
Building the complete **MediCare Hospital Admin Dashboard** on top of the existing React 19 / Vite 8 / Tailwind v4 client shell. The backend will be a new Node.js / Express server. We follow the **Ponytail Pass** decisions from `tasks.md` exactly — no Redis, no Sockets, polling-only analytics, no `version` field.

The project root (`H:\Projects\Depi GP`) IS the client folder (no `client/` subfolder — the project exists at root). A `server/` folder will be created inside the same root.

---

## Phase 1 — Foundation

### Client (existing root)
#### [MODIFY] [vite.config.js](file:///H:/Projects/Depi%20GP/vite.config.js)
- Add `server.proxy`: `/api` → `http://localhost:5000` so `SameSite=Strict` cookies work during dev.

#### [MODIFY] [package.json](file:///H:/Projects/Depi%20GP/package.json)
- Install `react-router-dom` (missing entirely).
- Install `axios` for the HTTP client.

#### [MODIFY] [eslint.config.mjs](file:///H:/Projects/Depi%20GP/eslint.config.mjs)
- Register `staff`, `departments`, `analytics`, `services`, `context` as recognized boundary domains following the existing `auth/` pattern.

---

### Server (new)
#### [NEW] `server/package.json`
- `npm init -y` + install: `express mongoose dotenv cors cookie-parser helmet express-rate-limit express-validator mongo-sanitize jsonwebtoken bcrypt`
- Dev: `nodemon`

#### [NEW] `server/.env`
- `PORT=5000`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_DOMAIN`

#### [NEW] `server/src/config/db.js`
- Mongoose connection lifecycle with retry logic.

#### [NEW] `server/src/app.js`
- Global middleware: `cors` (credentials: true), `helmet`, `cookie-parser`, `express.json`, `mongo-sanitize`.

#### [NEW] `server/src/index.js`
- Connect DB first, then start HTTP listener.

#### [NEW] `docker-compose.yml`
- Single-node MongoDB replica set (`rs0`).

#### [NEW] Mongoose Models
- `server/src/models/User.js` — all fields per spec, `pre('save')` bcrypt, partial indexes.
- `server/src/models/Department.js` — `name`, `headUserId`, `isActive`, partial index.
- `server/src/models/Appointment.js` — `doctorId`, `departmentId`, `dateTime`, `status`, `isActive`, `deletedAt`, compound indexes.

---

## Phase 2 — Authentication & Authorization

#### [NEW] `server/src/utils/jwt.js`
- `signAccess`, `signRefresh`, `verifyAccess`, `verifyRefresh`.

#### [NEW] `server/src/services/authService.js`
- `login`, `refresh` (rotate `refreshTokenId`), `logout` (clear cookie + `refreshTokenId`).

#### [NEW] `server/src/middleware/authenticate.js`
- Read cookie → verify JWT → attach `req.user`.

#### [NEW] `server/src/middleware/authorize.js`
- `authorize(['admin'])` role check.

#### [NEW] Auth route + controller
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

#### [NEW] `src/context/AuthContext.jsx`
- Session state, `login`/`logout` helpers, calls `GET /auth/me` on load.

#### [NEW] `src/services/api.js`
- Axios instance with `withCredentials: true`, base URL `/api/v1`.

#### [MODIFY] `src/features/auth/SignInForm.jsx`
- Wire to `AuthContext.login()`.

#### [MODIFY] `src/features/auth/AuthPage.jsx`
- Remove mock credentials block; rely on `AuthContext`.

---

## Phase 3 — Staff & Department Management

#### [NEW] `server/src/services/staffService.js`
- `deactivateUser(userId)` wrapped in Mongo transaction (cascade cancel appointments → soft-delete user).

#### [NEW] `server/src/services/departmentService.js`
- `deactivateDepartment(id)` with `ACTIVE_DEPENDENCIES_EXIST` guard.

#### [NEW] Staff & Department controllers + routes
- `GET /staff?limit&skip`, `POST /staff`, `PUT /staff/:id`, `DELETE /staff/:id`
- `GET /departments`, `POST /departments`, `PUT /departments/:id/reassign-head`
- `express-validator` schemas on all POST/PUT bodies.

#### [NEW] `src/features/staff/` — StaffList, CreateStaffForm, EditStaffModal
#### [NEW] `src/features/departments/` — DepartmentList, ReassignHeadModal
#### [NEW] Shared `ConfirmModal.jsx` in `src/components/` for `ACTIVE_DEPENDENCIES_EXIST` errors.

---

## Phase 4 — Appointments

#### [NEW] `server/src/services/appointmentService.js`
#### [NEW] `server/src/routes/appointments.js` — role-scoped access.

---

## Phase 5 — Analytics (REST Polling)

#### [NEW] `server/src/services/analyticsService.js` — aggregation pipeline.
#### [NEW] `GET /api/v1/analytics/weekly`
#### [NEW] `src/features/analytics/` — AnalyticsDashboard polling every 10s, charts (React 19 compatible library, e.g. Recharts ≥ 2.13).

---

## Phase 6 — Frontend Routing & Dashboard UI

#### [MODIFY] `src/app/App.jsx`
- Add `BrowserRouter` + `Routes`: `/login` → `AuthPage`, protected `/dashboard/*` → nested dashboard layout.

#### [NEW] `src/components/ProtectedRoute.jsx`
- Redirect unauthenticated users to `/login`.

#### [NEW] `src/features/staff/` + `src/features/departments/` views wired to API.

---

## Phase 7 — Polish

- Keep `helmet` defaults.
- Keep `express-rate-limit` (100 req/min / 5 req/min auth).
- `console.log`/`console.error` only — no Winston.
- One integration test on cascade transaction.

---

## Verification Plan

### Automated
- `node server/src/index.js` starts without errors.
- Integration test: cascade doctor delete rolls back on forced failure.

### Manual
- `npm run dev` (client) works; dev server proxies `/api` to Express.
- Login returns HTTP-only cookie; `/auth/me` returns current user.
- Staff CRUD visible in dashboard.
- Analytics page polls and updates.
