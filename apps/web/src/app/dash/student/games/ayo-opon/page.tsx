'use client';

import React, { useState, useEffect } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Circle, Layers, RefreshCw, ChevronDown, ChevronUp, User, Users, Monitor } from 'lucide-react';

const OPPONENT_NAMES = ['Aisha Bello (Grade 4)', 'Chinedu Okafor (Grade 5)', 'Oluwaseun Adebayo (Grade 4)', 'Amara Egwu (Grade 5)', 'Tunde Cole (Grade 6)'];

export default function AyoOpon() {
  const [gameMode, setGameMode] = useState<'lobby' | 'matching' | 'playing'>('lobby');
  const [opponentType, setOpponentType] = useState<'ai' | 'local' | 'matchmaker'>('ai');
  const [matchedOpponent, setMatchedOpponent] = useState('Computer (AI)');
  const [showRules, setShowRules] = useState(false);

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
      let p1Remaining = currentBoard.slice(0, 6).reduce((a, b) => a + b, 0);
      let p2Remaining = currentBoard.slice(6, 12).reduce((a, b) => a + b, 0);
      currentScores[0] += p1Remaining;
      currentScores[1] += p2Remaining;
      setScores(currentScores);
      setBoard(Array(12).fill(0));
      setGameOver(true);
      setIsAnimating(false);
      
      const winnerName = currentScores[0] > currentScores[1] 
        ? 'You win!' 
        : currentScores[0] < currentScores[1] 
        ? `${matchedOpponent} wins!` 
        : 'Draw!';
      setMessage(winnerName);
      return;
    }

    const nextTurn = turn === 0 ? 1 : 0;
    setTurn(nextTurn);
    setIsAnimating(false);

    if (opponentType === 'local') {
      setMessage(nextTurn === 0 ? 'Your turn!' : "Player 2's turn!");
    } else {
      setMessage(nextTurn === 0 ? 'Your turn!' : `${matchedOpponent} is thinking...`);
    }
  };

  // Bot logic triggers
  useEffect(() => {
    const isBotTurn = turn === 1 && (opponentType === 'ai' || opponentType === 'matchmaker');
    if (isBotTurn && !isAnimating && !gameOver && gameMode === 'playing') {
      const timer = setTimeout(() => {
        let bestMove = -1;
        let maxCapture = -1;
        let validMoves = [];
        
        for (let i = 6; i <= 11; i++) {
          if (board[i] > 0) validMoves.push(i);
        }

        if (validMoves.length === 0) return;

        // Greedy heuristic
        for (let move of validMoves) {
          let tempBoard = [...board];
          let seeds = tempBoard[move];
          tempBoard[move] = 0;
          let curr = move;
          
          while (seeds > 0) {
            curr = (curr + 1) % 12;
            if (curr === move) continue;
            tempBoard[curr]++;
            seeds--;
          }
          
          let cap = 0;
          let cIdx = curr;
          while (
            cIdx >= 0 &&
            cIdx <= 5 &&
            (tempBoard[cIdx] === 2 || tempBoard[cIdx] === 3)
          ) {
            cap += tempBoard[cIdx];
            tempBoard[cIdx] = 0;
            cIdx = (cIdx - 1 + 12) % 12;
          }
          
          if (cap > maxCapture) {
            maxCapture = cap;
            bestMove = move;
          }
        }

        if (bestMove === -1) {
          bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        }

        if (bestMove !== -1) {
          playMove(bestMove);
        }
      }, 900);
      
      return () => clearTimeout(timer);
    }
  }, [turn, isAnimating, gameOver, board, opponentType, gameMode]);

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
    const isP1 = i >= 0 && i <= 5;
    
    // In local mode, let click on active player's pits. In AI mode, allow clicks only on Player 1 pits
    const activeRowTurn = opponentType === 'local' ? (turn === 0 ? isP1 : !isP1) : isP1;
    const canPlay = !isAnimating && !gameOver && activeRowTurn && board[i] > 0 && gameMode === 'playing';
    
    return (
      <div
        key={i}
        onClick={() => canPlay && playMove(i)}
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: canPlay ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.05)',
          border: canPlay ? '2px solid #f97316' : '2px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canPlay ? 'pointer' : 'default',
          padding: '10px',
          transition: 'all 0.3s ease',
          boxShadow: canPlay ? '0 0 15px rgba(249, 115, 22, 0.3)' : 'none',
        }}
        onMouseEnter={(e) => {
          if (canPlay) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = 'rgba(249, 115, 22, 0.25)';
          }
        }}
        onMouseLeave={(e) => {
          if (canPlay) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'rgba(249, 115, 22, 0.15)';
          } else {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
          {Array.from({ length: Math.min(board[i], 12) }).map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#f97316',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            />
          ))}
        </div>
        {board[i] > 12 && (
          <div style={{ fontSize: '12px', color: '#fff', width: '100%', textAlign: 'center', marginTop: '2px', fontWeight: 'bold' }}>
            +{board[i] - 12}
          </div>
        )}
        {board[i] === 0 && (
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>0</div>
        )}
      </div>
    );
  };

  if (gameMode === 'lobby') {
    return (
      <GameLayout title="Ayo Opon Lobby" icon={<Circle />} accentColor="#f97316" fullscreen={true}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: '32px', color: '#0f172a', textAlign: 'center', overflow: 'auto'
        }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#000000', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
              🫘 Ayò Ọ̀pọ́n Zone
            </h2>
            <p style={{ color: '#475569', fontSize: '15px', maxWidth: '500px', fontWeight: 600, margin: '0 auto' }}>
              Play the traditional game of counting! Challenge the AI, play with a classmate, or pair with other grades.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { type: 'ai', title: 'Play vs Computer', desc: 'Greedy heuristic AI', icon: Monitor },
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
                <m.icon size={36} style={{ color: '#f97316' }} />
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
      <GameLayout title="Matchmaking" icon={<Circle />} accentColor="#f97316" fullscreen={true}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: '32px', color: '#0f172a', textAlign: 'center'
        }}>
          <div className="radar-container" style={{
            position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="pulse" style={{
              position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
              border: '3px solid #f97316', animation: 'ping 1.5s infinite ease-out'
            }} />
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #000000',
              background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '3px 3px 0px #000000', zIndex: 2
            }}>
              <Users size={32} color="#f97316" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px 0' }}>Searching for matches...</h3>
            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 700 }}>Finding students in Grade 4, 5, or 6 to pair on the board...</p>
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
    <GameLayout
      title="Ayò Ọ̀pọ́n"
      icon={<Circle style={{ width: '24px', height: '24px' }} />}
      accentColor="#f97316"
      score={scores[0]}
      fullscreen={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', maxWidth: '800px', margin: '0 auto', gap: '10px', paddingBottom: '10px' }}>
        
        {/* Top Control Bar with permanent Restart and Lobby options */}
        <div style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)', padding: '10px 20px', borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0
        }}>
          <button
            onClick={resetGame}
            style={{
              padding: '8px 16px', background: '#f97316', color: '#ffffff', border: 'none',
              borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <RefreshCw size={14} /> Restart Game
          </button>
          <button
            onClick={quitToLobby}
            style={{
              padding: '8px 16px', background: '#fee2e2', color: '#ef4444', border: 'none',
              borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
            }}
          >
            Quit to Lobby
          </button>
        </div>

        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: turn === 0 ? '#f97316' : '#94a3b8',
          background: 'rgba(255,255,255,0.05)',
          padding: '8px 20px',
          borderRadius: '16px',
          transition: 'all 0.3s',
          flexShrink: 0
        }}>
          {message}
        </div>

        {/* 3D Board Viewport */}
        <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, perspective: '1000px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          <button
            onClick={() => setView3D(!view3D)}
            style={{
              position: 'absolute',
              top: '-20px',
              right: '20px',
              padding: '6px 14px',
              background: '#f97316',
              border: '2px solid #000000',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '11px',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 10
            }}
          >
            <Layers size={12} /> {view3D ? 'Flat View' : '3D View'}
          </button>

          <div style={{ 
            display: 'flex', 
            alignItems: 'stretch', 
            justifyContent: 'center', 
            gap: '20px',
            background: '#0f172a',
            padding: '30px',
            borderRadius: '40px',
            boxShadow: view3D ? '0 30px 50px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            transformStyle: 'preserve-3d',
            transform: view3D ? 'rotateX(30deg) rotateY(-5deg) scale(0.95)' : 'none',
            transition: 'transform 0.4s ease-out'
          }}>
            {/* Opponent Store */}
            <div style={{ 
              width: '100px', 
              borderRadius: '50px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '2px solid rgba(255,255,255,0.05)',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{ color: '#94a3b8', marginBottom: '15px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.2 }}>
                {opponentType === 'local' ? 'Player 2' : 'Opponent'}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>{scores[1]}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
              {/* Top Row: Opponent Pits (Right to Left: 11 down to 6) */}
              <div style={{ display: 'flex', gap: '15px' }}>
                {[11, 10, 9, 8, 7, 6].map(i => renderPit(i))}
              </div>
              
              {/* Bottom Row: Player Pits (Left to Right: 0 up to 5) */}
              <div style={{ display: 'flex', gap: '15px' }}>
                {[0, 1, 2, 3, 4, 5].map(i => renderPit(i))}
              </div>
            </div>
            
            {/* Player 1 Store */}
            <div style={{ 
              width: '100px', 
              borderRadius: '50px', 
              background: 'rgba(249, 115, 22, 0.05)', 
              border: '2px solid rgba(249, 115, 22, 0.2)',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{ color: '#f97316', marginBottom: '15px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>You</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f97316' }}>{scores[0]}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', flexShrink: 1, overflow: 'auto' }}>
        {/* Expandable How To Play / Game Rules Section */}
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setShowRules(!showRules)}
            style={{
              width: '100%', padding: '16px 24px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', background: 'none', border: 'none', color: '#ffffff',
              fontSize: '16px', fontWeight: 800, cursor: 'pointer', outline: 'none'
            }}
          >
            <span>📜 How to Play & Game Rules</span>
            {showRules ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {showRules && (
            <div style={{
              padding: '0 24px 24px 24px', color: '#94a3b8', fontSize: '14px', textAlign: 'left',
              lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px'
            }}>
              <h4 style={{ color: '#ffffff', fontWeight: 800, margin: '0 0 8px 0' }}>The Object of the Game</h4>
              <p style={{ margin: '0 0 16px 0' }}>
                Ayò Ọ̀pọ́n is a game of counting and capturing. The objective is to capture more seeds than your opponent. The game board consists of 12 pits, and each pit starts with 4 seeds.
              </p>
              
              <h4 style={{ color: '#ffffff', fontWeight: 800, margin: '0 0 8px 0' }}>Rules of Play</h4>
              <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '6px' }}>On your turn, choose any pit on your side (the bottom row) containing seeds.</li>
                <li style={{ marginBottom: '6px' }}>Empty all seeds from that pit and sow them counter-clockwise, one by one, into the succeeding pits.</li>
                <li style={{ marginBottom: '6px' }}>If you make a full loop and return to the starting pit, skip it and continue sowing to the next pit.</li>
              </ul>
              
              <h4 style={{ color: '#ffffff', fontWeight: 800, margin: '0 0 8px 0' }}>Capturing Seeds</h4>
              <p style={{ margin: '0 0 16px 0' }}>
                If the last seed of your turn lands in an opponent's pit and makes the total seeds in that pit exactly 2 or 3, you capture those seeds. You also capture seeds from the previous pit if it is on the opponent's side and has 2 or 3 seeds, working backward.
              </p>
              
              <h4 style={{ color: '#ffffff', fontWeight: 800, margin: '0 0 8px 0' }}>Ending the Game</h4>
              <p style={{ margin: 0 }}>
                The game ends when one player's side is completely empty of seeds and cannot be sown into. Any remaining seeds on the board are claimed by the player on whose side they reside.
              </p>
            </div>
          )}
        </div>

        {/* Cultural Context */}
        <div style={{
          padding: '15px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)',
          textAlign: 'center',
          lineHeight: '1.4',
          flexShrink: 0
        }}>
          <h3 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '16px' }}>Cultural Heritage</h3>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
            Ayò Ọ̀pọ́n is one of the oldest known board games, originating from the Yoruba people of Nigeria. Played for centuries across West Africa, it teaches mathematical thinking, strategy, and patience. The name means 'game of counting' in Yoruba.
          </p>
        </div>
        </div>

      </div>
    </GameLayout>
  );
}
