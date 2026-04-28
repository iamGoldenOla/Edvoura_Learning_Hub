"use client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function renderStringList(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm font-semibold text-dark/80">
      {items.map((item, index) => (
        <li key={`${String(item)}-${index}`}>{String(item)}</li>
      ))}
    </ul>
  );
}

function renderResources(materials: unknown) {
  if (!isRecord(materials)) return null;

  const youtube = Array.isArray(materials.youtube_videos) ? materials.youtube_videos : [];
  const images = Array.isArray(materials.image_resources) ? materials.image_resources : [];
  const classroom = Array.isArray(materials.classroom_materials) ? materials.classroom_materials : [];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">YouTube</p>
        <div className="space-y-3">
          {youtube.map((item, index) => {
            const row = isRecord(item) ? item : {};
            const title = String(row.title ?? "Suggested video");
            const url = String(row.url ?? "#");
            const why = String(row.why_it_helps ?? "");
            return (
              <div key={`${title}-${index}`} className="rounded-lg border border-dark/20 bg-white p-3">
                <a href={url} target="_blank" rel="noreferrer" className="text-sm font-black text-dark underline">
                  {title}
                </a>
                {why ? <p className="mt-1 text-xs font-semibold text-dark/70">{why}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">Images</p>
        <div className="space-y-3">
          {images.map((item, index) => {
            const row = isRecord(item) ? item : {};
            const title = String(row.title ?? "Suggested image");
            const url = String(row.url ?? "#");
            const why = String(row.why_it_helps ?? "");
            return (
              <div key={`${title}-${index}`} className="rounded-lg border border-dark/20 bg-white p-3">
                <a href={url} target="_blank" rel="noreferrer" className="text-sm font-black text-dark underline">
                  {title}
                </a>
                {why ? <p className="mt-1 text-xs font-semibold text-dark/70">{why}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">Classroom Materials</p>
        {renderStringList(classroom)}
      </div>
    </div>
  );
}

export default function AIContentPreview({
  content,
  title = "Generated Content Preview",
}: {
  content: unknown;
  title?: string;
}) {
  const record = isRecord(content) ? content : null;

  return (
    <section className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C]">
      <div className="mb-4 border-b-[2px] border-dark pb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-dark/60">
          {title}
        </p>
      </div>

      {record ? (
        <div className="space-y-5">
          {typeof record.title === "string" ? (
            <div>
              <h3 className="text-2xl font-black text-dark">{record.title}</h3>
              {typeof record.lesson_summary === "string" ? (
                <p className="mt-2 text-sm font-semibold text-dark/70">{record.lesson_summary}</p>
              ) : null}
            </div>
          ) : null}

          {typeof record.explanation === "string" ? (
            <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">Explanation</p>
              <p className="text-sm font-semibold leading-7 text-dark/80">{record.explanation}</p>
            </div>
          ) : null}

          {record.key_points ? (
            <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">Key Points</p>
              {renderStringList(record.key_points)}
            </div>
          ) : null}

          {record.lesson_objectives ? (
            <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">Lesson Objectives</p>
              {renderStringList(record.lesson_objectives)}
            </div>
          ) : null}

          {record.instructional_materials ? renderResources(record.instructional_materials) : null}

          <details className="rounded-xl border-[2px] border-dark bg-slate-50 p-4">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-dark/70">
              Raw JSON
            </summary>
            <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap text-[11px] font-mono">
              {JSON.stringify(content, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border-[2px] border-dark bg-slate-50 p-4 text-[11px] font-mono">
          {JSON.stringify(content, null, 2)}
        </pre>
      )}
    </section>
  );
}
