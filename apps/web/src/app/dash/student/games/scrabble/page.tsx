'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { ALargeSmall, RotateCcw, Sparkles, Lightbulb, User, Users, Monitor, ShieldAlert } from 'lucide-react';

const LETTER_VALUES: Record<string, number> = {
  A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10
};

const LETTER_DIST = 'AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ';

const OPPONENT_NAMES = ['Aisha Bello (Grade 4)', 'Chinedu Okafor (Grade 5)', 'Oluwaseun Adebayo (Grade 4)', 'Amara Egwu (Grade 5)', 'Tunde Cole (Grade 6)'];

const VALID_WORDS = new Set([
  'POLL','POND','POOL','POOR','PORT','POST','POUR','PRAY','PULL','PUMP',
  'PURE','PUSH','QUIT','RACE','RAGE','RAID','RAIL','RAIN','RANK','RARE',
  'RATE','READ','REAL','REAR','RELY','RENT','REST','RICE','RICH','RIDE',
  'RING','RISE','RISK','ROAD','ROCK','RODE','ROLE','ROLL','ROOF','ROOM',
  'ROOT','ROPE','ROSE','RULE','RUSH','SAFE','SAID','SAKE','SALE','SALT',
  'SAME','SAND','SANG','SAVE','SEAL','SEAT','SEED','SEEM','SEEN',
  'SELF','SELL','SEND','SENT','SEPT','SHED','SHIP','SHOP','SHOT','SHOW',
  'SHUT','SICK','SIDE','SIGN','SILK','SITE','SIZE','SKIN','SLIP','SLOT',
  'SLOW','SNAP','SNOW','SOFT','SOIL','SOLD','SOLE','SOME','SONG','SOON',
  'BENCH','BLACK','BLADE','BLAME','BLANK','BLAST','BLAZE','BLEED','BLEND',
  'BLESS','BLIND','BLOCK','BLOOD','BLOOM','BLOWN','BLUES','BOARD','BONUS',
  'BOOST','BOUND','BRAIN','BRAND','BRAVE','BREAD','BREAK','BREED','BRICK',
  'BRIEF','BRING','BROAD','BROKE','BROWN','BUILD','BUNCH','BURST','BUYER',
  'CABIN','CARRY','CATCH','CAUSE','CHAIN','CHAIR','CHALK','CHAOS','CHARM',
  'CHART','CHASE','CHEAP','CHECK','CHEEK','CHEER','CHESS','CHEST','CHIEF',
  'CHILD','CHINA','CHUNK','CIVIC','CIVIL','CLAIM','CLASS','CLEAN','CLEAR',
  'CLIMB','CLING','CLOCK','CLONE','CLOSE','CLOTH','CLOUD','COACH','COAST',
  'COLOR','COMET','COMIC','COUNT','COURT','COVER','CRACK','CRAFT','CRANE',
  'CRASH','CRAZY','CREAM','CRIME','CROSS','CROWD','CROWN','CRUEL','CRUSH',
  'CURVE','CYCLE','DAILY','DANCE','DEATH','DEBUT','DELAY','DELTA','DENSE',
  'DEPTH','DEVIL','DIARY','DIRTY','DOUBT','DOZEN','DRAFT','DRAIN','DRAMA',
  'DRANK','DRAWN','DREAM','DRESS','DRIED','DRIFT','DRINK','DRIVE','DRUMS',
  'DYING','EAGER','EARLY','EARTH','EIGHT','ELECT','ELITE','EMBER','EMPTY',
  'ENEMY','ENJOY','ENTER','ENTRY','EQUAL','ERROR','EVENT','EVERY','EXACT',
  'EXAMS','EXIST','EXTRA','FAINT','FAITH','FALSE','FANCY','FATAL','FAULT',
  'FEAST','FENCE','FEWER','FIBER','FIELD','FIFTH','FIFTY','FIGHT','FINAL',
  'FIRST','FIXED','FLAGS','FLAME','FLASH','FLEET','FLESH','FLOAT','FLOOD',
  'FLOOR','FLOUR','FLUID','FLUSH','FOCUS','FORCE','FORGE','FORTH','FORUM',
  'FOUND','FRAME','FRANK','FRAUD','FRESH','FRONT','FROST','FROZE','FRUIT',
  'FUNNY','GIANT','GIVEN','GLASS','GLEAM','GLOBE','GLOOM','GLORY','GLOVE',
  'GOING','GRACE','GRADE','GRAIN','GRAND','GRANT','GRAPH','GRASP','GRASS',
  'GRAVE','GREAT','GREEN','GREET','GRIEF','GRIND','GROSS','GROUP','GROWN',
  'GUARD','GUESS','GUEST','GUIDE','GUILD','GUILT','HAPPY','HEART','HEAVY',
  'HENCE','HONEY','HONOR','HORSE','HOTEL','HOUSE','HUMAN','HUMOR','HURRY',
  'IDEAL','IMAGE','IMPLY','INDEX','INDIA','INNER','INPUT','INTER','IRISH',
  'ISSUE','IVORY','JAPAN','JEWEL','JIMMY','JOINT','JONES','JUDGE','JUICE',
  'KNIFE','KNOCK','KNOWN','LABEL','LABOR','LARGE','LASER','LATER','LAUGH',
  'LAYER','LEARN','LEASE','LEAST','LEAVE','LEGAL','LEVEL','LEWIS','LIGHT',
  'LIMIT','LINEN','LIVER','LOCAL','LODGE','LOGIC','LOOSE','LOVER','LOWER',
  'LUCKY','LUNCH','MAGIC','MAJOR','MAKER','MANGA','MANOR','MAPLE','MARCH',
  'MASON','MATCH','MAYBE','MAYOR','MEDIA','MERCY','MERGE','MERIT','METAL',
  'METER','MIGHT','MINOR','MINUS','MIXED','MODEL','MONEY','MONTH','MORAL',
  'MOTOR','MOUNT','MOUSE','MOUTH','MOVED','MOVIE','MUSIC','NAIVE','NERVE',
  'NEVER','NEWLY','NIGHT','NOBLE','NOISE','NORTH','NOTED','NOVEL','NURSE',
  'OCCUR','OCEAN','OFFER','OFTEN','OPERA','ORDER','OTHER','OUGHT','OUTER',
  'OWNER','OXIDE','PAINT','PANEL','PANIC','PAPER','PARTY','PATCH','PAUSE',
  'PEACE','PEARL','PENNY','PHASE','PHONE','PHOTO','PIANO','PIECE','PILOT',
  'PITCH','PIXEL','PIZZA','PLACE','PLAIN','PLANE','PLANT','PLATE','PLAZA',
  'PLEAD','PLUMB','POINT','POLAR','POUND','POWER','PRESS','PRICE','PRIDE',
  'PRIME','PRINCE','PRINT','PRIOR','PRIZE','PROBE','PROOF','PROUD','PROVE',
  'PULSE','PUNCH','PUPIL','QUEEN','QUEST','QUEUE','QUICK','QUIET','QUITE',
  'QUOTA','QUOTE','RADAR','RADIO','RAISE','RALLY','RANCH','RANGE','RAPID',
  'RATIO','REACH','REACT','REALM','REBEL','REFER','REIGN','RELAX','RENEW',
  'REPAY','REPLY','RIDER','RIFLE','RIGHT','RIGID','RISEN','RISKY','RIVAL',
  'RIVER','ROBIN','ROBOT','ROCKY','ROGER','ROMAN','ROUGE','ROUGH','ROUND',
  'ROUTE','ROYAL','RUGBY','RULER','RURAL','SAFER','SAINT','SALAD','SCALE',
  'SCENE','SCOPE','SCORE','SCOUT','SCREW','SENSE','SERVE','SETUP','SEVEN',
  'SHALL','SHAME','SHAPE','SHARE','SHARK','SHARP','SHEEP','SHEER','SHELF',
  'SHELL','SHIFT','SHIRE','SHIRT','SHOCK','SHOOT','SHORT','SHOUT','SIGHT',
  'SIGMA','SINCE','SIXTH','SIXTY','SIZED','SKILL','SKULL','SLAVE','SLEEP',
  'SLICE','SLIDE','SLOPE','SMART','SMELL','SMILE','SMITH','SMOKE','SNAKE',
  'SOLAR','SOLID','SOLVE','SORRY','SOUND','SOUTH','SPACE','SPARE','SPEAK',
  'SPEED','SPEND','SPENT','SPIKE','SPINE','SPLIT','SPOKE','SPORT','SPRAY',
  'SQUAD','STACK','STAFF','STAGE','STAKE','STALL','STAMP','STAND','STARE',
  'START','STATE','STAYS','STEADY','STEAL','STEAM','STEEL','STEEP','STEER',
  'STEMS','STERN','STICK','STIFF','STILL','STOCK','STONE','STOOD','STORE',
  'STORM','STORY','STRAP','STRAW','STRAY','STRIP','STUCK','STUDY','STUFF',
  'STYLE','SUGAR','SUITE','SUNNY','SUPER','SURGE','SWAMP','SWEAR','SWEEP',
  'SWEET','SWEPT','SWIFT','SWING','SWISS','SWORD','SWORE','SWUNG','TABLE',
  'TAKEN','TASTE','TEACH','TEENS','TEETH','TEMPO','TENSE','TENTH','THEME',
  'THICK','THIEF','THING','THINK','THIRD','THOSE','THREE','THREW','THROW',
  'THUMB','TIGER','TIGHT','TIMER','TIRED','TITLE','TODAY','TOKEN','TOTAL',
  'TOUCH','TOUGH','TOWER','TOXIC','TRACE','TRACK','TRADE','TRAIL','TRAIN',
  'TRAIT','TRASH','TREAT','TREND','TRIAL','TRIBE','TRICK','TRIED','TRIPS',
  'TROOP','TRUCK','TRULY','TRUMP','TRUNK','TRUST','TRUTH','TUMOR','TWICE',
  'TWIST','ULTRA','UNCLE','UNDER','UNION','UNITE','UNITY','UNTIL','UPPER',
  'UPSET','URBAN','USAGE','USUAL','UTTER','VALID','VALUE','VIDEO','VIGOR',
  'VINYL','VIRAL','VIRUS','VISIT','VITAL','VIVID','VOCAL','VODKA','VOICE',
  'VOTER','WAGON','WASTE','WATCH','WATER','WEAVE','WEIGH','WEIRD','WHEAT',
  'WHEEL','WHERE','WHICH','WHILE','WHITE','WHOLE','WHOSE','WIDER','WOMAN',
  'WORLD','WORRY','WORSE','WORST','WORTH','WOULD','WOUND','WRATH','WRITE',
  'WRONG','WROTE','YACHT','YOUNG','YOUTH',
  'AT','BE','BY','DO','GO','HE','IF','IN','IS','IT','ME','MY','NO','OF',
  'ON','OR','SO','TO','UP','US','WE','AM','AN','AS','AX',
  'SCHOOL','PENCIL','ERASER','TEACHER','STUDENT','LESSON','NUMBER',
  'PLANET','ANSWER','FRIEND','SUMMER','WINTER','SPRING','AUTUMN',
  'ORANGE','PURPLE','YELLOW','SILVER','GARDEN','JUNGLE','DESERT',
  'FOREST','ISLAND','BRIDGE','CASTLE','CHURCH','MARKET','MUSEUM',
  'PALACE','PRISON','STREET','TEMPLE','THRONE','TUNNEL','VALLEY',
  'WEAPON','WINDOW','WONDER','LETTER','MOTHER','FATHER','SISTER',
  'BROTHER','DANGER','DINNER','DOCTOR','DRAGON','ENGINE','FAMILY',
  'FINGER','FLOWER','FROZEN','GOLDEN','GROUND','HEALTH','HEAVEN',
  'HELPED','HIDDEN','HONEST','HUNGER','HUNTER','INSECT','JUNGLE',
  'KNIGHT','LEADER','LISTEN','LONDON','LOVELY','MANNER','MENTAL',
  'MIRROR','MODERN','MONKEY','MOTION','MURDER','MUSCLE','NATURE',
  'NOTICE','OBJECT','OFFICE','ONLINE','OPTION','OUTPUT','PARENT',
  'PATROL','PERMIT','PHRASE','PIRATE','POCKET','POISON','POLICE',
  'POTATO','POWDER','PRAYER','PRIEST','PROFIT','PROMPT','RABBIT',
  'RANDOM','RANGER','REASON','RECIPE','RECORD','REFORM','REGION',
  'RELIEF','REMAIN','REMOTE','REMOVE','REPAIR','REPEAT','REPORT',
  'RESCUE','RESIST','RESULT','RETIRE','RETURN','REVEAL','REVIEW',
  'REWARD','RITUAL','ROCKET','ROTATE','RUBBER','RULING','RUNNER',
  'SACRED','SAFETY','SAILOR','SAMPLE','SAVING','SCHEME','SCREEN',
  'SCRIPT','SEARCH','SEASON','SECRET','SECTOR','SECURE','SELECT',
  'SENIOR','SERIAL','SERVER','SETTLE','SHADOW','SHIELD','SIGNAL',
  'SILENT','SILVER','SIMPLE','SINGER','SINGLE','SLIGHT','SMOOTH',
  'SOCCER','SOCIAL','SOCKET','SOFTEN','SOLELY','SOLIDS','SOURCE',
  'SPEECH','SPIDER','SPIRIT','SPLASH','SPOKEN','SPREAD','SQUARE',
  'STABLE','STATUS','STEADY','STOLEN','STRAIN','STRAND','STREAM',
  'STRESS','STRICT','STRIKE','STRING','STROKE','STRONG','STRUCK',
  'STUDIO','STUPID','SUBMIT','SUDDEN','SUMMIT','SUPPLY','SURELY',
  'SURVEY','SWITCH','SYMBOL','SYNTAX','SYSTEM','TABLET','TALENT',
  'TARGET','TEMPLE','TENDER','TENNIS','TERROR','THANKS','THEORY',
  'THREAT','THRONE','TICKET','TIMBER','TISSUE','TONGUE','TOWARD',
  'TRAVEL','TREATY','TRIBAL','TRICKY','TROPHY','TUNNEL','TURTLE',
  'TWELVE','UNFAIR','UNIQUE','UNITED','UNLIKE','UNLOCK','UNREST',
  'UPDATE','UPHOLD','UPLOAD','USEFUL','VALLEY','VENDOR','VERBAL',
  'VERSUS','VESSEL','VIEWER','VIRGIN','VISION','VISUAL','VOLUME',
  'WALKER','WARMTH','WEEKLY','WEIGHT','WIDELY','WICKED','WINDOW',
  'WINNER','WINTER','WISDOM','WITHIN','WONDER','WOODEN','WORKER',
  'WORTHY','WRITER','YEARLY','ZOMBIE'
]);

