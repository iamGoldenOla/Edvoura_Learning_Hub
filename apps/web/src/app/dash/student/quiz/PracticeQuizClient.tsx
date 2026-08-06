'use client';

import { useState } from 'react';
import { BookOpen, Sparkles, Brain, ArrowRight, CheckCircle2, XCircle, Play, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OFFICIAL_CURRICULUM_QUESTIONS, type CurriculumQuestion } from '@/lib/curriculum/curriculumQuestionBank';

export type QuizQuestion = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type QuizPayload = {
  title: string;
  description?: string;
  questions: QuizQuestion[];
};

export type QuizCard = {
  id: string;
  title: string;
  instructions: string;
  data: QuizPayload;
};

export function PracticeQuizClient({
  aiQuizzes,
  studentGradeCode = 'grade_1',
  studentGradeName = 'Grade 1',
}: {
  aiQuizzes: QuizCard[];
  studentGradeCode?: string;
  studentGradeName?: string;
}) {
  const [quizData, setQuizData] = useState<QuizPayload | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const [selectedGradeCode, setSelectedGradeCode] = useState<string>(studentGradeCode);

  function startQuiz(data: QuizPayload) {
    // Filter out any non-MCQ questions just in case to maintain the layout
    const mcqs = data.questions.filter((q) => q.options && q.options.length >= 2);
    setQuizData({ ...data, questions: mcqs });
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setHasSubmitted(false);
  }

  function handleOptionClick(opt: string) {
    if (!hasSubmitted) {
      setSelectedAnswer(opt);
    }
  }

  function handleSubmitAnswer() {
    if (!selectedAnswer || !quizData) return;
    setHasSubmitted(true);
    const currentQuestion = quizData.questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  }

  function handleNextQuestion() {
    if (!quizData) return;
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setHasSubmitted(false);
    } else {
      setQuizFinished(true);
      // Save results to DB (optional endpoint check)
      void fetch('/api/ai/practice/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: quizData.title,
          topic: quizData.description || 'Practice Challenge',
          score: score,
          totalQuestions: quizData.questions.length
        })
      });
    }
  }

  if (quizFinished && quizData) {
    return (
      <div className="flex flex-col items-center rounded-[24px] border-[4px] border-dark bg-white p-5 text-center shadow-[8px_8px_0px_#060E1C] sm:rounded-[28px] sm:p-8 md:p-12 sm:shadow-[10px_10px_0px_#060E1C]">
        <div className="h-24 w-24 bg-yellow border-[4px] border-dark rounded-full flex items-center justify-center shadow-[4px_4px_0px_#060E1C] mb-6">
          <Sparkles className="h-12 w-12 text-dark" />
        </div>
        <h2 className="mb-4 text-3xl font-black tracking-tight text-dark sm:text-4xl md:text-5xl">Quiz Complete!</h2>
        <p className="mb-8 text-xl font-bold text-dark/70 sm:text-2xl">
          You scored <span className="text-emerald-600 font-black">{score}</span> out of {quizData.questions.length}
        </p>
        <Button 
          onClick={() => setQuizData(null)}
          className="bg-emerald-400 border-[3px] border-dark text-dark font-black px-8 py-4 text-lg rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 h-auto"
        >
          Back to Hub
        </Button>
      </div>
    );
  }

  function startCurriculumQuiz(gradeCode: string) {
    const questionsForGrade = OFFICIAL_CURRICULUM_QUESTIONS.filter(
      (q) => q.gradeCode === gradeCode
    );
    const pool = questionsForGrade.length > 0 ? questionsForGrade : OFFICIAL_CURRICULUM_QUESTIONS;
    const selected = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);

    const converted: QuizQuestion[] = selected.map((q) => ({
      questionText: `[${q.subjectName}] ${q.questionText}`,
      options: q.options,
      correctAnswer: q.options[q.correctIndex],
      explanation: q.explanation,
    }));

    const gradeLabel = selected[0]?.gradeName || gradeCode.replace('grade_', 'Grade ');

    startQuiz({
      title: `Official Lesson Notes Retention Test (${gradeLabel})`,
      description: `Targeted revision quiz derived directly from your official curriculum lesson notes.`,
      questions: converted,
    });
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="space-y-8">
        {/* Official Curriculum Notes Retention Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[28px] border-[4px] border-dark bg-yellow/20 p-6 sm:p-8 shadow-[10px_10px_0px_#060E1C]">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-lg border-[2px] border-dark bg-yellow px-3 py-1 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C]">
              <BookOpen className="h-3.5 w-3.5" /> Official Curriculum Retention Quiz
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
              Official Lesson Notes Test & Revision
            </h2>
            <p className="text-sm font-bold text-dark/70">
              Generate 5-question retention tests extracted directly from your 204 official purchased lesson notes (Primary 1 to SS 3 / Grade 1 to 12).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <select
              value={selectedGradeCode}
              onChange={(e) => setSelectedGradeCode(e.target.value)}
              className="px-4 py-3 rounded-xl border-[3px] border-dark bg-white font-black text-xs uppercase shadow-[3px_3px_0px_#060E1C] outline-none cursor-pointer"
            >
              <option value="grade_1">Primary 1 (Grade 1)</option>
              <option value="grade_2">Primary 2 (Grade 2)</option>
              <option value="grade_3">Primary 3 (Grade 3)</option>
              <option value="grade_4">Primary 4 (Grade 4)</option>
              <option value="grade_5">Primary 5 (Grade 5)</option>
              <option value="grade_6">Primary 6 (Grade 6)</option>
              <option value="grade_7">JSS 1 (Grade 7)</option>
              <option value="grade_8">JSS 2 (Grade 8)</option>
              <option value="grade_9">JSS 3 (Grade 9)</option>
              <option value="grade_10">SS 1 (Grade 10)</option>
              <option value="grade_11">SS 2 (Grade 11)</option>
              <option value="grade_12">SS 3 (Grade 12)</option>
            </select>

            <Button
              onClick={() => startCurriculumQuiz(selectedGradeCode)}
              className="border-[3px] border-dark bg-yellow hover:bg-yellow-light text-dark font-black px-6 py-3 text-sm rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none h-auto"
            >
              Take Retention Test <Play className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Existing AI & Tutor Quizzes */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aiQuizzes.length > 0 ? (
            aiQuizzes.map((q) => (
              <div key={q.id} className="flex flex-col rounded-[24px] border-[4px] border-dark bg-indigo-50 p-4 shadow-[6px_6px_0px_#060E1C] transition-all hover:-translate-y-1 sm:rounded-[28px] sm:p-6 sm:shadow-[8px_8px_0px_#060E1C]">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg border-[2px] border-dark bg-yellow px-2 py-1 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C]">
                  <Sparkles className="h-3 w-3" /> Practice Challenge
                </div>
                <h3 className="mb-2 text-lg font-black leading-tight tracking-tight text-dark break-words sm:text-xl">
                  {q.title}
                </h3>
                <p className="mb-6 flex-1 text-sm font-bold text-dark/60">
                  {q.instructions}
                </p>
                <Button
                  onClick={() => startQuiz(q.data)}
                  className="w-full border-[3px] border-dark bg-white py-3 font-black text-dark shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                  Start Practice <Play className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center rounded-[24px] border-[4px] border-dashed border-dark/20 bg-slate-50 p-8 text-center sm:rounded-[28px] sm:p-12">
              <Brain className="mb-4 h-10 w-10 text-dark/30" />
              <p className="text-sm font-bold italic text-dark/60">No additional study hub challenges published yet by your tutors.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const letters = ['A', 'B', 'C', 'D'];

  return (
      <div className="rounded-[24px] border-[4px] border-dark bg-white p-4 shadow-[8px_8px_0px_#060E1C] sm:rounded-[28px] sm:p-6 md:p-10 sm:shadow-[10px_10px_0px_#060E1C]">
        <div className="mb-6 flex flex-col gap-3 border-b-[4px] border-dark pb-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
          <h2 className="text-xl font-black tracking-tight text-dark sm:text-2xl break-words">{quizData.title}</h2>
          <div className="bg-dark text-white font-black px-4 py-2 rounded-xl text-sm border-[3px] border-dark shadow-[2px_2px_0px_#060E1C]">
            Question {currentQuestionIndex + 1} / {quizData.questions.length}
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-black leading-snug text-dark sm:text-2xl md:text-3xl break-words">
            {currentQuestion.questionText}
          </h3>
        </div>

        <div className="mb-10 grid gap-3 sm:gap-4 md:grid-cols-2">
          {currentQuestion.options?.map((opt: string, i: number) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = hasSubmitted && opt === currentQuestion.correctAnswer;
            const isWrongSelection = hasSubmitted && isSelected && opt !== currentQuestion.correctAnswer;

            let btnClass = "text-left p-4 sm:p-5 md:p-6 rounded-2xl border-[4px] font-bold text-base sm:text-lg md:text-xl transition-all break-words ";
            
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
                <span className="mr-3 inline-block rounded-lg border-[3px] border-dark bg-white px-3 py-1 text-sm font-black shadow-[2px_2px_0px_#060E1C]">
                  {letters[i] || '?'}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {hasSubmitted && (
          <div className={`mb-8 flex flex-col gap-4 rounded-2xl border-[3px] border-dark p-4 sm:flex-row sm:items-start sm:p-6 ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-emerald-100' : 'bg-rose-100'}`}>
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

        <div className="flex justify-stretch border-t-[3px] border-dark pt-6 sm:justify-end">
          {!hasSubmitted ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="h-auto w-full rounded-xl border-[3px] border-dark bg-yellow px-6 py-4 text-base font-black text-dark shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 disabled:opacity-50 sm:w-auto sm:px-8 sm:text-lg"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              className="h-auto w-full rounded-xl border-[3px] border-dark bg-dark px-6 py-4 text-base font-black text-white shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 sm:w-auto sm:px-8 sm:text-lg"
            >
              {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
  );
}
