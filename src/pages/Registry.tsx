import { useNavigate } from "react-router-dom";
import { getCameras } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import { ErrorPanel, SkeletonRows } from "../components/common/LoadingAndError";
import { HealthBadge } from "../components/common/Badges";

export default function Registry() {
  const { data, loading, error, reload } = useApiData(getCameras);
  const navigate = useNavigate();

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Camera Registry</div>
          <div className="page-desc">
            {loading ? "Loading…" : `${data?.length ?? 0} onboarded cameras statewide. Metadata drives the GIS layer and analytics policy.`}
          </div>
        </div>
        <button
          className="btn primary"
          onClick={() => alert("Bulk CSV / API onboarding flow — same validation as manual entry.")}
        >
          + Onboard camera
        </button>
      </div>

      {error && <ErrorPanel message={error} onRetry={reload} />}
      {!error && loading && <SkeletonRows count={6} height={40} />}
      {!error && !loading && data && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>District</th>
                <th>Scene type</th>
                <th>Lat / Lon</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="row-hover">
                  <td className="mono">{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.district}</td>
                  <td>{c.scene}</td>
                  <td className="mono" style={{ color: "var(--muted2)" }}>
                    {c.lat.toFixed(4)}, {c.lon.toFixed(4)}
                  </td>
                  <td>
                    <HealthBadge health={c.health} />
                  </td>
                  <td>
                    <button className="btn small" onClick={() => navigate(`/gis?focus=${c.id}`)}>
                      View on map
                    </button>
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
