'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Type, RefreshCw, BookOpen, Search, Grid, Award } from 'lucide-react';

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

const WORDLE_WORDS = ['BRAIN', 'SMART', 'LEARN', 'STUDY', 'CLASS', 'LOGIC', 'BOOKS', 'PAPER', 'TEACH', 'SOLVE', 'FOCUS', 'GRADE', 'WRITE'];

// --- WORD SCRAMBLE COMPONENT ---
function WordScramble({ addScore }: { addScore: (points: number) => void }) {
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{type: string; text: string} | null>(null);

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

// --- NEW MINI-GAME 1: WORD SEARCH GRID ---
function WordSearch({ addScore }: { addScore: (points: number) => void }) {
  const searchList = ['MATH', 'READ', 'BOOK', 'TEST', 'QUIZ', 'STUDY'];
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number; char: string }[]>([]);

  const grid = [
    ['M','A','T','H','X','B','O','O','K'],
    ['P','E','N','C','I','L','Q','W','E'],
    ['R','E','A','D','K','S','T','U','D'],
    ['T','E','S','T','Z','Y','U','I','O'],
    ['Q','U','I','Z','S','T','U','D','Y'],
    ['A','B','C','D','E','F','G','H','I'],
  ];

  // Specific grid coordinates for hidden words
  const wordCoordinates: Record<string, { r: number; c: number }[]> = {
    MATH: [{r:0,c:0}, {r:0,c:1}, {r:0,c:2}, {r:0,c:3}],
    BOOK: [{r:0,c:5}, {r:0,c:6}, {r:0,c:7}, {r:0,c:8}],
    READ: [{r:2,c:0}, {r:2,c:1}, {r:2,c:2}, {r:2,c:3}],
    TEST: [{r:3,c:0}, {r:3,c:1}, {r:3,c:2}, {r:3,c:3}],
    QUIZ: [{r:4,c:0}, {r:4,c:1}, {r:4,c:2}, {r:4,c:3}],
    STUDY: [{r:4,c:4}, {r:4,c:5}, {r:4,c:6}, {r:4,c:7}, {r:4,c:8}]
  };

  const handleCellClick = (r: number, c: number, char: string) => {
    playWordSFX('click');
    
    // Check if cell is already selected in current selection
    const existsIdx = selectedCells.findIndex(sc => sc.r === r && sc.c === c);
    let newSelected = [...selectedCells];
    if (existsIdx !== -1) {
      newSelected.splice(existsIdx, 1);
    } else {
      newSelected.push({ r, c, char });
    }
    setSelectedCells(newSelected);

    const formedWord = newSelected.map(sc => sc.char).join('');
    
    if (searchList.includes(formedWord) && !foundWords.has(formedWord)) {
      playWordSFX('correct');
      const nextFound = new Set(foundWords);
      nextFound.add(formedWord);
      setFoundWords(nextFound);
      setSelectedCells([]);
      addScore(15);
      speakVoice(`Found word ${formedWord}! Plus 15 points.`);

      if (nextFound.size === searchList.length) {
        playWordSFX('win');
        speakVoice('Congratulations! All hidden words found!');
      }
    }
  };

  const markFoundWord = (w: string) => {
    if (foundWords.has(w)) return;
    playWordSFX('correct');
    const nextFound = new Set(foundWords);
    nextFound.add(w);
    setFoundWords(nextFound);
    addScore(15);
    speakVoice(`Found word ${w}! Plus 15 points.`);

    if (nextFound.size === searchList.length) {
      playWordSFX('win');
      speakVoice('Congratulations! All hidden words found!');
    }
  };

  const currentSelectionWord = selectedCells.map(sc => sc.char).join('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', padding: '8px' }}>
      {/* Selected Word Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8' }}>Selected:</span>
        <div style={{ fontSize: '16px', fontWeight: 950, color: '#fbbf24', background: '#111827', padding: '4px 12px', borderRadius: '8px', border: '1px solid #1e293b', minWidth: '80px', textAlign: 'center' }}>
          {currentSelectionWord || '—'}
        </div>
        {selectedCells.length > 0 && (
          <button
            onClick={() => setSelectedCells([])}
            style={{ padding: '3px 8px', background: '#fee2e2', color: '#ef4444', border: '1px solid #000', borderRadius: '6px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
        {/* Interactive 9x6 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '4px', background: '#111827', padding: '12px', borderRadius: '14px', border: '2px solid #1e293b' }}>
          {grid.map((row, r) => row.map((char, c) => {
            const isSelected = selectedCells.some(sc => sc.r === r && sc.c === c);
            const isFound = Array.from(foundWords).some(w => 
              wordCoordinates[w]?.some(coord => coord.r === r && coord.c === c)
            );

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c, char)}
                style={{
                  width: '36px', height: '36px', borderRadius: '6px',
                  background: isFound ? '#22c55e' : isSelected ? '#fbbf24' : '#1e293b',
                  color: isSelected ? '#000000' : '#ffffff',
                  border: isFound ? '2px solid #16a34a' : isSelected ? '2px solid #000000' : '1px solid #334155',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', fontWeight: 900, cursor: 'pointer',
                  userSelect: 'none', transition: 'all 0.15s ease'
                }}
              >
                {char}
              </div>
            );
          }))}
        </div>

        {/* Target Word List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#111827', padding: '14px', borderRadius: '14px', border: '2px solid #1e293b', minWidth: '140px' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '4px' }}>Hidden Words</div>
          {searchList.map(w => (
            <button
              key={w}
              onClick={() => markFoundWord(w)}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: '1px solid #000', fontSize: '11px', fontWeight: 900,
                background: foundWords.has(w) ? '#22c55e' : '#ffffff', color: foundWords.has(w) ? '#fff' : '#000',
                cursor: foundWords.has(w) ? 'default' : 'pointer', textDecoration: foundWords.has(w) ? 'line-through' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <span>{w}</span> {foundWords.has(w) && <span>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- NEW MINI-GAME 2: WORDLE / WORD GUESS ---
function WordleGame({ addScore }: { addScore: (points: number) => void }) {
  const [targetWord, setTargetWord] = useState('BRAIN');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isWon, setIsWon] = useState(false);

  const initWordle = useCallback(() => {
    const w = WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
    setTargetWord(w);
    setGuesses([]);
    setCurrentGuess('');
    setIsWon(false);
    speakVoice('Guess the 5-letter secret word in 6 tries.');
  }, []);

  useEffect(() => {
    initWordle();
  }, [initWordle]);

  const handleKeyPress = (key: string) => {
    if (isWon || guesses.length >= 6) return;
    playWordSFX('click');

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        const next = [...guesses, currentGuess];
        setGuesses(next);

        if (currentGuess === targetWord) {
          setIsWon(true);
          playWordSFX('win');
          speakVoice(`Fantastic! You guessed ${targetWord}! Plus 20 points.`);
          addScore(20);
        } else {
          playWordSFX('error');
        }
        setCurrentGuess('');
      }
    } else if (key === 'BACK') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const getCellBg = (rIdx: number, cIdx: number) => {
    if (rIdx >= guesses.length) return '#1e293b';
    const char = guesses[rIdx][cIdx];
    if (targetWord[cIdx] === char) return '#22c55e'; // Green (exact)
    if (targetWord.includes(char)) return '#f59e0b'; // Yellow (wrong spot)
    return '#475569'; // Gray
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px' }}>
      {/* 6x5 Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {Array.from({ length: 6 }).map((_, rIdx) => {
          const guessStr = rIdx < guesses.length ? guesses[rIdx] : rIdx === guesses.length ? currentGuess : '';
          return (
            <div key={rIdx} style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: 5 }).map((_, cIdx) => (
                <div
                  key={cIdx}
                  style={{
                    width: '34px', height: '34px', borderRadius: '6px', border: '1.5px solid #000',
                    background: getCellBg(rIdx, cIdx), color: '#fff', fontSize: '15px', fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {guessStr[cIdx] || ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* On-Screen Keyboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', marginTop: '4px' }}>
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: '3px' }}>
            {r === 2 && (
              <button onClick={() => handleKeyPress('ENTER')} style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #000', fontSize: '9px', fontWeight: 900, background: '#22c55e', color: '#fff', cursor: 'pointer' }}>ENTER</button>
            )}
            {row.split('').map(k => (
              <button
                key={k}
                onClick={() => handleKeyPress(k)}
                style={{ width: '22px', height: '28px', borderRadius: '4px', border: '1px solid #000', fontSize: '10px', fontWeight: 900, background: '#fff', color: '#000', cursor: 'pointer' }}
              >
                {k}
              </button>
            ))}
            {r === 2 && (
              <button onClick={() => handleKeyPress('BACK')} style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #000', fontSize: '9px', fontWeight: 900, background: '#ef4444', color: '#fff', cursor: 'pointer' }}>DEL</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN WORD PLAY PAGE ---
export default function WordPlay() {
  const [activeTab, setActiveTab] = useState<'scramble' | 'hangman' | 'wordsearch' | 'wordle'>('scramble');
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
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'scramble', title: 'Word Scramble' },
              { id: 'hangman', title: 'Hangman' },
              { id: 'wordsearch', title: 'Word Search' },
              { id: 'wordle', title: 'Wordle (5-Letter)' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{ padding: '5px 12px', borderRadius: '8px', border: '1.5px solid #000', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeTab === t.id ? '#8b5cf6' : '#1e293b', color: '#fff' }}
              >
                {t.title}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRulesModal(true)}
            style={{ padding: '5px 12px', background: '#38bdf8', color: '#000', border: '1.5px solid #000', borderRadius: '8px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <BookOpen size={12} /> Rules & Guide
          </button>
        </div>

        {/* Game Main Viewport */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {activeTab === 'scramble' && <WordScramble addScore={s => setScore(prev => prev + s)} />}
          {activeTab === 'hangman' && <Hangman addScore={s => setScore(prev => prev + s)} />}
          {activeTab === 'wordsearch' && <WordSearch addScore={s => setScore(prev => prev + s)} />}
          {activeTab === 'wordle' && <WordleGame addScore={s => setScore(prev => prev + s)} />}
        </div>
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', border: '3px solid #000', padding: '24px', width: '440px', color: '#000', boxShadow: '6px 6px 0 #000' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 950, color: '#8b5cf6', margin: '0 0 10px 0' }}>📜 Word Play Suite</h3>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>
              Includes 4 full games: <strong>Word Scramble</strong>, <strong>Hangman</strong>, <strong>Word Search</strong>, and <strong>Wordle (Word Guess)</strong> with Text-to-Speech audio support!
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
