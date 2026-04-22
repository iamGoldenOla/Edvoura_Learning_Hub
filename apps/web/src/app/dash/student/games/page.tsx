'use client';

import { useState } from 'react';
import { Trophy, Star, RefreshCw } from 'lucide-react';

const MATH_QUESTIONS = [
  { q: "What is 12 + 15?", a: 27 },
  { q: "What is 8 x 7?", a: 56 },
  { q: "What is 144 / 12?", a: 12 },
  { q: "What is 45 - 19?", a: 26 },
  { q: "What is 9 x 9?", a: 81 },
];

export default function GamesPage() {
  const [score, setScore] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const handleAnswer = () => {
    const currentQ = MATH_QUESTIONS[currentQuestionIdx];
    if (parseInt(inputValue, 10) === currentQ.a) {
      setScore(score + 10);
    }

    if (currentQuestionIdx + 1 < MATH_QUESTIONS.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setInputValue('');
    } else {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setScore(0);
    setCurrentQuestionIdx(0);
    setInputValue('');
    setGameOver(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-edvoura-navy flex items-center gap-3">
            <Trophy className="text-amber-500 h-8 w-8" />
            Learning Games
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Play educational games to earn points and climb the leaderboard!
          </p>
        </div>
        <div className="text-center rounded-xl bg-amber-50 p-4 border border-amber-200">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest">Score</p>
          <p className="text-3xl font-black text-amber-600 flex items-center gap-2">
            {score} <Star className="h-5 w-5 fill-amber-500" />
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        {!gameOver ? (
          <div className="max-w-md mx-auto py-8">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Speed Math Challenge</h2>
            <p className="mt-6 text-4xl font-black text-slate-800">
              {MATH_QUESTIONS[currentQuestionIdx].q}
            </p>
            
            <div className="mt-8 flex gap-3">
              <input 
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                placeholder="Type answer..."
                className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-lg font-bold text-slate-800 focus:border-edvoura-navy focus:outline-none"
              />
              <button 
                onClick={handleAnswer}
                className="rounded-xl bg-edvoura-navy px-8 py-3 text-lg font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Submit
              </button>
            </div>
            
            <p className="mt-6 text-xs text-slate-500 font-medium">
              Question {currentQuestionIdx + 1} of {MATH_QUESTIONS.length}
            </p>
          </div>
        ) : (
          <div className="py-12">
            <Trophy className="mx-auto h-20 w-20 text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Challenge Complete!</h2>
            <p className="mt-2 text-slate-600">You scored {score} points.</p>
            
            <button 
              onClick={resetGame}
              className="mt-8 mx-auto flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Play Again
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
