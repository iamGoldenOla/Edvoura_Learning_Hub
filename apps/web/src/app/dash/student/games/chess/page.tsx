'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown, RotateCcw, Layers, User, Users,
  Monitor, ArrowLeft, Undo2, Clock, Swords
} from 'lucide-react';

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
  history: { mv: string; board: Board }[];
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
        if (!tg) { ms.push({ r: cr, c: cc }); } else { if (tg.color !== cl) ms.push({ r: cr, c: cc }); break; }
        cr += dr; cc += dc;
      }
    }
  }
  return ms;
};

const attacked = (b: Board, r: number, c: number, by: Color): boolean => {
  for (let ir = 0; ir < 8; ir++) for (let ic = 0; ic < 8; ic++)
    if (b[ir][ic]?.color === by && pseudoMoves(b, ir, ic, { wK: false, wQ: false, bK: false, bQ: false }, null).some(m => m.r === r && m.c === c))
      return true;
  return false;
};

const inCheck = (b: Board, cl: Color): boolean => {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (b[r][c]?.type === 'k' && b[r][c]?.color === cl) return attacked(b, r, c, opp(cl));
  return false;
};

const simMove = (b: Board, fr: Position, to: Position, ep: Position | null): Board => {
  const nb = b.map(r => [...r]);
  const pc = nb[fr.r][fr.c]!;
  nb[to.r][to.c] = pc; nb[fr.r][fr.c] = null;
  if (pc.type === 'p') {
    if (ep && to.r === ep.r && to.c === ep.c) nb[fr.r][to.c] = null;
    if (to.r === 0 || to.r === 7) nb[to.r][to.c] = { type: 'q', color: pc.color };
  }
  if (pc.type === 'k' && Math.abs(to.c - fr.c) === 2) {
    if (to.c === 6) { nb[fr.r][5] = nb[fr.r][7]; nb[fr.r][7] = null; }
    else if (to.c === 2) { nb[fr.r][3] = nb[fr.r][0]; nb[fr.r][0] = null; }
  }
  return nb;
};

const legalMoves = (b: Board, r: number, c: number, cas: GS['castling'], ep: Position | null): Position[] => {
  const cl = b[r][c]!.color;
  return pseudoMoves(b, r, c, cas, ep).filter(m => {
    if (b[r][c]?.type === 'k' && Math.abs(m.c - c) === 2) {
      if (inCheck(b, cl)) return false;
      if (attacked(b, r, c + (m.c > c ? 1 : -1), opp(cl))) return false;
    }
    return !inCheck(simMove(b, { r, c }, m, ep), cl);
  });
};

const allLegal = (s: GS): Move[] => {
  const ms: Move[] = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (s.board[r][c]?.color === s.turn)
      legalMoves(s.board, r, c, s.castling, s.ep).forEach(m => ms.push({ from: { r, c }, to: m }));
  return ms;
};

const evalBoard = (b: Board): number => {
  let s = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c]; if (p) s += p.color === 'b' ? VAL[p.type] : -VAL[p.type];
  }
  return s;
};

const applyMoveRaw = (s: GS, m: Move): GS => {
  const pc = s.board[m.from.r][m.from.c]!;
  const nb = simMove(s.board, m.from, m.to, s.ep);
  let ne = null as Position | null;
  if (pc.type === 'p' && Math.abs(m.from.r - m.to.r) === 2) ne = { r: (m.from.r + m.to.r) / 2, c: m.from.c };
  const nc = { ...s.castling };
  if (pc.type === 'k') { if (pc.color === 'w') { nc.wK = false; nc.wQ = false; } else { nc.bK = false; nc.bQ = false; } }
  if (pc.type === 'r') {
    if (m.from.r === 7 && m.from.c === 0) nc.wQ = false; if (m.from.r === 7 && m.from.c === 7) nc.wK = false;
    if (m.from.r === 0 && m.from.c === 0) nc.bQ = false; if (m.from.r === 0 && m.from.c === 7) nc.bK = false;
  }
  return { board: nb, turn: opp(s.turn), castling: nc, ep: ne, history: s.history, cap: s.cap };
};

