'use client';

import { useState } from 'react';
import { Trophy, Star, RefreshCw, Gamepad2, Rocket, Brain } from 'lucide-react';

const EXTERNAL_GAMES = [
  {
    title: "Arcademics",
    description: "Multiplayer educational games for math and language arts.",
    url: "https://www.arcademics.com/",
    icon: Gamepad2,
    color: "bg-blue-500"
  },
  {
    title: "Math Playground",
    description: "Action-packed math games for every grade level.",
    url: "https://www.mathplayground.com/",
    icon: Rocket,
    color: "bg-purple-500"
  },
  {
    title: "PBS Kids Games",
    description: "Fun learning games with your favorite characters.",
    url: "https://pbskids.org/games/",
    icon: Brain,
    color: "bg-green-500"
  }
];

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
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-edvoura-navy flex items-center gap-3">
            <Trophy className="text-amber-500 h-8 w-8" />
            Edvoura Play Zone
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md">
            The best way to learn is to play! Dive into our internal challenges or explore our partner games on Arcademics.
          </p>
        </div>
        <div className="text-center rounded-xl bg-amber-50 p-4 border border-amber-200 min-w-[140px]">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest">Your Points</p>
          <p className="text-3xl font-black text-amber-600 flex items-center justify-center gap-2">
            {score} <Star className="h-5 w-5 fill-amber-500" />
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest">Internal Challenge: Speed Math</h2>
              <span className="text-xs font-medium text-slate-400">Level 1</span>
            </div>
            
            <div className="p-8 text-center">
              {!gameOver ? (
                <div className="max-w-md mx-auto py-4">
                  <p className="text-5xl font-black text-slate-800 animate-in fade-in zoom-in duration-300">
                    {MATH_QUESTIONS[currentQuestionIdx].q}
                  </p>
                  
                  <div className="mt-10 flex gap-3">
                    <input 
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                      placeholder="Answer..."
                      className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-4 text-xl font-bold text-slate-800 focus:border-blue-500 focus:outline-none transition-all"
                      autoFocus
                    />
                    <button 
                      onClick={handleAnswer}
                      className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
                    >
                      Go!
                    </button>
                  </div>
                  
                  <div className="mt-8 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500" 
                      style={{ width: `${((currentQuestionIdx + 1) / MATH_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <div className="relative inline-block">
                    <Trophy className="h-20 w-20 text-amber-500 mb-4 mx-auto" />
                    <Star className="absolute -top-2 -right-2 h-8 w-8 text-amber-400 animate-bounce" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">Awesome Job!</h2>
                  <p className="mt-2 text-slate-600">You earned <span className="font-bold text-amber-600">{score} tokens</span> for your collection.</p>
                  
                  <button 
                    onClick={resetGame}
                    className="mt-8 flex items-center gap-2 mx-auto rounded-xl bg-slate-900 px-8 py-4 text-white font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
                  >
                    <RefreshCw className="h-5 w-5" /> Play Again
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {EXTERNAL_GAMES.map((game) => (
               <a 
                key={game.title}
                href={game.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
               >
                 <div className="flex items-start gap-4">
                   <div className={`p-3 rounded-xl ${game.color} text-white`}>
                     <game.icon className="h-6 w-6" />
                   </div>
                   <div className="flex-1">
                     <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{game.title}</h3>
                     <p className="mt-1 text-xs text-slate-600 leading-relaxed">{game.description}</p>
                   </div>
                 </div>
                 <div className="mt-4 flex items-center justify-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 group-hover:translate-x-1 transition-transform">
                      Play Now →
                    </span>
                 </div>
               </a>
             ))}
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Why Play Games?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">✓</div>
                <p className="text-xs text-slate-600">Improve your reaction speed and memory.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">✓</div>
                <p className="text-xs text-slate-600">Practice math and vocabulary in a fun way.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">✓</div>
                <p className="text-xs text-slate-600">Compete with friends on the leaderboard.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg">Pro Tip!</h3>
            <p className="mt-2 text-sm text-blue-100 leading-relaxed">
              Playing Arcademics games with your friends helps you learn teamwork and healthy competition. Invite a classmate to a race!
            </p>
            <a 
              href="https://www.arcademics.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 block text-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Open Arcademics
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

