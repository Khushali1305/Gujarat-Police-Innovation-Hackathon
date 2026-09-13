import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AlertItem, AlertStatus, EvidencePackage } from "../../types";
import { getEvidence, updateAlertStatus } from "../../api/client";
import { StatusBadge, PriorityBadge } from "../common/Badges";
import { ErrorPanel } from "../common/LoadingAndError";
import { formatTime } from "../../lib/format";

interface Props {
  alert: AlertItem;
  onClose: () => void;
  onStatusChange: (id: string, status: AlertStatus) => void;
}

export default function AlertDetailModal({ alert, onClose, onStatusChange }: Props) {
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<EvidencePackage | null>(null);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setEvidence(null);
    setEvidenceError(null);
    getEvidence(alert.id)
      .then(setEvidence)
      .catch((err: Error) => setEvidenceError(err.message));
  }, [alert.id]);

  function act(next: AlertStatus) {
    setUpdating(true);
    updateAlertStatus(alert.id, next)
      .then((res) => {
        onStatusChange(alert.id, res.status);
        setUpdating(false);
      })
      .catch(() => setUpdating(false));
  }

  function traceOnMap() {
    onClose();
    navigate(`/gis?trace=${encodeURIComponent(alert.identifier)}`);
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700 }}>{alert.id} · {alert.type === "vehicle" ? "Vehicle" : "Person"} alert</div>
            <div className="mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{alert.identifier}</div>
          </div>
          <button className="btn small" onClick={onClose}>Close ✕</button>
        </div>

        <div style={{ padding: "16px 18px" }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 14 }}>
            <Field label="Camera" value={`${alert.camera.name} (${alert.camera.district})`} />
            <Field label="Time" mono value={formatTime(alert.time)} />
            <Field label="Match type" value={alert.matchType} />
            <Field label="Confidence" mono value={`${alert.confidence}%`} />
            <div>
              <div className="field-label">Priority</div>
              <PriorityBadge priority={alert.priority} />
            </div>
            <div>
              <div className="field-label">Status</div>
              {updating ? <span className="badge b-muted">Updating…</span> : <StatusBadge status={alert.status} />}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-title" style={{ marginBottom: 8 }}>Evidence</div>
            {evidenceError && <ErrorPanel message={"Evidence service unavailable: " + evidenceError} onRetry={() => {
              setEvidenceError(null);
              getEvidence(alert.id).then(setEvidence).catch((err: Error) => setEvidenceError(err.message));
            }} />}
            {!evidenceError && !evidence && (
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="skel" style={{ height: 100 }} />
                <div className="skel" style={{ height: 100 }} />
              </div>
            )}
            {!evidenceError && evidence && (
              <>
                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 10 }}>
                  <div
                    style={{
                      height: 100,
                      background: "repeating-linear-gradient(135deg,#0F171D,#0F171D 8px,#151F26 8px,#151F26 16px)",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--muted2)",
                      fontSize: 11,
                    }}
                  >
                    Original frame
                  </div>
                  <div
                    style={{
                      height: 100,
                      background: evidence.enhanced
                        ? "repeating-linear-gradient(135deg,#0F1F1B,#0F1F1B 8px,#122921 8px,#122921 16px)"
                        : "#171F25",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--muted2)",
                      fontSize: 11,
                    }}
                  >
                    {evidence.enhanced ? "Enhanced (supportive only)" : "No enhancement available"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button className="btn small">{evidence.clipAvailable ? "Play evidence clip" : "Clip unavailable"}</button>
                  <button className="btn small">Request original source footage</button>
                </div>
                <div className="field-label">Chain of custody</div>
                {evidence.chain.map((c, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: "var(--muted)", padding: "3px 0" }}>
                    • {c.action} — <span style={{ color: "var(--muted2)" }}>{c.by}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary" disabled={updating} onClick={() => act("acknowledged")}>Acknowledge</button>
            <button className="btn" disabled={updating} onClick={() => act("escalated")}>Escalate</button>
            <button className="btn danger" disabled={updating} onClick={() => act("closed")}>Close</button>
            <button className="btn" style={{ marginLeft: "auto" }} onClick={traceOnMap}>Trace on map →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <div className={mono ? "mono" : undefined}>{value}</div>
    </div>
  );
}
