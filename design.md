# MediCare — Design Document

## 1. Overview

**MediCare** is a hospital reservation system. This document covers the current
scope of the project: the authentication experience (Sign In / Register) that
serves as the entry point for four user roles — Patient, Doctor, Receptionist,
and Admin.

The page has a single job: get a user signed in or registered as quickly and
clearly as possible, with immediate, understandable feedback when something
goes wrong.

## 2. Tech Stack

| Layer      | Choice                                   |
|------------|-------------------------------------------|
| Framework  | React 19                                  |
| Build tool | Vite 8 (`@vitejs/plugin-react`)           |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`)     |
| Icons      | `lucide-react`                            |
| Linting    | `oxlint` + `eslint`                       |

No component library (e.g. shadcn) or global state manager is used — the app
is small enough that local `useState` and two custom hooks (`useForm`,
`useToast`) cover everything needed.

## 3. Design System

### 3.1 Color Palette

The palette is intentionally restrained: a neutral slate scale for structure
and text, one emerald accent for anything actionable or on-brand, and red
reserved exclusively for errors.

| Role                  | Tailwind class        | Usage                                  |
|------------------------|------------------------|-----------------------------------------|
| Page background        | `bg-slate-200`         | Full-page backdrop                     |
| Card background         | `bg-white`             | Auth card, toast card                  |
| Card border             | `border-slate-300` / `border-slate-200` | Card and input borders |
| Primary text            | `text-slate-900`       | Headings                               |
| Secondary text           | `text-slate-500`       | Subtitles, helper text, toast body     |
| Label text               | `text-slate-800`       | Form field labels                      |
| Brand / primary action   | `bg-emerald-600` (hover `emerald-700`) | Logo mark, primary buttons |
| Focus ring                | `emerald-500`         | Input focus state                      |
| Error accent               | `red-600` on `red-100` badge | Toast icon only, never full-surface red |

**Design decision:** the error toast uses a *small red icon badge* on an
otherwise neutral white card — not a full red banner. This keeps errors
visible without breaking the calm, clinical tone appropriate for a healthcare
product. Panic-red surfaces were deliberately avoided.

### 3.2 Typography

The system font stack is used throughout (no custom web font is loaded),
keeping load time minimal and matching a familiar, trustworthy OS-native feel
appropriate for a hospital tool.

| Element              | Style                              |
|------------------------|-------------------------------------|
| Brand name ("MediCare") | `text-2xl font-bold`             |
| Tagline                 | `text-sm italic text-slate-500`  |
| Section heading (e.g. "Welcome back") | `text-xl font-bold` |
| Section subtitle         | `text-sm text-slate-500`        |
| Field label               | `text-sm font-semibold`         |
| Body / input text          | `text-sm`                      |
| Toast title                 | `text-sm font-semibold`       |
| Toast message                | `text-sm text-slate-500`     |

### 3.3 Shape & Elevation

- **Radius:** `rounded-lg` for inputs/buttons/tabs, `rounded-2xl` for cards and
  the toast — the larger radius on containers vs. controls creates a subtle
  hierarchy.
- **Shadow:** `shadow-lg` on the auth card and the toast only. Nothing else
  has elevation, so the two things allowed to "float" above the flat page
  are the main task (the form) and interruptions (the toast).
- **Borders:** thin `1px` slate borders on every card/input rather than heavy
  strokes, keeping the surface quiet.

### 3.4 Signature Element

The **logo mark** — a solid emerald rounded-square with a white filled heart
— is the one deliberately "branded" visual in an otherwise neutral UI. It
appears once, at the top of the page, and nowhere else, so it reads as a
mark rather than a decoration.

## 4. Layout

```
┌─────────────────────────────┐
│           [Logo]             │  ← centered, mb-6
│          MediCare             │
│   Hospital Reservation System │
│                               │
│  ┌─────────────────────────┐ │
│  │  Sign In  |  Register    │ │  ← pill tab switcher
│  ├─────────────────────────┤ │
│  │                          │ │
│  │   Welcome back           │ │
│  │   Sign in to your account │ │
│  │                          │ │
│  │   Email    [___________] │ │
│  │   Password [___________] │ │
│  │                          │ │
│  │   [      Sign In       ] │ │
│  │                          │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘

                    ┌───────────────────┐
                    │ ● Sign in failed   │  ← toast, bottom-right,
                    │   <error message>  │    auto-dismiss 3.5s
                    └───────────────────┘
