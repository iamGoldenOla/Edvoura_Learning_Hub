'use client';

import { useState, useCallback, useEffect } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Dice1, RotateCcw, Layers, User, Users, Monitor, Landmark, ArrowRightLeft, Gavel } from 'lucide-react';

/* ═══════════════════════ WEB AUDIO API SFX SYNTHESIZER ═══════════════════════ */
function playMonopolySFX(type: 'dice' | 'cash' | 'move' | 'jail') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'dice') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'cash') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'move') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'jail') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
}

/* ═══════════════════════ TYPES ═══════════════════════ */
export type SpaceType = 'property' | 'railroad' | 'utility' | 'start' | 'tax' | 'chance' | 'quiz' | 'jail' | 'go-to-jail' | 'free-parking';

export interface Property {
  id: string;
  name: string;
  subject: string;
  price: number;
  rent: number;
  color: string;
  colorGroup: string;
  owner: number | null;
  houses: number; // 0 to 4 (4 = Hotel/Campus)
  housePrice: number;
  isMortgaged: boolean;
}

export interface SpecialProperty {
  id: string;
  name: string;
  type: 'railroad' | 'utility';
  price: number;
  owner: number | null;
  isMortgaged: boolean;
}

export interface PlayerState {
  name: string;
  balance: number;
  position: number;
  color: string;
  token: 'car' | 'hat' | 'ship' | 'thimble';
  inJail: boolean;
  jailTurns: number;
  isBot: boolean;
  bankLoan: number;
}

export interface BoardSpace {
  name: string;
  type: SpaceType;
  property?: Property;
  special?: SpecialProperty;
}

/* ═══════════════════════ REAL MONOPOLY SVG TOKENS ═══════════════════════ */
const CarToken = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
    <path d="M3 13C3 11.9 3.9 11 5 11H6.5L8.2 6.9C8.5 6.3 9.1 6 9.8 6H14.2C14.9 6 15.5 6.3 15.8 6.9L17.5 11H19C20.1 11 21 11.9 21 13V15.5C21 16.3 20.3 17 19.5 17H19C19 18.1 18.1 19 17 19C15.9 19 15 18.1 15 17H9C9 18.1 8.1 19 7 19C5.9 19 5 18.1 5 17H4.5C3.7 17 3 16.3 3 15.5V13Z" fill={color} stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="7" cy="17" r="1.5" fill="#ffffff" stroke="#000000" strokeWidth="1"/>
    <circle cx="17" cy="17" r="1.5" fill="#ffffff" stroke="#000000" strokeWidth="1"/>
    <path d="M8.5 11H15.5L14.2 7.5H9.8L8.5 11Z" fill="#ffffff" opacity="0.4"/>
  </svg>
);

const HatToken = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
    <path d="M2 18C2 17.45 2.45 17 3 17H21C21.55 17 22 17.45 22 18C22 18.55 21.55 19 21 19H3C2.45 19 2 18.55 2 18Z" fill="#0f172a" stroke="#000000" strokeWidth="1.5"/>
    <path d="M6 17V8C6 6.9 6.9 6 8 6H16C17.1 6 18 6.9 18 8V17H6Z" fill={color} stroke="#000000" strokeWidth="1.5"/>
    <rect x="6" y="14" width="12" height="3" fill="#fbbf24" stroke="#000000" strokeWidth="1"/>
  </svg>
);

const ShipToken = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
    <path d="M2 15L4 18.5H20L22 15H2Z" fill={color} stroke="#000000" strokeWidth="1.5"/>
    <path d="M7 15V10H17V15" fill={color} stroke="#000000" strokeWidth="1.5"/>
    <rect x="10" y="6" width="4" height="4" fill="#ffffff" stroke="#000000" strokeWidth="1"/>
    <line x1="12" y1="2" x2="12" y2="6" stroke="#000000" strokeWidth="1.5"/>
  </svg>
);

const ThimbleToken = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
    <path d="M7 18H17L18.5 8.5C18.5 6 15.5 4 12 4C8.5 4 5.5 6 5.5 8.5L7 18Z" fill={color} stroke="#000000" strokeWidth="1.5"/>
    <ellipse cx="12" cy="18" rx="5" ry="1.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5"/>
    <circle cx="10" cy="9" r="0.8" fill="#ffffff"/>
    <circle cx="14" cy="9" r="0.8" fill="#ffffff"/>
    <circle cx="12" cy="12" r="0.8" fill="#ffffff"/>
    <circle cx="10" cy="15" r="0.8" fill="#ffffff"/>
    <circle cx="14" cy="15" r="0.8" fill="#ffffff"/>
  </svg>
);

function RenderToken({ token, color, size = 16 }: { token: 'car' | 'hat' | 'ship' | 'thimble'; color: string; size?: number }) {
  if (token === 'car') return <CarToken color={color} size={size} />;
  if (token === 'hat') return <HatToken color={color} size={size} />;
  if (token === 'ship') return <ShipToken color={color} size={size} />;
  return <ThimbleToken color={color} size={size} />;
}

/* ═══════════════════════ QUIZ & CHANCE DATA ═══════════════════════ */
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

