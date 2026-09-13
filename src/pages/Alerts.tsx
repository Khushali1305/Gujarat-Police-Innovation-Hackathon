import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAlerts } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import { useRole } from "../context/RoleContext";
import { ErrorPanel, SkeletonRows, EmptyState } from "../components/common/LoadingAndError";
import { StatusBadge, PriorityBadge } from "../components/common/Badges";
import { formatTime } from "../lib/format";
import type { AlertItem, AlertStatus } from "../types";
import AlertDetailModal from "../components/alerts/AlertDetailModal";

export default function Alerts() {
  const { scopeCameras, scopeAlerts } = useRole();
  const { data, loading, error, reload } = useApiData(getAlerts);
  const [statusFilter, setStatusFilter] = useState("");
  const [localAlerts, setLocalAlerts] = useState<AlertItem[] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const scopedAlerts = useMemo(() => {
    const source = localAlerts ?? data;
    if (!source) return [];
    return scopeAlerts(source, scopeCameras(source.map((a) => a.camera)));
  }, [localAlerts, data, scopeAlerts, scopeCameras]);

  const filtered = statusFilter ? scopedAlerts.filter((a) => a.status === statusFilter) : scopedAlerts;

  // Sync local state once real data lands, so status updates can be
  // reflected immediately without waiting on a full refetch.
  if (data && localAlerts === null) {
    setLocalAlerts(data);
  }

  const openId = searchParams.get("open");
  const openAlert = openId ? scopedAlerts.find((a) => a.id === openId) ?? null : null;

  function handleStatusChange(id: string, status: AlertStatus) {
    setLocalAlerts((prev) => (prev ? prev.map((a) => (a.id === id ? { ...a, status } : a)) : prev));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Alerts & Investigation</div>
          <div className="page-desc">{loading ? "Loading…" : `${scopedAlerts.length} alerts in scope.`}</div>
        </div>
        {!loading && !error && (
          <select className="input" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="new">new</option>
            <option value="acknowledged">acknowledged</option>
            <option value="escalated">escalated</option>
            <option value="closed">closed</option>
          </select>
        )}
      </div>

      {error && <ErrorPanel message={error} onRetry={reload} />}
      {!error && loading && <SkeletonRows count={6} height={40} />}

      {!error && !loading && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Identifier</th>
                <th>Camera</th>
                <th>Match</th>
                <th>Confidence</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState message="No alerts match this filter." />
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="row-hover" style={{ cursor: "pointer" }} onClick={() => setSearchParams({ open: a.id })}>
                    <td className="mono">{formatTime(a.time)}</td>
                    <td style={{ textTransform: "capitalize" }}>{a.type}</td>
                    <td className="mono">{a.identifier}</td>
                    <td>
                      {a.camera.name}
                      <div style={{ color: "var(--muted2)", fontSize: 10.5 }}>{a.camera.district}</div>
                    </td>
                    <td style={{ color: "var(--muted)" }}>{a.matchType}</td>
                    <td className="mono">{a.confidence}%</td>
                    <td>
                      <PriorityBadge priority={a.priority} />
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {openAlert && (
        <AlertDetailModal
          alert={openAlert}
          onClose={() => setSearchParams({})}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
