"use client";

const styles: Record<string, string> = {
  DRAFT: "bg-blue-100 text-blue-900 border-blue-300",
  PENDING_REVIEW: "bg-amber-100 text-amber-900 border-amber-300",
  APPROVED: "bg-emerald-100 text-emerald-900 border-emerald-300",
  REJECTED: "bg-rose-100 text-rose-900 border-rose-300",
  PUBLISHED: "bg-violet-100 text-violet-900 border-violet-300",
};

export default function AIStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const className = styles[normalized] || "bg-gray-100 text-gray-700 border-gray-300";
  return (
    <span
      className={`inline-flex items-center rounded-lg border-[2px] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${className}`}
    >
      {normalized}
    </span>
  );
}