/* ═══════════════════════ BOARD BUILDER ═══════════════════════ */
function createBoard(): BoardSpace[] {
  const academicProps: Omit<Property, 'owner' | 'houses' | 'isMortgaged'>[] = [
    { id: 'p1', name: 'Algebra Lane', subject: 'Math', price: 60, rent: 8, color: '#8b5cf6', colorGroup: 'purple', housePrice: 50 },
    { id: 'p2', name: 'Grammar Gardens', subject: 'English', price: 60, rent: 8, color: '#8b5cf6', colorGroup: 'purple', housePrice: 50 },
    
    { id: 'p3', name: 'History Heights', subject: 'History', price: 100, rent: 12, color: '#38bdf8', colorGroup: 'light-blue', housePrice: 50 },
    { id: 'p4', name: 'Geography Grove', subject: 'Geography', price: 100, rent: 12, color: '#38bdf8', colorGroup: 'light-blue', housePrice: 50 },
    { id: 'p5', name: 'Biology Blvd', subject: 'Biology', price: 120, rent: 14, color: '#38bdf8', colorGroup: 'light-blue', housePrice: 50 },
    
    { id: 'p6', name: 'Chemistry Close', subject: 'Chemistry', price: 140, rent: 16, color: '#f472b6', colorGroup: 'pink', housePrice: 100 },
    { id: 'p7', name: 'Physics Park', subject: 'Physics', price: 140, rent: 16, color: '#f472b6', colorGroup: 'pink', housePrice: 100 },
    { id: 'p8', name: 'Art Avenue', subject: 'Art', price: 160, rent: 18, color: '#f472b6', colorGroup: 'pink', housePrice: 100 },
    
    { id: 'p9', name: 'Music Manor', subject: 'Music', price: 180, rent: 20, color: '#fb923c', colorGroup: 'orange', housePrice: 100 },
    { id: 'p10', name: 'Literature Lane', subject: 'Literature', price: 180, rent: 20, color: '#fb923c', colorGroup: 'orange', housePrice: 100 },
    { id: 'p11', name: 'Economics Estate', subject: 'Economics', price: 200, rent: 22, color: '#fb923c', colorGroup: 'orange', housePrice: 100 },
    
    { id: 'p12', name: 'Computer Court', subject: 'Computing', price: 220, rent: 24, color: '#ef4444', colorGroup: 'red', housePrice: 150 },
    { id: 'p13', name: 'Sports Stadium', subject: 'P.E.', price: 220, rent: 24, color: '#ef4444', colorGroup: 'red', housePrice: 150 },
    { id: 'p14', name: 'Drama Drive', subject: 'Drama', price: 240, rent: 26, color: '#ef4444', colorGroup: 'red', housePrice: 150 },
    
    { id: 'p15', name: 'Calculus Castle', subject: 'Math', price: 280, rent: 30, color: '#22c55e', colorGroup: 'green', housePrice: 150 },
    { id: 'p16', name: 'Robotics Road', subject: 'Engineering', price: 300, rent: 32, color: '#22c55e', colorGroup: 'green', housePrice: 150 },
    { id: 'p17', name: 'Coding Corner', subject: 'Coding', price: 320, rent: 34, color: '#22c55e', colorGroup: 'green', housePrice: 150 },
    
    { id: 'p18', name: 'Philosophy Plaza', subject: 'Philosophy', price: 350, rent: 40, color: '#facc15', colorGroup: 'yellow', housePrice: 200 },
    { id: 'p19', name: 'Astronomy Ave', subject: 'Astronomy', price: 350, rent: 40, color: '#facc15', colorGroup: 'yellow', housePrice: 200 },
    { id: 'p20', name: 'Medicine Mile', subject: 'Medicine', price: 400, rent: 50, color: '#06b6d4', colorGroup: 'dark-blue', housePrice: 200 },
    { id: 'p21', name: 'Law Library', subject: 'Law', price: 400, rent: 50, color: '#06b6d4', colorGroup: 'dark-blue', housePrice: 200 },
    { id: 'p22', name: 'Lab Lane', subject: 'Lab', price: 450, rent: 60, color: '#06b6d4', colorGroup: 'dark-blue', housePrice: 200 }
  ];

  let pIdx = 0;

  const spaces: BoardSpace[] = Array.from({ length: 40 }, (_, idx) => {
    if (idx === 0) return { name: 'START', type: 'start' };
    if (idx === 13) return { name: 'Jail / Visit', type: 'jail' };
    if (idx === 20) return { name: 'Free Parking', type: 'free-parking' };
    if (idx === 33) return { name: 'Go To Jail', type: 'go-to-jail' };
    
    // Railroads at 5, 15, 25, 35
    if (idx === 5) return { name: 'Edvoura Express', type: 'railroad', special: { id: 'r1', name: 'Edvoura Express', type: 'railroad', price: 200, owner: null, isMortgaged: false } };
    if (idx === 15) return { name: 'Transit Hub', type: 'railroad', special: { id: 'r2', name: 'Transit Hub', type: 'railroad', price: 200, owner: null, isMortgaged: false } };
    if (idx === 25) return { name: 'Bus Depot', type: 'railroad', special: { id: 'r3', name: 'Bus Depot', type: 'railroad', price: 200, owner: null, isMortgaged: false } };
    if (idx === 35) return { name: 'Metro Station', type: 'railroad', special: { id: 'r4', name: 'Metro Station', type: 'railroad', price: 200, owner: null, isMortgaged: false } };
    
    // Utilities at 12, 28
    if (idx === 12) return { name: 'Electric Power', type: 'utility', special: { id: 'u1', name: 'Electric Power', type: 'utility', price: 150, owner: null, isMortgaged: false } };
    if (idx === 28) return { name: 'Water Works', type: 'utility', special: { id: 'u2', name: 'Water Works', type: 'utility', price: 150, owner: null, isMortgaged: false } };

    if (idx === 4 || idx === 38) return { name: 'Income Tax', type: 'tax' };
    
    if (idx === 2 || idx === 7 || idx === 17 || idx === 24 || idx === 30 || idx === 36) {
      return idx % 2 === 0 ? { name: 'Quiz Time!', type: 'quiz' } : { name: 'Chance', type: 'chance' };
    }

    const p = academicProps[pIdx % academicProps.length];
    pIdx++;
    return {
      name: p.name,
      type: 'property',
      property: { ...p, owner: null, houses: 0, isMortgaged: false }
    };
  });

  return spaces;
}

/**
 * 14-column x 8-row Rectangular Monopoly Board Grid Mapping (1.75:1 Aspect Ratio)
 */
function getGridCoords(pos: number): { r: number; c: number } {
  const p = pos % 40;
  if (p >= 0 && p <= 13) return { r: 7, c: 13 - p };
  if (p > 13 && p <= 20) return { r: 20 - p, c: 0 };
  if (p > 20 && p <= 33) return { r: 0, c: p - 20 };
  return { r: p - 33, c: 13 };
}

