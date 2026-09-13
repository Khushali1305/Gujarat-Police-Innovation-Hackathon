// ============================================================================
// API CLIENT
// ----------------------------------------------------------------------------
// Every screen in this app calls ONLY the functions exported from this file
// (never mockData.ts directly). That's the seam: right now `USE_MOCK` is
// true and everything resolves against the in-memory arrays in
// src/data/mockData.ts. When the FastAPI backend is ready, flip
// USE_MOCK to false and fill in the commented `real*` functions below —
// no changes are needed in any page component.
// ============================================================================

import type {
  Camera,
  AlertItem,
  AlertStatus,
  WatchlistEntry,
  NewWatchlistEntry,
  EvidencePackage,
  RouteStop,
} from "../types";
import { cameras as mockCameras, alerts as mockAlerts, watchlist as mockWatchlist } from "../data/mockData";

const USE_MOCK = true;

// Base URL for the real backend — set VITE_API_BASE_URL in .env when ready.
// Referenced only inside the commented apiFetch() below until the real
// backend is wired in; kept here so that switch is a one-line change.
// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

// ----------------------------------------------------------------------------
// Simulated outage flag — flip via setSimulatedOutage() from the Topbar to
// demo loading/error/degraded states without a real backend.
// ----------------------------------------------------------------------------
let simulatedOutage = false;
export function setSimulatedOutage(value: boolean) {
  simulatedOutage = value;
}
export function isSimulatedOutage() {
  return simulatedOutage;
}

function mockRequest<T>(payload: T, opts: { delay?: number; allowDuringOutage?: boolean } = {}): Promise<T> {
  const delay = opts.delay ?? 300 + Math.random() * 500;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulatedOutage && !opts.allowDuringOutage) {
        reject(new Error("Central platform unreachable"));
      } else {
        resolve(payload);
      }
    }, delay);
  });
}

// ----------------------------------------------------------------------------
// A small fetch wrapper for when USE_MOCK is flipped off. Kept here, unused
// for now, so the attachment point for JWT auth (see context/AuthContext.tsx)
// is obvious: uncomment the Authorization header line once login is live.
// ----------------------------------------------------------------------------
// async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
//   const token = localStorage.getItem("access_token");
//   const res = await fetch(`${API_BASE}${path}`, {
//     ...init,
//     headers: {
//       "Content-Type": "application/json",
//       // Authorization: token ? `Bearer ${token}` : "",
//       ...(init?.headers ?? {}),
//     },
//   });
//   if (!res.ok) {
//     if (res.status === 401) {
//       // token expired/invalid — real app should redirect to /login here
//     }
//     throw new Error(`Request failed: ${res.status} ${res.statusText}`);
//   }
//   return res.json();
// }

// ============================================================================
// CAMERAS
// ============================================================================
export function getCameras(): Promise<Camera[]> {
  if (USE_MOCK) return mockRequest(mockCameras);
  // return apiFetch<Camera[]>("/cameras");
  return Promise.reject(new Error("Real API not configured"));
}

// ============================================================================
// ALERTS
// ============================================================================
export function getAlerts(): Promise<AlertItem[]> {
  if (USE_MOCK) return mockRequest(mockAlerts);
  // return apiFetch<AlertItem[]>("/alerts");
  return Promise.reject(new Error("Real API not configured"));
}

export function updateAlertStatus(id: string, status: AlertStatus): Promise<{ id: string; status: AlertStatus }> {
  if (USE_MOCK) {
    const a = mockAlerts.find((x) => x.id === id);
    if (a) a.status = status;
    return mockRequest({ id, status });
  }
  // return apiFetch(`/alerts/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  return Promise.reject(new Error("Real API not configured"));
}

