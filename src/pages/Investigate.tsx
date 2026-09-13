import { useState } from "react";
import { runNaturalLanguageQuery } from "../api/client";
import type { NLQueryResult } from "../api/client";
import { formatTime } from "../lib/format";
import { EmptyState } from "../components/common/LoadingAndError";

const NL_EXAMPLES = [
  "Show all sightings of GJ01AB1234 in the last 7 days",
  "List cameras in Surat with poor ANPR capability",
  "Which alerts are still unacknowledged in Ahmedabad?",
];

export default function Investigate() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<NLQueryResult | null>(null);
  const [loading, setLoading] = useState(false);

  function run() {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setResult(null);
    runNaturalLanguageQuery(q).then((res) => {
      setResult(res);
      setLoading(false);
    });
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Natural-Language Investigation</div>
          <div className="page-desc">
            Runs as a read-only, schema-scoped query against your permitted jurisdiction. Nothing here can modify data.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <textarea
          className="input"
          rows={2}
          placeholder="e.g. Show all sightings of GJ01AB1234 in the last 7 days"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn primary" onClick={run}>
            Run query
          </button>
          <span style={{ color: "var(--muted2)", fontSize: 11.5 }}>
            Try:{" "}
            {NL_EXAMPLES.map((e, i) => (
              <span key={e}>
                <a onClick={() => setQuestion(e)}>{e}</a>
                {i < NL_EXAMPLES.length - 1 ? " · " : ""}
              </span>
            ))}
          </span>
        </div>
      </div>

      {loading && (
        <div className="card">
          <div className="skel" style={{ height: 80 }} />
        </div>
      )}

      {!loading && result && (
        <>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-title" style={{ marginBottom: 6 }}>
              Generated query (validated, read-only)
            </div>
            <pre
              className="mono"
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 11.5,
                color: "var(--muted)",
                background: "var(--panel2)",
                padding: 10,
                borderRadius: 5,
                border: "1px solid var(--line)",
              }}
            >
              {result.generatedSql}
            </pre>
            <div style={{ fontSize: 11, color: "var(--muted2)", marginTop: 6 }}>
              Row-level security applied · {result.rowCount} rows returned · logged to investigation history
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 8 }}>
              Results
            </div>
            {result.rows.length === 0 ? (
              <EmptyState message="No matching rows for this query in your jurisdiction." />
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Identifier</th>
                    <th>Camera</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((a) => (
                    <tr key={a.id} className="row-hover">
                      <td className="mono">{formatTime(a.time)}</td>
                      <td>{a.type}</td>
                      <td className="mono">{a.identifier}</td>
                      <td>{a.camera.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  );
}