type CellType = 'normal' | 'dl' | 'tl' | 'dw' | 'tw' | 'center';

const BOARD_SIZE = 15;

function getBonusType(r: number, c: number): CellType {
  if (r === 7 && c === 7) return 'center';
  // TW
  if (
    (r === 0 || r === 14) && (c === 0 || c === 7 || c === 14) ||
    (r === 7 && (c === 0 || c === 14))
  ) return 'tw';
  // DW
  const dwPositions = [[1,1],[2,2],[3,3],[4,4],[10,10],[11,11],[12,12],[13,13],
    [1,13],[2,12],[3,11],[4,10],[13,1],[12,2],[11,3],[10,4]];
  if (dwPositions.some(([pr,pc]) => pr === r && pc === c)) return 'dw';
  // TL
  const tlPositions = [[1,5],[1,9],[5,1],[5,5],[5,9],[5,13],
    [9,1],[9,5],[9,9],[9,13],[13,5],[13,9]];
  if (tlPositions.some(([pr,pc]) => pr === r && pc === c)) return 'tl';
  // DL
  const dlPositions = [[0,3],[0,11],[2,6],[2,8],[3,0],[3,7],[3,14],
    [6,2],[6,6],[6,8],[6,12],[7,3],[7,11],
    [8,2],[8,6],[8,8],[8,12],[11,0],[11,7],[11,14],
    [12,6],[12,8],[14,3],[14,11]];
  if (dlPositions.some(([pr,pc]) => pr === r && pc === c)) return 'dl';
  return 'normal';
}

