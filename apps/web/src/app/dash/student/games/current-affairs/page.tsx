'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/games/GameLayout';
import {
  Globe, Award, RefreshCw, Check, Share2, Volume2, VolumeX, Shield,
  Sparkles, Clock, Compass, Zap, Trophy, Users, BookOpen, ChevronRight, Filter
} from 'lucide-react';
import { generateGlobalCurrentAffairsQuestion, GameQuestion } from '@/lib/games/dynamicQuestionEngine';
import { useBand } from '@/components/dashboards/BandContext';

const ACCENT_COLOR = '#0284c7'; // Deep Sky Blue Studio Accent

/* ═══════════════════════ LAZY SINGLETON AUDIO SYNTHESIZER ═══════════════════════ */
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!globalAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
  } catch (e) {}
  return globalAudioCtx;
}

function cleanTextForSpeech(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/₦\s*(\d[\d,.]*)/g, "$1 naira");
  cleaned = cleaned.replace(/nigeria\s+nairas?\b/gi, "naira");
  cleaned = cleaned.replace(/nigerian?\s+nairas?\b/gi, "naira");
  cleaned = cleaned.replace(/\bnairas\b/gi, "naira");
  cleaned = cleaned.replace(/\bNGN\b/g, "naira");
  return cleaned;
}

function speakVoice(text: string, isMuted: boolean, onComplete?: () => void) {
  if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onComplete) onComplete();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const spokenText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    let hasCalledOnComplete = false;
    const triggerComplete = () => {
      if (!hasCalledOnComplete) {
        hasCalledOnComplete = true;
        if (onComplete) onComplete();
      }
    };

    if (onComplete) {
      utterance.onend = triggerComplete;
      utterance.onerror = triggerComplete;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    if (onComplete) onComplete();
  }
}

function playStudioSFX(type: 'correct' | 'error' | 'click' | 'win' | 'lifeline' | 'tick' | 'start' | 'timeout', isMuted: boolean) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    if (type === 'start') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.25, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    } else if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.35, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.3);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'timeout') {
      // Dramatic Studio Time-out Gong (Descending D-Minor triad: F#3 -> D3 -> A2)
      const gongNotes = [185.00, 146.83, 110.00];
      gongNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.5, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.45);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'lifeline') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.04);
    }
  } catch (e) {}
}

const CONTINENTS = [
  'All', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Global / Antarctica'
];

const SPHERES = [
  'All', 'Politics & Geopolitics', 'Technology & AI', 'Environment & Climate', 'Global Sports', 'Arts & Culture', 'Science & Space', 'World History & Nations'
];

