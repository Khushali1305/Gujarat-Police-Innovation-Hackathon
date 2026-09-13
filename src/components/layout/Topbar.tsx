import { useEffect, useState } from "react";
import { useRole } from "../../context/RoleContext";
import { getCameras, getAlerts, setSimulatedOutage, isSimulatedOutage } from "../../api/client";

export default function Topbar() {
  const { config, scopeCameras, scopeAlerts } = useRole();
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [critical, setCritical] = useState(0);
  const [newAlerts, setNewAlerts] = useState(0);
  const [degraded, setDegraded] = useState(isSimulatedOutage());

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCameras(), getAlerts()])
      .then(([cams, alerts]) => {
        if (cancelled) return;
        const scopedCams = scopeCameras(cams);
        const scopedAl = scopeAlerts(alerts, scopedCams);
        setOnlineCount(scopedCams.filter((c) => c.online).length);
        setTotalCount(scopedCams.length);
        setCritical(scopedCams.filter((c) => c.health === "critical" || c.health === "offline").length);
        setNewAlerts(scopedAl.filter((a) => a.status === "new").length);
      })
      .catch(() => {
        // Topbar KPIs are best-effort — a failed fetch here shouldn't block
        // the page itself, which shows its own error panel.
      });
    return () => {
      cancelled = true;
    };
  }, [config, degraded, scopeCameras, scopeAlerts]);

  function toggleOutage() {
    const next = !degraded;
    setSimulatedOutage(next);
    setDegraded(next);
  }

  return (
    <>
      {degraded && (
        <div id="degraded-banner">
          <span>⚠ Simulated central-platform outage — showing last-known state. Local recording is unaffected.</span>
          <button onClick={toggleOutage}>Dismiss</button>
        </div>
      )}
      <div id="topbar">
        <div className="tb-stat">
          <span className="dot" style={{ background: "var(--ok)" }} />
          Cameras online <b>{onlineCount}/{totalCount}</b>
        </div>
        <div className="tb-stat">
          <span className="dot" style={{ background: critical ? "var(--crit)" : "var(--muted2)" }} />
          Needs attention <b>{critical}</b>
        </div>
        <div className="tb-stat">
          <span className="dot" style={{ background: newAlerts ? "var(--crit)" : "var(--muted2)" }} />
          New alerts <b>{newAlerts}</b>
        </div>
        <div className="tb-stat" style={{ color: "var(--muted2)" }}>
          Scope: {config.scope}
        </div>
        <div id="sim-toggle">
          <button onClick={toggleOutage}>{degraded ? "Restore central platform" : "Simulate outage"}</button>
        </div>
      </div>
    </>
  );
}
