"use client";

export default function AIContentPreview({
  content,
  title = "Generated Content Preview",
}: {
  content: unknown;
  title?: string;
}) {
  return (
    <section className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C]">
      <div className="mb-3 border-b-[2px] border-dark pb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-dark/60">
          {title}
        </p>
      </div>
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border-[2px] border-dark bg-slate-50 p-4 text-[11px] font-mono">
        {JSON.stringify(content, null, 2)}
      </pre>
    </section>
  );
}
