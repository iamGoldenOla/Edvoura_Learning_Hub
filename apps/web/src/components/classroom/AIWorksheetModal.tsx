'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  FileText,
  Printer,
  Presentation,
  CheckCircle2,
  Loader2,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateCurriculumWorksheet, GeneratedWorksheet, WorksheetQuestion } from '@/lib/curriculum/worksheetGenerator';

interface AIWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPresentOnWhiteboard?: (worksheetText: string, title: string) => void;
  pupilName?: string;
  gradeLevel?: string;
}

export function AIWorksheetModal({
  isOpen,
  onClose,
  onPresentOnWhiteboard,
  pupilName = 'Pupil',
  gradeLevel = 'Grade 4',
}: AIWorksheetModalProps) {
  const [topic, setTopic] = useState('Long Multiplication & Word Problems');
  const [subject, setSubject] = useState('Mathematics');
  const [selectedGrade, setSelectedGrade] = useState(gradeLevel || 'Grade 4');
  const [difficulty, setDifficulty] = useState<'Standard' | 'Foundation' | 'Advanced'>('Standard');
  const [questionCount, setQuestionCount] = useState<number>(6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<GeneratedWorksheet | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, string>>({});

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedWorksheet(null);
    setStudentAnswers({});

    try {
      const response = await fetch('/api/ai/worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          gradeLevel: selectedGrade,
          difficulty,
          questionCount,
          pupilName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.worksheet && Array.isArray(data.worksheet.questions) && data.worksheet.questions.length > 0) {
          setGeneratedWorksheet(data.worksheet);
          setIsGenerating(false);
          return;
        }
      }

      // High-quality curriculum generator fallback (Guaranteed concrete math & word problems)
      const fallbackWorksheet = generateCurriculumWorksheet({
        topic,
        subject,
        gradeLevel: selectedGrade,
        difficulty,
        questionCount,
        pupilName,
      });
      setGeneratedWorksheet(fallbackWorksheet);
    } catch (err) {
      console.warn('AI worksheet fetch error, applying curriculum generator:', err);
      const fallbackWorksheet = generateCurriculumWorksheet({
        topic,
        subject,
        gradeLevel: selectedGrade,
        difficulty,
        questionCount,
        pupilName,
      });
      setGeneratedWorksheet(fallbackWorksheet);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = () => {
    if (!generatedWorksheet) return;
    const text = `${generatedWorksheet.title}\n${generatedWorksheet.instructions}\n\n` +
      generatedWorksheet.questions.map((q) => `${q.number}. ${q.question}`).join('\n\n') +
      (generatedWorksheet.bonusChallenge ? `\n\n${generatedWorksheet.bonusChallenge}` : '');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresent = () => {
    if (!generatedWorksheet || !onPresentOnWhiteboard) return;
    const worksheetText = `${generatedWorksheet.title}\n\n` +
      generatedWorksheet.questions.map((q) => `${q.number}. ${q.question}`).join('\n\n');
    onPresentOnWhiteboard(worksheetText, generatedWorksheet.title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 font-sans">
      <div className="bg-white border-[3px] border-dark rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#060E1C] overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 bg-yellow/30 border-b-[2.5px] border-dark flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow border-2 border-dark flex items-center justify-center shadow-[1.5px_1.5px_0px_#060E1C]">
              <Sparkles className="w-5 h-5 text-dark" />
            </div>
            <div>
              <h3 className="font-black text-base text-dark uppercase tracking-tight">
                AI Worksheet Studio (Canva Style)
              </h3>
              <p className="text-xs text-dark/70 font-bold">
                Instantly design custom printable &amp; whiteboard-ready worksheets for your pupils
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border-2 border-dark bg-white hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-dark shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Controls Left Column */}
          <div className="w-full md:w-80 bg-slate-50 border-b md:border-b-0 md:border-r-[2.5px] border-dark p-5 space-y-4 overflow-y-auto shrink-0 print:hidden">
            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-dark uppercase tracking-wider">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border-2 border-dark bg-white text-xs font-bold text-dark outline-none shadow-[1.5px_1.5px_0px_#060E1C]"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="English & Phonics">English &amp; Phonics</option>
                <option value="Science">Science</option>
                <option value="Verbal Reasoning">Verbal Reasoning</option>
                <option value="Non-Verbal Reasoning">Non-Verbal Reasoning</option>
              </select>
            </div>

            {/* Topic Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-dark uppercase tracking-wider">Lesson Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Long Multiplication & Word Problems"
                className="w-full h-9 px-3 rounded-xl border-2 border-dark bg-white text-xs font-bold text-dark outline-none shadow-[1.5px_1.5px_0px_#060E1C]"
              />
            </div>

            {/* Grade Level */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-dark uppercase tracking-wider">Grade</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full h-9 px-2 rounded-xl border-2 border-dark bg-white text-xs font-bold text-dark outline-none shadow-[1.5px_1.5px_0px_#060E1C]"
                >
                  <option value="Nursery / Early Years">Nursery / EYFS</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-dark uppercase tracking-wider">Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full h-9 px-2 rounded-xl border-2 border-dark bg-white text-xs font-bold text-dark outline-none shadow-[1.5px_1.5px_0px_#060E1C]"
                >
                  <option value={4}>4 Questions</option>
                  <option value={6}>6 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-dark uppercase tracking-wider">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-1">
                {(['Foundation', 'Standard', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`h-8 rounded-lg border-2 border-dark text-[10px] font-black uppercase transition-all ${
                      difficulty === lvl ? 'bg-yellow text-dark shadow-[1.5px_1.5px_0px_#060E1C]' : 'bg-white text-dark/60'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full h-11 bg-yellow hover:bg-yellow/90 border-[2.5px] border-dark text-dark font-black text-xs uppercase shadow-[3px_3px_0px_#060E1C] active:scale-95 transition-all mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Designing Worksheet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Generate Worksheet</span>
                </>
              )}
            </Button>
          </div>

          {/* Worksheet Preview Right Column */}
          <div className="flex-1 min-h-0 bg-white p-6 overflow-y-auto flex flex-col">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-dark space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-yellow" />
                <h4 className="font-black text-base uppercase">AI Curriculum Architect at Work...</h4>
                <p className="text-xs text-dark/60 max-w-sm font-semibold">
                  Structuring questions, formatting answer spaces, and aligning with {selectedGrade} standards.
                </p>
              </div>
            ) : generatedWorksheet ? (
              <div className="space-y-6">
                {/* Action Bar */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-dark/10 print:hidden">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                    <span className="text-xs font-bold text-dark/70">{generatedWorksheet.questions.length} Exercises</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onPresentOnWhiteboard && (
                      <Button
                        size="sm"
                        onClick={handlePresent}
                        className="h-8 px-3 bg-yellow border-2 border-dark text-dark text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
                        title="Present this worksheet on the Whiteboard canvas"
                      >
                        <Presentation className="w-3.5 h-3.5 mr-1" />
                        <span>Present Live</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrint}
                      className="h-8 px-2.5 border-2 border-dark text-dark text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
                      title="Print or Save as PDF"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      <span className="hidden sm:inline">Print / PDF</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyToClipboard}
                      className="h-8 px-2.5 border-2 border-dark text-dark text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>
                </div>

                {/* Printable Worksheet Canvas (Canva Style) */}
                <div className="p-8 border-[3px] border-dark rounded-2xl bg-white shadow-sm space-y-6 print:border-none print:p-0">
                  {/* Canva-style School Header */}
                  <div className="border-b-2 border-dark pb-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-dark text-yellow text-[10px] font-black uppercase tracking-wider">
                          EDVOURA LEARNING HUB
                        </span>
                        <span className="text-xs font-black text-dark/60 uppercase">{generatedWorksheet.subject}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-dark mt-1 tracking-tight">
                        {generatedWorksheet.title}
                      </h2>
                    </div>

                    <div className="text-right space-y-1 text-xs font-bold text-dark/70 shrink-0">
                      <div>Name: <span className="inline-block border-b-2 border-dark w-28 sm:w-36 text-left pl-1">{pupilName}</span></div>
                      <div>Date: <span className="inline-block border-b-2 border-dark w-28 sm:w-36" /></div>
                      <div>Score: <span className="inline-block border-b-2 border-dark w-16 text-center">_____ / 100</span></div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-3 bg-yellow/15 border-2 border-dark rounded-xl text-xs font-bold text-dark">
                    <span className="font-black uppercase tracking-wide mr-1.5">Instructions:</span>
                    <span>{generatedWorksheet.instructions}</span>
                  </div>

                  {/* Questions Grid with Column Math & Interactive Answers */}
                  <div className="space-y-6">
                    {generatedWorksheet.questions.map((q) => (
                      <div key={q.number} className="p-5 rounded-2xl border-2 border-dark/20 bg-slate-50/50 space-y-3 print:border-dark/30 print:p-3 print:break-inside-avoid">
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-dark text-white text-xs font-black flex items-center justify-center shrink-0">
                              {q.number}
                            </span>
                            <div className="space-y-1">
                              {q.badge && (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-white border border-dark/20 text-[10px] font-black uppercase text-dark/70 shadow-sm mr-2">
                                  {q.badge}
                                </span>
                              )}
                              <p className="text-sm font-black text-dark leading-snug whitespace-pre-line inline">{q.question}</p>
                              {q.hint && (
                                <p className="text-xs font-bold text-dark/50 italic pt-1">Tip: {q.hint}</p>
                              )}
                            </div>
                          </div>

                          {/* Column Math Format Box (Worksheetinator / wsMath style) */}
                          {q.columnFormat && (
                            <div className="bg-white border-2 border-dark rounded-xl p-3 font-mono text-sm font-black text-dark text-right min-w-[110px] shadow-[2px_2px_0px_#060E1C] shrink-0">
                              <div className="tracking-widest">{q.columnFormat.topNumber}</div>
                              <div className="tracking-widest border-b-2 border-dark flex items-center justify-between">
                                <span className="text-xs font-bold">{q.columnFormat.operator}</span>
                                <span>{q.columnFormat.bottomNumber}</span>
                              </div>
                              <div className="h-6" />
                            </div>
                          )}
                        </div>

                        {/* Working space lines */}
                        <div className="pl-8 space-y-2 pt-1 print:pl-4">
                          {Array.from({ length: q.answerSpaceLines || 3 }).map((_, i) => (
                            <div key={i} className="border-b border-dark/20 h-5" />
                          ))}
                        </div>

                        {/* Interactive Digital Student Answer Blank */}
                        <div className="pl-8 pt-1 flex items-center gap-2 print:hidden">
                          <span className="text-xs font-black uppercase text-dark/60">Your Answer:</span>
                          <input
                            type="text"
                            placeholder="Type answer here..."
                            value={studentAnswers[q.number] || ''}
                            onChange={(e) => setStudentAnswers({ ...studentAnswers, [q.number]: e.target.value })}
                            className="px-3 py-1 text-xs font-bold border-2 border-dark/30 rounded-lg outline-none focus:border-dark bg-white max-w-[200px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bonus Challenge */}
                  {generatedWorksheet.bonusChallenge && (
                    <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50 text-xs font-bold text-amber-950 space-y-1 print:break-inside-avoid">
                      <p className="font-black text-amber-900 uppercase">Bonus Challenge:</p>
                      <p>{generatedWorksheet.bonusChallenge}</p>
                    </div>
                  )}

                  {/* Teacher Answer Key (Printable on Page 2 or toggled on screen) */}
                  {generatedWorksheet.answerKey && generatedWorksheet.answerKey.length > 0 && (
                    <div className="pt-4 border-t-2 border-dashed border-dark/20">
                      <button
                        onClick={() => setShowAnswerKey(!showAnswerKey)}
                        className="text-xs font-black text-dark/70 hover:text-dark uppercase underline tracking-wider print:hidden"
                      >
                        {showAnswerKey ? 'Hide Teacher Answer Key' : 'Show Teacher Answer Key'}
                      </button>

                      <div className={`mt-3 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl space-y-1.5 ${showAnswerKey ? 'block' : 'hidden print:block print:break-before-page'}`}>
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-300">
                          <p className="text-xs font-black text-emerald-950 uppercase">
                            Teacher Marking &amp; Answer Key ({generatedWorksheet.title})
                          </p>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase">Official Edvoura Rubric</span>
                        </div>
                        <ul className="text-xs font-semibold text-emerald-900 space-y-1.5 pt-1">
                          {generatedWorksheet.answerKey.map((ans, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="font-bold shrink-0">✓</span>
                              <span>{ans}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-dark space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-yellow/30 border-2 border-dark flex items-center justify-center">
                  <FileText className="w-7 h-7 text-dark" />
                </div>
                <h4 className="font-black text-base uppercase">Design Your Lesson Worksheet</h4>
                <p className="text-xs text-dark/60 max-w-sm font-semibold">
                  Pick a subject and topic on the left, then click &ldquo;Generate Worksheet&rdquo; to build structured, printable exercises in seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
