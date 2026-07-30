'use client';

import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Crown, RefreshCw, Layers, User, Monitor, Users, ShieldAlert } from 'lucide-react';

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
      newBoard[to.r][to.c] = { type: 'q', color: piece.color };
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

const OPPONENT_NAMES = ['Aisha Bello (Grade 4)', 'Chinedu Okafor (Grade 5)', 'Oluwaseun Adebayo (Grade 4)', 'Amara Egwu (Grade 5)', 'Tunde Cole (Grade 6)'];

export default function ChessGame() {
  const [gameMode, setGameMode] = useState<'lobby' | 'matching' | 'playing'>('lobby');
  const [opponentType, setOpponentType] = useState<'ai' | 'local' | 'matchmaker'>('ai');
  const [matchedOpponent, setMatchedOpponent] = useState('Computer (AI)');
  
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [selected, setSelected] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [view3D, setView3D] = useState(true);

  const resetGame = () => {
    setState(INITIAL_STATE);
    setSelected(null);
    setValidMoves([]);
    setAiThinking(false);
  };

  const inCheck = isInCheck(state.board, state.turn);
  const currentLegalMoves = getAllLegalMoves(state);
  const isGameOver = currentLegalMoves.length === 0;
  const gameStatus = isGameOver ? (inCheck ? 'checkmate' : 'stalemate') : 'playing';

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

  // Simulated matchmaking loop
  useEffect(() => {
    if (gameMode === 'matching') {
      const timer = setTimeout(() => {
        const name = OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)];
        setMatchedOpponent(name);
        setGameMode('playing');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [gameMode]);

  // AI Turn triggering (No aiThinking in dependency to avoid immediate cancel cleanup!)
  useEffect(() => {
    const isBotTurn = state.turn === 'b' && (opponentType === 'ai' || opponentType === 'matchmaker');
    if (isBotTurn && gameStatus === 'playing' && !aiThinking && gameMode === 'playing') {
      setAiThinking(true);
      const timer = setTimeout(() => {
        const result = minimax(state, 2, -Infinity, Infinity, true);
        if (result.move) {
          setState(s => applyMove(s, result.move!));
        } else {
          const moves = getAllLegalMoves(state);
          if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            setState(s => applyMove(s, randomMove));
          }
        }
        setAiThinking(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [state.turn, gameStatus, gameMode]);

  const handleSquareClick = (r: number, c: number) => {
    if (gameStatus !== 'playing') return;
    
    // Disable clicks during Bot thinking phase
    const isBotTurn = state.turn === 'b' && (opponentType === 'ai' || opponentType === 'matchmaker');
    if (isBotTurn) return;

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
    // In local mode, click pieces matching the current turn's color. In bot modes, click only white ('w')
    const correctColor = opponentType === 'local' ? state.turn : 'w';
    
    if (piece && piece.color === correctColor) {
      setSelected({ r, c });
      setValidMoves(getLegalMoves(state.board, r, c, state.castling, state.enPassant));
    } else {
      setSelected(null);
      setValidMoves([]);
    }
  };

  const startMode = (type: 'ai' | 'local' | 'matchmaker') => {
    setOpponentType(type);
    setState(INITIAL_STATE);
    setSelected(null);
    setValidMoves([]);
    setAiThinking(false);
    
    if (type === 'matchmaker') {
      setGameMode('matching');
    } else {
      setMatchedOpponent(type === 'ai' ? 'Computer (AI)' : 'Player 2 (Local)');
      setGameMode('playing');
    }
  };

  const quitToLobby = () => {
    setGameMode('lobby');
  };

  // Increased Chess Board size min(94vw, 75vh, 580px) for maximum visibility
  const boardSize = 'min(94vw, 75vh, 580px)';

  if (gameMode === 'lobby') {
    return (
      <GameLayout title="Chess Lobby" icon={<Crown />} accentColor="#22c55e">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '62vh', gap: '32px', color: '#0f172a', textAlign: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#000000', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
              ♟️ Chess Play Zone
            </h2>
            <p style={{ color: '#475569', fontSize: '15px', maxWidth: '500px', fontWeight: 600, margin: '0 auto' }}>
              Select your game mode. Challenge the computer, play pass-and-play with a classmate, or search for other grades!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { type: 'ai', title: 'Play vs Computer', desc: 'minimax AI system', icon: Monitor },
              { type: 'local', title: 'Pass & Play', desc: 'Local 2-player mode', icon: Users },
              { type: 'matchmaker', title: 'Grade Matchmaking', desc: 'Find other grades', icon: User }
            ].map(m => (
              <button
                key={m.type}
                onClick={() => startMode(m.type as any)}
                style={{
                  padding: '24px', borderRadius: '20px', border: '3px solid #000000',
                  cursor: 'pointer', fontSize: '16px', fontWeight: 900, background: '#ffffff',
                  color: '#000000', boxShadow: '4px 4px 0px #000000', transition: 'all 0.15s ease',
                  width: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-4px, -4px)'; e.currentTarget.style.boxShadow = '8px 8px 0px #000000'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px #000000'; }}
              >
                <m.icon size={36} style={{ color: '#22c55e' }} />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 900 }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </GameLayout>
    );
  }

  if (gameMode === 'matching') {
    return (
      <GameLayout title="Matchmaking" icon={<Crown />} accentColor="#22c55e">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '62vh', gap: '32px', color: '#0f172a', textAlign: 'center'
        }}>
          {/* Radar scan animation */}
          <div className="radar-container" style={{
            position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="pulse" style={{
              position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
              border: '3px solid #22c55e', animation: 'ping 1.5s infinite ease-out'
            }} />
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #000000',
              background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '3px 3px 0px #000000', zIndex: 2
            }}>
              <Users size={32} color="#22c55e" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px 0' }}>Searching for Matches...</h3>
            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 700 }}>Finding students in Grade 4, 5, or 6 to match on the board...</p>
          </div>
          <button
            onClick={quitToLobby}
            style={{
              padding: '12px 24px', borderRadius: '12px', border: '2px solid #000000',
              cursor: 'pointer', fontSize: '13px', fontWeight: 900, background: '#fee2e2',
              color: '#ef4444', boxShadow: '2px 2px 0px #000000'
            }}
          >
            Cancel Search
          </button>

          <style jsx>{`
            @keyframes ping {
              0% { transform: scale(0.6); opacity: 1; }
              100% { transform: scale(1.6); opacity: 0; }
            }
          `}</style>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Chess 3D" icon={<Crown />} accentColor="#22c55e">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#0f172a',
        gap: '24px',
        width: '100%'
      }}>
        
        {/* Top Banner Dashboard instead of Sidebar */}
        <div style={{
          width: '100%',
          maxWidth: '750px',
          background: '#ffffff',
          border: '3px solid #000000',
          borderRadius: '24px',
          padding: '16px 24px',
          boxShadow: '4px 4px 0px #000000',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          {/* Column 1: Opponent & Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              padding: '6px 12px', borderRadius: '10px', border: '1.5px solid #000000', background: '#fafaf9',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <User size={12} />
              <div style={{ fontSize: '11px', fontWeight: 900 }}>{matchedOpponent}</div>
            </div>
            <div style={{
              background: gameStatus !== 'playing' ? '#fecaca' : (state.turn === 'w' ? '#dbeafe' : '#fef9c3'),
              border: '1.5px solid #000000', borderRadius: '10px', padding: '6px 12px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 900 }}>
                {gameStatus === 'playing' ? (
                  state.turn === 'w' ? "Your Turn (White)" : (opponentType === 'local' ? "Player 2's Turn" : "Thinking...")
                ) : (
                  gameStatus === 'checkmate' ? "🏆 CHECKMATE!" : "🤝 DRAW"
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Captured Pieces */}
          <div style={{
            border: '1.5px solid #000000', borderRadius: '14px', padding: '10px 14px', background: '#fafaf9',
            display: 'flex', flexDirection: 'column', gap: '4px'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Captured Pieces</div>
            <div style={{ fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>White:</span>
              <span style={{ letterSpacing: '1px' }}>{state.captured.w.join('') || '-'}</span>
            </div>
            <div style={{ fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Black:</span>
              <span style={{ letterSpacing: '1px' }}>{state.captured.b.join('') || '-'}</span>
            </div>
          </div>

          {/* Column 3: Move History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Recent Moves</div>
            <div style={{
              height: '52px', overflowY: 'auto', background: '#fafaf9', border: '1.5px solid #000000',
              padding: '6px 8px', borderRadius: '10px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 700
            }}>
              {state.history.length === 0 ? (
                <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No moves...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                  {state.history.slice(-6).map((h, i) => (
                    <div key={i} style={{ color: '#0f172a' }}>
                      {h.move}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={resetGame}
              style={{
                width: '100%', padding: '8px', background: '#ffffff', color: '#000000', border: '1.5px solid #000000',
                borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', boxShadow: '1.5px 1.5px 0px #000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              <RefreshCw size={12} /> Restart
            </button>
            <button 
              onClick={quitToLobby}
              style={{
                width: '100%', padding: '8px', background: '#fee2e2', color: '#ef4444', border: '1.5px solid #000000',
                borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', boxShadow: '1.5px 1.5px 0px #000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              <ShieldAlert size={12} /> Quit Lobby
            </button>
          </div>
        </div>

        {/* Centered Chess Board Panel */}
        <div style={{
          background: '#ffffff',
          border: '4px solid #000000',
          borderRadius: '24px',
          padding: '16px',
          boxShadow: '8px 8px 0px #000000',
          width: 'min(94vw, 55vh, 480px)',
          height: 'min(94vw, 55vh, 480px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          perspective: '1000px',
          overflow: 'visible',
          position: 'relative'
        }}>
          {/* View Toggle */}
          <button
            onClick={() => setView3D(!view3D)}
            style={{
              position: 'absolute',
              top: '-15px',
              right: '15px',
              padding: '4px 10px',
              background: '#fbbf24',
              border: '2px solid #000000',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '10px',
              cursor: 'pointer',
              boxShadow: '1.5px 1.5px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 10
            }}
          >
            <Layers size={10} /> {view3D ? 'Flat View' : '3D View'}
          </button>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            borderRadius: '12px',
            overflow: 'visible', // Set overflow to visible to prevent 3D standing pieces from clipping!
            border: '2px solid #000000',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: view3D ? 'rotateX(25deg) translateY(-10px) scale(0.95)' : 'none',
            transition: 'transform 0.4s ease-out',
            boxShadow: view3D ? '0 15px 25px rgba(0,0,0,0.2)' : 'none'
          }}>
            {state.board.map((row, r) => row.map((piece, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selected?.r === r && selected?.c === c;
              const isValidMove = validMoves.some(m => m.r === r && m.c === c);
              const isCheck = checkPos?.r === r && checkPos?.c === c;

              // Keep rounded corners intact by manually styling outer squares
              const borderTopLeftRadius = (r === 0 && c === 0) ? '10px' : '0px';
              const borderTopRightRadius = (r === 0 && c === 7) ? '10px' : '0px';
              const borderBottomLeftRadius = (r === 7 && c === 0) ? '10px' : '0px';
              const borderBottomRightRadius = (r === 7 && c === 7) ? '10px' : '0px';

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleSquareClick(r, c)}
                  style={{
                    aspectRatio: '1',
                    background: isSelected ? '#a7f3d0'
                              : isCheck ? '#fecaca'
                              : isDark ? '#15803d' : '#fef08a',
                    borderTopLeftRadius,
                    borderTopRightRadius,
                    borderBottomLeftRadius,
                    borderBottomRightRadius,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {piece && (
                    <span style={{ 
                      fontSize: 'clamp(1.8rem, 5.5vh, 3.4rem)',
                      color: piece.color === 'w' ? '#ffffff' : '#000000',
                      textShadow: piece.color === 'w' 
                        ? '2.5px 2.5px 0px #000000, -2.5px -2.5px 0px #000000, 2.5px -2.5px 0px #000000, -2.5px 2.5px 0px #000000' 
                        : 'none',
                      userSelect: 'none',
                      zIndex: 2,
                      transform: view3D ? 'rotateX(-25deg) translateZ(6px)' : 'none',
                      transition: 'transform 0.4s ease-out'
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

      </div>
    </GameLayout>
  );
}
