'use client';

import { useState, useEffect } from 'react';
import { Mic2, PlayCircle, CheckCircle2, XCircle, RefreshCw, Volume2, Trophy } from 'lucide-react';
import { getDailyWords } from '@/lib/daily-words';
import { useBand } from '@/components/dashboards/BandContext';

export default function SpellingBeePage() {
  const { band } = useBand();
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<{ word: string; guess: string; correct: boolean }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');

  useEffect(() => {
    const dailyWords = getDailyWords(band || '1-3', new Date().toISOString().split('T')[0]);
    setWords(dailyWords.slice(0, 10)); // Force 10 words
  }, [band]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startTest = () => {
    setGameState('playing');
    setCurrentIndex(0);
    setResults([]);
    setIsFinished(false);
    setUserInput('');
    setTimeout(() => speak(words[0]), 500);
  };

  const handleNext = () => {
    const currentWord = words[currentIndex];
    const isCorrect = userInput.trim().toLowerCase() === currentWord.toLowerCase();
    
    const newResults = [...results, { word: currentWord, guess: userInput, correct: isCorrect }];
    setResults(newResults);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
      setTimeout(() => speak(words[currentIndex + 1]), 500);
    } else {
      setIsFinished(true);
      setGameState('idle');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 border-[3px] border-dark font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#060E1C]">
          <Mic2 className="h-4 w-4" />
          Spelling Bee Challenge
        </div>
        <h1 className="text-5xl font-heading font-black text-dark tracking-tight">Listen & Spell</h1>
        <p className="text-dark/60 font-semibold italic">Can you spell all 10 words correctly? Let's find out!</p>
      </header>

      {!isFinished ? (
        gameState === 'idle' ? (
          <div className="bg-white border-[6px] border-dark rounded-[60px] p-20 shadow-[16px_16px_0px_#060E1C] flex flex-col items-center justify-center text-center">
             <div className="h-32 w-32 rounded-full bg-yellow border-[4px] border-dark flex items-center justify-center text-6xl mb-8 animate-bounce">
                🐝
             </div>
             <h2 className="text-3xl font-black text-dark mb-4">Ready to start?</h2>
             <p className="text-dark/60 font-bold mb-8 max-w-sm">The AI will call out a word, and you have to type it. No peeking!</p>
             <button 
               onClick={startTest}
               className="px-12 py-5 bg-indigo-600 text-white border-[4px] border-dark rounded-3xl font-black uppercase text-lg tracking-widest shadow-[8px_8px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-4"
             >
               <PlayCircle className="h-8 w-8" /> Start Test
             </button>
          </div>
        ) : (
          <div className="bg-white border-[6px] border-dark rounded-[60px] p-12 shadow-[16px_16px_0px_#060E1C] space-y-12">
            <div className="flex items-center justify-between">
               <div className="px-6 py-2 bg-slate-100 border-[3px] border-dark rounded-2xl font-black text-dark">
                  Word {currentIndex + 1} of 10
               </div>
               <div className="flex gap-2">
                  {words.map((_, i) => (
                    <div key={i} className={`h-3 w-8 rounded-full border-2 border-dark ${i <= currentIndex ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col items-center gap-8 py-8">
               <button 
                 onClick={() => speak(words[currentIndex])}
                 className="h-24 w-24 rounded-full bg-yellow border-[4px] border-dark flex items-center justify-center text-dark shadow-[6px_6px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
               >
                 <Volume2 className="h-10 w-10" />
               </button>
               <p className="text-sm font-black text-dark/30 uppercase tracking-widest">Click to hear the word again</p>
               
               <input 
                 autoFocus
                 type="text"
                 value={userInput}
                 onChange={(e) => setUserInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && userInput.trim() && handleNext()}
                 placeholder="Type the word here..."
                 className="w-full max-w-lg px-8 py-6 text-3xl font-black text-center border-[4px] border-dark rounded-[32px] focus:outline-none focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-200"
               />

               <button 
                 disabled={!userInput.trim()}
                 onClick={handleNext}
                 className="px-10 py-4 bg-green-500 text-white border-[4px] border-dark rounded-2xl font-black uppercase text-sm tracking-widest shadow-[6px_6px_0px_#060E1C] disabled:opacity-50 disabled:shadow-none"
               >
                 Submit Word
               </button>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="bg-white border-[6px] border-dark rounded-[60px] p-12 shadow-[16px_16px_0px_#060E1C] text-center">
              <div className="h-24 w-24 rounded-full bg-yellow border-[4px] border-dark flex items-center justify-center text-5xl mx-auto mb-6">
                🏆
              </div>
              <h2 className="text-4xl font-black text-dark mb-2">Test Complete!</h2>
              <p className="text-xl font-bold text-dark/60">You spelled {results.filter(r => r.correct).length} out of 10 words correctly!</p>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {results.map((res, idx) => (
                  <div key={idx} className={`p-6 rounded-[32px] border-[4px] border-dark flex items-center justify-between ${res.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div>
                      <p className="text-[10px] font-black uppercase text-dark/30 tracking-widest mb-1">Correct Word</p>
                      <h3 className="text-xl font-black text-dark">{res.word}</h3>
                      {!res.correct && (
                        <p className="text-sm font-bold text-red-600 mt-1 italic">You typed: {res.guess || '(blank)'}</p>
                      )}
                    </div>
                    {res.correct ? (
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    ) : (
                      <XCircle className="h-10 w-10 text-red-600" />
                    )}
                  </div>
                ))}
              </div>

              <button 
                onClick={startTest}
                className="mt-12 inline-flex items-center gap-3 px-10 py-4 bg-dark text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all"
              >
                <RefreshCw className="h-5 w-5" /> Try Again
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
