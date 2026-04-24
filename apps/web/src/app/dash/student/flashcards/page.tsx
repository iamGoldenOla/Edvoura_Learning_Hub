'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Volume2, RotateCcw } from 'lucide-react';

const FLASHCARDS = [
  { word: 'Apple', image: '🍎', category: 'Fruits', color: 'bg-red-50' },
  { word: 'Banana', image: '🍌', category: 'Fruits', color: 'bg-yellow-50' },
  { word: 'Cat', image: '🐱', category: 'Animals', color: 'bg-orange-50' },
  { word: 'Dog', image: '🐶', category: 'Animals', color: 'bg-blue-50' },
  { word: 'Elephant', image: '🐘', category: 'Animals', color: 'bg-slate-50' },
  { word: 'Flower', image: '🌸', category: 'Nature', color: 'bg-pink-50' },
  { word: 'Sun', image: '☀️', category: 'Nature', color: 'bg-amber-50' },
  { word: 'Book', image: '📚', category: 'School', color: 'bg-indigo-50' },
];

export default function FlashcardsPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const current = FLASHCARDS[currentIdx];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((currentIdx + 1) % FLASHCARDS.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((currentIdx - 1 + FLASHCARDS.length) % FLASHCARDS.length);
    }, 150);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow text-dark border-[3px] border-dark font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#060E1C]">
          <Sparkles className="h-4 w-4" />
          Flashcard Fun!
        </div>
        <h1 className="text-5xl font-heading font-black text-dark tracking-tight">Word Explorer</h1>
        <p className="text-dark/60 font-semibold italic">Flip the cards to learn new words!</p>
      </header>

      <div className="flex flex-col items-center gap-10">
        {/* Flashcard Container */}
        <div className="relative w-full max-w-[400px] aspect-[3/4] perspective-1000">
          <div 
            onClick={() => {
              setIsFlipped(!isFlipped);
              if (!isFlipped) speak(current.word);
            }}
            className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          >
            {/* Front of Card */}
            <div className={`absolute inset-0 backface-hidden border-[6px] border-dark rounded-[40px] shadow-[12px_12px_0px_#060E1C] flex flex-col items-center justify-center p-10 ${current.color}`}>
              <div className="text-[120px] mb-6 animate-bounce">{current.image}</div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30">{current.category}</p>
              <p className="mt-8 text-sm font-bold text-dark/40 italic">Click to reveal word</p>
            </div>

            {/* Back of Card */}
            <div className={`absolute inset-0 backface-hidden rotate-y-180 border-[6px] border-dark rounded-[40px] shadow-[12px_12px_0px_#060E1C] flex flex-col items-center justify-center p-10 bg-white`}>
              <div className="text-6xl font-heading font-black text-dark mb-8 text-center">{current.word}</div>
              <button 
                onClick={(e) => { e.stopPropagation(); speak(current.word); }}
                className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Volume2 className="h-8 w-8" />
              </button>
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-600">Listen again</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={prevCard}
            className="h-16 w-16 rounded-2xl border-[4px] border-dark bg-white flex items-center justify-center shadow-[6px_6px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <ArrowLeft className="h-8 w-8" />
          </button>
          
          <div className="px-8 py-4 bg-white border-[4px] border-dark rounded-2xl font-black text-xl shadow-[6px_6px_0px_#060E1C]">
            {currentIdx + 1} / {FLASHCARDS.length}
          </div>

          <button 
            onClick={nextCard}
            className="h-16 w-16 rounded-2xl border-[4px] border-dark bg-yellow flex items-center justify-center shadow-[6px_6px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <ArrowRight className="h-8 w-8" />
          </button>
        </div>

        <button 
          onClick={() => { setCurrentIdx(0); setIsFlipped(false); }}
          className="flex items-center gap-2 px-6 py-3 border-[3px] border-dark bg-off-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all"
        >
          <RotateCcw className="h-4 w-4" /> Start Over
        </button>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
