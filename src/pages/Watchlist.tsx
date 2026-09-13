import { useState } from "react";
import { getWatchlist, addWatchlistEntry } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import { ErrorPanel, SkeletonRows } from "../components/common/LoadingAndError";
import { PriorityBadge } from "../components/common/Badges";
import type { AlertType, NewWatchlistEntry, Priority, WatchlistEntry } from "../types";

export default function Watchlist() {
  const { data, loading, error, reload } = useApiData(getWatchlist);
  const [entries, setEntries] = useState<WatchlistEntry[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewWatchlistEntry>({ type: "vehicle", value: "", reason: "", priority: "High" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  if (data && entries === null) setEntries(data);
  const list = entries ?? [];

  function submit() {
    setSaving(true);
    setSaveMsg("Saving…");
    addWatchlistEntry(form)
      .then((saved) => {
        setEntries((prev) => [saved, ...(prev ?? [])]);
        setSaveMsg("Saved.");
        setSaving(false);
        setTimeout(() => {
          setSaveMsg("");
          setShowForm(false);
          setForm({ type: "vehicle", value: "", reason: "", priority: "High" });
        }, 700);
      })
      .catch((err: Error) => {
        setSaveMsg("Failed to save — " + err.message);
        setSaving(false);
      });
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Watchlist Management</div>
          <div className="page-desc">
            {loading ? "Loading…" : `${list.length} active entries · matched continuously against live detections.`}
          </div>
        </div>
        <button className="btn primary" onClick={() => setShowForm((s) => !s)}>
          + Add entry
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 10 }}>
            <div>
              <label className="field-label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AlertType })}>
                <option value="vehicle">Vehicle</option>
                <option value="person">Person</option>
              </select>
            </div>
            <div>
              <label className="field-label">Plate / description</label>
              <input
                className="input"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="GJ01AB1234 or description"
              />
            </div>
            <div>
              <label className="field-label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <label className="field-label">Reason / case reference</label>
          <input
            className="input"
            style={{ marginBottom: 10 }}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="FIR number, case reference, or reason"
          />
          <button className="btn primary" disabled={saving} onClick={submit}>
            Save to watchlist
          </button>
          <span style={{ marginLeft: 10, fontSize: 12, color: "var(--muted)" }}>{saveMsg}</span>
        </div>
      )}

      {error && <ErrorPanel message={error} onRetry={reload} />}
      {!error && loading && <SkeletonRows count={4} height={40} />}
      {!error && !loading && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Value</th>
                <th>Reason</th>
                <th>Priority</th>
                <th>Added by</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {list.map((w) => (
                <tr key={w.id} className="row-hover">
                  <td className="mono">{w.id}</td>
                  <td style={{ textTransform: "capitalize" }}>{w.type}</td>
                  <td className="mono">{w.value}</td>
                  <td>{w.reason}</td>
                  <td>
                    <PriorityBadge priority={w.priority} />
                  </td>
                  <td>{w.addedBy}</td>
                  <td className="mono" style={{ color: "var(--muted2)" }}>
                    {w.date}
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
