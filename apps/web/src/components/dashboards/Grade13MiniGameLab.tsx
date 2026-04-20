'use client';

import { useEffect, useMemo, useState } from 'react';

type GameId = 'phonics' | 'letter-match' | 'word-builder' | 'maths-jump';

type Question = {
  prompt: string;
  choices: string[];
  answer: string;
};

const SESSION_SECONDS = 50;

const games: Array<{
  id: GameId;
  title: string;
  skill: string;
  emoji: string;
  gradient: string;
}> = [
  {
    id: 'phonics',
    title: 'Phonics Sprint',
    skill: 'Letter sounds',
    emoji: '🔤',
    gradient: 'from-sky-200 to-cyan-100',
  },
  {
    id: 'letter-match',
    title: 'Letter Match',
    skill: 'Alphabet links',
    emoji: '🧩',
    gradient: 'from-fuchsia-200 to-pink-100',
  },
  {
    id: 'word-builder',
    title: 'Word Builder',
    skill: 'Word recognition',
    emoji: '📚',
    gradient: 'from-emerald-200 to-lime-100',
  },
  {
    id: 'maths-jump',
    title: 'Maths Jump',
    skill: 'Fast addition',
    emoji: '➕',
    gradient: 'from-amber-200 to-yellow-100',
  },
];

const phonicsBank = [
  { sound: 'B', options: ['Ball', 'Apple', 'Sun'], answer: 'Ball' },
  { sound: 'C', options: ['Cat', 'Moon', 'Fish'], answer: 'Cat' },
  { sound: 'D', options: ['Duck', 'Tree', 'Book'], answer: 'Duck' },
  { sound: 'F', options: ['Fan', 'Lamp', 'Rice'], answer: 'Fan' },
  { sound: 'M', options: ['Mouse', 'Tree', 'Cup'], answer: 'Mouse' },
];

const letterBank = [
  { letter: 'A', options: ['Ant', 'Door', 'Ring'], answer: 'Ant' },
  { letter: 'M', options: ['Mouse', 'Goat', 'Leaf'], answer: 'Mouse' },
  { letter: 'S', options: ['Sun', 'Pen', 'Cup'], answer: 'Sun' },
  { letter: 'T', options: ['Tap', 'Book', 'Nest'], answer: 'Tap' },
  { letter: 'L', options: ['Lion', 'Mask', 'Fish'], answer: 'Lion' },
];

const wordBank = [
  { clue: '🐱', options: ['CAT', 'SUN', 'DOG'], answer: 'CAT' },
  { clue: '☀️', options: ['BAT', 'SUN', 'PEN'], answer: 'SUN' },
  { clue: '🐶', options: ['DOG', 'HAT', 'MAP'], answer: 'DOG' },
  { clue: '🦇', options: ['BAT', 'BOX', 'LEG'], answer: 'BAT' },
  { clue: '🚗', options: ['CAR', 'NOD', 'LOG'], answer: 'CAR' },
];

function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

function makeMathQuestion(): Question {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const answer = String(a + b);
  const wrong1 = String(a + b + 1);
  const wrong2 = String(Math.max(1, a + b - 1));
  const choices = [answer, wrong1, wrong2].sort(() => Math.random() - 0.5);
  return { prompt: `What is ${a} + ${b}?`, choices, answer };
}

function nextQuestion(game: GameId): Question {
  if (game === 'phonics') {
    const item = phonicsBank[randomIndex(phonicsBank.length)];
    return {
      prompt: `Tap the word that starts with ${item.sound}`,
      choices: item.options,
      answer: item.answer,
    };
  }

  if (game === 'letter-match') {
    const item = letterBank[randomIndex(letterBank.length)];
    return {
      prompt: `Match letter ${item.letter} with the correct word`,
      choices: item.options,
      answer: item.answer,
    };
  }

  if (game === 'word-builder') {
    const item = wordBank[randomIndex(wordBank.length)];
    return {
      prompt: `Find the right word for ${item.clue}`,
      choices: item.options,
      answer: item.answer,
    };
  }

  return makeMathQuestion();
}

export default function Grade13MiniGameLab() {
  const [activeGame, setActiveGame] = useState<GameId>('phonics');
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => nextQuestion('phonics'));
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('Pick a game card to start playing.');

  const activeMeta = games.find((game) => game.id === activeGame) ?? games[0];
  const timePercent = useMemo(
    () => Math.max(0, Math.round((timeLeft / SESSION_SECONDS) * 100)),
    [timeLeft],
  );

  useEffect(() => {
    if (!running || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          setFeedback('Round complete. Tap Play Again to keep learning.');
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, timeLeft]);

  const startGame = (gameId: GameId) => {
    setActiveGame(gameId);
    setCurrentQuestion(nextQuestion(gameId));
    setRunning(true);
    setTimeLeft(SESSION_SECONDS);
    setScore(0);
    setStreak(0);
    setFeedback('Great. Let’s go!');
  };

  const playAgain = () => {
    setCurrentQuestion(nextQuestion(activeGame));
    setRunning(true);
    setTimeLeft(SESSION_SECONDS);
    setScore(0);
    setStreak(0);
    setFeedback('New round started.');
  };

  const pickAnswer = (choice: string) => {
    if (!running) return;

    if (choice === currentQuestion.answer) {
      setScore((value) => {
        const next = value + 1;
        setBestScore((best) => Math.max(best, next));
        return next;
      });
      setStreak((value) => value + 1);
      setFeedback('Correct! Nice speed.');
    } else {
      setStreak(0);
      setFeedback('Almost. Try the next one.');
    }

    setCurrentQuestion(nextQuestion(activeGame));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50 via-cyan-50 to-emerald-50 p-5">
        <h3 className="text-lg font-black text-slate-900">Play Flow</h3>
        <p className="mt-1 text-sm font-semibold text-slate-700">1. Pick a game 2. Tap answers 3. Beat your best score</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            onClick={() => startGame(game.id)}
            className={`rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${
              activeGame === game.id ? 'border-slate-900' : 'border-slate-200'
            } bg-gradient-to-br ${game.gradient}`}
          >
            <p className="text-2xl">{game.emoji}</p>
            <p className="mt-2 text-base font-black text-slate-900">{game.title}</p>
            <p className="text-sm font-semibold text-slate-700">{game.skill}</p>
            <span className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white">
              Launch
            </span>
          </button>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-black text-slate-900">
            {activeMeta.emoji} {activeMeta.title}
          </h3>
          <div className="flex gap-2">
            <Stat label="Time" value={`${timeLeft}s`} />
            <Stat label="Score" value={String(score)} />
            <Stat label="Streak" value={String(streak)} />
            <Stat label="Best" value={String(bestScore)} />
          </div>
        </div>

        <div className="mb-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-sky-500 transition-all duration-300" style={{ width: `${timePercent}%` }} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-lg font-black text-slate-900">{currentQuestion.prompt}</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {currentQuestion.choices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => pickAnswer(choice)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-bold text-slate-800 hover:bg-sky-50"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={playAgain}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-white hover:bg-slate-800"
          >
            Play Again
          </button>
          <p className="text-sm font-semibold text-slate-700">{feedback}</p>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-700">
      {label}: {value}
    </span>
  );
}

