# Deployment Guide

## Architecture

```
Browser
  │
  ├── Static files ──► Vercel (client build)
  │
  └── /api/* requests ──► Vercel reverse proxy ──► Railway (Express server)
                               ↑
                      vercel.json rewrite rule
                      (same-origin trick: browser never
                       leaves Vercel's domain, so
                       SameSite=Strict cookies work)
```

## Step 1 — MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Atlas free tier is **already a replica set** — transactions work with no extra config.
3. Go to **Database Access** → create a user with password.
4. Go to **Network Access** → Add IP `0.0.0.0/0` (allow all, fine for a demo).
5. Copy the connection string — it looks like:
   ```
   mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/medicare?retryWrites=true&w=majority
   ```

## Step 2 — Deploy Server to Railway

1. Push your code to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
3. Select the repo, set **Root Directory** to `server`.
4. Add the following **Environment Variables** in Railway's dashboard:

   | Key | Value |
   |---|---|
   | `PORT` | `5000` |
   | `MONGODB_URI` | *(your Atlas connection string)* |
   | `JWT_ACCESS_SECRET` | *(run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)* |
   | `JWT_REFRESH_SECRET` | *(different value, same command)* |
   | `CLIENT_ORIGIN` | *(your Vercel URL — fill in after Step 3)* |
   | `NODE_ENV` | `production` |

5. Deploy. Note the Railway domain — e.g. `https://medicare-api-production.railway.app`.

## Step 3 — Update vercel.json

Open `vercel.json` and replace the placeholder with your Railway domain:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://medicare-api-production.railway.app/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Commit and push this change.

## Step 4 — Deploy Client to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project → Import Git Repository**.
2. Select the repo, leave **Root Directory** as `/` (the client is at the root).
3. Vite is auto-detected. No env vars needed for the client.
4. Deploy. Note your Vercel URL — e.g. `https://medicare-admin.vercel.app`.

## Step 5 — Update CLIENT_ORIGIN on Railway

Go back to Railway → your server service → **Variables**:

```
CLIENT_ORIGIN = https://medicare-admin.vercel.app
```

Trigger a redeploy on Railway (or it picks up automatically).

## Step 6 — Seed an Admin User

The server has no seed script — create your first admin directly in Atlas or via a one-time script:

```js
// Run from server/ directory: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = new User({
    email: 'admin@medicare.com',
    passwordHash: 'AdminPass123!',   // pre('save') hook bcryptjs-hashes this
    name: 'System Admin',
    role: 'admin',
  });
  await admin.save();
  console.log('Admin created');
  process.exit(0);
});
```

## Why Cookies Work

The Vercel rewrite is a **server-side proxy**. The browser sends `POST your-frontend.vercel.app/api/v1/auth/login` — it never sees `railway.app`. Vercel forwards the request to Railway and relays the response (including `Set-Cookie`) back. The browser stores the cookie scoped to `your-frontend.vercel.app`. On every subsequent request to `/api/*`, the same cookie goes out to the same origin. `SameSite=Strict` is satisfied throughout.

## Local Development

```bash
# Terminal 1 — start MongoDB replica set
docker-compose up -d

# Terminal 2 — start Express server
cd server && npm run dev

# Terminal 3 — start Vite dev server
npm run dev
```

Vite's proxy (configured in `vite.config.js`) forwards `/api/*` to `localhost:5000` — same mechanism as Vercel in prod.
