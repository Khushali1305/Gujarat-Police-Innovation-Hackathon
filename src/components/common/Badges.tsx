import type { HealthState, CapabilityLevel, Priority, AlertStatus } from "../../types";

export function HealthBadge({ health }: { health: HealthState }) {
  const map: Record<HealthState, [string, string]> = {
    healthy: ["b-ok", "Healthy"],
    warning: ["b-warn", "Warning"],
    critical: ["b-crit", "Critical"],
    offline: ["b-muted", "Offline"],
  };
  const [cls, label] = map[health];
  return (
    <span className={`badge ${cls}`}>
      <span className="dot" />
      {label}
    </span>
  );
}

export function CapabilityBadge({ level }: { level: CapabilityLevel }) {
  const map: Record<CapabilityLevel, [string, string]> = {
    good: ["b-ok", "Good"],
    limited: ["b-warn", "Limited"],
    poor: ["b-crit", "Poor"],
  };
  const [cls, label] = map[level];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = { High: "b-crit", Medium: "b-warn", Low: "b-muted" };
  return <span className={`badge ${map[priority]}`}>{priority}</span>;
}

export function StatusBadge({ status }: { status: AlertStatus }) {
  const map: Record<AlertStatus, [string, string]> = {
    new: ["b-crit", "New"],
    acknowledged: ["b-info", "Acknowledged"],
    escalated: ["b-warn", "Escalated"],
    closed: ["b-muted", "Closed"],
  };
  const [cls, label] = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
