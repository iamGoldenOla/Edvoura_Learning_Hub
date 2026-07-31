'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown, RotateCcw, Layers, User, Users,
  Monitor, ArrowLeft, Undo2, Clock, Swords, Flag, Handshake
} from 'lucide-react';

/* ═══════════════════════ WEB AUDIO API SFX SYNTHESIZER ═══════════════════════ */
function playChessSFX(type: 'move' | 'capture' | 'check' | 'victory') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'move') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'capture') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'check') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'victory') {
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

/* ═══════════════════════ TYPES ═══════════════════════ */
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type Color = 'w' | 'b';
type Piece = { type: PieceType; color: Color };
type Board = (Piece | null)[][];
type Position = { r: number; c: number };
type Move = { from: Position; to: Position };

/* ═══════════════════════ CONSTANTS ═══════════════════════ */
const INIT: Board = [
  [{ type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }],
  [{ type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [{ type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
  [{ type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }],
];

const SYM: Record<Color, Record<PieceType, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
};

const VAL: Record<PieceType, number> = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

/* ═══════════════════════ GAME STATE ═══════════════════════ */
interface GS {
  board: Board;
  turn: Color;
  castling: { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean };
  ep: Position | null;
  history: { mv: string; san: string; board: Board }[];
  cap: { w: string[]; b: string[] };
}

const INIT_STATE: GS = {
  board: INIT.map(r => [...r]), turn: 'w',
  castling: { wK: true, wQ: true, bK: true, bQ: true },
  ep: null, history: [], cap: { w: [], b: [] }
};

/* ═══════════════════════ CHESS ENGINE ═══════════════════════ */
const opp = (c: Color): Color => c === 'w' ? 'b' : 'w';
const inB = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

const pseudoMoves = (b: Board, r: number, c: number, cas: GS['castling'], ep: Position | null): Position[] => {
  const p = b[r][c]; if (!p) return [];
  const ms: Position[] = [];
  const { type: t, color: cl } = p;
  const d = cl === 'w' ? -1 : 1;
  const sr = cl === 'w' ? 6 : 1;

  if (t === 'p') {
    if (inB(r + d, c) && !b[r + d][c]) {
      ms.push({ r: r + d, c });
      if (r === sr && inB(r + 2 * d, c) && !b[r + 2 * d][c]) ms.push({ r: r + 2 * d, c });
    }
    for (const dc of [-1, 1]) {
      if (inB(r + d, c + dc)) {
        const tg = b[r + d][c + dc];
        if ((tg && tg.color !== cl) || (ep && ep.r === r + d && ep.c === c + dc))
          ms.push({ r: r + d, c: c + dc });
      }
    }
  } else if (t === 'n') {
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
      if (inB(r + dr, c + dc) && (!b[r + dr][c + dc] || b[r + dr][c + dc]!.color !== cl))
        ms.push({ r: r + dr, c: c + dc });
    }
  } else if (t === 'k') {
    for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
      if (inB(r + dr, c + dc) && (!b[r + dr][c + dc] || b[r + dr][c + dc]!.color !== cl))
        ms.push({ r: r + dr, c: c + dc });
    }
    if (cl === 'w' && r === 7 && c === 4) {
      if (cas.wK && !b[7][5] && !b[7][6] && b[7][7]?.type === 'r') ms.push({ r: 7, c: 6 });
      if (cas.wQ && !b[7][3] && !b[7][2] && !b[7][1] && b[7][0]?.type === 'r') ms.push({ r: 7, c: 2 });
    } else if (cl === 'b' && r === 0 && c === 4) {
      if (cas.bK && !b[0][5] && !b[0][6] && b[0][7]?.type === 'r') ms.push({ r: 0, c: 6 });
      if (cas.bQ && !b[0][3] && !b[0][2] && !b[0][1] && b[0][0]?.type === 'r') ms.push({ r: 0, c: 2 });
    }
  } else {
    const dirs: number[][] = [];
    if (t === 'b' || t === 'q') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    if (t === 'r' || t === 'q') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    for (const [dr, dc] of dirs) {
      let cr = r + dr, cc = c + dc;
      while (inB(cr, cc)) {
        const tg = b[cr][cc];
        if (!tg) ms.push({ r: cr, c: cc });
        else { if (tg.color !== cl) ms.push({ r: cr, c: cc }); break; }
        cr += dr; cc += dc;
      }
    }
  }
  return ms;
};

const findKing = (b: Board, c: Color): Position | null => {
  for (let r = 0; r < 8; r++)
    for (let col = 0; col < 8; col++)
      if (b[r][col]?.type === 'k' && b[r][col]?.color === c) return { r, c: col };
  return null;
};

const isAttacked = (b: Board, pos: Position, byColor: Color): boolean => {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c]?.color === byColor) {
        const ms = pseudoMoves(b, r, c, { wK: false, wQ: false, bK: false, bQ: false }, null);
        if (ms.some(m => m.r === pos.r && m.c === pos.c)) return true;
      }
  return false;
};

