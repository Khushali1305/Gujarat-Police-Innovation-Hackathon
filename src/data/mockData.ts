// Deterministic mock data so the UI has something realistic to render
// before the FastAPI + Postgres backend is wired in. Nothing here is
// imported by real screens directly — always go through src/api/client.ts.

import type { Camera, AlertItem, WatchlistEntry, HealthState, CapabilityLevel } from "../types";

function rnd(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const R = rnd(42);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(R() * arr.length)];
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}

const CAMERA_SEED: [string, string, string, string][] = [
  ["Ahmedabad", "SG Highway Jn - Iscon", "23.0272", "72.5075"],
  ["Ahmedabad", "CG Road - Panchvati", "23.0339", "72.5622"],
  ["Ahmedabad", "Sarkhej Toll Plaza", "22.9870", "72.4790"],
  ["Ahmedabad", "Naroda GIDC Entry", "23.0730", "72.6640"],
  ["Gandhinagar", "Sec 21 Circle", "23.2050", "72.6360"],
  ["Gandhinagar", "Infocity Gate 2", "23.1930", "72.6370"],
  ["Gandhinagar", "GH-2 Junction", "23.2170", "72.6480"],
  ["Surat", "Ring Road - Udhna", "21.1550", "72.8310"],
  ["Surat", "Dumas Beach Rd", "21.0930", "72.7000"],
  ["Surat", "Adajan Bridge", "21.1960", "72.7770"],
  ["Vadodara", "Sayajigunj Circle", "22.3070", "73.1810"],
  ["Vadodara", "Genda Circle", "22.3130", "73.1670"],
  ["Rajkot", "150ft Ring Rd", "22.2890", "70.7930"],
  ["Rajkot", "Kalawad Rd Toll", "22.2670", "70.7460"],
  ["Bhavnagar", "Ghogha Circle", "21.7500", "72.1500"],
  ["Bhavnagar", "Waghawadi Rd", "21.7645", "72.1519"],
  ["Jamnagar", "Bedi Bunder Rd", "22.4707", "70.0577"],
  ["Junagadh", "Zanzarda Rd", "21.5222", "70.4579"],
  ["Ahmedabad", "Vastrapur Lake Rd", "23.0368", "72.5290"],
  ["Ahmedabad", "Maninagar Station", "22.9960", "72.6010"],
  ["Surat", "Sachin GIDC", "21.0700", "72.8830"],
  ["Vadodara", "Vasna-Bhayli Rd", "22.2980", "73.1210"],
  ["Rajkot", "Race Course Ring", "22.3010", "70.7830"],
  ["Gandhinagar", "Kudasan Xing", "23.1670", "72.6140"],
];

const HEALTH_STATES: HealthState[] = ["healthy", "healthy", "healthy", "warning", "critical", "offline"];
const CAP_STATUS: CapabilityLevel[] = ["good", "good", "limited", "poor"];
const SCENES = ["Highway", "Junction", "Society Entrance", "Commercial Area", "Toll Plaza", "Open Public Space"];

export const cameras: Camera[] = CAMERA_SEED.map((c, i) => {
  const health = pick(HEALTH_STATES);
  return {
    id: "CAM-" + (1000 + i),
    name: c[1],
    district: c[0],
    lat: parseFloat(c[2]) + (R() - 0.5) * 0.01,
    lon: parseFloat(c[3]) + (R() - 0.5) * 0.01,
    health,
    fps: health === "offline" ? 0 : Math.round(8 + R() * 17),
    uptime7d: health === "offline" ? (20 + R() * 30).toFixed(1) : (88 + R() * 12).toFixed(1),
    lastProbe: `${pad(Math.floor(R() * 23))}:${pad(Math.floor(R() * 59))}`,
    anpr: pick(CAP_STATUS),
    face: pick(CAP_STATUS),
    vehicleReid: pick(CAP_STATUS),
    scene: pick(SCENES),
    online: health !== "offline",
  };
});

export const PLATES = ["GJ01AB1234", "GJ05CX9081", "GJ18BK7742", "GJ06EE1190", "GJ27JX5521", "GJ01FT3302", "GJ21CD8890"];

const ALERT_MATCH_TYPES = ["Exact plate match", "Fuzzy plate match", "Biometric candidate", "Re-ID candidate"];
const PRIORITIES: Array<AlertItem["priority"]> = ["High", "High", "Medium", "Low"];

export const alerts: AlertItem[] = Array.from({ length: 14 }).map((_, i) => {
  const type: AlertItem["type"] = pick(["vehicle", "person"]);
  const camera = pick(cameras);
  const hrsAgo = Math.floor(R() * 30);
  const status: AlertItem["status"] = pick(["new", "new", "acknowledged", "escalated", "closed"]);
  const time = new Date(Date.now() - hrsAgo * 3600 * 1000 - Math.floor(R() * 59) * 60000);
  return {
    id: "ALT-" + (500 + i),
    type,
    identifier:
      type === "vehicle"
        ? pick(PLATES)
        : pick(["Unidentified — Watchlist #WL-014", "Unidentified — Watchlist #WL-002", "Ramesh Patel — Missing Person"]),
    camera,
    time: time.toISOString(),
    confidence: Math.round(62 + R() * 36),
    status,
    matchType: pick(ALERT_MATCH_TYPES),
    priority: pick(PRIORITIES),
  };
}).sort((a, b) => (a.time < b.time ? 1 : -1));

export const watchlist: WatchlistEntry[] = [
  { id: "WL-001", type: "vehicle", value: "GJ01AB1234", reason: "Robbery — Sec 7 PS FIR 221/26", priority: "High", addedBy: "Insp. R. Vora", date: "2026-09-02" },
  { id: "WL-002", type: "person", value: "Unidentified Male, ~30yrs", reason: "CCTV match — chain snatching pattern", priority: "High", addedBy: "SI M. Chauhan", date: "2026-09-05" },
  { id: "WL-014", type: "person", value: "Missing — Aarav Shah, 14yrs", reason: "Missing person case #MP-0091", priority: "High", addedBy: "Ctrl Room GNR", date: "2026-09-08" },
  { id: "WL-020", type: "vehicle", value: "GJ_5_X9081 (partial)", reason: "Hit and run — partial plate only", priority: "Medium", addedBy: "Insp. R. Vora", date: "2026-09-09" },
  { id: "WL-031", type: "vehicle", value: "GJ18BK7742", reason: "Stolen vehicle — FIR 118/26 Surat", priority: "Medium", addedBy: "SI P. Rathod", date: "2026-09-10" },
];
