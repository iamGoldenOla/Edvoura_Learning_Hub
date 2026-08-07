'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Grid3X3, Edit2, HelpCircle, RefreshCw, Trophy, BookOpen, Volume2, CheckCircle, AlertCircle } from 'lucide-react';

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

function playSudokuSFX(type: 'click' | 'correct' | 'error' | 'win' | 'hint') {
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
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
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
      osc.frequency.setValueAtTime(180, ctx.currentTime);
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
    } else if (type === 'hint') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
}

/* ═══════════════════════ SUDOKU GENERATOR ═══════════════════════ */
const shuffle = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const isSafe = (board: number[][], row: number, col: number, num: number) => {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
    if (board[x][col] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
};

const solve = (board: number[][]): boolean => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        for (let c = 1; c <= 9; c++) {
          if (isSafe(board, i, j, c)) {
            board[i][j] = c;
            if (solve(board)) return true;
            board[i][j] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const fillDiagonal = (board: number[][]) => {
  for (let i = 0; i < 9; i += 3) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(nums);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        board[i + r][i + c] = nums[idx++];
      }
    }
  }
};

const generateSudoku = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
  const board = Array(9).fill(null).map(() => Array(9).fill(0));
  fillDiagonal(board);
  solve(board);
  const solution = board.map(row => [...row]);
  
  const clues = difficulty === 'Easy' ? 38 : difficulty === 'Medium' ? 30 : 24;
  let attempts = 81 - clues;
  const puzzle = board.map(row => [...row]);
  
  while (attempts > 0) {
    let r = Math.floor(Math.random() * 9);
    let c = Math.floor(Math.random() * 9);
    while (puzzle[r][c] === 0) {
      r = Math.floor(Math.random() * 9);
      c = Math.floor(Math.random() * 9);
    }
    puzzle[r][c] = 0;
    attempts--;
  }
  
  return { solution, puzzle };
};

