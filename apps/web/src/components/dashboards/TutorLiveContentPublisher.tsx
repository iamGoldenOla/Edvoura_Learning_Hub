'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

type LiveContent = {
  headline: string;
  agenda: string;
  explanation: string;
  classTask: string;
  homework: string;
  resourceUrl: string;
  updatedAt: string;
};

export default function TutorLiveContentPublisher() {
  const supabase = useMemo(() => createClient(), []);
  const [headline, setHeadline] = useState('Today we are learning fractions with visual models.');
  const [agenda, setAgenda] = useState('1) Starter drill 2) Worked examples 3) Guided practice 4) Exit ticket');
  const [explanation, setExplanation] = useState('Focus on finding common denominators before adding fractions.');
  const [classTask, setClassTask] = useState('Solve worksheet A, questions 1 to 8. Submit before class ends.');
  const [homework, setHomework] = useState('Worksheet A, questions 9 to 15.');
  const [resourceUrl, setResourceUrl] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadCurrent = async () => {
      try {
        const { data } = await supabase
          .from('live_content')
          .select('headline, agenda, explanation, class_task, homework, resource_url, updated_at')
          .eq('is_current', true)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!data) return;
        setHeadline(data.headline ?? '');
        setAgenda(data.agenda ?? '');
        setExplanation(data.explanation ?? '');
        setClassTask(data.class_task ?? '');
        setHomework(data.homework ?? '');
        setResourceUrl(data.resource_url ?? '');
      } catch {
        // Keep default draft if unavailable
      }
    };

    void loadCurrent();
  }, [supabase]);

  const publish = async () => {
    if (!headline.trim() || !agenda.trim() || !classTask.trim()) {
      setFeedback('Please fill at least headline, agenda, and class task before publishing.');
      return;
    }

    setIsSaving(true);
    setFeedback('');
    try {
      // Mark all existing as not current
      await supabase
        .from('live_content')
        .update({ is_current: false })
        .eq('is_current', true);

      // Insert new current content
      const { error } = await supabase.from('live_content').insert({
        headline: headline.trim(),
        agenda: agenda.trim(),
        explanation: explanation.trim(),
        class_task: classTask.trim(),
        homework: homework.trim(),
        resource_url: resourceUrl.trim() || null,
        is_current: true,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      setFeedback('Live teaching content published to student dashboard.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Failed to publish live content.');
    } finally {
      setIsSaving(false);
    }
  };

  const clearPublished = async () => {
    setIsSaving(true);
    setFeedback('');
    try {
      await supabase
        .from('live_content')
        .update({ is_current: false })
        .eq('is_current', true);

      setFeedback('Live teaching content cleared.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Failed to clear live content.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Live Content To Student Dashboard</h3>
      <p className="mt-1 text-xs text-slate-600">
        Publish what students should see during this lesson.
      </p>

      <div className="mt-3 space-y-2">
        <input
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          placeholder="Lesson headline"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        />
        <textarea
          value={agenda}
          onChange={(event) => setAgenda(event.target.value)}
          placeholder="Lesson agenda"
          rows={2}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        />
        <textarea
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          placeholder="Key explanation points"
          rows={2}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        />
        <textarea
          value={classTask}
          onChange={(event) => setClassTask(event.target.value)}
          placeholder="In-class task"
          rows={2}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        />
        <textarea
          value={homework}
          onChange={(event) => setHomework(event.target.value)}
          placeholder="Homework"
          rows={2}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        />
        <input
          value={resourceUrl}
          onChange={(event) => setResourceUrl(event.target.value)}
          placeholder="Resource URL (optional)"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="primary" className="text-xs" onClick={() => void publish()} disabled={isSaving}>
          Publish To Students
        </Button>
        {resourceUrl ? (
          <Button
            variant="outline"
            className="border-slate-300 bg-white text-xs"
            onClick={() => {
              setResourceUrl('');
              setFeedback('Resource link removed from draft.');
            }}
            disabled={isSaving}
          >
            Remove Resource Link
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="border-slate-300 bg-white text-xs"
          onClick={() => void clearPublished()}
          disabled={isSaving}
        >
          Clear Published Content
        </Button>
      </div>

      {feedback ? <p className="mt-2 text-xs font-medium text-blue-700">{feedback}</p> : null}
    </div>
  );
}
