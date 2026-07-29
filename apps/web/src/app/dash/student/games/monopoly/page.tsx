'use client';

import { useState, useCallback, useEffect } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Dice1, RotateCcw, Layers } from 'lucide-react';

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
  colorBg?: string;
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

// Standard 40 spaces for the real Monopoly board layout
function createBoard(): BoardSpace[] {
  const props: Omit<Property, 'owner'>[] = [
    { name: 'Algebra Lane', subject: 'Math', price: 60, rent: 6, color: '#8b5cf6' },
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
    { name: 'Calculus Castle', subject: 'Math', price: 280, rent: 28, color: '#22c55e' },
    { name: 'Robotics Road', subject: 'Engineering', price: 300, rent: 30, color: '#22c55e' },
    { name: 'Philosophy Plaza', subject: 'Philosophy', price: 320, rent: 32, color: '#facc15' },
    { name: 'Astronomy Ave', subject: 'Astronomy', price: 350, rent: 35, color: '#facc15' },
    { name: 'Medicine Mile', subject: 'Medicine', price: 400, rent: 40, color: '#06b6d4' },
    { name: 'Law Library', subject: 'Law', price: 400, rent: 40, color: '#06b6d4' },
    { name: 'Coding Corner', subject: 'Coding', price: 450, rent: 45, color: '#22c55e' },
    { name: 'Lab Lane', subject: 'Lab', price: 450, rent: 45, color: '#38bdf8' }
  ];

  const spaces: BoardSpace[] = Array.from({ length: 40 }, (_, idx) => {
    if (idx === 0) return { name: 'START', type: 'start' };
    if (idx === 10) return { name: 'Jail / Visit', type: 'jail' };
    if (idx === 20) return { name: 'Free Parking', type: 'free-parking' };
    if (idx === 30) return { name: 'Go To Jail', type: 'go-to-jail' };
    
    // Taxes
    if (idx === 4 || idx === 38) return { name: 'Income Tax', type: 'tax' };
    
    // Quiz & Chance
    if (idx === 2 || idx === 7 || idx === 17 || idx === 22 || idx === 33 || idx === 36) {
      return idx % 2 === 0 ? { name: 'Quiz Time!', type: 'quiz' } : { name: 'Chance', type: 'chance' };
    }
    
    // Default properties distribution
    const pIdx = idx % props.length;
    const p = props[pIdx];
    return {
      name: p.name,
      type: 'property',
      property: { ...p, owner: null }
    };
  });

  return spaces;
}

