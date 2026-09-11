"use client";

export function Loader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 justify-center">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}

export function EmptyState({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {
  return (
    <div className="empty">
      <div className="logo-mark mx-auto mb-3" style={{ width: 42, height: 42 }}>
        IM
      </div>
      <strong className="block" style={{ color: "var(--text)" }}>{title}</strong>
      {text ? <p className="mt-2 mb-0">{text}</p> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  let cls = "badge-in";
  if (status === "Low Stock") cls = "badge-low";
  if (status === "Out of Stock") cls = "badge-out";
  return <span className={`badge ${cls}`}>{status}</span>;
}