export function getEvidence(alertId: string): Promise<EvidencePackage> {
  if (USE_MOCK) {
    return mockRequest({
      alertId,
      original: true,
      enhanced: Math.random() > 0.4,
      clipAvailable: true,
      chain: [
        { action: "Detection created", by: "AI Worker — ANPR", at: "auto" },
        { action: "Alert generated", by: "Watchlist Engine", at: "auto" },
        { action: "Evidence viewed", by: "current session", at: "now" },
      ],
    });
  }
  // return apiFetch<EvidencePackage>(`/alerts/${alertId}/evidence`);
  return Promise.reject(new Error("Real API not configured"));
}

// ============================================================================
// WATCHLIST
// ============================================================================
export function getWatchlist(): Promise<WatchlistEntry[]> {
  if (USE_MOCK) return mockRequest(mockWatchlist);
  // return apiFetch<WatchlistEntry[]>("/watchlist");
  return Promise.reject(new Error("Real API not configured"));
}

export function addWatchlistEntry(entry: NewWatchlistEntry): Promise<WatchlistEntry> {
  if (USE_MOCK) {
    const saved: WatchlistEntry = {
      ...entry,
      id: "WL-" + Math.floor(100 + Math.random() * 900),
      addedBy: "current session",
      date: new Date().toISOString().slice(0, 10),
    };
    mockWatchlist.unshift(saved);
    return mockRequest(saved);
  }
  // return apiFetch<WatchlistEntry>("/watchlist", { method: "POST", body: JSON.stringify(entry) });
  return Promise.reject(new Error("Real API not configured"));
}

// ============================================================================
// GIS / ROUTE RECONSTRUCTION
// ============================================================================
export function reconstructRoute(_identifier: string): Promise<RouteStop[]> {
  if (USE_MOCK) {
    const path = mockCameras.filter(() => Math.random() > 0.75).slice(0, 6);
    const stops: RouteStop[] = path.map((c, i) => ({
      ...c,
      seq: i,
      time: new Date(Date.now() - (path.length - i) * 40 * 60000).toISOString(),
    }));
    return mockRequest(stops);
  }
  // return apiFetch<RouteStop[]>(`/routes/reconstruct?identifier=${encodeURIComponent(identifier)}`);
  return Promise.reject(new Error("Real API not configured"));
}

// ============================================================================
// NATURAL-LANGUAGE INVESTIGATION (Part 1 of the blueprint)
// ============================================================================
export interface NLQueryResult {
  generatedSql: string;
  rowCount: number;
  rows: AlertItem[];
}
export function runNaturalLanguageQuery(question: string): Promise<NLQueryResult> {
  if (USE_MOCK) {
    const generatedSql = `SELECT * FROM v_events\nWHERE jurisdiction = ANY(current_user_districts())\n  AND text_matches(:query)\nORDER BY event_time DESC\nLIMIT 200;`;
    let rows: AlertItem[] = [];
    if (/GJ\d|plate|sighting/i.test(question)) rows = mockAlerts.filter((a) => a.type === "vehicle").slice(0, 6);
    else if (/anpr|capability|poor/i.test(question)) rows = [];
    else rows = mockAlerts.filter((a) => a.status === "new").slice(0, 6);
    return mockRequest({ generatedSql, rowCount: rows.length, rows }, { delay: 600 });
  }
  // return apiFetch<NLQueryResult>("/investigate/query", { method: "POST", body: JSON.stringify({ question }) });
  return Promise.reject(new Error("Real API not configured"));
}

// ============================================================================
// ALERTS OVER WEBSOCKET (Part 9 — real-time watchlist/alert engine)
// ----------------------------------------------------------------------------
// Left commented and unused for now — the mock layer above is enough to
// build every screen. When the backend's alert engine is live, this is the
// shape to subscribe with (e.g. from a hook in pages/Alerts.tsx):
// ============================================================================
// export function subscribeToAlerts(onAlert: (alert: AlertItem) => void): () => void {
//   const ws = new WebSocket(`${API_BASE.replace(/^http/, "ws")}/ws/alerts`);
//   ws.onmessage = (event) => onAlert(JSON.parse(event.data));
//   return () => ws.close();
// }
