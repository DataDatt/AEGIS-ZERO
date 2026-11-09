# AEGIS-ZERO

AEGIS-ZERO is a Vite + React + Express security dashboard built to detect and interrupt gambling-related financial and behavioral patterns. The app combines a financial scanner, a blocklist/compiler module, Google Workspace integration, and sponsor-controlled intervention workflows to audit risky payment rails, scan inboxes, and enforce protective controls.

## What this project does

- Audits financial statements and browser activity for gambling / sweepstakes indicators
- Tracks blocked domains and risky keywords in a live ruleset
- Uses Gemini-based analysis on server-side endpoints for threat detection and legal notices
- Scans Gmail traffic and can trash suspicious promo emails
- Provides a sponsor-style accountability vault and onboarding workflow
- Generates a Chrome-extension-style enforcement and browser sabotage configuration

## Architecture

This repository is a front-end app with a lightweight Express backend that exposes AI-powered scan endpoints and serves the app in both dev and production modes.

- `src/App.tsx` — top-level app state, tabs, sponsor flow, and enforcement pipeline
- `src/components/*` — module UI for the financial scanner, compiler, Gmail/legal tooling, and vault
- `src/data/threatDatabase.ts` — threat catalog, sample ledger entries, sample input payloads, and onboarding data
- `src/services/googleWorkspaceAuth.ts` — Google sign-in and token handling
- `server.ts` — Express API server with `/api/scan`, `/api/legal-notice`, and live rule sync endpoints
- `public/` — static frontend assets
- `vite.config.ts` — Vite configuration and HMR/watch settings
- `metadata.json` — project metadata

## Tech stack

- TypeScript (primary language)
- React 19 + Vite
- Express + Node.js
- Google GenAI / Gemini API integration
- Firebase authentication
- Tailwind CSS + Motion + Lucide icons

## Features by module

### 1. Financial & activity scanner

The scanner ingests transaction logs, history exports, and inbox snippets. It compares the data against a blocklist of known gambling domains and keywords, surfaces suspicious payment rails, calculates risk, and summarizes the findings.

### 2. Extension enforcer compiler

This module compiles the effective block rules, domains, and sabotage posture used to restrict access to risky domains and suppress malicious browser behavior.

### 3. Gmail & legal tools

The app can connect to Google Workspace, scan Gmail for sweepstakes / promo triggers, trash suspicious messages, and generate a formal legal self-exclusion notice.

### 4. Sponsor vault / accountability flow

The project includes a sponsor onboarding and vault guardrail system with a recovery partner, override checks, and custom domain / keyword management.

## Project structure

```text
AEGIS-ZERO/
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
├── index.html              # HTML entry
├── metadata.json           # App metadata
├── package.json            # Scripts and dependencies
├── server.ts               # Express server and API endpoints
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── public/                 # Static assets
├── src/
│   ├── App.tsx             # Main app shell and controls
│   ├── index.css           # Styling entry
│   ├── main.tsx            # React startup
│   ├── components/         # UI modules
│   ├── data/               # Threat database and samples
│   └── services/           # Auth and external integrations
├── bun.lock                # Lockfile for Bun
└── firebase-applet-config.json
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Add your Gemini API key in `.env`:

```env
GEMINI_API_KEY="your_key_here"
APP_URL="http://localhost:3000"
```

4. Start the app:

```bash
npm run dev
```

This starts the Express server and Vite app in development mode.

5. Open the app in the browser:

```text
http://localhost:3000
```

## Useful scripts

```bash
npm run dev      # start development server
npm run build    # build production bundle
npm run start    # start express server
npm run preview  # preview production build
npm run lint     # TypeScript type-check
```

## Notes

- The app expects Google OAuth and Gmail access when live workspace integration is enabled.
- Live Gemini-backed analysis is intentionally designed to classify and block high-risk gambling-related patterns.
- Several features rely on browser localStorage for demo state persistence and onboarding data.

## License

This repository does not declare a license in the root files currently present, so license status should be checked before redistribution or commercial reuse.

## Why it matters

AEGIS-ZERO is built as a proactive intervention dashboard for people navigating risky gambling or sweepstakes activity. It emphasizes detection, accountability, and intervention rather than passive monitoring alone.

---

If you want, I can also tailor this README for:
- a cleaner GitHub landing page version,
- a more technical contributor README,
- or a version co-written with a product/architecture summary for presentation use.
