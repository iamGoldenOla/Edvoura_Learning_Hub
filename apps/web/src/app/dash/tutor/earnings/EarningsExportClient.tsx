'use client';

import { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';

type PayoutRow = {
  id: string;
  period_start: string;
  period_end: string;
  amount_minor: number;
  currency_code: string;
  status: string;
  created_at: string;
};

export function EarningsExportClient({ payouts }: { payouts: PayoutRow[] }) {
  const hasDownloaded = useRef(false);

  const downloadCsv = () => {
    const header = 'Payout ID,Period Start,Period End,Amount,Currency,Status,Created At';
    const rows = payouts.map(p =>
      `${p.id},${p.period_start},${p.period_end},${(p.amount_minor / 100).toFixed(2)},${p.currency_code},${p.status},${p.created_at}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edvoura-payouts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!hasDownloaded.current && payouts.length > 0) {
      hasDownloaded.current = true;
      downloadCsv();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-emerald-100 p-4 sm:p-5 text-sm font-bold text-dark shadow-[4px_4px_0px_#060E1C] break-words">
      <p className="font-black mb-1 flex items-center gap-2"><Download className="h-4 w-4" /> CSV Export</p>
      <p>Your payout data has been downloaded as a CSV file. If the download didn&apos;t start, <button onClick={downloadCsv} className="underline font-black text-blue-700">click here</button>.</p>
    </section>
  );
}
