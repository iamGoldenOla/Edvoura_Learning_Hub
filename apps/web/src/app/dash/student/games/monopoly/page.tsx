'use client';

import { useState, useCallback, useEffect } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Dice1, RotateCcw, Layers, User, Users, Monitor } from 'lucide-react';

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
  isBot: boolean;
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
    
    if (idx === 4 || idx === 38) return { name: 'Income Tax', type: 'tax' };
    
    if (idx === 2 || idx === 7 || idx === 17 || idx === 22 || idx === 33 || idx === 36) {
      return idx % 2 === 0 ? { name: 'Quiz Time!', type: 'quiz' } : { name: 'Chance', type: 'chance' };
    }
    
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

function getGridCoords(pos: number): { r: number; c: number } {
  if (pos >= 0 && pos <= 10) return { r: 10, c: 10 - pos };
  if (pos > 10 && pos <= 20) return { r: 10 - (pos - 10), c: 0 };
  if (pos > 20 && pos <= 30) return { r: 0, c: pos - 20 };
  return { r: pos - 30, c: 10 };
}

const PLAYER_CONFIGS = [
  { name: 'Player 1', color: '#3b82f6', emoji: '🎓' },
  { name: 'Player 2', color: '#ef4444', emoji: '📚' },
  { name: 'Player 3', color: '#22c55e', emoji: '🔬' },
  { name: 'Player 4', color: '#f59e0b', emoji: '🎨' },
];

const BOT_NAMES = ['Aisha Bello (Grade 4)', 'Chinedu Okafor (Grade 5)', 'Oluwaseun Adebayo (Grade 4)'];

