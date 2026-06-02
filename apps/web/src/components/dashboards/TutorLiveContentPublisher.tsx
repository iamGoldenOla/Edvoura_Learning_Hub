'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

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
  const [activeTab, setActiveTab] = useState<'info' | 'tasks'>('info');

  useEffect(() => {
    const loadCurrent = async () => {
      try {
        const { data } = await supabase
          .from('tutor_live_content_posts')
          .select('headline, agenda, explanation, class_task, homework, resource_url, updated_at')
          .eq('is_active', true)
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
      setFeedback('Please fill at least Topic, Agenda, and Class Task before publishing.');
      return;
    }

    setIsSaving(true);
    setFeedback('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Mark all existing as not active
      await supabase
        .from('tutor_live_content_posts')
        .update({ is_active: false })
        .eq('is_active', true)
        .eq('tutor_user_id', user.id);

      // Insert new active content
      const { error } = await supabase.from('tutor_live_content_posts').insert({
        tutor_user_id: user.id,
        headline: headline.trim(),
        agenda: agenda.trim(),
        explanation: explanation.trim() || null,
        class_task: classTask.trim(),
        homework: homework.trim() || null,
        resource_url: resourceUrl.trim() || null,
        is_active: true,
      });

      if (error) throw error;
      setFeedback('Live teaching content published to student dashboard!');
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase
        .from('tutor_live_content_posts')
        .update({ is_active: false })
        .eq('is_active', true)
        .eq('tutor_user_id', user.id);

      setFeedback('Live teaching content cleared.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Failed to clear live content.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Brutalist Tab Selection */}
      <div className="flex gap-2 border-b-[3px] border-dark pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex-1 h-9 text-xs font-black uppercase tracking-wider border-[2px] border-dark rounded-xl transition-all ${
            activeTab === 'info'
              ? 'bg-yellow text-dark shadow-[2px_2px_0px_#060E1C]'
              : 'bg-white text-dark/70 hover:bg-slate-50'
          }`}
        >
          Topic & Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 h-9 text-xs font-black uppercase tracking-wider border-[2px] border-dark rounded-xl transition-all ${
            activeTab === 'tasks'
              ? 'bg-yellow text-dark shadow-[2px_2px_0px_#060E1C]'
              : 'bg-white text-dark/70 hover:bg-slate-50'
          }`}
        >
          Class Tasks
        </button>
      </div>

      {/* Form Fields container */}
      <div className="space-y-4">
        {activeTab === 'info' ? (
          <>
            <div className="space-y-1.5">
              <label htmlFor="live-headline" className="text-[10px] font-black uppercase tracking-widest text-dark/60">
                Lesson Topic / Headline
              </label>
              <input
                id="live-headline"
                type="text"
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="e.g. Fractions with visual models"
                className="w-full h-11 rounded-xl border-[2px] border-dark bg-white px-3 text-sm font-bold text-dark outline-none transition-all focus:bg-white focus:border-yellow"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="live-agenda" className="text-[10px] font-black uppercase tracking-widest text-dark/60">
                Lesson Agenda
              </label>
              <textarea
                id="live-agenda"
                value={agenda}
                onChange={(event) => setAgenda(event.target.value)}
                placeholder="e.g. 1) Starter drill 2) Core task 3) Exit ticket"
                rows={3}
                className="w-full rounded-xl border-[2px] border-dark bg-white px-3 py-2 text-sm font-bold text-dark outline-none transition-all focus:bg-white focus:border-yellow resize-none min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="live-resourceUrl" className="text-[10px] font-black uppercase tracking-widest text-dark/60">
                Resource Link (Optional)
              </label>
              <input
                id="live-resourceUrl"
                type="url"
                value={resourceUrl}
                onChange={(event) => setResourceUrl(event.target.value)}
                placeholder="e.g. Miro board, Worksheet PDF URL"
                className="w-full h-11 rounded-xl border-[2px] border-dark bg-white px-3 text-sm font-bold text-dark outline-none transition-all focus:bg-white focus:border-yellow"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <label htmlFor="live-explanation" className="text-[10px] font-black uppercase tracking-widest text-dark/60">
                Key Explanation Points
              </label>
              <textarea
                id="live-explanation"
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                placeholder="e.g. Remember to find common denominators first."
                rows={3}
                className="w-full rounded-xl border-[2px] border-dark bg-white px-3 py-2 text-sm font-bold text-dark outline-none transition-all focus:bg-white focus:border-yellow resize-none min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="live-classTask" className="text-[10px] font-black uppercase tracking-widest text-dark/60">
                In-Class Task
              </label>
              <textarea
                id="live-classTask"
                value={classTask}
                onChange={(event) => setClassTask(event.target.value)}
                placeholder="e.g. Solve questions 1 to 10 on page 44."
                rows={3}
                className="w-full rounded-xl border-[2px] border-dark bg-white px-3 py-2 text-sm font-bold text-dark outline-none transition-all focus:bg-white focus:border-yellow resize-none min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="live-homework" className="text-[10px] font-black uppercase tracking-widest text-dark/60">
                Homework
              </label>
              <textarea
                id="live-homework"
                value={homework}
                onChange={(event) => setHomework(event.target.value)}
                placeholder="e.g. Finish worksheet questions 11-15."
                rows={2}
                className="w-full rounded-xl border-[2px] border-dark bg-white px-3 py-2 text-sm font-bold text-dark outline-none transition-all focus:bg-white focus:border-yellow resize-none min-h-[60px]"
              />
            </div>
          </>
        )}
      </div>

      {/* Save / Actions Area */}
      <div className="pt-2 space-y-3">
        <button
          type="button"
          onClick={() => void publish()}
          disabled={isSaving}
          className="w-full h-11 bg-dark hover:bg-dark/90 text-white border-[2px] border-dark rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-[2px_2px_0px_#F5C518] disabled:opacity-50 flex items-center justify-center cursor-pointer"
        >
          {isSaving ? 'Publishing...' : 'Publish to Students'}
        </button>
        
        <div className="flex gap-2">
          {resourceUrl && (
            <button
              type="button"
              onClick={() => {
                setResourceUrl('');
                setFeedback('Resource link removed from draft.');
              }}
              disabled={isSaving}
              className="flex-1 h-9 bg-white hover:bg-slate-50 text-dark border-[2px] border-dark rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            >
              Clear Link
            </button>
          )}
          <button
            type="button"
            onClick={() => void clearPublished()}
            disabled={isSaving}
            className="flex-1 h-9 bg-white hover:bg-slate-50 text-dark border-[2px] border-dark rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            Clear Live
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div className="mt-3 p-3 rounded-xl border-[2px] border-dark bg-yellow/10 text-xs font-bold text-dark shadow-[2px_2px_0px_#060E1C] leading-snug break-words">
          💡 {feedback}
        </div>
      )}
    </div>
  );
}
