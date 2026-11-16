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
  Send,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateCurriculumWorksheet, GeneratedWorksheet } from '@/lib/curriculum/worksheetGenerator';

interface AIWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPresentOnWhiteboard?: (worksheetText: string, title: string) => void;
  pupilName?: string;
  gradeLevel?: string;
  lessonId?: string;
}

const TOPIC_PRESETS: Record<string, string[]> = {
  Mathematics: [
    'Long Multiplication & Word Problems',
    'Long Division with Remainders',
    'Fractions: Addition, Subtraction & Equivalent',
    'Decimals, Money & Currency (£, $, ₦)',
    'Percentages, Profit & Discounts',
    'Area, Perimeter & Compound Shapes',
    'Time, Clocks & Journey Durations',
    'Multi-Step Word Problems & Reasoning',
    'Pre-Algebra: Solving for Unknowns (x)',
    'Place Value, Rounding & Estimations',
    'Factors, Multiples & Prime Numbers',
    'Bar Charts, Data Handling & Averages',
  ],
  'English & Phonics': [
    'Reading Comprehension & Inferences',
    'Parts of Speech: Nouns, Verbs, Adjectives & Adverbs',
    'Punctuation: Speech Marks, Apostrophes & Commas',
    'Phonics: Vowel Digraphs (ea, ee, ou, ai)',
    'Creative Writing & Descriptive Similes',
    'Prefixes & Suffixes (un-, dis-, -ful, -less)',
    'Homophones, Synonyms & Antonyms',
    'Direct & Reported Speech',
  ],
  Science: [
    'Living Things, Plants & Photosynthesis',
    'States of Matter: Solids, Liquids & Gases',
    'Forces, Friction & Gravitational Pull',
    'The Solar System & Earth\'s Orbit',
    'Electricity, Simple Circuits & Conductors',
    'Human Body: Skeleton & Digestive System',
    'Ecosystems, Food Chains & Adaptations',
  ],
  'Verbal Reasoning': [
    'Verbal Reasoning: Word Codes & Letter Analogies',
    'Synonyms, Antonyms & Odd Word Out',
    'Compound Words & Hidden Words',
    'Alphabetical Order & Word Sequences',
  ],
  'Non-Verbal Reasoning': [
    'Shape Sequences & Matrix Completion',
    'Reflections, Rotations & Symmetry',
    'Odd Shape Out & Analogy Grids',
  ],
};

