"use client";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="flex items-center gap-2 mt-4 flex-wrap">
      <button
        className="btn btn-outline btn-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`btn btn-sm ${p === page ? "" : "btn-outline"}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="btn btn-outline btn-sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
