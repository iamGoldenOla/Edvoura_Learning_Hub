'use client';

import React, { useState, useEffect } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Circle } from 'lucide-react';

export default function AyoOpon() {
  const [board, setBoard] = useState(Array(12).fill(4));
  const [scores, setScores] = useState([0, 0]); // [player1, player2]
  const [turn, setTurn] = useState(0); // 0 = Player 1 (You), 1 = Player 2 (AI)
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('Your turn!');

  const playMove = async (startIndex: number) => {
    if (isAnimating || gameOver) return;
    setIsAnimating(true);

    let currentBoard = [...board];
    let seeds = currentBoard[startIndex];
    currentBoard[startIndex] = 0;
    setBoard([...currentBoard]);

    let currentIndex = startIndex;

    while (seeds > 0) {
      await new Promise(resolve => setTimeout(resolve, 300));
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
      await new Promise(resolve => setTimeout(resolve, 300));
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
      setMessage(
        currentScores[0] > currentScores[1]
          ? 'You win!'
          : currentScores[0] < currentScores[1]
          ? 'AI wins!'
          : 'Draw!'
      );
      return;
    }

    setTurn(turn === 0 ? 1 : 0);
    setMessage(turn === 0 ? 'AI is thinking...' : 'Your turn!');
    setIsAnimating(false);
  };

  useEffect(() => {
    if (turn === 1 && !isAnimating && !gameOver) {
      const timer = setTimeout(() => {
        let bestMove = -1;
        let maxCapture = -1;
        let validMoves = [];
        
        for (let i = 6; i <= 11; i++) {
          if (board[i] > 0) validMoves.push(i);
        }

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
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [turn, isAnimating, gameOver, board]);

  const resetGame = () => {
    setBoard(Array(12).fill(4));
    setScores([0, 0]);
    setTurn(0);
    setGameOver(false);
    setMessage('Your turn!');
    setIsAnimating(false);
  };

  const renderPit = (i: number) => {
    const isP1 = i >= 0 && i <= 5;
    const canPlay = !isAnimating && !gameOver && turn === 0 && isP1 && board[i] > 0;
    
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

  return (
    <GameLayout
      title="Ayò Ọ̀pọ́n"
      icon={<Circle style={{ width: '24px', height: '24px' }} />}
      accentColor="#f97316"
      score={scores[0]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto', gap: '30px' }}>
        
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: turn === 0 ? '#f97316' : '#94a3b8',
          background: 'rgba(255,255,255,0.05)',
          padding: '10px 20px',
          borderRadius: '20px',
          transition: 'all 0.3s'
        }}>
          {message}
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'stretch', 
          justifyContent: 'center', 
          gap: '20px',
          background: '#0f172a',
          padding: '30px',
          borderRadius: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* AI Store */}
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
            <div style={{ color: '#94a3b8', marginBottom: '15px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>AI</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>{scores[1]}</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
            {/* Top Row: AI Pits (Right to Left: 11 down to 6) */}
            <div style={{ display: 'flex', gap: '15px' }}>
              {[11, 10, 9, 8, 7, 6].map(i => renderPit(i))}
            </div>
            
            {/* Bottom Row: Player Pits (Left to Right: 0 up to 5) */}
            <div style={{ display: 'flex', gap: '15px' }}>
              {[0, 1, 2, 3, 4, 5].map(i => renderPit(i))}
            </div>
          </div>
          
          {/* Player Store */}
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
            <div style={{ color: '#f97316', marginBottom: '15px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>You</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f97316' }}>{scores[0]}</div>
          </div>
        </div>

        {gameOver && (
          <button
            onClick={resetGame}
            style={{
              padding: '12px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#fff',
              background: '#f97316',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            New Game
          </button>
        )}

        <div style={{
          marginTop: '20px',
          padding: '25px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.05)',
          maxWidth: '600px',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          <h3 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '18px' }}>Cultural Heritage</h3>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>
            Ayò Ọ̀pọ́n is one of the oldest known board games, originating from the Yoruba people of Nigeria. Played for centuries across West Africa, it teaches mathematical thinking, strategy, and patience. The name means 'game of counting' in Yoruba.
          </p>
        </div>

      </div>
    </GameLayout>
  );
}
