'use client';

import { useState, useCallback } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Dice1, RotateCcw } from 'lucide-react';

interface Property {
  name: string;
  subject: string;
  price: number;
  rent: number;
  color: string;
  owner: number | null;
}

interface PlayerState {
  name: string;
  balance: number;
  position: number;
  color: string;
  emoji: string;
  inJail: boolean;
  jailTurns: number;
}

type SpaceType = 'property' | 'start' | 'tax' | 'chance' | 'quiz' | 'jail' | 'go-to-jail' | 'free-parking';

interface BoardSpace {
  name: string;
  type: SpaceType;
  property?: Property;
}

const QUIZ_QUESTIONS = [
  { q: 'What is the capital of France?', options: ['London', 'Paris', 'Berlin', 'Madrid'], answer: 1 },
  { q: 'What is 15 × 12?', options: ['170', '180', '160', '150'], answer: 1 },
  { q: 'Which planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], answer: 2 },
  { q: 'What gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'CO2', 'Hydrogen'], answer: 2 },
  { q: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], answer: 1 },
  { q: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 3 },
  { q: 'Who wrote Romeo and Juliet?', options: ['Dickens', 'Shakespeare', 'Austen', 'Twain'], answer: 1 },
  { q: 'What is the square root of 144?', options: ['10', '11', '12', '14'], answer: 2 },
  { q: 'Which element has symbol "O"?', options: ['Gold', 'Osmium', 'Oxygen', 'Iron'], answer: 2 },
  { q: 'What continent is Egypt in?', options: ['Asia', 'Europe', 'Africa', 'South America'], answer: 2 },
  { q: 'What is 3⁴?', options: ['27', '81', '64', '9'], answer: 1 },
  { q: 'What is the chemical formula for water?', options: ['HO', 'H2O', 'CO2', 'O2'], answer: 1 },
];

const CHANCE_CARDS = [
  { text: 'Your homework was perfect! Collect $50.', effect: 50 },
  { text: 'Library fine! Pay $30.', effect: -30 },
  { text: 'Won the science fair! Collect $100.', effect: 100 },
  { text: 'Lost your textbook. Pay $40.', effect: -40 },
  { text: 'Helped a classmate. Collect $25.', effect: 25 },
  { text: 'Forgot your lunch money. Pay $20.', effect: -20 },
  { text: 'Top of the class! Collect $75.', effect: 75 },
  { text: 'Broke a lab beaker. Pay $50.', effect: -50 },
];

function createBoard(): BoardSpace[] {
  const props: Omit<Property, 'owner'>[] = [
    { name: 'Algebra Lane', subject: 'Mathematics', price: 60, rent: 6, color: '#8b5cf6' },
    { name: 'Grammar Gardens', subject: 'English', price: 60, rent: 6, color: '#8b5cf6' },
    { name: 'History Heights', subject: 'History', price: 100, rent: 10, color: '#38bdf8' },
    { name: 'Geography Grove', subject: 'Geography', price: 100, rent: 10, color: '#38bdf8' },
    { name: 'Biology Blvd', subject: 'Biology', price: 120, rent: 12, color: '#38bdf8' },
    { name: 'Chemistry Close', subject: 'Chemistry', price: 140, rent: 14, color: '#f472b6' },
    { name: 'Physics Park', subject: 'Physics', price: 140, rent: 14, color: '#f472b6' },
    { name: 'Art Avenue', subject: 'Art', price: 160, rent: 16, color: '#f472b6' },
    { name: 'Music Manor', subject: 'Music', price: 180, rent: 18, color: '#fb923c' },
    { name: 'Literature Lane', subject: 'Literature', price: 180, rent: 18, color: '#fb923c' },
    { name: 'Economics Estate', subject: 'Economics', price: 200, rent: 20, color: '#fb923c' },
    { name: 'Computer Court', subject: 'Computing', price: 220, rent: 22, color: '#ef4444' },
    { name: 'Sports Stadium', subject: 'P.E.', price: 220, rent: 22, color: '#ef4444' },
    { name: 'Drama Drive', subject: 'Drama', price: 240, rent: 24, color: '#ef4444' },
    { name: 'Calculus Castle', subject: 'Mathematics', price: 280, rent: 28, color: '#22c55e' },
    { name: 'Robotics Road', subject: 'Engineering', price: 300, rent: 30, color: '#22c55e' },
    { name: 'Philosophy Plaza', subject: 'Philosophy', price: 320, rent: 32, color: '#facc15' },
    { name: 'Astronomy Ave', subject: 'Astronomy', price: 350, rent: 35, color: '#facc15' },
    { name: 'Medicine Mile', subject: 'Medicine', price: 400, rent: 40, color: '#06b6d4' },
    { name: 'Law Library', subject: 'Law', price: 400, rent: 40, color: '#06b6d4' },
  ];

  const spaces: BoardSpace[] = [];
  let propIdx = 0;

  for (let i = 0; i < 28; i++) {
    if (i === 0) {
      spaces.push({ name: 'START', type: 'start' });
    } else if (i === 7) {
      spaces.push({ name: 'Jail / Visiting', type: 'jail' });
    } else if (i === 14) {
      spaces.push({ name: 'Free Parking', type: 'free-parking' });
    } else if (i === 21) {
      spaces.push({ name: 'Go To Jail', type: 'go-to-jail' });
    } else if (i === 4 || i === 18) {
      spaces.push({ name: 'Tax Day', type: 'tax' });
    } else if (i === 3 || i === 10 || i === 17 || i === 24) {
      spaces.push({ name: 'Quiz Time!', type: 'quiz' });
    } else if (i === 6 || i === 13 || i === 20 || i === 26) {
      spaces.push({ name: 'Chance', type: 'chance' });
    } else {
      if (propIdx < props.length) {
        const p = props[propIdx++];
        spaces.push({
          name: p.name,
          type: 'property',
          property: { ...p, owner: null }
        });
      } else {
        spaces.push({ name: 'Chance', type: 'chance' });
      }
    }
  }

  return spaces;
}

const PLAYER_CONFIGS = [
  { name: 'Player 1', color: '#3b82f6', emoji: '🎓' },
  { name: 'Player 2', color: '#ef4444', emoji: '📚' },
  { name: 'Player 3', color: '#22c55e', emoji: '🔬' },
  { name: 'Player 4', color: '#f59e0b', emoji: '🎨' },
];

export default function MonopolyPage() {
  const [numPlayers, setNumPlayers] = useState(0);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [board, setBoard] = useState<BoardSpace[]>(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dice, setDice] = useState<[number, number]>([0, 0]);
  const [phase, setPhase] = useState<'roll' | 'action' | 'quiz' | 'chance' | 'gameover'>('roll');
  const [actionMessage, setActionMessage] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState<typeof QUIZ_QUESTIONS[0] | null>(null);
  const [currentChance, setCurrentChance] = useState<typeof CHANCE_CARDS[0] | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  const addLog = useCallback((msg: string) => {
    setGameLog(prev => [msg, ...prev].slice(0, 50));
  }, []);

  const startGame = useCallback((n: number) => {
    setNumPlayers(n);
    setPlayers(PLAYER_CONFIGS.slice(0, n).map(c => ({
      ...c,
      balance: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0
    })));
    setBoard(createBoard());
    setCurrentPlayer(0);
    setPhase('roll');
    setDice([0, 0]);
    setActionMessage('');
    setGameLog([`Game started with ${n} players!`]);
    setWinner(null);
  }, []);

  const rollDice = useCallback(() => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);

    const total = d1 + d2;
    const player = players[currentPlayer];

    if (player.inJail) {
      if (d1 === d2) {
        const updated = [...players];
        updated[currentPlayer] = { ...player, inJail: false, jailTurns: 0 };
        setPlayers(updated);
        addLog(`${player.emoji} ${player.name} rolled doubles and escaped jail!`);
        movePlayer(updated, currentPlayer, total);
      } else if (player.jailTurns >= 2) {
        const updated = [...players];
        updated[currentPlayer] = { ...player, inJail: false, jailTurns: 0, balance: player.balance - 50 };
        setPlayers(updated);
        addLog(`${player.emoji} ${player.name} paid $50 to get out of jail.`);
        movePlayer(updated, currentPlayer, total);
      } else {
        const updated = [...players];
        updated[currentPlayer] = { ...player, jailTurns: player.jailTurns + 1 };
        setPlayers(updated);
        addLog(`${player.emoji} ${player.name} is stuck in jail. Turn ${player.jailTurns + 1}/3.`);
        setPhase('action');
        setActionMessage(`You're in jail! Roll doubles to escape.`);
      }
      return;
    }

    movePlayer([...players], currentPlayer, total);
  }, [players, currentPlayer, addLog]);

  const movePlayer = useCallback((updatedPlayers: PlayerState[], pIdx: number, steps: number) => {
    const player = updatedPlayers[pIdx];
    const oldPos = player.position;
    const newPos = (oldPos + steps) % board.length;

    // Pass START bonus
    if (newPos < oldPos) {
      updatedPlayers[pIdx] = { ...player, position: newPos, balance: player.balance + 200 };
      addLog(`${player.emoji} ${player.name} passed START and collected $200!`);
    } else {
      updatedPlayers[pIdx] = { ...player, position: newPos };
    }

    setPlayers(updatedPlayers);
    const space = board[newPos];

    // Handle landing
    if (space.type === 'go-to-jail') {
      const jailed = [...updatedPlayers];
      jailed[pIdx] = { ...jailed[pIdx], position: 7, inJail: true, jailTurns: 0 };
      setPlayers(jailed);
      addLog(`${player.emoji} ${player.name} was sent to Jail!`);
      setActionMessage('You\'ve been sent to Jail!');
      setPhase('action');
    } else if (space.type === 'tax') {
      const taxed = [...updatedPlayers];
      taxed[pIdx] = { ...taxed[pIdx], balance: taxed[pIdx].balance - 100 };
      setPlayers(taxed);
      addLog(`${player.emoji} ${player.name} paid $100 tax.`);
      setActionMessage('Tax Day! You paid $100.');
      setPhase('action');
    } else if (space.type === 'quiz') {
      const q = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
      setCurrentQuiz(q);
      setPhase('quiz');
    } else if (space.type === 'chance') {
      const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
      setCurrentChance(card);
      const chanced = [...updatedPlayers];
      chanced[pIdx] = { ...chanced[pIdx], balance: chanced[pIdx].balance + card.effect };
      setPlayers(chanced);
      addLog(`${player.emoji} ${player.name}: ${card.text}`);
      setPhase('chance');
    } else if (space.type === 'property' && space.property) {
      if (space.property.owner === null) {
        setActionMessage(`${space.name} (${space.property.subject}) is available for $${space.property.price}. Buy it?`);
        setPhase('action');
      } else if (space.property.owner !== pIdx) {
        const rent = space.property.rent;
        const rented = [...updatedPlayers];
        rented[pIdx] = { ...rented[pIdx], balance: rented[pIdx].balance - rent };
        rented[space.property.owner] = { ...rented[space.property.owner], balance: rented[space.property.owner].balance + rent };
        setPlayers(rented);
        addLog(`${player.emoji} ${player.name} paid $${rent} rent to ${rented[space.property.owner].name}.`);
        setActionMessage(`You paid $${rent} rent for ${space.name}.`);
        setPhase('action');
      } else {
        setActionMessage(`You own ${space.name}. Nothing to do.`);
        setPhase('action');
      }
    } else {
      setActionMessage(`Landed on ${space.name}.`);
      setPhase('action');
    }

    // Check bankruptcy
    const bankrupt = updatedPlayers.findIndex(p => p.balance < 0);
    if (bankrupt !== -1) {
      const remainingPlayers = updatedPlayers.filter((_, i) => i !== bankrupt);
      if (remainingPlayers.length === 1) {
        setWinner(remainingPlayers[0].name);
        setPhase('gameover');
      }
      addLog(`${updatedPlayers[bankrupt].emoji} ${updatedPlayers[bankrupt].name} is bankrupt!`);
    }
  }, [board, addLog]);

  const buyProperty = useCallback(() => {
    const player = players[currentPlayer];
    const space = board[player.position];
    if (space.type !== 'property' || !space.property || space.property.owner !== null) return;
    if (player.balance < space.property.price) {
      setActionMessage('Not enough money!');
      return;
    }

    const newPlayers = [...players];
    newPlayers[currentPlayer] = { ...player, balance: player.balance - space.property.price };
    setPlayers(newPlayers);

    const newBoard = [...board];
    newBoard[player.position] = {
      ...space,
      property: { ...space.property, owner: currentPlayer }
    };
    setBoard(newBoard);
    addLog(`${player.emoji} ${player.name} bought ${space.name} for $${space.property.price}.`);
    setActionMessage(`You bought ${space.name}!`);
  }, [players, board, currentPlayer, addLog]);

  const answerQuiz = useCallback((optionIdx: number) => {
    if (!currentQuiz) return;
    const player = players[currentPlayer];
    const correct = optionIdx === currentQuiz.answer;

    const updated = [...players];
    if (correct) {
      updated[currentPlayer] = { ...player, balance: player.balance + 50 };
      addLog(`${player.emoji} ${player.name} answered correctly and earned $50!`);
      setActionMessage('Correct! +$50');
    } else {
      updated[currentPlayer] = { ...player, balance: player.balance - 25 };
      addLog(`${player.emoji} ${player.name} answered wrong and lost $25.`);
      setActionMessage('Wrong answer! -$25');
    }
    setPlayers(updated);
    setCurrentQuiz(null);
    setPhase('action');
  }, [currentQuiz, players, currentPlayer, addLog]);

  const endTurn = useCallback(() => {
    const next = (currentPlayer + 1) % numPlayers;
    setCurrentPlayer(next);
    setPhase('roll');
    setActionMessage('');
    setCurrentChance(null);
  }, [currentPlayer, numPlayers]);

  // Player selection screen
  if (numPlayers === 0) {
    return (
      <GameLayout title="Monopoly: Edvoura Edition" icon={<Dice1 size={24} />} accentColor="#f59e0b">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '32px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', margin: '0 0 8px 0' }}>
              🎲 Monopoly: Edvoura Edition
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '500px' }}>
              Buy academic properties, answer quiz questions, and become the smartest investor on campus!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => startGame(n)}
                style={{
                  padding: '20px 40px',
                  borderRadius: '16px',
                  border: '2px solid rgba(245,158,11,0.3)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
                  color: '#fbbf24',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#f59e0b'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; }}
              >
                {n} Players
              </button>
            ))}
          </div>
        </div>
      </GameLayout>
    );
  }

  const currentSpace = board[players[currentPlayer]?.position ?? 0];
  const canBuy = currentSpace?.type === 'property' && currentSpace.property?.owner === null && phase === 'action';

  // Board rendering helper
  const renderBoardSpace = (idx: number, style: React.CSSProperties) => {
    const space = board[idx];
    if (!space) return null;
    const playersHere = players.filter(p => p.position === idx);
    const bgColor = space.type === 'property' && space.property
      ? space.property.color + '22'
      : space.type === 'start' ? 'rgba(34,197,94,0.15)'
      : space.type === 'jail' ? 'rgba(239,68,68,0.12)'
      : space.type === 'go-to-jail' ? 'rgba(239,68,68,0.2)'
      : space.type === 'quiz' ? 'rgba(168,85,247,0.15)'
      : space.type === 'chance' ? 'rgba(56,189,248,0.15)'
      : space.type === 'tax' ? 'rgba(239,68,68,0.15)'
      : 'rgba(255,255,255,0.04)';

    const borderTop = space.type === 'property' && space.property
      ? `3px solid ${space.property.color}`
      : '1px solid rgba(255,255,255,0.08)';

    return (
      <div key={idx} style={{
        ...style,
        background: bgColor,
        borderTop,
        borderRadius: '6px',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: `1px solid rgba(255,255,255,0.08)`,
        position: 'relative',
        overflow: 'hidden',
        minHeight: '60px'
      }}>
        <div style={{ fontSize: '8px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.2 }}>
          {space.name}
        </div>
        {space.type === 'property' && space.property && (
          <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>
            ${space.property.price}
            {space.property.owner !== null && (
              <span style={{ color: players[space.property.owner]?.color, marginLeft: '4px' }}>
                {players[space.property.owner]?.emoji}
              </span>
            )}
          </div>
        )}
        {space.type === 'quiz' && <div style={{ fontSize: '14px' }}>📝</div>}
        {space.type === 'chance' && <div style={{ fontSize: '14px' }}>🎴</div>}
        {space.type === 'start' && <div style={{ fontSize: '14px' }}>🚀</div>}
        {space.type === 'jail' && <div style={{ fontSize: '14px' }}>🔒</div>}
        {space.type === 'go-to-jail' && <div style={{ fontSize: '14px' }}>👮</div>}
        {space.type === 'tax' && <div style={{ fontSize: '14px' }}>💰</div>}
        {space.type === 'free-parking' && <div style={{ fontSize: '14px' }}>🅿️</div>}

        {playersHere.length > 0 && (
          <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
            {playersHere.map(p => (
              <span key={p.name} style={{ fontSize: '14px' }}>{p.emoji}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Board layout: 28 spaces around a rectangle (8 per side)
  const topRow = Array.from({ length: 8 }, (_, i) => i); // 0-7
  const rightCol = Array.from({ length: 6 }, (_, i) => 8 + i); // 8-13
  const bottomRow = Array.from({ length: 8 }, (_, i) => 21 - i); // 14-21 reversed
  const leftCol = Array.from({ length: 6 }, (_, i) => 27 - i); // 22-27 reversed

  return (
    <GameLayout title="Monopoly: Edvoura Edition" icon={<Dice1 size={24} />} accentColor="#f59e0b">
      {phase === 'gameover' && winner ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px' }}>🏆</div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#fbbf24' }}>{winner} Wins!</h2>
          <button
            onClick={() => { setNumPlayers(0); setPhase('roll'); }}
            style={{
              padding: '16px 32px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              fontSize: '16px', fontWeight: 700, background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <RotateCcw size={18} /> Play Again
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Board */}
          <div style={{ position: 'relative' }}>
            {/* Top row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 80px)', gap: '3px' }}>
              {topRow.map(i => renderBoardSpace(i, { width: '80px' }))}
            </div>
            {/* Middle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {leftCol.map(i => renderBoardSpace(i, { width: '80px' }))}
              </div>
              {/* Center area */}
              <div style={{
                flex: 1,
                margin: '0 3px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                gap: '12px'
              }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', textAlign: 'center' }}>
                  🎓 EDVOURA
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>
                  MONOPOLY EDITION
                </div>

                {/* Dice */}
                <div style={{ display: 'flex', gap: '12px', margin: '12px 0' }}>
                  {dice.map((d, i) => (
                    <div key={i} style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      background: d ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#78350f',
                      boxShadow: d ? '0 4px 12px rgba(245,158,11,0.3)' : 'none'
                    }}>
                      {d || '?'}
                    </div>
                  ))}
                </div>

                {/* Current Player */}
                <div style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: `${players[currentPlayer]?.color}22`,
                  border: `1px solid ${players[currentPlayer]?.color}44`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Current Turn</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: players[currentPlayer]?.color }}>
                    {players[currentPlayer]?.emoji} {players[currentPlayer]?.name}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {phase === 'roll' && (
                    <button
                      onClick={rollDice}
                      style={{
                        padding: '12px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        fontSize: '14px', fontWeight: 700, background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white', boxShadow: '0 4px 16px rgba(245,158,11,0.3)'
                      }}
                    >
                      🎲 Roll Dice
                    </button>
                  )}
                  {phase === 'action' && (
                    <>
                      {canBuy && (
                        <button
                          onClick={buyProperty}
                          style={{
                            padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontSize: '13px', fontWeight: 700, background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white'
                          }}
                        >
                          Buy (${currentSpace.property?.price})
                        </button>
                      )}
                      <button
                        onClick={endTurn}
                        style={{
                          padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
                          cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                          background: 'rgba(255,255,255,0.06)', color: '#e2e8f0'
                        }}
                      >
                        End Turn →
                      </button>
                    </>
                  )}
                  {phase === 'chance' && (
                    <button
                      onClick={endTurn}
                      style={{
                        padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 700, background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                        color: 'white'
                      }}
                    >
                      Continue →
                    </button>
                  )}
                </div>

                {/* Quiz overlay */}
                {phase === 'quiz' && currentQuiz && (
                  <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(168,85,247,0.12)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    maxWidth: '300px'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#c084fc', marginBottom: '10px' }}>
                      📝 Quiz Time!
                    </div>
                    <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 600, marginBottom: '12px' }}>
                      {currentQuiz.q}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {currentQuiz.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => answerQuiz(i)}
                          style={{
                            padding: '8px 14px', borderRadius: '8px',
                            border: '1px solid rgba(168,85,247,0.25)', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 600, background: 'rgba(168,85,247,0.08)',
                            color: '#e2e8f0', textAlign: 'left', transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chance card */}
                {phase === 'chance' && currentChance && (
                  <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(56,189,248,0.12)',
                    border: '1px solid rgba(56,189,248,0.3)',
                    maxWidth: '260px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎴</div>
                    <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>
                      {currentChance.text}
                    </div>
                    <div style={{
                      fontSize: '16px', fontWeight: 800, marginTop: '8px',
                      color: currentChance.effect > 0 ? '#22c55e' : '#ef4444'
                    }}>
                      {currentChance.effect > 0 ? '+' : ''}{currentChance.effect}
                    </div>
                  </div>
                )}

                {/* Action message */}
                {actionMessage && phase === 'action' && (
                  <div style={{
                    padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
                    fontSize: '12px', color: '#94a3b8', textAlign: 'center', maxWidth: '280px'
                  }}>
                    {actionMessage}
                  </div>
                )}
              </div>
              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {rightCol.map(i => renderBoardSpace(i, { width: '80px' }))}
              </div>
            </div>
            {/* Bottom row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 80px)', gap: '3px', marginTop: '3px' }}>
              {bottomRow.map(i => renderBoardSpace(i, { width: '80px' }))}
            </div>
          </div>

          {/* Side Panel */}
          <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Player balances */}
            {players.map((p, i) => (
              <div key={i} style={{
                padding: '14px',
                borderRadius: '12px',
                background: i === currentPlayer ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                border: i === currentPlayer ? `2px solid ${p.color}55` : '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{p.emoji}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: p.color }}>{p.name}</span>
                  </div>
                  {p.inJail && <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>JAIL</span>}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#22c55e', marginTop: '6px' }}>
                  ${p.balance.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  Properties: {board.filter(s => s.property?.owner === i).length}
                </div>
              </div>
            ))}

            {/* Game Log */}
            <div style={{
              padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', flex: 1, maxHeight: '200px', overflowY: 'auto'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Game Log
              </h4>
              {gameLog.map((log, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#94a3b8', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {log}
                </div>
              ))}
            </div>

            {/* New Game */}
            <button
              onClick={() => { setNumPlayers(0); setPhase('roll'); }}
              style={{
                padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: 'rgba(239,68,68,0.08)',
                color: '#ef4444', width: '100%'
              }}
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