export default function SudokuGame() {
  const [solution, setSolution] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [board, setBoard] = useState<number[][]>([]);
  const [pencilMarks, setPencilMarks] = useState<Set<number>[][]>([]);
  
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [pencilMode, setPencilMode] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'rules' | 'how-to-play' | 'strategy'>('rules');

  const initGame = useCallback((diff: 'Easy' | 'Medium' | 'Hard') => {
    const { solution, puzzle } = generateSudoku(diff);
    setSolution(solution);
    setInitialBoard(puzzle.map(row => [...row]));
    setBoard(puzzle.map(row => [...row]));
    
    const marks: Set<number>[][] = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => new Set<number>())
    );
    setPencilMarks(marks);
    setSelectedCell(null);
    setGameOver(false);
    setTimeElapsed(0);
    speakVoice(`${diff} Sudoku puzzle generated.`);
  }, []);

  useEffect(() => {
    initGame(difficulty);
  }, [difficulty, initGame]);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  const checkVictory = (currentBoard: number[][]) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] !== solution[r][c]) return false;
      }
    }
    return true;
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameOver) return;
    const { r, c } = selectedCell;
    
    if (initialBoard[r][c] !== 0) return;

    if (pencilMode) {
      playSudokuSFX('click');
      const newMarks = pencilMarks.map((row, ri) => 
        row.map((cell, ci) => {
          if (ri === r && ci === c) {
            const next = new Set(cell);
            if (next.has(num)) next.delete(num);
            else next.add(num);
            return next;
          }
          return cell;
        })
      );
      setPencilMarks(newMarks);
      return;
    }

    const newBoard = board.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? num : cell))
    );
    setBoard(newBoard);

    if (num === solution[r][c]) {
      playSudokuSFX('correct');
      setScore(s => s + 10);
      if (checkVictory(newBoard)) {
        setGameOver(true);
        playSudokuSFX('win');
        speakVoice('Congratulations! Sudoku puzzle successfully solved!');
      }
    } else {
      playSudokuSFX('error');
      speakVoice('Incorrect number!');
    }
  };

  const handleClearCell = () => {
    if (!selectedCell || gameOver) return;
    const { r, c } = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    playSudokuSFX('click');
    const newBoard = board.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? 0 : cell))
    );
    setBoard(newBoard);
  };

  const getHint = () => {
    if (gameOver) return;
    playSudokuSFX('hint');
    const emptyCells: {r: number, c: number}[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== solution[r][c]) {
          emptyCells.push({r, c});
        }
      }
    }

    if (emptyCells.length > 0) {
      const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const correctVal = solution[target.r][target.c];
      
      const newBoard = board.map((row, ri) =>
        row.map((cell, ci) => (ri === target.r && ci === target.c ? correctVal : cell))
      );
      setBoard(newBoard);
      setSelectedCell(target);
      speakVoice(`Hint revealed number ${correctVal}.`);

      if (checkVictory(newBoard)) {
        setGameOver(true);
        playSudokuSFX('win');
        speakVoice('Congratulations! Sudoku solved!');
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <GameLayout
      title="Sudoku 9x9"
      icon={<Grid3X3 style={{ width: '24px', height: '24px' }} />}
      accentColor="#3b82f6"
      score={score}
      fullscreen={true}
    >
      {/* Widescreen 16:9 Zero-Scroll Layout */}
      <div className="sudoku-main-layout" style={{
        display: 'flex', alignItems: 'stretch', height: '100%',
        overflow: 'hidden', padding: '6px', gap: '10px', boxSizing: 'border-box'
      }}>
        <style jsx global>{`
          @media (max-width: 768px) {
            .sudoku-main-layout {
              flex-direction: column !important;
              align-items: center !important;
              overflow-y: auto !important;
              padding: 4px !important;
              gap: 8px !important;
            }
            .sudoku-side-panel {
              width: 100% !important;
              flex: none !important;
            }
            .sudoku-board-wrapper {
              width: 100% !important;
              max-width: min(92vw, 44vh) !important;
              height: auto !important;
              aspect-ratio: 1 / 1 !important;
              flex: none !important;
            }
          }
        `}</style>
        
        {/* ─── LEFT PANEL: CONTROLS & STATUS ─── */}
        <div className="sudoku-side-panel" style={{
          flex: '0 0 200px', width: '200px', display: 'flex', flexDirection: 'column', gap: '8px',
          overflow: 'hidden'
        }}>
          {/* Difficulty Selection */}
          <div style={{
            background: '#111827', border: '2px solid #1e293b', borderRadius: '12px',
            padding: '8px 10px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Difficulty</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    flex: 1, padding: '5px 2px', borderRadius: '6px', border: '1.5px solid #000',
                    fontSize: '10px', fontWeight: 900, cursor: 'pointer',
                    background: difficulty === d ? '#3b82f6' : '#1e293b',
                    color: '#fff'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Game Stats Card */}
          <div style={{
            padding: '10px 12px', borderRadius: '12px', background: '#111827', border: '2px solid #1e293b'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>⏱ Time: <span style={{ color: '#fff', fontFamily: 'monospace' }}>{formatTime(timeElapsed)}</span></div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginTop: '4px' }}>🏆 Score: <span style={{ color: '#3b82f6' }}>{score} pts</span></div>
          </div>

          {/* Quick Action Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setPencilMode(!pencilMode)}
              style={{
                padding: '8px', borderRadius: '8px', border: '2px solid #000',
                background: pencilMode ? '#fbbf24' : '#1e293b',
                color: pencilMode ? '#000' : '#fff', fontWeight: 900, fontSize: '11px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <Edit2 size={14} /> {pencilMode ? 'Pencil Mode ON' : 'Pencil Mode OFF'}
            </button>

            <button
              onClick={getHint}
              style={{
                padding: '8px', borderRadius: '8px', border: '2px solid #000',
                background: '#8b5cf6', color: '#fff', fontWeight: 900, fontSize: '11px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: '2px 2px 0 #000'
              }}
            >
              <HelpCircle size={14} /> Get Hint
            </button>

            <button
              onClick={() => setShowRulesModal(true)}
              style={{
                padding: '8px', borderRadius: '8px', border: '2px solid #000',
                background: '#38bdf8', color: '#000', fontWeight: 900, fontSize: '11px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: '2px 2px 0 #000'
              }}
            >
              <BookOpen size={14} /> Rules & Guide
            </button>
          </div>
        </div>

        {/* ─── CENTER AREA: DYNAMIC 1:1 SUDOKU GRID BOARD ─── */}
        <div className="sudoku-board-wrapper" style={{
          flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', maxWidth: '100%', aspectRatio: '1 / 1',
            borderRadius: '16px', padding: '2px', boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'
          }}>
            <div style={{
              width: '100%', height: '100%',
              display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gridTemplateRows: 'repeat(9, 1fr)',
              border: '3px solid #000000', borderRadius: '10px', overflow: 'hidden', background: '#000000',
              boxShadow: '4px 4px 0px #000000'
            }}>
              {board.map((row, r) =>
                row.map((val, c) => {
                  const isInitial = initialBoard[r][c] !== 0;
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  const isSameRowCol = selectedCell && (selectedCell.r === r || selectedCell.c === c);
                  const isSameBox = selectedCell && Math.floor(selectedCell.r / 3) === Math.floor(r / 3) && Math.floor(selectedCell.c / 3) === Math.floor(c / 3);
                  const isWrong = val !== 0 && !isInitial && val !== solution[r][c];

                  const borderRight = (c + 1) % 3 === 0 && c < 8 ? '2px solid #000' : '1px solid #334155';
                  const borderBottom = (r + 1) % 3 === 0 && r < 8 ? '2px solid #000' : '1px solid #334155';

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => { playSudokuSFX('click'); setSelectedCell({ r, c }); }}
                      style={{
                        background: isWrong
                          ? '#ef4444'
                          : isSelected
                          ? '#f59e0b'
                          : isSameRowCol || isSameBox
                          ? '#1e293b'
                          : '#0b0f19',
                        color: isWrong ? '#ffffff' : isInitial ? '#38bdf8' : '#ffffff',
                        fontWeight: isInitial ? 900 : 700,
                        fontSize: 'calc(min(100vw, 100vh) / 22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', borderRight, borderBottom, userSelect: 'none'
                      }}
                    >
                      {val !== 0 ? val : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', width: '80%', height: '80%' }}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(pm => (
                            <span key={pm} style={{ fontSize: '9px', color: '#94a3b8', textAlign: 'center' }}>
                              {pencilMarks[r]?.[c]?.has(pm) ? pm : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: NUMBER PAD CONTROLS ─── */}
        <div className="sudoku-side-panel" style={{
          flex: '0 0 160px', width: '160px', display: 'flex', flexDirection: 'column', gap: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Number Pad</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                style={{
                  height: '46px', borderRadius: '8px', border: '2px solid #000',
                  fontSize: '18px', fontWeight: 900, cursor: 'pointer',
                  background: '#ffffff', color: '#000000', boxShadow: '2px 2px 0 #000'
                }}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={handleClearCell}
            style={{
              padding: '10px', borderRadius: '8px', border: '2px solid #000',
              background: '#fee2e2', color: '#ef4444', fontWeight: 900, fontSize: '11px',
              cursor: 'pointer', boxShadow: '2px 2px 0 #000', marginTop: 'auto'
            }}
          >
            Clear Cell
          </button>
          
          <button
            onClick={() => initGame(difficulty)}
            style={{
              padding: '10px', borderRadius: '8px', border: '2px solid #000',
              background: '#f97316', color: '#fff', fontWeight: 900, fontSize: '11px',
              cursor: 'pointer', boxShadow: '2px 2px 0 #000'
            }}
          >
            <RefreshCw size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} /> New Game
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 950, color: '#3b82f6' }}>
                <BookOpen size={24} /> Sudoku Rules & Guide
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1.5px solid #000' }}>
              <button onClick={() => setActiveModalTab('rules')} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'rules' ? '#3b82f6' : 'transparent', color: activeModalTab === 'rules' ? '#fff' : '#475569' }}>
                📜 Rules
              </button>
              <button onClick={() => setActiveModalTab('how-to-play')} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'how-to-play' ? '#3b82f6' : 'transparent', color: activeModalTab === 'how-to-play' ? '#fff' : '#475569' }}>
                🎮 How to Play
              </button>
              <button onClick={() => setActiveModalTab('strategy')} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'strategy' ? '#3b82f6' : 'transparent', color: activeModalTab === 'strategy' ? '#fff' : '#475569' }}>
                💡 Strategy
              </button>
            </div>

            {activeModalTab === 'rules' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0' }}>Sudoku Goal:</h4>
                <p style={{ margin: '0 0 8px 0' }}>Fill the 9x9 grid so every row, column, and 3x3 box contains digits 1-9 without repeating.</p>
              </div>
            )}

            {activeModalTab === 'how-to-play' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0' }}>Controls:</h4>
                <ol style={{ paddingLeft: '18px', margin: '0' }}>
                  <li>Click any cell on the grid.</li>
                  <li>Click a number 1-9 from the number pad.</li>
                  <li>Use Pencil Mode to take notes.</li>
                </ol>
              </div>
            )}

            {activeModalTab === 'strategy' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0' }}>Pro Tip:</h4>
                <p style={{ margin: '0' }}>Look for rows, columns, or 3x3 boxes that already have 7 or 8 numbers filled in first!</p>
              </div>
            )}

            <button
              onClick={() => setShowRulesModal(false)}
              style={{ width: '100%', padding: '10px', background: '#3b82f6', color: '#fff', border: '2px solid #000', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', marginTop: '12px' }}
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
