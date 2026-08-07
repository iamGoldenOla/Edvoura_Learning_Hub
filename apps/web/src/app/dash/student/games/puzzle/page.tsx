'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Puzzle, RefreshCw, Eye, BookOpen, Trophy, Sparkles, Award, Layers, Share2, Check } from 'lucide-react';

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

function playPuzzleSFX(type: 'slide' | 'win' | 'peek') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'slide') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'peek') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
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

/* ═══════════════════════ PUZZLE THEMES (SOLID FLAT COLORS) ═══════════════════════ */
const PUZZLE_THEMES = [
  {
    id: 'solar', name: '🪐 Solar System', color: '#8b5cf6',
    bgIcon: '🪐',
    fact: 'Jupiter is the largest planet in our Solar System and has 95 known moons!'
  },
  {
    id: 'africa', name: '🦁 African Wildlife', color: '#f59e0b',
    bgIcon: '🦁',
    fact: 'The African Elephant is the world’s largest land animal, weighing up to 6 tons!'
  },
  {
    id: 'biology', name: '🧬 Human Anatomy', color: '#ef4444',
    bgIcon: '🧬',
    fact: 'The human heart beats about 100,000 times a day to pump blood throughout the body!'
  },
  {
    id: 'geo', name: '🌍 World Geography', color: '#22c55e',
    bgIcon: '🌍',
    fact: 'Mount Everest is the highest mountain peak in the world at 8,848 meters!'
  },
  {
    id: 'history', name: '🏛️ Ancient History', color: '#38bdf8',
    bgIcon: '🏛️',
    fact: 'The Great Pyramid of Giza was built over 4,500 years ago in Egypt!'
  },
];

