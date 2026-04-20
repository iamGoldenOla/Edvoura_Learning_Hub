'use client';

import { useMemo, useState } from 'react';
import { Globe2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TutorClassItem = {
  id: string;
  title: string;
  learners: number;
  duration: string;
  startAtIso: string;
};

const timezoneOptions = [
  'Africa/Lagos',
  'Europe/London',
  'America/New_York',
  'America/Toronto',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
];

const formatInZone = (iso: string, zone: string) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: zone,
    hour12: false,
  }).format(new Date(iso));

export default function TutorTimezonePanel({
  classes,
  defaultTimezone,
}: {
  classes: TutorClassItem[];
  defaultTimezone: string;
}) {
  const normalizedDefault = timezoneOptions.includes(defaultTimezone) ? defaultTimezone : 'UTC';
  const [activeTimezone, setActiveTimezone] = useState(normalizedDefault);

  const rows = useMemo(
    () =>
      classes.map((item) => ({
        ...item,
        localTime: formatInZone(item.startAtIso, activeTimezone),
        utcTime: formatInZone(item.startAtIso, 'UTC'),
      })),
    [classes, activeTimezone],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-slate-600" />
          Tutor Timezone Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Display Timezone</label>
          <select
            value={activeTimezone}
            onChange={(event) => setActiveTimezone(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
          >
            {timezoneOptions.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
            {!timezoneOptions.includes(normalizedDefault) ? <option value={normalizedDefault}>{normalizedDefault}</option> : null}
          </select>
        </div>

        <p className="text-xs text-slate-600">
          Schedule renders in <span className="font-semibold text-slate-800">{activeTimezone}</span> for diaspora tutors and learners.
        </p>

        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{row.title}</p>
              <p className="text-xs text-slate-600">
                {row.learners} students | {row.duration}
              </p>
              <p className="mt-1 text-xs text-slate-700">
                Local: <span className="font-semibold">{row.localTime}</span> | UTC: <span className="font-semibold">{row.utcTime}</span>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
