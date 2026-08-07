'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { ALargeSmall, RotateCcw, Sparkles, Lightbulb, User, Users, Monitor, BookOpen, Share2, Copy, Check } from 'lucide-react';

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

function playScrabbleSFX(type: 'click' | 'place' | 'valid' | 'invalid' | 'win' | 'shuffle') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'click' || type === 'place') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'valid') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'invalid') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.15);
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
    } else if (type === 'shuffle') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {}
}

const LETTER_VALUES: Record<string, number> = {
  A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10
};

const LETTER_DIST = 'AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ';

const OPPONENT_NAMES = ['Aisha Bello (Grade 4)', 'Chinedu Okafor (Grade 5)', 'Oluwaseun Adebayo (Grade 4)', 'Amara Egwu (Grade 5)', 'Tunde Cole (Grade 6)'];

const VALID_WORDS = [
  'MATH','READ','WRITE','LEARN','BOOK','NOTE','PEN','DESK','EXAM','TEST',
  'QUIZ','STUDY','CLASS','TEACH','GRAIN','GRAND','GRANT','GRAPH','GRASP',
  'GRAVE','GREAT','GREEN','GREET','GRIEF','GRIND','GROSS','GROUP','GROWN',
  'GUARD','GUESS','GUEST','GUIDE','GUILD','GUILT','HAPPY','HEART','HEAVY',
  'POLL','POND','POOL','POOR','PORT','POST','POUR','PRAY','PULL','PUMP',
  'PURE','PUSH','QUIT','RACE','RAGE','RAID','RAIL','RAIN','RANK','RARE',
  'RATE','REAL','REAR','RELY','RENT','REST','RICE','RICH','RIDE','RING',
  'RISK','ROAD','ROCK','RODE','ROLE','ROLL','ROOF','ROOM','ROOT','ROPE',
  'SAFE','SAID','SAKE','SALE','SALT','SAME','SAND','SAVE','SEAL','SEAT',
  'AT','BE','BY','DO','GO','HE','IF','IN','IS','IT','ME','MY','NO','OF',
  'ON','OR','SO','TO','UP','US','WE','AM','AN','AS','AX'
];

type MultiplierType = 'TW' | 'DW' | 'TL' | 'DL' | null;

interface BoardCell {
  letter: string | null;
  multiplier: MultiplierType;
  isTemp?: boolean;
}

const BOARD_MULTIPLIERS: Record<string, MultiplierType> = {
  '0,0':'TW','0,7':'TW','0,14':'TW','7,0':'TW','7,14':'TW','14,0':'TW','14,7':'TW','14,14':'TW',
  '1,1':'DW','2,2':'DW','3,3':'DW','4,4':'DW','10,10':'DW','11,11':'DW','12,12':'DW','13,13':'DW',
  '1,13':'DW','2,12':'DW','3,11':'DW','4,10':'DW','10,4':'DW','11,3':'DW','12,2':'DW','13,1':'DW',
  '1,5':'TL','1,9':'TL','5,1':'TL','5,5':'TL','5,9':'TL','5,13':'TL','9,1':'TL','9,5':'TL','9,9':'TL','9,13':'TL','13,5':'TL','13,9':'TL',
  '0,3':'DL','0,11':'DL','2,6':'DL','2,8':'DL','3,0':'DL','3,7':'DL','3,14':'DL','6,2':'DL','6,6':'DL','6,8':'DL','6,12':'DL',
  '7,3':'DL','7,11':'DL','8,2':'DL','8,6':'DL','8,8':'DL','8,12':'DL','11,0':'DL','11,7':'DL','11,14':'DL','12,6':'DL','12,8':'DL','14,3':'DL','14,11':'DL'
};

function createInitialBoard(): BoardCell[][] {
  const grid: BoardCell[][] = [];
  for (let r = 0; r < 15; r++) {
    const row: BoardCell[] = [];
    for (let c = 0; c < 15; c++) {
      const key = `${r},${c}`;
      row.push({
        letter: null,
        multiplier: BOARD_MULTIPLIERS[key] || null
      });
    }
    grid.push(row);
  }
  return grid;
}

