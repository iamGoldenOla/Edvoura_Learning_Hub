'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy, Star, RefreshCw, Crown, Circle, Grid3X3, ALargeSmall, Type, Dice1,
  Gamepad2, Zap, ArrowRight, Sparkles, Brain, Rocket, Puzzle, Layers
} from 'lucide-react';

const GAMES = [
  {
    id: 'chess',
    title: 'Chess',
    description: 'Challenge the AI in the classic game of strategy. Full legal moves, check & checkmate detection.',
    icon: Crown,
    color: '#22c55e',
    badgeBg: '#dcfce7',
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
    color: '#fbbf24',
    badgeBg: '#fef9c3',
    badgeText: '#a16207',
    difficulty: 'Medium',
    emoji: '🎲',
    category: 'Board Game'
  },
  {
    id: 'ayo-opon',
    title: 'Ayò Ọ̀pọ́n',
    description: 'Play the ancient Nigerian Mancala game! Sow seeds, capture from opponents, and master strategy.',
    icon: Circle,
    color: '#f97316',
    badgeBg: '#ffedd5',
    badgeText: '#c2410c',
    difficulty: 'Medium',
    emoji: '🫘',
    category: 'Traditional'
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Solve number puzzles across 3 difficulty levels. Use pencil marks, hints, and beat the clock!',
    icon: Grid3X3,
    color: '#3b82f6',
    badgeBg: '#dbeafe',
    badgeText: '#1d4ed8',
    difficulty: 'Easy – Hard',
    emoji: '🔢',
    category: 'Puzzle'
  },
  {
    id: 'scrabble',
    title: 'Scrabble',
    description: 'Place letter tiles on the board, form valid words, and score big with bonus squares!',
    icon: ALargeSmall,
    color: '#ec4899',
    badgeBg: '#fce7f3',
    badgeText: '#be185d',
    difficulty: 'Medium',
    emoji: '🔤',
    category: 'Word Game'
  },
  {
    id: 'word-play',
    title: 'Word Play',
    description: 'Four word games in one! Word Scramble, Hangman, Word Search, and Wordle — test your vocabulary.',
    icon: Type,
    color: '#8b5cf6',
    badgeBg: '#f3e8ff',
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
    color: '#8b5cf6',
    badgeBg: '#f3e8ff',
    badgeText: '#6d28d9',
    difficulty: 'Grade-Based',
    emoji: '🧩',
    category: 'Sliding Puzzle'
  },
  {
    id: 'jenga',
    title: 'Jenga Physics Block Tower',
    description: 'Pull blocks from lower layers, solve trivia challenges, and stack without collapsing the tower!',
    icon: Layers,
    color: '#d97706',
    badgeBg: '#fef3c7',
    badgeText: '#b45309',
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
    color: '#3b82f6',
    badgeBg: '#dbeafe',
    badgeText: '#1d4ed8',
    category: 'Multiplayer'
  },
  {
    title: 'Math Playground',
    description: 'Action-packed math games, logic puzzles, and learning challenges for all ages.',
    url: 'https://www.mathplayground.com/',
    icon: Rocket,
    color: '#8b5cf6',
    badgeBg: '#f3e8ff',
    badgeText: '#6d28d9',
    category: 'Math'
  },
  {
    title: 'PBS Kids Games',
    description: 'Fun learning games featuring your favorite PBS Kids characters.',
    url: 'https://pbskids.org/games/',
    icon: Brain,
    color: '#22c55e',
    badgeBg: '#dcfce7',
    badgeText: '#15803d',
    category: 'General Kids'
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
  const [hoveredExternal, setHoveredExternal] = useState<string | null>(null);

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 48px', color: '#0f172a' }}>
      {/* Hero Header Banner - Neo-brutalist Yellow */}
      <section style={{
        borderRadius: '20px',
        background: '#fbbf24',
        border: '3px solid #000000',
        padding: '36px',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
        boxShadow: '6px 6px 0px #000000',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '2px solid #000000',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '3px 3px 0px #000000'
            }}>
              <Gamepad2 size={28} color="#000000" />
            </div>
            <div>
              <h1 style={{
                fontSize: '32px', fontWeight: 900, color: '#000000', margin: 0,
                letterSpacing: '-0.02em', lineHeight: 1.1, textTransform: 'uppercase'
              }}>
                Edvoura Play Zone
              </h1>
              <p style={{ color: '#000000', fontSize: '15px', margin: '4px 0 0 0', fontWeight: 600 }}>
                Learn while you play — 8 premium custom games + partner sites!
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '3px solid #000000',
          borderRadius: '16px',
          padding: '16px 28px',
          textAlign: 'center',
          boxShadow: '4px 4px 0px #000000',
          position: 'relative',
          zIndex: 1
        }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>
            Your Points
          </p>
          <p style={{
            fontSize: '32px', fontWeight: 900, color: '#000000', margin: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            {score} <Star size={22} style={{ fill: '#fbbf24', color: '#000000' }} />
          </p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        {/* Left Column - Games */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Custom Games Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <Sparkles size={20} style={{ color: '#8b5cf6' }} />
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                Edvoura Custom Games
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
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
                      borderRadius: '16px',
                      background: '#ffffff',
                      border: '3px solid #000000',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isHovered ? 'translate(-4px, -4px)' : 'none',
                      boxShadow: isHovered ? '8px 8px 0px #000000' : '4px 4px 0px #000000',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '220px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{
                          background: `${game.color}22`,
                          borderRadius: '12px',
                          border: '2px solid #000000',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000000'
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
                          border: '1.5px solid #000000'
                        }}>
                          {game.category}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: '0 0 8px 0' }}>
                        {game.emoji} {game.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                        {game.description}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: '20px', paddingTop: '14px',
                      borderTop: '2px dashed #e2e8f0'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>
                        Difficulty: <span style={{ color: game.badgeText, fontWeight: 950 }}>{game.difficulty}</span>
                      </span>
                      
                      {/* Bold Neo-Brutalist Play Now Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dash/student/games/${game.id}`);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', borderRadius: '10px',
                          border: '2px solid #000000',
                          background: isHovered ? '#8b5cf6' : '#fbbf24',
                          color: isHovered ? '#ffffff' : '#000000',
                          fontSize: '12px', fontWeight: 950,
                          cursor: 'pointer',
                          boxShadow: isHovered ? '4px 4px 0px #000000' : '2px 2px 0px #000000',
                          transform: isHovered ? 'translate(-2px, -2px)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>Play Now</span>
                        <ArrowRight size={14} style={{ transform: isHovered ? 'translateX(3px)' : 'none', transition: 'transform 0.15s' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* External Partner Games Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <Gamepad2 size={20} style={{ color: '#3b82f6' }} />
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
                      borderRadius: '16px',
                      background: '#ffffff',
                      border: '3px solid #000000',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isHovered ? 'translate(-4px, -4px)' : 'none',
                      boxShadow: isHovered ? '8px 8px 0px #000000' : '4px 4px 0px #000000',
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
                          background: `${game.color}22`,
                          borderRadius: '12px',
                          border: '2px solid #000000',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000000'
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
                          border: '1.5px solid #000000'
                        }}>
                          {game.category}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', margin: '0 0 8px 0' }}>
                        {game.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
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
                        fontSize: '13px', fontWeight: 800, color: '#000000',
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

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Speed Math Mini Game */}
          <div style={{
            borderRadius: '20px',
            background: '#ffffff',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#000000',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '3px solid #000000'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={18} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Speed Math
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#a1a1aa' }}>Quick Challenge</span>
            </div>

            <div style={{ padding: '24px', textAlign: 'center' }}>
              {!gameOver ? (
                <div>
                  <p style={{
                    fontSize: '36px', fontWeight: 900, color: '#000000', margin: '0 0 20px 0'
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
                        border: '2px solid #000000',
                        background: '#ffffff',
                        padding: '14px 16px', fontSize: '18px', fontWeight: 800,
                        color: '#000000', outline: 'none'
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleAnswer}
                      style={{
                        borderRadius: '12px', border: '2px solid #000000', cursor: 'pointer',
                        padding: '14px 24px', fontSize: '16px', fontWeight: 900,
                        background: '#fbbf24',
                        color: '#000000', boxShadow: '3px 3px 0px #000000',
                        transition: 'transform 0.1s'
                      }}
                      onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000000'; }}
                      onMouseUp={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0px #000000'; }}
                    >
                      Go!
                    </button>
                  </div>

                  <div style={{
                    marginTop: '20px', height: '10px', borderRadius: '5px',
                    background: '#e2e8f0', border: '2px solid #000000', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      background: '#fbbf24',
                      transition: 'width 0.5s',
                      width: `${((currentQuestionIdx + 1) / MATH_QUESTIONS.length) * 100}%`
                    }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', fontWeight: 700 }}>
                    Question {currentQuestionIdx + 1} of {MATH_QUESTIONS.length}
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                    <Trophy size={48} style={{ color: '#fbbf24' }} />
                    <Star size={20} style={{
                      color: '#000000', fill: '#fbbf24',
                      position: 'absolute', top: '-8px', right: '-12px'
                    }} />
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#000000', margin: '0 0 8px 0' }}>
                    Awesome!
                  </h3>
                  <p style={{ color: '#475569', fontSize: '15px', margin: '0 0 16px 0', fontWeight: 600 }}>
                    You earned <span style={{ color: '#b45309', fontWeight: 800 }}>{score} points</span>
                  </p>
                  <button
                    onClick={resetGame}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto',
                      padding: '12px 24px', borderRadius: '12px', border: '2px solid #000000', cursor: 'pointer',
                      fontSize: '14px', fontWeight: 800,
                      background: '#ffffff',
                      color: '#000000', boxShadow: '3px 3px 0px #000000'
                    }}
                  >
                    <RefreshCw size={16} /> Play Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grade Championship Standing */}
          <div style={{
            borderRadius: '20px',
            background: '#ffffff',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Trophy size={18} style={{ color: '#fbbf24' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase' }}>
                Grade Championship
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {[
                { rank: '🥇 1st', grade: 'Grade 3', points: '14,250 XP', color: '#fef9c3', border: '#fbbf24' },
                { rank: '🥈 2nd', grade: 'Grade 5', points: '13,100 XP', color: '#f1f5f9', border: '#cbd5e1' },
                { rank: '🥉 3rd', grade: 'Grade 4', points: '11,800 XP', color: '#ffedd5', border: '#fb923c' }
              ].map((g, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: '10px', border: '2px solid #000000',
                  background: g.color
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>{g.rank}</span>
                  <span style={{ fontSize: '13px', fontWeight: 900 }}>{g.grade}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>{g.points}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/dash/student/leaderboard')}
              style={{
                width: '100%', padding: '10px', borderRadius: '12px', border: '2px solid #000000',
                cursor: 'pointer', fontSize: '12px', fontWeight: 900, background: '#fbbf24',
                color: '#000000', boxShadow: '2px 2px 0px #000000', transition: 'transform 0.1s'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translate(1px, 1px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000000'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0px #000000'; }}
            >
              See All Rankings
            </button>
          </div>

          {/* Benefits Card */}
          <div style={{
            borderRadius: '20px',
            background: '#ffffff',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Brain size={18} style={{ color: '#8b5cf6' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#000000', margin: 0, textTransform: 'uppercase' }}>Why Play Games?</h3>
            </div>
            {[
              'Sharpen your problem-solving and critical thinking',
              'Build vocabulary and mathematical fluency',
              'Learn Nigerian & world cultural heritage',
              'Compete with friends on the leaderboard'
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#dcfce7', color: '#15803d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, flexShrink: 0, marginTop: '2px',
                  border: '1.5px solid #000000'
                }}>✓</div>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{text}</p>
              </div>
            ))}
          </div>

          {/* Pro Tip */}
          <div style={{
            borderRadius: '20px',
            background: '#8b5cf6',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              💡 Pro Tip!
            </h3>
            <p style={{ fontSize: '13px', color: '#ffffff', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
              Try Ayò Ọ̀pọ́n to learn about Nigerian culture while sharpening your math skills. Challenge a friend in Monopoly to practice teamwork!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