// Map 40 linear board positions to grid items in 11x11 layout
function getGridCoords(pos: number): { r: number; c: number } {
  if (pos >= 0 && pos <= 10) return { r: 10, c: 10 - pos }; // Bottom side (GO to Jail)
  if (pos > 10 && pos <= 20) return { r: 10 - (pos - 10), c: 0 }; // Left side (Jail to Free Parking)
  if (pos > 20 && pos <= 30) return { r: 0, c: pos - 20 }; // Top side (Free Parking to Go to Jail)
  return { r: pos - 30, c: 10 }; // Right side (Go to Jail to luxury tax/ Boardwalk)
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
  const [view3D, setView3D] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
    if (isRolling || isAnimating) return;
    setIsRolling(true);

    // Roll animation values
    let count = 0;
    const interval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      count++;
      if (count > 10) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 80);

    const finalizeRoll = () => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2]);
      setIsRolling(false);

      const total = d1 + d2;
      const player = players[currentPlayer];

      if (player.inJail) {
        if (d1 === d2) {
          const updated = [...players];
          updated[currentPlayer] = { ...player, inJail: false, jailTurns: 0 };
          setPlayers(updated);
          addLog(`${player.emoji} ${player.name} rolled doubles and escaped jail!`);
          animatePlayerMove(player.position, total, updated);
        } else if (player.jailTurns >= 2) {
          const updated = [...players];
          updated[currentPlayer] = { ...player, inJail: false, jailTurns: 0, balance: player.balance - 50 };
          setPlayers(updated);
          addLog(`${player.emoji} ${player.name} paid $50 to escape jail.`);
          animatePlayerMove(player.position, total, updated);
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

      animatePlayerMove(player.position, total, [...players]);
    };
  }, [players, currentPlayer, isRolling, isAnimating, addLog]);

  // Step-by-step player token hopping animation (helps students count the spaces)
  const animatePlayerMove = (startPos: number, steps: number, currentPlayers: PlayerState[]) => {
    setIsAnimating(true);
    let stepCount = 0;
    let currPos = startPos;

    const interval = setInterval(() => {
      stepCount++;
      currPos = (currPos + 1) % 40;

      setPlayers(prev => {
        const next = [...prev];
        next[currentPlayer] = { ...next[currentPlayer], position: currPos };
        return next;
      });

      // GO reward passing check
      if (currPos === 0) {
        setPlayers(prev => {
          const next = [...prev];
          next[currentPlayer] = { ...next[currentPlayer], balance: next[currentPlayer].balance + 200 };
          return next;
        });
        addLog(`${currentPlayers[currentPlayer].emoji} Passed START! Earned $200.`);
      }

      if (stepCount === steps) {
        clearInterval(interval);
        setIsAnimating(false);
        handleSpaceLanding(currPos);
      }
    }, 280); // hopping interval (280ms)
  };

  const handleSpaceLanding = useCallback((targetPos: number) => {
    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    const space = board[targetPos];

    if (space.type === 'go-to-jail') {
      updatedPlayers[currentPlayer] = { ...player, position: 10, inJail: true, jailTurns: 0 };
      setPlayers(updatedPlayers);
      addLog(`${player.emoji} ${player.name} sent to Jail!`);
      setActionMessage('👮 Go to Jail!');
      setPhase('action');
    } else if (space.type === 'tax') {
      updatedPlayers[currentPlayer] = { ...player, balance: player.balance - 150 };
      setPlayers(updatedPlayers);
      addLog(`${player.emoji} ${player.name} paid $150 tax.`);
      setActionMessage('💰 Paid $150 tax.');
      setPhase('action');
    } else if (space.type === 'quiz') {
      const q = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
      setCurrentQuiz(q);
      setPhase('quiz');
    } else if (space.type === 'chance') {
      const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
      setCurrentChance(card);
      updatedPlayers[currentPlayer] = { ...player, balance: player.balance + card.effect };
      setPlayers(updatedPlayers);
      addLog(`${player.emoji} ${player.name}: ${card.text}`);
      setPhase('chance');
    } else if (space.type === 'property' && space.property) {
      if (space.property.owner === null) {
        setActionMessage(`Buy ${space.name} (${space.property.subject}) for $${space.property.price}?`);
        setPhase('action');
      } else if (space.property.owner !== currentPlayer) {
        const rent = space.property.rent;
        updatedPlayers[currentPlayer] = { ...player, balance: player.balance - rent };
        updatedPlayers[space.property.owner] = {
          ...updatedPlayers[space.property.owner],
          balance: updatedPlayers[space.property.owner].balance + rent
        };
        setPlayers(updatedPlayers);
        addLog(`${player.emoji} ${player.name} paid $${rent} rent to ${updatedPlayers[space.property.owner].name}.`);
        setActionMessage(`Paid $${rent} rent for ${space.name}.`);
        setPhase('action');
      } else {
        setActionMessage(`You own ${space.name}.`);
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
  }, [board, players, currentPlayer, addLog]);

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
      updated[currentPlayer] = { ...player, balance: player.balance + 60 };
      addLog(`${player.emoji} ${player.name} answered correctly! Earned $60.`);
      setActionMessage('Correct! +$60');
    } else {
      updated[currentPlayer] = { ...player, balance: player.balance - 30 };
      addLog(`${player.emoji} ${player.name} answered incorrectly. Lost $30.`);
      setActionMessage('Incorrect! -$30');
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

  if (numPlayers === 0) {
    return (
      <GameLayout title="Monopoly: Edvoura Edition" icon={<Dice1 size={24} />} accentColor="#f59e0b">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '32px',
          color: '#0f172a'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#000000', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              🎲 Monopoly 3D
            </h2>
            <p style={{ color: '#475569', fontSize: '15px', maxWidth: '500px', fontWeight: 600 }}>
              Rebuilt with a full 3D interactive board view! Choose players and roll cubes dynamically.
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
                  border: '3px solid #000000',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 900,
                  background: '#fbbf24',
                  color: '#000000',
                  boxShadow: '4px 4px 0px #000000',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px #000000'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px #000000'; }}
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

  // Board spacing helper
  const renderBoardSpace = (idx: number) => {
    const space = board[idx];
    if (!space) return null;
    const { r, c } = getGridCoords(idx);

    const playersHere = players.filter(p => p.position === idx);
    const bgColor = space.type === 'property' && space.property
      ? space.property.color + '22'
      : space.type === 'start' ? '#dcfce7'
      : space.type === 'jail' ? '#fee2e2'
      : space.type === 'go-to-jail' ? '#fca5a5'
      : space.type === 'quiz' ? '#faf5ff'
      : space.type === 'chance' ? '#ecfeff'
      : space.type === 'tax' ? '#fee2e2'
      : '#f8fafc';

    const borderTopColor = space.type === 'property' && space.property ? space.property.color : '#000000';

    return (
      <div
        key={idx}
        style={{
          gridRow: r + 1,
          gridColumn: c + 1,
          background: bgColor,
          border: '1.5px solid #000000',
          borderTop: `4px solid ${borderTopColor}`,
          borderRadius: '4px',
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '44px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ fontSize: '7px', fontWeight: 800, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1 }}>
          {space.name}
        </div>
        {space.type === 'property' && space.property && (
          <div style={{ fontSize: '7px', color: '#475569', fontWeight: 700 }}>
            ${space.property.price}
            {space.property.owner !== null && (
              <span style={{ color: players[space.property.owner]?.color, marginLeft: '3px' }}>
                {players[space.property.owner]?.emoji}
              </span>
            )}
          </div>
        )}

        {/* Players representation - Animated Pawns */}
        {playersHere.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '3px',
            flexWrap: 'wrap',
            position: 'absolute',
            bottom: '2px',
            left: '2px',
            right: '2px',
            justifyContent: 'center',
            zIndex: 5
          }}>
            {playersHere.map(p => (
              <span
                key={p.name}
                style={{
                  fontSize: '14px',
                  // Hopping animation on current active player when moving
                  animation: (isAnimating && players[currentPlayer].name === p.name) ? 'pawnHop 0.28s infinite alternate' : 'none'
                }}
              >
                {p.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <GameLayout title="Monopoly 3D" icon={<Dice1 size={24} />} accentColor="#f59e0b">
      {phase === 'gameover' && winner ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '24px',
          textAlign: 'center',
          color: '#0f172a'
        }}>
          <div style={{ fontSize: '64px' }}>🏆</div>
          <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#fbbf24' }}>{winner} Wins!</h2>
          <button
            onClick={() => { setNumPlayers(0); setPhase('roll'); }}
            style={{
              padding: '16px 32px', borderRadius: '14px', border: '2px solid #000000', cursor: 'pointer',
              fontSize: '16px', fontWeight: 900, background: '#fbbf24',
              color: 'white', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '3px 3px 0px #000000'
            }}
          >
            <RotateCcw size={18} /> Play Again
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', color: '#0f172a' }}>
          
          {/* Board Container */}
          <div style={{
            background: '#ffffff',
            border: '4px solid #000000',
            borderRadius: '24px',
            padding: '16px',
            boxShadow: '8px 8px 0px #000000',
            position: 'relative',
            width: 'min(100vw - 2rem, 580px)',
            perspective: '1200px'
          }}>
            {/* 3D View Toggle */}
            <button
              onClick={() => setView3D(!view3D)}
              style={{
                position: 'absolute',
                top: '-20px',
                right: '20px',
                padding: '6px 14px',
                background: '#fbbf24',
                border: '2px solid #000000',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '11px',
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

            {/* 11x11 Monopoly Board Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(11, 1fr)',
              gridTemplateRows: 'repeat(11, 1fr)',
              width: '100%',
              aspectRatio: '1',
              border: '2px solid #000000',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#f1f5f9',
              transformStyle: 'preserve-3d',
              transform: view3D ? 'rotateX(30deg) rotateZ(-12deg) scale(0.92)' : 'none',
              transition: 'transform 0.4s ease-out',
              boxShadow: view3D ? '0 20px 30px rgba(0,0,0,0.2)' : 'none'
            }}>
              {/* Render 40 border spaces */}
              {Array.from({ length: 40 }).map((_, i) => renderBoardSpace(i))}

              {/* Central Control Space (Rows 2 to 10, Cols 2 to 10) */}
              <div style={{
                gridRow: '2 / 11',
                gridColumn: '2 / 11',
                background: 'rgba(255,255,255,0.7)',
                margin: '3px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                gap: '10px',
                border: '1.5px dashed #000000',
                zIndex: 2,
                transform: view3D ? 'translateZ(10px)' : 'none',
                transition: 'transform 0.4s ease-out'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#000000', letterSpacing: '0.05em' }}>
                  🎓 EDVOURA
                </div>

                {/* Animated Dice */}
                <div style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
                  {dice.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: d ? '#fbbf24' : '#e2e8f0',
                        border: '2px solid #000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 900,
                        color: '#000000',
                        // Rotate animation when rolling
                        animation: isRolling ? 'diceSpin 0.3s infinite linear' : 'none',
                        boxShadow: d ? '2px 2px 0px #000000' : 'none'
                      }}
                    >
                      {d || '?'}
                    </div>
                  ))}
                </div>

                {/* Current Player Banner */}
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: `2px solid #000000`,
                  textAlign: 'center',
                  boxShadow: '2px 2px 0px #000000'
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>Current Turn</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: players[currentPlayer]?.color }}>
                    {players[currentPlayer]?.emoji} {players[currentPlayer]?.name}
                  </div>
                </div>

                {/* Main Action Controllers */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {phase === 'roll' && (
                    <button
                      onClick={rollDice}
                      disabled={isRolling || isAnimating}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: '2px solid #000000', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 900, background: '#fbbf24',
                        color: '#000000', boxShadow: '2px 2px 0px #000000'
                      }}
                    >
                      {isRolling ? 'Rolling...' : '🎲 Roll'}
                    </button>
                  )}
                  {phase === 'action' && !isAnimating && (
                    <>
                      {canBuy && (
                        <button
                          onClick={buyProperty}
                          style={{
                            padding: '8px 16px', borderRadius: '8px', border: '2px solid #000000', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 900, background: '#22c55e',
                            color: '#ffffff', boxShadow: '2px 2px 0px #000000'
                          }}
                        >
                          Buy (${currentSpace.property?.price})
                        </button>
                      )}
                      <button
                        onClick={endTurn}
                        style={{
                          padding: '8px 16px', borderRadius: '8px', border: '2px solid #000000',
                          cursor: 'pointer', fontSize: '12px', fontWeight: 900,
                          background: '#ffffff', color: '#000000', boxShadow: '2px 2px 0px #000000'
                        }}
                      >
                        End Turn
                      </button>
                    </>
                  )}
                  {phase === 'chance' && (
                    <button
                      onClick={endTurn}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: '2px solid #000000', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 900, background: '#38bdf8',
                        color: '#ffffff', boxShadow: '2px 2px 0px #000000'
                      }}
                    >
                      Continue
                    </button>
                  )}
                </div>

                {/* Quiz Pop-up Inside Board */}
                {phase === 'quiz' && currentQuiz && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#faf5ff',
                    border: '2px solid #000000',
                    maxWidth: '240px',
                    boxShadow: '3px 3px 0px #000000',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#8b5cf6', marginBottom: '6px' }}>
                      📝 Quiz Time!
                    </div>
                    <div style={{ fontSize: '12px', color: '#000000', fontWeight: 700, marginBottom: '8px' }}>
                      {currentQuiz.q}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {currentQuiz.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => answerQuiz(i)}
                          style={{
                            padding: '6px 10px', borderRadius: '6px',
                            border: '1.5px solid #000000', cursor: 'pointer',
                            fontSize: '11px', fontWeight: 700, background: '#ffffff',
                            color: '#000000', textAlign: 'left'
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chance Pop-up Inside Board */}
                {phase === 'chance' && currentChance && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#ecfeff',
                    border: '2px solid #000000',
                    maxWidth: '200px',
                    textAlign: 'center',
                    boxShadow: '3px 3px 0px #000000'
                  }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎴</div>
                    <div style={{ fontSize: '11px', color: '#000000', fontWeight: 700 }}>
                      {currentChance.text}
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {actionMessage && phase === 'action' && !isAnimating && (
                  <div style={{
                    padding: '6px 12px', borderRadius: '8px', background: '#f8fafc',
                    border: '1.5px solid #000000', fontSize: '11px', color: '#000000', textAlign: 'center', maxWidth: '240px', fontWeight: 700
                  }}>
                    {actionMessage}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Dash Panel */}
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Player Info boxes */}
            {players.map((p, i) => (
              <div key={i} style={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: i === currentPlayer ? `${p.color}15` : '#ffffff',
                border: '3px solid #000000',
                boxShadow: i === currentPlayer ? '4px 4px 0px #000000' : '2px 2px 0px #000000',
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{p.emoji}</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#000000' }}>{p.name}</span>
                  </div>
                  {p.inJail && <span style={{ fontSize: '9px', background: '#fca5a5', border: '1.5px solid #000000', color: '#000000', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>JAIL</span>}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
                  ${p.balance.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', fontWeight: 700 }}>
                  Properties: {board.filter(s => s.property?.owner === i).length}
                </div>
              </div>
            ))}

            {/* Game Logs */}
            <div style={{
              padding: '16px', borderRadius: '16px', background: '#ffffff',
              border: '3px solid #000000', boxShadow: '2px 2px 0px #000000', flex: 1, maxHeight: '200px', overflowY: 'auto'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Game Log
              </h4>
              {gameLog.map((log, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#475569', padding: '4px 0', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations for dice spin & character hopping */}
      <style jsx global>{`
        @keyframes diceSpin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes pawnHop {
          0% { transform: translateY(0); }
          100% { transform: translateY(-16px); }
        }
      `}</style>
    </GameLayout>
  );
}
