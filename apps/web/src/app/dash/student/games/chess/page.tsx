'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Crown, RefreshCw, Trophy } from 'lucide-react';

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type Color = 'w' | 'b';
type Piece = { type: PieceType; color: Color };
type Board = (Piece | null)[][];
type Position = { r: number; c: number };
type Move = { from: Position; to: Position; promotion?: PieceType };

const INITIAL_BOARD: Board = [
  [{ type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }],
  [{ type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [{ type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
  [{ type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }],
];

const PIECE_SYMBOLS: Record<Color, Record<PieceType, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
};

const PIECE_VALUES: Record<PieceType, number> = {
  p: 10, n: 30, b: 30, r: 50, q: 90, k: 900
};

interface GameState {
  board: Board;
  turn: Color;
  castling: { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean };
  enPassant: Position | null;
  history: { move: string; board: Board }[];
  captured: { w: string[]; b: string[] };
}

const INITIAL_STATE: GameState = {
  board: INITIAL_BOARD.map(row => [...row]),
  turn: 'w',
  castling: { wK: true, wQ: true, bK: true, bQ: true },
  enPassant: null,
  history: [],
  captured: { w: [], b: [] }
};

const getOpponent = (color: Color): Color => color === 'w' ? 'b' : 'w';
const isWithinBoard = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

const getPseudoLegalMoves = (board: Board, r: number, c: number, castling: GameState['castling'], enPassant: Position | null): Position[] => {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: Position[] = [];
  const { type, color } = piece;
  const dir = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;

  if (type === 'p') {
    if (isWithinBoard(r + dir, c) && !board[r + dir][c]) {
      moves.push({ r: r + dir, c });
      if (r === startRow && isWithinBoard(r + 2 * dir, c) && !board[r + 2 * dir][c]) {
        moves.push({ r: r + 2 * dir, c });
      }
    }
    for (const dc of [-1, 1]) {
      if (isWithinBoard(r + dir, c + dc)) {
        const target = board[r + dir][c + dc];
        if (target && target.color !== color) {
          moves.push({ r: r + dir, c: c + dc });
        } else if (enPassant && enPassant.r === r + dir && enPassant.c === c + dc) {
          moves.push({ r: r + dir, c: c + dc });
        }
      }
    }
  } else if (type === 'n') {
    const jumps = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of jumps) {
      if (isWithinBoard(r + dr, c + dc)) {
        const target = board[r + dr][c + dc];
        if (!target || target.color !== color) moves.push({ r: r + dr, c: c + dc });
      }
    }
  } else if (type === 'k') {
    const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [dr, dc] of dirs) {
      if (isWithinBoard(r + dr, c + dc)) {
        const target = board[r + dr][c + dc];
        if (!target || target.color !== color) moves.push({ r: r + dr, c: c + dc });
      }
    }
    // Castling
    if (color === 'w' && r === 7 && c === 4) {
      if (castling.wK && !board[7][5] && !board[7][6] && board[7][7]?.type === 'r') moves.push({ r: 7, c: 6 });
      if (castling.wQ && !board[7][3] && !board[7][2] && !board[7][1] && board[7][0]?.type === 'r') moves.push({ r: 7, c: 2 });
    } else if (color === 'b' && r === 0 && c === 4) {
      if (castling.bK && !board[0][5] && !board[0][6] && board[0][7]?.type === 'r') moves.push({ r: 0, c: 6 });
      if (castling.bQ && !board[0][3] && !board[0][2] && !board[0][1] && board[0][0]?.type === 'r') moves.push({ r: 0, c: 2 });
    }
  } else {
    const dirs: number[][] = [];
    if (type === 'b' || type === 'q') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    if (type === 'r' || type === 'q') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    for (const [dr, dc] of dirs) {
      let cr = r + dr, cc = c + dc;
      while (isWithinBoard(cr, cc)) {
        const target = board[cr][cc];
        if (!target) {
          moves.push({ r: cr, c: cc });
        } else {
          if (target.color !== color) moves.push({ r: cr, c: cc });
          break;
        }
        cr += dr; cc += dc;
      }
    }
  }
  return moves;
};

const isUnderAttack = (board: Board, r: number, c: number, attackerColor: Color): boolean => {
  for (let ir = 0; ir < 8; ir++) {
    for (let ic = 0; ic < 8; ic++) {
      if (board[ir][ic]?.color === attackerColor) {
        const pMoves = getPseudoLegalMoves(board, ir, ic, { wK: false, wQ: false, bK: false, bQ: false }, null);
        if (pMoves.some(m => m.r === r && m.c === c)) return true;
      }
    }
  }
  return false;
};

const isInCheck = (board: Board, color: Color): boolean => {
  let kr = -1, kc = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.type === 'k' && board[r][c]?.color === color) {
        kr = r; kc = c; break;
      }
    }
  }
  if (kr === -1) return false;
  return isUnderAttack(board, kr, kc, getOpponent(color));
};

