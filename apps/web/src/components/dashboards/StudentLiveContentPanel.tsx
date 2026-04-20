'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

type LiveContent = {
  headline: string;
  agenda: string;
  explanation: string;
  classTask: string;
  homework: string;
  resourceUrl: string;
  updatedAt: string;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export default function StudentLiveContentPanel() {
  const [content, setContent] = useState<LiveContent | null>(null);

  useEffect(() => {
    const readContent = async () => {
      try {
        const latest = await apiClient.get<LiveContent | null>('/communications/live-content/current');
        setContent(latest);
      } catch {
        setContent(null);
      }
    };

    void readContent();
    const timer = setInterval(() => {
      void readContent();
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  if (!content) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        No live tutor content published yet for this session.
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">From Your Tutor Now</p>
      <h3 className="text-sm font-semibold text-slate-900">{content.headline}</h3>
      <p className="text-xs text-slate-700"><strong>Agenda:</strong> {content.agenda}</p>
      <p className="text-xs text-slate-700"><strong>Key Point:</strong> {content.explanation}</p>
      <p className="text-xs text-slate-700"><strong>Class Task:</strong> {content.classTask}</p>
      <p className="text-xs text-slate-700"><strong>Homework:</strong> {content.homework}</p>
      {content.resourceUrl ? (
        <a
          href={content.resourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-xs font-semibold text-blue-700 hover:underline"
        >
          Open Tutor Resource
        </a>
      ) : null}
      <p className="text-[11px] text-slate-500">Updated: {formatTime(content.updatedAt)}</p>
    </div>
  );
}