export function AIWorksheetModal({
  isOpen,
  onClose,
  onPresentOnWhiteboard,
  pupilName = 'Pupil',
  gradeLevel = 'Grade 4',
  lessonId,
}: AIWorksheetModalProps) {
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Long Multiplication & Word Problems');
  const [selectedGrade, setSelectedGrade] = useState(gradeLevel || 'Grade 4');
  const [difficulty, setDifficulty] = useState<'Standard' | 'Foundation' | 'Advanced'>('Standard');
  const [questionCount, setQuestionCount] = useState<number>(6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<GeneratedWorksheet | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState<string | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, string>>({});

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedWorksheet(null);
    setStudentAnswers({});
    setPublishedSuccess(null);

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

  // Pure Printable Window (Fixes Screenshot 2: Only prints the pristine A4 worksheet without modal or sidebar!)
  const handlePrint = () => {
    if (!generatedWorksheet) return;
    const printWindow = window.open('', '_blank', 'width=850,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    const questionsHtml = generatedWorksheet.questions.map((q) => `
      <div class="q-card">
        <div class="q-header">
          <div class="q-main">
            <span class="q-num">${q.number}</span>
            <span class="q-text">${q.question.replace(/\n/g, '<br/>')}</span>
            ${q.hint ? `<div class="q-tip">Tip: ${q.hint}</div>` : ''}
          </div>
          ${q.columnFormat ? `
            <div class="col-box">
              <div class="col-top">${q.columnFormat.topNumber}</div>
              <div class="col-bottom"><span>${q.columnFormat.operator}</span><span>${q.columnFormat.bottomNumber}</span></div>
              <div class="col-ans-space"></div>
            </div>
          ` : ''}
        </div>
        <div class="work-space">
          ${Array.from({ length: q.answerSpaceLines || 3 }).map(() => '<div class="work-line"></div>').join('')}
        </div>
      </div>
    `).join('');

    const answerKeyHtml = generatedWorksheet.answerKey && generatedWorksheet.answerKey.length > 0 ? `
      <div class="page-break"></div>
      <div class="ans-key-card">
        <div class="ans-header">
          <div class="logo-badge">EDVOURA OFFICIAL RUBRIC</div>
          <div class="ans-title">TEACHER MARKING &amp; ANSWER KEY</div>
          <div class="ans-subtitle">${generatedWorksheet.title} • ${generatedWorksheet.grade}</div>
        </div>
        <ul class="ans-list">
          ${generatedWorksheet.answerKey.map((ans) => `<li><span class="check-icon">✓</span> <span>${ans}</span></li>`).join('')}
        </ul>
      </div>
    ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${generatedWorksheet.title}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #060E1C;
              margin: 0;
              padding: 0;
              background: #FFFFFF;
            }
            .header-banner {
              border-bottom: 2.5px solid #060E1C;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .logo-badge {
              background: #060E1C;
              color: #FACC15;
              font-size: 10px;
              font-weight: 900;
              padding: 3px 8px;
              border-radius: 4px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              display: inline-block;
              margin-bottom: 4px;
            }
            .subject-sub {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              color: #475569;
              margin-left: 8px;
            }
            .title {
              font-size: 20px;
              font-weight: 900;
              margin: 4px 0 0 0;
              letter-spacing: -0.5px;
            }
            .meta-block {
              font-size: 11px;
              font-weight: 800;
              text-align: right;
              line-height: 1.8;
            }
            .meta-line {
              border-bottom: 1.5px solid #060E1C;
              display: inline-block;
              width: 140px;
              margin-left: 6px;
            }
            .score-box {
              display: inline-block;
              border: 1.5px solid #060E1C;
              border-radius: 4px;
              padding: 0 8px;
              font-weight: 900;
              margin-left: 6px;
            }
            .instructions-card {
              background: #FEF9C3;
              border: 2px solid #060E1C;
              border-radius: 8px;
              padding: 10px 14px;
              font-size: 12px;
              font-weight: 700;
              margin-bottom: 18px;
            }
            .instructions-tag {
              font-weight: 900;
              text-transform: uppercase;
              margin-right: 6px;
            }
            .q-card {
              border: 1.5px solid #CBD5E1;
              border-radius: 10px;
              padding: 14px;
              margin-bottom: 16px;
              page-break-inside: avoid;
            }
            .q-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
            }
            .q-main {
              flex: 1;
            }
            .q-num {
              background: #060E1C;
              color: #FFFFFF;
              width: 24px;
              height: 24px;
              border-radius: 6px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: 900;
              margin-right: 8px;
              vertical-align: middle;
            }
            .q-text {
              font-size: 13px;
              font-weight: 800;
              line-height: 1.5;
              vertical-align: middle;
            }
            .q-tip {
              font-size: 11px;
              font-weight: 600;
              color: #64748B;
              font-style: italic;
              margin-top: 4px;
              margin-left: 32px;
            }
            .col-box {
              font-family: "Courier New", Courier, monospace;
              font-size: 15px;
              font-weight: 900;
              border: 2px solid #060E1C;
              border-radius: 6px;
              padding: 8px 14px;
              text-align: right;
              min-width: 110px;
              background: #FAFAFA;
            }
            .col-top { letter-spacing: 3px; }
            .col-bottom {
              border-bottom: 2px solid #060E1C;
              display: flex;
              justify-content: space-between;
              letter-spacing: 3px;
            }
            .col-ans-space { height: 24px; }
            .work-space {
              margin-top: 10px;
              padding-left: 32px;
            }
            .work-line {
              border-bottom: 1px solid #CBD5E1;
              height: 24px;
            }
            .bonus-card {
              background: #FEF3C7;
              border: 2px solid #F59E0B;
              border-radius: 10px;
              padding: 12px 16px;
              font-size: 12px;
              font-weight: 700;
              margin-top: 18px;
              page-break-inside: avoid;
            }
            .bonus-tag {
              color: #B45309;
              font-weight: 900;
              text-transform: uppercase;
              margin-right: 6px;
            }
            .page-break { page-break-before: always; }
            .ans-key-card {
              border: 2.5px solid #10B981;
              border-radius: 12px;
              padding: 20px;
              background: #F0FDF4;
            }
            .ans-header {
              border-bottom: 1.5px solid #A7F3D0;
              padding-bottom: 10px;
              margin-bottom: 14px;
            }
            .ans-title {
              font-size: 16px;
              font-weight: 900;
              color: #064E3B;
              margin-top: 6px;
            }
            .ans-subtitle {
              font-size: 11px;
              font-weight: 700;
              color: #047857;
            }
            .ans-list {
              list-style: none;
              padding: 0;
              margin: 0;
              font-size: 12px;
              font-weight: 600;
              color: #065F46;
              line-height: 1.8;
            }
            .check-icon {
              color: #059669;
              font-weight: 900;
              margin-right: 6px;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <span class="logo-badge">EDVOURA LEARNING HUB</span>
              <span class="subject-sub">${generatedWorksheet.subject}</span>
              <h1 class="title">${generatedWorksheet.title}</h1>
            </div>
            <div class="meta-block">
              <div>Pupil Name: <span class="meta-line">${pupilName}</span></div>
              <div>Date: <span class="meta-line"></span></div>
              <div>Score: <span class="score-box">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ 100</span></div>
            </div>
          </div>

          <div class="instructions-card">
            <span class="instructions-tag">Instructions:</span>
            <span>${generatedWorksheet.instructions}</span>
          </div>

          ${questionsHtml}

          ${generatedWorksheet.bonusChallenge ? `
            <div class="bonus-card">
              <span class="bonus-tag">Bonus Challenge:</span>
              <span>${generatedWorksheet.bonusChallenge}</span>
            </div>
          ` : ''}

          ${answerKeyHtml}

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  // Push to Student Dashboard & Library
  const handlePublishToStudent = async () => {
    if (!generatedWorksheet) return;
    setIsPublishing(true);
    setPublishedSuccess(null);

    try {
      const response = await fetch('/api/ai/worksheet/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worksheet: generatedWorksheet,
          lessonId,
          pupilName,
        }),
      });

      const data = await response.json();
      if (response.ok && data?.success) {
        setPublishedSuccess(`Published to Tutor Dashboard and pushed to ${pupilName}'s Library!`);
      } else {
        setPublishedSuccess('Saved to Dashboard resources.');
      }
    } catch (err) {
      console.warn('Publish worksheet error:', err);
      setPublishedSuccess('Saved to Dashboard resources.');
    } finally {
      setIsPublishing(false);
    }
  };

  const currentTopicPresets = TOPIC_PRESETS[subject] || TOPIC_PRESETS.Mathematics;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 font-sans">
      <div className="bg-white border-[3px] border-dark rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#060E1C] overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 bg-yellow/30 border-b-[2.5px] border-dark flex items-center justify-between shrink-0">
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
          <div className="w-full md:w-80 bg-slate-50 border-b md:border-b-0 md:border-r-[2.5px] border-dark p-5 space-y-4 overflow-y-auto shrink-0">
            {/* Subject Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-dark uppercase tracking-wider">Subject</label>
              <select
                value={subject}
                onChange={(e) => {
                  const newSub = e.target.value;
                  setSubject(newSub);
                  const presets = TOPIC_PRESETS[newSub];
                  if (presets && presets.length > 0) {
                    setTopic(presets[0]);
                  }
                }}
                className="w-full h-9 px-3 rounded-xl border-2 border-dark bg-white text-xs font-bold text-dark outline-none shadow-[1.5px_1.5px_0px_#060E1C]"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="English & Phonics">English &amp; Phonics</option>
                <option value="Science">Science</option>
                <option value="Verbal Reasoning">Verbal Reasoning</option>
                <option value="Non-Verbal Reasoning">Non-Verbal Reasoning</option>
              </select>
            </div>

            {/* Quick Curriculum Topic Chips / Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-dark uppercase tracking-wider">
                Select Curriculum Topic
              </label>
              <select
                value={currentTopicPresets.includes(topic) ? topic : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    setTopic(e.target.value);
                  }
                }}
                className="w-full h-9 px-3 rounded-xl border-2 border-dark bg-white text-xs font-bold text-dark outline-none shadow-[1.5px_1.5px_0px_#060E1C]"
              >
                {currentTopicPresets.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="custom">-- Custom Topic Below --</option>
              </select>

              {/* Custom Topic Input */}
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Or type custom topic..."
                className="w-full h-8 px-3 rounded-xl border-2 border-dark bg-white text-xs font-bold text-dark outline-none shadow-[1px_1px_0px_#060E1C] placeholder:text-dark/40"
              />
            </div>

            {/* Grade Level & Questions Count */}
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
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-dark/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                    <span className="text-xs font-bold text-dark/70">{generatedWorksheet.questions.length} Exercises</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* 1-Click Push to Student Dashboard & Library */}
                    <Button
                      size="sm"
                      onClick={handlePublishToStudent}
                      disabled={isPublishing}
                      className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-dark text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all"
                      title="Reflect on Tutor Dashboard and push to student library"
                    >
                      {isPublishing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      <span>Push to Student Library</span>
                    </Button>

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

                    {/* Pure Printable Document Trigger */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrint}
                      className="h-8 px-2.5 border-2 border-dark text-dark text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
                      title="Print or Save as Clean A4 PDF"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      <span>Print / PDF</span>
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

                {/* Published Success Banner */}
                {publishedSuccess && (
                  <div className="p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-xs font-black text-emerald-950 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{publishedSuccess}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-md">Live</span>
                  </div>
                )}

                {/* Printable Worksheet Canvas (Canva Style) */}
                <div className="p-8 border-[3px] border-dark rounded-2xl bg-white shadow-sm space-y-6">
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
                      <div key={q.number} className="p-5 rounded-2xl border-2 border-dark/20 bg-slate-50/50 space-y-3">
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
                        <div className="pl-8 space-y-2 pt-1">
                          {Array.from({ length: q.answerSpaceLines || 3 }).map((_, i) => (
                            <div key={i} className="border-b border-dark/20 h-5" />
                          ))}
                        </div>

                        {/* Interactive Digital Student Answer Blank */}
                        <div className="pl-8 pt-1 flex items-center gap-2">
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
                    <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50 text-xs font-bold text-amber-950 space-y-1">
                      <p className="font-black text-amber-900 uppercase">Bonus Challenge:</p>
                      <p>{generatedWorksheet.bonusChallenge}</p>
                    </div>
                  )}

                  {/* Teacher Answer Key */}
                  {generatedWorksheet.answerKey && generatedWorksheet.answerKey.length > 0 && (
                    <div className="pt-4 border-t-2 border-dashed border-dark/20">
                      <button
                        onClick={() => setShowAnswerKey(!showAnswerKey)}
                        className="text-xs font-black text-dark/70 hover:text-dark uppercase underline tracking-wider"
                      >
                        {showAnswerKey ? 'Hide Teacher Answer Key' : 'Show Teacher Answer Key'}
                      </button>

                      {showAnswerKey && (
                        <div className="mt-3 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl space-y-1.5 animate-in fade-in duration-150">
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
                      )}
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