```

- The whole page is a single centered column (`max-w-md`), vertically and
  horizontally centered in the viewport (`min-h-screen flex items-center
  justify-center`).
- The auth card is a single unit containing the tab switcher and the active
  form — switching tabs swaps the form body only; the card shell stays fixed.
- The toast is fixed to the **bottom-right** of the viewport, independent of
  page scroll, so it never displaces the form layout.

## 5. Project Structure

```
src/
├── app/
│   ├── App.jsx           # Root component — currently just renders AuthPage
│   ├── App.css           # Legacy Vite starter styles (not used by AuthPage)
│   └── main.jsx           # React entry point, mounts <App />
├── components/             # Shared, reusable UI (not feature-specific)
│   ├── Logo.jsx            # Heart mark + product name + tagline
│   └── Toast.jsx            # Bottom-right error notification
├── features/
│   └── auth/                # Everything specific to sign in / registration
│       ├── AuthPage.jsx       # Tab state, toast state, mock auth check
│       ├── SignInForm.jsx      # Email + password fields
│       └── RegisterForm.jsx     # Full name, email, phone, password (+ show/hide)
├── hooks/                    # Reusable stateful logic
│   ├── useForm.js              # Generic controlled-input state + onChange
│   └── useToast.js              # Show/hide a single toast message with auto-dismiss
├── utils/                     # (currently empty — reserved for shared helpers)
└── index.css                   # Tailwind import only
```

**Convention used:** `components/` holds anything reusable across features;
`features/<name>/` holds anything specific to one flow. If a second flow
(e.g. appointment booking) is added later, it gets its own `features/`
subfolder and can reuse `components/` and `hooks/` freely.

## 6. Components

### 6.1 `Logo`
Presentational only, no props, no state. Renders the emerald mark, brand
name, and tagline. Reused identically on both Sign In and Register (it lives
above the tab card, not inside the form).

### 6.2 `Toast`
Props: `message` (string), `onClose` (function).
Renders nothing when `message` is falsy. Fixed-position card at
bottom-right with a red icon badge, a static title ("Sign in failed"), the
passed-in `message` as supporting text, and a manual dismiss (X) button.

### 6.3 `SignInForm`
Props: `onSubmit` (function receiving `{ email, password }`).
Two controlled inputs via `useForm`. Calls `onSubmit` on submit; has no
knowledge of success/failure — that's the parent's responsibility.

### 6.4 `RegisterForm`
Props: `onSubmit` (function receiving `{ fullName, email, phone, password }`).
Three plain fields rendered from a config array, plus a hand-written password
field with a show/hide toggle (`Eye` / `EyeOff` icon swap, local `showPassword`
state).

### 6.5 `AuthPage`
Owns:
- `activeTab` (`"signin" | "register"`) — controls which form renders and
  which tab is visually active.
- `message` / `showToast` / `hideToast` (via `useToast`) — controls the
  toast.
- The credential check for sign-in (see §8, this is temporary).

## 7. Hooks

### 7.1 `useForm(initialValues)`
Generic controlled-form helper. Returns `values`, a single `handleChange`
usable on any `name`-ed input, `reset()`, and raw `setValues` for cases like
pre-filling. Used identically by both forms — no per-field logic lives in the
hook, keeping it reusable for any future form (e.g. appointment booking).

### 7.2 `useToast()`
Returns `message`, `showToast(text, duration = 3500)`, and `hideToast()`.
Only one toast can be visible at a time by design — calling `showToast`
again resets the auto-dismiss timer rather than stacking multiple toasts.
This matches the current need (one blocking error at a time on a login
form); a queue-based version would be needed if multiple simultaneous
toasts become a requirement later.

## 8. Current Behavior & Known Temporary Scaffolding

There is no backend integration yet. To make the error-toast behavior
demonstrable and testable, `AuthPage.jsx` contains a **hardcoded mock
credential check**, clearly fenced with `⚠️ TEST-ONLY` comments:

```js
const MOCK_CREDENTIALS = { email: "test@medicare.com", password: "password123" };
```

- Any email/password that doesn't match this pair triggers the error toast.
- A match currently just logs to the console (no redirect / session yet).

**This must be replaced** with a real API call before shipping. The intended
replacement shape (already noted inline in the code) is an async call inside
`handleSignIn` that calls `showToast(err.message)` on a rejected request and
handles routing / auth-state on success.

The Register flow has no validation or submission handling yet beyond
logging the form values — this is the next gap to close (see §10).

## 9. Interaction Details

- **Tab switch:** clicking "Sign In" / "Register" swaps the form instantly,
  no transition — deliberate, since this is a binary state and users expect
  an immediate response, not an animated one, on a utility flow.
- **Password visibility (Register only, currently):** toggling the eye icon
  flips the input `type` between `password` and `text` without clearing or
  altering the value.
- **Toast lifecycle:** appears immediately on a failed sign-in attempt,
  auto-dismisses after 3.5s, or can be dismissed early via the X button.
  Submitting again while a toast is showing resets the dismiss timer rather
  than stacking a second toast.
- **Focus state:** every input uses `focus:border-emerald-500 focus:ring-1
  focus:ring-emerald-500` — consistent, visible keyboard focus across the
  whole form for accessibility.

## 10. Open Items / Next Steps

- [ ] Replace the mock credential check with a real authentication API call.
- [ ] Add the same show/hide password toggle to `SignInForm` (currently only
      on Register).
- [ ] Add field-level validation (empty fields, email format, phone format)
      before submission, likely surfaced inline rather than via toast, since
      toast is reserved for request-level (server) errors, not input
      mistakes.
- [ ] Wire `RegisterForm`'s `onSubmit` to an actual account-creation request
      and success/error feedback (currently console-only).
- [ ] Decide on post-login routing per role (Patient / Doctor / Receptionist
      / Admin), since the four roles mentioned in the original brief aren't
      yet represented as distinct destinations after sign-in.
- [ ] Remove `src/app/App.css` if no other page ever needs the legacy Vite
      starter styles it currently holds.
