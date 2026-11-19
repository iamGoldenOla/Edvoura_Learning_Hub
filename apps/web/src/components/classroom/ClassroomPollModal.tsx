'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Award,
  Sparkles,
  X,
  Play,
  RotateCcw,
  Star,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ClassroomPollModalProps {
  channel: any;
  role: 'tutor' | 'student';
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  initialOptions?: string[];
  initialCorrectIdx?: number;
}

interface ActivePoll {
  pollId: string;
  type: 'multiple-choice' | 'confidence' | 'true-false';
  question: string;
  options: string[];
  correctIdx: number;
  timeLimit: number; // in seconds, 0 = untimed
}

interface PollResponse {
  pollId: string;
  studentName: string;
  selectedIdx: number;
  responseTimeSec: number;
}

export function ClassroomPollModal({
  channel,
  role,
  userName,
  isOpen,
  onClose,
  initialQuestion,
  initialOptions,
  initialCorrectIdx = 0,
}: ClassroomPollModalProps) {
  // Tutor Creation State
  const [pollType, setPollType] = useState<'multiple-choice' | 'confidence' | 'true-false'>('multiple-choice');
  const [question, setQuestion] = useState(initialQuestion || 'What is the correct answer to this problem?');
  const [options, setOptions] = useState<string[]>(
    initialOptions && initialOptions.length >= 2
      ? initialOptions
      : ['Option A (Value 1)', 'Option B (Value 2)', 'Option C (Value 3)', 'Option D (Value 4)']
  );
  const [correctIdx, setCorrectIdx] = useState<number>(initialCorrectIdx);
  const [timeLimit, setTimeLimit] = useState<number>(20);

  // Active Poll State (Synced across both parties)
  const [activePoll, setActivePoll] = useState<ActivePoll | null>(null);
  const [studentResponse, setStudentResponse] = useState<PollResponse | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [awardedXp, setAwardedXp] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Update initial fields if passed down from Eddy AI Whisper Drawer
  useEffect(() => {
    if (initialQuestion) setQuestion(initialQuestion);
    if (initialOptions && initialOptions.length >= 2) setOptions(initialOptions);
    if (typeof initialCorrectIdx === 'number') setCorrectIdx(initialCorrectIdx);
  }, [initialQuestion, initialOptions, initialCorrectIdx]);

  // Supabase Realtime Channel Broadcast Listeners
  useEffect(() => {
    if (!channel) return;

    const handlePollLaunch = ({ payload }: { payload: ActivePoll }) => {
      if (!payload) return;
      setActivePoll(payload);
      setHasAnswered(false);
      setSelectedAnswerIdx(null);
      setStudentResponse(null);
      setAwardedXp(false);
      setTimeLeft(payload.timeLimit || 20);
      startTimeRef.current = Date.now();

      // Start countdown timer if timed
      if (payload.timeLimit > 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    const handlePollResponse = ({ payload }: { payload: PollResponse }) => {
      if (!payload) return;
      setStudentResponse(payload);
    };

    const handlePollAward = ({ payload }: { payload: { xp: number } }) => {
      if (role === 'student') {
        setAwardedXp(true);
      }
    };

    channel.on('broadcast', { event: 'classroom-poll-launch' }, handlePollLaunch);
    channel.on('broadcast', { event: 'classroom-poll-response' }, handlePollResponse);
    channel.on('broadcast', { event: 'classroom-poll-award' }, handlePollAward);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [channel, role]);

  // Tutor launches poll to student
  const handleLaunchPoll = () => {
    let resolvedOptions = options;
    let resolvedCorrect = correctIdx;

    if (pollType === 'confidence') {
      resolvedOptions = [
        '🟢 100% Crystal Clear! (I get it)',
        '🟡 70% Mostly Got It (Let me practice)',
        '🔴 Please Repeat (Need another example)',
      ];
      resolvedCorrect = 0;
    } else if (pollType === 'true-false') {
      resolvedOptions = ['✅ True', '❌ False'];
      resolvedCorrect = Math.min(1, correctIdx);
    }

    const newPoll: ActivePoll = {
      pollId: `poll-${Date.now()}`,
      type: pollType,
      question: question.trim(),
      options: resolvedOptions,
      correctIdx: resolvedCorrect,
      timeLimit,
    };

    setActivePoll(newPoll);
    setStudentResponse(null);
    setAwardedXp(false);

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'classroom-poll-launch',
        payload: newPoll,
      });
    }
  };

  // Student submits answer
  const handleStudentSelectAnswer = (idx: number) => {
    if (hasAnswered || !activePoll) return;
    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setHasAnswered(true);
    setSelectedAnswerIdx(idx);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const resp: PollResponse = {
      pollId: activePoll.pollId,
      studentName: userName,
      selectedIdx: idx,
      responseTimeSec: elapsed,
    };

    setStudentResponse(resp);

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'classroom-poll-response',
        payload: resp,
      });
    }
  };

  // Tutor awards star & XP to student
  const handleAwardXp = () => {
    setAwardedXp(true);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'classroom-poll-award',
        payload: { xp: 100 },
      });
    }
  };

  // If closed or no active poll on student side, don't display
  if (!isOpen && !activePoll) return null;

  // ============================================================
  // STUDENT VIEW: GAMIFIED ANSWER CARD
  // ============================================================
  if (role === 'student' && activePoll) {
    const isCorrect = selectedAnswerIdx === activePoll.correctIdx;
    const isConfidence = activePoll.type === 'confidence';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in zoom-in-95">
        <div className="w-full max-w-lg bg-[#0F172A] border-[3.5px] border-yellow rounded-3xl p-6 sm:p-8 text-white shadow-[8px_8px_0px_#060E1C] space-y-6 text-center select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-yellow text-dark font-black">
                <Zap className="w-5 h-5" />
              </span>
              <div className="text-left">
                <h3 className="text-sm font-black uppercase text-yellow tracking-wide">
                  Live Classroom Pop Check
                </h3>
                <p className="text-[11px] font-bold text-white/60">Tap your answer below</p>
              </div>
            </div>

            {activePoll.timeLimit > 0 && !hasAnswered && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs animate-pulse">
                <Timer className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Question Banner */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/15 text-left">
            <p className="text-sm sm:text-base font-black text-white leading-relaxed">
              {activePoll.question}
            </p>
          </div>

          {/* Answer Option Buttons */}
          <div className="grid grid-cols-1 gap-2.5">
            {activePoll.options.map((opt, i) => {
              const isSelected = selectedAnswerIdx === i;
              const isOptionCorrect = activePoll.correctIdx === i;

              let btnStyle = 'bg-white/10 hover:bg-white/20 border-white/20 text-white';
              if (hasAnswered) {
                if (isSelected) {
                  btnStyle = isCorrect || isConfidence
                    ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-300'
                    : 'bg-rose-600 border-rose-400 text-white ring-2 ring-rose-300';
                } else if (isOptionCorrect && !isConfidence) {
                  btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200';
                } else {
                  btnStyle = 'opacity-40 bg-white/5 border-white/10 text-white/50';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleStudentSelectAnswer(i)}
                  disabled={hasAnswered}
                  className={`w-full p-3.5 rounded-2xl border-[2.5px] font-black text-xs sm:text-sm text-left flex items-center justify-between gap-3 transition-all active:scale-95 cursor-pointer shadow-md ${btnStyle}`}
                >
                  <span className="truncate">{opt}</span>
                  {hasAnswered && isSelected && (
                    <span className="shrink-0">
                      {isCorrect || isConfidence ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-300" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Award Bar */}
          {hasAnswered && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/50 space-y-2 animate-in zoom-in-95">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm uppercase">
                <Sparkles className="w-4 h-4" />
                <span>
                  {isConfidence
                    ? 'Feedback Submitted to Tutor!'
                    : isCorrect
                      ? '⭐ Brilliant! Correct Answer!'
                      : 'Good Effort! Tutor will review this step!'}
                </span>
              </div>
              {awardedXp && (
                <div className="flex items-center justify-center gap-1.5 text-yellow font-black text-xs">
                  <Trophy className="w-4 h-4 text-yellow" />
                  <span>+100 XP Star Awarded by Tutor!</span>
                </div>
              )}
              <Button
                size="sm"
                onClick={() => setActivePoll(null)}
                className="w-full bg-yellow hover:bg-yellow/90 text-dark font-black text-xs uppercase border border-dark mt-2"
              >
                Return to Classroom
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // TUTOR VIEW: LAUNCHER & TELEMETRY
  // ============================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in zoom-in-95 font-sans">
      <div className="w-full max-w-lg bg-white border-[3px] border-dark rounded-3xl shadow-[8px_8px_0px_#060E1C] p-6 space-y-5 text-dark select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-[2.5px] border-dark">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-yellow border border-dark text-dark font-black">
              <Zap className="w-5 h-5" />
            </span>
            <div className="text-left">
              <h3 className="font-black text-sm uppercase text-dark">Classroom Polling &amp; Quiz Blitz</h3>
              <p className="text-[11px] font-bold text-dark/60">Launch instant 15s check for understanding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border-[2px] border-dark bg-white hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center font-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Live Telemetry If Poll is Currently Active */}
        {activePoll && (
          <div className="p-4 rounded-2xl bg-amber-50 border-[2.5px] border-dark space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-dark flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Live Student Telemetry
              </span>
              <button
                onClick={() => setActivePoll(null)}
                className="text-[10px] font-black uppercase text-rose-600 underline cursor-pointer"
              >
                Reset / New Poll
              </button>
            </div>

            <p className="text-xs font-black text-dark/80 bg-white p-2.5 rounded-xl border border-dark/20">
              Q: {activePoll.question}
            </p>

            {studentResponse ? (
              <div className="p-3 bg-white rounded-xl border-[2px] border-dark space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-dark">
                    Student Answer: {activePoll.options[studentResponse.selectedIdx]}
                  </span>
                  <span className="text-[10px] font-bold text-dark/60">
                    ⏱️ in {studentResponse.responseTimeSec}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-black uppercase ${
                      studentResponse.selectedIdx === activePoll.correctIdx
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                        : 'bg-rose-100 text-rose-800 border border-rose-400'
                    }`}
                  >
                    {studentResponse.selectedIdx === activePoll.correctIdx ? '✅ Correct' : '❌ Needs Review'}
                  </span>

                  {!awardedXp && (
                    <Button
                      size="sm"
                      onClick={handleAwardXp}
                      className="h-7 px-3 bg-yellow hover:bg-yellow/90 text-dark font-black text-[10px] uppercase border border-dark shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
                    >
                      <Star className="w-3.5 h-3.5 mr-1" />
                      <span>Award 100 XP &amp; Star</span>
                    </Button>
                  )}
                  {awardedXp && (
                    <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                      <Award className="w-4 h-4" /> 100 XP Star Sent!
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white/70 rounded-xl border border-dark/20 text-center">
                <p className="text-xs font-bold text-dark/60 animate-pulse">
                  Waiting for student to tap their answer on screen...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Poll Type Switcher */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'multiple-choice', label: '4-Choice Quiz' },
            { id: 'confidence', label: 'Confidence Meter' },
            { id: 'true-false', label: 'True / False' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setPollType(t.id as any)}
              className={`py-2 px-2.5 rounded-xl border-[2px] border-dark text-xs font-black uppercase transition-all shadow-[1.5px_1.5px_0px_#060E1C] cursor-pointer ${
                pollType === t.id ? 'bg-yellow text-dark' : 'bg-slate-50 text-dark/70 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Question Input */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-black uppercase text-dark">Question / Check Statement</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Which of these numbers is a prime factor of 24?"
            className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border-[2px] border-dark text-xs font-bold focus:outline-none focus:bg-white"
          />
        </div>

        {/* Multiple Choice Options (if active) */}
        {pollType === 'multiple-choice' && (
          <div className="space-y-2 text-left">
            <label className="text-xs font-black uppercase text-dark">Options (Select radio for correct answer)</label>
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded-xl border-[1.5px] border-dark bg-slate-50">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctIdx === i}
                    onChange={() => setCorrectIdx(i)}
                    className="w-4 h-4 text-emerald-600 focus:ring-dark cursor-pointer ml-1"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...options];
                      next[i] = e.target.value;
                      setOptions(next);
                    }}
                    className="w-full bg-transparent text-xs font-bold focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timer Selector & Launch Action */}
        <div className="flex items-center justify-between pt-2 border-t-[2px] border-dark/15">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase text-dark/60">Timer:</span>
            {[15, 30, 0].map((s) => (
              <button
                key={s}
                onClick={() => setTimeLimit(s)}
                className={`px-2.5 py-1 rounded-lg border-[1.5px] border-dark text-[10px] font-black uppercase cursor-pointer ${
                  timeLimit === s ? 'bg-dark text-white' : 'bg-slate-100 text-dark/70 hover:bg-slate-200'
                }`}
              >
                {s === 0 ? 'No Limit' : `${s}s`}
              </button>
            ))}
          </div>

          <Button
            onClick={handleLaunchPoll}
            className="bg-yellow hover:bg-yellow/90 text-dark border-[2px] border-dark font-black text-xs uppercase shadow-[2.5px_2.5px_0px_#060E1C] active:scale-95"
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            <span>Launch Check to Student</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
