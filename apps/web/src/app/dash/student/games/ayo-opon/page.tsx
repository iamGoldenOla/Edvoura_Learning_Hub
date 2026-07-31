'use client';

import React, { useState, useEffect } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Circle, Layers, RefreshCw, ChevronDown, ChevronUp, User, Users, Monitor, BookOpen } from 'lucide-react';

const OPPONENT_NAMES = ['Aisha Bello (Grade 4)', 'Chinedu Okafor (Grade 5)', 'Oluwaseun Adebayo (Grade 4)', 'Amara Egwu (Grade 5)', 'Tunde Cole (Grade 6)'];

export default function AyoOpon() {
  const [gameMode, setGameMode] = useState<'lobby' | 'matching' | 'playing'>('lobby');
  const [opponentType, setOpponentType] = useState<'ai' | 'local' | 'matchmaker'>('ai');
  const [matchedOpponent, setMatchedOpponent] = useState('Computer (AI)');
  const [showRulesModal, setShowRulesModal] = useState(false);

  const [board, setBoard] = useState(Array(12).fill(4));
  const [scores, setScores] = useState([0, 0]); // [player1, player2]
  const [turn, setTurn] = useState(0); // 0 = Player 1, 1 = Player 2 (AI or Local Opponent)
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('Your turn!');
  const [view3D, setView3D] = useState(true);

  const startMode = (type: 'ai' | 'local' | 'matchmaker') => {
    setOpponentType(type);
    setBoard(Array(12).fill(4));
    setScores([0, 0]);
    setTurn(0);
    setGameOver(false);
    setMessage('Your turn!');
    setIsAnimating(false);
    
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

    let currentBoard = [...board];
    let seeds = currentBoard[startIndex];
    currentBoard[startIndex] = 0;
    setBoard([...currentBoard]);

    let currentIndex = startIndex;

    while (seeds > 0) {
      await new Promise(resolve => setTimeout(resolve, 250));
      currentIndex = (currentIndex + 1) % 12;

      // Skip starting pit if we make a full loop
      if (currentIndex === startIndex) {
        continue;
      }

      currentBoard[currentIndex]++;
      seeds--;
      setBoard([...currentBoard]);
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
      await new Promise(resolve => setTimeout(resolve, 250));
      capturedThisTurn += currentBoard[captureIndex];
      currentBoard[captureIndex] = 0;
      setBoard([...currentBoard]);
      captureIndex = (captureIndex - 1 + 12) % 12;
    }

    currentScores[turn] += capturedThisTurn;
    setScores([...currentScores]);

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

      if (currentScores[0] > currentScores[1]) {
        setMessage('🏆 Game Over - You Win!');
      } else if (currentScores[1] > currentScores[0]) {
        setMessage(`🏆 Game Over - ${matchedOpponent} Wins!`);
      } else {
        setMessage('🤝 Game Over - It is a Tie!');
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
  };

  const quitToLobby = () => {
    setGameMode('lobby');
  };

  const renderPit = (i: number) => {
    const isPlayerPit = i >= 0 && i <= 5;
    const isOpponentPit = i >= 6 && i <= 11;
    const canClick = !isAnimating && !gameOver && ((turn === 0 && isPlayerPit) || (turn === 1 && opponentType === 'local' && isOpponentPit));

    return (
      <div
        key={i}
        onClick={() => canClick && board[i] > 0 && playMove(i)}
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: canClick && board[i] > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          border: canClick && board[i] > 0 ? '2px solid #f97316' : '1.5px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          cursor: canClick && board[i] > 0 ? 'pointer' : 'default',
          position: 'relative',
          transition: 'all 0.2s ease',
          boxShadow: canClick && board[i] > 0 ? '0 0 10px rgba(249, 115, 22, 0.3)' : 'none'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', alignItems: 'center', maxWidth: '36px' }}>
          {Array.from({ length: Math.min(board[i], 8) }).map((_, seedIdx) => (
            <div
              key={seedIdx}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f97316',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
              }}
            />
          ))}
        </div>
        {board[i] > 8 && (
          <div style={{ fontSize: '10px', color: '#fff', width: '100%', textAlign: 'center', marginTop: '1px', fontWeight: 'bold' }}>
            +{board[i] - 8}
          </div>
        )}
        {board[i] === 0 && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>0</div>
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
              Play the ancient Yoruba game of counting in a zero-scroll 16:9 widescreen layout!
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
      {/* Zero-Scroll 16:9 Main Game Viewport */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        height: '100%', overflow: 'hidden', padding: '8px', boxSizing: 'border-box'
      }}>
        
        {/* Top Header Controls Bar */}
        <div style={{
          width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#111827', padding: '6px 14px', borderRadius: '12px',
          border: '1.5px solid #1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={resetGame}
              style={{
                padding: '5px 12px', background: '#f97316', color: '#ffffff', border: '1.5px solid #000',
                borderRadius: '8px', fontSize: '11px', fontWeight: 900, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '1.5px 1.5px 0 #000'
              }}
            >
              <RefreshCw size={12} /> Restart
            </button>
            <button
              onClick={() => setShowRulesModal(true)}
              style={{
                padding: '5px 12px', background: '#1e293b', color: '#38bdf8', border: '1.5px solid #334155',
                borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <BookOpen size={12} /> How to Play
            </button>
          </div>

          <div style={{
            fontSize: '13px',
            fontWeight: 900,
            color: turn === 0 ? '#f97316' : '#38bdf8',
            background: '#1e293b',
            padding: '4px 12px',
            borderRadius: '8px',
            border: '1px solid #334155'
          }}>
            {message}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setView3D(!view3D)}
              style={{
                padding: '5px 10px', background: '#fbbf24', color: '#000', border: '1.5px solid #000',
                borderRadius: '8px', fontSize: '11px', fontWeight: 900, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '1.5px 1.5px 0 #000'
              }}
            >
              <Layers size={12} /> {view3D ? 'Flat View' : '3D View'}
            </button>
            <button
              onClick={quitToLobby}
              style={{
                padding: '5px 12px', background: '#fee2e2', color: '#ef4444', border: '1.5px solid #000',
                borderRadius: '8px', fontSize: '11px', fontWeight: 900, cursor: 'pointer'
              }}
            >
              Quit
            </button>
          </div>
        </div>

        {/* Center 16:9 Ayò Ọ̀pọ́n Board Viewport */}
        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            maxWidth: '100%',
            aspectRatio: '16 / 9',
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: '16px',
            background: '#0f172a',
            padding: '16px 24px',
            borderRadius: '24px',
            boxShadow: view3D ? '0 20px 40px rgba(0,0,0,0.5)' : 'none',
            border: '2px solid rgba(255,255,255,0.1)',
            transformStyle: 'preserve-3d',
            transform: view3D ? 'rotateX(24deg) rotateY(-4deg) scale(0.96)' : 'none',
            transition: 'transform 0.4s ease-out',
            boxSizing: 'border-box'
          }}>
            {/* Opponent Store */}
            <div style={{ 
              width: '80px', 
              borderRadius: '40px', 
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
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>{scores[1]}</div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center', alignItems: 'center' }}>
              {/* Top Row: Opponent Pits (11 down to 6) */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {[11, 10, 9, 8, 7, 6].map(i => renderPit(i))}
              </div>
              
              {/* Bottom Row: Player Pits (0 up to 5) */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {[0, 1, 2, 3, 4, 5].map(i => renderPit(i))}
              </div>
            </div>
            
            {/* Player 1 Store */}
            <div style={{ 
              width: '80px', 
              borderRadius: '40px', 
              background: 'rgba(249, 115, 22, 0.08)', 
              border: '2px solid rgba(249, 115, 22, 0.3)',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '12px'
            }}>
              <div style={{ color: '#f97316', marginBottom: '8px', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase' }}>You</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#f97316' }}>{scores[0]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules & Cultural Info Modal */}
      {showRulesModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', border: '3px solid #000',
            padding: '20px', width: '420px', maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '6px 6px 0 #000', color: '#000'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 950, margin: '0 0 10px 0', color: '#f97316' }}>📜 Ayò Ọ̀pọ́n Rules & Heritage</h3>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>
              Ayò Ọ̀pọ́n is an ancient Yoruba game of counting and strategy originating from Nigeria.
            </p>
            <h4 style={{ fontSize: '13px', fontWeight: 900, margin: '0 0 4px 0' }}>How to Play:</h4>
            <ul style={{ fontSize: '12px', color: '#1e293b', paddingLeft: '18px', margin: '0 0 12px 0', lineHeight: 1.5 }}>
              <li>Choose a pit on your side (bottom row) with seeds.</li>
              <li>Sow seeds counter-clockwise into subsequent pits.</li>
              <li>If the last seed lands in an opponent pit with 2 or 3 seeds, capture those seeds!</li>
              <li>Game ends when one player's side is empty and cannot be sown into.</li>
            </ul>
            <button
              onClick={() => setShowRulesModal(false)}
              style={{
                width: '100%', padding: '8px', background: '#f97316', color: '#fff',
                border: '2px solid #000', borderRadius: '8px', fontWeight: 900, cursor: 'pointer'
              }}
            >
              Got It! Close
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
