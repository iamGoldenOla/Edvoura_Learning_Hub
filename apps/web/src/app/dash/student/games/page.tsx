'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy, Star, RefreshCw, Crown, Circle, Grid3X3, ALargeSmall, Type, Dice1,
  Gamepad2, Zap, ArrowRight, Sparkles, Brain
} from 'lucide-react';

const GAMES = [
  {
    id: 'chess',
    title: 'Chess',
    description: 'Challenge the AI in the classic game of strategy. Full legal moves, check & checkmate detection.',
    icon: Crown,
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e22, #16a34a11)',
    difficulty: 'Hard',
    difficultyColor: '#ef4444',
    emoji: '♟️',
    category: 'Strategy'
  },
  {
    id: 'monopoly',
    title: 'Monopoly: Edvoura Edition',
    description: 'Buy academic properties, answer quiz questions, and outsmart your friends in this educational twist!',
    icon: Dice1,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b22, #d9770611)',
    difficulty: 'Medium',
    difficultyColor: '#f59e0b',
    emoji: '🎲',
    category: 'Board Game'
  },
  {
    id: 'ayo-opon',
    title: 'Ayò Ọ̀pọ́n',
    description: 'Play the ancient Nigerian Mancala game! Sow seeds, capture from opponents, and master strategy.',
    icon: Circle,
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f9731622, #ea580c11)',
    difficulty: 'Medium',
    difficultyColor: '#f59e0b',
    emoji: '🫘',
    category: 'Traditional'
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Solve number puzzles across 3 difficulty levels. Use pencil marks, hints, and beat the clock!',
    icon: Grid3X3,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f622, #2563eb11)',
    difficulty: 'Easy – Hard',
    difficultyColor: '#3b82f6',
    emoji: '🔢',
    category: 'Puzzle'
  },
  {
    id: 'scrabble',
    title: 'Scrabble',
    description: 'Place letter tiles on the board, form valid words, and score big with bonus squares!',
    icon: ALargeSmall,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec489922, #db277711)',
    difficulty: 'Medium',
    difficultyColor: '#f59e0b',
    emoji: '🔤',
    category: 'Word Game'
  },
  {
    id: 'word-play',
    title: 'Word Play',
    description: 'Three word games in one! Scramble, Hangman, and Word Search — test your vocabulary.',
    icon: Type,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf622, #7c3aed11)',
    difficulty: 'Easy',
    difficultyColor: '#22c55e',
    emoji: '📝',
    category: 'Word Game'
  }
];

const MATH_QUESTIONS = [
  { q: 'What is 12 + 15?', a: 27 },
  { q: 'What is 8 × 7?', a: 56 },
  { q: 'What is 144 ÷ 12?', a: 12 },
  { q: 'What is 45 - 19?', a: 26 },
  { q: 'What is 9 × 9?', a: 81 },
  { q: 'What is 25 + 38?', a: 63 },
  { q: 'What is 7 × 6?', a: 42 },
  { q: 'What is 100 - 37?', a: 63 },
  { q: 'What is 15 × 4?', a: 60 },
  { q: 'What is 96 ÷ 8?', a: 12 },
];

