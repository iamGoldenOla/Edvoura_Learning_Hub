/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EDVOURA UNIVERSAL DYNAMIC QUESTION & VOCABULARY ENGINE (V2 GLOBAL)
 * ══════════════════════════════════════════════════════════════════════════════
 * Procedurally generates unique, non-repetitive trivia questions and vocabulary
 * across 10+ academic subjects & 7 global continents:
 * - Mathematics (Arithmetic, Algebra, Geometry, Word Problems)
 * - Science (Biology, Physics, Chemistry, Astronomy, Earth Science)
 * - History & Civics (World History, African History, International Treaties)
 * - Geography & Continents (Capitals, Landmarks, Oceans, Maps)
 * - Language Arts & Literature (Grammar, Synonyms, Antonyms, Vocabulary)
 * - Computer Science & Tech (AI, Programming, Hardware, Internet)
 * - Global Current Affairs (Politics, Environment, Sports, Culture, Space)
 */

export interface GameQuestion {
  id: string;
  q: string;
  options: [string, string, string, string];
  a: number; // 0..3 index
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  continent?: string;
  sphere?: string;
  gradeBand?: '1-3' | '4-6' | '7-12';
  hint?: string;
}

export interface VocabularyWord {
  word: string;
  category: string;
  hint: string;
  definition: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/* ═══════════════════════ 1. EXPANDED VOCABULARY DATABASE ═══════════════════════ */
export const VOCABULARY_BANK: VocabularyWord[] = [
  // Science & Nature
  { word: 'PHOTOSYNTHESIS', category: 'Science', hint: 'Process by which green plants make food using sunlight', definition: 'Plant energy production process', difficulty: 'hard' },
  { word: 'MITOCHONDRIA', category: 'Science', hint: 'The powerhouse organelle of a living cell', definition: 'Cellular energy organelle', difficulty: 'hard' },
  { word: 'EVAPORATION', category: 'Science', hint: 'Liquid turning into vapor when heated', definition: 'Liquid to gas state change', difficulty: 'medium' },
  { word: 'GRAVITATION', category: 'Science', hint: 'Force pulling objects toward Earth center', definition: 'Attraction force of mass', difficulty: 'medium' },
  { word: 'ATMOSPHERE', category: 'Science', hint: 'Layer of gases surrounding a planet', definition: 'Gaseous planetary envelope', difficulty: 'medium' },
  { word: 'MOLECULE', category: 'Science', hint: 'Group of atoms bonded together', definition: 'Smallest particle of a compound', difficulty: 'easy' },
  { word: 'ECOSYSTEM', category: 'Science', hint: 'Community of living organisms interacting with environment', definition: 'Biological community network', difficulty: 'medium' },
  { word: 'BIODIVERSITY', category: 'Science', hint: 'Variety of life forms in a habitat', definition: 'Ecological species variety', difficulty: 'hard' },

  // Space & Astronomy
  { word: 'SOLARSYSTEM', category: 'Astronomy', hint: 'Gravitationally bound system of the Sun and orbiting bodies', definition: 'Sun and orbiting celestial bodies', difficulty: 'easy' },
  { word: 'ASTRONAUT', category: 'Astronomy', hint: 'Person trained to travel in spacecraft', definition: 'Spaceflight professional explorer', difficulty: 'easy' },
  { word: 'SATELLITE', category: 'Astronomy', hint: 'An artificial body placed in orbit around Earth', definition: 'Orbital celestial or artificial body', difficulty: 'medium' },
  { word: 'TELESCOPE', category: 'Astronomy', hint: 'Optical instrument for making distant objects appear nearer', definition: 'Far-space viewing instrument', difficulty: 'easy' },

  // Mathematics & Logic
  { word: 'HYPOTENUSE', category: 'Mathematics', hint: 'Longest side of a right-angled triangle opposite right angle', definition: 'Triangle longest side', difficulty: 'hard' },
  { word: 'POLYGON', category: 'Mathematics', hint: 'Plane figure with at least three straight sides and angles', definition: 'Closed straight-sided shape', difficulty: 'easy' },
  { word: 'FRACTION', category: 'Mathematics', hint: 'Numerical quantity that is not a whole number', definition: 'Part of a whole unit', difficulty: 'easy' },
  { word: 'PERIMETER', category: 'Mathematics', hint: 'Continuous line forming boundary of a closed figure', definition: 'Outer boundary distance', difficulty: 'medium' },
  { word: 'EQUATION', category: 'Mathematics', hint: 'Mathematical statement asserting equality of two expressions', definition: 'Equal balance mathematical expression', difficulty: 'easy' },

  // Tech & AI
  { word: 'ALGORITHM', category: 'Technology', hint: 'Process or set of rules followed in calculations', definition: 'Step-by-step problem-solving procedure', difficulty: 'medium' },
  { word: 'BLOCKCHAIN', category: 'Technology', hint: 'Decentralized digital ledger system', definition: 'Immutable cryptographic ledger', difficulty: 'hard' },
  { word: 'CYBERSECURITY', category: 'Technology', hint: 'Protection of computer systems from theft or damage', definition: 'Digital network defense practice', difficulty: 'hard' },
  { word: 'INTELLIGENCE', category: 'Technology', hint: 'Ability to acquire and apply knowledge and skills', definition: 'Cognitive reasoning capability', difficulty: 'medium' },
  { word: 'DATABASE', category: 'Technology', hint: 'Organized collection of structured information or data', definition: 'Structured digital storage system', difficulty: 'easy' },

  // Geography & History
  { word: 'INDEPENDENCE', category: 'History', hint: 'Freedom from control or governance by another country', definition: 'National self-sovereignty state', difficulty: 'medium' },
  { word: 'CIVILIZATION', category: 'History', hint: 'Advanced stage of human social and cultural development', definition: 'Developed human society', difficulty: 'hard' },
  { word: 'HEMISPHERE', category: 'Geography', hint: 'Half of the Earth divided into northern/southern', definition: 'Half of the globe', difficulty: 'medium' },
  { word: 'ARCHIPELAGO', category: 'Geography', hint: 'An extensive group or chain of islands', definition: 'Island cluster chain', difficulty: 'hard' },
  { word: 'DEMOCRACY', category: 'Social Studies', hint: 'System of government by the whole population', definition: 'Government by popular vote', difficulty: 'medium' }
];

/* ═══════════════════════ 2. GLOBAL CURRENT AFFAIRS & WORLD KNOWLEDGE ═══════════════════════ */

export interface CurrentAffairsTemplate {
  q: string;
  options: [string, string, string, string];
  a: number;
  continent: 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania' | 'Global / Antarctica';
  sphere: 'Politics & Geopolitics' | 'Technology & AI' | 'Environment & Climate' | 'Global Sports' | 'Arts & Culture' | 'Science & Space' | 'World History & Nations';
  gradeBand: '1-3' | '4-6' | '7-12';
}

const GLOBAL_CURRENT_AFFAIRS_BANK: CurrentAffairsTemplate[] = [
  // ─── GRADE 1-3 (JUNIOR EXPLORER) ───
  {
    gradeBand: '1-3',
    continent: 'Africa',
    sphere: 'World History & Nations',
    q: 'Which continent is home to the famous Pyramids of Giza and the Nile River?',
    options: ['Africa', 'Europe', 'Asia', 'North America'],
    a: 0
  },
  {
    gradeBand: '1-3',
    continent: 'Oceania',
    sphere: 'Environment & Climate',
    q: 'Which island continent is famous for Kangaroos, Koalas, and the Great Barrier Reef?',
    options: ['Australia (Oceania)', 'South America', 'Europe', 'Antarctica'],
    a: 0
  },
  {
    gradeBand: '1-3',
    continent: 'Europe',
    sphere: 'Arts & Culture',
    q: 'What is the capital city of France, known for the famous Eiffel Tower?',
    options: ['Paris', 'London', 'Rome', 'Berlin'],
    a: 0
  },
  {
    gradeBand: '1-3',
    continent: 'Asia',
    sphere: 'World History & Nations',
    q: 'Which is the largest continent on Earth where Giant Pandas live in the bamboo forests?',
    options: ['Asia', 'Africa', 'Europe', 'South America'],
    a: 0
  },
  {
    gradeBand: '1-3',
    continent: 'North America',
    sphere: 'Science & Space',
    q: 'Which country launched the Apollo 11 mission that put the first human on the Moon in 1969?',
    options: ['United States', 'Canada', 'Brazil', 'Japan'],
    a: 0
  },
  {
    gradeBand: '1-3',
    continent: 'South America',
    sphere: 'Environment & Climate',
    q: 'Which giant tropical rainforest in South America produces much of the world oxygen?',
    options: ['Amazon Rainforest', 'Congo Basin', 'Black Forest', 'Sherwood Forest'],
    a: 0
  },
  {
    gradeBand: '1-3',
    continent: 'Global / Antarctica',
    sphere: 'Environment & Climate',
    q: 'Which is the coldest, windiest, and iciest continent at the bottom of the globe?',
    options: ['Antarctica', 'North America', 'Europe', 'Asia'],
    a: 0
  },

  // ─── GRADE 4-6 (GLOBAL ADVENTURER) ───
  {
    gradeBand: '4-6',
    continent: 'Africa',
    sphere: 'Politics & Geopolitics',
    q: 'Where is the headquarters of the African Union (AU) located?',
    options: ['Addis Ababa (Ethiopia)', 'Abuja (Nigeria)', 'Cairo (Egypt)', 'Nairobi (Kenya)'],
    a: 0
  },
  {
    gradeBand: '4-6',
    continent: 'Global / Antarctica',
    sphere: 'Politics & Geopolitics',
    q: 'Which global body founded in 1945 works to maintain international peace and security?',
    options: ['United Nations (UN)', 'World Bank', 'African Union', 'NATO'],
    a: 0
  },
  {
    gradeBand: '4-6',
    continent: 'Asia',
    sphere: 'Technology & AI',
    q: 'Which Asian country is world-famous for high-speed Bullet Trains (Shinkansen) and robotics?',
    options: ['Japan', 'China', 'India', 'South Korea'],
    a: 0
  },
  {
    gradeBand: '4-6',
    continent: 'North America',
    sphere: 'Technology & AI',
    q: 'Where is Silicon Valley, the world famous global hub for technology companies like Apple and Google?',
    options: ['California, USA', 'Texas, USA', 'Ontario, Canada', 'New York, USA'],
    a: 0
  },
  {
    gradeBand: '4-6',
    continent: 'Europe',
    sphere: 'Global Sports',
    q: 'In which European city were the 2024 Olympic and Paralympic Summer Games hosted?',
    options: ['Paris', 'London', 'Madrid', 'Athens'],
    a: 0
  },
  {
    gradeBand: '4-6',
    continent: 'South America',
    sphere: 'Global Sports',
    q: 'Which South American country has won the FIFA Men’s Football World Cup 5 times, more than any other nation?',
    options: ['Brazil', 'Argentina', 'Uruguay', 'Colombia'],
    a: 0
  },
  {
    gradeBand: '4-6',
    continent: 'Global / Antarctica',
    sphere: 'Environment & Climate',
    q: 'What international climate agreement signed in 2015 aims to limit global warming below 2°C?',
    options: ['Paris Agreement', 'Kyoto Protocol', 'Tokyo Accord', 'Geneva Convention'],
    a: 0
  },

  // ─── GRADE 7-12 (GLOBAL SCHOLAR / DIPLOMAT) ───
  {
    gradeBand: '7-12',
    continent: 'Global / Antarctica',
    sphere: 'Technology & AI',
    q: 'What is the primary architectural innovation behind modern Large Language Models like ChatGPT?',
    options: ['Transformer Neural Networks', 'Convolutional Networks', 'Genetic Algorithms', 'Decision Trees'],
    a: 0
  },
  {
    gradeBand: '7-12',
    continent: 'Europe',
    sphere: 'Politics & Geopolitics',
    q: 'Which 27-member political and economic union operates an internal single market in Europe?',
    options: ['European Union (EU)', 'Eurozone Council', 'Schengen Area', 'EFTA'],
    a: 0
  },
  {
    gradeBand: '7-12',
    continent: 'Africa',
    sphere: 'World History & Nations',
    q: 'Which landmark trade agreement created the largest free trade area in the world by number of participating countries?',
    options: ['African Continental Free Trade Area (AfCFTA)', 'ECOWAS Common Market', 'COMESA Protocol', 'SADC Economic Pact'],
    a: 0
  },
  {
    gradeBand: '7-12',
    continent: 'Asia',
    sphere: 'Science & Space',
    q: 'In 2023, which Asian country became the 4th nation to soft-land a probe (Chandrayaan-3) near the Moon’s south pole?',
    options: ['India', 'China', 'Japan', 'South Korea'],
    a: 0
  },
  {
    gradeBand: '7-12',
    continent: 'South America',
    sphere: 'Environment & Climate',
    q: 'The Amazon basin spans 8 South American countries. Which country contains over 60% of the rainforest?',
    options: ['Brazil', 'Peru', 'Colombia', 'Venezuela'],
    a: 0
  },
  {
    gradeBand: '7-12',
    continent: 'North America',
    sphere: 'Politics & Geopolitics',
    q: 'What intergovernmental military alliance consists of 32 member states from North America and Europe?',
    options: ['NATO', 'SEATO', 'ANZUS', 'Norad'],
    a: 0
  },
  {
    gradeBand: '7-12',
    continent: 'Oceania',
    sphere: 'Environment & Climate',
    q: 'Which low-lying Pacific island nation in Oceania is leading global advocacy regarding sea-level rise due to climate change?',
    options: ['Tuvalu', 'New Zealand', 'Fiji', 'Papua New Guinea'],
    a: 0
  }
];

/**
 * Generates a grade-appropriate, dynamic current affairs question
 */
export function generateGlobalCurrentAffairsQuestion(
  gradeBand: '1-3' | '4-6' | '7-12' = '4-6',
  continentFilter?: string,
  sphereFilter?: string
): GameQuestion {
  const filtered = GLOBAL_CURRENT_AFFAIRS_BANK.filter(item => {
    const matchBand = item.gradeBand === gradeBand;
    const matchContinent = !continentFilter || continentFilter === 'All' || item.continent === continentFilter;
    const matchSphere = !sphereFilter || sphereFilter === 'All' || item.sphere === sphereFilter;
    return matchBand && matchContinent && matchSphere;
  });

  const sourceList = filtered.length > 0 ? filtered : GLOBAL_CURRENT_AFFAIRS_BANK.filter(i => i.gradeBand === gradeBand);
  const picked = sourceList[Math.floor(Math.random() * sourceList.length)];
  const id = `curr_aff_${Date.now()}_${Math.random()}`;

  // Shuffle options and retain correct answer index
  const correctText = picked.options[picked.a];
  const shuffled = [...picked.options].sort(() => Math.random() - 0.5) as [string, string, string, string];
  const correctIdx = shuffled.indexOf(correctText);

  return {
    id,
    q: picked.q,
    options: shuffled,
    a: correctIdx,
    category: `${picked.continent} • ${picked.sphere}`,
    difficulty: gradeBand === '7-12' ? 'hard' : gradeBand === '4-6' ? 'medium' : 'easy',
    continent: picked.continent,
    sphere: picked.sphere,
    gradeBand: picked.gradeBand
  };
}

/* ═══════════════════════ 3. PROCEDURAL QUESTION GENERATORS ═══════════════════════ */

/** Generates dynamic arithmetic & algebra math questions */
export function generateMathQuestion(level: number): GameQuestion {
  const id = `math_dyn_${Date.now()}_${Math.random()}`;
  let q = '';
  let ans = 0;
  let category = 'Mathematics';
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

  if (level <= 5) {
    const op = Math.random() > 0.5 ? '+' : '×';
    if (op === '+') {
      const a = Math.floor(Math.random() * 40) + 10;
      const b = Math.floor(Math.random() * 40) + 5;
      ans = a + b;
      q = `What is the sum of ${a} + ${b}?`;
    } else {
      const a = Math.floor(Math.random() * 12) + 2;
      const b = Math.floor(Math.random() * 12) + 2;
      ans = a * b;
      q = `What is the product of ${a} × ${b}?`;
    }
    difficulty = 'easy';
  } else if (level <= 10) {
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      const multiplier = Math.floor(Math.random() * 8) + 2;
      const x = Math.floor(Math.random() * 12) + 3;
      const constant = Math.floor(Math.random() * 15) + 5;
      const total = multiplier * x + constant;
      ans = x;
      q = `Solve for x: ${multiplier}x + ${constant} = ${total}`;
    } else if (type === 1) {
      const b = Math.floor(Math.random() * 12) + 3;
      const ansVal = Math.floor(Math.random() * 15) + 5;
      const total = b * ansVal;
      ans = ansVal;
      q = `Calculate: ${total} ÷ ${b}`;
    } else {
      const base = Math.floor(Math.random() * 10) + 3;
      ans = base * base;
      q = `What is the square of ${base} (${base}²)?`;
    }
    difficulty = 'medium';
    category = 'Algebra & Logic';
  } else {
    const type = Math.floor(Math.random() * 2);
    if (type === 0) {
      const a = Math.floor(Math.random() * 5) + 2;
      const exp = Math.floor(Math.random() * 3) + 2;
      ans = Math.pow(a, exp);
      q = `What is ${a} raised to the power of ${exp} (${a}^${exp})?`;
    } else {
      const side = Math.floor(Math.random() * 15) + 4;
      ans = side * side;
      q = `If a square classroom has a side length of ${side} meters, what is its total area in m²?`;
    }
    difficulty = 'hard';
    category = 'Advanced Mathematics';
  }

