import { getCameras } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import { useRole } from "../context/RoleContext";
import { ErrorPanel, SkeletonRows } from "../components/common/LoadingAndError";
import { HealthBadge, CapabilityBadge } from "../components/common/Badges";

export default function Health() {
  const { scopeCameras } = useRole();
  const { data, loading, error, reload } = useApiData(getCameras);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Camera Health & System Status</div>
          <div className="page-desc">
            Reachability, stream quality and analytics-capability probes, refreshed every few minutes.
          </div>
        </div>
      </div>

      {error && <ErrorPanel message={error} onRetry={reload} />}
      {!error && loading && <SkeletonRows count={6} height={40} />}
      {!error && !loading && data && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Camera</th>
                <th>District</th>
                <th>Status</th>
                <th>FPS</th>
                <th>7d Uptime</th>
                <th>ANPR cap.</th>
                <th>Face cap.</th>
                <th>Last probe</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scopeCameras(data).map((c) => (
                <tr key={c.id} className="row-hover">
                  <td>
                    {c.name}
                    <div className="mono" style={{ color: "var(--muted2)", fontSize: 10.5 }}>
                      {c.id}
                    </div>
                  </td>
                  <td>{c.district}</td>
                  <td>
                    <HealthBadge health={c.health} />
                  </td>
                  <td className="mono">{c.fps}</td>
                  <td className="mono">{c.uptime7d}%</td>
                  <td>
                    <CapabilityBadge level={c.anpr} />
                  </td>
                  <td>
                    <CapabilityBadge level={c.face} />
                  </td>
                  <td className="mono" style={{ color: "var(--muted2)" }}>
                    {c.lastProbe}
                  </td>
                  <td>
                    {c.health !== "healthy" && (
                      <button className="btn small" onClick={() => alert(`Maintenance ticket logged for ${c.id}`)}>
                        Log maintenance
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
