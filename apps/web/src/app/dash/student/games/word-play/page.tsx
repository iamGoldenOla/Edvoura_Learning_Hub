'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { Type, RefreshCw, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

// --- SHARED CONSTANTS & DATA ---
const ACCENT_COLOR = '#8b5cf6';
const SCRAMBLE_WORDS = [
  'SCIENCE', 'HISTORY', 'MATHEMATICS', 'GEOGRAPHY', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS',
  'ASTRONOMY', 'LITERATURE', 'GRAMMAR', 'VOCABULARY', 'ALGEBRA', 'GEOMETRY', 'CALCULUS',
  'ECONOMICS', 'PSYCHOLOGY', 'SOCIOLOGY', 'PHILOSOPHY', 'ART', 'MUSIC', 'COMPUTER',
  'PROGRAMMING', 'ALGORITHM', 'DATABASE', 'NETWORK', 'INTERNET', 'SOFTWARE', 'HARDWARE'
];

const HANGMAN_CATEGORIES: Record<string, string[]> = {
  Animals: ['ELEPHANT', 'GIRAFFE', 'HIPPOPOTAMUS', 'RHINOCEROS', 'CROCODILE', 'KANGAROO', 'PENGUIN', 'DOLPHIN'],
  Countries: ['AUSTRALIA', 'BRAZIL', 'CANADA', 'DENMARK', 'EGYPT', 'FRANCE', 'GERMANY', 'JAPAN'],
  Subjects: ['MATHEMATICS', 'GEOGRAPHY', 'HISTORY', 'SCIENCE', 'LITERATURE', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'],
  Science: ['MOLECULE', 'ATOM', 'GRAVITY', 'ENERGY', 'VELOCITY', 'ACCELERATION', 'ECOSYSTEM', 'PHOTOSYNTHESIS']
};

const SEARCH_WORDS = [
  'REACT', 'NEXTJS', 'TYPESCRIPT', 'JAVASCRIPT', 'HTML', 'CSS', 'NODE', 'PYTHON',
  'JAVA', 'RUBY', 'PHP', 'SWIFT', 'KOTLIN', 'GO', 'RUST', 'C', 'CPLUSPLUS', 'CSHARP',
  'SQL', 'NOSQL', 'MONGO', 'POSTGRES', 'MYSQL', 'ORACLE', 'REDIS', 'GRAPHQL', 'REST',
  'API', 'JSON', 'XML', 'DOCKER', 'KUBERNETES', 'AWS', 'AZURE', 'GCP', 'CLOUD'
];

// --- WORD SCRAMBLE COMPONENT ---
function WordScramble({ addScore }: { addScore: (points: number) => void }) {
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{type: string; text: string} | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [timeActive, setTimeActive] = useState(false);

  const getNewWord = useCallback(() => {
    const newWord = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    setWord(newWord);
    
    // Scramble logic
    let scram = newWord.split('');
    for (let i = scram.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scram[i], scram[j]] = [scram[j], scram[i]];
    }
    // Prevent identical scramble
    if (scram.join('') === newWord) {
      [scram[0], scram[1]] = [scram[1], scram[0]];
    }
    setScrambled(scram.join(''));
    setGuess('');
    setFeedback(null);
    setHintLevel(0);
    setTimeActive(true);
  }, []);

  useEffect(() => {
    getNewWord();
  }, [getNewWord]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (timeActive) {
      let seconds = 0;
      timer = setInterval(() => {
        seconds++;
        if (seconds === 15) setHintLevel(1);
        if (seconds === 30) setHintLevel(2);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeActive, word]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess) return;
    
    if (guess.toUpperCase() === word) {
      setFeedback({ type: 'success', text: 'Correct! +10 points' });
      addScore(10);
      setStreak(s => s + 1);
      setTimeActive(false);
      setTimeout(() => getNewWord(), 1500);
    } else {
      setFeedback({ type: 'error', text: 'Incorrect, try again!' });
      setStreak(0);
    }
  };

  const handleSkip = () => {
    setFeedback({ type: 'error', text: `Skipped! Word was: ${word}` });
    setStreak(0);
    setTimeActive(false);
    setTimeout(() => getNewWord(), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '400px' }}>
        <div style={{ fontSize: '18px', color: '#94a3b8' }}>Streak: <span style={{ color: 'white', fontWeight: 'bold' }}>{streak}🔥</span></div>
      </div>

      <div style={{ 
        fontSize: '48px', 
        fontWeight: 'bold', 
        letterSpacing: '8px', 
        color: ACCENT_COLOR,
        textTransform: 'uppercase',
        background: 'rgba(255,255,255,0.05)',
        padding: '20px 40px',
        borderRadius: '16px'
      }}>
        {scrambled}
      </div>

      <div style={{ height: '30px', color: '#94a3b8' }}>
        {hintLevel >= 1 && `Hint: Starts with ${word[0]}`}
        {hintLevel >= 2 && `, then ${word[1]}`}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
        <input 
          type="text"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="Type your guess..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.2)',
            color: 'white',
            fontSize: '18px',
            outline: 'none',
            textTransform: 'uppercase'
          }}
          disabled={!!feedback && feedback.type === 'success'}
        />
        <button 
          type="submit"
          disabled={!!feedback && feedback.type === 'success'}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: ACCENT_COLOR,
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Guess
        </button>
      </form>

      {feedback && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: feedback.type === 'success' ? '#22c55e' : '#ef4444',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 /> : <XCircle />}
          {feedback.text}
        </div>
      )}

      <button
        onClick={handleSkip}
        disabled={!!feedback}
        style={{
          marginTop: '20px',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'transparent',
          color: '#94a3b8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        Skip Word <ChevronRight size={16} />
      </button>
    </div>
  );
}