const minimax = (s: GS, d: number, a: number, b: number, max: boolean): { score: number; move: Move | null } => {
  const ms = allLegal(s);
  if (d === 0 || ms.length === 0) {
    if (ms.length === 0) { if (inCheck(s.board, s.turn)) return { score: max ? -9999 : 9999, move: null }; return { score: 0, move: null }; }
    return { score: evalBoard(s.board), move: null };
  }
  let best = ms[0];
  if (max) {
    let mx = -Infinity;
    for (const m of ms) { const e = minimax(applyMoveRaw(s, m), d - 1, a, b, false).score; if (e > mx) { mx = e; best = m; } a = Math.max(a, e); if (b <= a) break; }
    return { score: mx, move: best };
  } else {
    let mn = Infinity;
    for (const m of ms) { const e = minimax(applyMoveRaw(s, m), d - 1, a, b, true).score; if (e < mn) { mn = e; best = m; } b = Math.min(b, e); if (b <= a) break; }
    return { score: mn, move: best };
  }
};

const posStr = (r: number, c: number) => `${FILES[c]}${RANKS[r]}`;

const doMove = (s: GS, m: Move): GS => {
  const pc = s.board[m.from.r][m.from.c]!;
  const tg = s.board[m.to.r][m.to.c];
  const nb = simMove(s.board, m.from, m.to, s.ep);
  let ne = null as Position | null;
  if (pc.type === 'p' && Math.abs(m.from.r - m.to.r) === 2) ne = { r: (m.from.r + m.to.r) / 2, c: m.from.c };
  const nc = { ...s.castling };
  if (pc.type === 'k') { if (pc.color === 'w') { nc.wK = false; nc.wQ = false; } else { nc.bK = false; nc.bQ = false; } }
  if (pc.type === 'r') {
    if (m.from.r === 7 && m.from.c === 0) nc.wQ = false; if (m.from.r === 7 && m.from.c === 7) nc.wK = false;
    if (m.from.r === 0 && m.from.c === 0) nc.bQ = false; if (m.from.r === 0 && m.from.c === 7) nc.bK = false;
  }
  const mv = `${pc.type !== 'p' ? pc.type.toUpperCase() : ''}${posStr(m.from.r, m.from.c)}→${posStr(m.to.r, m.to.c)}`;
  const cap = { w: [...s.cap.w], b: [...s.cap.b] };
  if (tg) cap[tg.color].push(SYM[tg.color][tg.type]);
  else if (pc.type === 'p' && s.ep && m.to.r === s.ep.r && m.to.c === s.ep.c) cap[opp(pc.color)].push(SYM[opp(pc.color)]['p']);
  return { board: nb, turn: opp(s.turn), castling: nc, ep: ne, history: [...s.history, { mv, board: nb }], cap };
};

const OPPONENTS = ['Aisha Bello (Grade 4)', 'Chinedu Okafor (Grade 5)', 'Oluwaseun Adebayo (Grade 4)', 'Amara Egwu (Grade 5)', 'Tunde Cole (Grade 6)'];