const simulateMove = (board: Board, from: Position, to: Position, enPassant: Position | null): Board => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.r][from.c]!;
  newBoard[to.r][to.c] = piece;
  newBoard[from.r][from.c] = null;

  if (piece.type === 'p') {
    if (enPassant && to.r === enPassant.r && to.c === enPassant.c) {
      newBoard[from.r][to.c] = null;
    }
    if (to.r === 0 || to.r === 7) {
      newBoard[to.r][to.c] = { type: 'q', color: piece.color }; // Auto queen
    }
  }
  if (piece.type === 'k' && Math.abs(to.c - from.c) === 2) {
    if (to.c === 6) {
      newBoard[from.r][5] = newBoard[from.r][7];
      newBoard[from.r][7] = null;
    } else if (to.c === 2) {
      newBoard[from.r][3] = newBoard[from.r][0];
      newBoard[from.r][0] = null;
    }
  }
  return newBoard;
};

const getLegalMoves = (board: Board, r: number, c: number, castling: GameState['castling'], enPassant: Position | null): Position[] => {
  const pseudoMoves = getPseudoLegalMoves(board, r, c, castling, enPassant);
  const color = board[r][c]!.color;
  return pseudoMoves.filter(m => {
    // Prevent castling through check
    if (board[r][c]?.type === 'k' && Math.abs(m.c - c) === 2) {
      if (isInCheck(board, color)) return false;
      const step = m.c > c ? 1 : -1;
      if (isUnderAttack(board, r, c + step, getOpponent(color))) return false;
    }
    const newBoard = simulateMove(board, { r, c }, m, enPassant);
    return !isInCheck(newBoard, color);
  });
};

const getAllLegalMoves = (state: GameState): Move[] => {
  const moves: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state.board[r][c]?.color === state.turn) {
        const legal = getLegalMoves(state.board, r, c, state.castling, state.enPassant);
        legal.forEach(m => moves.push({ from: { r, c }, to: m }));
      }
    }
  }
  return moves;
};

// AI Evaluation
const evaluateBoard = (board: Board): number => {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const val = PIECE_VALUES[piece.type];
        score += piece.color === 'b' ? val : -val;
      }
    }
  }
  return score;
};

const minimax = (state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean): { score: number; move: Move | null } => {
  const moves = getAllLegalMoves(state);
  if (depth === 0 || moves.length === 0) {
    if (moves.length === 0) {
      if (isInCheck(state.board, state.turn)) return { score: isMaximizing ? -9999 : 9999, move: null };
      return { score: 0, move: null };
    }
    return { score: evaluateBoard(state.board), move: null };
  }

  let bestMove = moves[0] || null;
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = applyMoveWithoutHistory(state, move);
      const ev = minimax(newState, depth - 1, alpha, beta, false).score;
      if (ev > maxEval) {
        maxEval = ev;
        bestMove = move;
      }
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = applyMoveWithoutHistory(state, move);
      const ev = minimax(newState, depth - 1, alpha, beta, true).score;
      if (ev < minEval) {
        minEval = ev;
        bestMove = move;
      }
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
};

const colToChar = (c: number) => String.fromCharCode(97 + c);
const posToString = (r: number, c: number) => `${colToChar(c)}${8 - r}`;

// Helper for minimax recursive evaluation to avoid bloating history array
const applyMoveWithoutHistory = (state: GameState, move: Move): GameState => {
  const piece = state.board[move.from.r][move.from.c]!;
  const newBoard = simulateMove(state.board, move.from, move.to, state.enPassant);

  let newEnPassant = null;
  if (piece.type === 'p' && Math.abs(move.from.r - move.to.r) === 2) {
    newEnPassant = { r: (move.from.r + move.to.r) / 2, c: move.from.c };
  }

  const newCastling = { ...state.castling };
  if (piece.type === 'k') {
    if (piece.color === 'w') { newCastling.wK = false; newCastling.wQ = false; }
    else { newCastling.bK = false; newCastling.bQ = false; }
  }
  if (piece.type === 'r') {
    if (move.from.r === 7 && move.from.c === 0) newCastling.wQ = false;
    if (move.from.r === 7 && move.from.c === 7) newCastling.wK = false;
    if (move.from.r === 0 && move.from.c === 0) newCastling.bQ = false;
    if (move.from.r === 0 && move.from.c === 7) newCastling.bK = false;
  }

  return {
    board: newBoard,
    turn: getOpponent(state.turn),
    castling: newCastling,
    enPassant: newEnPassant,
    history: state.history,
    captured: state.captured
  };
};