// --- HANGMAN COMPONENT ---
function Hangman({ addScore }: { addScore: (points: number) => void }) {
  const [category, setCategory] = useState('');
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState('playing'); // playing, won, lost

  const MAX_MISTAKES = 6;
  const keyboard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const initGame = useCallback(() => {
    const cats = Object.keys(HANGMAN_CATEGORIES);
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const words = HANGMAN_CATEGORIES[cat];
    const newWord = words[Math.floor(Math.random() * words.length)];
    
    setCategory(cat);
    setWord(newWord);
    setGuessedLetters(new Set());
    setMistakes(0);
    setStatus('playing');
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const guessLetter = (letter: string) => {
    if (status !== 'playing' || guessedLetters.has(letter)) return;
    
    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!word.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= MAX_MISTAKES) {
        setStatus('lost');
      }
    } else {
      const isWon = word.split('').every(l => newGuessed.has(l));
      if (isWon) {
        setStatus('won');
        addScore(20);
      }
    }
  };

  const drawHangman = () => {
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 250" style={{ maxHeight: '250px' }} fill="none" stroke="white" strokeWidth="4" strokeLinecap="round">
        {/* Base and pole */}
        <path d="M20,230 L100,230" />
        <path d="M60,230 L60,20" />
        <path d="M60,20 L140,20" />
        <path d="M140,20 L140,50" />
        
        {/* Head */}
        {mistakes > 0 && <circle cx="140" cy="70" r="20" />}
        {/* Body */}
        {mistakes > 1 && <path d="M140,90 L140,150" />}
        {/* Left Arm */}
        {mistakes > 2 && <path d="M140,100 L110,130" />}
        {/* Right Arm */}
        {mistakes > 3 && <path d="M140,100 L170,130" />}
        {/* Left Leg */}
        {mistakes > 4 && <path d="M140,150 L110,190" />}
        {/* Right Leg */}
        {mistakes > 5 && <path d="M140,150 L170,190" stroke={status === 'lost' ? '#ef4444' : 'white'} />}
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flex: 1, overflow: 'hidden' }}>
      <div style={{ fontSize: '18px', color: '#94a3b8', flexShrink: 0 }}>Category: <span style={{ color: ACCENT_COLOR, fontWeight: 'bold' }}>{category}</span></div>
      
      <div style={{ flex: 1, minHeight: 0, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '400px' }}>
        {drawHangman()}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', flexShrink: 0 }}>
        {word.split('').map((letter, i) => (
          <div key={i} style={{ 
            width: '40px', 
            height: '50px', 
            borderBottom: '3px solid white',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: (status === 'lost' && !guessedLetters.has(letter)) ? '#ef4444' : 'white'
          }}>
            {(guessedLetters.has(letter) || status === 'lost') ? letter : ''}
          </div>
        ))}
      </div>

      {status !== 'playing' ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: status === 'won' ? '#22c55e' : '#ef4444', marginBottom: '16px' }}>
            {status === 'won' ? 'You Won! +20 Points' : 'Game Over!'}
          </div>
          <button 
            onClick={initGame}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: ACCENT_COLOR,
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <RefreshCw size={18} /> Play Again
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '500px', justifyContent: 'center' }}>
          {keyboard.map(key => (
            <button
              key={key}
              onClick={() => guessLetter(key)}
              disabled={guessedLetters.has(key)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                border: 'none',
                background: guessedLetters.has(key) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                color: guessedLetters.has(key) ? 'rgba(255,255,255,0.3)' : 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: guessedLetters.has(key) ? 'default' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- WORD SEARCH COMPONENT ---
function WordSearch({ addScore }: { addScore: (points: number) => void }) {
  const GRID_SIZE = 12;
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordsToFind, setWordsToFind] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [startCell, setStartCell] = useState<{r: number; c: number} | null>(null);
  const [currentCell, setCurrentCell] = useState<{r: number; c: number} | null>(null);

  const initGame = useCallback(() => {
    // Select 8 random words
    let shuffledWords = [...SEARCH_WORDS].sort(() => 0.5 - Math.random());
    let selectedWords = shuffledWords.slice(0, 8);
    setWordsToFind(selectedWords);
    setFoundWords(new Set());

    // Initialize empty grid
    let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));

    // Place words
    selectedWords.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const dir = Math.random() > 0.5 ? 'H' : 'V';
        let row = Math.floor(Math.random() * GRID_SIZE);
        let col = Math.floor(Math.random() * GRID_SIZE);

        if (dir === 'H' && col + word.length <= GRID_SIZE) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row][col + i] !== '' && newGrid[row][col + i] !== word[i]) {
              canPlace = false; break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) newGrid[row][col + i] = word[i];
            placed = true;
          }
        } else if (dir === 'V' && row + word.length <= GRID_SIZE) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row + i][col] !== '' && newGrid[row + i][col] !== word[i]) {
              canPlace = false; break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) newGrid[row + i][col] = word[i];
            placed = true;
          }
        }
      }
    });

    // Fill remaining cells
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
    
    setGrid(newGrid);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handlePointerDown = (r: number, c: number) => {
    setSelectionMode(true);
    setStartCell({r, c});
    setCurrentCell({r, c});
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (selectionMode) {
      setCurrentCell({r, c});
    }
  };

  const handlePointerUp = () => {
    if (selectionMode && startCell && currentCell) {
      checkSelection(startCell, currentCell);
    }
    setSelectionMode(false);
    setStartCell(null);
    setCurrentCell(null);
  };

  const checkSelection = (start: {r: number; c: number}, end: {r: number; c: number}) => {
    if (!start || !end) return;
    
    // Must be same row or same col
    let selectedStr = "";
    if (start.r === end.r) {
      const minC = Math.min(start.c, end.c);
      const maxC = Math.max(start.c, end.c);
      for (let c = minC; c <= maxC; c++) selectedStr += grid[start.r][c];
    } else if (start.c === end.c) {
      const minR = Math.min(start.r, end.r);
      const maxR = Math.max(start.r, end.r);
      for (let r = minR; r <= maxR; r++) selectedStr += grid[r][start.c];
    } else {
      return; // Diagonal or invalid
    }

    const reversedStr = selectedStr.split('').reverse().join('');
    
    const foundWord = wordsToFind.find(w => w === selectedStr || w === reversedStr);
    
    if (foundWord && !foundWords.has(foundWord)) {
      const newFound = new Set(foundWords);
      newFound.add(foundWord);
      setFoundWords(newFound);
      addScore(15);
    }
  };

  // Determine if a cell is currently being selected
  const isCellSelected = (r: number, c: number) => {
    if (!startCell || !currentCell || !selectionMode) return false;
    if (startCell.r === currentCell.r && r === startCell.r) {
      const minC = Math.min(startCell.c, currentCell.c);
      const maxC = Math.max(startCell.c, currentCell.c);
      return c >= minC && c <= maxC;
    }
    if (startCell.c === currentCell.c && c === startCell.c) {
      const minR = Math.min(startCell.r, currentCell.r);
      const maxR = Math.max(startCell.r, currentCell.r);
      return r >= minR && r <= maxR;
    }
    return false;
  };

  const isGameWon = wordsToFind.length > 0 && foundWords.size === wordsToFind.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', userSelect: 'none', flex: 1, overflow: 'hidden' }} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      {isGameWon && (
        <div style={{ textAlign: 'center', background: 'rgba(34, 197, 94, 0.2)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
          <div style={{ color: '#22c55e', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Puzzle Completed!</div>
          <button onClick={initGame} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Next Puzzle</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'nowrap', justifyContent: 'center', flex: 1, overflow: 'hidden', minHeight: 0, width: '100%' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          gap: '2px',
          background: 'rgba(255,255,255,0.05)',
          padding: '8px',
          borderRadius: '12px',
          touchAction: 'none',
          aspectRatio: '1 / 1',
          height: '100%'
        }}>
          {grid.map((row, r) => (
            row.map((cell, c) => (
              <div 
                key={`${r}-${c}`}
                onPointerDown={() => handlePointerDown(r, c)}
                onPointerEnter={() => handlePointerEnter(r, c)}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: isCellSelected(r, c) ? ACCENT_COLOR : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  transition: 'background 0.1s'
                }}
              >
                {cell}
              </div>
            ))
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px', overflowY: 'auto' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>Find Words:</div>
          {wordsToFind.map(word => (
            <div key={word} style={{ 
              fontSize: '16px',
              color: foundWords.has(word) ? '#22c55e' : 'white',
              textDecoration: foundWords.has(word) ? 'line-through' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {foundWords.has(word) ? <CheckCircle2 size={16} /> : <div style={{width:'16px', height:'16px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.2)'}} />}
              {word}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function WordPlayGame() {
  const [score, setScore] = useState(0);
  const [activeTab, setActiveTab] = useState('scramble');

  const addScore = (points: number) => {
    setScore(s => s + points);
  };

  const tabs = [
    { id: 'scramble', label: 'Word Scramble' },
    { id: 'hangman', label: 'Hangman' },
    { id: 'search', label: 'Word Search' }
  ];

  return (
    <GameLayout 
      title="Word Play" 
      icon={<Type size={24} />} 
      score={score}
      showTimer={false}
      accentColor={ACCENT_COLOR}
      fullscreen={true}
    >
      <div style={{ maxWidth: '800px', width: '100%', height: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
        
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          background: 'rgba(255,255,255,0.05)', 
          padding: '8px', 
          borderRadius: '100px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          flexShrink: 0
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 24px',
                borderRadius: '100px',
                border: 'none',
                background: activeTab === tab.id ? ACCENT_COLOR : 'transparent',
                color: activeTab === tab.id ? 'white' : '#94a3b8',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Game Area */}
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: '24px', 
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.05)',
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {activeTab === 'scramble' && <WordScramble addScore={addScore} />}
          {activeTab === 'hangman' && <Hangman addScore={addScore} />}
          {activeTab === 'search' && <WordSearch addScore={addScore} />}
        </div>
      </div>
    </GameLayout>
  );
}