export default function PuzzleGame() {
  const [studentGrade, setStudentGrade] = useState<'g12' | 'g36' | 'g712'>('g36');
  const [gradeTier, setGradeTier] = useState<'g12' | 'g36' | 'g712'>('g36');
  const [selectedTheme, setSelectedTheme] = useState(PUZZLE_THEMES[0]);
  
  // Grid Dimensions: G1-2 = 3x3, G3-6 = 4x4, G7-12 = 5x5
  const gridSize = gradeTier === 'g12' ? 3 : gradeTier === 'g36' ? 4 : 5;
  const totalTiles = gridSize * gridSize;

  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'rules' | 'how-to-play' | 'fact'>('rules');
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize and shuffle puzzle tiles
  const initPuzzle = useCallback(() => {
    const arr = Array.from({ length: totalTiles }, (_, i) => i);
    
    // Solvable shuffle algorithm
    let shuffled = [...arr];
    for (let i = shuffled.length - 2; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setTiles(shuffled);
    setMoves(0);
    setTimeElapsed(0);
    setIsSolved(false);
    setShowPreview(false);

    const gradeLabel = gradeTier === 'g12' ? 'Grade 1 to 2' : gradeTier === 'g36' ? 'Grade 3 to 6' : 'Grade 7 to 12';
    speakVoice(`${selectedTheme.name} puzzle initialized for ${gradeLabel}. Good luck!`);
  }, [totalTiles, gradeTier, selectedTheme]);

  useEffect(() => {
    initPuzzle();
  }, [gradeTier, selectedTheme, initPuzzle]);

  useEffect(() => {
    if (isSolved) return;
    const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isSolved]);

  const checkVictory = (currentTiles: number[]) => {
    for (let i = 0; i < currentTiles.length; i++) {
      if (currentTiles[i] !== i) return false;
    }
    return true;
  };

  const handleTileClick = (index: number) => {
    if (isSolved) return;

    const emptyIdx = tiles.indexOf(totalTiles - 1);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIdx / gridSize);
    const emptyCol = emptyIdx % gridSize;

    const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) || (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      playPuzzleSFX('slide');
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
      setTiles(newTiles);
      setMoves(m => m + 1);

      if (checkVictory(newTiles)) {
        setIsSolved(true);
        playPuzzleSFX('win');
        speakVoice(`Fantastic! ${selectedTheme.name} puzzle solved in ${moves + 1} moves!`);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    playPuzzleSFX('peek');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <GameLayout
      title="Educational Sliding Puzzle"
      icon={<Puzzle style={{ width: '24px', height: '24px' }} />}
      accentColor={selectedTheme.color}
      fullscreen={true}
    >
      {/* 16:9 Zero-Scroll Widescreen Layout */}
      <div className="puz-main-layout" style={{
        display: 'flex', alignItems: 'stretch', height: '100%',
        overflow: 'hidden', padding: '6px', gap: '10px', boxSizing: 'border-box'
      }}>
        <style jsx global>{`
          @media (max-width: 768px) {
            .puz-main-layout {
              flex-direction: column !important;
              align-items: center !important;
              overflow-y: auto !important;
              padding: 4px !important;
              gap: 8px !important;
            }
            .puz-side-panel {
              width: 100% !important;
              flex: none !important;
            }
            .puz-board-wrapper {
              width: 100% !important;
              max-width: min(92vw, 44vh) !important;
              height: auto !important;
              aspect-ratio: 1 / 1 !important;
              flex: none !important;
            }
          }
        `}</style>
        
        {/* ─── LEFT SIDEBAR: GRADE TIER & THEME SELECTOR ─── */}
        <div className="puz-side-panel" style={{
          flex: '0 0 220px', width: '220px', display: 'flex', flexDirection: 'column', gap: '8px',
          overflow: 'hidden'
        }}>
          {/* Grade Level Selection */}
          <div style={{ background: '#111827', border: '2px solid #1e293b', borderRadius: '12px', padding: '8px 10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '6px' }}>
              🎓 Grade Tier (Locked to Student Level)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'g12', label: 'Grade 1 - 2 (3×3 Big Tiles)', grid: '3×3' },
                { id: 'g36', label: 'Grade 3 - 6 (4×4 Medium)', grid: '4×4' },
                { id: 'g712', label: 'Grade 7 - 12 (5×5 Challenge)', grid: '5×5' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGradeTier(g.id as any);
                    setStudentGrade(g.id as any);
                  }}
                  style={{
                    padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #000',
                    fontSize: '10px', fontWeight: 900, cursor: 'pointer', textAlign: 'left',
                    background: gradeTier === g.id ? selectedTheme.color : '#1e293b',
                    color: '#ffffff', boxShadow: gradeTier === g.id ? '2px 2px 0 #000' : 'none'
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Theme Selector */}
          <div style={{ background: '#111827', border: '2px solid #1e293b', borderRadius: '12px', padding: '8px 10px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              📚 Solid Themes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {PUZZLE_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  style={{
                    padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #000',
                    fontSize: '10px', fontWeight: 900, cursor: 'pointer', textAlign: 'left',
                    background: selectedTheme.id === theme.id ? theme.color : '#1e293b',
                    color: '#ffffff',
                    boxShadow: selectedTheme.id === theme.id ? '2px 2px 0 #000' : 'none'
                  }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={copyInviteLink}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #000',
                background: copiedLink ? '#22c55e' : '#fbbf24', color: '#000',
                fontWeight: 900, fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              {copiedLink ? <Check size={12} /> : <Share2 size={12} />}
              {copiedLink ? 'Link Copied!' : 'Share Challenge'}
            </button>

            <button
              onClick={() => setShowRulesModal(true)}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #000',
                background: '#38bdf8', color: '#000', fontWeight: 900, fontSize: '10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              <BookOpen size={12} /> Rules & Facts
            </button>
          </div>
        </div>

        {/* ─── CENTER AREA: BIGGER & COLOURFUL 1:1 SLIDING PUZZLE CANVAS ─── */}
        <div className="puz-board-wrapper" style={{
          flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          {/* Header Stats Bar */}
          <div style={{
            display: 'flex', gap: '16px', alignItems: 'center', background: '#111827',
            padding: '4px 16px', borderRadius: '10px', border: '1.5px solid #1e293b', marginBottom: '6px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#e2e8f0' }}>
              ⏱ Time: <span style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{formatTime(timeElapsed)}</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#e2e8f0' }}>
              👟 Moves: <span style={{ color: selectedTheme.color }}>{moves}</span>
            </div>
            <button
              onClick={() => { playPuzzleSFX('peek'); setShowPreview(!showPreview); }}
              style={{
                padding: '3px 8px', borderRadius: '6px', border: '1px solid #000',
                fontSize: '10px', fontWeight: 900, background: '#ffffff', color: '#000',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
              }}
            >
              <Eye size={11} /> {showPreview ? 'Hide Preview' : 'Peek Solution'}
            </button>
          </div>

          {/* Puzzle Canvas Grid — Expanded Size */}
          <div style={{
            height: 'calc(100% - 34px)', maxWidth: '100%', aspectRatio: '1 / 1',
            borderRadius: '16px', padding: '2px', boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: '100%', height: '100%',
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              gap: '4px', border: '3px solid #000000', borderRadius: '14px',
              overflow: 'hidden', background: '#0b0f19', boxShadow: '6px 6px 0px #000000',
              position: 'relative'
            }}>
              {tiles.map((tileVal, idx) => {
                const isEmpty = tileVal === totalTiles - 1 && !isSolved;
                const targetRow = Math.floor(tileVal / gridSize);
                const targetCol = tileVal % gridSize;

                return (
                  <div
                    key={idx}
                    onClick={() => handleTileClick(idx)}
                    style={{
                      background: isEmpty ? '#0f172a' : selectedTheme.color,
                      border: isEmpty ? 'none' : '2.5px solid #000000',
                      borderRadius: '10px',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: isEmpty || isSolved ? 'default' : 'pointer',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: isEmpty ? 'none' : '3px 3px 0px #000000',
                      color: '#ffffff', fontWeight: 950,
                      position: 'relative', overflow: 'hidden'
                    }}
                  >
                    {!isEmpty && (
                      <>
                        <div style={{ fontSize: '32px' }}>
                          {selectedTheme.bgIcon}
                        </div>
                        <span style={{ fontSize: `calc(min(100vw, 100vh) / ${gridSize * 3.5})`, lineHeight: 1 }}>
                          {tileVal + 1}
                        </span>
                        <div style={{ position: 'absolute', bottom: '3px', right: '5px', fontSize: '9px', fontWeight: 900, opacity: 0.85, background: '#000000', padding: '1px 4px', borderRadius: '4px' }}>
                          r{targetRow + 1}c{targetCol + 1}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Solution Preview Overlay */}
              {showPreview && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(11, 15, 25, 0.92)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '16px', textAlign: 'center', zIndex: 10
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{selectedTheme.name.split(' ')[0]}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: selectedTheme.color, margin: '0 0 6px 0' }}>
                    {selectedTheme.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#e2e8f0', maxWidth: '280px', lineHeight: 1.5 }}>
                    {selectedTheme.fact}
                  </p>
                  <button
                    onClick={() => setShowPreview(false)}
                    style={{ marginTop: '12px', padding: '6px 14px', background: '#ffffff', color: '#000', border: '2px solid #000', borderRadius: '8px', fontWeight: 900, fontSize: '11px', cursor: 'pointer' }}
                  >
                    Back to Game
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: FACT BADGE & RESTART ─── */}
        <div style={{
          flex: '0 0 200px', width: '200px', display: 'flex', flexDirection: 'column', gap: '8px',
          overflow: 'hidden'
        }}>
          {/* Solved Victory Box */}
          {isSolved ? (
            <div style={{
              padding: '14px', borderRadius: '12px', background: '#dcfce7', border: '2px solid #000',
              textAlign: 'center', color: '#000'
            }}>
              <div style={{ fontSize: '28px' }}>🏆</div>
              <h4 style={{ fontSize: '14px', fontWeight: 950, color: '#16a34a', margin: '4px 0' }}>Puzzle Solved!</h4>
              <p style={{ fontSize: '11px', fontWeight: 700, margin: 0 }}>Completed in {moves} moves & {formatTime(timeElapsed)}!</p>
            </div>
          ) : (
            <div style={{
              padding: '10px 12px', borderRadius: '12px', background: '#111827', border: '2px solid #1e293b',
              flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 900, color: selectedTheme.color, textTransform: 'uppercase', marginBottom: '4px' }}>
                💡 Did You Know?
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5, fontWeight: 600, margin: 0 }}>
                {selectedTheme.fact}
              </p>
            </div>
          )}

          <button
            onClick={initPuzzle}
            style={{
              padding: '10px', background: selectedTheme.color, color: '#fff', border: '2px solid #000',
              borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: '2px 2px 0 #000', marginTop: 'auto'
            }}
          >
            <RefreshCw size={14} /> Restart Puzzle
          </button>
        </div>
      </div>

      {/* Rules & Guide Modal */}
      {showRulesModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '3px solid #000',
            padding: '24px', width: '460px', maxHeight: '82vh', overflowY: 'auto',
            boxShadow: '8px 8px 0 #000', color: '#000'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 950, color: selectedTheme.color }}>
                <BookOpen size={24} /> Sliding Puzzle Guide
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1.5px solid #000' }}>
              <button onClick={() => setActiveModalTab('rules')} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'rules' ? selectedTheme.color : 'transparent', color: activeModalTab === 'rules' ? '#fff' : '#475569' }}>
                📜 Rules
              </button>
              <button onClick={() => setActiveModalTab('how-to-play')} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'how-to-play' ? selectedTheme.color : 'transparent', color: activeModalTab === 'how-to-play' ? '#fff' : '#475569' }}>
                🎮 How to Play
              </button>
              <button onClick={() => setActiveModalTab('fact')} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'fact' ? selectedTheme.color : 'transparent', color: activeModalTab === 'fact' ? '#fff' : '#475569' }}>
                💡 Educational Fact
              </button>
            </div>

            {activeModalTab === 'rules' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0' }}>Grade Tiers:</h4>
                <ul style={{ paddingLeft: '18px', margin: 0 }}>
                  <li><strong>Grade 1 - 2</strong>: 3×3 Grid (9 tiles) — Beginner.</li>
                  <li><strong>Grade 3 - 6</strong>: 4×4 Grid (16 tiles) — Intermediate.</li>
                  <li><strong>Grade 7 - 12</strong>: 5×5 Grid (25 tiles) — Advanced Scholar Challenge!</li>
                </ul>
              </div>
            )}

            {activeModalTab === 'how-to-play' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0' }}>Controls:</h4>
                <ol style={{ paddingLeft: '18px', margin: 0 }}>
                  <li>Click any tile adjacent to the empty dark square to slide it.</li>
                  <li>Arrange numbers 1 to N in ascending order to solve the puzzle.</li>
                  <li>Use 'Peek Solution' to view the educational fact & reference!</li>
                </ol>
              </div>
            )}

            {activeModalTab === 'fact' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0' }}>{selectedTheme.name}:</h4>
                <p style={{ margin: 0 }}>{selectedTheme.fact}</p>
              </div>
            )}

            <button
              onClick={() => setShowRulesModal(false)}
              style={{ width: '100%', padding: '10px', background: selectedTheme.color, color: '#fff', border: '2px solid #000', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', marginTop: '14px' }}
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