const BONUS_COLORS: Record<CellType, { bg: string; text: string; label: string }> = {
  normal: { bg: 'rgba(255,255,255,0.04)', text: '#64748b', label: '' },
  dl: { bg: 'rgba(56,189,248,0.15)', text: '#38bdf8', label: 'DL' },
  tl: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'TL' },
  dw: { bg: 'rgba(244,114,182,0.15)', text: '#f472b6', label: 'DW' },
  tw: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'TW' },
  center: { bg: 'rgba(250,204,21,0.15)', text: '#facc15', label: '★' },
};

interface PlacedTile {
  letter: string;
  isNew: boolean;
}

function drawTiles(count: number): string[] {
  const bag = LETTER_DIST.split('');
  const tiles: string[] = [];
  for (let i = 0; i < count && bag.length > 0; i++) {
    const idx = Math.floor(Math.random() * bag.length);
    tiles.push(bag.splice(idx, 1)[0]);
  }
  return tiles;
}

function getWordsFormed(board: (PlacedTile | null)[][]): { word: string; cells: [number, number][] }[] {
  const words: { word: string; cells: [number, number][] }[] = [];

  // Horizontal words
  for (let r = 0; r < BOARD_SIZE; r++) {
    let c = 0;
    while (c < BOARD_SIZE) {
      if (board[r][c]) {
        const cells: [number, number][] = [];
        let word = '';
        while (c < BOARD_SIZE && board[r][c]) {
          word += board[r][c]!.letter;
          cells.push([r, c]);
          c++;
        }
        if (word.length >= 2) words.push({ word, cells });
      }
      c++;
    }
  }

  // Vertical words
  for (let c = 0; c < BOARD_SIZE; c++) {
    let r = 0;
    while (r < BOARD_SIZE) {
      if (board[r][c]) {
        const cells: [number, number][] = [];
        let word = '';
        while (r < BOARD_SIZE && board[r][c]) {
          word += board[r][c]!.letter;
          cells.push([r, c]);
          r++;
        }
        if (word.length >= 2) words.push({ word, cells });
      }
      r++;
    }
  }

  return words;
}

