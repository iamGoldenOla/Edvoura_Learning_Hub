'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Brain, Loader2, RotateCcw, Search, Volume2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeSubjectName } from '@/lib/ai/lessonNoteBlueprints';

type Flashcard = {
  front: string;
  back: string;
};

export default function FlashcardClient({
  gradeLevel,
  subjectSuggestions,
  topicSuggestions,
}: {
  gradeLevel: string;
  subjectSuggestions: string[];
  topicSuggestions: Array<{
    subject: string;
    topic: string;
  }>;
}) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<'flip' | 'sheet'>('flip');
  const [isLoading, setIsLoading] = useState(false);
  const [deckTitle, setDeckTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [error, setError] = useState('');

  const helperText = useMemo(() => {
    if (provider.startsWith('local_')) {
      return 'Generated from the Edvoura study library.';
    }
    if (provider) {
      return 'Generated with Edvoura AI.';
    }
    return 'Choose a subject and topic, or let Edvoura surprise you with a study deck.';
  }, [provider]);

  const visibleTopicSuggestions = useMemo(() => {
    const normalizedSubject = normalizeSubjectName(subject.trim());
    const filtered = normalizedSubject
      ? topicSuggestions.filter((entry) => entry.subject === normalizedSubject)
      : topicSuggestions;
    return filtered.slice(0, 8);
  }, [subject, topicSuggestions]);

  const [masteredIndices, setMasteredIndices] = useState<number[]>([]);
  const [reviewIndices, setReviewIndices] = useState<number[]>([]);

  const generateFlashcards = async (mode: 'guided' | 'surprise' = 'guided') => {
    if (mode === 'guided' && !topic && !subject) return;

    setIsLoading(true);
    setFlashcards([]);
    setCurrentIdx(0);
    setIsFlipped(false);
    setMasteredIndices([]);
    setReviewIndices([]);
    setError('');

    try {
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          gradeLevel,
          surprise: mode === 'surprise',
        }),
      });
      const data = await res.json();

      if (data.flashcards) {
        setFlashcards(data.flashcards);
        setProvider(String(data.provider ?? ''));
        setDeckTitle(String(data.deckTitle ?? `${data.subject ?? subject}: ${data.topic ?? topic}`));
        if (!subject && data.subject) setSubject(String(data.subject));
        if (!topic && data.topic) setTopic(String(data.topic));
      } else if (data.error) {
        setError(String(data.error));
      }
    } catch (requestError) {
      console.error('Failed to generate flashcards:', requestError);
      setError('Flashcard generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = 'en-GB';
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((currentIdx + 1) % flashcards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((currentIdx - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const markGotIt = () => {
    if (!masteredIndices.includes(currentIdx)) {
      setMasteredIndices((prev) => [...prev, currentIdx]);
    }
    setReviewIndices((prev) => prev.filter((idx) => idx !== currentIdx));
    nextCard();
  };

  const markNeedPractice = () => {
    if (!reviewIndices.includes(currentIdx)) {
      setReviewIndices((prev) => [...prev, currentIdx]);
    }
    setMasteredIndices((prev) => prev.filter((idx) => idx !== currentIdx));
    nextCard();
  };

  const masteryPercent = flashcards.length > 0
    ? Math.round((masteredIndices.length / flashcards.length) * 100)
    : 0;

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-8 px-2 pb-12 sm:space-y-12 sm:px-4">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-dark bg-emerald-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-dark shadow-[3px_3px_0px_#060E1C] sm:border-[3px] sm:px-4 sm:py-2 sm:text-[10px] sm:shadow-[4px_4px_0px_#060E1C]">
          <Brain className="h-3 w-3 text-emerald-600 sm:h-4 sm:w-4" />
          Active Recall &amp; Mastery Engine
        </div>
        <h1 className="break-words px-2 text-3xl font-black tracking-tight text-dark sm:text-5xl">Edvoura Study Flashcards</h1>
        <p className="text-sm font-semibold italic text-dark/60 sm:text-base">
          Test yourself on any subject topic. Flip cards to see in-depth definitions, formulas, and memory tips!
        </p>
      </header>

      <div className="overflow-hidden rounded-[24px] border-[3px] border-dark bg-white shadow-[6px_6px_0px_#060E1C] sm:rounded-[28px] sm:border-[4px] sm:shadow-[10px_10px_0px_#060E1C]">
        <div className="space-y-6 p-5 sm:p-6 md:p-8">
          <div className="rounded-2xl border-[3px] border-dark bg-emerald-50 p-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Target Grade: {gradeLevel}</p>
            <p className="mt-2 text-sm font-bold text-dark/70">{helperText}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-xs font-black uppercase tracking-widest text-dark/60">Select Subject</label>
              <select
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value);
                  setTopic('');
                }}
                className="h-12 w-full rounded-xl border-[3px] border-dark bg-white px-4 text-sm font-bold text-dark outline-none shadow-[3px_3px_0px_#060E1C]"
              >
                <option value="">-- Choose Subject --</option>
                {subjectSuggestions.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-xs font-black uppercase tracking-widest text-dark/60">Select or Type Topic</label>
              <Input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. Water Cycle, Fractions, Parts of Speech"
                className="h-12 rounded-xl border-[3px] border-dark font-bold shadow-[3px_3px_0px_#060E1C] transition-all focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] focus-visible:ring-0 focus-visible:shadow-none"
              />
            </div>
          </div>

          {visibleTopicSuggestions.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-dark/60">Quick Topic Recommendations</p>
              <div className="flex flex-wrap gap-2">
                {visibleTopicSuggestions.map((entry) => (
                  <button
                    key={`${entry.subject}:${entry.topic}`}
                    type="button"
                    onClick={() => {
                      setSubject(entry.subject);
                      setTopic(entry.topic);
                    }}
                    className={`rounded-2xl border-[2px] border-dark px-3 py-2 text-left text-[11px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#060E1C] transition-all ${
                      subject === entry.subject && topic === entry.topic ? 'bg-yellow text-dark' : 'bg-white text-dark'
                    }`}
                  >
                    {entry.topic}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              disabled={isLoading || (!topic && !subject)}
              onClick={() => generateFlashcards('guided')}
              className="h-12 w-full rounded-xl border-[3px] border-dark bg-emerald-500 text-sm font-black text-white shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-emerald-600 hover:shadow-none active:scale-95 sm:h-14 sm:text-lg sm:shadow-[6px_6px_0px_#060E1C]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Building Study Deck...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Generate In-Depth Flashcard Deck
                </>
              )}
            </Button>
            <Button
              disabled={isLoading}
              onClick={() => generateFlashcards('surprise')}
              className="h-12 w-full rounded-xl border-[3px] border-dark bg-yellow text-sm font-black text-dark shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-amber-300 hover:shadow-none active:scale-95 sm:h-14 sm:text-lg sm:shadow-[6px_6px_0px_#060E1C]"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Surprise Revision Deck
            </Button>
          </div>

          {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
        </div>
      </div>

      {flashcards.length > 0 ? (
        <div className="flex flex-col items-center gap-8 sm:gap-10">
          <div className="w-full max-w-2xl rounded-[24px] border-[3px] border-dark bg-white p-4 text-center shadow-[6px_6px_0px_#060E1C]">
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/40">Active Study Deck</p>
            <h2 className="mt-1 break-words text-xl font-black text-dark sm:text-2xl">{deckTitle}</h2>
            <div className="mt-3 flex items-center justify-between gap-4 border-t-[2px] border-dark/20 pt-3">
              <span className="text-xs font-black uppercase tracking-wider text-dark/70">
                Mastery Score: {masteryPercent}%
              </span>
              <div className="h-3 flex-1 rounded-full border-[1.5px] border-dark bg-off-white overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${masteryPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-dark/60">
                {masteredIndices.length} / {flashcards.length} Mastered
              </span>
            </div>
          </div>

          {masteryPercent === 100 ? (
            <div className="w-full max-w-2xl rounded-2xl border-[3px] border-dark bg-emerald-100 p-6 text-center shadow-[4px_4px_0px_#060E1C]">
              <h3 className="text-2xl font-black text-dark">🎉 100% Deck Mastery Achieved!</h3>
              <p className="mt-1 text-sm font-semibold text-dark/70">Fantastic active recall! You have mastered every flashcard in this deck.</p>
              <button
                type="button"
                onClick={() => {
                  setMasteredIndices([]);
                  setReviewIndices([]);
                  setCurrentIdx(0);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border-[2px] border-dark bg-yellow px-5 py-2.5 text-xs font-black uppercase tracking-wider text-dark shadow-[2px_2px_0px_#060E1C]"
              >
                <RotateCcw className="h-4 w-4" /> Restart Study Deck
              </button>
            </div>
          ) : null}

          {/* Study Mode Switcher */}
          <div className="flex items-center gap-2 border-[2px] border-dark rounded-xl p-1 bg-white shadow-[2px_2px_0px_#060E1C]">
            <button
              type="button"
              onClick={() => setStudyMode('flip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                studyMode === 'flip' ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]' : 'text-dark/60'
              }`}
            >
              🔄 3D Flip Card
            </button>
            <button
              type="button"
              onClick={() => setStudyMode('sheet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                studyMode === 'sheet' ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]' : 'text-dark/60'
              }`}
            >
              📖 Study Sheet (Show Answer Side-by-Side)
            </button>
          </div>

          {studyMode === 'sheet' ? (
            /* Study Sheet Mode: Question and Answer stacked side-by-side */
            <div className="w-full max-w-2xl rounded-[32px] border-[4px] border-dark bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#060E1C] space-y-6">
              <div className="p-4 sm:p-6 rounded-2xl border-[3px] border-dark bg-yellow/20">
                <span className="inline-block rounded-md border-[1.5px] border-dark bg-yellow px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark mb-2">
                  Question #{currentIdx + 1}
                </span>
                <p className="text-lg sm:text-xl font-black text-dark leading-snug">
                  {flashcards[currentIdx].front}
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl border-[3px] border-dark bg-emerald-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block rounded-md border-[1.5px] border-dark bg-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark">
                    Answer &amp; Explanation
                  </span>
                  <button
                    type="button"
                    onClick={() => speak(flashcards[currentIdx].back)}
                    className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-white px-2 py-1 text-[10px] font-black uppercase text-dark shadow-[1px_1px_0px_#060E1C]"
                  >
                    <Volume2 className="h-3 w-3" /> Listen
                  </button>
                </div>
                <p className="text-sm sm:text-base font-bold text-dark whitespace-pre-line leading-relaxed">
                  {flashcards[currentIdx].back}
                </p>
              </div>

              {/* Self-Testing Mastery Buttons */}
              <div className="flex w-full gap-3 pt-2">
                <button
                  type="button"
                  onClick={markNeedPractice}
                  className={`flex-1 rounded-xl border-[2px] border-dark px-4 py-3 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all ${
                    reviewIndices.includes(currentIdx)
                      ? 'bg-rose-400 text-dark'
                      : 'bg-white text-dark hover:bg-rose-50'
                  }`}
                >
                  🔁 Need More Practice
                </button>
                <button
                  type="button"
                  onClick={markGotIt}
                  className={`flex-1 rounded-xl border-[2px] border-dark px-4 py-3 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all ${
                    masteredIndices.includes(currentIdx)
                      ? 'bg-emerald-400 text-dark'
                      : 'bg-emerald-300 text-dark hover:bg-emerald-400'
                  }`}
                >
                  💚 I Got It Right! (Mastered)
                </button>
              </div>
            </div>
          ) : (
            /* 3D Flip Card Mode with Obvious Big Reveal Button */
            <div style={{ perspective: '1000px' }} className="relative aspect-[4/3] w-full max-w-[min(100%,520px)] min-h-[350px]">
              <div
                onClick={() => {
                  setIsFlipped(!isFlipped);
                  if (!isFlipped) speak(flashcards[currentIdx].back);
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.5s',
                }}
                className="relative h-full w-full cursor-pointer"
              >
                {/* Front Side */}
                <div
                  style={{ backfaceVisibility: 'hidden' }}
                  className="absolute inset-0 flex flex-col items-center justify-between rounded-[28px] border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C] sm:rounded-[40px] sm:border-[5px] sm:p-8"
                >
                  <span className="rounded-lg border-[1.5px] border-dark bg-yellow px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-dark">
                    QUESTION / CONCEPT
                  </span>
                  <div className="my-auto break-words text-center text-xl font-black leading-snug text-dark sm:text-2xl px-2">
                    {flashcards[currentIdx].front}
                  </div>
                  
                  {/* Big Prominent Reveal Button */}
                  <div className="w-full flex flex-col items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(true);
                        speak(flashcards[currentIdx].back);
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-[3px] border-dark bg-yellow hover:bg-yellow/90 text-dark font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#060E1C] active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Brain className="w-4 h-4 text-dark fill-current" />
                      <span>💡 Reveal Answer &amp; Explanation</span>
                    </button>
                    <p className="text-[11px] font-bold italic text-dark/40">Or tap card to flip</p>
                  </div>
                </div>

                {/* Back Side */}
                <div
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  className="absolute inset-0 flex flex-col items-center justify-between overflow-y-auto rounded-[28px] border-[4px] border-dark bg-emerald-50 p-6 shadow-[8px_8px_0px_#060E1C] sm:rounded-[40px] sm:border-[5px] sm:p-8"
                >
                  <div className="w-full flex items-center justify-between gap-2 pb-2 border-b-[2px] border-dark/15 shrink-0">
                    <span className="rounded-lg border-[1.5px] border-dark bg-emerald-200 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-dark">
                      ANSWER &amp; EXPLANATION
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          speak(flashcards[currentIdx].back);
                        }}
                        className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-dark shadow-[1.5px_1.5px_0px_#060E1C]"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> Listen
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsFlipped(false);
                        }}
                        className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-yellow hover:bg-yellow/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-dark shadow-[1.5px_1.5px_0px_#060E1C]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Question
                      </button>
                    </div>
                  </div>

                  <div className="my-auto w-full text-left text-xs font-bold leading-relaxed text-dark sm:text-sm md:text-base whitespace-pre-line py-3">
                    {flashcards[currentIdx].back}
                  </div>

                  {/* Self-Testing Mastery Buttons */}
                  <div className="mt-3 flex w-full gap-2 pt-2 border-t-[2px] border-dark/20" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={markNeedPractice}
                      className={`flex-1 rounded-xl border-[2px] border-dark px-3 py-2 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all ${
                        reviewIndices.includes(currentIdx)
                          ? 'bg-rose-400 text-dark font-black'
                          : 'bg-white text-dark hover:bg-rose-100'
                      }`}
                    >
                      🔁 Need Practice
                    </button>
                    <button
                      type="button"
                      onClick={markGotIt}
                      className={`flex-1 rounded-xl border-[2px] border-dark px-3 py-2 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all ${
                        masteredIndices.includes(currentIdx)
                          ? 'bg-emerald-400 text-dark font-black'
                          : 'bg-emerald-300 text-dark hover:bg-emerald-400'
                      }`}
                    >
                      💚 Got It (Mastered)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={prevCard}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none sm:h-16 sm:w-16 sm:border-[4px] sm:shadow-[6px_6px_0px_#060E1C]"
            >
              <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>

            <div className="rounded-2xl border-[3px] border-dark bg-white px-6 py-3 text-lg font-black shadow-[4px_4px_0px_#060E1C] sm:border-[4px] sm:px-8 sm:py-4 sm:text-xl sm:shadow-[6px_6px_0px_#060E1C]">
              {currentIdx + 1} / {flashcards.length}
            </div>

            <button
              onClick={nextCard}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-dark bg-emerald-500 text-white shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none sm:h-16 sm:w-16 sm:border-[4px] sm:shadow-[6px_6px_0px_#060E1C]"
            >
              <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </div>

          <button
            onClick={() => {
              setFlashcards([]);
              setTopic('');
              setSubject('');
              setDeckTitle('');
              setProvider('');
              setMasteredIndices([]);
              setReviewIndices([]);
              setError('');
            }}
            className="flex items-center gap-2 rounded-xl border-[3px] border-dark bg-off-white px-6 py-3 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_#060E1C] transition-all hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <RotateCcw className="h-4 w-4" /> Choose New Subject or Topic
          </button>
        </div>
      ) : null}
    </div>
  );
}