export default function MonopolyPage() {
  const [gameMode, setGameMode] = useState<'lobby' | 'matching' | 'playing'>('lobby');
  const [lobbyMode, setLobbyMode] = useState<'local' | 'ai' | 'matchmaker'>('ai');
  const [numPlayers, setNumPlayers] = useState(2);
  
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

  const startGame = (type: 'local' | 'ai' | 'matchmaker', n: number) => {
    setNumPlayers(n);
    setLobbyMode(type);
    
    if (type === 'matchmaker') {
      setGameMode('matching');
    } else {
      setupGameMode(type, n);
    }
  };

  const setupGameMode = (type: 'local' | 'ai' | 'matchmaker', n: number, matchedPlayerName?: string) => {
    const list: PlayerState[] = [];
    
    // Human Player 1
    list.push({
      ...PLAYER_CONFIGS[0],
      balance: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      isBot: false
    });

    if (type === 'ai') {
      // Add Bot opponents
      for (let i = 1; i < n; i++) {
        list.push({
          name: BOT_NAMES[i - 1] || `AI Bot ${i}`,
          color: PLAYER_CONFIGS[i].color,
          emoji: PLAYER_CONFIGS[i].emoji,
          balance: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          isBot: true
        });
      }
    } else if (type === 'matchmaker') {
      // Add matched grade classmate and remaining bots if needed
      list.push({
        name: matchedPlayerName || 'Classmate (Grade 4)',
        color: PLAYER_CONFIGS[1].color,
        emoji: PLAYER_CONFIGS[1].emoji,
        balance: 1500,
        position: 0,
        inJail: false,
        jailTurns: 0,
        isBot: true // Classmate matches are bot-driven for offline support
      });
      for (let i = 2; i < n; i++) {
        list.push({
          name: `AI Bot ${i}`,
          color: PLAYER_CONFIGS[i].color,
          emoji: PLAYER_CONFIGS[i].emoji,
          balance: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          isBot: true
        });
      }
    } else {
      // Local multiplayer
      for (let i = 1; i < n; i++) {
        list.push({
          ...PLAYER_CONFIGS[i],
          balance: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          isBot: false
        });
      }
    }

    setPlayers(list);
    setBoard(createBoard());
    setCurrentPlayer(0);
    setPhase('roll');
    setDice([0, 0]);
    setActionMessage('');
    setGameLog([`Game started with ${n} players! Mode: ${type.toUpperCase()}`]);
    setWinner(null);
    setGameMode('playing');
  };

  // Simulated matchmaking timer
  useEffect(() => {
    if (gameMode === 'matching') {
      const timer = setTimeout(() => {
        const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] + ' (Grade 4)';
        setupGameMode('matchmaker', numPlayers, name);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [gameMode]);

  const rollDice = useCallback(() => {
    if (isRolling || isAnimating) return;
    setIsRolling(true);

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
          setActionMessage(`In jail! Roll doubles to escape.`);
        }
        return;
      }

      animatePlayerMove(player.position, total, [...players]);
    };
  }, [players, currentPlayer, isRolling, isAnimating, addLog]);

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
    }, 280);
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

  const quitToLobby = () => {
    setGameMode('lobby');
  };

  // Bot Turn Automation handling
  useEffect(() => {
    const active = players[currentPlayer];
    if (gameMode === 'playing' && active?.isBot && !isRolling && !isAnimating) {
      if (phase === 'roll') {
        const timer = setTimeout(() => rollDice(), 1000);
        return () => clearTimeout(timer);
      } else if (phase === 'action') {
        const timer = setTimeout(() => {
          const space = board[active.position];
          if (space.type === 'property' && space.property && space.property.owner === null) {
            // Bot decides to buy if they have spare cash
            if (active.balance >= space.property.price + 150) {
              buyProperty();
            }
          }
          endTurn();
        }, 1200);
        return () => clearTimeout(timer);
      } else if (phase === 'quiz' && currentQuiz) {
        const timer = setTimeout(() => {
          // Bot answers with 70% accuracy
          const correctChance = Math.random() < 0.7;
          const ans = correctChance ? currentQuiz.answer : (currentQuiz.answer + 1) % 4;
          answerQuiz(ans);
        }, 1500);
        return () => clearTimeout(timer);
      } else if (phase === 'chance') {
        const timer = setTimeout(() => endTurn(), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [currentPlayer, phase, gameMode, isRolling, isAnimating, board, currentQuiz]);

  if (gameMode === 'lobby') {
    return (
      <GameLayout title="Monopoly Lobby" icon={<Dice1 size={24} />} accentColor="#f59e0b">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '62vh', gap: '32px', color: '#0f172a', textAlign: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#000000', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
              🎲 Monopoly Play Zone
            </h2>
            <p style={{ color: '#475569', fontSize: '15px', maxWidth: '500px', fontWeight: 600, margin: '0 auto' }}>
              Buy properties, answer academic quizzes, and outsmart your opponents. Choose to play against AI bots or other grade cohorts!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800 }}>Number of Players:</span>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setNumPlayers(n)}
                style={{
                  padding: '10px 20px', borderRadius: '10px', border: '2px solid #000000',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 900,
                  background: numPlayers === n ? '#fbbf24' : '#ffffff',
                  boxShadow: '2px 2px 0px #000000'
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { type: 'ai', title: 'Play vs computer', desc: 'vs AI bots', icon: Monitor },
              { type: 'local', title: 'Pass & Play', desc: 'Local hot-seat mode', icon: Users },
              { type: 'matchmaker', title: 'Grade Matchmaking', desc: 'Find other grades', icon: User }
            ].map(m => (
              <button
                key={m.type}
                onClick={() => startGame(m.type as any, numPlayers)}
                style={{
                  padding: '24px', borderRadius: '20px', border: '3px solid #000000',
                  cursor: 'pointer', fontSize: '16px', fontWeight: 900, background: '#ffffff',
                  color: '#000000', boxShadow: '4px 4px 0px #000000', transition: 'all 0.15s ease',
                  width: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-4px, -4px)'; e.currentTarget.style.boxShadow = '8px 8px 0px #000000'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px #000000'; }}
              >
                <m.icon size={36} style={{ color: '#f59e0b' }} />
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
      <GameLayout title="Matchmaking" icon={<Dice1 size={24} />} accentColor="#f59e0b">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '62vh', gap: '32px', color: '#0f172a', textAlign: 'center'
        }}>
          <div className="radar-container" style={{
            position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="pulse" style={{
              position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
              border: '3px solid #f59e0b', animation: 'ping 1.5s infinite ease-out'
            }} />
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #000000',
              background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '3px 3px 0px #000000', zIndex: 2
            }}>
              <Users size={32} color="#f59e0b" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px 0' }}>Searching for matches...</h3>
            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 700 }}>Finding students in Grade 3, 4 or 5 to link on the board...</p>
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

  const currentSpace = board[players[currentPlayer]?.position ?? 0];
  const canBuy = currentSpace?.type === 'property' && currentSpace.property?.owner === null && phase === 'action';

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
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', gap: '24px', textAlign: 'center', color: '#0f172a'
        }}>
          <div style={{ fontSize: '64px' }}>🏆</div>
          <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#fbbf24' }}>{winner} Wins!</h2>
          <button
            onClick={() => setGameMode('lobby')}
            style={{
              padding: '16px 32px', borderRadius: '14px', border: '2px solid #000000', cursor: 'pointer',
              fontSize: '16px', fontWeight: 900, background: '#fbbf24',
              color: '#000000', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '3px 3px 0px #000000'
            }}
          >
            <RotateCcw size={18} /> Exit to Lobby
          </button>
        </div>
      ) : (
        // Stacked Viewport Layout to allow the board to expand to full size
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%', color: '#0f172a' }}>
          
          {/* Header Card (White Title text instead of black!) */}
          <div style={{
            width: '100%', maxWidth: '850px', background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '3px solid #000000', borderRadius: '20px', padding: '16px 24px',
            boxShadow: '4px 4px 0px #000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', margin: 0 }}>
              🎲 Monopoly: Edvoura Edition
            </h2>
            <button
              onClick={quitToLobby}
              style={{
                padding: '8px 16px', background: '#fee2e2', color: '#ef4444', border: '2px solid #000000',
                borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '2px 2px 0px #000000'
              }}
            >
              Quit Game
            </button>
          </div>

          {/* Large Monopoly Board Viewport */}
          <div style={{
            background: '#ffffff',
            border: '4px solid #000000',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '8px 8px 0px #000000',
            position: 'relative',
            width: '100%',
            maxWidth: '850px', // Enlarged Board Viewport Width
            perspective: '1200px',
            boxSizing: 'border-box'
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

            {/* Grid */}
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
              {Array.from({ length: 40 }).map((_, i) => renderBoardSpace(i))}

              {/* Central Controller Box */}
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
                        animation: isRolling ? 'diceSpin 0.3s infinite linear' : 'none',
                        boxShadow: d ? '2px 2px 0px #000000' : 'none'
                      }}
                    >
                      {d || '?'}
                    </div>
                  ))}
                </div>

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

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {phase === 'roll' && !players[currentPlayer]?.isBot && (
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
                  {phase === 'action' && !isAnimating && !players[currentPlayer]?.isBot && (
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
                  {phase === 'chance' && !players[currentPlayer]?.isBot && (
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
                  {players[currentPlayer]?.isBot && (
                    <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#f59e0b', animation: 'pulse 1s infinite alternate' }}>
                      🤖 AI is thinking...
                    </div>
                  )}
                </div>

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
                          onClick={() => !players[currentPlayer]?.isBot && answerQuiz(i)}
                          style={{
                            padding: '6px 10px', borderRadius: '6px',
                            border: '1.5px solid #000000', cursor: players[currentPlayer]?.isBot ? 'default' : 'pointer',
                            fontSize: '11px', fontWeight: 700, background: '#ffffff',
                            color: '#000000', textAlign: 'left'
                          }}
                          disabled={players[currentPlayer]?.isBot}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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

          {/* Bottom Panel containing Player Cards & Log side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', width: '100%', maxWidth: '850px' }}>
            
            {/* Status grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {players.map((p, i) => (
                <div key={i} style={{
                  padding: '12px',
                  borderRadius: '16px',
                  background: i === currentPlayer ? `${p.color}15` : '#ffffff',
                  border: '3px solid #000000',
                  boxShadow: i === currentPlayer ? '4px 4px 0px #000000' : '2px 2px 0px #000000',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>{p.emoji}</span>
                      <span style={{ fontSize: '12px', fontWeight: 900, color: '#000000' }}>{p.name}</span>
                    </div>
                    {p.isBot && <span style={{ fontSize: '8px', background: '#e2e8f0', border: '1px solid #000', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>BOT</span>}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
                    ${p.balance.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px', fontWeight: 700 }}>
                    Properties: {board.filter(s => s.property?.owner === i).length}
                  </div>
                  {p.inJail && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '9px', background: '#fca5a5', border: '1px solid #000', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>
                      JAIL
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Game Logs */}
            <div style={{
              padding: '16px', borderRadius: '16px', background: '#ffffff',
              border: '3px solid #000000', boxShadow: '4px 4px 0px #000000', maxHeight: '160px', overflowY: 'auto'
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
        @keyframes pulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </GameLayout>
  );
}
