'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Languages, Mic2, PlayCircle, RefreshCw, Sparkles, Volume2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { PracticeSpellingChallenge } from '@/lib/student-practice/practiceLibrary';

type SpellingBeeWord = {
  word: string;
  pronunciation: string;
  syllables: number;
  definition: string;
  exampleSentence: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

type SpellingBeeChallenge = {
  id: string;
  title: string;
  instructions: string;
  theme: string;
  words: SpellingBeeWord[];
};

type AttemptResult = {
  word: string;
  guess: string;
  correct: boolean;
  hint: string;
  definition: string;
  exampleSentence: string;
  difficulty: SpellingBeeWord['difficulty'];
};

type AccentMode = 'en-GB' | 'en-US';

function getWordPoints(difficulty: SpellingBeeWord['difficulty']) {
  if (difficulty === 'hard') return 15;
  if (difficulty === 'medium') return 10;
  return 5;
}

export function SpellingBeeClient({
  challenges,
  practiceChallenges,
  gradeLevelName,
}: {
  challenges: SpellingBeeChallenge[];
  practiceChallenges: PracticeSpellingChallenge[];
  gradeLevelName: string;
}) {
  const [activeChallenge, setActiveChallenge] = useState<SpellingBeeChallenge | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');
  const [accent, setAccent] = useState<AccentMode>('en-GB');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const currentWord = activeChallenge?.words[currentIndex] ?? null;

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);



  const score = useMemo(() => {
    let total = 0;
    for (const result of results) {
      total = Math.max(0, total + (result.correct ? getWordPoints(result.difficulty) : -3));
    }
    return total;
  }, [results]);

  const streak = useMemo(() => {
    let total = 0;
    for (let index = results.length - 1; index >= 0; index -= 1) {
      if (!results[index].correct) break;
      total += 1;
    }
    return total;
  }, [results]);

  const correctCount = useMemo(
    () => results.filter((entry) => entry.correct).length,
    [results],
  );

  const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const loaded = window.speechSynthesis.getVoices();
      if (loaded.length > 0) {
        resolve(loaded);
        return;
      }
      let attempts = 0;
      const interval = setInterval(() => {
        attempts += 1;
        const available = window.speechSynthesis.getVoices();
        if (available.length > 0 || attempts > 20) {
          clearInterval(interval);
          resolve(available);
        }
      }, 100);
    });
  };

  const speak = async (word: SpellingBeeWord) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const availableVoices = voices.length > 0 ? voices : await waitForVoices();
    if (availableVoices.length > 0 && voices.length === 0) {
      setVoices(availableVoices);
    }

    const pickedVoice =
      availableVoices.find((v) => v.lang?.toLowerCase().startsWith(accent.toLowerCase())) ??
      availableVoices.find((v) => v.lang?.toLowerCase().startsWith('en')) ??
      null;

    const utterance = new SpeechSynthesisUtterance(
      `Spell the word. ${word.word}. ${word.exampleSentence}. The word again: ${word.word}.`,
    );
    utterance.rate = 0.8;
    utterance.lang = accent;
    if (pickedVoice) {
      utterance.voice = pickedVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const startChallenge = (challenge: SpellingBeeChallenge) => {
    setActiveChallenge(challenge);
    setCurrentIndex(0);
    setUserInput('');
    setResults([]);
    setIsFinished(false);
    setGameState('playing');

    const firstWord = challenge.words[0];
    if (firstWord) {
      setTimeout(() => speak(firstWord), 500);
    }
  };

  const resetBackToDecks = () => {
    setActiveChallenge(null);
    setResults([]);
    setCurrentIndex(0);
    setUserInput('');
    setIsFinished(false);
    setGameState('idle');
  };

  const handleNext = () => {
    if (!activeChallenge || !currentWord) {
      return;
    }

    const correct = userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    const nextResults: AttemptResult[] = [
      ...results,
      {
        word: currentWord.word,
        guess: userInput,
        correct,
        hint: currentWord.hint,
        definition: currentWord.definition,
        exampleSentence: currentWord.exampleSentence,
        difficulty: currentWord.difficulty,
      },
    ];

    setResults(nextResults);

    if (currentIndex < activeChallenge.words.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setUserInput('');
      setTimeout(() => speak(activeChallenge.words[nextIndex]), 300);
      return;
    }

    setIsFinished(true);
    setGameState('idle');
  };

  if (activeChallenge && !isFinished && gameState === 'playing' && currentWord) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <header className="flex flex-col items-center space-y-4">
          <div className="flex w-full justify-start">
            <button
              onClick={resetBackToDecks}
              className="flex items-center gap-2 rounded-xl border-[3px] border-dark bg-white px-4 py-2 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              <ArrowLeft className="h-4 w-4" /> Exit Challenge
            </button>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-dark bg-indigo-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-700 shadow-[4px_4px_0px_#060E1C]">
            <Mic2 className="h-4 w-4" />
            {activeChallenge.theme}
          </div>
          <h1 className="text-center text-3xl font-black tracking-tight text-dark sm:text-4xl break-words">{activeChallenge.title}</h1>
          <p className="mx-auto max-w-2xl text-center font-semibold text-dark/60">{activeChallenge.instructions}</p>
        </header>

        <div className="space-y-6 rounded-[28px] border-[4px] border-dark bg-white p-4 shadow-[8px_8px_0px_#060E1C] sm:space-y-8 sm:rounded-[50px] sm:border-[6px] sm:p-8 md:p-10 sm:shadow-[16px_16px_0px_#060E1C]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-2xl border-[3px] border-dark bg-slate-100 px-4 py-2 text-center font-black text-dark sm:px-6">
              Word {currentIndex + 1} of {activeChallenge.words.length}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <div className="rounded-2xl border-[3px] border-dark bg-emerald-100 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-dark">
                Score {score}
              </div>
              <div className="rounded-2xl border-[3px] border-dark bg-yellow px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-dark">
                Streak {streak}
              </div>
              {activeChallenge.words.map((_, index) => (
                <div
                  key={index}
                  className={`h-3 w-8 rounded-full border-2 border-dark ${
                    index <= currentIndex ? 'bg-indigo-600' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 py-4 sm:gap-8 sm:py-6">
            <button
              type="button"
              onClick={() => speak(currentWord)}
              className="flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-dark bg-yellow text-dark shadow-[6px_6px_0px_#060E1C] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:scale-95"
            >
              <Volume2 className="h-10 w-10" />
            </button>
            <div className="space-y-3 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-dark/30">Click to hear the word again</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAccent('en-GB')}
                  className={`rounded-full border-[2px] border-dark px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    accent === 'en-GB' ? 'bg-indigo-600 text-white' : 'bg-white text-dark'
                  }`}
                >
                  British Accent
                </button>
                <button
                  type="button"
                  onClick={() => setAccent('en-US')}
                  className={`rounded-full border-[2px] border-dark px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    accent === 'en-US' ? 'bg-indigo-600 text-white' : 'bg-white text-dark'
                  }`}
                >
                  US Accent
                </button>
              </div>
              <p className="text-sm font-bold text-dark/60">Hint: {currentWord.hint}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-dark/40">
                Pronunciation: {currentWord.pronunciation} • {currentWord.syllables} syllables • {currentWord.difficulty}
              </p>
            </div>

            <input
              autoFocus
              type="text"
              value={userInput}
              onChange={(event) => setUserInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && userInput.trim() && handleNext()}
              placeholder="Type the word here..."
              className="w-full max-w-lg rounded-[24px] border-[4px] border-dark px-4 py-4 text-center text-2xl font-black placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 sm:rounded-[32px] sm:px-8 sm:py-6 sm:text-3xl"
            />

            <Button
              disabled={!userInput.trim()}
              onClick={handleNext}
              className="h-auto w-full rounded-2xl border-[4px] border-dark bg-green-500 px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_#060E1C] disabled:opacity-50 disabled:shadow-none sm:w-auto sm:px-10 sm:shadow-[6px_6px_0px_#060E1C]"
            >
              Submit Word
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (activeChallenge && isFinished) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="rounded-[28px] border-[4px] border-dark bg-white p-5 text-center shadow-[8px_8px_0px_#060E1C] sm:rounded-[60px] sm:border-[6px] sm:p-12 sm:shadow-[16px_16px_0px_#060E1C]">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-dark bg-yellow text-5xl">
            🏆
          </div>
          <h2 className="mb-2 text-3xl font-black text-dark sm:text-4xl">Challenge Complete!</h2>
          <p className="text-lg font-bold text-dark/60 sm:text-xl">
            You earned {score} points and spelled {correctCount} out of {activeChallenge.words.length} words correctly.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:mt-12 md:grid-cols-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex flex-col gap-4 rounded-[24px] border-[4px] border-dark p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:rounded-[32px] sm:p-6 ${
                  result.correct ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="space-y-2">
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-dark/30">Correct Word</p>
                    <h3 className="text-xl font-black text-dark">{result.word}</h3>
                  </div>
                  {!result.correct ? (
                    <p className="text-sm font-bold italic text-red-600">You typed: {result.guess || '(blank)'}</p>
                  ) : null}
                  <p className="text-sm font-bold text-dark/70">Meaning: {result.definition}</p>
                  <p className="text-sm font-semibold italic text-dark/60">{result.exampleSentence}</p>
                </div>
                {result.correct ? (
                  <CheckCircle2 className="h-10 w-10 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 shrink-0 text-red-600" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              onClick={() => startChallenge(activeChallenge)}
              className="inline-flex h-auto items-center justify-center gap-3 rounded-2xl bg-dark px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 sm:px-10"
            >
              <RefreshCw className="h-5 w-5" /> Try Again
            </Button>
            <Button
              onClick={resetBackToDecks}
              className="inline-flex h-auto items-center justify-center gap-3 rounded-2xl border-[3px] border-dark bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-dark sm:px-10"
            >
              Back to Challenges
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-col items-center space-y-4">
        <div className="flex w-full justify-start">
          <Link href="/dash/student">
            <Button variant="outline" className="flex h-auto items-center gap-2 rounded-xl border-[3px] border-dark bg-white py-2 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
              <ArrowLeft className="h-4 w-4" /> Back to Overview
            </Button>
          </Link>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-dark bg-indigo-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-700 shadow-[4px_4px_0px_#060E1C]">
          <Mic2 className="h-4 w-4" />
          Always-On Spelling Bee Practice
        </div>
        <h1 className="text-center text-3xl font-black tracking-tight text-dark sm:text-5xl">Spelling Bee Arena</h1>
        <p className="text-center font-semibold italic text-dark/60">
          Listen, think, and spell your way through age-appropriate practice decks and tutor-approved challenges.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-[24px] border-[4px] border-dark bg-emerald-50 p-4 shadow-[6px_6px_0px_#060E1C] sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Edvoura Practice Engine</p>
            <h2 className="text-xl font-black text-dark sm:text-2xl">Independent practice for {gradeLevelName}</h2>
            <p className="text-sm font-bold text-dark/70">
              These decks are always available, even when no tutor homework has been published yet.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-dark bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-dark shadow-[3px_3px_0px_#060E1C]">
            <Languages className="h-4 w-4" />
            British + US voice modes
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {practiceChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="flex flex-col gap-5 rounded-[24px] border-[4px] border-dark bg-white p-4 shadow-[8px_8px_0px_#060E1C] sm:rounded-[32px] sm:p-6 sm:shadow-[10px_10px_0px_#060E1C]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2 rounded-xl border-[2px] border-dark bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C]">
                  <Sparkles className="h-3 w-3" />
                  {challenge.theme}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                  {challenge.words.length} words
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-black tracking-tight text-dark sm:text-2xl break-words">{challenge.title}</h2>
                <p className="text-sm font-bold leading-relaxed text-dark/70">{challenge.instructions}</p>
              </div>

              <div className="rounded-2xl border-[3px] border-dark bg-emerald-50 p-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-dark/50">Practice Preview</p>
                <p className="text-sm font-bold text-dark/70">
                  Includes listening, hints, definitions, example sentences, and points for correct spelling.
                </p>
              </div>

              <Button
                onClick={() => startChallenge(challenge)}
                className="h-auto rounded-2xl border-[3px] border-dark bg-emerald-600 py-4 font-black text-white shadow-[4px_4px_0px_#060E1C]"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Practice Deck
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-dark sm:text-3xl">Tutor-Published Challenges</h2>
          <p className="text-sm font-bold text-dark/60">
            These are extra spelling decks your tutor has assigned for classwork or homework.
          </p>
        </div>

        {challenges.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex flex-col gap-5 rounded-[24px] border-[4px] border-dark bg-white p-4 shadow-[8px_8px_0px_#060E1C] sm:rounded-[32px] sm:p-6 sm:shadow-[10px_10px_0px_#060E1C]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="inline-flex items-center gap-2 rounded-xl border-[2px] border-dark bg-yellow px-3 py-1 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C]">
                    <Mic2 className="h-3 w-3" />
                    {challenge.theme}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                    {challenge.words.length} words
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-tight text-dark sm:text-2xl break-words">{challenge.title}</h3>
                  <p className="text-sm font-bold leading-relaxed text-dark/70">{challenge.instructions}</p>
                </div>

                <Button
                  onClick={() => startChallenge(challenge)}
                  className="h-auto rounded-2xl border-[3px] border-dark bg-indigo-600 py-4 font-black text-white shadow-[4px_4px_0px_#060E1C]"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Tutor Challenge
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[28px] border-[4px] border-dark bg-white p-8 text-center shadow-[8px_8px_0px_#060E1C] sm:rounded-[60px] sm:border-[6px] sm:p-16 sm:shadow-[16px_16px_0px_#060E1C]">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-dark bg-yellow text-5xl">
              🐝
            </div>
            <h2 className="mb-3 text-2xl font-black text-dark sm:text-3xl">No live tutor spelling bee yet</h2>
            <p className="max-w-lg font-bold text-dark/60">
              Your independent practice decks are ready above. When your tutor publishes a spelling task, it will also appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
