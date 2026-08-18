'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy, Star, RefreshCw, Crown, Circle, Grid3X3, ALargeSmall, Type, Dice1,
  Gamepad2, Zap, ArrowRight, Sparkles, Brain, Rocket, Puzzle, Layers, Award, Globe,
  Flame, CheckCircle2, XCircle, Volume2, VolumeX, Timer, ShieldAlert
} from 'lucide-react';
import { useBand } from '@/components/dashboards/BandContext';
import { KeyStagePeerChallengeModal, getKeyStage } from '@/components/dashboards/student/KeyStagePeerChallengeModal';

// --- Web Audio API sound generator ---
const playSound = (type: 'correct' | 'wrong' | 'streak' | 'gameover') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'streak') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2); // C6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'gameover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch {
    // Ignore audio restrictions
  }
};

const GAMES = [
  {
    id: 'color-sort',
    title: 'Color Ring Sort 3D',
    description: 'Lift, stack, and sort colorful rings onto matching 3D pegs! Test your spatial logic and algorithmic thinking.',
    icon: Layers,
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    badgeText: '#7c3aed',
    difficulty: 'Easy – Hard',
    emoji: '⭕',
    category: 'Spatial Logic'
  },
  {
    id: 'current-affairs',
    title: 'Global Current Affairs (3D)',
    description: 'Explore the world across 7 continents and 7 global spheres! Auto-generated questions tailored by Grade Tier.',
    icon: Globe,
    color: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.25)',
    badgeBg: 'rgba(2, 132, 199, 0.12)',
    badgeText: '#0369a1',
    difficulty: 'Grade-Based',
    emoji: '🌍',
    category: 'World Knowledge'
  },
  {
    id: 'millionaire',
    title: 'Who Wants to Be a Millionaire (3D)',
    description: 'Step into the 3D TV Studio! Answer 15 questions across Sports, History, Politics, Music, Tech & Crypto to win ₦1,000,000!',
    icon: Award,
    color: '#9333ea',
    glowColor: 'rgba(147, 51, 234, 0.25)',
    badgeBg: 'rgba(147, 51, 234, 0.12)',
    badgeText: '#7e22ce',
    difficulty: 'All Levels',
    emoji: '💰',
    category: '3D Game Show'
  },
  {
    id: 'chess',
    title: 'Chess Mastery',
    description: 'Challenge the AI in the classic game of strategy. Full legal moves, check & checkmate detection.',
    icon: Crown,
    color: '#16a34a',
    glowColor: 'rgba(22, 163, 74, 0.25)',
    badgeBg: 'rgba(22, 163, 74, 0.12)',
    badgeText: '#15803d',
    difficulty: 'Hard',
    emoji: '♟️',
    category: 'Strategy'
  },
  {
    id: 'monopoly',
    title: 'Monopoly: Edvoura Edition',
    description: 'Buy academic properties, answer quiz questions, and outsmart your friends in this educational twist!',
    icon: Dice1,
    color: '#d97706',
    glowColor: 'rgba(217, 119, 6, 0.25)',
    badgeBg: 'rgba(217, 119, 6, 0.12)',
    badgeText: '#b45309',
    difficulty: 'Medium',
    emoji: '🎲',
    category: 'Board Game'
  },
  {
    id: 'ayo-opon',
    title: 'Ayò Ọ̀pọ́n',
    description: 'Play the ancient Nigerian Mancala game! Sow seeds, capture from opponents, and master strategy.',
    icon: Circle,
    color: '#ea580c',
    glowColor: 'rgba(234, 88, 12, 0.25)',
    badgeBg: 'rgba(234, 88, 12, 0.12)',
    badgeText: '#c2410c',
    difficulty: 'Medium',
    emoji: '🫘',
    category: 'Traditional'
  },
  {
    id: 'sudoku',
    title: 'Sudoku Quest',
    description: 'Solve number puzzles across 3 difficulty levels. Use pencil marks, hints, and beat the clock!',
    icon: Grid3X3,
    color: '#2563eb',
    glowColor: 'rgba(37, 99, 235, 0.25)',
    badgeBg: 'rgba(37, 99, 235, 0.12)',
    badgeText: '#1d4ed8',
    difficulty: 'Easy – Hard',
    emoji: '🔢',
    category: 'Puzzle'
  },
  {
    id: 'scrabble',
    title: 'Scrabble Word Clash',
    description: 'Place letter tiles on the board, form valid words, and score big with bonus squares!',
    icon: ALargeSmall,
    color: '#db2777',
    glowColor: 'rgba(219, 39, 119, 0.25)',
    badgeBg: 'rgba(219, 39, 119, 0.12)',
    badgeText: '#be185d',
    difficulty: 'Medium',
    emoji: '🔤',
    category: 'Word Game'
  },
  {
    id: 'word-play',
    title: 'Word Play Arcade',
    description: 'Four word games in one! Word Scramble, Hangman, Word Search, and Wordle — test your vocabulary.',
    icon: Type,
    color: '#7c3aed',
    glowColor: 'rgba(124, 58, 237, 0.25)',
    badgeBg: 'rgba(124, 58, 237, 0.12)',
    badgeText: '#6d28d9',
    difficulty: 'Easy – Hard',
    emoji: '📝',
    category: 'Word Game'
  },
  {
    id: 'puzzle',
    title: 'Educational Sliding Puzzle',
    description: 'Reconstruct subject artwork across Grade-based tiers (Grades 1-2: 3x3, 3-6: 4x4, 7-12: 5x5)!',
    icon: Puzzle,
    color: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.25)',
    badgeBg: 'rgba(5, 150, 105, 0.12)',
    badgeText: '#047857',
    difficulty: 'Grade-Based',
    emoji: '🧩',
    category: 'Sliding Puzzle'
  },
  {
    id: 'jenga',
    title: 'Jenga Physics Block Tower',
    description: 'Pull blocks from lower layers, solve trivia challenges, and stack without collapsing the tower!',
    icon: Layers,
    color: '#b45309',
    glowColor: 'rgba(180, 83, 9, 0.25)',
    badgeBg: 'rgba(180, 83, 9, 0.12)',
    badgeText: '#92400e',
    difficulty: 'Grade-Based',
    emoji: '🪵',
    category: 'Physics & Trivia'
  }
];