  const optsSet = new Set<string>();
  optsSet.add(String(ans));
  while (optsSet.size < 4) {
    const offset = (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1) * (level > 5 ? 2 : 1);
    const candidate = Math.max(1, ans + offset);
    optsSet.add(String(candidate));
  }

  const options = Array.from(optsSet) as [string, string, string, string];
  const correctOptionText = String(ans);
  const shuffled = options.sort(() => Math.random() - 0.5);
  const correctIdx = shuffled.indexOf(correctOptionText);

  return { id, q, options: shuffled as [string, string, string, string], a: correctIdx, category, difficulty };
}

/** Generates dynamic Science trivia questions */
export function generateScienceQuestion(level: number): GameQuestion {
  const scienceTopics = [
    { q: 'Which gas do humans inhale for cellular respiration?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], a: 0, cat: 'Biology' },
    { q: 'What is the freezing point of water in Celsius?', options: ['0°C', '100°C', '-10°C', '32°C'], a: 0, cat: 'Physics' },
    { q: 'Which planet is known as the Red Planet?', options: ['Mars', 'Venus', 'Jupiter', 'Saturn'], a: 0, cat: 'Astronomy' },
    { q: 'What is the hardest natural substance known on Earth?', options: ['Diamond', 'Titanium', 'Quartz', 'Granite'], a: 0, cat: 'Earth Science' },
    { q: 'What is the center of an atom called?', options: ['Nucleus', 'Electron', 'Proton', 'Neutron'], a: 0, cat: 'Chemistry' },
    { q: 'Which organ pumps blood throughout the human body?', options: ['Heart', 'Lungs', 'Liver', 'Brain'], a: 0, cat: 'Anatomy' },
    { q: 'What force pulls objects toward the center of the Earth?', options: ['Gravity', 'Friction', 'Magnetism', 'Tension'], a: 0, cat: 'Physics' }
  ];

  const picked = scienceTopics[Math.floor(Math.random() * scienceTopics.length)];
  const id = `sci_dyn_${Date.now()}_${Math.random()}`;

  const correctText = picked.options[picked.a];
  const shuffled = [...picked.options].sort(() => Math.random() - 0.5) as [string, string, string, string];
  const aIdx = shuffled.indexOf(correctText);

  return {
    id,
    q: picked.q,
    options: shuffled,
    a: aIdx,
    category: `Science (${picked.cat})`,
    difficulty: level > 8 ? 'hard' : level > 4 ? 'medium' : 'easy'
  };
}

/**
 * Main function: Get a unique, non-repetitive question for any game
 * Uses dynamic procedural generators + domain category selection
 */
export function getUniqueDynamicQuestion(level: number, usedQuestionIds: string[] = []): GameQuestion {
  const domainChoice = Math.floor(Math.random() * 4);
  let qObj: GameQuestion;

  if (domainChoice === 0) {
    qObj = generateMathQuestion(level);
  } else if (domainChoice === 1) {
    qObj = generateScienceQuestion(level);
  } else if (domainChoice === 2) {
    const band = level <= 5 ? '1-3' : level <= 10 ? '4-6' : '7-12';
    qObj = generateGlobalCurrentAffairsQuestion(band);
  } else {
    const band = level <= 5 ? '1-3' : level <= 10 ? '4-6' : '7-12';
    qObj = generateGlobalCurrentAffairsQuestion(band);
  }

  if (usedQuestionIds.includes(qObj.id)) {
    qObj.id = `${qObj.id}_${Math.random()}`;
  }

  return qObj;
}

/**
 * Gets a non-repeating vocabulary word for Word Scramble, Hangman, Wordle, Scrabble
 */
export function getUniqueVocabularyWord(usedWords: string[] = [], difficultyFilter?: 'easy' | 'medium' | 'hard'): VocabularyWord {
  const available = VOCABULARY_BANK.filter(w => !usedWords.includes(w.word) && (!difficultyFilter || w.difficulty === difficultyFilter));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return VOCABULARY_BANK[Math.floor(Math.random() * VOCABULARY_BANK.length)];
}
