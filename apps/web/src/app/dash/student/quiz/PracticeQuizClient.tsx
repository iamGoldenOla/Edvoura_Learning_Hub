'use client';

import { useState } from 'react';
import { Sparkles, Brain, ArrowRight, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PracticeQuizClient({ subjects, gradeCode }: { subjects: any[], gradeCode: string }) {
  const [formSubject, setFormSubject] = useState(subjects[0]?.name || '');
  const [formTopic, setFormTopic] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [error, setError] = useState('');

  // Quiz taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  async function handleGenerate() {
    if (!formSubject || !formTopic) return;
    setIsGenerating(true);
    setError('');
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setHasSubmitted(false);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'quiz',
          subject: formSubject,
          topic: formTopic,
          gradeLevel: gradeCode || 'JSS 1',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Filter out any non-MCQ questions just in case to maintain the layout
        const mcqs = data.content.questions.filter((q: any) => q.options && q.options.length >= 2);
        setQuizData({ ...data.content, questions: mcqs });
      } else {
        setError(data.error || 'Failed to generate quiz.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleOptionClick(opt: string) {
    if (!hasSubmitted) {
      setSelectedAnswer(opt);
    }
  }

  function handleSubmitAnswer() {
    if (!selectedAnswer) return;
    setHasSubmitted(true);
    
    const currentQuestion = quizData.questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setHasSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  }

  if (quizFinished) {
    return (
      <div className="rounded-[28px] border-[4px] border-dark bg-white p-8 md:p-12 shadow-[10px_10px_0px_#060E1C] flex flex-col items-center text-center">
        <div className="h-24 w-24 bg-yellow border-[4px] border-dark rounded-full flex items-center justify-center shadow-[4px_4px_0px_#060E1C] mb-6">
          <Sparkles className="h-12 w-12 text-dark" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tight mb-4">Quiz Complete!</h2>
        <p className="text-2xl font-bold text-dark/70 mb-8">
          You scored <span className="text-emerald-600 font-black">{score}</span> out of {quizData.questions.length}
        </p>
        <Button 
          onClick={() => setQuizData(null)}
          className="bg-emerald-400 border-[3px] border-dark text-dark font-black px-8 py-4 text-lg rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 h-auto"
        >
          Generate Another Quiz
        </Button>
      </div>
    );
  }

  if (quizData && quizData.questions && quizData.questions.length > 0) {
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const letters = ['A', 'B', 'C', 'D'];

    return (
      <div className="rounded-[28px] border-[4px] border-dark bg-white p-6 md:p-10 shadow-[10px_10px_0px_#060E1C]">
        <div className="flex items-center justify-between border-b-[4px] border-dark pb-6 mb-8">
          <h2 className="text-2xl font-black text-dark tracking-tight">{quizData.title}</h2>
          <div className="bg-dark text-white font-black px-4 py-2 rounded-xl text-sm border-[3px] border-dark shadow-[2px_2px_0px_#060E1C]">
            Question {currentQuestionIndex + 1} / {quizData.questions.length}
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-2xl md:text-3xl font-black text-dark leading-snug">
            {currentQuestion.questionText}
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-10">
          {currentQuestion.options?.map((opt: string, i: number) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = hasSubmitted && opt === currentQuestion.correctAnswer;
            const isWrongSelection = hasSubmitted && isSelected && opt !== currentQuestion.correctAnswer;

            let btnClass = "text-left p-4 md:p-6 rounded-2xl border-[4px] font-bold text-lg md:text-xl transition-all ";
            
            if (!hasSubmitted) {
              btnClass += isSelected 
                ? "border-dark bg-yellow shadow-[4px_4px_0px_#060E1C]" 
                : "border-dark bg-white shadow-[4px_4px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-gray-50";
            } else {
              if (isCorrect) {
                btnClass += "border-emerald-700 bg-emerald-400 text-dark shadow-[4px_4px_0px_#060E1C]";
              } else if (isWrongSelection) {
                btnClass += "border-rose-700 bg-rose-400 text-dark shadow-none translate-x-[2px] translate-y-[2px]";
              } else {
                btnClass += "border-dark/30 bg-gray-100 text-dark/50 opacity-50";
              }
            }

            return (
              <button 
                key={i} 
                onClick={() => handleOptionClick(opt)}
                disabled={hasSubmitted}
                className={btnClass}
              >
                <span className="inline-block bg-white border-[3px] border-dark rounded-lg px-3 py-1 mr-3 text-sm font-black shadow-[2px_2px_0px_#060E1C]">
                  {letters[i] || '?'}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {hasSubmitted && (
          <div className={`p-6 rounded-2xl border-[3px] border-dark mb-8 flex gap-4 items-start ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-emerald-100' : 'bg-rose-100'}`}>
            <div className="mt-1">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-600" />
              )}
            </div>
            <div>
              <p className="font-black text-xl mb-2 text-dark">
                {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
              </p>
              <p className="font-bold text-dark/80 text-lg leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t-[3px] border-dark">
          {!hasSubmitted ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="bg-yellow border-[3px] border-dark text-dark font-black px-8 py-4 text-lg rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 h-auto disabled:opacity-50"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              className="bg-dark border-[3px] border-dark text-white font-black px-8 py-4 text-lg rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 h-auto"
            >
              {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border-[4px] border-dark bg-[#E0E7FF] p-6 sm:p-10 shadow-[10px_10px_0px_#060E1C] relative overflow-hidden">
      {/* Background decoration */}
      <Brain className="absolute -bottom-10 -right-10 w-64 h-64 text-indigo-300/40 rotate-12" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-xl border-[3px] border-dark bg-yellow px-4 py-2 text-sm font-black tracking-widest text-dark uppercase shadow-[3px_3px_0px_#060E1C]">
            <Sparkles className="h-4 w-4" /> Automated Practice
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-dark tracking-tight leading-[1.1]">
            Challenge Edvoura AI to a Quick Quiz
          </h2>
          <p className="text-lg font-bold text-dark/70">
            Select a subject and topic, and Edvoura AI will instantly generate a 20-question challenge just for you.
          </p>
        </div>

        <div className="w-full md:w-[400px] bg-white rounded-2xl border-[4px] border-dark p-6 shadow-[8px_8px_0px_#060E1C]">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-dark/60 mb-2">Subject</label>
              <select 
                value={formSubject}
                onChange={e => setFormSubject(e.target.value)}
                className="w-full rounded-xl border-[3px] border-dark bg-gray-50 px-4 py-3 text-sm font-bold text-dark outline-none focus:border-indigo-500 focus:bg-white"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-dark/60 mb-2">Topic (Be specific)</label>
              <input 
                value={formTopic}
                onChange={e => setFormTopic(e.target.value)}
                placeholder="e.g. Fractions, Cell Biology..."
                className="w-full rounded-xl border-[3px] border-dark bg-gray-50 px-4 py-3 text-sm font-bold text-dark outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
            
            {error && (
              <p className="text-sm font-bold text-rose-600 bg-rose-50 p-3 rounded-lg border-[2px] border-rose-200">
                {error}
              </p>
            )}

            <Button 
              disabled={isGenerating || !formSubject || !formTopic}
              onClick={handleGenerate}
              className="w-full bg-indigo-500 border-[3px] border-dark text-white font-black px-6 py-4 text-lg rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 h-auto mt-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCcw className="mr-2 h-5 w-5 animate-spin" /> Generating...
                </>
              ) : (
                'Generate Practice'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
