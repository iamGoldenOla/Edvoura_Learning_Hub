'use client';

import { useState, useEffect } from 'react';
import { useBand } from '@/components/dashboards/BandContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowRight, Trophy, AlertCircle, HelpCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

type Riddle = {
  id: string;
  answer: string;
  category: string;
  clue_1: string;
  clue_2: string;
  clue_3: string;
  clue_4: string;
};

export default function WhatAmIGame() {
  const { band } = useBand();
  const [riddles, setRiddles] = useState<Riddle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentClueStep, setCurrentClueStep] = useState(1);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [guess, setGuess] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchRiddles();
  }, [band]);

  const fetchRiddles = async () => {
    setLoading(true);
    setGameOver(false);
    try {
      const res = await fetch(`/api/games/what-am-i?gradeBand=${band}`);
      if (!res.ok) throw new Error('Failed to fetch riddles');
      const data = await res.json();
      setRiddles(data.riddles || []);
      setCurrentIndex(0);
      setCurrentClueStep(1);
      setScore(0);
      setGuess('');
      setIsAnswered(false);
      setFailed(false);
    } catch (error) {
      toast.error("Couldn't load the game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !guess.trim()) return;

    const currentRiddle = riddles[currentIndex];
    const isCorrect = guess.toLowerCase().trim() === currentRiddle.answer.toLowerCase().trim();

    if (isCorrect) {
      const points = 5 - currentClueStep; // Clue 1: 4pts, 2: 3pts, 3: 2pts, 4: 1pt
      setScore(s => s + points);
      setIsAnswered(true);
      setCurrentClueStep(4); // Reveal all clues
      toast.success(`Correct! +${points} points 🎉`);
    } else {
      if (currentClueStep < 4) {
        setCurrentClueStep(c => c + 1);
        setGuess('');
        toast.error("Not quite! Here's another clue.");
      } else {
        setIsAnswered(true);
        setFailed(true);
        toast.error(`Out of clues! It was ${currentRiddle.answer}.`);
      }
    }
  };

  const nextRiddle = () => {
    if (currentIndex < riddles.length - 1) {
      setCurrentIndex(c => c + 1);
      setCurrentClueStep(1);
      setGuess('');
      setIsAnswered(false);
      setFailed(false);
    } else {
      setGameOver(true);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (riddles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 border-[4px] border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-yellow-100">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-3xl font-black uppercase">No Riddles Yet!</h2>
        <p className="text-lg font-bold">We couldn't find any riddles for your grade band ({band}).</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center p-12 text-center space-y-8 border-[6px] border-black rounded-[32px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-cyan-200">
        <Trophy className="w-32 h-32 text-yellow-500 fill-yellow-500" />
        <h2 className="text-5xl font-black uppercase tracking-tight">Well Done!</h2>
        <div className="text-3xl font-bold bg-white border-4 border-black px-8 py-4 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          Total Score: {score}
        </div>
        <Button 
          size="lg" 
          onClick={fetchRiddles}
          className="text-2xl font-bold border-[4px] border-black rounded-full px-12 py-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-purple-500 hover:bg-purple-600 text-white"
        >
          Play Again
        </Button>
      </div>
    );
  }

  const currentRiddle = riddles[currentIndex];
  const clues = [currentRiddle.clue_1, currentRiddle.clue_2, currentRiddle.clue_3, currentRiddle.clue_4];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24">
      {/* Header Stats */}
      <div className="flex justify-between items-center bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-2xl font-black uppercase flex items-center gap-2">
           <HelpCircle className="w-8 h-8 text-blue-500" /> Riddle {currentIndex + 1}/{riddles.length}
        </div>
        <div className="text-2xl font-black uppercase">
          <span className="bg-green-300 px-4 py-2 border-2 border-black rounded-lg">Score: {score}</span>
        </div>
      </div>

      <div className="space-y-4">
        {clues.map((clue, idx) => (
          <div 
            key={idx}
            className={`transition-all duration-500 ${idx < currentClueStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none hidden'}`}
          >
            <Card className="border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 bg-yellow-100">
              <div className="flex gap-4 items-start">
                <div className="bg-white border-2 border-black rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center font-black text-xl">
                  {idx + 1}
                </div>
                <p className="text-2xl font-bold pt-1">{clue}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {!isAnswered ? (
        <form onSubmit={handleGuess} className="mt-8">
          <Card className="border-[6px] border-black rounded-[32px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 bg-white flex gap-4">
            <Input 
              autoFocus
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="What am I?"
              className="text-3xl font-bold h-20 px-6 border-[4px] border-black rounded-2xl shadow-inner bg-gray-50 focus-visible:ring-0 focus-visible:border-blue-500"
            />
            <Button 
              type="submit"
              disabled={!guess.trim()}
              className="h-20 px-10 text-2xl font-black uppercase bg-blue-500 hover:bg-blue-600 text-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:shadow-none transition-all disabled:opacity-50"
            >
              Guess
            </Button>
          </Card>
        </form>
      ) : (
        <Card className={`border-[6px] border-black rounded-[32px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 mt-8 ${failed ? 'bg-red-200' : 'bg-green-200'} flex flex-col items-center justify-center space-y-6 text-center`}>
           <h2 className="text-4xl font-black uppercase">
             {failed ? "It was..." : "You got it!"}
           </h2>
           <p className="text-5xl font-black bg-white border-4 border-black px-8 py-4 rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             {currentRiddle.answer}
           </p>
           <Button 
             size="lg" 
             onClick={nextRiddle}
             className="mt-4 text-2xl font-black bg-black text-white hover:bg-gray-800 border-[4px] border-transparent rounded-full px-12 py-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] transition-all"
           >
             Next Riddle <ArrowRight className="ml-2 w-8 h-8" />
           </Button>
        </Card>
      )}
    </div>
  );
}
