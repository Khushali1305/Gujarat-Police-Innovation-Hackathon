// Central type definitions. These shapes are what the FastAPI backend's
// response models (e.g. Pydantic schemas) should match field-for-field —
// when the real API replaces api/client.ts, these types don't need to change.

export type HealthState = "healthy" | "warning" | "critical" | "offline";
export type CapabilityLevel = "good" | "limited" | "poor";

export interface Camera {
  id: string;
  name: string;
  district: string;
  lat: number;
  lon: number;
  health: HealthState;
  fps: number;
  uptime7d: string; // percentage as string, e.g. "97.2"
  lastProbe: string; // HH:MM
  anpr: CapabilityLevel;
  face: CapabilityLevel;
  vehicleReid: CapabilityLevel;
  scene: string;
  online: boolean;
}

export type AlertType = "vehicle" | "person";
export type AlertStatus = "new" | "acknowledged" | "escalated" | "closed";
export type Priority = "High" | "Medium" | "Low";

export interface AlertItem {
  id: string;
  type: AlertType;
  identifier: string;
  camera: Camera;
  time: string; // ISO timestamp
  confidence: number;
  status: AlertStatus;
  matchType: string;
  priority: Priority;
}

export interface WatchlistEntry {
  id: string;
  type: AlertType;
  value: string;
  reason: string;
  priority: Priority;
  addedBy: string;
  date: string; // YYYY-MM-DD
}

export interface NewWatchlistEntry {
  type: AlertType;
  value: string;
  reason: string;
  priority: Priority;
}

export interface ChainOfCustodyEvent {
  action: string;
  by: string;
  at: string;
}

export interface EvidencePackage {
  alertId: string;
  original: boolean;
  enhanced: boolean;
  clipAvailable: boolean;
  chain: ChainOfCustodyEvent[];
}

export interface RouteStop extends Camera {
  seq: number;
  time: string; // ISO timestamp
}

export type Role = "state_hq" | "district" | "field" | "operator";

export interface RoleConfig {
  label: string;
  scope: string;
  visible: string[]; // nav item ids visible to this role
}
