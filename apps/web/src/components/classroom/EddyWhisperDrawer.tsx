'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Zap,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EddyWhisperDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  gradeLevel: string;
  studentName: string;
  onPushToWhiteboard?: (text: string) => void;
  onLaunchAsPoll?: (question: string, options: string[], correctIdx: number) => void;
}

interface WhisperCard {
  id: string;
  category: 'question' | 'worked-step' | 'analogy' | 'check';
  title: string;
  content: string;
  tag: string;
  suggestedPoll?: {
    question: string;
    options: string[];
    correctIdx: number;
  };
}

export function EddyWhisperDrawer({
  isOpen,
  onClose,
  lessonTitle,
  gradeLevel,
  studentName,
  onPushToWhiteboard,
  onLaunchAsPoll,
}: EddyWhisperDrawerProps) {
  const [topicInput, setTopicInput] = useState(lessonTitle || 'Mathematics & Science');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pushedId, setPushedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Dynamic curated whisper database tailored for active K-12 lessons
  const [whisperCards, setWhisperCards] = useState<WhisperCard[]>([
    {
      id: 'q1',
      category: 'question',
      title: 'Deep Socratic Question',
      content: `Ask ${studentName || 'student'}: "If the cost price of a notebook is $5 and you sell it for $8, what is your profit? What if you gave a $1 discount?"`,
      tag: 'Critical Thinking',
      suggestedPoll: {
        question: 'Cost price is $5, Selling price is $8. What is the profit?',
        options: ['$2', '$3', '$13', '$40'],
        correctIdx: 1,
      },
    },
    {
      id: 'w1',
      category: 'worked-step',
      title: 'Chalkboard Formula Breakdown',
      content: 'Profit = Selling Price - Cost Price\nPercentage Profit = (Profit ÷ Cost Price) × 100%\nAlways emphasize that profit is measured relative to COST, not selling price.',
      tag: 'Formula Step',
    },
    {
      id: 'a1',
      category: 'analogy',
      title: 'Sticky Memory Hook',
      content: 'Think of Cost Price as the "Seed" you plant, and Selling Price as the "Harvest". The extra fruit you take home is the Profit!',
      tag: 'Mental Analogy',
    },
    {
      id: 'c1',
      category: 'check',
      title: 'Formative Understanding Check',
      content: `Before moving to word problems, pause and ask ${studentName || 'the student'} to summarize the difference between Cost Price and Selling Price in their own words.`,
      tag: 'Pacing Check',
      suggestedPoll: {
        question: 'Which price represents what the shopkeeper originally paid for an item?',
        options: ['Selling Price', 'Cost Price', 'Discount Price', 'Tax'],
        correctIdx: 1,
      },
    },
  ]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePush = (text: string, id: string) => {
    if (onPushToWhiteboard) {
      onPushToWhiteboard(text);
      setPushedId(id);
      setTimeout(() => setPushedId(null), 2500);
    }
  };

  const handleGenerateFresh = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/explain-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput,
          gradeLevel: gradeLevel || 'Primary / Junior Secondary',
          context: `Live 1-on-1 coaching whisper notes for pupil ${studentName || 'Pupil'}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.explanation || data.content || '';
        if (text) {
          setWhisperCards([
            {
              id: `ai-q-${Date.now()}`,
              category: 'question',
              title: 'AI Targeted Question',
              content: `Ask ${studentName || 'pupil'}: "${text.slice(0, 160)}..."`,
              tag: 'Socratic Prompt',
              suggestedPoll: {
                question: `Quick Check: Based on ${topicInput}, which statement is true?`,
                options: ['Option A (Fundamental Rule)', 'Option B (Common Misconception)', 'Option C (Edge Case)', 'Option D (None)'],
                correctIdx: 0,
              },
            },
            {
              id: `ai-w-${Date.now()}`,
              category: 'worked-step',
              title: 'Step-by-Step Guidance',
              content: text.slice(160, 420) || 'Step 1: Identify given variables.\nStep 2: State formula.\nStep 3: Substitute and solve.',
              tag: 'Methodology',
            },
            {
              id: `ai-a-${Date.now()}`,
              category: 'analogy',
              title: 'Visual Analogy',
              content: text.slice(420, 650) || 'Connect this concept to daily life: sports scorekeeping, cooking recipe measurements, or shopping change.',
              tag: 'Real-World Hook',
            },
          ]);
        }
      }
    } catch (_) {
      // Fallback: Generate smart curriculum card locally
      setWhisperCards((prev) => [
        {
          id: `local-${Date.now()}`,
          category: 'question',
          title: `Fresh Prompt for ${topicInput}`,
          content: `Ask ${studentName || 'the student'}: "Can you give me an example from your own everyday life where ${topicInput} is used?"`,
          tag: 'Real-World Check',
        },
        ...prev,
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-14 bottom-0 w-[360px] sm:w-[410px] bg-[#0c162b] border-l-[3px] border-dark shadow-[-10px_0px_30px_rgba(0,0,0,0.8)] z-40 flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-14 px-4 bg-yellow border-b-[2.5px] border-dark flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-dark text-yellow flex items-center justify-center font-black shadow-[2px_2px_0px_#060E1C]">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase text-dark tracking-tight flex items-center gap-1.5">
              <span>Eddy AI Co-Teacher</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-dark text-yellow font-black uppercase">
                Whisper
              </span>
            </h3>
            <p className="text-[10px] font-bold text-dark/75">
              Discreet pedagogical prompts &amp; solutions for Tutor
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl border-[2px] border-dark bg-white hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center font-black text-dark shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Topic Switcher Bar */}
      <div className="p-3 bg-[#070D18] border-b border-white/10 space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Enter topic or question..."
            className="flex-1 h-9 px-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-none focus:border-yellow"
          />
          <Button
            size="sm"
            onClick={handleGenerateFresh}
            disabled={isGenerating}
            className="h-9 px-3 bg-yellow hover:bg-yellow/90 text-dark font-black text-xs uppercase border border-dark shadow-[2px_2px_0px_#060E1C] active:scale-95 shrink-0"
          >
            {isGenerating ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
            <span>Ask Eddy</span>
          </Button>
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-white/50 px-1">
          <span>Student: <strong className="text-white">{studentName || 'Pupil'}</strong></span>
          <span>Grade: <strong className="text-yellow">{gradeLevel}</strong></span>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3">
        {whisperCards.map((card) => (
          <div
            key={card.id}
            className="p-3.5 rounded-2xl bg-[#0f1d38] border-[2px] border-white/15 hover:border-yellow/50 transition-all shadow-md space-y-2.5 text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow/15 text-yellow border border-yellow/30 flex items-center gap-1">
                {card.category === 'question' && <HelpCircle className="w-3 h-3" />}
                {card.category === 'worked-step' && <BookOpen className="w-3 h-3" />}
                {card.category === 'analogy' && <Lightbulb className="w-3 h-3" />}
                {card.category === 'check' && <CheckCircle2 className="w-3 h-3" />}
                <span>{card.tag}</span>
              </span>
              <span className="text-[10px] font-bold text-white/40 uppercase">Private to Tutor</span>
            </div>

            <h4 className="text-xs font-black text-white leading-tight uppercase tracking-wide">
              {card.title}
            </h4>

            <p className="text-xs font-medium text-slate-200 leading-relaxed whitespace-pre-line bg-black/30 p-2.5 rounded-xl border border-white/5">
              {card.content}
            </p>

            {/* Quick Actions for Tutor */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => handleCopy(card.content, card.id)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                title="Copy note text"
              >
                {copiedId === card.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === card.id ? 'Copied' : 'Copy'}</span>
              </button>

              {onPushToWhiteboard && (
                <button
                  onClick={() => handlePush(card.content, card.id)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-yellow/15 hover:bg-yellow/25 text-yellow border border-yellow/30 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  title="Push this prompt or formula onto the active Whiteboard"
                >
                  {pushedId === card.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Send className="w-3 h-3" />}
                  <span>{pushedId === card.id ? 'Pushed' : 'To Board'}</span>
                </button>
              )}

              {card.suggestedPoll && onLaunchAsPoll && (
                <button
                  onClick={() =>
                    onLaunchAsPoll(
                      card.suggestedPoll!.question,
                      card.suggestedPoll!.options,
                      card.suggestedPoll!.correctIdx
                    )
                  }
                  className="flex-1 py-1.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-sm"
                  title="Launch instant 15-second check-for-understanding pop quiz for student"
                >
                  <Zap className="w-3 h-3" />
                  <span>Launch Poll</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#070D18] border-t border-white/10 text-center shrink-0">
        <p className="text-[10px] font-semibold text-white/50">
          Eddy whispers are completely silent and invisible to the student.
        </p>
      </div>
    </aside>
  );
}