const PLAYER_CONFIGS: { name: string; color: string; token: 'car' | 'hat' | 'ship' | 'thimble' }[] = [
  { name: 'Player 1', color: '#3b82f6', token: 'car' },
  { name: 'Player 2', color: '#ef4444', token: 'hat' },
  { name: 'Player 3', color: '#22c55e', token: 'ship' },
  { name: 'Player 4', color: '#f59e0b', token: 'thimble' },
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
  const [phase, setPhase] = useState<'roll' | 'action' | 'quiz' | 'chance' | 'auction' | 'gameover'>('roll');
  const [actionMessage, setActionMessage] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState<typeof QUIZ_QUESTIONS[0] | null>(null);
  const [currentChance, setCurrentChance] = useState<typeof CHANCE_CARDS[0] | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [view3D, setView3D] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Modals & Advanced Systems
  const [showBankingModal, setShowBankingModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [auctionTargetPos, setAuctionTargetPos] = useState<number | null>(null);
  const [currentBid, setCurrentBid] = useState(10);
  const [highestBidder, setHighestBidder] = useState<number | null>(null);

  // Trade Modal State
  const [tradeTargetPlayer, setTradeTargetPlayer] = useState<number>(1);
  const [tradeMyCash, setTradeMyCash] = useState<number>(50);
  const [tradeTheirCash, setTradeTheirCash] = useState<number>(0);
  const [tradeMyPropertyIndex, setTradeMyPropertyIndex] = useState<number | null>(null);
  const [tradeTheirPropertyIndex, setTradeTheirPropertyIndex] = useState<number | null>(null);

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
    
    list.push({
      ...PLAYER_CONFIGS[0],
      balance: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      isBot: false,
      bankLoan: 0
    });

    if (type === 'ai') {
      for (let i = 1; i < n; i++) {
        list.push({
          name: BOT_NAMES[i - 1] || `AI Bot ${i}`,
          color: PLAYER_CONFIGS[i].color,
          token: PLAYER_CONFIGS[i].token,
          balance: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          isBot: true,
          bankLoan: 0
        });
      }
    } else if (type === 'matchmaker') {
      list.push({
        name: matchedPlayerName || 'Classmate (Grade 4)',
        color: PLAYER_CONFIGS[1].color,
        token: PLAYER_CONFIGS[1].token,
        balance: 1500,
        position: 0,
        inJail: false,
        jailTurns: 0,
        isBot: true,
        bankLoan: 0
      });
      for (let i = 2; i < n; i++) {
        list.push({
          name: `AI Bot ${i}`,
          color: PLAYER_CONFIGS[i].color,
          token: PLAYER_CONFIGS[i].token,
          balance: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          isBot: true,
          bankLoan: 0
        });
      }
    } else {
      for (let i = 1; i < n; i++) {
        list.push({
          ...PLAYER_CONFIGS[i],
          balance: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          isBot: false,
          bankLoan: 0
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

  useEffect(() => {
    if (gameMode === 'matching') {
      const timer = setTimeout(() => {
        const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] + ' (Grade 4)';
        setupGameMode('matchmaker', numPlayers, name);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [gameMode]);

  /* ═══════════════════════ CALCULATE RENT ═══════════════════════ */
  const calculateRent = useCallback((spacePos: number, currentDiceSum: number): number => {
    const space = board[spacePos];
    if (!space) return 0;

    if (space.type === 'property' && space.property && space.property.owner !== null) {
      const prop = space.property;
      if (prop.isMortgaged) return 0;

      let r = prop.rent;
      if (prop.houses === 1) r *= 4;
      else if (prop.houses === 2) r *= 10;
      else if (prop.houses === 3) r *= 20;
      else if (prop.houses === 4) r *= 35;

      if (prop.houses === 0) {
        const sameGroupProps = board.filter(s => s.property && s.property.colorGroup === prop.colorGroup);
        const ownsAll = sameGroupProps.every(s => s.property?.owner === prop.owner);
        if (ownsAll) r *= 2;
      }
      return r;
    }

    if (space.type === 'railroad' && space.special && space.special.owner !== null) {
      const owner = space.special.owner;
      if (space.special.isMortgaged) return 0;
      const rCount = board.filter(s => s.special?.type === 'railroad' && s.special.owner === owner).length;
      if (rCount === 1) return 25;
      if (rCount === 2) return 50;
      if (rCount === 3) return 100;
      return 200;
    }

    if (space.type === 'utility' && space.special && space.special.owner !== null) {
      const owner = space.special.owner;
      if (space.special.isMortgaged) return 0;
      const uCount = board.filter(s => s.special?.type === 'utility' && s.special.owner === owner).length;
      const mult = uCount >= 2 ? 10 : 4;
      return (currentDiceSum || 7) * mult;
    }

    return 0;
  }, [board]);

  const rollDice = useCallback(() => {
    if (isRolling || isAnimating) return;
    setIsRolling(true);
    playMonopolySFX('dice');

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

      if (player.bankLoan > 0) {
        const updated = [...players];
        const interest = 10;
        updated[currentPlayer] = { ...player, balance: player.balance - interest };
        setPlayers(updated);
        addLog(`🏦 Bank deducted $${interest} loan interest from ${player.name}.`);
      }

      if (player.inJail) {
        if (d1 === d2) {
          const updated = [...players];
          updated[currentPlayer] = { ...player, inJail: false, jailTurns: 0 };
          setPlayers(updated);
          addLog(`🚗 ${player.name} rolled doubles and escaped jail!`);
          animatePlayerMove(player.position, total, updated, total);
        } else if (player.jailTurns >= 2) {
          const updated = [...players];
          updated[currentPlayer] = { ...player, inJail: false, jailTurns: 0, balance: player.balance - 50 };
          setPlayers(updated);
          addLog(`💸 ${player.name} paid $50 fine to leave jail.`);
          animatePlayerMove(player.position, total, updated, total);
        } else {
          const updated = [...players];
          updated[currentPlayer] = { ...player, jailTurns: player.jailTurns + 1 };
          setPlayers(updated);
          addLog(`🔒 ${player.name} is stuck in jail. Turn ${player.jailTurns + 1}/3.`);
          playMonopolySFX('jail');
          setPhase('action');
          setActionMessage(`In jail! Roll doubles to escape.`);
        }
        return;
      }

      animatePlayerMove(player.position, total, [...players], total);
    };
  }, [players, currentPlayer, isRolling, isAnimating, addLog]);

  const animatePlayerMove = (startPos: number, steps: number, currentPlayers: PlayerState[], diceSum: number) => {
    setIsAnimating(true);
    let stepCount = 0;
    let currPos = startPos;

    const interval = setInterval(() => {
      stepCount++;
      currPos = (currPos + 1) % 40;
      playMonopolySFX('move');

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
        playMonopolySFX('cash');
        addLog(`🏁 ${currentPlayers[currentPlayer].name} passed START! Earned $200.`);
      }

      if (stepCount === steps) {
        clearInterval(interval);
        setIsAnimating(false);
        handleSpaceLanding(currPos, diceSum);
      }
    }, 240);
  };

  const handleSpaceLanding = useCallback((targetPos: number, diceSum: number) => {
    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    const space = board[targetPos];

    if (space.type === 'go-to-jail') {
      updatedPlayers[currentPlayer] = { ...player, position: 13, inJail: true, jailTurns: 0 };
      setPlayers(updatedPlayers);
      playMonopolySFX('jail');
      addLog(`👮 ${player.name} sent to Jail!`);
      setActionMessage('👮 Go to Jail!');
      setPhase('action');
    } else if (space.type === 'tax') {
      updatedPlayers[currentPlayer] = { ...player, balance: player.balance - 150 };
      setPlayers(updatedPlayers);
      addLog(`💰 ${player.name} paid $150 tax.`);
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
      if (card.effect > 0) playMonopolySFX('cash');
      setPlayers(updatedPlayers);
      addLog(`🎴 ${player.name}: ${card.text}`);
      setPhase('chance');
    } else if (space.type === 'property' && space.property) {
      const prop = space.property;
      if (prop.owner === null) {
        setActionMessage(`Buy ${space.name} for $${prop.price} or Auction?`);
        setPhase('action');
      } else if (prop.owner !== currentPlayer) {
        if (prop.isMortgaged) {
          setActionMessage(`${space.name} is mortgaged. No rent due.`);
          setPhase('action');
        } else {
          const rentAmt = calculateRent(targetPos, diceSum);
          updatedPlayers[currentPlayer] = { ...player, balance: player.balance - rentAmt };
          updatedPlayers[prop.owner] = {
            ...updatedPlayers[prop.owner],
            balance: updatedPlayers[prop.owner].balance + rentAmt
          };
          setPlayers(updatedPlayers);
          addLog(`🏠 ${player.name} paid $${rentAmt} rent to ${updatedPlayers[prop.owner].name}.`);
          setActionMessage(`Paid $${rentAmt} rent for ${space.name}.`);
          setPhase('action');
        }
      } else {
        setActionMessage(`You own ${space.name}.`);
        setPhase('action');
      }
    } else if ((space.type === 'railroad' || space.type === 'utility') && space.special) {
      const spec = space.special;
      if (spec.owner === null) {
        setActionMessage(`Buy ${spec.name} for $${spec.price} or Auction?`);
        setPhase('action');
      } else if (spec.owner !== currentPlayer) {
        if (spec.isMortgaged) {
          setActionMessage(`${spec.name} is mortgaged. No rent due.`);
          setPhase('action');
        } else {
          const rentAmt = calculateRent(targetPos, diceSum);
          updatedPlayers[currentPlayer] = { ...player, balance: player.balance - rentAmt };
          updatedPlayers[spec.owner] = {
            ...updatedPlayers[spec.owner],
            balance: updatedPlayers[spec.owner].balance + rentAmt
          };
          setPlayers(updatedPlayers);
          addLog(`🚆 ${player.name} paid $${rentAmt} rent to ${updatedPlayers[spec.owner].name}.`);
          setActionMessage(`Paid $${rentAmt} rent for ${spec.name}.`);
          setPhase('action');
        }
      } else {
        setActionMessage(`You own ${spec.name}.`);
        setPhase('action');
      }
    } else {
      setActionMessage(`Landed on ${space.name}.`);
      setPhase('action');
    }

    const bankrupt = updatedPlayers.findIndex(p => p.balance < 0);
    if (bankrupt !== -1) {
      const remaining = updatedPlayers.filter((_, i) => i !== bankrupt);
      if (remaining.length === 1) {
        setWinner(remaining[0].name);
        setPhase('gameover');
      }
      addLog(`💀 ${updatedPlayers[bankrupt].name} went bankrupt!`);
    }
  }, [board, players, currentPlayer, addLog, calculateRent]);

  /* ═══════════════════════ BUY PROPERTY / SPECIAL ═══════════════════════ */
  const buyProperty = useCallback(() => {
    const player = players[currentPlayer];
    const space = board[player.position];

    if (space.type === 'property' && space.property && space.property.owner === null) {
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
      playMonopolySFX('cash');
      addLog(`🏡 ${player.name} bought ${space.name} for $${space.property.price}.`);
      setActionMessage(`Bought ${space.name}!`);
    } else if ((space.type === 'railroad' || space.type === 'utility') && space.special && space.special.owner === null) {
      if (player.balance < space.special.price) {
        setActionMessage('Not enough money!');
        return;
      }
      const newPlayers = [...players];
      newPlayers[currentPlayer] = { ...player, balance: player.balance - space.special.price };
      setPlayers(newPlayers);

      const newBoard = [...board];
      newBoard[player.position] = {
        ...space,
        special: { ...space.special, owner: currentPlayer }
      };
      setBoard(newBoard);
      playMonopolySFX('cash');
      addLog(`🚉 ${player.name} bought ${space.special.name} for $${space.special.price}.`);
      setActionMessage(`Bought ${space.special.name}!`);
    }
  }, [players, board, currentPlayer, addLog]);

  /* ═══════════════════════ AUCTION SYSTEM ═══════════════════════ */
  const startAuction = useCallback(() => {
    setAuctionTargetPos(players[currentPlayer].position);
    setCurrentBid(20);
    setHighestBidder(null);
    setPhase('auction');
    addLog(`🔨 Auction started for ${board[players[currentPlayer].position]?.name}!`);
  }, [players, currentPlayer, board, addLog]);

  const placeBid = useCallback((bidderIdx: number, amt: number) => {
    if (amt <= currentBid) return;
    if (players[bidderIdx].balance < amt) return;
    setCurrentBid(amt);
    setHighestBidder(bidderIdx);
    addLog(`🔨 ${players[bidderIdx].name} bid $${amt}.`);
  }, [currentBid, players, addLog]);

  const finalizeAuction = useCallback(() => {
    if (auctionTargetPos === null) return;
    const targetSpace = board[auctionTargetPos];

    if (highestBidder !== null && targetSpace) {
      const winnerPlayer = players[highestBidder];
      const updatedPlayers = [...players];
      updatedPlayers[highestBidder] = { ...winnerPlayer, balance: winnerPlayer.balance - currentBid };
      setPlayers(updatedPlayers);

      const updatedBoard = [...board];
      if (targetSpace.type === 'property' && targetSpace.property) {
        updatedBoard[auctionTargetPos] = {
          ...targetSpace,
          property: { ...targetSpace.property, owner: highestBidder }
        };
      } else if (targetSpace.special) {
        updatedBoard[auctionTargetPos] = {
          ...targetSpace,
          special: { ...targetSpace.special, owner: highestBidder }
        };
      }
      setBoard(updatedBoard);
      playMonopolySFX('cash');
      addLog(`🏆 ${winnerPlayer.name} won the auction for ${targetSpace.name} at $${currentBid}!`);
    } else {
      addLog(`🔨 Auction for ${targetSpace?.name} ended with no bids.`);
    }

    setPhase('action');
    setAuctionTargetPos(null);
  }, [auctionTargetPos, board, highestBidder, currentBid, players, addLog]);

  /* ═══════════════════════ MORTGAGE / UNMORTGAGE / BUILD ═══════════════════════ */
  const toggleMortgage = useCallback((spaceIdx: number) => {
    const space = board[spaceIdx];
    const player = players[currentPlayer];
    if (!space) return;

    if (space.type === 'property' && space.property && space.property.owner === currentPlayer) {
      const prop = space.property;
      const newBoard = [...board];
      const newPlayers = [...players];

      if (!prop.isMortgaged) {
        const cash = Math.floor(prop.price / 2);
        newPlayers[currentPlayer] = { ...player, balance: player.balance + cash };
        newBoard[spaceIdx] = { ...space, property: { ...prop, isMortgaged: true, houses: 0 } };
        playMonopolySFX('cash');
        addLog(`🏦 ${player.name} mortgaged ${space.name} for $${cash}.`);
      } else {
        const cost = Math.floor(prop.price * 0.55);
        if (player.balance < cost) return;
        newPlayers[currentPlayer] = { ...player, balance: player.balance - cost };
        newBoard[spaceIdx] = { ...space, property: { ...prop, isMortgaged: false } };
        addLog(`🔓 ${player.name} unmortgaged ${space.name} for $${cost}.`);
      }
      setPlayers(newPlayers);
      setBoard(newBoard);
    }
  }, [board, players, currentPlayer, addLog]);

  const buildHouse = useCallback((spaceIdx: number) => {
    const space = board[spaceIdx];
    const player = players[currentPlayer];
    if (space?.type !== 'property' || !space.property || space.property.owner === currentPlayer) return;
    const prop = space.property;

    if (prop.houses >= 4 || prop.isMortgaged) return;

    const groupProps = board.filter(s => s.property?.colorGroup === prop.colorGroup);
    const ownsAll = groupProps.every(s => s.property?.owner === currentPlayer);
    if (!ownsAll) {
      setActionMessage('Must own all properties in color group to build!');
      return;
    }

    if (player.balance < prop.housePrice) {
      setActionMessage('Not enough cash to build!');
      return;
    }

    const newPlayers = [...players];
    newPlayers[currentPlayer] = { ...player, balance: player.balance - prop.housePrice };
    setPlayers(newPlayers);

    const newBoard = [...board];
    newBoard[spaceIdx] = {
      ...space,
      property: { ...prop, houses: prop.houses + 1 }
    };
    setBoard(newBoard);
    playMonopolySFX('cash');

    const label = prop.houses + 1 === 4 ? '🏫 Campus/Hotel' : '🏠 Study Hub';
    addLog(`🏗️ ${player.name} built ${label} on ${space.name} for $${prop.housePrice}.`);
    setActionMessage(`Built ${label}!`);
  }, [board, players, currentPlayer, addLog]);

  const takeBankLoan = useCallback((amt: number) => {
    const player = players[currentPlayer];
    const updated = [...players];
    updated[currentPlayer] = {
      ...player,
      balance: player.balance + amt,
      bankLoan: player.bankLoan + amt
    };
    setPlayers(updated);
    playMonopolySFX('cash');
    addLog(`🏦 ${player.name} took a $${amt} Bank Loan.`);
    setShowBankingModal(false);
  }, [players, currentPlayer, addLog]);

  const repayBankLoan = useCallback(() => {
    const player = players[currentPlayer];
    if (player.bankLoan <= 0 || player.balance < player.bankLoan) return;
    const updated = [...players];
    updated[currentPlayer] = {
      ...player,
      balance: player.balance - player.bankLoan,
      bankLoan: 0
    };
    setPlayers(updated);
    addLog(`💳 ${player.name} fully repaid their $${player.bankLoan} Bank Loan.`);
    setShowBankingModal(false);
  }, [players, currentPlayer, addLog]);

  const executeTrade = useCallback(() => {
    if (tradeTargetPlayer === currentPlayer) return;
    const myP = players[currentPlayer];
    const targetP = players[tradeTargetPlayer];

    if (myP.balance < tradeMyCash || targetP.balance < tradeTheirCash) return;

    const newPlayers = [...players];
    newPlayers[currentPlayer] = { ...myP, balance: myP.balance - tradeMyCash + tradeTheirCash };
    newPlayers[tradeTargetPlayer] = { ...targetP, balance: targetP.balance - tradeTheirCash + tradeMyCash };

    setPlayers(newPlayers);
    playMonopolySFX('cash');
    addLog(`🤝 Trade executed between ${myP.name} and ${targetP.name}!`);
    setShowTradeModal(false);
  }, [currentPlayer, tradeTargetPlayer, players, tradeMyCash, tradeTheirCash, addLog]);

  const answerQuiz = useCallback((optionIdx: number) => {
    if (!currentQuiz) return;
    const player = players[currentPlayer];
    const correct = optionIdx === currentQuiz.answer;

    const updated = [...players];
    if (correct) {
      updated[currentPlayer] = { ...player, balance: player.balance + 60 };
      playMonopolySFX('cash');
      addLog(`📝 ${player.name} answered correctly! Earned $60.`);
      setActionMessage('Correct! +$60');
    } else {
      updated[currentPlayer] = { ...player, balance: player.balance - 30 };
      addLog(`📝 ${player.name} answered incorrectly. Lost $30.`);
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

  const quitToLobby = () => setGameMode('lobby');

  useEffect(() => {
    const active = players[currentPlayer];
    if (gameMode === 'playing' && active?.isBot && !isRolling && !isAnimating) {
      if (phase === 'roll') {
        const timer = setTimeout(() => rollDice(), 1000);
        return () => clearTimeout(timer);
      } else if (phase === 'action') {
        const timer = setTimeout(() => {
          const space = board[active.position];
          if ((space.type === 'property' && space.property?.owner === null) || (space.special?.owner === null)) {
            const price = space.property?.price || space.special?.price || 150;
            if (active.balance >= price + 100) {
              buyProperty();
            } else {
              startAuction();
              return;
            }
          }
          endTurn();
        }, 1200);
        return () => clearTimeout(timer);
      } else if (phase === 'auction') {
        const timer = setTimeout(() => {
          if (Math.random() < 0.6 && active.balance > currentBid + 20) {
            placeBid(currentPlayer, currentBid + 10);
          } else {
            finalizeAuction();
          }
        }, 1000);
        return () => clearTimeout(timer);
      } else if (phase === 'quiz' && currentQuiz) {
        const timer = setTimeout(() => {
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
  }, [currentPlayer, phase, gameMode, isRolling, isAnimating, board, currentQuiz, currentBid, rollDice, buyProperty, startAuction, placeBid, finalizeAuction, endTurn, answerQuiz]);

  if (gameMode === 'lobby') {
    return (
      <GameLayout title="Monopoly Lobby" icon={<Dice1 size={24} />} accentColor="#f59e0b" fullscreen={true}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: '24px', color: '#0f172a', textAlign: 'center', padding: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              🎲 Monopoly Play Zone
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '540px', fontWeight: 600, margin: '0 auto' }}>
              Play with SFX sound effects, 3D tumbling dice physics, classic Monopoly SVG tokens, Bank Loans, and Trade Deals!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0' }}>Players:</span>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setNumPlayers(n)}
                style={{
                  padding: '8px 16px', borderRadius: '10px', border: '2px solid #000000',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 900,
                  background: numPlayers === n ? '#fbbf24' : '#ffffff',
                  boxShadow: '2px 2px 0px #000000'
                }}
              >
                {n} Players
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { type: 'ai', title: 'Play vs Computer', desc: 'vs AI bots', icon: Monitor },
              { type: 'local', title: 'Pass & Play', desc: 'Local 2-player', icon: Users },
              { type: 'matchmaker', title: 'Grade Match', desc: 'Find classmates', icon: User }
            ].map(m => (
              <button
                key={m.type}
                onClick={() => startGame(m.type as any, numPlayers)}
                style={{
                  padding: '20px 16px', borderRadius: '18px', border: '3px solid #000000',
                  cursor: 'pointer', background: '#ffffff', color: '#000000',
                  boxShadow: '4px 4px 0px #fbbf24', transition: 'all 0.15s ease',
                  width: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px #fbbf24'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px #fbbf24'; }}
              >
                <m.icon size={32} style={{ color: '#f59e0b' }} />
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
      <GameLayout title="Matchmaking" icon={<Dice1 size={24} />} accentColor="#f59e0b" fullscreen={true}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: '24px', color: '#0f172a', textAlign: 'center'
        }}>
          <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #f59e0b', animation: 'ping 1.5s infinite ease-out' }} />
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #000000', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px #000000', zIndex: 2 }}>
              <Users size={28} color="#f59e0b" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', margin: '0 0 4px 0' }}>Searching for matches...</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Connecting with grade classmates on the board...</p>
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

  const currentSpace = board[players[currentPlayer]?.position ?? 0];
  const canBuy = (currentSpace?.type === 'property' && currentSpace.property?.owner === null) ||
                 ((currentSpace?.type === 'railroad' || currentSpace?.type === 'utility') && currentSpace.special?.owner === null);

  const renderBoardSpace = (idx: number) => {
    const space = board[idx];
    if (!space) return null;
    const { r, c } = getGridCoords(idx);

    const playersHere = players.filter(p => p.position === idx);
    const isMortgaged = space.property?.isMortgaged || space.special?.isMortgaged;
    const houses = space.property?.houses || 0;

    const bgColor = space.type === 'property' && space.property
      ? space.property.color + '22'
      : space.type === 'railroad' ? '#f1f5f9'
      : space.type === 'utility' ? '#fef3c7'
      : space.type === 'start' ? '#dcfce7'
      : space.type === 'jail' ? '#fee2e2'
      : space.type === 'go-to-jail' ? '#fca5a5'
      : space.type === 'quiz' ? '#faf5ff'
      : space.type === 'chance' ? '#ecfeff'
      : space.type === 'tax' ? '#fee2e2'
      : '#f8fafc';

    const borderTopColor = space.type === 'property' && space.property ? space.property.color : space.type === 'railroad' ? '#0f172a' : space.type === 'utility' ? '#d97706' : '#000000';
    const ownerIdx = space.property?.owner ?? space.special?.owner ?? null;

    return (
      <div
        key={idx}
        style={{
          gridRow: r + 1,
          gridColumn: c + 1,
          background: isMortgaged ? '#94a3b833' : bgColor,
          border: '1.5px solid #000000',
          borderTop: `3px solid ${borderTopColor}`,
          borderRadius: '3px',
          padding: '2px 3px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '7.5px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {space.name}
          </span>
          {houses > 0 && (
            <span style={{ fontSize: '8px' }}>
              {houses === 4 ? '🏫' : '🏠'.repeat(houses)}
            </span>
          )}
        </div>

        <div style={{ fontSize: '7.5px', color: '#475569', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>${space.property?.price || space.special?.price || ''}</span>
          {isMortgaged ? (
            <span style={{ fontSize: '7px', background: '#ef4444', color: '#fff', padding: '0 2px', borderRadius: '2px', fontWeight: 900 }}>MORT</span>
          ) : ownerIdx !== null ? (
            <RenderToken token={players[ownerIdx]?.token} color={players[ownerIdx]?.color} size={11} />
          ) : null}
        </div>

        {playersHere.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '2px',
            flexWrap: 'wrap',
            position: 'absolute',
            bottom: '1px',
            left: '1px',
            right: '1px',
            justifyContent: 'center',
            zIndex: 5
          }}>
            {playersHere.map(p => (
              <span
                key={p.name}
                style={{
                  display: 'inline-flex',
                  animation: (isAnimating && players[currentPlayer].name === p.name) ? 'pawnHop 0.28s infinite alternate' : 'none'
                }}
              >
                <RenderToken token={p.token} color={p.color} size={14} />
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <GameLayout title="Monopoly 3D" icon={<Dice1 size={24} />} accentColor="#f59e0b" fullscreen={true}>
      {phase === 'gameover' && winner ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: '20px', textAlign: 'center', color: '#ffffff'
        }}>
          <div style={{ fontSize: '56px' }}>🏆</div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fbbf24' }}>{winner} Wins!</h2>
          <button
            onClick={() => setGameMode('lobby')}
            style={{
              padding: '12px 24px', borderRadius: '12px', border: '2px solid #000000', cursor: 'pointer',
              fontSize: '14px', fontWeight: 900, background: '#fbbf24',
              color: '#000000', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '3px 3px 0px #000000'
            }}
          >
            <RotateCcw size={16} /> Exit to Lobby
          </button>
        </div>
      ) : (
        /* Widescreen 16:9 Zero-Scroll Main Play Area */
        <div style={{
          display: 'flex', alignItems: 'stretch', height: '100%',
          overflow: 'hidden', padding: '6px', gap: '10px', boxSizing: 'border-box'
        }}>
          
          {/* ─── LEFT SIDEBAR: PLAYERS & QUICK ACTIONS ─── */}
          <div style={{
            flex: '0 0 200px', width: '200px', display: 'flex', flexDirection: 'column', gap: '6px',
            overflow: 'hidden'
          }}>
            {/* Header Badge */}
            <div style={{
              background: '#111827', border: '2px solid #1e293b', borderRadius: '12px',
              padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase' }}>🎲 Monopoly</div>
                <div style={{ fontSize: '9px', fontWeight: 600, color: '#64748b' }}>Edvoura Edition</div>
              </div>
              <button
                onClick={quitToLobby}
                style={{
                  padding: '3px 6px', background: '#fee2e2', color: '#ef4444', border: '1.5px solid #000',
                  borderRadius: '6px', fontSize: '9px', fontWeight: 900, cursor: 'pointer'
                }}
              >
                Quit
              </button>
            </div>

            {/* Quick Financial Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <button
                onClick={() => setShowBankingModal(true)}
                style={{
                  padding: '6px', background: '#3b82f6', color: '#fff', border: '1.5px solid #000',
                  borderRadius: '8px', fontSize: '10px', fontWeight: 900, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', boxShadow: '1.5px 1.5px 0 #000'
                }}
              >
                <Landmark size={12} /> Bank Loan
              </button>
              <button
                onClick={() => setShowTradeModal(true)}
                style={{
                  padding: '6px', background: '#8b5cf6', color: '#fff', border: '1.5px solid #000',
                  borderRadius: '8px', fontSize: '10px', fontWeight: 900, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', boxShadow: '1.5px 1.5px 0 #000'
                }}
              >
                <ArrowRightLeft size={12} /> Trade Deal
              </button>
            </div>

            {/* Players Cards List */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
              {players.map((p, i) => {
                const isActive = i === currentPlayer;
                const propCount = board.filter(s => s.property?.owner === i || s.special?.owner === i).length;
                return (
                  <div key={i} style={{
                    padding: '6px 8px',
                    borderRadius: '10px',
                    background: isActive ? '#1e293b' : '#111827',
                    border: isActive ? `2px solid ${p.color}` : '2px solid #1e293b',
                    boxShadow: isActive ? `0 0 8px ${p.color}40` : 'none',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RenderToken token={p.token} color={p.color} size={16} />
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#e2e8f0' }}>{p.name}</span>
                      </div>
                      {p.isBot && <span style={{ fontSize: '8px', background: '#334155', color: '#94a3b8', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>BOT</span>}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#22c55e', marginTop: '1px' }}>
                      ${p.balance.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '1px', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Properties: {propCount}</span>
                      {p.bankLoan > 0 && <span style={{ color: '#ef4444' }}>Loan: ${p.bankLoan}</span>}
                    </div>
                    {p.inJail && (
                      <div style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '8px', background: '#ef4444', color: '#fff', padding: '1px 4px', borderRadius: '4px', fontWeight: 900 }}>
                        JAIL
                      </div>
                    )}
                    {isActive && (
                      <div style={{ fontSize: '8.5px', fontWeight: 900, color: p.color, marginTop: '2px' }}>
                        ⚡ YOUR TURN
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 3D View Toggle Button */}
            <button
              onClick={() => setView3D(!view3D)}
              style={{
                padding: '6px 10px',
                background: '#fbbf24',
                border: '2px solid #000000',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: '#000'
              }}
            >
              <Layers size={12} /> {view3D ? 'Flat View' : '3D View'}
            </button>
          </div>

          {/* ─── CENTER AREA: 14×8 RECTANGULAR WIDESCREEN BOARD ─── */}
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
              aspectRatio: '14 / 8',
              borderRadius: '16px',
              padding: '2px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* 14x8 Grid Board */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(14, 1fr)',
                gridTemplateRows: 'repeat(8, 1fr)',
                width: '100%',
                height: '100%',
                border: '2px solid #000000',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#f1f5f9',
                transformStyle: 'preserve-3d',
                transform: view3D ? 'rotateX(22deg) rotateZ(-3deg) scale(0.96)' : 'none',
                transition: 'transform 0.4s ease-out',
                boxShadow: view3D ? '0 16px 24px rgba(0,0,0,0.3)' : 'none'
              }}>
                {Array.from({ length: 40 }).map((_, i) => renderBoardSpace(i))}

                {/* Central Controller Box Spanning Columns 2-13, Rows 2-7 */}
                <div style={{
                  gridRow: '2 / 8',
                  gridColumn: '2 / 14',
                  background: '#ffffff',
                  margin: '2px',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  gap: '5px',
                  border: '1.5px dashed #000000',
                  zIndex: 2,
                  transform: view3D ? 'translateZ(8px)' : 'none',
                  transition: 'transform 0.4s ease-out'
                }}>
                  <div style={{ fontSize: '15px', fontWeight: 950, color: '#000000', letterSpacing: '0.05em' }}>
                    🎓 EDVOURA MONOPOLY
                  </div>

                  {/* 3D Tumbling Dice Display */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {dice.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: d ? '#fbbf24' : '#e2e8f0',
                          border: '2px solid #000000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '17px',
                          fontWeight: 900,
                          color: '#000000',
                          animation: isRolling ? 'diceRoll3D 0.3s infinite linear' : 'none',
                          boxShadow: d ? '2.5px 2.5px 0px #000000' : 'none'
                        }}
                      >
                        {d || '?'}
                      </div>
                    ))}
                  </div>

                  {/* Turn Status */}
                  <div style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: `1.5px solid #000000`,
                    textAlign: 'center',
                    boxShadow: '1.5px 1.5px 0px #000000'
                  }}>
                    <div style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 700 }}>Current Turn</div>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: players[currentPlayer]?.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RenderToken token={players[currentPlayer]?.token} color={players[currentPlayer]?.color} size={14} />
                      {players[currentPlayer]?.name}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {phase === 'roll' && !players[currentPlayer]?.isBot && (
                      <button
                        onClick={rollDice}
                        disabled={isRolling || isAnimating}
                        style={{
                          padding: '5px 12px', borderRadius: '8px', border: '2px solid #000000', cursor: 'pointer',
                          fontSize: '11px', fontWeight: 900, background: '#fbbf24',
                          color: '#000000', boxShadow: '2px 2px 0px #000000'
                        }}
                      >
                        {isRolling ? 'Rolling...' : '🎲 Roll Dice'}
                      </button>
                    )}
                    {phase === 'action' && !isAnimating && !players[currentPlayer]?.isBot && (
                      <>
                        {canBuy && (
                          <>
                            <button
                              onClick={buyProperty}
                              style={{
                                padding: '5px 10px', borderRadius: '6px', border: '1.5px solid #000000', cursor: 'pointer',
                                fontSize: '10.5px', fontWeight: 900, background: '#22c55e',
                                color: '#ffffff', boxShadow: '1.5px 1.5px 0px #000000'
                              }}
                            >
                              Buy (${currentSpace.property?.price || currentSpace.special?.price})
                            </button>
                            <button
                              onClick={startAuction}
                              style={{
                                padding: '5px 10px', borderRadius: '6px', border: '1.5px solid #000000', cursor: 'pointer',
                                fontSize: '10.5px', fontWeight: 900, background: '#f59e0b',
                                color: '#ffffff', boxShadow: '1.5px 1.5px 0px #000000', display: 'flex', alignItems: 'center', gap: '3px'
                              }}
                            >
                              <Gavel size={11} /> Auction
                            </button>
                          </>
                        )}
                        <button
                          onClick={endTurn}
                          style={{
                            padding: '5px 10px', borderRadius: '6px', border: '1.5px solid #000000',
                            cursor: 'pointer', fontSize: '10.5px', fontWeight: 900,
                            background: '#ffffff', color: '#000000', boxShadow: '1.5px 1.5px 0px #000000'
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
                          padding: '5px 10px', borderRadius: '6px', border: '1.5px solid #000000', cursor: 'pointer',
                          fontSize: '10.5px', fontWeight: 900, background: '#38bdf8',
                          color: '#ffffff', boxShadow: '1.5px 1.5px 0px #000000'
                        }}
                      >
                        Continue
                      </button>
                    )}
                    {players[currentPlayer]?.isBot && (
                      <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#f59e0b', animation: 'pulse 1s infinite alternate' }}>
                        🤖 AI is thinking...
                      </div>
                    )}
                  </div>

                  {/* Auction Modal Overlay */}
                  {phase === 'auction' && (
                    <div style={{
                      padding: '8px 12px', borderRadius: '10px', background: '#fffbe8',
                      border: '2px solid #000', width: '220px', textAlign: 'center', boxShadow: '3px 3px 0 #000'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Gavel size={14} /> AUCTION IN PROGRESS
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 800, marginTop: '2px' }}>
                        Highest Bid: <span style={{ color: '#22c55e' }}>${currentBid}</span> ({highestBidder !== null ? players[highestBidder]?.name : 'No bids'})
                      </div>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '6px' }}>
                        <button
                          onClick={() => placeBid(currentPlayer, currentBid + 10)}
                          disabled={players[currentPlayer]?.isBot}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #000', fontSize: '9.5px', fontWeight: 900, background: '#22c55e', color: '#fff', cursor: 'pointer' }}
                        >
                          Bid +$10
                        </button>
                        <button
                          onClick={() => placeBid(currentPlayer, currentBid + 25)}
                          disabled={players[currentPlayer]?.isBot}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #000', fontSize: '9.5px', fontWeight: 900, background: '#3b82f6', color: '#fff', cursor: 'pointer' }}
                        >
                          Bid +$25
                        </button>
                        <button
                          onClick={finalizeAuction}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #000', fontSize: '9.5px', fontWeight: 900, background: '#ef4444', color: '#fff', cursor: 'pointer' }}
                        >
                          Pass / End
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quiz Overlay */}
                  {phase === 'quiz' && currentQuiz && (
                    <div style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: '#faf5ff',
                      border: '1.5px solid #000000',
                      maxWidth: '260px',
                      boxShadow: '2px 2px 0px #000000',
                      textAlign: 'left'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#8b5cf6', marginBottom: '4px' }}>
                        📝 Quiz Time!
                      </div>
                      <div style={{ fontSize: '10px', color: '#000000', fontWeight: 700, marginBottom: '6px' }}>
                        {currentQuiz.q}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        {currentQuiz.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => !players[currentPlayer]?.isBot && answerQuiz(i)}
                            style={{
                              padding: '4px 6px', borderRadius: '6px',
                              border: '1px solid #000000', cursor: players[currentPlayer]?.isBot ? 'default' : 'pointer',
                              fontSize: '10px', fontWeight: 700, background: '#ffffff',
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

                  {/* Chance Card Overlay */}
                  {phase === 'chance' && currentChance && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: '#ecfeff',
                      border: '1.5px solid #000000',
                      maxWidth: '220px',
                      textAlign: 'center',
                      boxShadow: '2px 2px 0px #000000'
                    }}>
                      <div style={{ fontSize: '16px', marginBottom: '2px' }}>🎴</div>
                      <div style={{ fontSize: '10px', color: '#000000', fontWeight: 700 }}>
                        {currentChance.text}
                      </div>
                    </div>
                  )}

                  {/* Action Banner */}
                  {actionMessage && phase === 'action' && !isAnimating && (
                    <div style={{
                      padding: '3px 8px', borderRadius: '6px', background: '#f8fafc',
                      border: '1px solid #000000', fontSize: '9.5px', color: '#000000', textAlign: 'center', maxWidth: '240px', fontWeight: 700
                    }}>
                      {actionMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT SIDEBAR: GAME LOG & PROPERTY MANAGEMENT ─── */}
          <div style={{
            flex: '0 0 220px', width: '220px', display: 'flex', flexDirection: 'column', gap: '6px',
            overflow: 'hidden'
          }}>
            {/* Game Logs */}
            <div style={{
              flex: 1, padding: '8px', borderRadius: '12px', background: '#111827',
              border: '2px solid #1e293b', overflowY: 'auto'
            }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '9.5px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📜 Game Log
              </h4>
              {gameLog.map((log, i) => (
                <div key={i} style={{ fontSize: '9.5px', color: '#94a3b8', padding: '2px 0', borderBottom: '1px solid #1e293b', fontWeight: 600 }}>
                  {log}
                </div>
              ))}
            </div>

            {/* Properties Overview & Actions (Build / Mortgage) */}
            <div style={{
              padding: '8px', borderRadius: '12px', background: '#111827',
              border: '2px solid #1e293b', maxHeight: '150px', overflowY: 'auto'
            }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '9.5px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🏠 Properties Management
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {board.filter(s => (s.property && s.property.owner === currentPlayer) || (s.special && s.special.owner === currentPlayer)).length === 0 ? (
                  <div style={{ fontSize: '9.5px', color: '#475569', fontStyle: 'italic' }}>You own no properties yet</div>
                ) : (
                  board.map((s, idx) => {
                    const isMyProp = s.property?.owner === currentPlayer;
                    const isMySpec = s.special?.owner === currentPlayer;
                    if (!isMyProp && !isMySpec) return null;

                    const prop = s.property;
                    const spec = s.special;

                    return (
                      <div key={idx} style={{ fontSize: '9px', fontWeight: 700, color: '#e2e8f0', background: '#1e293b', padding: '4px 6px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '2px', background: prop?.color || '#38bdf8' }} />
                          {s.name} {prop?.houses ? `(${'🏠'.repeat(prop.houses)})` : ''}
                        </span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {prop && prop.houses < 4 && !prop.isMortgaged && (
                            <button
                              onClick={() => buildHouse(idx)}
                              style={{ fontSize: '7.5px', padding: '1px 3px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '3px', fontWeight: 900, cursor: 'pointer' }}
                              title={`Build House ($${prop.housePrice})`}
                            >
                              +House
                            </button>
                          )}
                          <button
                            onClick={() => toggleMortgage(idx)}
                            style={{ fontSize: '7.5px', padding: '1px 3px', background: (prop?.isMortgaged || spec?.isMortgaged) ? '#fbbf24' : '#ef4444', color: (prop?.isMortgaged || spec?.isMortgaged) ? '#000' : '#fff', border: 'none', borderRadius: '3px', fontWeight: 900, cursor: 'pointer' }}
                          >
                            {(prop?.isMortgaged || spec?.isMortgaged) ? 'Unmort' : 'Mort'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── BANK LOAN MODAL ─── */}
      {showBankingModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', border: '3px solid #000',
            padding: '20px', width: '320px', boxShadow: '6px 6px 0 #000', color: '#000'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 950, marginBottom: '8px', color: '#3b82f6' }}>
              <Landmark size={22} /> Edvoura Bank Loans
            </div>
            <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600, margin: '0 0 16px 0' }}>
              Take an emergency loan to buy properties or pay rent. Loans carry a $10 interest fee per turn.
            </p>

            <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '12px' }}>
              Current Loan Balance: <span style={{ color: '#ef4444' }}>${players[currentPlayer]?.bankLoan || 0}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => takeBankLoan(200)}
                style={{ padding: '10px', background: '#3b82f6', color: '#fff', border: '2px solid #000', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0 #000' }}
              >
                Take $200 Bank Loan
              </button>
              <button
                onClick={() => takeBankLoan(500)}
                style={{ padding: '10px', background: '#22c55e', color: '#fff', border: '2px solid #000', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0 #000' }}
              >
                Take $500 Bank Loan
              </button>
              {players[currentPlayer]?.bankLoan > 0 && (
                <button
                  onClick={repayBankLoan}
                  disabled={players[currentPlayer]?.balance < players[currentPlayer]?.bankLoan}
                  style={{ padding: '10px', background: '#f59e0b', color: '#000', border: '2px solid #000', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0 #000' }}
                >
                  Repay Full Loan (${players[currentPlayer]?.bankLoan})
                </button>
              )}
              <button
                onClick={() => setShowBankingModal(false)}
                style={{ padding: '8px', background: '#e2e8f0', color: '#000', border: '1.5px solid #000', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', marginTop: '4px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TRADE DEAL MODAL ─── */}
      {showTradeModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', border: '3px solid #000',
            padding: '20px', width: '360px', boxShadow: '6px 6px 0 #000', color: '#000'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 950, marginBottom: '8px', color: '#8b5cf6' }}>
              <ArrowRightLeft size={22} /> Propose Trade Deal
            </div>

            <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>
              Trade Partner:
              <select
                value={tradeTargetPlayer}
                onChange={e => setTradeTargetPlayer(Number(e.target.value))}
                style={{ marginLeft: '8px', padding: '4px', borderRadius: '6px', border: '1.5px solid #000', fontWeight: 800 }}
              >
                {players.map((p, i) => i !== currentPlayer && (
                  <option key={i} value={i}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '12px 0' }}>
              {/* You Offer */}
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1.5px solid #000' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#3b82f6' }}>YOU GIVE</div>
                <div style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px' }}>
                  Cash Offer ($):
                  <input
                    type="number"
                    value={tradeMyCash}
                    onChange={e => setTradeMyCash(Number(e.target.value))}
                    style={{ width: '100%', padding: '3px', marginTop: '2px', border: '1px solid #000', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* They Offer */}
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1.5px solid #000' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#ef4444' }}>THEY GIVE</div>
                <div style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px' }}>
                  Cash Ask ($):
                  <input
                    type="number"
                    value={tradeTheirCash}
                    onChange={e => setTradeTheirCash(Number(e.target.value))}
                    style={{ width: '100%', padding: '3px', marginTop: '2px', border: '1px solid #000', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={executeTrade}
                style={{ padding: '10px', background: '#8b5cf6', color: '#fff', border: '2px solid #000', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0 #000' }}
              >
                Confirm Trade Deal
              </button>
              <button
                onClick={() => setShowTradeModal(false)}
                style={{ padding: '8px', background: '#e2e8f0', color: '#000', border: '1.5px solid #000', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes diceRoll3D {
          0% { transform: rotateX(0deg) rotateY(0deg) scale(1); }
          50% { transform: rotateX(180deg) rotateY(180deg) scale(1.15); }
          100% { transform: rotateX(360deg) rotateY(360deg) scale(1); }
        }
        @keyframes pawnHop {
          0% { transform: translateY(0); }
          100% { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </GameLayout>
  );
}