const inCheck = (b: Board, c: Color): boolean => {
  const kp = findKing(b, c);
  return kp ? isAttacked(b, kp, opp(c)) : false;
};

const execMove = (gs: GS, from: Position, to: Position): GS => {
  const b = gs.board.map(r => [...r]);
  const p = b[from.r][from.c]!;
  const capPiece = b[to.r][to.c];
  b[from.r][from.c] = null;

  let isEP = false;
  if (p.type === 'p' && gs.ep && to.r === gs.ep.r && to.c === gs.ep.c) {
    b[from.r][to.c] = null; isEP = true;
  }

  // Promotion
  let finalP: Piece = p;
  if (p.type === 'p' && (to.r === 0 || to.r === 7)) finalP = { type: 'q', color: p.color };
  b[to.r][to.c] = finalP;

  // Castling
  if (p.type === 'k' && Math.abs(to.c - from.c) === 2) {
    if (to.c === 6) { b[to.r][5] = b[to.r][7]; b[to.r][7] = null; }
    if (to.c === 2) { b[to.r][3] = b[to.r][0]; b[to.r][0] = null; }
  }

  const cas = { ...gs.castling };
  if (p.type === 'k') { if (p.color === 'w') { cas.wK = false; cas.wQ = false; } else { cas.bK = false; cas.bQ = false; } }
  if (p.type === 'r') {
    if (from.r === 7 && from.c === 7) cas.wK = false;
    if (from.r === 7 && from.c === 0) cas.wQ = false;
    if (from.r === 0 && from.c === 7) cas.bK = false;
    if (from.r === 0 && from.c === 0) cas.bQ = false;
  }

  const ep = (p.type === 'p' && Math.abs(to.r - from.r) === 2)
    ? { r: (from.r + to.r) / 2, c: from.c } : null;

  const newCap = { w: [...gs.cap.w], b: [...gs.cap.b] };
  if (capPiece) {
    const s = SYM[capPiece.color][capPiece.type];
    if (p.color === 'w') newCap.w.push(s); else newCap.b.push(s);
  } else if (isEP) {
    const s = SYM[opp(p.color)].p;
    if (p.color === 'w') newCap.w.push(s); else newCap.b.push(s);
  }

  // Generate SAN Notation
  let san = '';
  if (p.type === 'k' && Math.abs(to.c - from.c) === 2) {
    san = to.c === 6 ? 'O-O' : 'O-O-O';
  } else {
    const pieceSym = p.type === 'p' ? '' : p.type.toUpperCase();
    const isCap = capPiece || isEP;
    const fromStr = p.type === 'p' && isCap ? FILES[from.c] : '';
    const capStr = isCap ? 'x' : '';
    const destStr = `${FILES[to.c]}${RANKS[to.r]}`;
    san = `${pieceSym}${fromStr}${capStr}${destStr}`;
  }

  const coordStr = `${FILES[from.c]}${RANKS[from.r]}-${FILES[to.c]}${RANKS[to.r]}`;

  return {
    board: b, turn: opp(p.color), castling: cas, ep,
    history: [...gs.history, { mv: coordStr, san, board: b }], cap: newCap
  };
};

const legalMoves = (b: Board, r: number, c: number, cas: GS['castling'], ep: Position | null): Position[] => {
  const p = b[r][c]; if (!p) return [];
  const pm = pseudoMoves(b, r, c, cas, ep);
  return pm.filter(to => {
    if (p.type === 'k' && Math.abs(to.c - c) === 2) {
      if (inCheck(b, p.color)) return false;
      const step = (to.c - c) / 2;
      if (isAttacked(b, { r, c: c + step }, opp(p.color))) return false;
    }
    const dummy: GS = { board: b, turn: p.color, castling: cas, ep, history: [], cap: { w: [], b: [] } };
    const next = execMove(dummy, { r, c }, to);
    return !inCheck(next.board, p.color);
  });
};

