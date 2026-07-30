'use client';

// Trigger comment for Vercel deployment refetch
import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Crown, RotateCcw, Layers, LogOut, Play, User, Users, Monitor, Sparkles } from 'lucide-react';

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

  // AI Turn triggering (no aiThinking dependency)
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

  // Get last move for minimal bottom status displays
  const lastMoveStr = state.history.length > 0 ? state.history[state.history.length - 1].move : 'None';

  return (
    <GameLayout title="Chess 3D" icon={<Crown />} accentColor="#22c55e">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#0f172a',
        gap: '20px',
        width: '100%',
        margin: '0 auto',
        maxWidth: '900px'
      }}>
        
        {/* Sleek Minimalist Top HUD Bar */}
        <div style={{
          width: '100%',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '3.5px solid #000000',
          borderRadius: '20px',
          padding: '12px 24px',
          boxShadow: '4px 4px 0px #000000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box',
          color: '#ffffff'
        }}>
          {/* Left: Player vs Opponent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚔️</span>
            <div style={{ fontSize: '13px', fontWeight: 900 }}>
              You vs <span style={{ color: '#22c55e' }}>{matchedOpponent}</span>
            </div>
          </div>

          {/* Center: Turn Status HUD with Pulse Ring */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.06)',
            padding: '6px 16px',
            borderRadius: '12px',
            border: '1.5px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: gameStatus !== 'playing' ? '#ef4444' : (state.turn === 'w' ? '#3b82f6' : '#f59e0b'),
              boxShadow: gameStatus === 'playing' ? '0 0 10px currentColor' : 'none',
              animation: gameStatus === 'playing' ? 'pulsePulse 1s infinite alternate' : 'none'
            }} />
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {gameStatus === 'playing' ? (
                state.turn === 'w' ? 'Your Turn (White)' : (opponentType === 'local' ? "Player 2's Turn" : 'AI is Thinking...')
              ) : (
                gameStatus === 'checkmate' ? 'Checkmate!' : 'Stalemate Draw'
              )}
            </div>
          </div>

          {/* Right: Sleek Control Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={resetGame}
              title="Restart Game"
              style={{
                width: '36px', height: '36px', borderRadius: '10px', border: '2px solid #000000',
                background: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '2px 2px 0px #000000', transition: 'all 0.1s'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translate(1px, 1px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000000'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0px #000000'; }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={quitToLobby}
              title="Exit to Lobby"
              style={{
                width: '36px', height: '36px', borderRadius: '10px', border: '2px solid #000000',
                background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '2px 2px 0px #000000', transition: 'all 0.1s'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translate(1px, 1px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #000000'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0px #000000'; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* 3-Column Board Row: Captured Pieces on left/right gutters, Board centered */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: '24px'
        }}>
          {/* Left Gutter: Captured Black Pieces */}
          <div style={{
            width: '50px',
            background: 'rgba(255,255,255,0.8)',
            border: '2.5px solid #000000',
            borderRadius: '16px',
            padding: '16px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            minHeight: '320px',
            boxShadow: '3px 3px 0px #000000'
          }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', transform: 'rotate(-90deg)', margin: '12px 0' }}>CAPTURED</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '20px' }}>
              {state.captured.w.map((sym, idx) => (
                <span key={idx} style={{ color: '#000000' }}>{sym}</span>
              ))}
            </div>
          </div>

          {/* Centered Board Wrapper */}
          <div style={{
            background: '#ffffff',
            border: '4px solid #000000',
            borderRadius: '28px',
            padding: '18px',
            boxShadow: '8px 8px 0px #000000',
            width: 'min(95vw, 68vh, 600px)',
            height: 'min(95vw, 68vh, 600px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            perspective: '1200px',
            overflow: 'visible',
            position: 'relative'
          }}>
            {/* 3D isometric view toggle */}
            <button
              onClick={() => setView3D(!view3D)}
              style={{
                position: 'absolute',
                top: '-15px',
                right: '20px',
                padding: '5px 12px',
                background: '#fbbf24',
                border: '2.5px solid #000000',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '10px',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #000000',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                zIndex: 10
              }}
            >
              <Layers size={11} /> {view3D ? 'Flat View' : '3D View'}
            </button>

            {/* High-Contrast Beautiful Virtual Table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              borderRadius: '16px',
              overflow: 'visible',
              border: '3px solid #000000',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transform: view3D ? 'rotateX(22deg) scale(0.96)' : 'none',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: view3D ? '0 20px 35px rgba(0,0,0,0.18)' : 'none'
            }}>
              {state.board.map((row, r) => row.map((piece, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSelected = selected?.r === r && selected?.c === c;
                const isValidMove = validMoves.some(m => m.r === r && m.c === c);
                const isCheck = checkPos?.r === r && checkPos?.c === c;

                // Edge rounded cell corners
                const borderTopLeftRadius = (r === 0 && c === 0) ? '13px' : '0px';
                const borderTopRightRadius = (r === 0 && c === 7) ? '13px' : '0px';
                const borderBottomLeftRadius = (r === 7 && c === 0) ? '13px' : '0px';
                const borderBottomRightRadius = (r === 7 && c === 7) ? '13px' : '0px';

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    style={{
                      aspectRatio: '1',
                      // Deep forest dark green & cream light square colors
                      background: isSelected ? '#a7f3d0'
                                : isCheck ? '#fca5a5'
                                : isDark ? '#1b4332' : '#f5f3f0',
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
                        fontSize: 'clamp(2.4rem, 6.5vh, 4.4rem)',
                        color: piece.color === 'w' ? '#ffffff' : '#000000',
                        // Elegant stroke shadows for White Unicode pieces so they pop on cream squares
                        textShadow: piece.color === 'w' 
                          ? '2px 2px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000' 
                          : 'none',
                        userSelect: 'none',
                        zIndex: 2,
                        transform: view3D ? 'rotateX(-22deg) translateZ(8px)' : 'none',
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

          {/* Right Gutter: Captured White Pieces */}
          <div style={{
            width: '50px',
            background: 'rgba(255,255,255,0.8)',
            border: '2.5px solid #000000',
            borderRadius: '16px',
            padding: '16px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            minHeight: '320px',
            boxShadow: '3px 3px 0px #000000'
          }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', transform: 'rotate(90deg)', margin: '12px 0' }}>LOST</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '20px' }}>
              {state.captured.b.map((sym, idx) => (
                <span key={idx} style={{ color: '#000000' }}>{sym}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tiny Bottom Status Gutter */}
        <div style={{
          width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '6px 12px', background: '#fafaf9', border: '2px solid #000000',
          borderRadius: '12px', boxShadow: '2px 2px 0px #000000', fontSize: '11px', fontWeight: 700
        }}>
          <span style={{ color: '#64748b' }}>Last Move: <span style={{ color: '#000000' }}>{lastMoveStr}</span></span>
          <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={11} /> 10 XP Multiplier active
          </span>
        </div>

      </div>
      
      <style jsx global>{`
        @keyframes pulsePulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </GameLayout>
  );
}
