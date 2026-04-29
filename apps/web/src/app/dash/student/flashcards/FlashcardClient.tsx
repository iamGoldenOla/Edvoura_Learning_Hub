'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Volume2, RotateCcw, Brain, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Flashcard = {
  front: string;
  back: string;
};

export default function FlashcardClient({ gradeLevel }: { gradeLevel: string }) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateFlashcards = async () => {
    if (!topic || !subject) return;
    setIsLoading(true);
    setFlashcards([]);
    setCurrentIdx(0);
    setIsFlipped(false);

    try {
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subject, gradeLevel }),
      });
      const data = await res.json();
      if (data.flashcards) {
        setFlashcards(data.flashcards);
      }
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
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
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 pb-12 w-full min-w-0 px-2 sm:px-4">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-100 text-dark border-[2px] sm:border-[3px] border-dark font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C]">
          <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
          AI Flashcard Study
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tight break-words px-2">Flashcard Generator</h1>
        <p className="text-sm sm:text-base text-dark/60 font-semibold italic">Study anything, powered by Edvoura AI</p>
      </header>

      {/* Input Form */}
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[28px] bg-white shadow-[6px_6px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-5 sm:p-6 md:p-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-dark/60 ml-1">Subject</label>
              <Input 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Science, Math, History" 
                className="h-12 border-[3px] border-dark rounded-xl font-bold shadow-[3px_3px_0px_#060E1C] focus-visible:ring-0 focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] focus-visible:shadow-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-dark/60 ml-1">Topic</label>
              <Input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The Water Cycle, Multiplication Table" 
                className="h-12 border-[3px] border-dark rounded-xl font-bold shadow-[3px_3px_0px_#060E1C] focus-visible:ring-0 focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] focus-visible:shadow-none transition-all"
              />
            </div>
          </div>
          <Button 
            disabled={isLoading || !topic || !subject}
            onClick={generateFlashcards}
            className="w-full h-12 sm:h-14 bg-emerald-500 hover:bg-emerald-600 border-[3px] border-dark text-white text-base sm:text-lg font-black rounded-xl shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                AI is creating your cards...
              </>
            ) : (
              <>
                <Search className="h-6 w-6 mr-2" />
                Generate Study Cards
              </>
            )}
          </Button>
        </div>
      </div>

      {flashcards.length > 0 && (
        <div className="flex flex-col items-center gap-10">
          {/* Flashcard Container */}
          <div className="relative w-full max-w-[450px] aspect-[4/3] perspective-1000">
            <div 
              onClick={() => {
                setIsFlipped(!isFlipped);
                if (!isFlipped) speak(flashcards[currentIdx].back);
              }}
              className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
            >
              {/* Front of Card */}
              <div className="absolute inset-0 backface-hidden border-[4px] sm:border-[6px] border-dark rounded-[32px] sm:rounded-[40px] shadow-[8px_8px_0px_#060E1C] sm:shadow-[12px_12px_0px_#060E1C] flex flex-col items-center justify-center p-6 sm:p-10 bg-white">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-8">QUESTION / CONCEPT</p>
                <div className="text-2xl md:text-3xl font-black text-dark text-center leading-tight">
                  {flashcards[currentIdx].front}
                </div>
                <p className="mt-8 text-sm font-bold text-dark/40 italic">Click to flip</p>
              </div>

              {/* Back of Card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 border-[4px] sm:border-[6px] border-dark rounded-[32px] sm:rounded-[40px] shadow-[8px_8px_0px_#060E1C] sm:shadow-[12px_12px_0px_#060E1C] flex flex-col items-center justify-center p-6 sm:p-10 bg-emerald-50">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-8">ANSWER / EXPLANATION</p>
                <div className="text-xl md:text-2xl font-black text-dark text-center leading-relaxed">
                  {flashcards[currentIdx].back}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); speak(flashcards[currentIdx].back); }}
                  className="mt-8 h-14 w-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  <Volume2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={prevCard}
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl border-[3px] sm:border-[4px] border-dark bg-white flex items-center justify-center shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
            
            <div className="px-6 py-3 sm:px-8 sm:py-4 bg-white border-[3px] sm:border-[4px] border-dark rounded-2xl font-black text-lg sm:text-xl shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C]">
              {currentIdx + 1} / {flashcards.length}
            </div>

            <button 
              onClick={nextCard}
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl border-[3px] sm:border-[4px] border-dark bg-emerald-500 text-white flex items-center justify-center shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </div>

          <button 
            onClick={() => { setFlashcards([]); setTopic(''); setSubject(''); }}
            className="flex items-center gap-2 px-6 py-3 border-[3px] border-dark bg-off-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-[4px_4px_0px_#060E1C] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <RotateCcw className="h-4 w-4" /> New Topic
          </button>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