export default function CurrentAffairsGame() {
  const { band } = useBand();
  const [gradeBand, setGradeBand] = useState<'1-3' | '4-6' | '7-12'>(band || '4-6');

  useEffect(() => {
    if (band) setGradeBand(band);
  }, [band]);

  const [selectedContinent, setSelectedContinent] = useState('All');
  const [selectedSphere, setSelectedSphere] = useState('All');

  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [timeLeft, setTimeLeft] = useState(25);
  const [timerActive, setTimerActive] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [showHintModal, setShowHintModal] = useState(false);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const usedIdsRef = useRef<string[]>([]);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadNewQuestion = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    const q = generateGlobalCurrentAffairsQuestion(
      gradeBand,
      selectedContinent === 'All' ? undefined : selectedContinent,
      selectedSphere === 'All' ? undefined : selectedSphere,
      usedIdsRef.current
    );
    usedIdsRef.current.push(q.id);
    setCurrentQuestion(q);
    setSelectedOption(null);
    setIsAnswered(false);
    setDisabledOptions([]);
    setShowHintModal(false);
    setTimeLeft(25);
    setTimerActive(true);
    speakVoice(`Current Affairs Question: ${q.q}`, isMutedRef.current);
  }, [gradeBand, selectedContinent, selectedSphere]);

  useEffect(() => {
    loadNewQuestion();
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [loadNewQuestion]);

  // Countdown timer
  useEffect(() => {
    if (!timerActive || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          playStudioSFX('timeout', isMutedRef.current);
          setIsAnswered(true);
          setStreak(0);
          speakVoice("Time's up!", isMutedRef.current);
          autoAdvanceTimerRef.current = setTimeout(() => {
            setQuestionCount(c => c + 1);
            loadNewQuestion();
          }, 2000);
          return 0;
        }
        if (prev <= 5) playStudioSFX('tick', isMutedRef.current);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive, isAnswered, loadNewQuestion]);

  const handleSelectOption = (idx: number) => {
    getAudioContext(); // Unblock audio on click
    if (isAnswered || disabledOptions.includes(idx) || !currentQuestion) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    setTimerActive(false);

    const advanceToNextQuestion = () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setQuestionCount(c => c + 1);
        loadNewQuestion();
      }, 800); // 800ms brief pause after voice finishes
    };

    const isCorrect = idx === currentQuestion.a;
    if (isCorrect) {
      playStudioSFX('correct', isMutedRef.current);
      const bonus = Math.floor(timeLeft / 2);
      const addedPoints = 20 + bonus;
      setScore(s => s + addedPoints);
      setStreak(s => s + 1);
      speakVoice(`Correct! Plus ${addedPoints} points.`, isMutedRef.current, advanceToNextQuestion);
    } else {
      playStudioSFX('error', isMutedRef.current);
      setStreak(0);
      speakVoice(`Incorrect. The correct answer was ${currentQuestion.options[currentQuestion.a]}`, isMutedRef.current, advanceToNextQuestion);
    }

    // Safety fallback auto-advance timer in case speech synthesis is quiet or disabled
    autoAdvanceTimerRef.current = setTimeout(() => {
      setQuestionCount(c => c + 1);
      loadNewQuestion();
    }, 4500);
  };

  const handleFiftyFifty = () => {
    getAudioContext();
    if (fiftyFiftyUsed || !currentQuestion || isAnswered) return;
    playStudioSFX('lifeline', isMutedRef.current);
    setFiftyFiftyUsed(true);

    const wrongIdxs = [0, 1, 2, 3].filter(i => i !== currentQuestion.a);
    const shuffled = wrongIdxs.sort(() => Math.random() - 0.5);
    setDisabledOptions([shuffled[0], shuffled[1]]);
  };

  const handleUseHint = () => {
    getAudioContext();
    if (hintUsed || !currentQuestion || isAnswered) return;
    playStudioSFX('lifeline', isMutedRef.current);
    setHintUsed(true);
    setShowHintModal(true);
  };

  const handleNext = () => {
    getAudioContext();
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    playStudioSFX('click', isMutedRef.current);
    setQuestionCount(c => c + 1);
    loadNewQuestion();
  };

  const toggleSound = () => {
    getAudioContext();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      playStudioSFX('start', false);
    }
  };

  const copyInviteLink = () => {
    getAudioContext();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    playStudioSFX('lifeline', isMutedRef.current);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <GameLayout
      title="Global Current Affairs & World Knowledge (3D)"
      icon={<Globe style={{ width: '24px', height: '24px' }} />}
      accentColor={ACCENT_COLOR}
      fullscreen={true}
    >
      <div style={{
        display: 'flex', gap: '16px', height: '100%', padding: '8px',
        boxSizing: 'border-box', overflow: 'hidden'
      }}>
        {/* ─── LEFT SIDEBAR: FILTERS & CONTROLS ─── */}
        <div style={{
          width: '260px', background: '#0f172a', border: '3px solid #000000',
          borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column',
          gap: '12px', boxShadow: '4px 4px 0px #000000', overflowY: 'auto'
        }}>
          {/* Grade Band Filter */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 950, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trophy size={12} /> Grade Tier
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {[
                { id: '1-3', label: 'Grades 1-3' },
                { id: '4-6', label: 'Grades 4-6' },
                { id: '7-12', label: 'Grades 7-12' }
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setGradeBand(b.id as any)}
                  style={{
                    padding: '6px 2px', borderRadius: '6px', border: '1.5px solid #000',
                    background: gradeBand === b.id ? '#0284c7' : '#1e293b',
                    color: '#ffffff', fontSize: '9px', fontWeight: 900, cursor: 'pointer'
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Continent Selector */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 950, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Compass size={12} /> Continent
            </div>
            <select
              value={selectedContinent}
              onChange={e => setSelectedContinent(e.target.value)}
              style={{
                width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #000',
                background: '#1e293b', color: '#ffffff', fontSize: '11px', fontWeight: 900, outline: 'none'
              }}
            >
              {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Sphere Selector */}
          <div>
            <div style={{ fontSize: '10px', fontWeight: 950, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={12} /> Global Sphere
            </div>
            <select
              value={selectedSphere}
              onChange={e => setSelectedSphere(e.target.value)}
              style={{
                width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #000',
                background: '#1e293b', color: '#ffffff', fontSize: '11px', fontWeight: 900, outline: 'none'
              }}
            >
              {SPHERES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            style={{
              padding: '8px', borderRadius: '8px', border: '1.5px solid #000',
              background: isMuted ? '#ef4444' : '#22c55e', color: '#ffffff',
              fontSize: '11px', fontWeight: 950, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {isMuted ? 'Sound Muted' : 'Audio SFX Active'}
          </button>

          {/* Lifelines Box */}
          <div style={{ background: '#1e293b', border: '2px solid #000', borderRadius: '10px', padding: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 950, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '6px' }}>
              💡 Lifelines
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={handleFiftyFifty}
                disabled={fiftyFiftyUsed || isAnswered}
                style={{
                  padding: '6px', borderRadius: '6px', border: '1.5px solid #000',
                  background: fiftyFiftyUsed ? '#334155' : '#8b5cf6', color: '#fff',
                  fontSize: '10px', fontWeight: 950, cursor: fiftyFiftyUsed ? 'default' : 'pointer',
                  opacity: fiftyFiftyUsed ? 0.4 : 1
                }}
              >
                50:50
              </button>
              <button
                onClick={handleUseHint}
                disabled={hintUsed || isAnswered}
                style={{
                  padding: '6px', borderRadius: '6px', border: '1.5px solid #000',
                  background: hintUsed ? '#334155' : '#22c55e', color: '#fff',
                  fontSize: '10px', fontWeight: 950, cursor: hintUsed ? 'default' : 'pointer',
                  opacity: hintUsed ? 0.4 : 1
                }}
              >
                Hint
              </button>
            </div>
          </div>

          {/* Stats Display */}
          <div style={{ background: '#1e293b', border: '2px solid #000', borderRadius: '10px', padding: '10px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8' }}>Total Points:</span>
              <span style={{ fontSize: '12px', fontWeight: 950, color: '#fbbf24' }}>{score} XP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8' }}>Current Streak:</span>
              <span style={{ fontSize: '12px', fontWeight: 950, color: '#f97316' }}>{streak} 🔥</span>
            </div>
          </div>

          <button
            onClick={copyInviteLink}
            style={{
              padding: '8px', borderRadius: '8px', border: '1.5px solid #000',
              background: copiedLink ? '#22c55e' : '#fbbf24', color: '#000',
              fontSize: '10px', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            {copiedLink ? <Check size={12} /> : <Share2 size={12} />}
            {copiedLink ? 'Link Copied!' : 'Share Challenge'}
          </button>
        </div>

        {/* ─── MAIN STAGE: 3D GLOBAL STUDIO VIEWPORT ─── */}
        <div style={{
          flex: 1, background: '#0284c715', border: '3px solid #000000',
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between', boxShadow: '4px 4px 0px #000000',
          position: 'relative', overflowY: 'auto'
        }}>
          {/* Top Bar: Progress, Timer, and Direct Next Button */}
          <div style={{
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#0f172a', border: '2px solid #000', borderRadius: '12px', padding: '10px 16px',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} style={{ color: '#38bdf8' }} />
              <span style={{ fontSize: '12px', fontWeight: 950 }}>Question {questionCount}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: timeLeft <= 5 ? '#ef4444' : '#1e293b', padding: '4px 10px', borderRadius: '8px', border: '1px solid #000', fontSize: '12px', fontWeight: 950, fontFamily: 'monospace' }}>
                <Clock size={14} /> {timeLeft}s
              </div>

              {/* Direct Next Button in Top Bar */}
              <button
                onClick={handleNext}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #000',
                  background: '#fbbf24', color: '#0f172a', fontSize: '11px', fontWeight: 950,
                  cursor: 'pointer', boxShadow: '2px 2px 0px #000', textTransform: 'uppercase'
                }}
              >
                <span>{isAnswered ? 'Next ➔' : 'Skip ➔'}</span>
              </button>
            </div>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div style={{ width: '100%', maxWidth: '720px', textAlign: 'center', margin: '16px 0' }}>
              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '12px',
                background: '#0f172a', color: '#fbbf24', border: '1.5px solid #000',
                fontSize: '11px', fontWeight: 950, marginBottom: '12px', textTransform: 'uppercase'
              }}>
                {currentQuestion.category}
              </div>

              <h2 style={{
                fontSize: '22px', fontWeight: 950, color: '#0f172a', lineHeight: 1.3,
                background: '#ffffff', border: '3.5px solid #000', borderRadius: '20px',
                padding: '24px 20px', boxShadow: '6px 6px 0px #000'
              }}>
                {currentQuestion.q}
              </h2>

              {/* Hint Box */}
              {showHintModal && (
                <div style={{
                  marginTop: '12px', background: '#dcfce7', border: '2px solid #15803d',
                  borderRadius: '12px', padding: '10px 16px', fontSize: '12px', fontWeight: 800,
                  color: '#15803d', textAlign: 'center'
                }}>
                  💡 Hint: The correct answer starts with &quot;{currentQuestion.options[currentQuestion.a].slice(0, 3)}...&quot;
                </div>
              )}

              {/* 4 Option Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.a;
                  const isDisabled = disabledOptions.includes(idx);

                  let bg = '#ffffff';
                  let textColor = '#0f172a';
                  let border = '2.5px solid #000';

                  if (isAnswered) {
                    if (isCorrect) { bg = '#22c55e'; textColor = '#fff'; }
                    else if (isSelected) { bg = '#ef4444'; textColor = '#fff'; }
                  } else if (isSelected) {
                    bg = '#fbbf24';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered || isDisabled}
                      style={{
                        padding: '14px 18px', borderRadius: '14px', border,
                        background: isDisabled ? '#f1f5f9' : bg,
                        color: isDisabled ? '#94a3b8' : textColor,
                        fontSize: '13px', fontWeight: 950, cursor: isAnswered || isDisabled ? 'default' : 'pointer',
                        boxShadow: isDisabled ? 'none' : '3px 3px 0px #000',
                        opacity: isDisabled ? 0.4 : 1, textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: '#0f172a', color: '#fff', fontSize: '11px', fontWeight: 950,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span style={{ flex: 1 }}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prominent Bottom Action Bar */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={handleNext}
              style={{
                padding: '12px 36px', borderRadius: '14px', border: '3px solid #000',
                background: isAnswered ? '#22c55e' : '#0284c7', color: '#ffffff', fontSize: '14px', fontWeight: 950,
                boxShadow: '4px 4px 0px #000', cursor: 'pointer', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <span>{isAnswered ? 'Next Question (Auto in 2s) ➔' : 'Skip to Next Question ➔'}</span>
            </button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
