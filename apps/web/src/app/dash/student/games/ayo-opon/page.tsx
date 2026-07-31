'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Circle, Layers, RefreshCw, User, Users, Monitor, BookOpen, Trophy, ScrollText, Sparkles } from 'lucide-react';

const OPPONENT_NAMES = ['Aisha Bello (Grade 4)', 'Chinedu Okafor (Grade 5)', 'Oluwaseun Adebayo (Grade 4)', 'Amara Egwu (Grade 5)', 'Tunde Cole (Grade 6)'];

/* ═══════════════════════ WEB AUDIO API SFX SYNTHESIZER ═══════════════════════ */
function playAyoSFX(type: 'drop' | 'capture' | 'win') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'drop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'capture') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
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
    }
  } catch (e) {}
}

export default function AyoOpon() {
  const [gameMode, setGameMode] = useState<'lobby' | 'matching' | 'playing'>('lobby');
  const [opponentType, setOpponentType] = useState<'ai' | 'local' | 'matchmaker'>('ai');
  const [matchedOpponent, setMatchedOpponent] = useState('Computer (AI)');
  
  // Modals State
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'rules' | 'how-to-play' | 'heritage'>('rules');

  const [board, setBoard] = useState(Array(12).fill(4));
  const [scores, setScores] = useState([0, 0]); // [player1, player2]
  const [turn, setTurn] = useState(0); // 0 = Player 1, 1 = Player 2 (AI or Local Opponent)
  const [isAnimating, setIsAnimating] = useState(false);
  const [activePitHighlight, setActivePitHighlight] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('Your turn!');
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [view3D, setView3D] = useState(true);

  const addLog = useCallback((msg: string) => {
    setGameLog(prev => [msg, ...prev].slice(0, 50));
  }, []);

  const startMode = (type: 'ai' | 'local' | 'matchmaker') => {
    setOpponentType(type);
    setBoard(Array(12).fill(4));
    setScores([0, 0]);
    setTurn(0);
    setGameOver(false);
    setMessage('Your turn!');
    setIsAnimating(false);
    setGameLog([`Game started! Mode: ${type.toUpperCase()}`]);
    
    if (type === 'matchmaker') {
      setGameMode('matching');
    } else {
      setMatchedOpponent(type === 'ai' ? 'Computer (AI)' : 'Player 2 (Local)');
      setGameMode('playing');
    }
  };

  // Simulated matchmaking timer
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

  const playMove = async (startIndex: number) => {
    if (isAnimating || gameOver) return;
    setIsAnimating(true);

    const playerName = turn === 0 ? 'You' : matchedOpponent;
    addLog(`🫘 ${playerName} selected Pit ${startIndex + 1}.`);

    let currentBoard = [...board];
    let seeds = currentBoard[startIndex];
    currentBoard[startIndex] = 0;
    setBoard([...currentBoard]);

    let currentIndex = startIndex;

    while (seeds > 0) {
      await new Promise(resolve => setTimeout(resolve, 220));
      currentIndex = (currentIndex + 1) % 12;

      if (currentIndex === startIndex) {
        continue;
      }

      currentBoard[currentIndex]++;
      seeds--;
      setBoard([...currentBoard]);
      setActivePitHighlight(currentIndex);
      playAyoSFX('drop');
    }

    let capturedThisTurn = 0;
    let captureIndex = currentIndex;
    let currentScores = [...scores];

    const isOpponentSide = (index: number) =>
      turn === 0 ? index >= 6 && index <= 11 : index >= 0 && index <= 5;

    while (
      isOpponentSide(captureIndex) &&
      (currentBoard[captureIndex] === 2 || currentBoard[captureIndex] === 3)
    ) {
      await new Promise(resolve => setTimeout(resolve, 220));
      capturedThisTurn += currentBoard[captureIndex];
      currentBoard[captureIndex] = 0;
      setBoard([...currentBoard]);
      playAyoSFX('capture');
      captureIndex = (captureIndex - 1 + 12) % 12;
    }

    if (capturedThisTurn > 0) {
      addLog(`✨ ${playerName} captured ${capturedThisTurn} seeds!`);
    }

    currentScores[turn] += capturedThisTurn;
    setScores([...currentScores]);
    setActivePitHighlight(null);

    let p1Empty = currentBoard.slice(0, 6).every(s => s === 0);
    let p2Empty = currentBoard.slice(6, 12).every(s => s === 0);

    if (p1Empty || p2Empty) {
      setGameOver(true);
      let remainingP1 = currentBoard.slice(0, 6).reduce((a, b) => a + b, 0);
      let remainingP2 = currentBoard.slice(6, 12).reduce((a, b) => a + b, 0);
      currentScores[0] += remainingP1;
      currentScores[1] += remainingP2;
      setBoard(Array(12).fill(0));
      setScores([...currentScores]);
      playAyoSFX('win');

      if (currentScores[0] > currentScores[1]) {
        setMessage('🏆 Game Over - You Win!');
        addLog('🏆 Game Over! You won!');
      } else if (currentScores[1] > currentScores[0]) {
        setMessage(`🏆 Game Over - ${matchedOpponent} Wins!`);
        addLog(`🏆 Game Over! ${matchedOpponent} won!`);
      } else {
        setMessage('🤝 Game Over - It is a Tie!');
        addLog('🤝 Game Over! Tie game.');
      }
      setIsAnimating(false);
      return;
    }

    const nextTurn = turn === 0 ? 1 : 0;
    setTurn(nextTurn);
    setMessage(nextTurn === 0 ? 'Your turn!' : `${matchedOpponent}'s turn...`);
    setIsAnimating(false);
  };

  // AI Opponent Automation
  useEffect(() => {
    if (gameMode === 'playing' && opponentType === 'ai' && turn === 1 && !isAnimating && !gameOver) {
      const timer = setTimeout(() => {
        let bestMove = -1;
        let maxCapture = -1;

        for (let i = 6; i <= 11; i++) {
          if (board[i] > 0) {
            let tempBoard = [...board];
            let seeds = tempBoard[i];
            tempBoard[i] = 0;
            let curr = i;
            while (seeds > 0) {
              curr = (curr + 1) % 12;
              if (curr === i) continue;
              tempBoard[curr]++;
              seeds--;
            }
            let cap = 0;
            let capIdx = curr;
            while (capIdx >= 0 && capIdx <= 5 && (tempBoard[capIdx] === 2 || tempBoard[capIdx] === 3)) {
              cap += tempBoard[capIdx];
              tempBoard[capIdx] = 0;
              capIdx = (capIdx - 1 + 12) % 12;
            }
            if (cap > maxCapture) {
              maxCapture = cap;
              bestMove = i;
            }
          }
        }

        if (bestMove === -1) {
          const validMoves = [6, 7, 8, 9, 10, 11].filter(idx => board[idx] > 0);
          if (validMoves.length > 0) {
            bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
          }
        }

        if (bestMove !== -1) {
          playMove(bestMove);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, isAnimating, gameOver, board, opponentType, gameMode, matchedOpponent]);

  const resetGame = () => {
    setBoard(Array(12).fill(4));
    setScores([0, 0]);
    setTurn(0);
    setGameOver(false);
    setMessage('Your turn!');
    setIsAnimating(false);
    setGameLog(['Game reset!']);
  };

  const quitToLobby = () => {
    setGameMode('lobby');
  };

  const renderPit = (i: number) => {
    const isPlayerPit = i >= 0 && i <= 5;
    const isOpponentPit = i >= 6 && i <= 11;
    const canClick = !isAnimating && !gameOver && ((turn === 0 && isPlayerPit) || (turn === 1 && opponentType === 'local' && isOpponentPit));
    const isHighlighted = activePitHighlight === i;

    return (
      <div
        key={i}
        onClick={() => canClick && board[i] > 0 && playMove(i)}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isHighlighted
            ? 'rgba(251, 191, 36, 0.3)'
            : canClick && board[i] > 0
            ? 'rgba(249, 115, 22, 0.18)'
            : 'rgba(255, 255, 255, 0.05)',
          border: isHighlighted
            ? '2.5px solid #fbbf24'
            : canClick && board[i] > 0
            ? '2.5px solid #f97316'
            : '1.5px solid rgba(255,255,255,0.12)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          cursor: canClick && board[i] > 0 ? 'pointer' : 'default',
          position: 'relative',
          transition: 'all 0.2s ease',
          boxShadow: isHighlighted
            ? '0 0 16px #fbbf24'
            : canClick && board[i] > 0
            ? '0 0 12px rgba(249, 115, 22, 0.4)'
            : 'none'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', alignItems: 'center', maxWidth: '44px' }}>
          {Array.from({ length: Math.min(board[i], 10) }).map((_, seedIdx) => (
            <div
              key={seedIdx}
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#f97316',
                boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
              }}
            />
          ))}
        </div>
        {board[i] > 10 && (
          <div style={{ fontSize: '10px', color: '#fff', width: '100%', textAlign: 'center', marginTop: '1px', fontWeight: 900 }}>
            +{board[i] - 10}
          </div>
        )}
        {board[i] === 0 && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 800 }}>0</div>
        )}
      </div>
    );
  };

  if (gameMode === 'lobby') {
    return (
      <GameLayout title="Ayo Opon Lobby" icon={<Circle />} accentColor="#f97316" fullscreen={true}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: '24px', color: '#0f172a', textAlign: 'center', padding: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              🫘 Ayò Ọ̀pọ́n Zone
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '500px', fontWeight: 600, margin: '0 auto' }}>
              Play the ancient Yoruba game of counting in an Ultrawide 16:9 zero-scroll layout with Web Audio SFX!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { type: 'ai', title: 'Play vs Computer', desc: 'Greedy heuristic AI', icon: Monitor },
              { type: 'local', title: 'Pass & Play', desc: 'Local 2-player mode', icon: Users },
              { type: 'matchmaker', title: 'Grade Matchmaking', desc: 'Find classmates', icon: User }
            ].map(m => (
              <button
                key={m.type}
                onClick={() => startMode(m.type as any)}
                style={{
                  padding: '20px 16px', borderRadius: '18px', border: '3px solid #000000',
                  cursor: 'pointer', background: '#ffffff', color: '#000000',
                  boxShadow: '4px 4px 0px #f97316', transition: 'all 0.15s ease',
                  width: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px #f97316'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px #f97316'; }}
              >
                <m.icon size={32} style={{ color: '#f97316' }} />
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
      <GameLayout title="Matchmaking" icon={<Circle />} accentColor="#f97316" fullscreen={true}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: '24px', color: '#0f172a', textAlign: 'center'
        }}>
          <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #f97316', animation: 'ping 1.5s infinite ease-out' }} />
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #000000', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px #000000', zIndex: 2 }}>
              <Users size={28} color="#f97316" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', margin: '0 0 4px 0' }}>Searching for matches...</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Finding students in Grade 4, 5, or 6 on the board...</p>
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
      title="Ayò Ọ̀pọ́n"
      icon={<Circle style={{ width: '24px', height: '24px' }} />}
      accentColor="#f97316"
      score={scores[0]}
      fullscreen={true}
    >
      {/* Zero-Scroll Widescreen Main Game Deck */}
      <div style={{
        display: 'flex', alignItems: 'stretch', height: '100%',
        overflow: 'hidden', padding: '6px', gap: '10px', boxSizing: 'border-box'
      }}>
        
        {/* ─── LEFT PANEL: SCORE CARDS & QUICK CONTROLS ─── */}
        <div style={{
          flex: '0 0 200px', width: '200px', display: 'flex', flexDirection: 'column', gap: '8px',
          overflow: 'hidden'
        }}>
          {/* Game Title Badge */}
          <div style={{
            background: '#111827', border: '2px solid #1e293b', borderRadius: '12px',
            padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#f97316', textTransform: 'uppercase' }}>🫘 Ayò Ọ̀pọ́n</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>Yoruba Mancala</div>
            </div>
            <button
              onClick={quitToLobby}
              style={{
                padding: '4px 8px', background: '#fee2e2', color: '#ef4444', border: '1.5px solid #000',
                borderRadius: '6px', fontSize: '10px', fontWeight: 900, cursor: 'pointer'
              }}
            >
              Quit
            </button>
          </div>

          {/* Player 1 Card */}
          <div style={{
            padding: '10px 12px', borderRadius: '12px',
            background: turn === 0 ? 'rgba(249, 115, 22, 0.15)' : '#111827',
            border: turn === 0 ? '2px solid #f97316' : '2px solid #1e293b',
            transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#e2e8f0' }}>👤 You (Player 1)</div>
            <div style={{ fontSize: '22px', fontWeight: 950, color: '#f97316', marginTop: '2px' }}>
              {scores[0]} <span style={{ fontSize: '11px', color: '#64748b' }}>seeds captured</span>
            </div>
            {turn === 0 && <div style={{ fontSize: '9px', fontWeight: 900, color: '#f97316', marginTop: '4px' }}>⚡ YOUR TURN</div>}
          </div>

          {/* Opponent Card */}
          <div style={{
            padding: '10px 12px', borderRadius: '12px',
            background: turn === 1 ? 'rgba(56, 189, 248, 0.15)' : '#111827',
            border: turn === 1 ? '2px solid #38bdf8' : '2px solid #1e293b',
            transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#e2e8f0' }}>🤖 {matchedOpponent}</div>
            <div style={{ fontSize: '22px', fontWeight: 950, color: '#38bdf8', marginTop: '2px' }}>
              {scores[1]} <span style={{ fontSize: '11px', color: '#64748b' }}>seeds captured</span>
            </div>
            {turn === 1 && <div style={{ fontSize: '9px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>⚡ OPPONENT TURN</div>}
          </div>

          {/* Rules & Heritage Popup Modal Trigger Button */}
          <button
            onClick={() => { setActiveModalTab('rules'); setShowRulesModal(true); }}
            style={{
              padding: '8px 12px', background: '#38bdf8', color: '#000', border: '2px solid #000',
              borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: '2px 2px 0 #000', marginTop: 'auto'
            }}
          >
            <BookOpen size={14} /> Rules & How to Play
          </button>

          {/* 3D View Toggle */}
          <button
            onClick={() => setView3D(!view3D)}
            style={{
              padding: '8px 12px', background: '#fbbf24', color: '#000', border: '2px solid #000',
              borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: '2px 2px 0 #000'
            }}
          >
            <Layers size={14} /> {view3D ? 'Flat View' : '3D View'}
          </button>
        </div>

        {/* ─── CENTER AREA: ULTRAWIDE 16:9 ULTRAWIDE AYÒ Ọ̀PỌ́N BOARD ─── */}
        <div style={{
          flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          {/* Status Message */}
          <div style={{
            fontSize: '13px', fontWeight: 900, color: turn === 0 ? '#f97316' : '#38bdf8',
            background: '#111827', padding: '4px 14px', borderRadius: '10px',
            border: '1.5px solid #1e293b', marginBottom: '8px'
          }}>
            {message}
          </div>

          {/* Ultrawide 3D Wooden Ayò Board Viewport */}
          <div style={{
            height: 'calc(100% - 40px)',
            maxWidth: '100%',
            aspectRatio: '2.2 / 1',
            borderRadius: '24px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: '18px',
            background: '#0f172a',
            padding: '16px 28px',
            boxShadow: view3D ? '0 24px 48px rgba(0,0,0,0.6)' : 'none',
            border: '2px solid rgba(255,255,255,0.12)',
            transformStyle: 'preserve-3d',
            transform: view3D ? 'rotateX(22deg) rotateY(-3deg) scale(0.96)' : 'none',
            transition: 'transform 0.4s ease-out'
          }}>
            {/* Opponent Store */}
            <div style={{ 
              width: '90px', 
              borderRadius: '45px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '2px solid rgba(255,255,255,0.08)',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '12px'
            }}>
              <div style={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1 }}>
                {opponentType === 'local' ? 'Player 2' : 'Opponent'}
              </div>
              <div style={{ fontSize: '34px', fontWeight: 950, color: '#fff' }}>{scores[1]}</div>
            </div>
            
            {/* Board Pits Grid */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
              {/* Top Row: Opponent Pits (11 down to 6) */}
              <div style={{ display: 'flex', gap: '14px' }}>
                {[11, 10, 9, 8, 7, 6].map(i => renderPit(i))}
              </div>
              
              {/* Bottom Row: Player Pits (0 up to 5) */}
              <div style={{ display: 'flex', gap: '14px' }}>
                {[0, 1, 2, 3, 4, 5].map(i => renderPit(i))}
              </div>
            </div>
            
            {/* Player 1 Store */}
            <div style={{ 
              width: '90px', 
              borderRadius: '45px', 
              background: 'rgba(249, 115, 22, 0.08)', 
              border: '2px solid rgba(249, 115, 22, 0.3)',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '12px'
            }}>
              <div style={{ color: '#f97316', marginBottom: '8px', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase' }}>You</div>
              <div style={{ fontSize: '34px', fontWeight: 950, color: '#f97316' }}>{scores[0]}</div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: LIVE GAME LOG ─── */}
        <div style={{
          flex: '0 0 200px', width: '200px', display: 'flex', flexDirection: 'column', gap: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            flex: 1, padding: '10px', borderRadius: '12px', background: '#111827',
            border: '2px solid #1e293b', overflowY: 'auto'
          }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📜 Game Log
            </h4>
            {gameLog.map((log, i) => (
              <div key={i} style={{ fontSize: '10px', color: '#94a3b8', padding: '3px 0', borderBottom: '1px solid #1e293b', fontWeight: 600 }}>
                {log}
              </div>
            ))}
          </div>

          <button
            onClick={resetGame}
            style={{
              padding: '8px', background: '#f97316', color: '#fff', border: '2px solid #000',
              borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '2px 2px 0 #000'
            }}
          >
            <RefreshCw size={14} /> Restart Game
          </button>
        </div>
      </div>

      {/* ─── RULES & HERITAGE POPUP MODAL WITH TAB NAVIGATION ─── */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 950, color: '#f97316' }}>
                <BookOpen size={24} /> Ayò Ọ̀pọ́n Guide & Rules
              </div>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1.5px solid #000' }}>
              <button
                onClick={() => setActiveModalTab('rules')}
                style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'rules' ? '#f97316' : 'transparent', color: activeModalTab === 'rules' ? '#fff' : '#475569' }}
              >
                📜 Game Rules
              </button>
              <button
                onClick={() => setActiveModalTab('how-to-play')}
                style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'how-to-play' ? '#f97316' : 'transparent', color: activeModalTab === 'how-to-play' ? '#fff' : '#475569' }}
              >
                🎮 How to Play
              </button>
              <button
                onClick={() => setActiveModalTab('heritage')}
                style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', background: activeModalTab === 'heritage' ? '#f97316' : 'transparent', color: activeModalTab === 'heritage' ? '#fff' : '#475569' }}
              >
                🌍 Heritage
              </button>
            </div>

            {/* Tab 1: Game Rules */}
            {activeModalTab === 'rules' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0', color: '#000' }}>Official Ayò Ọ̀pọ́n Rules & Scoring:</h4>
                <ul style={{ paddingLeft: '18px', margin: '0 0 12px 0' }}>
                  <li style={{ marginBottom: '4px' }}>The board has 12 pits (6 per player) with 4 seeds each (48 total seeds).</li>
                  <li style={{ marginBottom: '4px' }}>Seeds are sowed counter-clockwise one by one into subsequent pits.</li>
                  <li style={{ marginBottom: '4px' }}><strong>Capturing Rule</strong>: If your last seed lands in an opponent's pit and leaves <strong>2 or 3 seeds</strong> in that pit, you capture all seeds in that pit!</li>
                  <li style={{ marginBottom: '4px' }}><strong>Chain Capture</strong>: You also capture backwards from preceding consecutive opponent pits containing 2 or 3 seeds.</li>
                  <li style={{ marginBottom: '4px' }}><strong>Game Over</strong>: Occurs when a player has no valid seeds to sow or when one player captures over 24 seeds.</li>
                </ul>
              </div>
            )}

            {/* Tab 2: How to Play */}
            {activeModalTab === 'how-to-play' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0', color: '#000' }}>Step-by-Step Tutorial:</h4>
                <ol style={{ paddingLeft: '18px', margin: '0 0 12px 0' }}>
                  <li style={{ marginBottom: '6px' }}>Click any pit on your side (bottom row) that contains seeds.</li>
                  <li style={{ marginBottom: '6px' }}>Watch seeds distribute around the board pit by pit with audio feedback.</li>
                  <li style={{ marginBottom: '6px' }}>Target opponent pits to leave exactly 2 or 3 seeds for maximum captures!</li>
                </ol>
              </div>
            )}

            {/* Tab 3: Cultural Heritage */}
            {activeModalTab === 'heritage' && (
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 6px 0', color: '#000' }}>Yoruba Mathematical Heritage:</h4>
                <p style={{ margin: '0 0 12px 0' }}>
                  Ayò Ọ̀pọ́n is one of the oldest known strategy board games, originating from the Yoruba people of Nigeria. Played for centuries across West Africa, it teaches rapid mathematical calculation, spatial memory, foresight, and patience.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowRulesModal(false)}
              style={{
                width: '100%', padding: '10px', background: '#f97316', color: '#fff',
                border: '2px solid #000', borderRadius: '10px', fontWeight: 900, cursor: 'pointer',
                boxShadow: '2px 2px 0 #000', marginTop: '8px'
              }}
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