const EXTERNAL_GAMES = [
  {
    title: 'Arcademics',
    description: 'Multiplayer educational games for math, spelling, and language arts.',
    url: 'https://www.arcademics.com/',
    icon: Gamepad2,
    color: '#2563eb',
    badgeBg: 'rgba(37, 99, 235, 0.12)',
    badgeText: '#1d4ed8',
    category: 'Multiplayer'
  },
  {
    title: 'Math Playground',
    description: 'Action-packed math games, logic puzzles, and learning challenges for all ages.',
    url: 'https://www.mathplayground.com/',
    icon: Rocket,
    color: '#7c3aed',
    badgeBg: 'rgba(124, 58, 237, 0.12)',
    badgeText: '#6d28d9',
    category: 'Math'
  },
  {
    title: 'PBS Kids Games',
    description: 'Fun learning games featuring your favorite PBS Kids characters.',
    url: 'https://pbskids.org/games/',
    icon: Brain,
    color: '#16a34a',
    badgeBg: 'rgba(22, 163, 74, 0.12)',
    badgeText: '#15803d',
    category: 'General Kids'
  }
];

interface MathQuestion {
  question: string;
  answer: number;
}

// Grade & Band adaptive speed math question generator
const generateMathQuestion = (band: string): MathQuestion => {
  const isEarly = band === '1-3';
  const isJunior = band === '4-6';

  if (isEarly) {
    const isAddition = Math.random() > 0.4;
    if (isAddition) {
      const a = Math.floor(Math.random() * 15) + 3;
      const b = Math.floor(Math.random() * 15) + 2;
      return { question: `${a} + ${b}`, answer: a + b };
    } else {
      const b = Math.floor(Math.random() * 12) + 2;
      const a = b + Math.floor(Math.random() * 15) + 1;
      return { question: `${a} - ${b}`, answer: a - b };
    }
  } else if (isJunior) {
    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    if (op === '+') {
      const a = Math.floor(Math.random() * 45) + 15;
      const b = Math.floor(Math.random() * 45) + 15;
      return { question: `${a} + ${b}`, answer: a + b };
    } else if (op === '-') {
      const b = Math.floor(Math.random() * 40) + 10;
      const a = b + Math.floor(Math.random() * 50) + 10;
      return { question: `${a} - ${b}`, answer: a - b };
    } else if (op === '×') {
      const a = Math.floor(Math.random() * 11) + 3;
      const b = Math.floor(Math.random() * 11) + 3;
      return { question: `${a} × ${b}`, answer: a * b };
    } else {
      const b = Math.floor(Math.random() * 10) + 3;
      const ans = Math.floor(Math.random() * 12) + 2;
      const a = b * ans;
      return { question: `${a} ÷ ${b}`, answer: ans };
    }
  } else {
    // Senior 7-12
    const types = ['mul', 'square', 'percent', 'algebra', 'order'];
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === 'mul') {
      const a = Math.floor(Math.random() * 14) + 6;
      const b = Math.floor(Math.random() * 14) + 6;
      return { question: `${a} × ${b}`, answer: a * b };
    } else if (type === 'square') {
      const a = Math.floor(Math.random() * 11) + 5;
      return { question: `${a}²`, answer: a * a };
    } else if (type === 'percent') {
      const perc = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
      const base = (Math.floor(Math.random() * 10) + 1) * 40;
      return { question: `${perc}% of ${base}`, answer: (perc * base) / 100 };
    } else if (type === 'algebra') {
      const x = Math.floor(Math.random() * 9) + 2;
      const coeff = Math.floor(Math.random() * 4) + 2;
      const c = Math.floor(Math.random() * 15) + 3;
      const rhs = coeff * x + c;
      return { question: `${coeff}x + ${c} = ${rhs} (find x)`, answer: x };
    } else {
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      const c = Math.floor(Math.random() * 20) + 5;
      return { question: `(${a} × ${b}) + ${c}`, answer: a * b + c };
    }
  }
};

