'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Globe,
  Filter,
  BookOpen,
  Check,
  Edit,
} from 'lucide-react';

interface QuestionReviewItem {
  id: string;
  question_id: string;
  is_possible_duplicate: boolean;
  duplicate_similarity?: number;
  question: {
    id: string;
    subject: string;
    grade_band: string;
    curriculum_region: string;
    topic: string;
    question_text: string;
    question_type: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    difficulty: string;
    status: string;
  };
}

export default function EducatorQuestionBankReviewPage() {
  const [reviewItems, setReviewItems] = useState<QuestionReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending_review');
  const [actionFeedback, setActionFeedback] = useState<string>('');

  // Generation Job Modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genSubject, setGenSubject] = useState('Basic Science & Technology');
  const [genGrade, setGenGrade] = useState('7-9');
  const [genRegion, setGenRegion] = useState('NG');
  const [genTopic, setGenTopic] = useState('Living Things & Ecosystems');
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<QuestionReviewItem | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('');
  const [editExplanation, setEditExplanation] = useState('');

  const fetchReviewItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/question-bank/review-list?region=${selectedRegion}&subject=${selectedSubject}&status=${selectedStatus}`);
      const data = await res.json();
      if (data.items) {
        setReviewItems(data.items);
      }
    } catch (e) {
      console.error('Failed to fetch review items:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewItems();
  }, [selectedRegion, selectedSubject, selectedStatus]);

  const handleApprove = async (questionId: string) => {
    try {
      const res = await fetch('/api/admin/question-bank/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', questionId }),
      });
      if (res.ok) {
        setActionFeedback('Question approved and live for students!');
        setReviewItems((prev) => prev.filter((item) => item.question_id !== questionId));
      }
    } catch (e) {
      setActionFeedback('Failed to approve question.');
    }
  };

  const handleReject = async (questionId: string) => {
    try {
      const res = await fetch('/api/admin/question-bank/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', questionId }),
      });
      if (res.ok) {
        setActionFeedback('Question rejected.');
        setReviewItems((prev) => prev.filter((item) => item.question_id !== questionId));
      }
    } catch (e) {
      setActionFeedback('Failed to reject question.');
    }
  };

  const handleEditAndApprove = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch('/api/admin/question-bank/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_approve',
          questionId: editingItem.question_id,
          questionText: editQuestionText,
          options: editOptions,
          correctAnswer: editCorrectAnswer,
          explanation: editExplanation,
        }),
      });
      if (res.ok) {
        setActionFeedback('Question updated & approved!');
        setReviewItems((prev) => prev.filter((item) => item.question_id !== editingItem.question_id));
        setEditingItem(null);
      }
    } catch (e) {
      setActionFeedback('Failed to edit and approve question.');
    }
  };

  const handleRunGenerationJob = async () => {
    setIsGenerating(true);
    setActionFeedback('Edvoura AI is generating questions with Gemini Flash...');
    try {
      const res = await fetch('/api/ai/question-bank/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: genSubject,
          grade_band: genGrade,
          curriculum_region: genRegion,
          topic: genTopic,
          requested_count: genCount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionFeedback(`Success! Generated ${data.generatedCount} questions (${data.duplicateCount} deduped).`);
        setShowGenModal(false);
        fetchReviewItems();
      } else {
        setActionFeedback(`Error: ${data.error || 'Failed to generate questions.'}`);
      }
    } catch (e) {
      setActionFeedback('Failed to execute generation job.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-[1320px] mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header & Controls */}
      <div className="rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow border-[2px] border-dark rounded-lg text-[10px] font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C] mb-2">
            ⚙️ Educator Moderation Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
            AI Question Bank Review Queue
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-dark/70 mt-1">
            Review, edit, approve, or reject AI-generated questions across regional curricula.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGenModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-yellow border-[3px] border-dark rounded-2xl text-xs font-black uppercase tracking-wider text-dark shadow-[4px_4px_0px_#060E1C] hover:bg-yellow-400 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="h-5 w-5 text-dark" />
          <span>⚡ Launch Gemini Generator</span>
        </button>
      </div>

      {actionFeedback ? (
        <div className="p-4 rounded-xl border-[3px] border-dark bg-emerald-100 text-dark font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button type="button" onClick={() => setActionFeedback('')} className="text-dark/60 font-bold hover:text-dark">✕</button>
        </div>
      ) : null}

      {/* Filters Bar */}
      <div className="rounded-2xl border-[3px] border-dark bg-slate-50 p-4 shadow-[4px_4px_0px_#060E1C] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-dark/60">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-[2px] border-dark bg-white text-xs font-bold text-dark outline-none cursor-pointer"
          >
            <option value="ALL">🌍 All Regions</option>
            <option value="NG">🇳🇬 Nigeria (NG)</option>
            <option value="US">🇺🇸 United States (US)</option>
            <option value="UK">🇬🇧 United Kingdom (UK)</option>
            <option value="IN">🇮🇳 India (IN)</option>
            <option value="EG">🇪🇬 Egypt (EG)</option>
            <option value="GLOBAL">🌐 Universal (GLOBAL)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-[2px] border-dark bg-white text-xs font-bold text-dark outline-none cursor-pointer"
          >
            <option value="pending_review">⏳ Pending Review</option>
            <option value="approved">✅ Approved Live</option>
            <option value="rejected">❌ Rejected</option>
          </select>
        </div>

        <button
          type="button"
          onClick={fetchReviewItems}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-[2px] border-dark rounded-xl text-xs font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C] hover:bg-gray-100 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-dark" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Review Queue Items */}
      {loading ? (
        <div className="py-12 text-center text-sm font-black text-dark/60">Loading queue items...</div>
      ) : reviewItems.length > 0 ? (
        <div className="space-y-4">
          {reviewItems.map((item) => {
            const q = item.question;
            if (!q) return null;

            return (
              <div
                key={item.id}
                className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[5px_5px_0px_#060E1C] space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dark/10 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md border border-dark bg-yellow text-[10px] font-black uppercase text-dark">
                      {q.curriculum_region}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md border border-dark bg-cyan-100 text-[10px] font-black uppercase text-dark">
                      {q.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md border border-dark bg-purple-100 text-[10px] font-black uppercase text-dark">
                      Band: {q.grade_band}
                    </span>
                    <span className="text-xs font-bold text-dark/60">Topic: {q.topic}</span>
                  </div>

                  {item.is_possible_duplicate ? (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border-[2px] border-amber-600 bg-amber-100 text-amber-900 text-[11px] font-black uppercase">
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                      <span>Possible Duplicate ({((item.duplicate_similarity || 0) * 100).toFixed(1)}% match)</span>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-dark">{q.question_text}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, idx) => {
                      const isCorrect = opt.trim() === q.correct_answer.trim();
                      return (
                        <div
                          key={`opt-${idx}`}
                          className={`p-3 rounded-xl border-[2px] border-dark text-xs font-bold flex items-center justify-between ${
                            isCorrect ? 'bg-emerald-100 border-emerald-800 text-emerald-950 font-black' : 'bg-slate-50 text-dark/80'
                          }`}
                        >
                          <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                          {isCorrect ? <Check className="h-4 w-4 text-emerald-700 shrink-0" /> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-dark/20 bg-slate-50 p-3 text-xs font-semibold text-dark/80">
                  <span className="font-black text-dark">Explanation:</span> {q.explanation}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(q.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-400 border-[2px] border-dark rounded-xl text-xs font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C] hover:bg-emerald-300 active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve &amp; Publish Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item);
                      setEditQuestionText(q.question_text);
                      setEditOptions([...q.options]);
                      setEditCorrectAnswer(q.correct_answer);
                      setEditExplanation(q.explanation);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow border-[2px] border-dark rounded-xl text-xs font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C] hover:bg-yellow-400 active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit &amp; Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReject(q.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-200 border-[2px] border-dark rounded-xl text-xs font-black uppercase text-rose-900 shadow-[2px_2px_0px_#060E1C] hover:bg-rose-300 active:scale-95 transition-all cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center border-[3px] border-dashed border-dark/20 rounded-2xl bg-white p-8 space-y-3">
          <div className="text-3xl">🎉</div>
          <h3 className="text-base font-black text-dark">No Pending Questions in Queue</h3>
          <p className="text-xs font-bold text-dark/60 max-w-md mx-auto">
            All AI-generated questions for the selected region and subject have been reviewed. Launch the generator above to create new items!
          </p>
        </div>
      )}

      {/* Generation Job Modal */}
      {showGenModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C] space-y-4">
            <h3 className="text-xl font-black text-dark">⚡ Launch Gemini Question Generator</h3>
            <p className="text-xs font-bold text-dark/70">
              Generate curriculum-aligned quiz questions using Gemini 2.5 Flash.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-dark/60">Region:</label>
                <select
                  value={genRegion}
                  onChange={(e) => setGenRegion(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border-[2px] border-dark text-xs font-bold bg-white"
                >
                  <option value="NG">🇳🇬 Nigeria (NG)</option>
                  <option value="US">🇺🇸 United States (US)</option>
                  <option value="UK">🇬🇧 United Kingdom (UK)</option>
                  <option value="IN">🇮🇳 India (IN)</option>
                  <option value="EG">🇪🇬 Egypt (EG)</option>
                  <option value="GLOBAL">🌐 Universal (GLOBAL)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dark/60">Subject:</label>
                <input
                  type="text"
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border-[2px] border-dark text-xs font-bold bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dark/60">Grade Band:</label>
                <select
                  value={genGrade}
                  onChange={(e) => setGenGrade(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border-[2px] border-dark text-xs font-bold bg-white"
                >
                  <option value="1-3">Primary 1-3 (Grade 1-3)</option>
                  <option value="4-6">Primary 4-6 (Grade 4-6)</option>
                  <option value="7-9">JSS1-3 / Grade 7-9 / Year 7-9</option>
                  <option value="10-12">SS1-3 / Grade 10-12 / Year 10-12</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dark/60">Topic:</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border-[2px] border-dark text-xs font-bold bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dark/60">Question Count:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={genCount}
                  onChange={(e) => setGenCount(parseInt(e.target.value, 10))}
                  className="w-full mt-1 p-2.5 rounded-xl border-[2px] border-dark text-xs font-bold bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                className="flex-1 py-2.5 border-[2px] border-dark rounded-xl text-xs font-black uppercase bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleRunGenerationJob}
                className="flex-1 py-2.5 border-[2px] border-dark rounded-xl text-xs font-black uppercase bg-yellow hover:bg-yellow-400 shadow-[2px_2px_0px_#060E1C]"
              >
                {isGenerating ? 'Generating...' : 'Run Job'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Item Modal */}
      {editingItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C] space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-dark">✏️ Edit &amp; Approve Question</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-dark/60">Question Text:</label>
                <textarea
                  value={editQuestionText}
                  onChange={(e) => setEditQuestionText(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border-[2px] border-dark text-xs font-bold bg-white h-20"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dark/60">Options:</label>
                {editOptions.map((opt, idx) => (
                  <input
                    key={`edit-opt-${idx}`}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const copy = [...editOptions];
                      copy[idx] = e.target.value;
                      setEditOptions(copy);
                    }}
                    className="w-full mt-1 p-2 rounded-xl border-[2px] border-dark text-xs font-semibold bg-white"
                  />
                ))}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dark/60">Correct Answer:</label>
                <input
                  type="text"
                  value={editCorrectAnswer}
                  onChange={(e) => setEditCorrectAnswer(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border-[2px] border-dark text-xs font-bold bg-emerald-50 text-emerald-950"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-dark/60">Explanation:</label>
                <textarea
                  value={editExplanation}
                  onChange={(e) => setEditExplanation(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border-[2px] border-dark text-xs font-semibold bg-white h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 py-2.5 border-[2px] border-dark rounded-xl text-xs font-black uppercase bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditAndApprove}
                className="flex-1 py-2.5 border-[2px] border-dark rounded-xl text-xs font-black uppercase bg-emerald-400 hover:bg-emerald-300 shadow-[2px_2px_0px_#060E1C]"
              >
                Save &amp; Approve
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
