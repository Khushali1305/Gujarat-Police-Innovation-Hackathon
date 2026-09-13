import { useMemo, useState } from "react";
import { getCameras } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import { useRole } from "../context/RoleContext";
import { ErrorPanel, EmptyState } from "../components/common/LoadingAndError";
import { HealthBadge } from "../components/common/Badges";
import { useNavigate } from "react-router-dom";
import type { Camera } from "../types";

export default function LiveView() {
  const { scopeCameras } = useRole();
  const { data, loading, error, reload } = useApiData(getCameras);
  const [districtFilter, setDistrictFilter] = useState("");
  const navigate = useNavigate();

  const scoped = useMemo(() => (data ? scopeCameras(data) : []), [data, scopeCameras]);
  const districts = useMemo(() => [...new Set(scoped.map((c) => c.district))], [scoped]);
  const filtered = districtFilter ? scoped.filter((c) => c.district === districtFilter) : scoped;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Multi-Camera Live View</div>
          <div className="page-desc">
            {loading ? "Loading feeds…" : `${filtered.length} feeds in scope · click a tile to inspect health.`}
          </div>
        </div>
        {!loading && !error && (
          <select className="input" style={{ width: 180 }} value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        )}
      </div>

      {error && <ErrorPanel message={error} onRetry={reload} />}

      {!error && (
        <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          {loading
            ? [1, 2, 3, 4, 5, 6].map((i) => (
                <div className="card" key={i}>
                  <div className="skel" style={{ height: 150 }} />
                </div>
              ))
            : filtered.length === 0
            ? <EmptyState message="No cameras match this filter." />
            : filtered.map((c) => <LiveTile key={c.id} camera={c} onClick={() => navigate("/health")} />)}
        </div>
      )}
    </>
  );
}

function LiveTile({ camera, onClick }: { camera: Camera; onClick: () => void }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }} onClick={onClick}>
      <div
        style={{
          height: 130,
          background: camera.online
            ? "repeating-linear-gradient(135deg,#0F171D,#0F171D 10px,#121C23 10px,#121C23 20px)"
            : "#1A1214",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {camera.online ? (
          <span style={{ color: "var(--muted2)", fontSize: 11 }}>{camera.fps} fps · simulated feed</span>
        ) : (
          <span style={{ color: "var(--crit)", fontSize: 12 }}>Feed unavailable</span>
        )}
        <span style={{ position: "absolute", top: 8, left: 8 }}>
          <HealthBadge health={camera.health} />
        </span>
        <span className="mono" style={{ position: "absolute", top: 8, right: 8, fontSize: 10, color: "var(--muted2)" }}>
          {camera.lastProbe}
        </span>
      </div>
      <div style={{ padding: "9px 11px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{camera.name}</div>
        <div className="mono" style={{ fontSize: 11, color: "var(--muted2)" }}>
          {camera.id} · {camera.district}
        </div>
      </div>
    </div>
  );
}
