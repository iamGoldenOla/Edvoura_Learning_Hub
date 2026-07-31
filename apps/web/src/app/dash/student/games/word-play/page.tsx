'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Type, RefreshCw, ChevronRight, CheckCircle2, XCircle, BookOpen, Volume2 } from 'lucide-react';

const ACCENT_COLOR = '#8b5cf6';

/* ═══════════════════════ VOICE & AUDIO SYNTHESIZER ═══════════════════════ */
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

function playWordSFX(type: 'click' | 'correct' | 'error' | 'win') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    }
  } catch (e) {}
}

const SCRAMBLE_WORDS = [
  'SCIENCE', 'HISTORY', 'MATHEMATICS', 'GEOGRAPHY', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS',
  'ASTRONOMY', 'LITERATURE', 'GRAMMAR', 'VOCABULARY', 'ALGEBRA', 'GEOMETRY', 'CALCULUS',
  'ECONOMICS', 'PSYCHOLOGY', 'SOCIOLOGY', 'PHILOSOPHY', 'ART', 'MUSIC', 'COMPUTER',
  'PROGRAMMING', 'ALGORITHM', 'DATABASE', 'NETWORK', 'INTERNET', 'SOFTWARE', 'HARDWARE'
];

const HANGMAN_CATEGORIES: Record<string, string[]> = {
  Animals: ['ELEPHANT', 'GIRAFFE', 'HIPPOPOTAMUS', 'RHINOCEROS', 'CROCODILE', 'KANGAROO', 'PENGUIN', 'DOLPHIN'],
  Countries: ['AUSTRALIA', 'BRAZIL', 'CANADA', 'DENMARK', 'EGYPT', 'FRANCE', 'GERMANY', 'JAPAN'],
  Subjects: ['MATHEMATICS', 'GEOGRAPHY', 'HISTORY', 'SCIENCE', 'LITERATURE', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'],
  Science: ['MOLECULE', 'ATOM', 'GRAVITY', 'ENERGY', 'VELOCITY', 'ACCELERATION', 'ECOSYSTEM', 'PHOTOSYNTHESIS']
};

const SEARCH_WORDS = [
  'REACT', 'NEXTJS', 'TYPESCRIPT', 'JAVASCRIPT', 'HTML', 'CSS', 'NODE', 'PYTHON',
  'JAVA', 'RUBY', 'PHP', 'SWIFT', 'KOTLIN', 'GO', 'RUST', 'CSHARP', 'SQL', 'REDIS',
  'API', 'JSON', 'XML', 'DOCKER', 'KUBERNETES', 'CLOUD'
];

// --- WORD SCRAMBLE COMPONENT ---
function WordScramble({ addScore }: { addScore: (points: number) => void }) {
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{type: string; text: string} | null>(null);
  const [hintLevel, setHintLevel] = useState(0);

  const getNewWord = useCallback(() => {
    const newWord = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    setWord(newWord);
    
    let scram = newWord.split('');
    for (let i = scram.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scram[i], scram[j]] = [scram[j], scram[i]];
    }
    if (scram.join('') === newWord) {
      [scram[0], scram[1]] = [scram[1], scram[0]];
    }
    setScrambled(scram.join(''));
    setGuess('');
    setFeedback(null);
    setHintLevel(0);
    speakVoice(`Unscramble the word: ${scram.join(' ')}`);
  }, []);

  useEffect(() => {
    getNewWord();
  }, [getNewWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess) return;
    
    if (guess.toUpperCase() === word) {
      playWordSFX('correct');
      speakVoice(`Correct! ${word}. Plus 10 points.`);
      setFeedback({ type: 'success', text: 'Correct! +10 points' });
      addScore(10);
      setStreak(s => s + 1);
      setTimeout(() => getNewWord(), 1500);
    } else {
      playWordSFX('error');
      speakVoice('Incorrect, try again!');
      setFeedback({ type: 'error', text: 'Incorrect, try again!' });
      setStreak(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: '#fff', textAlign: 'center' }}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8' }}>Streak: 🔥 {streak}</div>
      <div style={{ fontSize: '36px', fontWeight: 950, letterSpacing: '8px', color: '#8b5cf6', background: '#111827', padding: '16px 32px', borderRadius: '16px', border: '2px solid #1e293b' }}>
        {scrambled}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="Type guess..."
          style={{ padding: '10px 16px', borderRadius: '10px', border: '2px solid #000', fontSize: '14px', fontWeight: 800, width: '220px', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '10px', border: '2px solid #000', background: '#8b5cf6', color: '#fff', fontWeight: 900, cursor: 'pointer' }}>
          Submit
        </button>
      </form>

      {feedback && (
        <div style={{ fontSize: '13px', fontWeight: 900, color: feedback.type === 'success' ? '#22c55e' : '#ef4444' }}>
          {feedback.text}
        </div>
      )}
    </div>
  );
}