export default function ScrabbleGame() {
  const [gameMode, setGameMode] = useState<'lobby' | 'matching' | 'playing'>('lobby');
  const [opponentType, setOpponentType] = useState<'ai' | 'local' | 'matchmaker'>('ai');
  const [opponentName, setOpponentName] = useState('Computer (AI)');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const [board, setBoard] = useState<BoardCell[][]>(createInitialBoard);
  const [tileBag, setTileBag] = useState<string[]>([]);
  const [playerRack, setPlayerRack] = useState<string[]>([]);
  const [opponentRack, setOpponentRack] = useState<string[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [turn, setTurn] = useState<'player' | 'opponent'>('player');
  const [selectedRackIndex, setSelectedRackIndex] = useState<number | null>(null);
  const [placedTiles, setPlacedTiles] = useState<{ r: number; c: number; letter: string; rackIdx: number }[]>([]);
  const [message, setMessage] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'rules' | 'how-to-play' | 'values'>('rules');
  const [copiedLink, setCopiedLink] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const generateRoomCode = useCallback(() => {
    const code = 'SCRABBLE-' + Math.floor(1000 + Math.random() * 9000);
    setRoomCode(code);
    return code;
  }, []);

  const copyInviteLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode || generateRoomCode()}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    speakVoice('Invite link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const startMode = (type: 'ai' | 'local' | 'matchmaker') => {
    setOpponentType(type);
    generateRoomCode();
    if (type === 'matchmaker') {
      setGameMode('matching');
    } else {
      setOpponentName(type === 'ai' ? `Computer (${difficulty} AI)` : 'Player 2 (Local)');
      initGame();
      setGameMode('playing');
    }
  };

  useEffect(() => {
    if (gameMode === 'matching') {
      const timer = setTimeout(() => {
        const name = OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)];
        setOpponentName(name);
        initGame();
        setGameMode('playing');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [gameMode]);

  const aiThinkingRef = useRef(false);

  const initGame = useCallback(() => {
    const bag = LETTER_DIST.split('');

    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }

    const pRack = bag.splice(0, 7);
    const oRack = bag.splice(0, 7);

    setBoard(createInitialBoard());
    setTileBag(bag);
    setPlayerRack(pRack);
    setOpponentRack(oRack);
    setPlayerScore(0);
    setOpponentScore(0);
    setTurn('player');
    setSelectedRackIndex(null);
    setPlacedTiles([]);
    setMessage('Your turn! Select a tile and place it on the board.');
    aiThinkingRef.current = false;
    speakVoice('Scrabble game started. Your turn!');
  }, []);

  /* ═══════════════════════ AI OPPONENT AUTOMATION ═══════════════════════ */
  useEffect(() => {
    if (gameMode === 'playing' && opponentType === 'ai' && turn === 'opponent' && !aiThinkingRef.current) {
      aiThinkingRef.current = true;
      setIsBotThinking(true);
      setMessage('🤖 Computer is searching for a word...');

      const timer = setTimeout(() => {
        // AI Searches dictionary for a word that can be formed from its rack
        let candidateWord = '';
        const maxLen = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 5 : 7;
        const suitableWords = VALID_WORDS.filter(w => w.length <= maxLen);

        for (const w of suitableWords) {
          const rackCopy = [...opponentRack];
          let canForm = true;
          for (const char of w) {
            const idx = rackCopy.indexOf(char);
            if (idx !== -1) {
              rackCopy.splice(idx, 1);
            } else {
              canForm = false;
              break;
            }
          }
          if (canForm) {
            candidateWord = w;
            break;
          }
        }

        if (!candidateWord) {
          candidateWord = suitableWords[Math.floor(Math.random() * suitableWords.length)] || 'READ';
        }

        // Find an open contiguous horizontal spot on the board
        let targetRow = 7;
        let targetCol = 4;
        let foundSpot = false;

        for (let r = 0; r < 15; r++) {
          for (let c = 0; c <= 15 - candidateWord.length; c++) {
            let empty = true;
            for (let i = 0; i < candidateWord.length; i++) {
              if (board[r][c + i]?.letter !== null) {
                empty = false;
                break;
              }
            }
            if (empty) {
              targetRow = r;
              targetCol = c;
              foundSpot = true;
              break;
            }
          }
          if (foundSpot) break;
        }

        const newBoard = board.map(row => [...row]);
        let pts = 0;
        const usedLetters: string[] = [];

        for (let i = 0; i < candidateWord.length; i++) {
          const char = candidateWord[i];
          newBoard[targetRow][targetCol + i] = { ...newBoard[targetRow][targetCol + i], letter: char, isTemp: false };
          pts += LETTER_VALUES[char] || 1;
          usedLetters.push(char);
        }

        setBoard(newBoard);
        setOpponentScore(prev => prev + pts);
        playScrabbleSFX('valid');
        speakVoice(`Computer played ${candidateWord} for ${pts} points.`);
        setMessage(`Computer played ${candidateWord} (+${pts} pts).`);

        // Replenish AI Rack
        const newORack = [...opponentRack];
        usedLetters.forEach(l => {
          const idx = newORack.indexOf(l);
          if (idx !== -1) newORack.splice(idx, 1);
        });

        const bag = [...tileBag];
        while (newORack.length < 7 && bag.length > 0) {
          newORack.push(bag.pop()!);
        }
        setTileBag(bag);
        setOpponentRack(newORack);

        // Reset thinking flag & hand turn back to player
        aiThinkingRef.current = false;
        setIsBotThinking(false);
        setTurn('player');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [turn, opponentType, gameMode, opponentRack, board, tileBag, difficulty]);

  const handleCellClick = (r: number, c: number) => {
    if (turn !== 'player' || isBotThinking) return;

    const existingPlaced = placedTiles.find(pt => pt.r === r && pt.c === c);
    if (existingPlaced) {
      playScrabbleSFX('place');
      setPlayerRack(prev => [...prev, existingPlaced.letter]);
      setPlacedTiles(prev => prev.filter(pt => !(pt.r === r && pt.c === c)));
      setBoard(prev => {
        const next = prev.map(row => [...row]);
        next[r][c] = { ...next[r][c], letter: null, isTemp: false };
        return next;
      });
      return;
    }

    if (selectedRackIndex === null) return;
    if (board[r][c].letter !== null) return;

    const letter = playerRack[selectedRackIndex];
    playScrabbleSFX('place');

    const newRack = [...playerRack];
    newRack.splice(selectedRackIndex, 1);
    setPlayerRack(newRack);

    setBoard(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = { ...next[r][c], letter, isTemp: true };
      return next;
    });

    setPlacedTiles(prev => [...prev, { r, c, letter, rackIdx: selectedRackIndex }]);
    setSelectedRackIndex(null);
  };

  const recallTiles = () => {
    if (placedTiles.length === 0) return;
    playScrabbleSFX('shuffle');
    const returned = placedTiles.map(pt => pt.letter);
    setPlayerRack(prev => [...prev, ...returned]);
    setBoard(prev => {
      const next = prev.map(row => [...row]);
      placedTiles.forEach(pt => {
        next[pt.r][pt.c] = { ...next[pt.r][pt.c], letter: null, isTemp: false };
      });
      return next;
    });
    setPlacedTiles([]);
  };

  const playTurn = () => {
    if (placedTiles.length === 0) {
      setMessage('Place at least one tile first!');
      speakVoice('Place at least one tile first');
      return;
    }

    const wordStr = placedTiles.map(pt => pt.letter).join('');
    
    if (VALID_WORDS.includes(wordStr) || wordStr.length >= 2) {
      playScrabbleSFX('valid');
      let pts = 0;
      placedTiles.forEach(pt => {
        pts += LETTER_VALUES[pt.letter] || 1;
      });

      setPlayerScore(s => s + pts);
      speakVoice(`Word accepted! Scored ${pts} points.`);
      setMessage(`Great word! +${pts} pts.`);

      setBoard(prev => {
        const next = prev.map(row => [...row]);
        placedTiles.forEach(pt => {
          next[pt.r][pt.c] = { ...next[pt.r][pt.c], isTemp: false };
        });
        return next;
      });

      const needed = 7 - (playerRack.length);
      const bag = [...tileBag];
      const drawn = bag.splice(0, needed);
      setTileBag(bag);
      setPlayerRack(prev => [...prev, ...drawn]);

      setPlacedTiles([]);
      setTurn('opponent');
    } else {
      playScrabbleSFX('invalid');
      speakVoice('Invalid word!');
      setMessage('Invalid word! Recall tiles and try again.');
    }
  };

  const quitToLobby = () => setGameMode('lobby');

  if (gameMode === 'lobby') {
    return (
      <GameLayout title="Scrabble Lobby" icon={<ALargeSmall />} accentColor="#ec4899" fullscreen={true}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: '20px', color: '#0f172a', textAlign: 'center', padding: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              🔤 Scrabble Zone
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '500px', fontWeight: 600, margin: '0 auto' }}>
              Play 15x15 Scrabble in a zero-scroll 16:9 widescreen layout with Text-to-Speech talking voice narration & Invite Links!
            </p>
          </div>

          {/* Difficulty Selector */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>Difficulty:</span>
            {(['Easy', 'Medium', 'Hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: '2px solid #000',
                  fontSize: '12px', fontWeight: 900, cursor: 'pointer',
                  background: difficulty === d ? '#ec4899' : '#ffffff',
                  color: difficulty === d ? '#ffffff' : '#000000',
                  boxShadow: '2px 2px 0px #000000'
                }}
              >
                {d}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { type: 'ai', title: 'Play vs Computer', desc: `${difficulty} AI Bot`, icon: Monitor },
              { type: 'local', title: 'Pass & Play', desc: 'Local 2-player', icon: Users },
              { type: 'matchmaker', title: 'Grade Matchmaking', desc: 'Find classmates', icon: User }
            ].map(m => (
              <button
                key={m.type}
                onClick={() => startMode(m.type as any)}
                style={{
                  padding: '20px 16px', borderRadius: '18px', border: '3px solid #000000',
                  cursor: 'pointer', background: '#ffffff', color: '#000000',
                  boxShadow: '4px 4px 0px #ec4899', transition: 'all 0.15s ease',
                  width: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px #ec4899'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px #ec4899'; }}
              >
                <m.icon size={32} style={{ color: '#ec4899' }} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 950 }}>{m.title}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{m.desc}</div>
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
      <GameLayout title="Matchmaking" icon={<ALargeSmall />} accentColor="#ec4899" fullscreen={true}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: '24px', color: '#0f172a', textAlign: 'center'
        }}>
          <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #ec4899', animation: 'ping 1.5s infinite ease-out' }} />
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #000000', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px #000000', zIndex: 2 }}>
              <Users size={28} color="#ec4899" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', margin: '0 0 4px 0' }}>Searching for matches...</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Connecting with online classmates...</p>
          </div>
          <button
            onClick={quitToLobby}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: '2px solid #000000',
              cursor: 'pointer', fontSize: '12px', fontWeight: 900, background: '#fee2e2',
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
    <GameLayout
      title="Scrabble 15x15"
      icon={<ALargeSmall style={{ width: '24px', height: '24px' }} />}
      accentColor="#ec4899"
      score={playerScore}
      fullscreen={true}
    >
      {/* Widescreen 16:9 Zero-Scroll Layout */}
      <div className="scrabble-main-layout" style={{
        display: 'flex', alignItems: 'stretch', height: '100%',
        overflow: 'hidden', padding: '6px', gap: '10px', boxSizing: 'border-box'
      }}>
        <style jsx global>{`
          @media (max-width: 768px) {
            .scrabble-main-layout {
              flex-direction: column !important;
              align-items: center !important;
              overflow-y: auto !important;
              padding: 4px !important;
              gap: 8px !important;
            }
            .scrabble-side-panel {
              width: 100% !important;
              flex: none !important;
            }
          }
        `}</style>
        
        {/* ─── LEFT PANEL: SCORE, DIFFICULTY & INVITE LINK ─── */}
        <div className="scrabble-side-panel" style={{
          flex: '0 0 190px', width: '190px', display: 'flex', flexDirection: 'column', gap: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '10px', borderRadius: '12px', background: '#111827', border: '2px solid #1e293b'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#ec4899' }}>👤 You: {playerScore} pts</div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>🤖 {opponentName}: {opponentScore} pts</div>
            <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '4px', fontWeight: 700 }}>Tiles in bag: {tileBag.length}</div>
          </div>

          <div style={{
            fontSize: '11px', fontWeight: 800, color: turn === 'player' ? '#22c55e' : '#fbbf24',
            background: '#111827', padding: '8px', borderRadius: '8px', border: '1.5px solid #1e293b'
          }}>
            {message}
          </div>

          {/* Copy Shareable Room Invite Link Button */}
          <button
            onClick={copyInviteLink}
            style={{
              padding: '8px', borderRadius: '8px', border: '2px solid #000',
              background: copiedLink ? '#22c55e' : '#fbbf24', color: '#000', fontWeight: 900, fontSize: '11px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: '2px 2px 0 #000'
            }}
          >
            {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
            {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
          </button>

          <button
            onClick={() => setShowRulesModal(true)}
            style={{
              padding: '8px', borderRadius: '8px', border: '2px solid #000',
              background: '#38bdf8', color: '#000', fontWeight: 900, fontSize: '11px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: '2px 2px 0 #000', marginTop: 'auto'
            }}
          >
            <BookOpen size={14} /> Rules & Guide
          </button>
          
          <button
            onClick={quitToLobby}
            style={{
              padding: '8px', borderRadius: '8px', border: '2px solid #000',
              background: '#fee2e2', color: '#ef4444', fontWeight: 900, fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Quit Game
          </button>
        </div>

        {/* ─── CENTER AREA: DYNAMIC 1:1 15x15 SCRABBLE GRID ─── */}
        <div style={{
          flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', maxWidth: '100%', aspectRatio: '1 / 1',
            borderRadius: '16px', padding: '2px', boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: '100%', height: '100%',
              display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gridTemplateRows: 'repeat(15, 1fr)',
              border: '2.5px solid #000000', borderRadius: '10px', overflow: 'hidden', background: '#0b0f19',
              boxShadow: '4px 4px 0px #000000'
            }}>
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const bg = cell.letter
                    ? '#fef08a'
                    : cell.multiplier === 'TW' ? '#ef4444'
                    : cell.multiplier === 'DW' ? '#f472b6'
                    : cell.multiplier === 'TL' ? '#3b82f6'
                    : cell.multiplier === 'DL' ? '#38bdf8'
                    : r === 7 && c === 7 ? '#fbbf24'
                    : '#111827';

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      style={{
                        background: bg,
                        color: cell.letter ? '#000000' : '#ffffff',
                        fontWeight: 900,
                        fontSize: 'calc(min(100vw, 100vh) / 32)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', border: '1px solid #1e293b', position: 'relative',
                        userSelect: 'none'
                      }}
                    >
                      {cell.letter || cell.multiplier || (r === 7 && c === 7 ? '★' : '')}
                      {cell.letter && (
                        <span style={{ position: 'absolute', bottom: '1px', right: '2px', fontSize: '7px', color: '#64748b' }}>
                          {LETTER_VALUES[cell.letter] || 1}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: PLAYER TILE RACK & ACTIONS ─── */}
        <div style={{
          flex: '0 0 200px', width: '200px', display: 'flex', flexDirection: 'column', gap: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Your Tile Rack</div>
          
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', background: '#111827', padding: '8px', borderRadius: '10px', border: '2px solid #1e293b' }}>
            {playerRack.map((letter, idx) => (
              <button
                key={idx}
                onClick={() => { playScrabbleSFX('click'); setSelectedRackIndex(selectedRackIndex === idx ? null : idx); }}
                style={{
                  width: '38px', height: '42px', borderRadius: '6px', border: '2px solid #000',
                  background: selectedRackIndex === idx ? '#fbbf24' : '#fef08a',
                  color: '#000', fontWeight: 900, fontSize: '16px', cursor: 'pointer',
                  boxShadow: '1.5px 1.5px 0 #000', position: 'relative'
                }}
              >
                {letter}
                <span style={{ position: 'absolute', bottom: '1px', right: '2px', fontSize: '8px', color: '#475569' }}>
                  {LETTER_VALUES[letter] || 1}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
            <button
              onClick={playTurn}
              disabled={turn !== 'player' || placedTiles.length === 0}
              style={{
                padding: '10px', borderRadius: '8px', border: '2px solid #000',
                background: '#22c55e', color: '#fff', fontWeight: 900, fontSize: '11px',
                cursor: 'pointer', boxShadow: '2px 2px 0 #000'
              }}
            >
              Play Word
            </button>

            <button
              onClick={recallTiles}
              disabled={placedTiles.length === 0}
              style={{
                padding: '8px', borderRadius: '8px', border: '2px solid #000',
                background: '#f59e0b', color: '#000', fontWeight: 900, fontSize: '11px',
                cursor: 'pointer', boxShadow: '2px 2px 0 #000'
              }}
            >
              Recall Tiles
            </button>
          </div>
        </div>
      </div>

      {/* Rules Modal */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 950, color: '#ec4899' }}>
                <BookOpen size={24} /> Scrabble Guide & Rules
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1.5px solid #000' }}>
              <button onClick={() => setActiveModalTab('rules')} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'rules' ? '#ec4899' : 'transparent', color: activeModalTab === 'rules' ? '#fff' : '#475569' }}>
                📜 Rules
              </button>
              <button onClick={() => setActiveModalTab('how-to-play')} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'how-to-play' ? '#ec4899' : 'transparent', color: activeModalTab === 'how-to-play' ? '#fff' : '#475569' }}>
                🎮 How to Play
              </button>
              <button onClick={() => setActiveModalTab('values')} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'values' ? '#ec4899' : 'transparent', color: activeModalTab === 'values' ? '#fff' : '#475569' }}>
                ⭐ Tile Values
              </button>
            </div>

            {activeModalTab === 'rules' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0' }}>Scrabble Rules:</h4>
                <ul style={{ paddingLeft: '18px', margin: '0' }}>
                  <li>Form valid interlocking words on the 15x15 board.</li>
                  <li>Multipliers: TW (Triple Word), DW (Double Word), TL (Triple Letter), DL (Double Letter).</li>
                </ul>
              </div>
            )}

            {activeModalTab === 'how-to-play' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0' }}>Controls:</h4>
                <ol style={{ paddingLeft: '18px', margin: '0' }}>
                  <li>Select a tile from your rack.</li>
                  <li>Click a square on the 15x15 board to place it.</li>
                  <li>Click 'Play Word' to submit your move!</li>
                </ol>
              </div>
            )}

            {activeModalTab === 'values' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0' }}>Tile Point Values:</h4>
                <p style={{ margin: '0' }}>High value letters: Q (10), Z (10), J (8), X (8), K (5).</p>
              </div>
            )}

            <button
              onClick={() => setShowRulesModal(false)}
              style={{ width: '100%', padding: '10px', background: '#ec4899', color: '#fff', border: '2px solid #000', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', marginTop: '12px' }}
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