/* ═══════════════════════ COMPONENT ═══════════════════════ */
export default function ChessGame() {
  const router = useRouter();
  const [mode, setMode] = useState<'lobby' | 'matching' | 'playing'>('lobby');
  const [oppType, setOppType] = useState<'ai' | 'local' | 'match'>('ai');
  const [oppName, setOppName] = useState('Computer (AI)');
  const [gs, setGs] = useState<GS>(INIT_STATE);
  const [sel, setSel] = useState<Position | null>(null);
  const [valid, setValid] = useState<Position[]>([]);
  const [thinking, setThinking] = useState(false);
  const [flat, setFlat] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const check = inCheck(gs.board, gs.turn);
  const moves = allLegal(gs);
  const over = moves.length === 0;
  const status = over ? (check ? 'checkmate' : 'stalemate') : 'playing';

  let checkPos: Position | null = null;
  if (check) {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
      if (gs.board[r][c]?.type === 'k' && gs.board[r][c]?.color === gs.turn) checkPos = { r, c };
  }

  const reset = useCallback(() => { setGs(INIT_STATE); setSel(null); setValid([]); setThinking(false); setElapsed(0); }, []);

  const undo = useCallback(() => {
    if (gs.history.length < 2 && oppType !== 'local') return;
    if (oppType === 'local' && gs.history.length < 1) return;
    const steps = oppType === 'local' ? 1 : 2;
    setGs(s => {
      const nh = s.history.slice(0, -steps);
      const lb = nh.length > 0 ? nh[nh.length - 1].board : INIT;
      const iCounts = countPieces(INIT);
      const cCounts = countPieces(lb);
      const cap = { w: [] as string[], b: [] as string[] };
      for (const cl of ['w', 'b'] as Color[]) for (const t of ['p', 'n', 'b', 'r', 'q', 'k'] as PieceType[]) {
        for (let i = 0; i < (iCounts[cl][t] - cCounts[cl][t]); i++) cap[cl].push(SYM[cl][t]);
      }
      return { ...s, board: lb, turn: oppType === 'local' ? opp(s.turn) : 'w', history: nh, cap };
    });
    setSel(null); setValid([]);
  }, [gs.history.length, oppType]);

  useEffect(() => {
    if (mode === 'matching') {
      const t = setTimeout(() => { setOppName(OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)]); setMode('playing'); }, 3500);
      return () => clearTimeout(t);
    }
  }, [mode]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (status === 'playing' && mode === 'playing') { t = setInterval(() => setElapsed(p => p + 1), 1000); }
    return () => clearInterval(t);
  }, [status, mode]);

  useEffect(() => {
    const bot = gs.turn === 'b' && (oppType === 'ai' || oppType === 'match');
    if (bot && status === 'playing' && !thinking && mode === 'playing') {
      setThinking(true);
      const t = setTimeout(() => {
        const r = minimax(gs, 2, -Infinity, Infinity, true);
        if (r.move) setGs(s => doMove(s, r.move!));
        else { const ms = allLegal(gs); if (ms.length > 0) setGs(s => doMove(s, ms[Math.floor(Math.random() * ms.length)])); }
        setThinking(false);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [gs.turn, status, mode]);

  const click = (r: number, c: number) => {
    if (status !== 'playing' || thinking) return;
    if (gs.turn === 'b' && oppType !== 'local') return;
    if (sel) {
      if (valid.some(m => m.r === r && m.c === c)) {
        setGs(s => doMove(s, { from: sel, to: { r, c } }));
        setSel(null); setValid([]); return;
      }
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

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  /* ═══════════ LOBBY ═══════════ */
  if (mode === 'lobby') return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 150px)', background: '#0b0f19', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', borderRadius: '28px', boxSizing: 'border-box', border: '3px solid #000', boxShadow: '8px 8px 0px #000' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', color: '#fff', textAlign: 'center', maxWidth: '650px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fbbf24' }}>
          <Crown size={40} />
          <h1 style={{ fontSize: '32px', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>Chess Zone</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>Choose your game mode below.</p>
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
  const lastMove = gs.history.length > 0 ? gs.history[gs.history.length - 1].mv : '—';

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
          <div style={{ background: '#1e293b', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', border: '1px solid #334155' }}>
            <Clock size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />{fmt(elapsed)}
          </div>
          <div style={{ background: '#1e293b', padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, border: '1px solid #334155' }}>
            <Swords size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />Beginner
          </div>
          <button onClick={() => setFlat(!flat)} style={{ background: '#fbbf24', border: '2px solid #000', borderRadius: '8px', padding: '3px 10px', fontWeight: 900, fontSize: '11px', cursor: 'pointer', color: '#000', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={11} />{flat ? '3D' : 'Flat'}
          </button>
        </div>
      </div>

      {/* ─── MAIN AREA: LEFT PANEL | BOARD | RIGHT PANEL ─── */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        overflow: 'hidden', padding: '4px 6px', gap: '4px'
      }}>
        {/* LEFT PANEL */}
        <div style={{ flex: '0 0 150px', width: '150px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
          {/* Computer Card */}
          <div style={{
            background: gs.turn === 'b' ? '#1a1a2e' : '#111827',
            border: gs.turn === 'b' ? '2px solid #fbbf24' : '2px solid #1e293b',
            borderRadius: '14px', padding: '10px 14px',
            boxShadow: gs.turn === 'b' ? '0 0 12px rgba(251,191,36,.2)' : 'none',
            transition: 'all .3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e293b', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🤖</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#e2e8f0' }}>Computer</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>Black Pieces</div>
                </div>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 900, color: gs.turn === 'b' ? '#fbbf24' : '#475569', padding: '2px 8px', background: gs.turn === 'b' ? 'rgba(251,191,36,.1)' : 'transparent', borderRadius: '6px' }}>
                {gs.turn === 'b' ? (thinking ? '⚡ THINKING' : '⚡ ACTIVE') : 'WAITING'}
              </div>
            </div>
          </div>
          {/* Captured Black */}
          <div style={{
            flex: 1, background: '#111827', border: '2px solid #1e293b',
            borderRadius: '14px', padding: '10px 12px', display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              ⬛ Captured by White ({gs.cap.w.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1, alignContent: 'start' }}>
              {gs.cap.w.length === 0
                ? <span style={{ color: '#334155', fontSize: '10px', fontStyle: 'italic' }}>None yet</span>
                : gs.cap.w.map((s, i) => <span key={i} style={{ fontSize: '20px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.5))' }}>{s}</span>)}
            </div>
          </div>
          {/* Move History */}
          <div style={{
            background: '#111827', border: '2px solid #1e293b',
            borderRadius: '14px', padding: '10px 12px', maxHeight: '100px', overflow: 'hidden'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Recent Moves</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {gs.history.length === 0
                ? <span style={{ color: '#334155', fontSize: '10px', fontStyle: 'italic' }}>No moves yet</span>
                : gs.history.slice(-4).map((h, i) => (
                  <div key={i} style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{gs.history.length - 3 + i > 0 ? gs.history.length - 3 + i : i + 1}. {h.mv}</div>
                ))}
            </div>
          </div>
        </div>

        {/* ─── CHESSBOARD (fills all remaining space, square board centered inside) ─── */}
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

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => click(r, c)}
                  style={{
                    background: isSel ? '#86efac' : isCheck ? '#fca5a5' : dark ? '#1b4332' : '#f0ead6',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    cursor: (thinking || over) ? 'default' : 'pointer',
                    position: 'relative',
                    transition: 'background .15s'
                  }}
                >
                  {pc && (
                    <span style={{
                      fontSize: 'clamp(1.2rem, 5.5cqh, 4rem)',
                      lineHeight: 1,
                      color: pc.color === 'w' ? '#fff' : '#1a1a1a',
                      textShadow: pc.color === 'w'
                        ? '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,.3)'
                        : '0 2px 4px rgba(0,0,0,.3)',
                      userSelect: 'none',
                      transform: flat ? 'none' : 'rotateX(-12deg) translateZ(4px)',
                      transition: 'transform .4s',
                      zIndex: 2
                    }}>
                      {SYM[pc.color][pc.type]}
                    </span>
                  )}
                  {isValid && (
                    <div style={{
                      position: 'absolute', width: pc ? '85%' : '26%', height: pc ? '85%' : '26%',
                      borderRadius: pc ? '4px' : '50%',
                      background: pc ? 'rgba(239,68,68,.25)' : 'rgba(34,197,94,.45)',
                      border: pc ? '2px solid rgba(239,68,68,.5)' : '2px solid rgba(0,0,0,.15)',
                      zIndex: 3
                    }} />
                  )}
                </div>
              );
            }))}
          </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: '0 0 150px', width: '150px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
          {/* You Card */}
          <div style={{
            background: gs.turn === 'w' ? '#0f2a1a' : '#111827',
            border: gs.turn === 'w' ? '2px solid #22c55e' : '2px solid #1e293b',
            borderRadius: '14px', padding: '10px 14px',
            boxShadow: gs.turn === 'w' ? '0 0 12px rgba(34,197,94,.2)' : 'none',
            transition: 'all .3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e293b', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🙂</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#e2e8f0' }}>You</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>White Pieces</div>
                </div>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 900, color: gs.turn === 'w' ? '#22c55e' : '#475569', padding: '2px 8px', background: gs.turn === 'w' ? 'rgba(34,197,94,.1)' : 'transparent', borderRadius: '6px' }}>
                {gs.turn === 'w' ? '✓ YOUR TURN' : 'WAITING'}
              </div>
            </div>
          </div>
          {/* Captured White */}
          <div style={{
            flex: 1, background: '#111827', border: '2px solid #1e293b',
            borderRadius: '14px', padding: '10px 12px', display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              ⬜ Captured by Black ({gs.cap.b.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1, alignContent: 'start' }}>
              {gs.cap.b.length === 0
                ? <span style={{ color: '#334155', fontSize: '10px', fontStyle: 'italic' }}>None yet</span>
                : gs.cap.b.map((s, i) => <span key={i} style={{ fontSize: '20px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.5))' }}>{s}</span>)}
            </div>
          </div>
          {/* Game Info */}
          <div style={{
            background: '#111827', border: '2px solid #1e293b',
            borderRadius: '14px', padding: '10px 12px'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Game Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div><div style={{ fontSize: '9px', color: '#475569', fontWeight: 700 }}>Status</div><div style={{ fontSize: '11px', fontWeight: 900, color: check ? '#ef4444' : '#22c55e' }}>{status === 'playing' ? (check ? 'CHECK!' : 'Active') : status === 'checkmate' ? 'Checkmate!' : 'Draw'}</div></div>
              <div><div style={{ fontSize: '9px', color: '#475569', fontWeight: 700 }}>Moves</div><div style={{ fontSize: '11px', fontWeight: 900, color: '#e2e8f0' }}>{gs.history.length}</div></div>
              <div><div style={{ fontSize: '9px', color: '#475569', fontWeight: 700 }}>Last</div><div style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>{lastMove}</div></div>
              <div><div style={{ fontSize: '9px', color: '#475569', fontWeight: 700 }}>Turn</div><div style={{ fontSize: '11px', fontWeight: 900, color: gs.turn === 'w' ? '#60a5fa' : '#fbbf24' }}>{gs.turn === 'w' ? 'White' : 'Black'}</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM BAR ─── */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
        padding: '4px 12px', background: '#111827', borderTop: '1px solid #1e293b'
      }}>
        <button onClick={undo} disabled={gs.history.length === 0 || thinking} className="ch-btn" style={{ padding: '5px 14px', background: '#3b82f6', color: '#fff', border: '2px solid #000', borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: (gs.history.length === 0 || thinking) ? 'not-allowed' : 'pointer', opacity: (gs.history.length === 0 || thinking) ? .5 : 1, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '2px 2px 0 #000' }}>
          <Undo2 size={12} /> Undo
        </button>
        <button onClick={reset} disabled={thinking} className="ch-btn" style={{ padding: '5px 14px', background: '#ef4444', color: '#fff', border: '2px solid #000', borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: thinking ? 'not-allowed' : 'pointer', opacity: thinking ? .5 : 1, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '2px 2px 0 #000' }}>
          <RotateCcw size={12} /> Reset
        </button>
        <button onClick={() => setMode('lobby')} className="ch-btn" style={{ padding: '5px 14px', background: '#334155', color: '#fff', border: '2px solid #000', borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '2px 2px 0 #000' }}>
          <ArrowLeft size={12} /> Quit
        </button>
      </div>

      <style jsx global>{`
        html, body, #__next { overflow: hidden !important; height: 100vh !important; }
        .ch-btn:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #000 !important; }
        .ch-btn:active:not(:disabled) { transform: translate(1px,1px); box-shadow: 1px 1px 0 #000 !important; }
        @keyframes chPiecePop { 0%{transform:scale(.6);opacity:.2} 70%{transform:scale(1.25)} 100%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}

/* Helper */
function countPieces(b: Board) {
  const c: Record<Color, Record<PieceType, number>> = { w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 } };
  for (let r = 0; r < 8; r++) for (let cc = 0; cc < 8; cc++) { const p = b[r][cc]; if (p) c[p.color][p.type]++; }
  return c;
}