export default function ScrabblePage() {
  const [gameMode, setGameMode] = useState<'lobby' | 'matching' | 'playing'>('lobby');
  const [opponentType, setOpponentType] = useState<'solo' | 'ai' | 'local' | 'matchmaker'>('solo');
  const [matchedOpponent, setMatchedOpponent] = useState('Computer (AI)');
  
  const [turn, setTurn] = useState(0); // 0 = Player 1, 1 = Player 2
  const [scores, setScores] = useState([0, 0]); // [player1, player2]
  const [racks, setRacks] = useState<string[][]>(() => [drawTiles(7), drawTiles(7)]);

  const [board, setBoard] = useState<(PlacedTile | null)[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
  );
  const [selectedRackIdx, setSelectedRackIdx] = useState<number | null>(null);
  const [turnScore, setTurnScore] = useState(0);
  const [message, setMessage] = useState('Place tiles on the board and submit your word!');
  const [placedThisTurn, setPlacedThisTurn] = useState<[number, number][]>([]);
  const [wordsPlayed, setWordsPlayed] = useState<string[]>([]);

  // Dynamically derive current player rack and score
  const rack = racks[turn] || [];
  const score = scores[turn] || 0;

  const setRack = useCallback((updater: string[] | ((prev: string[]) => string[])) => {
    setRacks(prev => {
      const next = prev.map(r => [...r]);
      if (typeof updater === 'function') {
        next[turn] = updater(next[turn]);
      } else {
        next[turn] = updater;
      }
      return next;
    });
  }, [turn]);

  const setScore = useCallback((updater: number | ((prev: number) => number)) => {
    setScores(prev => {
      const next = [...prev];
      if (typeof updater === 'function') {
        next[turn] = updater(next[turn]);
      } else {
        next[turn] = updater;
      }
      return next;
    });
  }, [turn]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (board[r][c] && !board[r][c]!.isNew) return;

    if (board[r][c]?.isNew) {
      // Pick up the tile
      const letter = board[r][c]!.letter;
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = null;
      setBoard(newBoard);
      setRack(prev => [...prev, letter]);
      setPlacedThisTurn(prev => prev.filter(([pr, pc]) => !(pr === r && pc === c)));
      return;
    }

    if (selectedRackIdx === null) return;

    const letter = rack[selectedRackIdx];
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = { letter, isNew: true };
    setBoard(newBoard);

    const newRack = [...rack];
    newRack.splice(selectedRackIdx, 1);
    setRack(newRack);
    setSelectedRackIdx(null);
    setPlacedThisTurn(prev => [...prev, [r, c]]);
  }, [board, rack, selectedRackIdx]);

  const calculateTurnScore = useCallback((): { score: number; words: string[] } => {
    if (placedThisTurn.length === 0) return { score: 0, words: [] };

    const newWords = getWordsFormed(board).filter(({ cells }) =>
      cells.some(([cr, cc]) => placedThisTurn.some(([pr, pc]) => pr === cr && pc === cc))
    );

    let total = 0;
    const validWords: string[] = [];

    for (const { word, cells } of newWords) {
      if (!VALID_WORDS.has(word.toUpperCase())) continue;
      let wordScore = 0;
      let wordMultiplier = 1;

      for (const [cr, cc] of cells) {
        const tile = board[cr][cc]!;
        let letterScore = LETTER_VALUES[tile.letter] || 0;
        const bonus = getBonusType(cr, cc);

        if (tile.isNew) {
          if (bonus === 'dl') letterScore *= 2;
          if (bonus === 'tl') letterScore *= 3;
          if (bonus === 'dw' || bonus === 'center') wordMultiplier *= 2;
          if (bonus === 'tw') wordMultiplier *= 3;
        }
        wordScore += letterScore;
      }

      total += wordScore * wordMultiplier;
      validWords.push(word);
    }

    if (placedThisTurn.length === 7) total += 50; // bonus

    return { score: total, words: validWords };
  }, [board, placedThisTurn]);

  const previewScore = useMemo(() => calculateTurnScore(), [calculateTurnScore]);

  const handleSubmit = useCallback(() => {
    if (placedThisTurn.length === 0) {
      setMessage('Place at least one tile!');
      return;
    }

    // Check tiles are in a line
    const rows = placedThisTurn.map(([r]) => r);
    const cols = placedThisTurn.map(([, c]) => c);
    const isHorizontal = new Set(rows).size === 1;
    const isVertical = new Set(cols).size === 1;

    if (!isHorizontal && !isVertical) {
      setMessage('Tiles must be placed in a single row or column!');
      return;
    }

    // Check all formed words are valid
    const formedWords = getWordsFormed(board).filter(({ cells }) =>
      cells.some(([cr, cc]) => placedThisTurn.some(([pr, pc]) => pr === cr && pc === cc))
    );

    const invalidWords = formedWords.filter(({ word }) => !VALID_WORDS.has(word.toUpperCase()));
    if (invalidWords.length > 0) {
      setMessage(`Invalid word(s): ${invalidWords.map(w => w.word).join(', ')}`);
      return;
    }

    if (formedWords.length === 0) {
      setMessage('No valid words formed!');
      return;
    }

    const { score: turnPts, words } = calculateTurnScore();

    // Lock tiles
    const newBoard = board.map(row => row.map(cell =>
      cell ? { ...cell, isNew: false } : null
    ));
    setBoard(newBoard);
    setScore(prev => prev + turnPts);
    setPlacedThisTurn([]);
    setWordsPlayed(prev => [...prev, ...words]);
    setMessage(`+${turnPts} points! Words: ${words.join(', ')}`);

    // Draw new tiles
    const needed = 7 - rack.length;
    if (needed > 0) {
      setRack(prev => [...prev, ...drawTiles(needed)]);
    }

    if (opponentType !== 'solo') {
      const nextTurn = turn === 0 ? 1 : 0;
      setTurn(nextTurn);
      if (opponentType === 'local') {
        setMessage(`+${turnPts} points! Turn changed to Player 2.`);
      } else {
        setMessage(`+${turnPts} points! ${matchedOpponent} is thinking...`);
      }
    }
  }, [board, placedThisTurn, rack, calculateTurnScore, opponentType, turn, matchedOpponent]);

  const handleRecall = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    const returnedLetters: string[] = [];

    for (const [r, c] of placedThisTurn) {
      if (newBoard[r][c]?.isNew) {
        returnedLetters.push(newBoard[r][c]!.letter);
        newBoard[r][c] = null;
      }
    }

    // Since we need to update the active rack, we can use functional updates
    setRacks(prev => {
      const next = prev.map(rk => [...rk]);
      next[turn] = [...next[turn], ...returnedLetters];
      return next;
    });
    setBoard(newBoard);
    setPlacedThisTurn([]);
    setMessage('Tiles recalled to rack.');
  }, [board, placedThisTurn, turn]);

  const handleShuffle = useCallback(() => {
    setRacks(prev => {
      const next = prev.map(rk => [...rk]);
      const shuffled = [...next[turn]];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      next[turn] = shuffled;
      return next;
    });
  }, [turn]);

  const handleNewGame = useCallback(() => {
    setBoard(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)));
    setRacks([drawTiles(7), drawTiles(7)]);
    setScores([0, 0]);
    setTurn(0);
    setSelectedRackIdx(null);
    setTurnScore(0);
    setMessage('Place tiles on the board and submit your word!');
    setPlacedThisTurn([]);
    setWordsPlayed([]);
  }, []);

  const startMode = (type: 'solo' | 'ai' | 'local' | 'matchmaker') => {
    setOpponentType(type);
    setBoard(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)));
    setRacks([drawTiles(7), drawTiles(7)]);
    setScores([0, 0]);
    setTurn(0);
    setSelectedRackIdx(null);
    setTurnScore(0);
    setMessage('Place tiles on the board and submit your word!');
    setPlacedThisTurn([]);
    setWordsPlayed([]);
    
    if (type === 'matchmaker') {
      setGameMode('matching');
    } else {
      setMatchedOpponent(type === 'ai' ? 'Computer (AI)' : 'Player 2 (Local)');
      setGameMode('playing');
    }
  };

  // Matchmaking simulator
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

  // AI simulated Turn loop
  useEffect(() => {
    const isBotTurn = turn === 1 && (opponentType === 'ai' || opponentType === 'matchmaker');
    if (isBotTurn && gameMode === 'playing') {
      const timer = setTimeout(() => {
        const wordsArray = Array.from(VALID_WORDS);
        const word = wordsArray[Math.floor(Math.random() * wordsArray.length)];
        
        let pts = 0;
        for (const letter of word) {
          pts += LETTER_VALUES[letter] || 1;
        }

        setScores(prev => {
          const next = [...prev];
          next[1] += pts;
          return next;
        });
        setWordsPlayed(prev => [...prev, word]);
        setTurn(0);
        setMessage(`${matchedOpponent} played "${word}" for +${pts} points! Your turn.`);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [turn, opponentType, gameMode, matchedOpponent]);

  const cellSize = 38;

  if (gameMode === 'lobby') {
    return (
      <GameLayout title="Scrabble Lobby" icon={<ALargeSmall size={24} />} score={0} accentColor="#ec4899">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '62vh', gap: '32px', color: '#0f172a', textAlign: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#000000', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
              📚 Scrabble Play Zone
            </h2>
            <p style={{ color: '#475569', fontSize: '15px', maxWidth: '500px', fontWeight: 600, margin: '0 auto' }}>
              Place letter tiles on the grid to form words. Practice solo, play against the computer, or challenge classmate cohorts!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { type: 'solo', title: 'Solo Practice', desc: 'High-score training mode', icon: Sparkles, color: '#ec4899' },
              { type: 'ai', title: 'Play vs Computer', desc: 'Scrabble AI system', icon: Monitor, color: '#3b82f6' },
              { type: 'local', title: 'Pass & Play', desc: 'Local 2-player mode', icon: Users, color: '#22c55e' },
              { type: 'matchmaker', title: 'Grade Matchmaking', desc: 'Find other grades', icon: User, color: '#f59e0b' }
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
                <m.icon size={36} style={{ color: m.color }} />
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
      <GameLayout title="Matchmaking" icon={<ALargeSmall size={24} />} score={0} accentColor="#ec4899">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '62vh', gap: '32px', color: '#0f172a', textAlign: 'center'
        }}>
          <div className="radar-container" style={{
            position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="pulse" style={{
              position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
              border: '3px solid #ec4899', animation: 'ping 1.5s infinite ease-out'
            }} />
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #000000',
              background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '3px 3px 0px #000000', zIndex: 2
            }}>
              <Users size={32} color="#ec4899" />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px 0' }}>Searching for matches...</h3>
            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 700 }}>Finding students in Grade 4, 5, or 6 to pair on the board...</p>
          </div>
          <button
            onClick={() => setGameMode('lobby')}
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
    <GameLayout title="Scrabble" icon={<ALargeSmall size={24} />} score={score} accentColor="#ec4899">
      {/* Top Header Controls */}
      <div style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#1e293b', padding: '12px 24px', borderRadius: '16px', border: '3px solid #000000',
        boxShadow: '4px 4px 0px #000000', marginBottom: '24px', boxSizing: 'border-box', color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800 }}>Mode: {opponentType.toUpperCase()}</span>
          {opponentType !== 'solo' && (
            <span style={{ fontSize: '13px', fontWeight: 800, color: turn === 0 ? '#10b981' : '#f59e0b' }}>
              • {turn === 0 ? 'Your Turn' : `${matchedOpponent}'s Turn`}
            </span>
          )}
        </div>
        <button
          onClick={() => setGameMode('lobby')}
          style={{
            padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: '2px solid #000000',
            borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
          }}
        >
          Quit Game
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Board */}
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
            gap: '2px',
            background: 'rgba(255,255,255,0.06)',
            padding: '8px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {board.map((row, r) =>
              row.map((cell, c) => {
                const bonus = getBonusType(r, c);
                const bonusInfo = BONUS_COLORS[bonus];
                const isPlacedThisTurn = placedThisTurn.some(([pr, pc]) => pr === r && pc === c);

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: cell ? '16px' : '8px',
                      fontWeight: cell ? 800 : 600,
                      color: cell
                        ? (isPlacedThisTurn ? '#fbbf24' : '#f8fafc')
                        : bonusInfo.text,
                      background: cell
                        ? (isPlacedThisTurn
                          ? 'linear-gradient(135deg, #92400e, #78350f)'
                          : 'linear-gradient(135deg, #1e40af, #1e3a5f)')
                        : bonusInfo.bg,
                      border: isPlacedThisTurn
                        ? '2px solid #fbbf24'
                        : '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.15s',
                      position: 'relative',
                      userSelect: 'none',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {cell ? (
                      <>
                        {cell.letter}
                        <span style={{
                          position: 'absolute',
                          bottom: '1px',
                          right: '3px',
                          fontSize: '7px',
                          fontWeight: 700,
                          color: isPlacedThisTurn ? '#fcd34d' : '#94a3b8',
                          opacity: 0.8
                        }}>
                          {LETTER_VALUES[cell.letter]}
                        </span>
                      </>
                    ) : (
                      bonusInfo.label
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Tile Rack */}
          <div style={{
            marginTop: '16px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            {rack.map((letter, i) => (
              <div
                key={`${letter}-${i}`}
                onClick={() => setSelectedRackIdx(selectedRackIdx === i ? null : i)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: selectedRackIdx === i
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #92400e, #78350f)',
                  color: selectedRackIdx === i ? '#1e293b' : '#fbbf24',
                  border: selectedRackIdx === i
                    ? '2px solid #fcd34d'
                    : '2px solid rgba(251,191,36,0.3)',
                  transform: selectedRackIdx === i ? 'translateY(-6px) scale(1.1)' : 'none',
                  transition: 'all 0.2s',
                  boxShadow: selectedRackIdx === i
                    ? '0 8px 20px rgba(245,158,11,0.4)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                  position: 'relative',
                  textTransform: 'uppercase'
                }}
              >
                {letter}
                <span style={{
                  position: 'absolute',
                  bottom: '3px',
                  right: '5px',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: selectedRackIdx === i ? '#78350f' : '#d97706',
                  opacity: 0.8
                }}>
                  {LETTER_VALUES[letter]}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{
            marginTop: '12px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleSubmit}
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)'
              }}
            >
              <Sparkles size={16} /> Submit Word {previewScore.score > 0 && `(+${previewScore.score})`}
            </button>
            <button
              onClick={handleRecall}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.06)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <RotateCcw size={16} /> Recall
            </button>
            <button
              onClick={handleShuffle}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.06)',
                color: '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              Shuffle
            </button>
            <button
              onClick={handleNewGame}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(239,68,68,0.3)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                transition: 'all 0.2s'
              }}
            >
              New Game
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Message */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e2e8f0',
            fontSize: '14px',
            lineHeight: 1.5
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Lightbulb size={16} style={{ color: '#fbbf24' }} />
              <span style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Status</span>
            </div>
            {message}
          </div>

          {/* Legend */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h3 style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>
              Board Legend
            </h3>
            {(['dl', 'tl', 'dw', 'tw'] as CellType[]).map(type => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background: BONUS_COLORS[type].bg,
                  color: BONUS_COLORS[type].text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 700
                }}>
                  {BONUS_COLORS[type].label}
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {type === 'dl' && 'Double Letter'}
                  {type === 'tl' && 'Triple Letter'}
                  {type === 'dw' && 'Double Word'}
                  {type === 'tw' && 'Triple Word'}
                </span>
              </div>
            ))}
          </div>

          {/* Words Played */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            flex: 1,
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <h3 style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>
              Words Played ({wordsPlayed.length})
            </h3>
            {wordsPlayed.length === 0 ? (
              <p style={{ color: '#475569', fontSize: '13px', fontStyle: 'italic' }}>No words yet...</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {wordsPlayed.map((word, i) => (
                  <span key={i} style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(236,72,153,0.12)',
                    color: '#f472b6',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