// --- HANGMAN COMPONENT ---
function Hangman({ addScore }: { addScore: (points: number) => void }) {
  const [category, setCategory] = useState('Animals');
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);

  const initHangman = useCallback((cat: string) => {
    const list = HANGMAN_CATEGORIES[cat];
    const w = list[Math.floor(Math.random() * list.length)];
    setWord(w);
    setGuessed(new Set());
    setWrongCount(0);
    speakVoice(`Category: ${cat}. Guess the hidden word.`);
  }, []);

  useEffect(() => {
    initHangman(category);
  }, [category, initHangman]);

  const handleGuess = (letter: string) => {
    if (guessed.has(letter) || wrongCount >= 6) return;
    playWordSFX('click');
    const next = new Set(guessed);
    next.add(letter);
    setGuessed(next);

    if (!word.includes(letter)) {
      const nextWrong = wrongCount + 1;
      setWrongCount(nextWrong);
      playWordSFX('error');
      if (nextWrong >= 6) {
        speakVoice(`Game over! Word was ${word}`);
      }
    } else {
      playWordSFX('correct');
      const won = word.split('').every(l => next.has(l));
      if (won) {
        playWordSFX('win');
        speakVoice(`Congratulations! Word was ${word}. Plus 15 points!`);
        addScore(15);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#fff' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        {Object.keys(HANGMAN_CATEGORIES).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #000', fontSize: '10px', fontWeight: 900, background: category === cat ? '#8b5cf6' : '#1e293b', color: '#fff', cursor: 'pointer' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '28px', fontWeight: 950, letterSpacing: '6px', margin: '8px 0', fontFamily: 'monospace' }}>
        {word.split('').map(l => guessed.has(l) ? l : '_').join(' ')}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '340px', justifyContent: 'center' }}>
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
          <button
            key={l}
            onClick={() => handleGuess(l)}
            disabled={guessed.has(l) || wrongCount >= 6}
            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #000', fontWeight: 900, background: guessed.has(l) ? '#334155' : '#ffffff', color: guessed.has(l) ? '#64748b' : '#000', cursor: 'pointer' }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- MAIN WORD PLAY PAGE ---
export default function WordPlay() {
  const [activeTab, setActiveTab] = useState<'scramble' | 'hangman'>('scramble');
  const [score, setScore] = useState(0);
  const [showRulesModal, setShowRulesModal] = useState(false);

  return (
    <GameLayout
      title="Word Play"
      icon={<Type style={{ width: '24px', height: '24px' }} />}
      accentColor="#8b5cf6"
      score={score}
      fullscreen={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '8px', boxSizing: 'border-box' }}>
        {/* Top Tab Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', padding: '6px 12px', borderRadius: '12px', border: '1.5px solid #1e293b' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('scramble')}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #000', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeTab === 'scramble' ? '#8b5cf6' : '#1e293b', color: '#fff' }}
            >
              Word Scramble
            </button>
            <button
              onClick={() => setActiveTab('hangman')}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #000', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeTab === 'hangman' ? '#8b5cf6' : '#1e293b', color: '#fff' }}
            >
              Hangman
            </button>
          </div>

          <button
            onClick={() => setShowRulesModal(true)}
            style={{ padding: '6px 12px', background: '#38bdf8', color: '#000', border: '1.5px solid #000', borderRadius: '8px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <BookOpen size={12} /> Rules & Guide
          </button>
        </div>

        {/* Game Main Viewport */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {activeTab === 'scramble' && <WordScramble addScore={s => setScore(prev => prev + s)} />}
          {activeTab === 'hangman' && <Hangman addScore={s => setScore(prev => prev + s)} />}
        </div>
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', border: '3px solid #000', padding: '24px', width: '420px', color: '#000', boxShadow: '6px 6px 0 #000' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 950, color: '#8b5cf6', margin: '0 0 10px 0' }}>📜 Word Play Guide</h3>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>
              Test your vocabulary with Word Scramble and Hangman mini-games with full Text-to-Speech audio support!
            </p>
            <button onClick={() => setShowRulesModal(false)} style={{ width: '100%', padding: '8px', background: '#8b5cf6', color: '#fff', border: '2px solid #000', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}>
              Got It! Close
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
