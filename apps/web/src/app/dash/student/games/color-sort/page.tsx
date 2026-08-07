'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, RotateCcw, Award, Sparkles, Volume2, VolumeX, HelpCircle, Trophy, Play, CheckCircle2, Flame, Layers
} from 'lucide-react';
import GameLayout from '@/components/games/GameLayout';

type ColorDef = {
  id: string;
  name: string;
  gradient: string;
  borderColor: string;
  glow: string;
};

const COLORS: Record<string, ColorDef> = {
  green: {
    id: 'green',
    name: 'Emerald Green',
    gradient: 'from-emerald-400 to-emerald-600',
    borderColor: '#059669',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    gradient: 'from-purple-500 to-indigo-700',
    borderColor: '#6d28d9',
    glow: 'rgba(147, 51, 234, 0.4)',
  },
  white: {
    id: 'white',
    name: 'Pure White',
    gradient: 'from-slate-100 to-slate-300',
    borderColor: '#94a3b8',
    glow: 'rgba(226, 232, 240, 0.6)',
  },
  blue: {
    id: 'blue',
    name: 'Sapphire Blue',
    gradient: 'from-sky-400 to-blue-600',
    borderColor: '#2563eb',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  red: {
    id: 'red',
    name: 'Ruby Red',
    gradient: 'from-rose-500 to-red-700',
    borderColor: '#b91c1c',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  amber: {
    id: 'amber',
    name: 'Golden Amber',
    gradient: 'from-amber-300 to-amber-500',
    borderColor: '#d97706',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
};

type LevelConfig = {
  level: number;
  pegCapacity: number;
  pegs: string[][]; // Arrays of color keys from bottom to top
};

const LEVELS: LevelConfig[] = [
  {
    level: 1,
    pegCapacity: 4,
    pegs: [
      ['green', 'purple', 'green', 'purple'],
      ['purple', 'green', 'purple', 'green'],
      [],
    ],
  },
  {
    level: 2,
    pegCapacity: 4,
    pegs: [
      ['green', 'white', 'purple', 'green'],
      ['white', 'purple', 'green', 'white'],
      ['purple', 'green', 'white', 'purple'],
      [],
    ],
  },
  {
    level: 3,
    pegCapacity: 4,
    pegs: [
      ['blue', 'red', 'green', 'blue'],
      ['red', 'green', 'blue', 'red'],
      ['green', 'blue', 'red', 'green'],
      [],
      [],
    ],
  },
  {
    level: 4,
    pegCapacity: 4,
    pegs: [
      ['amber', 'purple', 'blue', 'amber'],
      ['purple', 'blue', 'amber', 'purple'],
      ['blue', 'amber', 'purple', 'blue'],
      [],
      [],
    ],
  },
  {
    level: 5,
    pegCapacity: 4,
    pegs: [
      ['green', 'white', 'purple', 'blue'],
      ['red', 'green', 'white', 'purple'],
      ['blue', 'red', 'green', 'white'],
      ['purple', 'blue', 'red', 'amber'],
      [],
      [],
    ],
  },
];

export default function ColorRingSortGame() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [pegs, setPegs] = useState<string[][]>([]);
  const [selectedPegIdx, setSelectedPegIdx] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [history, setHistory] = useState<string[][][]>([]);
  const [score, setScore] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const currentLevelConfig = LEVELS[currentLevelIdx] || LEVELS[0];
  const pegCapacity = currentLevelConfig.pegCapacity;

  // Initialize level
  useEffect(() => {
    loadLevel(currentLevelIdx);
  }, [currentLevelIdx]);

  function loadLevel(idx: number) {
    const config = LEVELS[idx] || LEVELS[0];
    // Deep clone pegs
    const initialPegs = config.pegs.map((peg) => [...peg]);
    setPegs(initialPegs);
    setSelectedPegIdx(null);
    setMoveCount(0);
    setHistory([]);
    setIsLevelComplete(false);
  }

  function playPopSound() {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio fallback
    }
  }

  function playWinSound() {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.25);
      });
    } catch {
      // Audio fallback
    }
  }

  function handlePegClick(pegIdx: number) {
    if (isLevelComplete) return;

    if (selectedPegIdx === null) {
      // Selecting a peg to pick top ring
      if (pegs[pegIdx].length === 0) return; // Cannot select empty peg
      setSelectedPegIdx(pegIdx);
      playPopSound();
    } else if (selectedPegIdx === pegIdx) {
      // Deselect peg
      setSelectedPegIdx(null);
    } else {
      // Move ring from selectedPegIdx to pegIdx
      const sourcePeg = [...pegs[selectedPegIdx]];
      const targetPeg = [...pegs[pegIdx]];

      if (targetPeg.length >= pegCapacity) {
        // Target peg is full
        setSelectedPegIdx(null);
        return;
      }

      const ringToMove = sourcePeg[sourcePeg.length - 1];
      const targetTopRing = targetPeg[targetPeg.length - 1];

      // Rule: Target must be empty OR top ring must match the same color
      if (targetPeg.length > 0 && targetTopRing !== ringToMove) {
        // Invalid move
        setSelectedPegIdx(null);
        return;
      }

      // Execute valid move
      sourcePeg.pop();
      targetPeg.push(ringToMove);

      // Save history for Undo
      setHistory((prev) => [...prev, pegs.map((p) => [...p])]);

      const newPegs = pegs.map((p, i) => {
        if (i === selectedPegIdx) return sourcePeg;
        if (i === pegIdx) return targetPeg;
        return p;
      });

      setPegs(newPegs);
      setSelectedPegIdx(null);
      setMoveCount((m) => m + 1);
      playPopSound();

      // Check level victory
      checkLevelVictory(newPegs);
    }
  }

  function checkLevelVictory(currentPegs: string[][]) {
    const isWon = currentPegs.every((peg) => {
      if (peg.length === 0) return true;
      if (peg.length !== pegCapacity) return false;
      const firstColor = peg[0];
      return peg.every((c) => c === firstColor);
    });

    if (isWon) {
      setIsLevelComplete(true);
      setScore((s) => s + 100 + Math.max(0, 50 - moveCount * 5));
      playWinSound();
    }
  }

  function handleUndo() {
    if (history.length === 0 || isLevelComplete) return;
    const previousPegs = history[history.length - 1];
    setPegs(previousPegs);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setSelectedPegIdx(null);
    setMoveCount((m) => Math.max(0, m - 1));
  }

  function handleNextLevel() {
    if (currentLevelIdx + 1 < LEVELS.length) {
      setCurrentLevelIdx((prev) => prev + 1);
    } else {
      // Loop or finish
      setCurrentLevelIdx(0);
    }
  }

  return (
    <GameLayout title="Color Ring Sort 3D" icon={<Layers className="h-6 w-6 text-purple-600" />}>
      <div className="color-sort-root flex flex-col items-center justify-between min-h-[85vh] p-3 sm:p-6 max-w-5xl mx-auto w-full select-none">
        
        {/* Top Controls Bar */}
        <div className="w-full flex items-center justify-between gap-2 border-[3px] border-dark bg-white rounded-2xl p-3 shadow-[4px_4px_0px_#060E1C]">
          <div className="flex items-center gap-2">
            <Link
              href="/dash/student/games"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-dark bg-yellow text-dark shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all"
              title="Back to Games Hub"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-black text-dark uppercase tracking-tight flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-purple-600" /> Level {currentLevelConfig.level}
              </h1>
              <p className="text-[10px] font-bold text-dark/60 uppercase">Color Sort Tower</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-black text-dark bg-amber-100 border-[2px] border-dark px-2.5 py-1 rounded-xl shadow-[1.5px_1.5px_0px_#060E1C]">
              <Trophy className="h-3.5 w-3.5 text-amber-600" />
              <span>{score} XP</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-dark bg-slate-100 border-[2px] border-dark px-2.5 py-1 rounded-xl shadow-[1.5px_1.5px_0px_#060E1C]">
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              <span>{moveCount} Moves</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0 || isLevelComplete}
              className="inline-flex h-9 px-2.5 items-center justify-center gap-1 rounded-xl border-[2px] border-dark bg-white text-dark text-xs font-black uppercase shadow-[2px_2px_0px_#060E1C] disabled:opacity-40 active:scale-95"
              title="Undo Move"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
            <button
              type="button"
              onClick={() => loadLevel(currentLevelIdx)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-dark bg-slate-100 text-dark shadow-[2px_2px_0px_#060E1C] active:scale-95"
              title="Reset Level"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-dark bg-white text-dark shadow-[2px_2px_0px_#060E1C] active:scale-95"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-rose-500" />}
            </button>
            <button
              type="button"
              onClick={() => setShowHowToPlay(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-dark bg-yellow text-dark shadow-[2px_2px_0px_#060E1C] active:scale-95"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Game Stage Stand & Pegs */}
        <div className="w-full flex-1 flex flex-col items-center justify-center my-6 relative">
          
          {/* Peg Container Grid */}
          <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-8 w-full max-w-4xl px-2">
            {pegs.map((peg, pegIdx) => {
              const isSelected = selectedPegIdx === pegIdx;
              const isFull = peg.length === pegCapacity;
              const isCompletePeg = isFull && peg.every((c) => c === peg[0]);

              return (
                <div
                  key={`peg-${pegIdx}`}
                  onClick={() => handlePegClick(pegIdx)}
                  className={`relative cursor-pointer flex flex-col items-center group transition-all duration-200 ${
                    isSelected ? '-translate-y-2' : 'hover:-translate-y-1'
                  }`}
                >
                  {/* Floating Lifted Ring when Selected */}
                  <div className="h-12 w-full flex items-center justify-center mb-1">
                    {isSelected && peg.length > 0 && (
                      <div
                        className={`w-14 sm:w-20 h-6 sm:h-8 rounded-full bg-gradient-to-r ${COLORS[peg[peg.length - 1]]?.gradient} border-[3px] border-dark shadow-[0px_8px_16px_rgba(0,0,0,0.3)] animate-bounce flex items-center justify-center`}
                      >
                        <div className="w-4 sm:w-6 h-2 rounded-full bg-white/40" />
                      </div>
                    )}
                  </div>

                  {/* Vertical Metal Pole */}
                  <div className="relative flex flex-col items-center justify-end w-16 sm:w-24 h-52 sm:h-64 rounded-b-xl border-[3px] border-dark bg-slate-200/90 shadow-[inset_0px_0px_10px_rgba(0,0,0,0.1)] p-1">
                    {/* Metal Pole Bar */}
                    <div className="absolute inset-y-0 w-3 sm:w-4 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-t-full border-x border-dark shadow-inner -z-0" />

                    {/* Stacked Rings (Rendered bottom to top) */}
                    <div className="w-full flex flex-col-reverse items-center gap-1 z-10">
                      {peg.map((colorKey, ringIdx) => {
                        const isTopRing = ringIdx === peg.length - 1;
                        const isLifted = isSelected && isTopRing;
                        if (isLifted) return null; // Rendered in floating area

                        const colDef = COLORS[colorKey] || COLORS.green;

                        return (
                          <div
                            key={`ring-${pegIdx}-${ringIdx}`}
                            className={`w-14 sm:w-20 h-8 sm:h-10 rounded-2xl bg-gradient-to-r ${colDef.gradient} border-[3px] border-dark shadow-[2px_3px_0px_#060E1C] flex items-center justify-center transition-all duration-300 transform`}
                            style={{
                              boxShadow: `0px 4px 10px ${colDef.glow}, 2px 3px 0px #060E1C`,
                            }}
                          >
                            {/* 3D Ring Inner Hole Accent */}
                            <div className="w-5 sm:w-7 h-2.5 sm:h-3 rounded-full bg-dark/20 border border-white/30 flex items-center justify-center">
                              <div className="w-2 sm:w-3 h-1 rounded-full bg-white/50" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Wooden Stand Base Plate */}
                  <div
                    className={`w-20 sm:w-28 h-5 sm:h-6 rounded-xl border-[3px] border-dark mt-1 shadow-[3px_3px_0px_#060E1C] flex items-center justify-center font-black text-[10px] uppercase transition-all ${
                      isCompletePeg
                        ? 'bg-emerald-400 text-dark shadow-[0px_0px_12px_#10b981]'
                        : isSelected
                        ? 'bg-yellow text-dark'
                        : 'bg-amber-800 text-white'
                    }`}
                  >
                    {isCompletePeg ? <CheckCircle2 className="h-3.5 w-3.5 text-dark" /> : `Peg ${pegIdx + 1}`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Platform Wooden Board */}
          <div className="w-full max-w-4xl h-5 sm:h-7 rounded-2xl border-[4px] border-dark bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 shadow-[6px_6px_0px_#060E1C] mt-2" />
        </div>

        {/* Level Complete Victory Overlay Modal */}
        {isLevelComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in duration-200">
            <div className="border-[4px] border-dark bg-white rounded-[28px] p-6 sm:p-8 max-w-md w-full text-center shadow-[12px_12px_0px_#060E1C] space-y-5">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-dark bg-yellow shadow-[4px_4px_0px_#060E1C] text-dark">
                <Sparkles className="h-8 w-8 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-dark uppercase tracking-tight">Level Complete! 🎉</h2>
                <p className="text-xs font-bold text-dark/60 mt-1 uppercase">You sorted all color rings perfectly!</p>
              </div>
              <div className="border-[3px] border-dark bg-amber-50 rounded-2xl p-4 flex justify-around">
                <div>
                  <p className="text-[10px] font-black uppercase text-dark/60">Moves Used</p>
                  <p className="text-xl font-black text-dark">{moveCount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-dark/60">Total Score</p>
                  <p className="text-xl font-black text-emerald-600">+{score} XP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNextLevel}
                className="w-full py-3.5 rounded-2xl border-[3px] border-dark bg-yellow hover:bg-yellow/90 text-dark font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_#060E1C] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 fill-current" /> Next Level
              </button>
            </div>
          </div>
        )}

        {/* How to Play Modal */}
        {showHowToPlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="border-[4px] border-dark bg-white rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-[12px_12px_0px_#060E1C] space-y-4">
              <div className="flex items-center justify-between border-b-[3px] border-dark pb-3">
                <h3 className="text-lg font-black text-dark uppercase flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-yellow" /> How to Play Color Ring Sort
                </h3>
                <button
                  type="button"
                  onClick={() => setShowHowToPlay(false)}
                  className="rounded-lg border-[2px] border-dark bg-rose-100 p-1 text-dark"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3 text-xs font-semibold text-dark/80 leading-relaxed">
                <p>1. <strong>Tap any peg</strong> to lift the top color ring into the air.</p>
                <p>2. <strong>Tap another peg</strong> to move the ring onto that peg.</p>
                <p>3. You can only place a ring on an <strong>empty peg</strong> OR on top of a ring of the <strong>SAME color</strong>.</p>
                <p>4. Sort all matching colors onto their own dedicated pegs to win the level!</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHowToPlay(false)}
                className="w-full py-3 rounded-xl border-[3px] border-dark bg-yellow text-dark font-black uppercase tracking-wider text-xs shadow-[3px_3px_0px_#060E1C]"
              >
                Got It, Let's Play!
              </button>
            </div>
          </div>
        )}

        {/* Mobile Responsive Layout Styles */}
        <style jsx global>{`
          @media (max-width: 640px) {
            .color-sort-root {
              padding-left: 0.5rem;
              padding-right: 0.5rem;
            }
          }
        `}</style>
      </div>
    </GameLayout>
  );
}