export default function GamesPage() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const handleAnswer = () => {
    const currentQ = MATH_QUESTIONS[currentQuestionIdx];
    if (parseInt(inputValue, 10) === currentQ.a) {
      setScore(score + 10);
    }
    if (currentQuestionIdx + 1 < MATH_QUESTIONS.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setInputValue('');
    } else {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setScore(0);
    setCurrentQuestionIdx(0);
    setInputValue('');
    setGameOver(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 48px' }}>
      {/* Hero Header */}
      <section style={{
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '40px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px',
          borderRadius: '50%', background: 'rgba(139,92,246,0.08)', filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', left: '40%', width: '160px', height: '160px',
          borderRadius: '50%', background: 'rgba(59,130,246,0.06)', filter: 'blur(30px)'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '16px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(245,158,11,0.3)'
            }}>
              <Gamepad2 size={28} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '32px', fontWeight: 800, color: 'white', margin: 0,
                letterSpacing: '-0.03em', lineHeight: 1.1
              }}>
                Edvoura Play Zone
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>
                Learn while you play — 6 premium games built just for you
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '20px',
          padding: '20px 32px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>
            Your Points
          </p>
          <p style={{
            fontSize: '36px', fontWeight: 900, color: '#fbbf24', margin: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            {score} <Star size={20} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
          </p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
        {/* Game Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Sparkles size={18} style={{ color: '#8b5cf6' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Choose Your Game</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {GAMES.map(game => {
              const isHovered = hoveredGame === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => router.push(`/dash/student/games/${game.id}`)}
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                  style={{
                    borderRadius: '20px',
                    background: isHovered ? game.gradient : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isHovered ? game.color + '44' : 'rgba(255,255,255,0.06)'}`,
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'translateY(-4px)' : 'none',
                    boxShadow: isHovered ? `0 12px 32px ${game.color}22` : 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Category badge */}
                  <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    padding: '4px 10px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    fontSize: '10px', fontWeight: 700, color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    {game.category}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                      background: `${game.color}18`,
                      borderRadius: '16px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: game.color,
                      flexShrink: 0,
                      transition: 'all 0.3s',
                      transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'none'
                    }}>
                      <game.icon size={24} />
                    </div>
                    <div style={{ flex: 1, paddingRight: '50px' }}>
                      <h3 style={{
                        fontSize: '16px', fontWeight: 800, color: 'white', margin: '0 0 6px 0',
                        transition: 'color 0.2s'
                      }}>
                        {game.emoji} {game.title}
                      </h3>
                      <p style={{
                        fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.5
                      }}>
                        {game.description}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: '16px', paddingTop: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{
                      padding: '4px 10px', borderRadius: '8px',
                      background: `${game.difficultyColor}15`,
                      fontSize: '11px', fontWeight: 700, color: game.difficultyColor
                    }}>
                      {game.difficulty}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 700, color: game.color,
                      transition: 'all 0.2s',
                      transform: isHovered ? 'translateX(4px)' : 'none'
                    }}>
                      Play Now <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Speed Math Mini Game */}
          <div style={{
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={16} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Speed Math
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Quick Challenge</span>
            </div>

            <div style={{ padding: '24px', textAlign: 'center' }}>
              {!gameOver ? (
                <div>
                  <p style={{
                    fontSize: '32px', fontWeight: 900, color: 'white', margin: '0 0 20px 0'
                  }}>
                    {MATH_QUESTIONS[currentQuestionIdx].q}
                  </p>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                      placeholder="Answer..."
                      style={{
                        flex: 1, borderRadius: '12px',
                        border: '2px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '14px 16px', fontSize: '18px', fontWeight: 700,
                        color: 'white', outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleAnswer}
                      style={{
                        borderRadius: '12px', border: 'none', cursor: 'pointer',
                        padding: '14px 24px', fontSize: '16px', fontWeight: 700,
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white', boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                      }}
                    >
                      Go!
                    </button>
                  </div>

                  <div style={{
                    marginTop: '16px', height: '6px', borderRadius: '3px',
                    background: 'rgba(255,255,255,0.06)', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      transition: 'width 0.5s',
                      width: `${((currentQuestionIdx + 1) / MATH_QUESTIONS.length) * 100}%`
                    }} />
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                    Question {currentQuestionIdx + 1} of {MATH_QUESTIONS.length}
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                    <Trophy size={48} style={{ color: '#f59e0b' }} />
                    <Star size={20} style={{
                      color: '#fbbf24', fill: '#fbbf24',
                      position: 'absolute', top: '-8px', right: '-12px'
                    }} />
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'white', margin: '0 0 8px 0' }}>
                    Awesome!
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 16px 0' }}>
                    You earned <span style={{ color: '#fbbf24', fontWeight: 700 }}>{score} points</span>
                  </p>
                  <button
                    onClick={resetGame}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto',
                      padding: '12px 24px', borderRadius: '12px', cursor: 'pointer',
                      fontSize: '14px', fontWeight: 700,
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      color: 'white', border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <RefreshCw size={16} /> Play Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Benefits Card */}
          <div style={{
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Brain size={18} style={{ color: '#8b5cf6' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: 0 }}>Why Play Games?</h3>
            </div>
            {[
              'Sharpen your problem-solving and critical thinking',
              'Build vocabulary and mathematical fluency',
              'Learn Nigerian & world cultural heritage',
              'Compete with friends on the leaderboard'
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'rgba(34,197,94,0.12)', color: '#22c55e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, flexShrink: 0, marginTop: '1px'
                }}>✓</div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{text}</p>
              </div>
            ))}
          </div>

          {/* Pro Tip */}
          <div style={{
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: '-20px', right: '-20px',
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)'
            }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: '0 0 8px 0', position: 'relative' }}>
              💡 Pro Tip!
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6, position: 'relative' }}>
              Try Ayò Ọ̀pọ́n to learn about Nigerian culture while sharpening your math skills. Challenge a friend in Monopoly to practice teamwork!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
