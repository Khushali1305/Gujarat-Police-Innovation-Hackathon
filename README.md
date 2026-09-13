# Setu — Unified CCTV Intelligence Platform (Frontend PoC)

React + Vite + TypeScript frontend for the Unified CCTV Intelligence
Platform blueprint. Talks to a FastAPI + Postgres backend over REST
(and WebSockets for the alert engine, once wired up).

## Run locally

    npm install
    npm run dev

## Project layout

- `src/api/client.ts` — the ONLY module every page talks to for data.
  `USE_MOCK = true` right now; flip to `false` and fill in the
  commented `apiFetch` calls once the backend exists. No page needs
  to change.
- `src/data/mockData.ts` — deterministic mock cameras/alerts/watchlist.
- `src/context/RoleContext.tsx` — active RBAC state (dropdown-driven
  for now, per current requirements).
- `src/context/AuthContext.tsx` + `src/components/auth/LoginScreen.tsx`
  — full JWT auth flow, written but commented out. Activation steps
  are documented at the top of AuthContext.tsx.
- `src/pages/*` — one file per screen (Overview, LiveView, Health,
  Alerts, Watchlist, Registry, GISMap, Investigate).
- `src/components/layout/*` — Sidebar, Topbar, Shell (the app frame).
- `src/components/common/*` — shared badges, skeletons, error panel.

## Backend integration checklist

1. Set `VITE_API_BASE_URL` in `.env` (copy `.env.example`).
2. In `src/api/client.ts`: set `USE_MOCK = false`, uncomment
   `apiFetch`, and uncomment each `return apiFetch(...)` line per
   function.
3. Activate JWT auth per the steps at the top of
   `src/context/AuthContext.tsx`.
4. Swap the `Simulate outage` toggle in `Topbar.tsx` for real
   connectivity detection if desired (or leave it — it's harmless
   with a real backend, it just won't do anything since
   `setSimulatedOutage` won't affect real fetches).
