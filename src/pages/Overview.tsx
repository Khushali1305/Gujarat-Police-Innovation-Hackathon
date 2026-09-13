import { useNavigate } from "react-router-dom";
import { getCameras, getAlerts } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import { useRole } from "../context/RoleContext";
import { ErrorPanel, EmptyState } from "../components/common/LoadingAndError";
import { HealthBadge, StatusBadge } from "../components/common/Badges";
import { formatTime } from "../lib/format";

export default function Overview() {
  const navigate = useNavigate();
  const { scopeCameras, scopeAlerts } = useRole();
  const cameras = useApiData(getCameras);
  const alertsRes = useApiData(getAlerts);

  const loading = cameras.loading || alertsRes.loading;
  const error = cameras.error || alertsRes.error;

  if (error) {
    return (
      <>
        <PageHead />
        <ErrorPanel message={error} onRetry={() => { cameras.reload(); alertsRes.reload(); }} />
      </>
    );
  }

  if (loading || !cameras.data || !alertsRes.data) {
    return (
      <>
        <PageHead />
        <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div className="card" key={i}>
              <div className="skel" style={{ height: 60 }} />
            </div>
          ))}
        </div>
      </>
    );
  }

  const scopedCams = scopeCameras(cameras.data);
  const scopedAlerts = scopeAlerts(alertsRes.data, scopedCams);
  const online = scopedCams.filter((c) => c.online).length;
  const newAlerts = scopedAlerts.filter((a) => a.status === "new").length;
  const critical = scopedCams.filter((c) => c.health === "critical" || c.health === "offline").length;
  const avgUptime = (scopedCams.reduce((s, c) => s + parseFloat(c.uptime7d), 0) / scopedCams.length).toFixed(1);
  const districtCount = new Set(scopedCams.map((c) => c.district)).size;
  const attentionCams = scopedCams.filter((c) => c.health !== "healthy").slice(0, 6);
  const recentAlerts = scopedAlerts.slice(0, 6);

  return (
    <>
      <PageHead />
      <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">Cameras online</div>
          <div className="kpi-value">
            {online}
            <span style={{ color: "var(--muted2)", fontSize: 16 }}>/{scopedCams.length}</span>
          </div>
          <div className="kpi-label">across {districtCount} districts</div>
        </div>
        <div className="card">
          <div className="card-title">New alerts</div>
          <div className="kpi-value" style={{ color: newAlerts ? "var(--crit)" : "var(--text)" }}>
            {newAlerts}
          </div>
          <div className="kpi-label">awaiting acknowledgement</div>
        </div>
        <div className="card">
          <div className="card-title">Needs attention</div>
          <div className="kpi-value" style={{ color: critical ? "var(--warn)" : "var(--text)" }}>
            {critical}
          </div>
          <div className="kpi-label">critical / offline cameras</div>
        </div>
        <div className="card">
          <div className="card-title">7-day uptime</div>
          <div className="kpi-value">{avgUptime}%</div>
          <div className="kpi-label">fleet average</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Recent alerts</div>
            <a onClick={() => navigate("/alerts")} style={{ fontSize: 12 }}>
              View all →
            </a>
          </div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Identifier</th>
                <th>Camera</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.map((a) => (
                <tr key={a.id} className="row-hover" style={{ cursor: "pointer" }} onClick={() => navigate(`/alerts?open=${a.id}`)}>
                  <td className="mono">{formatTime(a.time)}</td>
                  <td style={{ textTransform: "capitalize" }}>{a.type}</td>
                  <td className="mono">{a.identifier}</td>
                  <td>{a.camera.name}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Cameras needing attention</div>
            <a onClick={() => navigate("/health")} style={{ fontSize: 12 }}>
              View all →
            </a>
          </div>
          {attentionCams.length === 0 ? (
            <EmptyState message="All cameras in your scope are healthy." />
          ) : (
            attentionCams.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <div>
                  <div style={{ fontSize: 12.5 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted2)" }}>
                    {c.district} · {c.id}
                  </div>
                </div>
                <HealthBadge health={c.health} />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function PageHead() {
  return (
    <div className="page-head">
      <div>
        <div className="page-title">Overview</div>
        <div className="page-desc">Statewide intelligence summary for your assigned scope.</div>
      </div>
    </div>
  );
}
