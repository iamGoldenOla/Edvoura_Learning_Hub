'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Crown } from 'lucide-react';

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

type GameState = {
  board: Board;
  turn: Color;
  castling: { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean };
  enPassant: Position | null;
  history: { move: string; board: Board }[];
  captured: { w: string[]; b: string[] };
  status: 'playing' | 'checkmate' | 'stalemate';
};

const INITIAL_STATE: GameState = {
  board: JSON.parse(JSON.stringify(INITIAL_BOARD)),
  turn: 'w',
  castling: { wK: true, wQ: true, bK: true, bQ: true },
  enPassant: null,
  history: [],
  captured: { w: [], b: [] },
  status: 'playing'
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
    let dirs: number[][] = [];
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
        const pMoves = getPseudoLegalMoves(board, ir, ic, {wK:false,wQ:false,bK:false,bQ:false}, null);
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
      newBoard[to.r][to.c] = { type: 'q', color: piece.color }; // Auto queen for simplicity
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

const getLegalMoves = (board: Board, r: number, c: number, state: GameState): Position[] => {
  const pseudoMoves = getPseudoLegalMoves(board, r, c, state.castling, state.enPassant);
  const color = board[r][c]!.color;
  return pseudoMoves.filter(m => {
    // Prevent castling through check
    if (board[r][c]?.type === 'k' && Math.abs(m.c - c) === 2) {
      if (isInCheck(board, color)) return false;
      const step = m.c > c ? 1 : -1;
      if (isUnderAttack(board, r, c + step, getOpponent(color))) return false;
    }
    const newBoard = simulateMove(board, {r, c}, m, state.enPassant);
    return !isInCheck(newBoard, color);
  });
};

const getAllLegalMoves = (state: GameState): Move[] => {
  const moves: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state.board[r][c]?.color === state.turn) {
        const legal = getLegalMoves(state.board, r, c, state);
        legal.forEach(m => moves.push({ from: {r, c}, to: m }));
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

const minimax = (state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean): { score: number, move: Move | null } => {
  const moves = getAllLegalMoves(state);
  if (depth === 0 || moves.length === 0) {
    if (moves.length === 0) {
      if (isInCheck(state.board, state.turn)) return { score: isMaximizing ? -9999 : 9999, move: null };
      return { score: 0, move: null };
    }
    return { score: evaluateBoard(state.board), move: null };
  }

  let bestMove = moves[0];
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = applyMove(state, move);
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
      const newState = applyMove(state, move);
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
    captured,
    status: 'playing'
  };
};

export default function ChessGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [selected, setSelected] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [checkPos, setCheckPos] = useState<Position | null>(null);

  useEffect(() => {
    // Check game end conditions
    const moves = getAllLegalMoves(state);
    let kr = -1, kc = -1;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (state.board[r][c]?.type === 'k' && state.board[r][c]?.color === state.turn) {
          kr = r; kc = c;
        }
      }
    }
    const inCheck = isInCheck(state.board, state.turn);
    if (inCheck) {
      setCheckPos({r: kr, c: kc});
    } else {
      setCheckPos(null);
    }

    if (moves.length === 0) {
      setState(s => ({ ...s, status: inCheck ? 'checkmate' : 'stalemate' }));
      return;
    }

    // AI Turn
    if (state.turn === 'b' && state.status === 'playing' && !aiThinking) {
      setAiThinking(true);
      setTimeout(() => {
        const result = minimax(state, 2, -Infinity, Infinity, true); // black maximizes
        if (result.move) {
          setState(s => applyMove(s, result.move!));
        }
        setAiThinking(false);
      }, 500);
    }
  }, [state]);

  const handleSquareClick = (r: number, c: number) => {
    if (state.turn === 'b' || state.status !== 'playing') return;

    if (selected) {
      const isMove = validMoves.find(m => m.r === r && m.c === c);
      if (isMove) {
        setState(s => applyMove(s, { from: selected, to: {r, c} }));
        setSelected(null);
        setValidMoves([]);
        return;
      }
    }

    const piece = state.board[r][c];
    if (piece && piece.color === 'w') {
      setSelected({r, c});
      setValidMoves(getLegalMoves(state.board, r, c, state));
    } else {
      setSelected(null);
      setValidMoves([]);
    }
  };

  const resetGame = () => {
    setState(INITIAL_STATE);
    setSelected(null);
    setValidMoves([]);
  };

  return (
    <GameLayout title="Chess" icon={<Crown />} accentColor="#22c55e">
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* Board */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          width: 'min(100vw - 2rem, 600px)',
          height: 'min(100vw - 2rem, 600px)',
          border: '4px solid #334155',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
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
                  background: isSelected ? 'rgba(34, 197, 94, 0.5)' 
                            : isCheck ? 'rgba(239, 68, 68, 0.8)'
                            : isDark ? '#475569' : '#cbd5e1',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: state.turn === 'w' ? 'pointer' : 'default',
                  position: 'relative'
                }}
              >
                {piece && (
                  <span style={{ 
                    fontSize: 'clamp(2rem, 8vw, 4rem)',
                    color: piece.color === 'w' ? '#f8fafc' : '#0f172a',
                    textShadow: piece.color === 'w' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                    userSelect: 'none'
                  }}>
                    {PIECE_SYMBOLS[piece.color][piece.type]}
                  </span>
                )}
                {isValidMove && (
                  <div style={{
                    position: 'absolute',
                    width: '30%',
                    height: '30%',
                    borderRadius: '50%',
                    background: piece ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)',
                  }} />
                )}
              </div>
            );
          }))}
        </div>

        {/* Sidebar */}
        <div style={{
          width: '300px',
          background: 'rgba(255,255,255,0.05)',
          padding: '1.5rem',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          color: '#f8fafc'
        }}>
          <div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#22c55e' }}>Status</h3>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {state.status === 'playing' ? (state.turn === 'w' ? "White's Turn" : "Black's Turn (AI)") : state.status.toUpperCase()}
            </div>
            {aiThinking && <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>AI is thinking...</div>}
          </div>

          <div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#22c55e' }}>Captured</h3>
            <div style={{ minHeight: '3rem', fontSize: '1.5rem', display: 'flex', flexWrap: 'wrap' }}>
              {state.captured.w.map((p, i) => <span key={i}>{p}</span>)}
            </div>
            <div style={{ minHeight: '3rem', fontSize: '1.5rem', display: 'flex', flexWrap: 'wrap', color: '#94a3b8' }}>
              {state.captured.b.map((p, i) => <span key={i}>{p}</span>)}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#22c55e' }}>Move History</h3>
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              maxHeight: '200px',
              background: 'rgba(0,0,0,0.2)',
              padding: '0.5rem',
              borderRadius: '4px',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}>
              {state.history.map((h, i) => (
                <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {i % 2 === 0 ? `${Math.floor(i/2) + 1}. ` : ''}{h.move}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={resetGame}
            style={{
              padding: '0.75rem',
              background: '#22c55e',
              color: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#16a34a'}
            onMouseOut={(e) => e.currentTarget.style.background = '#22c55e'}
          >
            New Game
          </button>
        </div>

      </div>
    </GameLayout>
  );
}
