'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Mic2, PlayCircle, RefreshCw, Volume2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
};

export function SpellingBeeClient({ challenges }: { challenges: SpellingBeeChallenge[] }) {
  const [activeChallenge, setActiveChallenge] = useState<SpellingBeeChallenge | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');

  const currentWord = activeChallenge?.words[currentIndex] ?? null;

  const score = useMemo(
    () => results.filter((entry) => entry.correct).length,
    [results],
  );

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
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
      setTimeout(() => speak(firstWord.word), 400);
    }
  };

  const handleNext = () => {
    if (!activeChallenge || !currentWord) {
      return;
    }

    const correct = userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    const nextResults = [
      ...results,
      {
        word: currentWord.word,
        guess: userInput,
        correct,
        hint: currentWord.hint,
        definition: currentWord.definition,
        exampleSentence: currentWord.exampleSentence,
      },
    ];

    setResults(nextResults);

    if (currentIndex < activeChallenge.words.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setUserInput('');
      setTimeout(() => speak(activeChallenge.words[nextIndex].word), 400);
      return;
    }

    setIsFinished(true);
    setGameState('idle');
  };

  if (activeChallenge && !isFinished && gameState === 'playing' && currentWord) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <header className="flex flex-col items-center space-y-4">
          <div className="w-full flex justify-start">
            <button 
              onClick={() => {
                setGameState('idle');
                setActiveChallenge(null);
              }}
              className="flex items-center gap-2 px-4 py-2 border-[3px] border-dark bg-white rounded-xl font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Exit Challenge
            </button>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 border-[3px] border-dark font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#060E1C]">
            <Mic2 className="h-4 w-4" />
            {activeChallenge.theme}
          </div>
          <h1 className="text-center text-3xl font-black tracking-tight text-dark sm:text-4xl break-words">{activeChallenge.title}</h1>
          <p className="mx-auto max-w-2xl text-center font-semibold text-dark/60">{activeChallenge.instructions}</p>
        </header>

        <div className="space-y-6 rounded-[28px] border-[4px] border-dark bg-white p-4 shadow-[8px_8px_0px_#060E1C] sm:space-y-10 sm:rounded-[50px] sm:border-[6px] sm:p-8 md:p-10 sm:shadow-[16px_16px_0px_#060E1C]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-2xl border-[3px] border-dark bg-slate-100 px-4 py-2 text-center font-black text-dark sm:px-6">
              Word {currentIndex + 1} of {activeChallenge.words.length}
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
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

          <div className="flex flex-col items-center gap-6 py-4 sm:gap-8 sm:py-8">
            <button
              type="button"
              onClick={() => speak(currentWord.word)}
              className="h-24 w-24 rounded-full bg-yellow border-[4px] border-dark flex items-center justify-center text-dark shadow-[6px_6px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
            >
              <Volume2 className="h-10 w-10" />
            </button>
            <div className="text-center space-y-2">
              <p className="text-sm font-black text-dark/30 uppercase tracking-widest">Click to hear the word again</p>
              <p className="text-sm font-bold text-dark/60">Hint: {currentWord.hint}</p>
              <p className="text-xs font-bold text-dark/40 uppercase tracking-widest">
                Pronunciation: {currentWord.pronunciation} • {currentWord.syllables} syllables
              </p>
            </div>

            <input
              autoFocus
              type="text"
              value={userInput}
              onChange={(event) => setUserInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && userInput.trim() && handleNext()}
              placeholder="Type the word here..."
              className="w-full max-w-lg rounded-[24px] border-[4px] border-dark px-4 py-4 text-center text-2xl font-black placeholder:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 sm:rounded-[32px] sm:px-8 sm:py-6 sm:text-3xl"
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
          <div className="h-24 w-24 rounded-full bg-yellow border-[4px] border-dark flex items-center justify-center text-5xl mx-auto mb-6">
            🏆
          </div>
          <h2 className="mb-2 text-3xl font-black text-dark sm:text-4xl">Challenge Complete!</h2>
          <p className="text-lg font-bold text-dark/60 sm:text-xl">
            You spelled {score} out of {activeChallenge.words.length} words correctly.
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
                    <p className="text-[10px] font-black uppercase text-dark/30 tracking-widest mb-1">Correct Word</p>
                    <h3 className="text-xl font-black text-dark">{result.word}</h3>
                  </div>
                  {!result.correct ? (
                    <p className="text-sm font-bold text-red-600 italic">You typed: {result.guess || '(blank)'}</p>
                  ) : null}
                  <p className="text-sm font-bold text-dark/70">Meaning: {result.definition}</p>
                  <p className="text-sm font-semibold text-dark/60 italic">{result.exampleSentence}</p>
                </div>
                {result.correct ? (
                  <CheckCircle2 className="h-10 w-10 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600 shrink-0" />
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
              onClick={() => {
                setActiveChallenge(null);
                setResults([]);
                setCurrentIndex(0);
                setUserInput('');
                setIsFinished(false);
              }}
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
        <div className="w-full flex justify-start">
          <Link href="/dash/student">
            <Button variant="outline" className="flex items-center gap-2 border-[3px] border-dark bg-white rounded-xl font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all h-auto py-2">
              <ArrowLeft className="h-4 w-4" /> Back to Overview
            </Button>
          </Link>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 border-[3px] border-dark font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#060E1C]">
          <Mic2 className="h-4 w-4" />
          Tutor-Published Spelling Bee
        </div>
        <h1 className="text-center text-3xl font-black tracking-tight text-dark sm:text-5xl">Spelling Bee Arena</h1>
        <p className="text-center font-semibold italic text-dark/60">
          Listen, think, and spell your way through tutor-approved challenges.
        </p>
      </header>

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
                <h2 className="text-xl font-black tracking-tight text-dark sm:text-2xl break-words">{challenge.title}</h2>
                <p className="text-sm font-bold text-dark/70 leading-relaxed">{challenge.instructions}</p>
              </div>

              <div className="rounded-2xl border-[3px] border-dark bg-indigo-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-dark/50 mb-2">
                  Challenge Preview
                </p>
                <p className="text-sm font-bold text-dark/70">
                  Includes easy, medium, and hard words with pronunciation, definitions, and context clues.
                </p>
              </div>

              <Button
                onClick={() => startChallenge(challenge)}
                className="bg-indigo-600 text-white border-[3px] border-dark font-black rounded-2xl shadow-[4px_4px_0px_#060E1C] h-auto py-4"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Challenge
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[28px] border-[4px] border-dark bg-white p-8 text-center shadow-[8px_8px_0px_#060E1C] sm:rounded-[60px] sm:border-[6px] sm:p-20 sm:shadow-[16px_16px_0px_#060E1C]">
          <div className="h-32 w-32 rounded-full bg-yellow border-[4px] border-dark flex items-center justify-center text-6xl mb-8">
            🐝
          </div>
          <h2 className="text-3xl font-black text-dark mb-4">No live spelling bee yet</h2>
          <p className="text-dark/60 font-bold max-w-lg">
            When your tutor publishes an AI spelling bee challenge, it will appear here with listen-and-spell practice.
          </p>
        </div>
      )}
    </div>
  );
}
