import type { ReactElement } from "react";
import { useRole, ROLES } from "../../context/RoleContext";
import type { Role } from "../../types";

const ICONS: Record<string, ReactElement> = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  live: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="5" width="14" height="14" rx="1.5" />
      <path d="M20 8l-4 3v2l4 3z" />
    </svg>
  ),
  health: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 12h4l2 7 4-14 2 7h6" />
    </svg>
  ),
  alerts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 3l9 16H3z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  ),
  watchlist: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  registry: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="17" rx="1.5" />
      <path d="M3 9h18" />
      <path d="M8 4v5" />
    </svg>
  ),
  gis: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  ),
  investigate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.8-4.8" />
    </svg>
  ),
};

export interface NavItem {
  id: string;
  label: string;
  section: string | null;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", section: null, path: "/" },
  { id: "live", label: "Multi-Camera Live View", section: "Monitoring", path: "/live" },
  { id: "health", label: "Camera Health & Status", section: "Monitoring", path: "/health" },
  { id: "gis", label: "GIS Map & Routes", section: "Monitoring", path: "/gis" },
  { id: "alerts", label: "Alerts & Investigation", section: "Intelligence", path: "/alerts" },
  { id: "investigate", label: "Natural-Language Search", section: "Intelligence", path: "/investigate" },
  { id: "watchlist", label: "Watchlist Management", section: "Administration", path: "/watchlist" },
  { id: "registry", label: "Camera Registry", section: "Administration", path: "/registry" },
];

interface SidebarProps {
  activeId: string;
  onNavigate: (path: string) => void;
}

export default function Sidebar({ activeId, onNavigate }: SidebarProps) {
  const { role, setRole, config } = useRole();

  let lastSection: string | null | undefined = undefined;

  return (
    <div id="sidebar">
      <div id="brand">
        <div className="name">Setu</div>
        <div className="sub">Unified CCTV Intelligence — Gujarat</div>
      </div>

      {/* TODO(auth): once AuthContext is active, replace this <select> with
          a read-only display of user.role + user.district decoded from the
          JWT, and remove setRole entirely. */}
      <div id="role-switch">
        <label>Signed in as</label>
        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {Object.entries(ROLES).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>
      </div>

      <div id="nav">
        {NAV_ITEMS.filter((item) => config.visible.includes(item.id)).map((item) => {
          const showSectionLabel = item.section !== lastSection;
          lastSection = item.section;
          return (
            <div key={item.id}>
              {showSectionLabel && item.section && <div className="nav-section-label">{item.section}</div>}
              <div
                className={`nav-item ${activeId === item.id ? "active" : ""}`}
                onClick={() => onNavigate(item.path)}
              >
                {ICONS[item.id]}
                <span>{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div id="sidebar-foot">PoC build · mock data layer</div>
    </div>
  );
}