const allLegal = (b: Board, turn: Color, cas: GS['castling'], ep: Position | null): Move[] => {
  const res: Move[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c]?.color === turn)
        for (const to of legalMoves(b, r, c, cas, ep))
          res.push({ from: { r, c }, to });
  return res;
};

/* ═══════════════════════ ENGINE EVALUATION ═══════════════════════ */
const evalBoard = (b: Board): number => {
  let s = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (p) {
        let v = VAL[p.type];
        if (p.type === 'p') v += (p.color === 'w' ? 7 - r : r);
        s += p.color === 'w' ? v : -v;
      }
    }
  return s / 10;
};

const minimax = (b: Board, depth: number, alpha: number, beta: number, isMax: boolean, cas: GS['castling'], ep: Position | null): number => {
  if (depth === 0) return evalBoard(b);
  const moves = allLegal(b, isMax ? 'w' : 'b', cas, ep);
  if (moves.length === 0) return inCheck(b, isMax ? 'w' : 'b') ? (isMax ? -999 : 999) : 0;

  if (isMax) {
    let maxE = -Infinity;
    for (const m of moves) {
      const next = execMove({ board: b, turn: 'w', castling: cas, ep, history: [], cap: { w: [], b: [] } }, m.from, m.to);
      maxE = Math.max(maxE, minimax(next.board, depth - 1, alpha, beta, false, next.castling, next.ep));
      alpha = Math.max(alpha, maxE); if (beta <= alpha) break;
    }
    return maxE;
  } else {
    let minE = Infinity;
    for (const m of moves) {
      const next = execMove({ board: b, turn: 'b', castling: cas, ep, history: [], cap: { w: [], b: [] } }, m.from, m.to);
      minE = Math.min(minE, minimax(next.board, depth - 1, alpha, beta, true, next.castling, next.ep));
      beta = Math.min(beta, minE); if (beta <= alpha) break;
    }
    return minE;
  }
};