const applyMove = (state: GameState, move: Move): GameState => {
  const piece = state.board[move.from.r][move.from.c]!;
  const target = state.board[move.to.r][move.to.c];
  const newBoard = simulateMove(state.board, move.from, move.to, state.enPassant);

  let newEnPassant = null;
  if (piece.type === 'p' && Math.abs(move.from.r - move.to.r) === 2) {
    newEnPassant = { r: (move.from.r + move.to.r) / 2, c: move.from.c };
  }

  const newCastling = { ...state.castling };
  if (piece.type === 'k') {
    if (piece.color === 'w') { newCastling.wK = false; newCastling.wQ = false; }
    else { newCastling.bK = false; newCastling.bQ = false; }
  }
  if (piece.type === 'r') {
    if (move.from.r === 7 && move.from.c === 0) newCastling.wQ = false;
    if (move.from.r === 7 && move.from.c === 7) newCastling.wK = false;
    if (move.from.r === 0 && move.from.c === 0) newCastling.bQ = false;
    if (move.from.r === 0 && move.from.c === 7) newCastling.bK = false;
  }

  const moveStr = `${piece.type !== 'p' ? piece.type.toUpperCase() : ''}${posToString(move.from.r, move.from.c)}-${posToString(move.to.r, move.to.c)}`;

  const captured = { w: [...state.captured.w], b: [...state.captured.b] };
  if (target) {
    captured[target.color].push(PIECE_SYMBOLS[target.color][target.type]);
  } else if (piece.type === 'p' && state.enPassant && move.to.r === state.enPassant.r && move.to.c === state.enPassant.c) {
    captured[getOpponent(piece.color)].push(PIECE_SYMBOLS[getOpponent(piece.color)]['p']);
  }

  return {
    board: newBoard,
    turn: getOpponent(state.turn),
    castling: newCastling,
    enPassant: newEnPassant,
    history: [...state.history, { move: moveStr, board: newBoard }],
    captured
  };
};

