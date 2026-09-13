export function SkeletonRows({ count = 4, height = 38 }: { count?: number; height?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skel" style={{ height, marginBottom: 8, borderRadius: 6 }} />
      ))}
    </>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="empty-state" style={{ borderColor: "#3A1917" }}>
      <div style={{ color: "var(--crit)", fontWeight: 600, marginBottom: 4 }}>Couldn't load this view</div>
      <div style={{ marginBottom: 10 }}>{message}</div>
      <button className="btn" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>;
}