export default function GamesPage() {
  const router = useRouter();
  const { band } = useBand();
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [hoveredExternal, setHoveredExternal] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeChallengeGame, setActiveChallengeGame] = useState<{ id: string; title: string } | null>(null);

  // Speed Math State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameMode, setGameMode] = useState<'sprint' | 'blitz' | 'survival'>('sprint');
  const [isPlayingSpeedMath, setIsPlayingSpeedMath] = useState(false);
  const [currentMathQ, setCurrentMathQ] = useState<MathQuestion | null>(null);
  const [speedInputValue, setSpeedInputValue] = useState('');
  const [speedScore, setSpeedScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [livesLeft, setLivesLeft] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [speedGameOver, setSpeedGameOver] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'correct' | 'wrong' | null>(null);
  const [highScore, setHighScore] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load high score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`edvoura_speedmath_highscore_${band || '1-3'}`);
      if (saved) setHighScore(parseInt(saved, 10));
    }
  }, [band]);

  // Speed Math Timer Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingSpeedMath && !speedGameOver && gameMode === 'sprint') {
      if (timeLeft > 0) {
        timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      } else {
        endSpeedMathGame();
      }
    }
    return () => clearInterval(timer);
  }, [isPlayingSpeedMath, speedGameOver, timeLeft, gameMode]);

  // Focus input when new question appears
  useEffect(() => {
    if (isPlayingSpeedMath && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentMathQ, isPlayingSpeedMath]);

  const studentGradeCode = band === '1-3' ? 'grade_1' : band === '4-6' ? 'grade_4' : 'grade_7';
  const activeKsInfo = getKeyStage(studentGradeCode);
  const bandLabel = band === '1-3' ? 'Grades 1-3 (Early Explorers)' : band === '4-6' ? 'Grades 4-6 (Junior Scholars)' : 'Grades 7-12 (Senior Scholars)';

  const categoriesList = ['All', 'Spatial Logic', 'World Knowledge', '3D Game Show', 'Strategy', 'Board Game', 'Word Game', 'Sliding Puzzle', 'Physics & Trivia', 'Traditional'];

  const filteredGames = selectedCategory === 'All'
    ? GAMES
    : GAMES.filter(g => g.category === selectedCategory);

  // Start Speed Math
  const startSpeedMathGame = (mode: 'sprint' | 'blitz' | 'survival' = 'sprint') => {
    setGameMode(mode);
    setSpeedScore(0);
    setStreakCount(0);
    setBestStreak(0);
    setLivesLeft(3);
    setQuestionNumber(1);
    setSpeedGameOver(false);
    setTimeLeft(mode === 'sprint' ? 30 : 60);
    setIsPlayingSpeedMath(true);
    setCurrentMathQ(generateMathQuestion(band || '1-3'));
    setSpeedInputValue('');
  };

  const endSpeedMathGame = () => {
    setSpeedGameOver(true);
    setIsPlayingSpeedMath(false);
    if (soundEnabled) playSound('gameover');
    if (speedScore > highScore) {
      setHighScore(speedScore);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`edvoura_speedmath_highscore_${band || '1-3'}`, speedScore.toString());
      }
    }
  };

  const handleSpeedAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentMathQ || speedGameOver) return;

    const val = parseInt(speedInputValue.trim(), 10);
    if (isNaN(val)) return;

    if (val === currentMathQ.answer) {
      // Correct!
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      const multiplier = Math.min(4, 1 + Math.floor(newStreak / 3));
      const points = 10 * multiplier;
      setSpeedScore(s => s + points);

      setFeedbackState('correct');
      if (soundEnabled) {
        if (newStreak % 3 === 0) playSound('streak');
        else playSound('correct');
      }

      setTimeout(() => setFeedbackState(null), 400);

      // Check game mode completion
      if (gameMode === 'blitz' && questionNumber >= 10) {
        endSpeedMathGame();
        return;
      }

      setQuestionNumber(q => q + 1);
      setCurrentMathQ(generateMathQuestion(band || '1-3'));
      setSpeedInputValue('');
    } else {
      // Wrong!
      setStreakCount(0);
      setFeedbackState('wrong');
      if (soundEnabled) playSound('wrong');

      setTimeout(() => setFeedbackState(null), 400);

      if (gameMode === 'survival') {
        const nextLives = livesLeft - 1;
        setLivesLeft(nextLives);
        if (nextLives <= 0) {
          endSpeedMathGame();
          return;
        }
      }

      setQuestionNumber(q => q + 1);
      setCurrentMathQ(generateMathQuestion(band || '1-3'));
      setSpeedInputValue('');
    }
  };

  return (
    <div className="games-page-root" style={{
      maxWidth: '1240px',
      margin: '0 auto',
      padding: '24px 16px 64px',
      color: '#0f172a',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>

      {/* --- HERO HEADER BANNER: Premium Glassmorphism + Glowing Accent --- */}
      <section className="games-hero-section" style={{
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.9) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '3px solid #000000',
        padding: '32px 36px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
        boxShadow: '0 20px 40px -15px rgba(245, 158, 11, 0.4), 6px 6px 0px #000000',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background glow circles */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, flex: '1 1 340px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: '2.5px solid #000000',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '3px 3px 0px #000000',
              flexShrink: 0
            }}>
              <Gamepad2 size={32} color="#000000" />
            </div>

            {/* Glowing Glass Profile Badge inspired by James Grade 3 Badge */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.92)',
                color: '#fbbf24',
                padding: '5px 12px',
                borderRadius: '20px',
                border: '1.5px solid rgba(251, 191, 36, 0.5)',
                boxShadow: '0 0 12px rgba(251, 191, 36, 0.3)',
                fontSize: '11px',
                fontWeight: 950,
                marginBottom: '8px',
                maxWidth: '100%',
                wordBreak: 'break-word'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                <Trophy size={13} style={{ flexShrink: 0 }} /> Assigned: {bandLabel}
              </div>

              <h1 style={{
                fontSize: 'clamp(22px, 5vw, 36px)',
                fontWeight: 900,
                color: '#000000',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                textTransform: 'uppercase'
              }}>
                Edvoura Play Zone
              </h1>
            </div>
          </div>

          <p style={{ color: '#000000', fontSize: '14px', margin: 0, fontWeight: 650, lineHeight: 1.5, opacity: 0.95 }}>
            Interactive educational 3D games & rapid-fire speed math, tailored for peak grade performance!
          </p>
        </div>

        {/* Hero Stats Header */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: '1 1 300px', width: '100%', maxWidth: '100%' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '3px solid #000000',
            borderRadius: '18px',
            padding: '16px 24px',
            boxShadow: '4px 4px 0px #000000',
            flex: '1 1 160px',
            minWidth: '0'
          }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px 0' }}>
              Your High Score
            </p>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#000000', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={24} color="#fbbf24" fill="#fbbf24" /> {highScore} XP
            </div>
          </div>

          {/* Top Gamers Mini Card */}
          <div style={{
            background: 'rgba(254, 243, 199, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '3px solid #000000',
            borderRadius: '18px',
            padding: '14px 20px',
            boxShadow: '4px 4px 0px #000000',
            flex: '1 1 200px',
            minWidth: '0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: '#92400e', marginBottom: '6px' }}>
              <Trophy size={14} color="#d97706" /> Top Champions
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#000000', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🥇 Tola A.</span>
                <span style={{ fontWeight: 900 }}>1,500 XP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🥈 Chidi K.</span>
                <span style={{ fontWeight: 900 }}>1,240 XP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORY PILLS BAR --- */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '28px',
        maxWidth: '100%',
        scrollbarWidth: 'thin'
      }}>
        {categoriesList.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '10px 18px',
                borderRadius: '14px',
                border: '2.5px solid #000000',
                background: isActive ? '#0f172a' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                color: isActive ? '#fbbf24' : '#0f172a',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '4px 4px 0px #000000' : '2px 2px 0px rgba(0,0,0,0.06)',
                transform: isActive ? 'translate(-2px, -2px)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* --- MAIN PAGE GRID LAYOUT --- */}
      <div className="games-page-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '32px',
        alignItems: 'start'
      }}>

        {/* LEFT COLUMN: GAMES GRID */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Custom Games Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                background: 'rgba(139, 92, 246, 0.15)',
                padding: '8px',
                borderRadius: '12px',
                border: '2px solid #8b5cf6',
                display: 'flex'
              }}>
                <Sparkles size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                Edvoura 3D Games ({filteredGames.length})
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {filteredGames.map(game => {
                const isHovered = hoveredGame === game.id;
                return (
                  <div
                    key={game.id}
                    onClick={() => router.push(`/dash/student/games/${game.id}`)}
                    onMouseEnter={() => setHoveredGame(game.id)}
                    onMouseLeave={() => setHoveredGame(null)}
                    style={{
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(16px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                      border: '3px solid #000000',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: isHovered ? 'translateY(-6px)' : 'none',
                      boxShadow: isHovered
                        ? `0 20px 35px -10px ${game.glowColor}, 6px 6px 0px #000000`
                        : '4px 4px 0px #000000',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '230px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Subtle background ambient radial glow */}
                    <div style={{
                      position: 'absolute',
                      top: 0, right: 0, width: '120px', height: '120px',
                      background: `radial-gradient(circle at 100% 0%, ${game.glowColor}, transparent 70%)`,
                      pointerEvents: 'none',
                      transition: 'opacity 0.3s ease',
                      opacity: isHovered ? 1 : 0.4
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '8px' }}>
                        <div style={{
                          background: game.badgeBg,
                          borderRadius: '14px',
                          border: `2px solid ${game.color}`,
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: game.color,
                          boxShadow: isHovered ? `0 0 12px ${game.glowColor}` : 'none',
                          transition: 'all 0.2s ease'
                        }}>
                          <game.icon size={22} />
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '10px',
                          background: game.badgeBg,
                          color: game.badgeText,
                          fontSize: '11px',
                          fontWeight: 850,
                          border: `1.5px solid ${game.color}`
                        }}>
                          {game.category}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: '0 0 8px 0', lineHeight: 1.25 }}>
                        {game.emoji} {game.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5, fontWeight: 550 }}>
                        {game.description}
                      </p>
                    </div>

                    <div style={{
                      position: 'relative', zIndex: 1,
                      marginTop: '20px', paddingTop: '16px',
                      borderTop: '2px dashed #cbd5e1'
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>
                          Difficulty: <span style={{ color: game.badgeText, fontWeight: 950 }}>{game.difficulty}</span>
                        </span>
                      </div>
                      
                      {/* Responsive Action Buttons Container (Never Overlaps) */}
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveChallengeGame({ id: game.id, title: game.title });
                          }}
                          style={{
                            flex: '1 1 110px',
                            minWidth: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            padding: '8px 10px', borderRadius: '10px',
                            border: '2px solid #000000',
                            background: '#ffffff',
                            color: '#000000',
                            fontSize: '11px', fontWeight: 900,
                            cursor: 'pointer',
                            boxShadow: '2px 2px 0px #000000',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={`Generate peer challenge link for ${activeKsInfo.allowedGrades}`}
                        >
                          <span>⚔️ Challenge</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dash/student/games/${game.id}`);
                          }}
                          style={{
                            flex: '1 1 100px',
                            minWidth: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            padding: '8px 14px', borderRadius: '10px',
                            border: '2px solid #000000',
                            background: isHovered ? game.color : '#fbbf24',
                            color: isHovered ? '#ffffff' : '#000000',
                            fontSize: '11.5px', fontWeight: 950,
                            cursor: 'pointer',
                            boxShadow: isHovered ? '4px 4px 0px #000000' : '2px 2px 0px #000000',
                            transform: isHovered ? 'translate(-1px, -1px)' : 'none',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>Play Now</span>
                          <ArrowRight size={14} style={{ transform: isHovered ? 'translateX(3px)' : 'none', transition: 'transform 0.15s' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* External Partner Games Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                background: 'rgba(37, 99, 235, 0.15)',
                padding: '8px',
                borderRadius: '12px',
                border: '2px solid #2563eb',
                display: 'flex'
              }}>
                <Gamepad2 size={20} style={{ color: '#2563eb' }} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                Partner Learning Games
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {EXTERNAL_GAMES.map(game => {
                const isHovered = hoveredExternal === game.title;
                return (
                  <a
                    key={game.title}
                    href={game.url}
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={() => setHoveredExternal(game.title)}
                    onMouseLeave={() => setHoveredExternal(null)}
                    style={{
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(16px)',
                      border: '3px solid #000000',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      transform: isHovered ? 'translateY(-4px)' : 'none',
                      boxShadow: isHovered ? '6px 6px 0px #000000' : '4px 4px 0px #000000',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '200px',
                      textDecoration: 'none'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{
                          background: game.badgeBg,
                          borderRadius: '12px',
                          border: `2px solid ${game.color}`,
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: game.color
                        }}>
                          <game.icon size={22} />
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: game.badgeBg,
                          color: game.badgeText,
                          fontSize: '11px',
                          fontWeight: 800,
                          border: `1.5px solid ${game.color}`
                        }}>
                          {game.category}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: '0 0 8px 0' }}>
                        {game.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5, fontWeight: 550 }}>
                        {game.description}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      marginTop: '20px', paddingTop: '12px',
                      borderTop: '2px solid #f1f5f9'
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '13px', fontWeight: 900, color: '#000000',
                        transition: 'transform 0.2s',
                        transform: isHovered ? 'translateX(4px)' : 'none'
                      }}>
                        Visit Website <ArrowRight size={14} />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: REBUILT SPEED MATH & STATS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', minWidth: 0 }}>
          
          {/* --- SPEED MATH CARD (SUPERCHARGED & NO BUTTON OVERLAP) --- */}
          <div style={{
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: feedbackState === 'correct'
              ? '3px solid #22c55e'
              : feedbackState === 'wrong'
              ? '3px solid #ef4444'
              : '3px solid #000000',
            boxShadow: feedbackState === 'correct'
              ? '0 0 25px rgba(34, 197, 94, 0.4), 4px 4px 0px #000000'
              : feedbackState === 'wrong'
              ? '0 0 25px rgba(239, 68, 68, 0.4), 4px 4px 0px #000000'
              : '0 12px 30px -10px rgba(0, 0, 0, 0.15), 5px 5px 0px #000000',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}>
            {/* Header bar */}
            <div style={{
              background: '#0f172a',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '3px solid #000000'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#fbbf24', borderRadius: '8px', padding: '4px', display: 'flex' }}>
                  <Zap size={18} color="#000000" />
                </div>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Speed Math Arena
                </span>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '6px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              >
                {soundEnabled ? <Volume2 size={16} color="#fbbf24" /> : <VolumeX size={16} color="#94a3b8" />}
              </button>
            </div>

            <div style={{ padding: '24px', textAlign: 'center', boxSizing: 'border-box' }}>
              {!isPlayingSpeedMath && !speedGameOver ? (
                /* Mode Selector & Start Screen */
                <div>
                  <div style={{
                    display: 'inline-flex', padding: '8px 14px', borderRadius: '20px',
                    background: 'rgba(251, 191, 36, 0.15)', border: '1.5px solid #d97706',
                    fontSize: '12px', fontWeight: 900, color: '#b45309', marginBottom: '16px'
                  }}>
                    ⚡ Grade Tier: {bandLabel}
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#000000', margin: '0 0 8px 0' }}>
                    Rapid Mental Calculation
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 20px 0', lineHeight: 1.5, fontWeight: 550 }}>
                    Select a mode to challenge your speed, build combo streaks & earn play XP!
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    <button
                      onClick={() => startSpeedMathGame('sprint')}
                      style={{
                        padding: '12px', borderRadius: '12px', border: '2.5px solid #000000',
                        background: '#fbbf24', color: '#000000', fontSize: '13px', fontWeight: 900,
                        cursor: 'pointer', boxShadow: '3px 3px 0px #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <Timer size={16} /> 30-Sec Sprint (Rapid Fire)
                    </button>
                    <button
                      onClick={() => startSpeedMathGame('blitz')}
                      style={{
                        padding: '12px', borderRadius: '12px', border: '2.5px solid #000000',
                        background: '#ffffff', color: '#000000', fontSize: '13px', fontWeight: 900,
                        cursor: 'pointer', boxShadow: '3px 3px 0px #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <Zap size={16} color="#8b5cf6" /> 10-Question Blitz
                    </button>
                    <button
                      onClick={() => startSpeedMathGame('survival')}
                      style={{
                        padding: '12px', borderRadius: '12px', border: '2.5px solid #000000',
                        background: '#fee2e2', color: '#991b1b', fontSize: '13px', fontWeight: 900,
                        cursor: 'pointer', boxShadow: '3px 3px 0px #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <ShieldAlert size={16} color="#dc2626" /> 3-Lives Survival Mode
                    </button>
                  </div>
                </div>
              ) : isPlayingSpeedMath && currentMathQ ? (
                /* Active Game Loop Screen */
                <div>
                  {/* Game Status Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 900 }}>
                      <Star size={16} color="#fbbf24" fill="#fbbf24" />
                      <span>{speedScore} XP</span>
                    </div>

                    {/* Streak Counter */}
                    {streakCount >= 2 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: '#ffedd5', border: '1.5px solid #ea580c',
                        padding: '3px 8px', borderRadius: '12px',
                        fontSize: '11px', fontWeight: 950, color: '#c2410c'
                      }}>
                        <Flame size={14} color="#ea580c" fill="#ea580c" />
                        <span>{streakCount}x STREAK!</span>
                      </div>
                    )}

                    {gameMode === 'sprint' && (
                      <div style={{
                        fontSize: '12px', fontWeight: 900,
                        color: timeLeft <= 5 ? '#dc2626' : '#0f172a',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <Timer size={14} /> {timeLeft}s
                      </div>
                    )}

                    {gameMode === 'survival' && (
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[1, 2, 3].map(heart => (
                          <span key={heart} style={{ fontSize: '14px', opacity: heart <= livesLeft ? 1 : 0.2 }}>❤️</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Question Prompt */}
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    border: '2px solid #e2e8f0',
                    padding: '20px 12px',
                    marginBottom: '20px'
                  }}>
                    <p style={{
                      fontSize: 'clamp(28px, 6vw, 36px)',
                      fontWeight: 950,
                      color: '#0f172a',
                      margin: 0,
                      letterSpacing: '-0.02em'
                    }}>
                      {currentMathQ.question}
                    </p>
                  </div>

                  {/* Input Form with guaranteed FLUID layout - NEVER overlaps button */}
                  <form onSubmit={handleSpeedAnswer} style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'stretch',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <input
                      ref={inputRef}
                      type="number"
                      value={speedInputValue}
                      onChange={(e) => setSpeedInputValue(e.target.value)}
                      placeholder="Answer..."
                      style={{
                        flex: '1 1 120px',
                        minWidth: 0,
                        borderRadius: '12px',
                        border: '2.5px solid #000000',
                        background: '#ffffff',
                        padding: '12px 14px',
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#000000',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      autoFocus
                    />
                    <button
                      type="submit"
                      style={{
                        flexShrink: 0,
                        borderRadius: '12px',
                        border: '2.5px solid #000000',
                        cursor: 'pointer',
                        padding: '12px 20px',
                        fontSize: '15px',
                        fontWeight: 950,
                        background: '#fbbf24',
                        color: '#000000',
                        boxShadow: '3px 3px 0px #000000',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box'
                      }}
                    >
                      Go!
                    </button>
                  </form>

                  {/* Progress / Timer Bar */}
                  {gameMode === 'sprint' && (
                    <div style={{
                      marginTop: '18px', height: '10px', borderRadius: '6px',
                      background: '#e2e8f0', border: '2px solid #000000', overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: timeLeft <= 5 ? '#ef4444' : '#fbbf24',
                        transition: 'width 1s linear',
                        width: `${(timeLeft / 30) * 100}%`
                      }} />
                    </div>
                  )}

                  <p style={{ fontSize: '11.5px', color: '#64748b', marginTop: '10px', fontWeight: 700 }}>
                    Question {questionNumber} • {gameMode.toUpperCase()} MODE
                  </p>
                </div>
              ) : (
                /* Game Over Results Screen */
                <div>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                    <Trophy size={54} style={{ color: '#fbbf24' }} />
                    <Star size={22} style={{
                      color: '#000000', fill: '#fbbf24',
                      position: 'absolute', top: '-8px', right: '-12px'
                    }} />
                  </div>

                  <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#000000', margin: '0 0 6px 0' }}>
                    Round Complete!
                  </h3>

                  <div style={{
                    background: '#fef9c3', border: '2px solid #fbbf24', borderRadius: '14px',
                    padding: '12px', marginBottom: '20px'
                  }}>
                    <p style={{ color: '#000000', fontSize: '16px', margin: '0 0 4px 0', fontWeight: 900 }}>
                      Score: <span style={{ color: '#b45309' }}>{speedScore} XP</span>
                    </p>
                    <p style={{ color: '#475569', fontSize: '12px', margin: 0, fontWeight: 700 }}>
                      🔥 Best Streak: {bestStreak} Correct in a row!
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => startSpeedMathGame(gameMode)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '12px', borderRadius: '12px', border: '2px solid #000000', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 900, background: '#fbbf24', color: '#000000',
                        boxShadow: '3px 3px 0px #000000'
                      }}
                    >
                      <RefreshCw size={15} /> Play Again
                    </button>
                    <button
                      onClick={() => { setIsPlayingSpeedMath(false); setSpeedGameOver(false); }}
                      style={{
                        padding: '12px', borderRadius: '12px', border: '2px solid #000000', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 900, background: '#ffffff', color: '#000000',
                        boxShadow: '3px 3px 0px #000000'
                      }}
                    >
                      Modes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grade Championship Card */}
          <div style={{
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Trophy size={20} style={{ color: '#fbbf24' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase' }}>
                Grade Championship
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {[
                { rank: '🥇 1st', grade: 'Grade 3', points: '14,250 XP', color: '#fef9c3' },
                { rank: '🥈 2nd', grade: 'Grade 5', points: '13,100 XP', color: '#f1f5f9' },
                { rank: '🥉 3rd', grade: 'Grade 4', points: '11,800 XP', color: '#ffedd5' }
              ].map((g, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '12px', border: '2px solid #000000',
                  background: g.color
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 850 }}>{g.rank}</span>
                  <span style={{ fontSize: '13px', fontWeight: 900 }}>{g.grade}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>{g.points}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/dash/student/leaderboard')}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: '2.5px solid #000000',
                cursor: 'pointer', fontSize: '12px', fontWeight: 900, background: '#fbbf24',
                color: '#000000', boxShadow: '3px 3px 0px #000000', transition: 'transform 0.1s'
              }}
            >
              See All Rankings
            </button>
          </div>

          {/* Benefits Card */}
          <div style={{
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Brain size={20} style={{ color: '#8b5cf6' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase' }}>Why Play Games?</h3>
            </div>
            {[
              'Sharpen problem-solving & mental arithmetic',
              'Build vocabulary and mathematical fluency',
              'Learn Nigerian & world cultural heritage',
              'Compete with friends on the leaderboard'
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#dcfce7', color: '#15803d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 900, flexShrink: 0, marginTop: '2px',
                  border: '1.5px solid #000000'
                }}>✓</div>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.4, fontWeight: 550 }}>{text}</p>
              </div>
            ))}
          </div>

          {/* Pro Tip Card */}
          <div style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            border: '3px solid #000000',
            boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4), 4px 4px 0px #000000',
            padding: '24px',
            color: '#ffffff'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              💡 Pro Tip!
            </h3>
            <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.6, fontWeight: 550, opacity: 0.95 }}>
              Try Ayò Ọ̀pọ́n to learn about Nigerian culture while sharpening your math skills. Challenge a friend in Monopoly to practice teamwork!
            </p>
          </div>

        </div>
      </div>

      {activeChallengeGame ? (
        <KeyStagePeerChallengeModal
          gameTitle={activeChallengeGame.title}
          gameId={activeChallengeGame.id}
          studentGradeCode={studentGradeCode}
          studentName="Learner"
          onClose={() => setActiveChallengeGame(null)}
        />
      ) : null}

      <style jsx global>{`
        @media (max-width: 1024px) {
          .games-page-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
