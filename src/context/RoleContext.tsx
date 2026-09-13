// Stands in for real auth-derived permissions until a backend exists.
// Once JWT auth (see context/AuthContext.tsx) is wired up, `role` here
// should come from the decoded token's claims instead of a dropdown —
// everything that *reads* role.visible / scope stays the same either way.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Role, RoleConfig, Camera, AlertItem } from "../types";

export const ROLES: Record<Role, RoleConfig> = {
  state_hq: {
    label: "State HQ — Full Access",
    scope: "All districts",
    visible: ["overview", "live", "health", "gis", "alerts", "investigate", "watchlist", "registry"],
  },
  district: {
    label: "District Control Room — Ahmedabad",
    scope: "Ahmedabad district only",
    visible: ["overview", "live", "health", "gis", "alerts", "investigate", "watchlist"],
  },
  field: {
    label: "Field / Interceptor Unit",
    scope: "Assigned alerts only",
    visible: ["overview", "alerts", "gis"],
  },
  operator: {
    label: "Camera Operator",
    scope: "Assigned cameras only",
    visible: ["live", "health"],
  },
};

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
  config: RoleConfig;
  scopeCameras: (cameras: Camera[]) => Camera[];
  scopeAlerts: (alerts: AlertItem[], scopedCams: Camera[]) => AlertItem[];
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("state_hq");

  const value = useMemo<RoleContextValue>(() => {
    const config = ROLES[role];
    return {
      role,
      setRole,
      config,
      scopeCameras: (cameras) => {
        if (role === "district") return cameras.filter((c) => c.district === "Ahmedabad");
        if (role === "operator") return cameras.slice(0, 6);
        return cameras;
      },
      scopeAlerts: (alerts, scopedCams) => {
        const ids = new Set(scopedCams.map((c) => c.id));
        let list = alerts.filter((a) => ids.has(a.camera.id));
        if (role === "field") list = list.filter((a) => a.status !== "closed");
        return list;
      },
    };
  }, [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
