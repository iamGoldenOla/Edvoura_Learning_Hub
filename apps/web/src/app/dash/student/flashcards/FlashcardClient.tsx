'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Brain, Loader2, RotateCcw, Search, Volume2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Flashcard = {
  front: string;
  back: string;
};

export default function FlashcardClient({
  gradeLevel,
  subjectSuggestions,
}: {
  gradeLevel: string;
  subjectSuggestions: string[];
}) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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

  const generateFlashcards = async (mode: 'guided' | 'surprise' = 'guided') => {
    if (mode === 'guided' && !topic && !subject) return;

    setIsLoading(true);
    setFlashcards([]);
    setCurrentIdx(0);
    setIsFlipped(false);
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

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-8 px-2 pb-12 sm:space-y-12 sm:px-4">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-dark bg-emerald-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-dark shadow-[3px_3px_0px_#060E1C] sm:border-[3px] sm:px-4 sm:py-2 sm:text-[10px] sm:shadow-[4px_4px_0px_#060E1C]">
          <Brain className="h-3 w-3 text-emerald-600 sm:h-4 sm:w-4" />
          AI Flashcard Study
        </div>
        <h1 className="break-words px-2 text-3xl font-black tracking-tight text-dark sm:text-5xl">Flashcard Generator</h1>
        <p className="text-sm font-semibold italic text-dark/60 sm:text-base">
          Study any topic with AI or a built-in Edvoura revision deck.
        </p>
      </header>

      <div className="overflow-hidden rounded-[24px] border-[3px] border-dark bg-white shadow-[6px_6px_0px_#060E1C] sm:rounded-[28px] sm:border-[4px] sm:shadow-[10px_10px_0px_#060E1C]">
        <div className="space-y-6 p-5 sm:p-6 md:p-8">
          <div className="rounded-2xl border-[3px] border-dark bg-emerald-50 p-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Smart Study Mode</p>
            <p className="mt-2 text-sm font-bold text-dark/70">{helperText}</p>
            <p className="mt-1 text-xs font-bold text-dark/50">Grade target: {gradeLevel}</p>
          </div>

          {subjectSuggestions.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-dark/60">Quick Subjects</p>
              <div className="flex flex-wrap gap-2">
                {subjectSuggestions.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setSubject(entry)}
                    className={`rounded-full border-[2px] border-dark px-3 py-2 text-[11px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#060E1C] transition-all ${
                      subject === entry ? 'bg-emerald-500 text-white' : 'bg-white text-dark'
                    }`}
                  >
                    {entry}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-xs font-black uppercase tracking-widest text-dark/60">Subject</label>
              <Input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. Basic Science, Mathematics"
                className="h-12 rounded-xl border-[3px] border-dark font-bold shadow-[3px_3px_0px_#060E1C] transition-all focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] focus-visible:ring-0 focus-visible:shadow-none"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-xs font-black uppercase tracking-widest text-dark/60">Topic</label>
              <Input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. Air, Parts of Speech, Multiplication Facts"
                className="h-12 rounded-xl border-[3px] border-dark font-bold shadow-[3px_3px_0px_#060E1C] transition-all focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] focus-visible:ring-0 focus-visible:shadow-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              disabled={isLoading || (!topic && !subject)}
              onClick={() => generateFlashcards('guided')}
              className="h-12 w-full rounded-xl border-[3px] border-dark bg-emerald-500 text-sm font-black text-white shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-emerald-600 hover:shadow-none active:scale-95 sm:h-14 sm:text-lg sm:shadow-[6px_6px_0px_#060E1C]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Building your deck...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Generate Study Cards
                </>
              )}
            </Button>
            <Button
              disabled={isLoading}
              onClick={() => generateFlashcards('surprise')}
              className="h-12 w-full rounded-xl border-[3px] border-dark bg-yellow text-sm font-black text-dark shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-amber-300 hover:shadow-none active:scale-95 sm:h-14 sm:text-lg sm:shadow-[6px_6px_0px_#060E1C]"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Surprise Me
            </Button>
          </div>

          {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
        </div>
      </div>

      {flashcards.length > 0 ? (
        <div className="flex flex-col items-center gap-8 sm:gap-10">
          <div className="w-full max-w-2xl rounded-[24px] border-[3px] border-dark bg-white p-4 text-center shadow-[6px_6px_0px_#060E1C]">
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/40">Current Deck</p>
            <h2 className="mt-2 break-words text-xl font-black text-dark sm:text-2xl">{deckTitle}</h2>
            <p className="mt-2 text-sm font-bold text-dark/60">
              {provider.startsWith('local_') ? 'Edvoura Library Deck' : 'Edvoura AI Deck'}
            </p>
          </div>

          <div className="perspective-1000 relative aspect-[4/3] w-full max-w-[min(100%,450px)]">
            <div
              onClick={() => {
                setIsFlipped(!isFlipped);
                if (!isFlipped) speak(flashcards[currentIdx].back);
              }}
              className={`transform-style-3d relative h-full w-full cursor-pointer transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
            >
              <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-[28px] border-[4px] border-dark bg-white p-4 shadow-[8px_8px_0px_#060E1C] sm:rounded-[40px] sm:border-[6px] sm:p-10 sm:shadow-[12px_12px_0px_#060E1C]">
                <p className="mb-5 text-center text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 sm:mb-8 sm:text-[10px]">QUESTION / CONCEPT</p>
                <div className="break-words text-center text-lg font-black leading-tight text-dark sm:text-2xl md:text-3xl">
                  {flashcards[currentIdx].front}
                </div>
                <p className="mt-5 text-center text-xs font-bold italic text-dark/40 sm:mt-8 sm:text-sm">Tap the card to flip</p>
              </div>

              <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-[28px] border-[4px] border-dark bg-emerald-50 p-4 shadow-[8px_8px_0px_#060E1C] sm:rounded-[40px] sm:border-[6px] sm:p-10 sm:shadow-[12px_12px_0px_#060E1C]">
                <p className="mb-5 text-center text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 sm:mb-8 sm:text-[10px]">ANSWER / EXPLANATION</p>
                <div className="break-words text-center text-base font-black leading-relaxed text-dark sm:text-xl md:text-2xl">
                  {flashcards[currentIdx].back}
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    speak(flashcards[currentIdx].back);
                  }}
                  className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95 sm:mt-8 sm:h-14 sm:w-14"
                >
                  <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>
          </div>

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
              setError('');
            }}
            className="flex items-center gap-2 rounded-xl border-[3px] border-dark bg-off-white px-6 py-3 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_#060E1C] transition-all hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <RotateCcw className="h-4 w-4" /> New Topic
          </button>
        </div>
      ) : null}

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
