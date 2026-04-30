import Link from 'next/link';

export type DashboardFeedLane = {
  feedKey: string;
  label: string;
  description: string;
  route: string;
  count: number;
  priority: 'primary' | 'secondary';
};

export default function DashboardFeedWidget({
  title,
  subtitle,
  lanes,
}: {
  title: string;
  subtitle: string;
  lanes: DashboardFeedLane[];
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[24px] border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C] sm:rounded-[28px] sm:border-[4px] sm:shadow-[10px_10px_0px_#060E1C]">
      <div className="border-b-[4px] border-dark bg-sky-100 p-4 sm:p-6">
        <h2 className="text-xl font-black tracking-tight text-dark sm:text-2xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm font-bold text-dark/70">{subtitle}</p>
      </div>
      <div className="grid gap-3 p-4 sm:gap-4 sm:p-6">
        {lanes.map((lane) => (
          <Link
            key={lane.feedKey}
            href={lane.route}
            className="rounded-2xl border-[3px] border-dark bg-off-white p-4 shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none sm:p-5 sm:shadow-[4px_4px_0px_#060E1C]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-dark">{lane.label}</p>
                <p className="mt-1 text-xs font-bold leading-relaxed text-dark/65">{lane.description}</p>
              </div>
              <span
                className={`shrink-0 rounded-xl border-[2px] border-dark px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C] ${
                  lane.priority === 'primary' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
                }`}
              >
                {lane.count}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
