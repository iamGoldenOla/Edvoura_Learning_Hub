'use client';

// Trigger comment for Vercel deployment refetch
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Crown, RotateCcw, Layers, LogOut, User, Users, 
  Monitor, Sparkles, ArrowLeft, Undo2 
} from 'lucide-react';

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

const getPieceCounts = (board: Board) => {
  const counts: Record<Color, Record<PieceType, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
  };
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        counts[piece.color][piece.type]++;
      }
    }
  }
  return counts;
};

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
    if (piece.color === 'w' && piece.color === 'w') { newCastling.wK = false; newCastling.wQ = false; }
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

  const moveStr = `${piece.type !== 'p' ? piece.type.toUpperCase() : ''}${posToString(move.from.r, move.from.c)}→${posToString(move.to.r, move.to.c)}`;

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
  const router = useRouter();
  const [gameMode, setGameMode] = useState<'lobby' | 'matching' | 'playing'>('lobby');
  const [opponentType, setOpponentType] = useState<'ai' | 'local' | 'matchmaker'>('ai');
  const [matchedOpponent, setMatchedOpponent] = useState('Computer (AI)');
  
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [selected, setSelected] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [view3D, setView3D] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  const resetGame = () => {
    setState(INITIAL_STATE);
    setSelected(null);
    setValidMoves([]);
    setAiThinking(false);
    setElapsedTime(0);
  };

  const undoMove = () => {
    if (state.history.length < 2) {
      if (opponentType === 'local' && state.history.length === 1) {
        setState(INITIAL_STATE);
      }
      return;
    }
    
    if (opponentType === 'ai' || opponentType === 'matchmaker') {
      setState(s => {
        const newHistory = s.history.slice(0, -2);
        const lastState = newHistory.length > 0 
          ? newHistory[newHistory.length - 1].board 
          : INITIAL_BOARD;
        
        const captured = { w: [] as string[], b: [] as string[] };
        const initialCounts = getPieceCounts(INITIAL_BOARD);
        const currentCounts = getPieceCounts(lastState);
        
        for (const color of ['w', 'b'] as Color[]) {
          for (const type of ['p', 'n', 'b', 'r', 'q', 'k'] as PieceType[]) {
            const diff = (initialCounts[color][type] || 0) - (currentCounts[color][type] || 0);
            for (let i = 0; i < diff; i++) {
              captured[color].push(PIECE_SYMBOLS[color][type]);
            }
          }
        }

        return {
          ...s,
          board: lastState,
          turn: 'w',
          history: newHistory,
          captured
        };
      });
    } else {
      setState(s => {
        const newHistory = s.history.slice(0, -1);
        const lastState = newHistory.length > 0 
          ? newHistory[newHistory.length - 1].board 
          : INITIAL_BOARD;
        
        const captured = { w: [] as string[], b: [] as string[] };
        const initialCounts = getPieceCounts(INITIAL_BOARD);
        const currentCounts = getPieceCounts(lastState);
        
        for (const color of ['w', 'b'] as Color[]) {
          for (const type of ['p', 'n', 'b', 'r', 'q', 'k'] as PieceType[]) {
            const diff = (initialCounts[color][type] || 0) - (currentCounts[color][type] || 0);
            for (let i = 0; i < diff; i++) {
              captured[color].push(PIECE_SYMBOLS[color][type]);
            }
          }
        }

        return {
          ...s,
          board: lastState,
          turn: getOpponent(s.turn),
          history: newHistory,
          captured
        };
      });
    }
    
    setSelected(null);
    setValidMoves([]);
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

  // Elapsed game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStatus === 'playing' && gameMode === 'playing') {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStatus, gameMode]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // AI Turn trigger
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
      }, 1200); // 1.2s thinking time for a more realistic feel
      return () => clearTimeout(timer);
    }
  }, [state.turn, gameStatus, gameMode]);

  const handleSquareClick = (r: number, c: number) => {
    if (gameStatus !== 'playing' || aiThinking) return;
    
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
    setElapsedTime(0);
    
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
      <div className="fullscreen-chess-lobby" style={{
        position: 'absolute', inset: 0, height: '100%', width: '100%', overflow: 'hidden',
        background: '#0b0f19', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '24px', boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '32px', color: '#ffffff', textAlign: 'center', maxWidth: '600px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fbbf24' }}>
            <Crown size={48} />
            <h1 style={{ fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
              Chess Zone
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600, margin: '0 auto', lineHeight: '1.6' }}>
            Select your game mode. Challenge the computer evaluate system, play local hotseat pass-and-play with a classmate, or match across student grades.
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { type: 'ai', title: 'Play vs Computer', desc: 'Minimax AI engine', icon: Monitor },
              { type: 'local', title: 'Pass & Play', desc: 'Local 2-player mode', icon: Users },
              { type: 'matchmaker', title: 'Grade Matchmaking', desc: 'Find other grades', icon: User }
            ].map(m => (
              <button
                key={m.type}
                onClick={() => startMode(m.type as any)}
                style={{
                  padding: '24px', borderRadius: '20px', border: '3px solid #000000',
                  cursor: 'pointer', fontSize: '16px', fontWeight: 900, background: '#ffffff',
                  color: '#000000', boxShadow: '4px 4px 0px #fbbf24', transition: 'all 0.15s ease',
                  width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-4px, -4px)'; e.currentTarget.style.boxShadow = '8px 8px 0px #fbbf24'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px #fbbf24'; }}
              >
                <m.icon size={36} style={{ color: '#22c55e' }} />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 950 }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{m.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => router.push('/dash/student/games')}
            style={{
              marginTop: '12px', padding: '10px 20px', background: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white',
              fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <ArrowLeft size={16} /> Back to Hub
          </button>
        </div>
      </div>
    );
  }

  if (gameMode === 'matching') {
    return (
      <div className="fullscreen-chess-lobby" style={{
        position: 'absolute', inset: 0, height: '100%', width: '100%', overflow: 'hidden',
        background: '#0b0f19', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '24px', boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '32px', color: '#ffffff', textAlign: 'center'
        }}>
          <div className="radar-container" style={{
            position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="pulse" style={{
              position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
              border: '3px solid #fbbf24', animation: 'ping 1.5s infinite ease-out'
            }} />
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #000000',
              background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '4px 4px 0px #fbbf24', zIndex: 2
            }}>
              <Users size={32} color="#22c55e" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Searching for Matches</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Connecting with online student graders...</p>
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
      </div>
    );
  }

  // Expanded CSS height rules to fit standard screen viewports without vertical overflow
  const boardSizeCalc = 'min(76vw - 260px, 52vh)';
  const gutterWidth = 'calc(' + boardSizeCalc + ' * 0.15)';
  const lastMoveStr = state.history.length > 0 ? state.history[state.history.length - 1].move : 'None';
  const formattedLastMove = lastMoveStr;

  return (
    <div className="chess-hud-wrapper" style={{
      position: 'absolute',
      inset: 0,
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      background: '#0b0f19', // Dark navy background
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 18px',
      boxSizing: 'border-box',
      gap: '8px'
    }}>
      
      {/* 1. COMPACT HUD HEADER */}
      <div className="chess-compact-header" style={{
        width: '100%',
        maxWidth: '1250px',
        background: '#1e293b',
        border: '3px solid #000000',
        borderRadius: '20px',
        padding: '6px 20px',
        boxShadow: '4px 4px 0px #000000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff',
        flexShrink: 0
      }}>
        {/* Left Info: Back & Player Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={quitToLobby}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '2px solid #000000',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '1.5px 1.5px 0px #000000'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 900 }}>
            <span>♟️ You (White)</span>
            <span style={{ color: '#64748b' }}>vs</span>
            <span>🤖 {matchedOpponent}</span>
          </div>
        </div>

        {/* Center Indicator with Live Game Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '2px solid #000000',
            padding: '4px 12px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 800,
            fontFamily: 'monospace',
            boxShadow: '1.5px 1.5px 0px #000000'
          }}>
            ⏱️ {formatTimer(elapsedTime)}
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            padding: '4px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '11px',
            fontWeight: 900
          }}>
            Difficulty: <span style={{ color: '#fbbf24' }}>Beginner</span>
          </div>
        </div>

        {/* Right view toggle controls */}
        <button
          onClick={() => setView3D(!view3D)}
          style={{
            padding: '4px 12px',
            background: '#fbbf24',
            border: '2.5px solid #000000',
            borderRadius: '8px',
            fontWeight: 900,
            fontSize: '11px',
            color: '#000000',
            cursor: 'pointer',
            boxShadow: '2px 2px 0px #000000',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Layers size={12} /> {view3D ? 'Flat View' : '3D View'}
        </button>
      </div>

      {/* 2. CENTER SECTION: Stacked Computer status card, Board Row, and User status card */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flex: 1,
        gap: '6px',
        overflow: 'hidden'
      }}>
        {/* COMPUTER CARD */}
        <div className="player-status-card" style={{
          width: boardSizeCalc,
          background: '#1e293b',
          border: '2.5px solid #000000',
          borderRadius: '12px',
          padding: '6px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box',
          opacity: state.turn === 'b' ? 1 : 0.6,
          transition: 'all 0.2s ease',
          borderColor: state.turn === 'b' ? '#fbbf24' : '#000000',
          boxShadow: state.turn === 'b' ? '0 0 10px rgba(251, 191, 36, 0.3)' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '12px', fontWeight: 800 }}>
            <span>🤖</span>
            <span>Computer (Black)</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 900, color: state.turn === 'b' ? '#fbbf24' : '#94a3b8' }}>
            {state.turn === 'b' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="spinner-hud" /> Computer is thinking...
              </span>
            ) : (
              '💤 Waiting'
            )}
          </div>
        </div>

        {/* MAIN GAME ROW */}
        <div className="main-game-row" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: '16px',
          overflow: 'hidden'
        }}>
          {/* Left Gutter: Black Captured Panel */}
          <div style={{
            width: gutterWidth,
            height: boardSizeCalc,
            background: '#273246',
            border: '2.5px solid #42516B',
            borderRadius: '20px',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.3), 3px 3px 0px #000000',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ 
              fontSize: '9px', fontWeight: 950, color: '#94a3b8', 
              textAlign: 'center', borderBottom: '1.5px solid #42516B', 
              paddingBottom: '4px', marginBottom: '6px', textTransform: 'uppercase', whiteSpace: 'nowrap'
            }}>
              ⬛ Black Captured ({state.captured.w.length})
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '6px', 
              justifyItems: 'center',
              alignContent: 'start',
              overflowY: 'auto',
              flex: 1,
              padding: '2px'
            }}>
              {state.captured.w.length === 0 ? (
                <div style={{ gridColumn: 'span 2', color: '#64748b', fontSize: '9px', fontStyle: 'italic', marginTop: '12px', textAlign: 'center' }}>
                  Empty
                </div>
              ) : (
                state.captured.w.map((sym, idx) => (
                  <span key={idx} style={{ 
                    color: '#000000', 
                    fontSize: 'min(3.2vw, 3.2vh, 24px)',
                    textShadow: '0 0 3px #ffffff, 0 0 1px #ffffff',
                    userSelect: 'none',
                    animation: 'piecePop 0.2s ease-out'
                  }}>{sym}</span>
                ))
              )}
            </div>
          </div>

          {/* Centered Board Casing (Grid centered mathematically) */}
          <div style={{
            background: '#ffffff',
            border: '4px solid #000000',
            borderRadius: '24px',
            padding: '12px',
            boxShadow: '8px 8px 0px #000000',
            width: boardSizeCalc,
            height: boardSizeCalc,
            boxSizing: 'border-box',
            display: 'grid',
            placeItems: 'center',
            perspective: '1200px',
            overflow: 'visible', // Set to visible to prevent 3D rotation clipping!
            position: 'relative',
            transition: 'all 0.2s ease-out'
          }}>
            {/* Green and Cream Chessboard Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gridTemplateRows: 'repeat(8, 1fr)', // Force exactly 8 equal rows!
              borderRadius: '16px',
              overflow: 'visible',
              border: '2.5px solid #000000',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              transformStyle: 'preserve-3d',
              transform: view3D ? 'rotateX(20deg) scale(0.94)' : 'none',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: view3D ? '0 12px 24px rgba(0,0,0,0.18)' : 'none'
            }}>
              {state.board.map((row, r) => row.map((piece, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSelected = selected?.r === r && selected?.c === c;
                const isValidMove = validMoves.some(m => m.r === r && m.c === c);
                const isCheck = checkPos?.r === r && checkPos?.c === c;

                const borderTopLeftRadius = (r === 0 && c === 0) ? '13px' : '0px';
                const borderTopRightRadius = (r === 0 && c === 7) ? '13px' : '0px';
                const borderBottomLeftRadius = (r === 7 && c === 0) ? '13px' : '0px';
                const borderBottomRightRadius = (r === 7 && c === 7) ? '13px' : '0px';

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    style={{
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
                      cursor: (aiThinking || isGameOver) ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      transition: 'background-color 0.2s ease, transform 0.15s ease'
                    }}
                    className="chess-square"
                  >
                    {piece && (
                      <span style={{ 
                        fontSize: 'clamp(1.6rem, calc(' + boardSizeCalc + ' * 0.095), 3.4rem)',
                        color: piece.color === 'w' ? '#ffffff' : '#000000',
                        textShadow: piece.color === 'w' 
                          ? '2px 2px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000' 
                          : 'none',
                        userSelect: 'none',
                        zIndex: 2,
                        transform: view3D ? 'rotateX(-20deg) translateZ(8px)' : 'none',
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

          {/* Right Gutter: White Captured Panel */}
          <div style={{
            width: gutterWidth,
            height: boardSizeCalc,
            background: '#273246',
            border: '2.5px solid #42516B',
            borderRadius: '20px',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.3), 3px 3px 0px #000000',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ 
              fontSize: '9px', fontWeight: 950, color: '#94a3b8', 
              textAlign: 'center', borderBottom: '1.5px solid #42516B', 
              paddingBottom: '4px', marginBottom: '6px', textTransform: 'uppercase', whiteSpace: 'nowrap'
            }}>
              ⬜ White Captured ({state.captured.b.length})
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '6px', 
              justifyItems: 'center',
              alignContent: 'start',
              overflowY: 'auto',
              flex: 1,
              padding: '2px'
            }}>
              {state.captured.b.length === 0 ? (
                <div style={{ gridColumn: 'span 2', color: '#64748b', fontSize: '9px', fontStyle: 'italic', marginTop: '12px', textAlign: 'center' }}>
                  Empty
                </div>
              ) : (
                state.captured.b.map((sym, idx) => (
                  <span key={idx} style={{ 
                    color: '#ffffff', 
                    fontSize: 'min(3.2vw, 3.2vh, 24px)',
                    textShadow: '2px 2px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000',
                    userSelect: 'none',
                    animation: 'piecePop 0.2s ease-out'
                  }}>{sym}</span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* USER CARD */}
        <div className="player-status-card" style={{
          width: boardSizeCalc,
          background: '#1e293b',
          border: '2.5px solid #000000',
          borderRadius: '12px',
          padding: '6px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box',
          opacity: state.turn === 'w' ? 1 : 0.6,
          transition: 'all 0.2s ease',
          borderColor: state.turn === 'w' ? '#22c55e' : '#000000',
          boxShadow: state.turn === 'w' ? '0 0 10px rgba(34, 197, 94, 0.3)' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '12px', fontWeight: 800 }}>
            <span>🙂</span>
            <span>You (White)</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 900, color: state.turn === 'w' ? '#22c55e' : '#94a3b8' }}>
            {state.turn === 'w' ? (
              <span>✓ Your Turn</span>
            ) : (
              '💤 Waiting'
            )}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM DETAILS HUD */}
      <div className="chess-hud-bottom" style={{
        width: boardSizeCalc,
        background: '#1e293b',
        border: '3px solid #000000',
        borderRadius: '18px',
        padding: '8px 16px',
        boxShadow: '4px 4px 0px #000000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}>
        {/* Left detailed Grid slots */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px',
          flex: 1,
          fontSize: '11px',
          color: '#e2e8f0',
          marginRight: '12px'
        }}>
          <div>
            <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '8px', textTransform: 'uppercase' }}>Last Move</div>
            <div style={{ fontWeight: 900, color: '#fbbf24', fontSize: '11px', whiteSpace: 'nowrap' }}>{formattedLastMove}</div>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '8px', textTransform: 'uppercase' }}>Move Number</div>
            <div style={{ fontWeight: 900, fontSize: '11px' }}>{state.history.length}</div>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '8px', textTransform: 'uppercase' }}>Turn</div>
            <div style={{ fontWeight: 900, fontSize: '11px', color: state.turn === 'w' ? '#3b82f6' : '#fbbf24' }}>
              {state.turn === 'w' ? 'White' : 'Black'}
            </div>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '8px', textTransform: 'uppercase' }}>Game Status</div>
            <div style={{ fontWeight: 900, fontSize: '11px', color: inCheck ? '#ef4444' : '#16a34a', whiteSpace: 'nowrap' }}>
              {gameStatus === 'playing' ? (inCheck ? 'In Check' : 'In Progress') : (gameStatus === 'checkmate' ? 'Checkmate' : 'Draw')}
            </div>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '8px', textTransform: 'uppercase' }}>Captured</div>
            <div style={{ fontWeight: 900, fontSize: '11px' }}>
              W: {state.captured.b.length} • B: {state.captured.w.length}
            </div>
          </div>
        </div>

        {/* Action Controls: Undo and Reset */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={undoMove}
            disabled={state.history.length === 0 || aiThinking}
            style={{
              padding: '6px 12px', background: '#3b82f6', color: '#ffffff', border: '2.5px solid #000000',
              borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: (state.history.length === 0 || aiThinking) ? 'not-allowed' : 'pointer',
              boxShadow: '2px 2px 0px #000000', opacity: (state.history.length === 0 || aiThinking) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s'
            }}
            className="hud-action-btn"
          >
            <Undo2 size={12} /> Undo
          </button>
          <button
            onClick={resetGame}
            disabled={aiThinking}
            style={{
              padding: '6px 12px', background: '#ef4444', color: '#ffffff', border: '2.5px solid #000000',
              borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: aiThinking ? 'not-allowed' : 'pointer',
              boxShadow: '2px 2px 0px #000000', display: 'flex', alignItems: 'center', gap: '4px', opacity: aiThinking ? 0.5 : 1,
              transition: 'all 0.15s'
            }}
            className="hud-action-btn"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      <style jsx global>{`
        /* Avoid any viewport scroll */
        html, body, #__next {
          overflow: hidden !important;
          height: 100vh !important;
          width: 100vw !important;
        }

        .chess-hud-wrapper * {
          box-sizing: border-box;
        }

        /* Hover animation effects */
        .chess-square:hover {
          transform: scale(1.04);
          z-index: 5;
        }

        .hud-action-btn:hover:not(:disabled) {
          transform: translate(-1px, -1px);
          box-shadow: 3.5px 3.5px 0px #000000 !important;
        }
        
        .hud-action-btn:active:not(:disabled) {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0px #000000 !important;
        }

        /* Jumping animation pop for captured pieces */
        @keyframes piecePop {
          0% { transform: scale(0.6); opacity: 0.2; }
          70% { transform: scale(1.25); }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Continuous thinking spinner */
        .spinner-hud {
          width: 10px;
          height: 10px;
          border: 2px solid rgba(251, 191, 36, 0.25);
          border-top-color: #fbbf24;
          border-radius: 50%;
          display: inline-block;
          animation: spin-hud-rot 0.8s infinite linear;
        }

        @keyframes spin-hud-rot {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulsePulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