const bestMoveAI = (gs: GS): Move | null => {
  const moves = allLegal(gs.board, 'b', gs.castling, gs.ep);
  if (moves.length === 0) return null;
  let best: Move = moves[0];
  let minE = Infinity;
  for (const m of moves) {
    const next = execMove(gs, m.from, m.to);
    const score = minimax(next.board, 2, -Infinity, Infinity, true, next.castling, next.ep);
    if (score < minE) { minE = score; best = m; }
  }
  return best;
};

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function ChessPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'lobby' | 'matching' | 'playing'>('lobby');
  const [oppType, setOppType] = useState<'ai' | 'local' | 'match'>('ai');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [boardTheme, setBoardTheme] = useState<'wood' | 'green' | 'blue'>('wood');
  const [copiedLink, setCopiedLink] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const THEME_COLORS = {
    wood: { light: '#f0d9b5', dark: '#b58863' },   // Grandmaster Classic Wood (Cream & Walnut)
    green: { light: '#eeeed2', dark: '#769656' },  // Tournament Green (Ivory & Forest)
    blue: { light: '#e2e8f0', dark: '#3b82f6' }    // Vivid Royal Blue
  };

  const generateRoomCode = useCallback(() => {
    const code = 'CHESS-' + Math.floor(1000 + Math.random() * 9000);
    setRoomCode(code);
    return code;
  }, []);

  const copyInviteLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode || generateRoomCode()}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    playChessSFX('check');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const [gs, setGS] = useState<GS>(INIT_STATE);
  const [sel, setSel] = useState<Position | null>(null);
  const [valid, setValid] = useState<Position[]>([]);
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState<string>('Active');
  const [flat, setFlat] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (mode !== 'playing') return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [mode]);

  const reset = () => {
    setGS(INIT_STATE); setSel(null); setValid([]); setThinking(false); setStatus('Active'); setElapsed(0);
  };

  const makeMove = useCallback((from: Position, to: Position) => {
    const isCap = !!gs.board[to.r][to.c];
    const next = execMove(gs, from, to);
    const isChk = inCheck(next.board, next.turn);
    const moves = allLegal(next.board, next.turn, next.castling, next.ep);

    if (isChk) {
      if (moves.length === 0) {
        setStatus(`Checkmate! ${gs.turn === 'w' ? 'White' : 'Black'} wins!`);
        playChessSFX('victory');
      } else {
        setStatus(`Check! ${next.turn === 'w' ? 'White' : 'Black'} is in check.`);
        playChessSFX('check');
      }
    } else if (moves.length === 0) {
      setStatus('Stalemate! Game is a draw.');
    } else {
      setStatus('Active');
      if (isCap) playChessSFX('capture'); else playChessSFX('move');
    }

    setGS(next); setSel(null); setValid([]);
  }, [gs]);

  // AI Move Automation
  useEffect(() => {
    const isGameOver = status.includes('Checkmate') || status.includes('Stalemate') || status.includes('Resigned') || status.includes('Draw');
    if (mode === 'playing' && oppType === 'ai' && gs.turn === 'b' && !isGameOver) {
      setThinking(true);
      const timer = setTimeout(() => {
        const bm = bestMoveAI(gs);
        if (bm) {
          const isCap = !!gs.board[bm.to.r][bm.to.c];
          const next = execMove(gs, bm.from, bm.to);
          const isChk = inCheck(next.board, next.turn);
          const moves = allLegal(next.board, next.turn, next.castling, next.ep);

          if (isChk) {
            if (moves.length === 0) {
              setStatus('Checkmate! Black wins!');
              playChessSFX('victory');
            } else {
              setStatus('Check! White is in check.');
              playChessSFX('check');
            }
          } else if (moves.length === 0) {
            setStatus('Stalemate! Game is a draw.');
          } else {
            setStatus('Active');
            if (isCap) playChessSFX('capture'); else playChessSFX('move');
          }
          setGS(next);
          setSel(null);
          setValid([]);
        }
        setThinking(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [gs, mode, oppType, status]);

  const click = (r: number, c: number) => {
    if (thinking || status.includes('Checkmate') || status.includes('Stalemate') || status.includes('Resigned')) return;
    if (sel) {
      if (valid.some(m => m.r === r && m.c === c)) { makeMove(sel, { r, c }); return; }
    }
    const pc = gs.board[r][c];
    const ok = oppType === 'local' ? gs.turn : 'w';
    if (pc && pc.color === ok) { setSel({ r, c }); setValid(legalMoves(gs.board, r, c, gs.castling, gs.ep)); }
    else { setSel(null); setValid([]); }
  };

  const start = (t: 'ai' | 'local' | 'match') => {
    setOppType(t); reset();
    if (t === 'match') setMode('matching');
    else { setOppName(t === 'ai' ? 'Computer (AI)' : 'Player 2 (Local)'); setMode('playing'); }
  };

  const resign = () => {
    setStatus(`${gs.turn === 'w' ? 'White' : 'Black'} Resigned.`);
    playChessSFX('victory');
  };

  const offerDraw = () => {
    setStatus('Game ended in Mutual Draw.');
  };

  const undo = () => {
    if (gs.history.length === 0 || thinking) return;
    const steps = oppType === 'ai' && gs.history.length >= 2 ? 2 : 1;
    const targetIdx = gs.history.length - steps;
    if (targetIdx <= 0) { reset(); return; }
    const prevEntry = gs.history[targetIdx - 1];
    setGS({
      board: prevEntry.board,
      turn: targetIdx % 2 === 0 ? 'w' : 'b',
      castling: { wK: true, wQ: true, bK: true, bQ: true },
      ep: null,
      history: gs.history.slice(0, targetIdx),
      cap: { w: [], b: [] }
    });
    setSel(null); setValid([]); setStatus('Active');
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const currentEval = evalBoard(gs.board);
  const checkPos = inCheck(gs.board, gs.turn) ? findKing(gs.board, gs.turn) : null;

  /* ═══════════ LOBBY ═══════════ */
  if (mode === 'lobby') return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 150px)', background: '#0b0f19', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', borderRadius: '28px', boxSizing: 'border-box', border: '3px solid #000', boxShadow: '8px 8px 0px #000' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', color: '#fff', textAlign: 'center', maxWidth: '650px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fbbf24' }}>
          <Crown size={40} />
          <h1 style={{ fontSize: '32px', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>Chess Zone</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>Play with SFX audio, engine evaluation bar, and PGN move notation!</p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'nowrap', justifyContent: 'center', width: '100%', marginTop: '12px' }}>
          {([
            { t: 'ai' as const, title: 'Play vs Computer', desc: 'Minimax AI engine', Icon: Monitor },
            { t: 'local' as const, title: 'Pass & Play', desc: 'Local 2-player', Icon: Users },
            { t: 'match' as const, title: 'Grade Match', desc: 'Find other grades', Icon: User },
          ]).map(m => (
            <button key={m.t} onClick={() => start(m.t)} style={{ padding: '16px 12px', borderRadius: '16px', border: '3px solid #000', cursor: 'pointer', fontWeight: 900, background: '#fff', color: '#000', boxShadow: '4px 4px 0px #fbbf24', transition: 'all .15s', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '140px', maxWidth: '190px' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #fbbf24'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 #fbbf24'; }}>
              <m.Icon size={28} style={{ color: '#22c55e' }} />
              <div><div style={{ fontSize: '14px', fontWeight: 950 }}>{m.title}</div><div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{m.desc}</div></div>
            </button>
          ))}
        </div>
        <button onClick={() => router.push('/dash/student/games')} style={{ marginTop: '16px', padding: '10px 20px', background: 'rgba(255,255,255,.08)', border: '2px solid rgba(255,255,255,.15)', borderRadius: '12px', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back to Hub
        </button>
      </div>
    </div>
  );

  /* ═══════════ MATCHING ═══════════ */
  if (mode === 'matching') return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 150px)', background: '#0b0f19', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', borderRadius: '28px', border: '3px solid #000', boxShadow: '8px 8px 0 #000', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', color: '#fff', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #fbbf24', animation: 'chPing 1.5s infinite ease-out' }} />
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 0 #fbbf24', zIndex: 2 }}><Users size={28} color="#22c55e" /></div>
        </div>
        <div><h3 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 6px', textTransform: 'uppercase' }}>Searching for Match</h3><p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Connecting with online students...</p></div>
        <button onClick={() => setMode('lobby')} style={{ padding: '10px 20px', borderRadius: '12px', border: '2px solid #000', cursor: 'pointer', fontSize: '13px', fontWeight: 900, background: '#fee2e2', color: '#ef4444', boxShadow: '2px 2px 0 #000' }}>Cancel</button>
        <style jsx>{`@keyframes chPing { 0% { transform:scale(.6);opacity:1 } 100% { transform:scale(1.6);opacity:0 } }`}</style>
      </div>
    </div>
  );

  /* ═══════════ PLAYING ═══════════ */
  return (
    <div className="chess-root" style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      overflow: 'hidden', background: '#0b0f19',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      boxSizing: 'border-box'
    }}>
      {/* ─── TOP BAR ─── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '4px 12px', color: '#fff', background: '#111827',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setMode('lobby')} style={{ background: 'none', border: '2px solid #334155', borderRadius: '8px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
            <ArrowLeft size={14} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 800 }}>♟ You <span style={{ color: '#475569', margin: '0 6px' }}>vs</span> 🤖 {oppName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Board Mat Theme Toggle */}
          <div style={{ display: 'flex', gap: '3px', background: '#1e293b', padding: '2px 4px', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', alignSelf: 'center', padding: '0 4px' }}>Board Mat:</span>
            {[
              { id: 'wood', label: '🪵 Wood' },
              { id: 'green', label: '🟢 Green' },
              { id: 'blue', label: '🔵 Blue' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setBoardTheme(t.id as any)}
                style={{
                  padding: '2px 8px', borderRadius: '6px', border: 'none',
                  fontSize: '10px', fontWeight: 900, cursor: 'pointer',
                  background: boardTheme === t.id ? '#fbbf24' : 'transparent',
                  color: boardTheme === t.id ? '#000' : '#cbd5e1'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ background: '#1e293b', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', border: '1px solid #334155' }}>
            <Clock size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />{fmt(elapsed)}
          </div>
          <div style={{ background: '#1e293b', padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, border: '1px solid #334155' }}>
            <Swords size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />Engine: {currentEval > 0 ? `+${currentEval.toFixed(1)}` : currentEval.toFixed(1)}
          </div>
          <button onClick={() => setFlat(!flat)} style={{ background: '#fbbf24', border: '2px solid #000', borderRadius: '8px', padding: '3px 10px', fontWeight: 900, fontSize: '11px', cursor: 'pointer', color: '#000', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={11} />{flat ? '3D' : 'Flat'}
          </button>
        </div>
      </div>

      {/* ─── MAIN AREA: LEFT PANEL | EVAL BAR | BOARD | RIGHT PANEL ─── */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        overflow: 'hidden', padding: '4px 6px', gap: '6px'
      }}>
        {/* LEFT PANEL */}
        <div style={{ flex: '0 0 150px', width: '150px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
          {/* Computer Card */}
          <div style={{
            background: gs.turn === 'b' ? '#1a1a2e' : '#111827',
            border: gs.turn === 'b' ? '2px solid #fbbf24' : '2px solid #1e293b',
            borderRadius: '14px', padding: '8px 10px',
            boxShadow: gs.turn === 'b' ? '0 0 12px rgba(251,191,36,.2)' : 'none',
            transition: 'all .3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1e293b', border: '1.5px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🤖</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#e2e8f0' }}>Computer</div>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#64748b' }}>Black Pieces</div>
                </div>
              </div>
              <div style={{ fontSize: '9px', fontWeight: 900, color: gs.turn === 'b' ? '#fbbf24' : '#475569' }}>
                {gs.turn === 'b' ? (thinking ? 'THINK' : 'ACTIVE') : 'WAIT'}
              </div>
            </div>
          </div>

          {/* Captured Black */}
          <div style={{
            flex: 1, background: '#111827', border: '2px solid #1e293b',
            borderRadius: '14px', padding: '8px 10px', display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
              ⬛ Captured by White ({gs.cap.w.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', flex: 1, alignContent: 'start' }}>
              {gs.cap.w.length === 0
                ? <span style={{ color: '#334155', fontSize: '9px', fontStyle: 'italic' }}>None yet</span>
                : gs.cap.w.map((s, i) => <span key={i} style={{ fontSize: '18px' }}>{s}</span>)}
            </div>
          </div>

          {/* Move History / SAN PGN */}
          <div style={{
            background: '#111827', border: '2px solid #1e293b',
            borderRadius: '14px', padding: '8px 10px', maxHeight: '110px', overflowY: 'auto'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>PGN Move Log</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {gs.history.length === 0
                ? <span style={{ color: '#334155', fontSize: '9px', fontStyle: 'italic' }}>No moves yet</span>
                : gs.history.map((h, i) => (
                  <div key={i} style={{ fontSize: '10px', fontWeight: 700, color: i === gs.history.length - 1 ? '#fbbf24' : '#94a3b8', fontFamily: 'monospace' }}>
                    {Math.floor(i / 2) + 1}. {h.san}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ─── REAL-TIME ENGINE EVALUATION BAR ─── */}
        <div style={{
          width: '12px', height: '100%', background: '#000', borderRadius: '6px',
          border: '1.5px solid #334155', overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }} title={`Engine Eval: ${currentEval > 0 ? `+${currentEval.toFixed(1)}` : currentEval.toFixed(1)}`}>
          <div style={{
            height: `${Math.min(Math.max(50 - currentEval * 5, 5), 95)}%`,
            background: '#000000', transition: 'height 0.4s ease'
          }} />
          <div style={{
            flex: 1, background: '#ffffff', transition: 'height 0.4s ease'
          }} />
        </div>

        {/* ─── CHESSBOARD (fills all remaining space) ─── */}
        <div style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '0'
        }}>
          <div style={{
            height: '100%',
            maxWidth: '100%',
            aspectRatio: '1 / 1',
            borderRadius: '16px',
            padding: '2px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%', height: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gridTemplateRows: 'repeat(8, 1fr)',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #000',
              boxShadow: '3px 3px 0px #000',
              transformStyle: 'preserve-3d',
              transform: flat ? 'none' : 'rotateX(12deg) scale(0.97)',
              transition: 'transform .4s cubic-bezier(.16,1,.3,1)',
              perspective: '1200px'
            }}>
              {gs.board.map((row, r) => row.map((pc, c) => {
                const dark = (r + c) % 2 === 1;
                const isSel = sel?.r === r && sel?.c === c;
                const isValid = valid.some(m => m.r === r && m.c === c);
                const isCheck = checkPos?.r === r && checkPos?.c === c;
                const palette = THEME_COLORS[boardTheme];

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => click(r, c)}
                    style={{
                      position: 'relative',
                      background: isCheck ? '#ef4444' : isSel ? '#f59e0b' : dark ? palette.dark : palette.light,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', userSelect: 'none',
                      transition: 'background .15s'
                    }}
                  >
                    {pc && (
                      <span style={{
                        fontSize: 'calc(min(100vw, 100vh) / 14)',
                        lineHeight: 1,
                        color: pc.color === 'w' ? '#ffffff' : '#0b0f19',
                        filter: pc.color === 'w' 
                          ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))' 
                          : 'drop-shadow(0 0 5px #ffffff) drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                        fontWeight: 900
                      }}>
                        {SYM[pc.color][pc.type]}
                      </span>
                    )}

                    {isValid && (
                      <div style={{
                        position: 'absolute',
                        width: pc ? '85%' : '30%',
                        height: pc ? '85%' : '30%',
                        borderRadius: '50%',
                        background: pc ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.6)',
                        border: pc ? '2px solid #ef4444' : 'none',
                        pointerEvents: 'none'
                      }} />
                    )}
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (Player 1 Info & Captured White) */}
        <div style={{ flex: '0 0 150px', width: '150px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
          {/* Player Card */}
          <div style={{
            background: gs.turn === 'w' ? '#1a1a2e' : '#111827',
            border: gs.turn === 'w' ? '2px solid #22c55e' : '2px solid #1e293b',
            borderRadius: '14px', padding: '8px 10px',
            boxShadow: gs.turn === 'w' ? '0 0 12px rgba(34,197,94,.2)' : 'none',
            transition: 'all .3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#22c55e', color: '#fff', border: '1.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>👤</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#e2e8f0' }}>You</div>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#64748b' }}>White Pieces</div>
                </div>
              </div>
              <div style={{ fontSize: '9px', fontWeight: 900, color: gs.turn === 'w' ? '#22c55e' : '#475569' }}>
                {gs.turn === 'w' ? 'YOUR TURN' : 'WAIT'}
              </div>
            </div>
          </div>

          {/* Captured White */}
          <div style={{
            flex: 1, background: '#111827', border: '2px solid #1e293b',
            borderRadius: '14px', padding: '8px 10px', display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
              ⬜ Captured by Black ({gs.cap.b.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', flex: 1, alignContent: 'start' }}>
              {gs.cap.b.length === 0
                ? <span style={{ color: '#334155', fontSize: '9px', fontStyle: 'italic' }}>None yet</span>
                : gs.cap.b.map((s, i) => <span key={i} style={{ fontSize: '18px' }}>{s}</span>)}
            </div>
          </div>

          {/* Status Message */}
          <div style={{
            background: '#111827', border: '2px solid #1e293b',
            borderRadius: '14px', padding: '8px 10px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Status</div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: status.includes('Checkmate') ? '#ef4444' : '#22c55e', marginTop: '2px' }}>
              {status}
            </div>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM BAR CONTROLS ─── */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
        padding: '4px 12px', background: '#111827', borderTop: '1px solid #1e293b'
      }}>
        <button onClick={undo} disabled={gs.history.length === 0 || thinking} style={{ padding: '4px 12px', background: '#3b82f6', color: '#fff', border: '1.5px solid #000', borderRadius: '8px', fontSize: '10.5px', fontWeight: 900, cursor: (gs.history.length === 0 || thinking) ? 'not-allowed' : 'pointer', opacity: (gs.history.length === 0 || thinking) ? .5 : 1, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '1.5px 1.5px 0 #000' }}>
          <Undo2 size={11} /> Undo
        </button>
        <button onClick={resign} disabled={thinking} style={{ padding: '4px 12px', background: '#ef4444', color: '#fff', border: '1.5px solid #000', borderRadius: '8px', fontSize: '10.5px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '1.5px 1.5px 0 #000' }}>
          <Flag size={11} /> Resign
        </button>
        <button onClick={offerDraw} disabled={thinking} style={{ padding: '4px 12px', background: '#8b5cf6', color: '#fff', border: '1.5px solid #000', borderRadius: '8px', fontSize: '10.5px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '1.5px 1.5px 0 #000' }}>
          <Handshake size={11} /> Offer Draw
        </button>
        <button onClick={reset} disabled={thinking} style={{ padding: '4px 12px', background: '#334155', color: '#fff', border: '1.5px solid #000', borderRadius: '8px', fontSize: '10.5px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '1.5px 1.5px 0 #000' }}>
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <style jsx global>{`
        .chess-root * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