export default function ChessGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [selected, setSelected] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [aiThinking, setAiThinking] = useState(false);

  // Derived check & end statuses directly in render loop to avoid recursive setState loops
  const inCheck = isInCheck(state.board, state.turn);
  const currentLegalMoves = getAllLegalMoves(state);
  const isGameOver = currentLegalMoves.length === 0;
  const gameStatus = isGameOver ? (inCheck ? 'checkmate' : 'stalemate') : 'playing';

  // Find King pos for check highlighting
  let checkPos: Position | null = null;
  if (inCheck) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (state.board[r][c]?.type === 'k' && state.board[r][c]?.color === state.turn) {
          checkPos = { r, c };
        }
      }
    }
  }

  // Trigger AI Turn
  useEffect(() => {
    if (state.turn === 'b' && gameStatus === 'playing' && !aiThinking) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        // Evaluate moves on latest board
        const result = minimax(state, 2, -Infinity, Infinity, true);
        if (result.move) {
          setState(s => applyMove(s, result.move!));
        } else {
          // If no move found, make a random fallback move to ensure computer plays
          const moves = getAllLegalMoves(state);
          if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            setState(s => applyMove(s, randomMove));
          }
        }
        setAiThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state.turn, gameStatus, aiThinking, state]);

  const handleSquareClick = (r: number, c: number) => {
    if (state.turn === 'b' || gameStatus !== 'playing') return;

    if (selected) {
      const isMove = validMoves.find(m => m.r === r && m.c === c);
      if (isMove) {
        setState(s => applyMove(s, { from: selected, to: { r, c } }));
        setSelected(null);
        setValidMoves([]);
        return;
      }
    }

    const piece = state.board[r][c];
    if (piece && piece.color === 'w') {
      setSelected({ r, c });
      setValidMoves(getLegalMoves(state.board, r, c, state.castling, state.enPassant));
    } else {
      setSelected(null);
      setValidMoves([]);
    }
  };

  const resetGame = () => {
    setState(INITIAL_STATE);
    setSelected(null);
    setValidMoves([]);
    setAiThinking(false);
  };

  return (
    <GameLayout title="Chess" icon={<Crown />} accentColor="#22c55e">
      <div style={{
        display: 'flex',
        gap: '32px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
        color: '#0f172a'
      }}>
        
        {/* Board Container - Neo-brutalist styling */}
        <div style={{
          background: '#ffffff',
          border: '4px solid #000000',
          borderRadius: '24px',
          padding: '16px',
          boxShadow: '8px 8px 0px #000000',
          width: 'min(100vw - 2rem, 580px)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid #000000'
          }}>
            {state.board.map((row, r) => row.map((piece, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selected?.r === r && selected?.c === c;
              const isValidMove = validMoves.some(m => m.r === r && m.c === c);
              const isCheck = checkPos?.r === r && checkPos?.c === c;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleSquareClick(r, c)}
                  style={{
                    aspectRatio: '1',
                    background: isSelected ? '#a7f3d0' // select
                              : isCheck ? '#fecaca' // check
                              : isDark ? '#15803d' : '#fef08a', // Forest green / soft warm yellow
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: state.turn === 'w' && gameStatus === 'playing' ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {piece && (
                    <span style={{ 
                      fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                      color: piece.color === 'w' ? '#ffffff' : '#000000',
                      // Text stroke logic for white pieces to keep them highly visible on yellow/light squares
                      textShadow: piece.color === 'w' 
                        ? '2px 2px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000' 
                        : 'none',
                      userSelect: 'none',
                      zIndex: 2
                    }}>
                      {PIECE_SYMBOLS[piece.color][piece.type]}
                    </span>
                  )}
                  {isValidMove && (
                    <div style={{
                      position: 'absolute',
                      width: '28%',
                      height: '28%',
                      borderRadius: '50%',
                      background: piece ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.6)',
                      border: '1.5px solid #000000',
                      zIndex: 3
                    }} />
                  )}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Sidebar Dashboard - High Contrast Neo-brutalist */}
        <div style={{
          width: '320px',
          background: '#ffffff',
          border: '3px solid #000000',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '6px 6px 0px #000000',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Status Display */}
          <div style={{
            background: gameStatus !== 'playing' ? '#fecaca' : (state.turn === 'w' ? '#dbeafe' : '#fef9c3'),
            border: '2px solid #000000',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '3px 3px 0px #000000',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Game Status
            </h3>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000' }}>
              {gameStatus === 'playing' ? (
                state.turn === 'w' ? "⬜ Your Turn (White)" : "⬛ AI Thinking... (Black)"
              ) : (
                gameStatus === 'checkmate' ? "🏆 CHECKMATE!" : "🤝 DRAW (STALEMATE)"
              )}
            </div>
            {aiThinking && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 700 }}>AI is planning its next move...</div>}
          </div>

          {/* Captured Pieces Display */}
          <div style={{
            border: '2px solid #000000',
            borderRadius: '16px',
            padding: '16px',
            background: '#fafaf9'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Captured Pieces
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>White: </span>
                <span style={{ fontSize: '20px', letterSpacing: '2px' }}>{state.captured.w.join(' ')}</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Black: </span>
                <span style={{ fontSize: '20px', letterSpacing: '2px', color: '#000000' }}>{state.captured.b.join(' ')}</span>
              </div>
            </div>
          </div>

          {/* Move History Panel */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Move History
            </h3>
            <div style={{ 
              height: '180px', 
              overflowY: 'auto', 
              background: '#fafaf9',
              border: '2px solid #000000',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'monospace',
              fontWeight: 700
            }}>
              {state.history.length === 0 ? (
                <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No moves yet...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {state.history.map((h, i) => (
                    <div key={i} style={{ color: '#0f172a' }}>
                      {i % 2 === 0 ? `${Math.floor(i/2) + 1}. ` : ''}{h.move}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* New Game Button - Yellow Neo-brutalist */}
          <button 
            onClick={resetGame}
            style={{
              padding: '16px',
              background: '#fbbf24',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '16px',
              fontSize: '15px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000000'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0px #000000'; }}
          >
            <RefreshCw size={16} /> New Game
          </button>
        </div>

      </div>
    </GameLayout>
  );
}
