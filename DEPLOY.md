# Deployment

## Prerequisites

Install Firebase CLI globally (one-time):

```bash
npm install -g firebase-tools
```

Authenticate (one-time per machine):

```bash
firebase login
```

## Deploy

```bash
npm run deploy
```

This runs `vite build` then `firebase deploy --only hosting` and pushes the `dist/` folder to Firebase Hosting for project `algobridge-36446`.

## Local dev server

```bash
npm run dev
```

Runs on `http://localhost:5173` by default.

## Environment variables

The site requires a `.env.local` file in the project root. Copy `.env.example` and fill in the values:

```bash
copy .env.example .env.local
```

Required values:

| Variable | Where to find it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase console → Project Settings → Your apps → Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | Same |
| `VITE_FIREBASE_PROJECT_ID` | Same |
| `VITE_FIREBASE_STORAGE_BUCKET` | Same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same |
| `VITE_FIREBASE_APP_ID` | Same |
| `VITE_API_BASE_URL` | Cloud Run backend URL, e.g. `https://your-backend.run.app` |

`.env.local` is gitignored and must never be committed.
