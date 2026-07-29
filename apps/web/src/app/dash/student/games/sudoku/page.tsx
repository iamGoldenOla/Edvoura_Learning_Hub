'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Grid3X3, Edit2, HelpCircle, RefreshCw, Trophy, Settings } from 'lucide-react';

// --- Sudoku Logic ---
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
  
  const clues = difficulty === 'Easy' ? 35 : difficulty === 'Medium' ? 28 : 22;
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

// --- Component ---
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

  const initGame = useCallback((diff: 'Easy' | 'Medium' | 'Hard') => {
    const { solution, puzzle } = generateSudoku(diff);
    setSolution(solution);
    setInitialBoard(puzzle);
    setBoard(puzzle.map(row => [...row]));
    
    const marks = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>()));
    setPencilMarks(marks);
    
    setSelectedCell(null);
    setGameOver(false);
    setTimeElapsed(0);
    setScore(0);
  }, []);

  useEffect(() => {
    initGame(difficulty);
  }, [difficulty, initGame]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!gameOver && board.length > 0) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameOver, board]);

  const checkWin = (currentBoard: number[][]) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] === 0 || currentBoard[r][c] !== solution[r][c]) {
          return false;
        }
      }
    }
    return true;
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameOver) return;
    setSelectedCell({ r, c });
  };

  const handleNumberInput = (num: number) => {
    if (gameOver || !selectedCell) return;
    const { r, c } = selectedCell;
    
    if (initialBoard[r][c] !== 0) return; // Cannot edit given cells

    if (pencilMode) {
      const newMarks = [...pencilMarks];
      const cellMarks = new Set(newMarks[r][c]);
      if (cellMarks.has(num)) {
        cellMarks.delete(num);
      } else {
        cellMarks.add(num);
      }
      newMarks[r][c] = cellMarks;
      setPencilMarks(newMarks);
      
      // Clear main number if pencil marking
      if (board[r][c] !== 0) {
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = 0;
        setBoard(newBoard);
      }
    } else {
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = board[r][c] === num ? 0 : num; // Toggle off if same number
      setBoard(newBoard);
      
      if (newBoard[r][c] !== 0 && newBoard[r][c] === solution[r][c]) {
        setScore(prev => prev + 10);
      }
      
      if (checkWin(newBoard)) {
        setGameOver(true);
      }
    }
  };

  const handleHint = () => {
    if (gameOver) return;
    const emptyCells: {r: number, c: number}[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0 || board[r][c] !== solution[r][c]) {
          if (initialBoard[r][c] === 0) {
            emptyCells.push({ r, c });
          }
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const { r, c } = randomCell;
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = solution[r][c];
      setBoard(newBoard);
      setScore(prev => Math.max(0, prev - 5)); // Penalty for hint
      
      if (checkWin(newBoard)) {
        setGameOver(true);
      }
    }
  };

  const isRelatedCell = (r: number, c: number) => {
    if (!selectedCell) return false;
    const sameRow = selectedCell.r === r;
    const sameCol = selectedCell.c === c;
    const sameBox = Math.floor(selectedCell.r / 3) === Math.floor(r / 3) && 
                    Math.floor(selectedCell.c / 3) === Math.floor(c / 3);
    return sameRow || sameCol || sameBox;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (board.length === 0) return null;

  return (
    <GameLayout
      title="Sudoku Master"
      icon={<Grid3X3 className="w-6 h-6" />}
      score={score}
      showTimer={true}
      accentColor="#3b82f6"
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        padding: '20px',
        color: '#f8fafc',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto'
      }}>

        {/* Controls Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['Easy', 'Medium', 'Hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: `1px solid ${difficulty === d ? '#3b82f6' : '#334155'}`,
                  background: difficulty === d ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: difficulty === d ? '#60a5fa' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                {d}
              </button>
            ))}
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#cbd5e1',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '6px 16px',
            borderRadius: '12px'
          }}>
            {formatTime(timeElapsed)}
          </div>
        </div>

        {/* Game Board */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          width: '100%',
          aspectRatio: '1',
          background: '#0f172a',
          border: '3px solid #475569',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
        }}>
          {board.map((row, r) => (
            row.map((cellVal, c) => {
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isRelated = isRelatedCell(r, c);
              const isGiven = initialBoard[r][c] !== 0;
              const isError = cellVal !== 0 && cellVal !== solution[r][c];
              const isSameNumber = selectedCell && board[selectedCell.r][selectedCell.c] === cellVal && cellVal !== 0;
              
              let bgColor = 'transparent';
              if (isSelected) bgColor = 'rgba(59, 130, 246, 0.4)';
              else if (isError) bgColor = 'rgba(239, 68, 68, 0.25)';
              else if (isSameNumber) bgColor = 'rgba(59, 130, 246, 0.25)';
              else if (isRelated) bgColor = 'rgba(255, 255, 255, 0.04)';
              
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: c % 3 === 2 && c !== 8 ? '2px solid #475569' : '1px solid #1e293b',
                    borderBottom: r % 3 === 2 && r !== 8 ? '2px solid #475569' : '1px solid #1e293b',
                    background: bgColor,
                    cursor: isGiven ? 'default' : 'pointer',
                    position: 'relative',
                    transition: 'background 0.1s'
                  }}
                >
                  {cellVal !== 0 ? (
                    <span style={{
                      fontSize: 'clamp(1rem, 5vmin, 2rem)',
                      fontWeight: isGiven ? 700 : 500,
                      color: isError ? '#ef4444' : isGiven ? '#f1f5f9' : '#60a5fa',
                      fontFamily: 'monospace'
                    }}>
                      {cellVal}
                    </span>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gridTemplateRows: 'repeat(3, 1fr)',
                      width: '100%',
                      height: '100%',
                      padding: '2px'
                    }}>
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                        <span key={num} style={{
                          fontSize: 'clamp(0.5rem, 1.5vmin, 0.75rem)',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: pencilMarks[r][c]?.has(num) ? 1 : 0
                        }}>
                          {num}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setPencilMode(!pencilMode)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flex: 1,
              padding: '12px',
              background: pencilMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${pencilMode ? '#3b82f6' : 'transparent'}`,
              borderRadius: '12px',
              color: pencilMode ? '#60a5fa' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <Edit2 size={20} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Pencil</span>
          </button>
          
          <button
            onClick={handleHint}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flex: 1,
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '12px',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <HelpCircle size={20} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Hint</span>
          </button>
          
          <button
            onClick={() => initGame(difficulty)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flex: 1,
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '12px',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={20} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>New</span>
          </button>
        </div>

        {/* Number Pad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gap: '8px',
          width: '100%'
        }}>
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              style={{
                aspectRatio: '1',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#f8fafc',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s, transform 0.1s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Victory Overlay */}
        {gameOver && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'inherit',
            zIndex: 10,
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <Trophy size={64} color="#f59e0b" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '32px', color: '#f8fafc', margin: '0 0 8px 0' }}>Puzzle Solved!</h2>
            <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '24px' }}>
              Time: {formatTime(timeElapsed)}
            </p>
            <button
              onClick={() => initGame(difficulty)}
              style={{
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={20} />
              Play Again
            </button>
          </div>
        )}

      </div>
    </GameLayout>
  );
}
