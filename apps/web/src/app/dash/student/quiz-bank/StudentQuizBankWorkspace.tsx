'use client';

import React, { useState, useEffect } from 'react';
import WeakTopicsWidget from './WeakTopicsWidget';
import ChildComplianceSignupModal from './ChildComplianceSignupModal';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Globe,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface QuestionItem {
  id: string;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  topic: string;
  curriculumRegion: string;
}

interface StudentQuizBankWorkspaceProps {
  initialRegion?: string;
  studentGradeName?: string;
  studentGradeCode?: string;
  studentId?: string;
}

const REGION_MAP: Record<string, { name: string; flag: string; label: string }> = {
  NG: { name: 'Nigeria', flag: '🇳🇬', label: 'Grade / Basic / SS' },
  US: { name: 'United States', flag: '🇺🇸', label: 'Grade K-12' },
  UK: { name: 'United Kingdom', flag: '🇬🇧', label: 'Year 1-13' },
  IN: { name: 'India', flag: '🇮🇳', label: 'Class 1-12' },
  EG: { name: 'Egypt', flag: '🇪🇬', label: 'Grade 1-12' },
  GLOBAL: { name: 'Universal International', flag: '🌐', label: 'Global Standard' },
};

export default function StudentQuizBankWorkspace({
  initialRegion = 'NG',
  studentGradeName = 'Primary 3 (Grade 3)',
  studentGradeCode = 'grade_3',
  studentId = 'guest_student',
}: StudentQuizBankWorkspaceProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Section B Inline Flag Modal State
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('unclear');
  const [flagNotes, setFlagNotes] = useState('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);
  const [flagFeedback, setFlagFeedback] = useState('');

  const fetchQuestions = async () => {
    setLoading(true);
    setSubmitted(false);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setScore(0);

    try {
      const regionParam = encodeURIComponent(selectedRegion);
      const gradeParam = encodeURIComponent(studentGradeCode);
      const subjectParam = encodeURIComponent(selectedSubject);
      const res = await fetch(
        `/api/question-bank/${regionParam}/${gradeParam}/${subjectParam}?studentId=${encodeURIComponent(studentId)}&limit=5`
      );
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions([]);
      }
    } catch (e) {
      console.error('Failed to load question bank drill:', e);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedRegion, selectedSubject, studentGradeCode]);

  const handleSelectOption = (option: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleSendFlag = async () => {
    if (!currentQ) return;
    setIsSubmittingFlag(true);
    try {
      const res = await fetch('/api/question-bank/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          flaggedBy: studentId,
          flagReason,
          notes: flagNotes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.autoPulled) {
          setFlagFeedback(`🚩 Question received ${data.openFlagCount} flags and was automatically pulled from student rotation for educator review.`);
        } else {
          setFlagFeedback('🚩 Thank you! Question reported to educators for review.');
        }
        setShowFlagModal(false);
        setFlagNotes('');
      } else {
        setFlagFeedback('Failed to flag question.');
      }
    } catch (e) {
      setFlagFeedback('Error sending flag report.');
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  const handleSubmitQuiz = async () => {
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      const isCorrect = selectedAnswers[idx]?.trim() === q.correctAnswer.trim();
      if (isCorrect) {
        calculatedScore += 1;
      }
      // Section D: Update topic_mastery in background on-write
      fetch('/api/student/topic-mastery/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          subject: selectedSubject,
          topic: q.topic,
          isCorrect,
        }),
      }).catch((e) => console.error('Topic mastery update error:', e));
    });
    setScore(calculatedScore);
    setSubmitted(true);
  };

  const currentQ = questions[currentIndex];
  const regionInfo = REGION_MAP[selectedRegion] || REGION_MAP.GLOBAL;

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <section className="rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow border-[2px] border-dark rounded-lg text-[10px] font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C] mb-2">
            🎯 Region-Aware Question Engine · {regionInfo.flag} {regionInfo.name}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
            Curriculum Question Bank Drill
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-dark/70 mt-1">
            Practice questions tailored to your region's curriculum ({studentGradeName}).
          </p>
        </div>

        {/* Region Selector */}
        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border-[2.5px] border-dark shrink-0">
          <Globe className="h-4 w-4 text-dark/60" />
          <span className="text-xs font-black uppercase text-dark/60">Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-[2px] border-dark bg-white text-xs font-bold text-dark outline-none cursor-pointer"
          >
            <option value="NG">🇳🇬 Nigeria (NG)</option>
            <option value="US">🇺🇸 United States (US)</option>
            <option value="UK">🇬🇧 United Kingdom (UK)</option>
            <option value="IN">🇮🇳 India (IN)</option>
            <option value="EG">🇪🇬 Egypt (EG)</option>
            <option value="GLOBAL">🌐 Universal (GLOBAL)</option>
          </select>
        </div>
      </section>

      {/* Section D: Weak Topics & Mastery Surfacing Widget */}
      <WeakTopicsWidget
        studentId={studentId}
        onSelectTopicForPractice={(subj, top) => {
          setSelectedSubject(subj);
          fetchQuestions();
        }}
      />

      {/* Section A: Minors' Data Compliance Check Modal / Banner */}
      <ChildComplianceSignupModal studentId={studentId} />

      {/* Subject Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl border-[3px] border-dark bg-slate-50 shadow-[4px_4px_0px_#060E1C]">
        {[
          'Mathematics',
          'Basic Science & Technology',
          'English / Language Arts',
          'Social Studies',
          'Civic Education / Government',
          'Current Affairs',
        ].map((subject) => {
          const isActive = selectedSubject === subject;
          return (
            <button
              key={subject}
              type="button"
              onClick={() => setSelectedSubject(subject)}
              className={`px-3.5 py-1.5 rounded-xl border-[2px] border-dark text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                isActive ? 'bg-yellow text-dark shadow-[2px_2px_0px_#060E1C]' : 'bg-white text-dark/70 hover:bg-gray-100'
              }`}
            >
              {subject}
            </button>
          );
        })}
      </div>

      {/* Quiz Workspace */}
      {loading ? (
        <div className="py-16 text-center border-[4px] border-dark rounded-2xl bg-white p-8 space-y-3 shadow-[6px_6px_0px_#060E1C]">
          <RefreshCw className="h-8 w-8 text-dark animate-spin mx-auto" />
          <h3 className="text-base font-black text-dark">Fetching Region Questions...</h3>
        </div>
      ) : questions.length > 0 ? (
        <div className="rounded-[24px] border-[4px] border-dark bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#060E1C] space-y-6">
          {/* Progress Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-dark/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow border-[2px] border-dark rounded-xl text-xs font-black uppercase text-dark">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-bold text-dark/60 truncate max-w-[200px] sm:max-w-none">Topic: {currentQ.topic}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 bg-purple-100 border border-dark rounded-lg text-dark">
                {currentQ.curriculumRegion} Curriculum
              </span>

              {/* Inline Flag Question Button */}
              <button
                type="button"
                onClick={() => setShowFlagModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 border border-dark rounded-lg text-xs font-black text-rose-900 shadow-[1px_1px_0px_#060E1C] hover:bg-rose-200 cursor-pointer transition-all"
                title="Report error, wrong answer, or ambiguous question"
              >
                <span>🚩 Flag Question</span>
              </button>
            </div>
          </div>

          {flagFeedback ? (
            <div className="p-3 rounded-xl border-[2px] border-dark bg-amber-100 text-dark text-xs font-bold flex items-center justify-between">
              <span>{flagFeedback}</span>
              <button type="button" onClick={() => setFlagFeedback('')} className="text-dark/60 font-black">✕</button>
            </div>
          ) : null}

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-dark leading-snug">
              {currentQ.questionText}
            </h2>

            {/* MCQ Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentIndex] === opt;
                const isCorrect = opt.trim() === currentQ.correctAnswer.trim();

                let style = 'bg-slate-50 hover:bg-slate-100 text-dark border-dark';
                if (isSelected) {
                  style = 'bg-yellow border-dark text-dark font-black shadow-[3px_3px_0px_#060E1C]';
                }
                if (submitted) {
                  if (isCorrect) {
                    style = 'bg-emerald-200 border-emerald-900 text-emerald-950 font-black shadow-[3px_3px_0px_#060E1C]';
                  } else if (isSelected && !isCorrect) {
                    style = 'bg-rose-200 border-rose-900 text-rose-950 font-black shadow-[3px_3px_0px_#060E1C]';
                  }
                }

                return (
                  <button
                    key={`option-${idx}`}
                    type="button"
                    disabled={submitted}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl border-[3px] text-left text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${style}`}
                  >
                    <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                    {submitted && isCorrect ? <CheckCircle className="h-5 w-5 text-emerald-800 shrink-0" /> : null}
                    {submitted && isSelected && !isCorrect ? <XCircle className="h-5 w-5 text-rose-800 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation if submitted */}
          {submitted ? (
            <div className="p-4 rounded-2xl border-[3px] border-dark bg-yellow/10 space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-dark/70">💡 Answer Explanation:</span>
              <p className="text-xs sm:text-sm font-semibold text-dark/90">{currentQ.explanation}</p>
            </div>
          ) : null}

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-4 border-t-[3px] border-dark/10">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="px-4 py-2.5 rounded-xl border-[2px] border-dark bg-white font-black text-xs uppercase text-dark shadow-[2px_2px_0px_#060E1C] disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl border-[2px] border-dark bg-yellow font-black text-xs uppercase text-dark shadow-[3px_3px_0px_#060E1C] hover:bg-yellow-400 cursor-pointer flex items-center gap-1"
              >
                <span>Next Question</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : !submitted ? (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl border-[3px] border-dark bg-emerald-400 font-black text-xs uppercase text-dark shadow-[4px_4px_0px_#060E1C] hover:bg-emerald-300 cursor-pointer"
              >
                Submit Answers
              </button>
            ) : (
              <button
                type="button"
                onClick={fetchQuestions}
                className="px-6 py-2.5 rounded-xl border-[3px] border-dark bg-yellow font-black text-xs uppercase text-dark shadow-[4px_4px_0px_#060E1C] hover:bg-yellow-400 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4 text-dark" />
                <span>Next Drill Set</span>
              </button>
            )}
          </div>

          {/* Submitted Score Banner */}
          {submitted ? (
            <div className="p-6 rounded-2xl border-[3px] border-dark bg-emerald-100 text-center space-y-2 shadow-[4px_4px_0px_#060E1C]">
              <Award className="h-10 w-10 text-emerald-800 mx-auto" />
              <h3 className="text-xl font-black text-dark">
                Drill Completed! Score: {score} / {questions.length}
              </h3>
              <p className="text-xs font-bold text-dark/70">
                {score === questions.length ? '🌟 Perfect score! Outstanding mastery of your region curriculum!' : 'Great effort! Review the explanations above and start another drill!'}
              </p>
            </div>
          ) : null}
        
          {/* Inline Flag Modal */}
          {showFlagModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C] space-y-4">
                <div className="flex items-center justify-between border-b border-dark/10 pb-3">
                  <h3 className="text-lg font-black text-dark">🚩 Flag This Question</h3>
                  <button type="button" onClick={() => setShowFlagModal(false)} className="text-dark/60 font-black">✕</button>
                </div>

                <p className="text-xs font-bold text-dark/70">
                  Report wrong answer keys, unclear wording, outdated content, or formatting issues to educators.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-dark/60">Reason for Flagging:</label>
                    <select
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl border-[2px] border-dark text-xs font-bold bg-white outline-none"
                    >
                      <option value="wrong_answer">❌ Wrong Answer Key</option>
                      <option value="unclear">❓ Unclear / Ambiguous Wording</option>
                      <option value="outdated">📅 Outdated Current Affairs / Content</option>
                      <option value="inappropriate">⚠️ Inappropriate Content</option>
                      <option value="other">📝 Other Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-dark/60">Additional Notes (Optional):</label>
                    <textarea
                      placeholder="Describe what is wrong with this question..."
                      value={flagNotes}
                      onChange={(e) => setFlagNotes(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl border-[2px] border-dark text-xs font-semibold bg-white h-20 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFlagModal(false)}
                    className="flex-1 py-2.5 border-[2px] border-dark rounded-xl text-xs font-black uppercase bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingFlag}
                    onClick={handleSendFlag}
                    className="flex-1 py-2.5 border-[2px] border-dark rounded-xl text-xs font-black uppercase bg-rose-300 hover:bg-rose-400 text-rose-950 shadow-[2px_2px_0px_#060E1C]"
                  >
                    {isSubmittingFlag ? 'Submitting...' : 'Submit Flag'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="py-16 text-center border-[4px] border-dashed border-dark/20 rounded-2xl bg-white p-8 space-y-3 shadow-[6px_6px_0px_#060E1C]">
          <div className="text-3xl">🎯</div>
          <h3 className="text-base font-black text-dark">No Approved Questions in Bank Yet</h3>
          <p className="text-xs font-bold text-dark/60 max-w-md mx-auto">
            Questions for {selectedSubject} in region {selectedRegion} are currently in the educator moderation queue. Switch to another subject or region above!
          </p>
        </div>
      )}
    </div>
  );
}
