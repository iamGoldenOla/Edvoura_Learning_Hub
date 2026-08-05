'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/games/GameLayout';
import {
  Globe, Award, RefreshCw, Check, Share2, Volume2, VolumeX, Shield,
  Sparkles, Clock, Compass, Zap, Trophy, Users, BookOpen, ChevronRight, Filter
} from 'lucide-react';
import { generateGlobalCurrentAffairsQuestion, GameQuestion } from '@/lib/games/dynamicQuestionEngine';

const ACCENT_COLOR = '#0284c7'; // Deep Sky Blue Studio Accent

/* ═══════════════════════ AUDIO & SPEECH SYNTHESIZER ═══════════════════════ */
function speakVoice(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}

function playStudioSFX(type: 'correct' | 'error' | 'click' | 'win' | 'lifeline' | 'tick') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'lifeline') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.04);
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
  const [gradeBand, setGradeBand] = useState<'1-3' | '4-6' | '7-12'>('4-6');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [selectedSphere, setSelectedSphere] = useState('All');

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

  const loadNewQuestion = useCallback(() => {
    const q = generateGlobalCurrentAffairsQuestion(
      gradeBand,
      selectedContinent === 'All' ? undefined : selectedContinent,
      selectedSphere === 'All' ? undefined : selectedSphere
    );
    usedIdsRef.current.push(q.id);
    setCurrentQuestion(q);
    setSelectedOption(null);
    setIsAnswered(false);
    setDisabledOptions([]);
    setShowHintModal(false);
    setTimeLeft(25);
    setTimerActive(true);
    speakVoice(`Current Affairs Question: ${q.q}`);
  }, [gradeBand, selectedContinent, selectedSphere]);

  useEffect(() => {
    loadNewQuestion();
  }, [loadNewQuestion]);

  // Countdown timer
  useEffect(() => {
    if (!timerActive || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          playStudioSFX('error');
          setIsAnswered(true);
          setStreak(0);
          speakVoice("Time's up!");
          return 0;
        }
        if (prev <= 5) playStudioSFX('tick');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive, isAnswered]);

  const handleSelectOption = (idx: number) => {
    if (isAnswered || disabledOptions.includes(idx) || !currentQuestion) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    setTimerActive(false);

    const isCorrect = idx === currentQuestion.a;
    if (isCorrect) {
      playStudioSFX('correct');
      const bonus = Math.floor(timeLeft / 2);
      const addedPoints = 20 + bonus;
      setScore(s => s + addedPoints);
      setStreak(s => s + 1);
      speakVoice(`Correct! Plus ${addedPoints} points.`);
    } else {
      playStudioSFX('error');
      setStreak(0);
      speakVoice(`Incorrect. The correct answer was ${currentQuestion.options[currentQuestion.a]}`);
    }
  };

  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed || !currentQuestion || isAnswered) return;
    playStudioSFX('lifeline');
    setFiftyFiftyUsed(true);

    const wrongIdxs = [0, 1, 2, 3].filter(i => i !== currentQuestion.a);
    const shuffled = wrongIdxs.sort(() => Math.random() - 0.5);
    setDisabledOptions([shuffled[0], shuffled[1]]);
  };

  const handleUseHint = () => {
    if (hintUsed || !currentQuestion || isAnswered) return;
    playStudioSFX('lifeline');
    setHintUsed(true);
    setShowHintModal(true);
  };

  const handleNext = () => {
    playStudioSFX('click');
    setQuestionCount(c => c + 1);
    loadNewQuestion();
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    playStudioSFX('lifeline');
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
          borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between', boxShadow: '4px 4px 0px #000000',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Top Bar: Progress & Timer */}
          <div style={{
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#0f172a', border: '2px solid #000', borderRadius: '12px', padding: '8px 16px',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} style={{ color: '#38bdf8' }} />
              <span style={{ fontSize: '12px', fontWeight: 950 }}>Question {questionCount}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: timeLeft <= 5 ? '#ef4444' : '#1e293b', padding: '4px 10px', borderRadius: '8px', border: '1px solid #000', fontSize: '12px', fontWeight: 950, fontFamily: 'monospace' }}>
              <Clock size={14} /> {timeLeft}s
            </div>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div style={{ width: '100%', maxWidth: '720px', textAlign: 'center', margin: '20px 0' }}>
              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '12px',
                background: '#0f172a', color: '#fbbf24', border: '1.5px solid #000',
                fontSize: '11px', fontWeight: 950, marginBottom: '12px', textTransform: 'uppercase'
              }}>
                {currentQuestion.category}
              </div>

              <h2 style={{
                fontSize: '24px', fontWeight: 950, color: '#0f172a', lineHeight: 1.3,
                background: '#ffffff', border: '3.5px solid #000', borderRadius: '20px',
                padding: '28px 24px', boxShadow: '6px 6px 0px #000'
              }}>
                {currentQuestion.q}
              </h2>

              {/* 4 Option Hexagon Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
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
                        padding: '16px 20px', borderRadius: '14px', border,
                        background: isDisabled ? '#f1f5f9' : bg,
                        color: isDisabled ? '#94a3b8' : textColor,
                        fontSize: '14px', fontWeight: 950, cursor: isAnswered || isDisabled ? 'default' : 'pointer',
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

          {/* Bottom Next Button */}
          {isAnswered && (
            <button
              onClick={handleNext}
              style={{
                padding: '12px 32px', borderRadius: '14px', border: '3px solid #000',
                background: '#0284c7', color: '#ffffff', fontSize: '14px', fontWeight: 950,
                boxShadow: '4px 4px 0px #000', cursor: 'pointer', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <span>Next Question</span>
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
