'use client';

import { useState, useEffect } from 'react';
import { useBand } from '@/components/dashboards/BandContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowRight, Trophy, Flag, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';
import { playSound } from '@/utils/sounds'; // Assumes playSound exists as mentioned

type Question = {
  id: string;
  grade_band: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  notable_figures: {
    name: string;
    birth_year: number;
    death_year: number;
    nationality: string;
    field: string;
    image_url: string;
  };
};

export default function DoYouKnowGame() {
  const { band } = useBand();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [band]);

  const fetchQuestions = async () => {
    setLoading(true);
    setGameOver(false);
    try {
      const res = await fetch(`/api/games/do-you-know?gradeBand=${band}`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } catch (error) {
      toast.error("Couldn't load the game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === questions[currentIndex].correct_answer;
    
    if (isCorrect) {
      // try { playSound('success'); } catch (e) {}
      setScore(s => s + 10 + (streak * 2));
      setStreak(s => s + 1);
      toast.success("Correct! 🎉");
    } else {
      // try { playSound('error'); } catch (e) {}
      setStreak(0);
      toast.error("Not quite! 🤔");
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setGameOver(true);
      // try { playSound('levelUp'); } catch(e) {}
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 border-[4px] border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-yellow-100">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-3xl font-black uppercase">No Questions Yet!</h2>
        <p className="text-lg font-bold">We couldn't find any questions for your grade band ({band}). Check back soon!</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center p-12 text-center space-y-8 border-[6px] border-black rounded-[32px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-green-200">
        <Trophy className="w-32 h-32 text-yellow-500 fill-yellow-500" />
        <h2 className="text-5xl font-black uppercase tracking-tight">Game Over!</h2>
        <div className="text-3xl font-bold bg-white border-4 border-black px-8 py-4 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          Final Score: {score}
        </div>
        <Button 
          size="lg" 
          onClick={fetchQuestions}
          className="text-2xl font-bold border-[4px] border-black rounded-full px-12 py-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-purple-500 hover:bg-purple-600 text-white"
        >
          Play Again
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const figure = currentQ.notable_figures;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header Stats */}
      <div className="flex justify-between items-center bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-2xl font-black uppercase flex items-center gap-2">
          <span className="bg-yellow-300 px-3 py-1 border-2 border-black rounded-lg">Q: {currentIndex + 1}/{questions.length}</span>
        </div>
        <div className="text-2xl font-black uppercase flex items-center gap-4">
          {streak > 1 && <span className="text-orange-500 animate-bounce">🔥 {streak} Streak!</span>}
          <span className="bg-green-300 px-4 py-1 border-2 border-black rounded-lg flex items-center gap-2">
            Score: {score}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Figure Card */}
        <div className="md:col-span-2 space-y-4">
          <Card className="border-[6px] border-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-blue-100">
            <div className="aspect-square bg-blue-200 border-b-[6px] border-black relative flex items-center justify-center p-4">
               {figure.image_url ? (
                 <img src={figure.image_url} alt={figure.name} className="w-full h-full object-cover rounded-xl border-4 border-black" />
               ) : (
                 <div className="w-full h-full bg-blue-300 border-4 border-black rounded-xl flex items-center justify-center">
                    <span className="text-6xl text-blue-500 font-black">?</span>
                 </div>
               )}
               {/* Badges */}
               <div className="absolute top-4 left-4 bg-white border-4 border-black rounded-full px-3 py-1 font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                 <Flag className="w-4 h-4" /> {figure.nationality}
               </div>
               <div className="absolute top-4 right-4 bg-pink-300 border-4 border-black rounded-full px-3 py-1 font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 {figure.field}
               </div>
            </div>
            <CardContent className="p-6 text-center bg-white">
              <h2 className="text-3xl font-black mb-2 uppercase leading-tight">{figure.name}</h2>
              <p className="text-xl font-bold text-gray-600">
                {figure.birth_year ? figure.birth_year : '?'} - {figure.death_year ? figure.death_year : 'Present'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Question Area */}
        <div className="md:col-span-3 flex flex-col space-y-6">
          <Card className="border-[6px] border-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-yellow-100 p-8 flex-grow">
            <h3 className="text-3xl font-black mb-8 leading-tight">{currentQ.question_text}</h3>
            
            <div className="space-y-4">
              {currentQ.options.map((opt, i) => {
                let btnStyle = "bg-white hover:bg-gray-100 text-black";
                
                if (isAnswered) {
                  if (opt === currentQ.correct_answer) {
                    btnStyle = "bg-green-400 text-black border-green-700 shadow-[0_0_0_0_rgba(0,0,0,1)] translate-y-1";
                  } else if (opt === selectedAnswer) {
                    btnStyle = "bg-red-400 text-white border-red-700 shadow-[0_0_0_0_rgba(0,0,0,1)] translate-y-1";
                  } else {
                    btnStyle = "bg-gray-200 text-gray-500 opacity-50";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full text-left p-6 border-[4px] border-black rounded-2xl text-xl font-bold transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${!isAnswered ? 'hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]' : ''} ${btnStyle}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {isAnswered && (
              <div className="mt-8 p-6 bg-white border-4 border-black rounded-2xl">
                <p className="text-xl font-bold">{currentQ.explanation}</p>
                <div className="mt-6 flex justify-end">
                  <Button 
                    size="lg" 
                    onClick={nextQuestion}
                    className="text-xl font-black bg-purple-500 hover:bg-purple-600 text-white border-4 border-black rounded-full px-8 py-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    Next Question <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
