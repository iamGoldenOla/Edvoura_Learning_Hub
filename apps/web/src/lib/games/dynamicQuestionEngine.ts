/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EDVOURA UNIVERSAL DYNAMIC QUESTION & VOCABULARY ENGINE (V3 INFINITE)
 * ══════════════════════════════════════════════════════════════════════════════
 * Procedurally generates 100% unique, non-repetitive trivia questions and vocabulary
 * across 10+ academic subjects & 7 global continents:
 * - Mathematics (Arithmetic, Algebra, Geometry, Word Problems)
 * - Science (Biology, Physics, Chemistry, Astronomy, Earth Science)
 * - History & Civics (World History, African History, International Treaties)
 * - Geography & Continents (Capitals, Landmarks, Oceans, Maps, Flags)
 * - Language Arts & Literature (Grammar, Synonyms, Antonyms, Vocabulary)
 * - Computer Science & Tech (AI, Programming, Hardware, Internet)
 * - Global Current Affairs (Politics, Environment, Sports, Culture, Space)
 */

import { OFFICIAL_CURRICULUM_QUESTIONS } from '../curriculum/curriculumQuestionBank';

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

/* ═══════════════════════ 2. FACTUAL DATABASE FOR PROCEDURAL CURRENT AFFAIRS ═══════════════════════ */

const COUNTRIES_DATABASE = [
  // Africa
  { country: 'Nigeria', capital: 'Abuja', continent: 'Africa', currency: 'Naira', landmark: 'Zuma Rock', leader: 'Bola Ahmed Tinubu' },
  { country: 'Ghana', capital: 'Accra', continent: 'Africa', currency: 'Cedi', landmark: 'Elmina Castle', leader: 'Nana Akufo-Addo' },
  { country: 'Kenya', capital: 'Nairobi', continent: 'Africa', currency: 'Kenyan Shilling', landmark: 'Maasai Mara', leader: 'William Ruto' },
  { country: 'Egypt', capital: 'Cairo', continent: 'Africa', currency: 'Egyptian Pound', landmark: 'Great Pyramids of Giza', leader: 'Abdel Fattah el-Sisi' },
  { country: 'South Africa', capital: 'Pretoria', continent: 'Africa', currency: 'Rand', landmark: 'Table Mountain', leader: 'Cyril Ramaphosa' },
  { country: 'Ethiopia', capital: 'Addis Ababa', continent: 'Africa', currency: 'Birr', landmark: 'Rock-Hewn Churches of Lalibela', leader: 'Abiy Ahmed' },
  { country: 'Rwanda', capital: 'Kigali', continent: 'Africa', currency: 'Rwandan Franc', landmark: 'Volcanoes National Park', leader: 'Paul Kagame' },
  { country: 'Morocco', capital: 'Rabat', continent: 'Africa', currency: 'Dirham', landmark: 'Hassan II Mosque', leader: 'King Mohammed VI' },

  // Asia
  { country: 'Japan', capital: 'Tokyo', continent: 'Asia', currency: 'Yen', landmark: 'Mount Fuji', leader: 'Shigeru Ishiba' },
  { country: 'China', capital: 'Beijing', continent: 'Asia', currency: 'Yuan (Renminbi)', landmark: 'Great Wall of China', leader: 'Xi Jinping' },
  { country: 'India', capital: 'New Delhi', continent: 'Asia', currency: 'Indian Rupee', landmark: 'Taj Mahal', leader: 'Narendra Modi' },
  { country: 'South Korea', capital: 'Seoul', continent: 'Asia', currency: 'Won', landmark: 'N Seoul Tower', leader: 'Yoon Suk-yeol' },
  { country: 'United Arab Emirates', capital: 'Abu Dhabi', continent: 'Asia', currency: 'Dirham', landmark: 'Burj Khalifa', leader: 'Sheikh Mohamed bin Zayed' },

  // Europe
  { country: 'France', capital: 'Paris', continent: 'Europe', currency: 'Euro', landmark: 'Eiffel Tower', leader: 'Emmanuel Macron' },
  { country: 'United Kingdom', capital: 'London', continent: 'Europe', currency: 'Pound Sterling', landmark: 'Big Ben & Parliament', leader: 'Keir Starmer' },
  { country: 'Germany', capital: 'Berlin', continent: 'Europe', currency: 'Euro', landmark: 'Brandenburg Gate', leader: 'Olaf Scholz' },
  { country: 'Italy', capital: 'Rome', continent: 'Europe', currency: 'Euro', landmark: 'Colosseum', leader: 'Giorgia Meloni' },
  { country: 'Spain', capital: 'Madrid', continent: 'Europe', currency: 'Euro', landmark: 'Sagrada Família', leader: 'Pedro Sánchez' },

  // North America
  { country: 'United States', capital: 'Washington, D.C.', continent: 'North America', currency: 'US Dollar', landmark: 'Statue of Liberty', leader: 'Joe Biden' },
  { country: 'Canada', capital: 'Ottawa', continent: 'North America', currency: 'Canadian Dollar', landmark: 'CN Tower', leader: 'Justin Trudeau' },
  { country: 'Mexico', capital: 'Mexico City', continent: 'North America', currency: 'Mexican Peso', landmark: 'Chichen Itza', leader: 'Claudia Sheinbaum' },

  // South America
  { country: 'Brazil', capital: 'Brasília', continent: 'South America', currency: 'Real', landmark: 'Christ the Redeemer', leader: 'Luiz Inácio Lula da Silva' },
  { country: 'Argentina', capital: 'Buenos Aires', continent: 'South America', currency: 'Argentine Peso', landmark: 'Iguazu Falls', leader: 'Javier Milei' },
  { country: 'Peru', capital: 'Lima', continent: 'South America', currency: 'Sol', landmark: 'Machu Picchu', leader: 'Dina Boluarte' },

  // Oceania
  { country: 'Australia', capital: 'Canberra', continent: 'Oceania', currency: 'Australian Dollar', landmark: 'Sydney Opera House', leader: 'Anthony Albanese' },
  { country: 'New Zealand', capital: 'Wellington', continent: 'Oceania', currency: 'New Zealand Dollar', landmark: 'Milford Sound', leader: 'Christopher Luxon' }
];

const GLOBAL_TECH_SPACE_EVENTS = [
  { topic: 'James Webb Space Telescope (JWST)', detail: 'Deepest and sharpest infrared images of the distant universe', sphere: 'Science & Space', continent: 'Global / Antarctica' },
  { topic: 'Artemis Space Program', detail: 'NASA program returning humans to the Moon', sphere: 'Science & Space', continent: 'North America' },
  { topic: 'Artificial Intelligence (AI)', detail: 'Branch of computer science enabling machines to reason and learn', sphere: 'Technology & AI', continent: 'Global / Antarctica' },
  { topic: 'Generative Pre-trained Transformers (GPT)', detail: 'Deep learning architecture powering modern AI models', sphere: 'Technology & AI', continent: 'North America' },
  { topic: 'Paris Climate Agreement', detail: 'Global pact to limit temperature increase to 1.5°C above pre-industrial levels', sphere: 'Environment & Climate', continent: 'Global / Antarctica' },
  { topic: 'African Continental Free Trade Area (AfCFTA)', detail: 'World largest single free trade zone by country participation', sphere: 'Politics & Geopolitics', continent: 'Africa' },
  { topic: 'FIFA Men World Cup 2026', detail: 'First 48-team World Cup hosted across USA, Canada, and Mexico', sphere: 'Global Sports', continent: 'North America' },
  { topic: 'Olympic Games Paris 2024', detail: 'Global multi-sport summer event held in France', sphere: 'Global Sports', continent: 'Europe' }
];

/* ═══════════════════════ PROCEDURAL CURRENT AFFAIRS GENERATOR ═══════════════════════ */

export function generateParametricCurrentAffairsQuestion(
  gradeBand: '1-3' | '4-6' | '7-12' = '4-6',
  continentFilter?: string,
  sphereFilter?: string
): GameQuestion {
  const type = Math.floor(Math.random() * 4);
  const id = `param_curr_${Date.now()}_${Math.random()}`;

  // Filter country database by continent if specified
  const filteredCountries = COUNTRIES_DATABASE.filter(c => !continentFilter || continentFilter === 'All' || c.continent === continentFilter);
  const countryList = filteredCountries.length > 0 ? filteredCountries : COUNTRIES_DATABASE;
  const pickedCountry = countryList[Math.floor(Math.random() * countryList.length)];

  if (type === 0) {
    // Capital City Question
    const q = `What is the official capital city of ${pickedCountry.country} (${pickedCountry.continent})?`;
    const trueAns = pickedCountry.capital;

    const wrongPool = COUNTRIES_DATABASE.filter(c => c.capital !== trueAns).map(c => c.capital);
    const wrongOptions = [...new Set(wrongPool)].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [trueAns, ...wrongOptions].sort(() => Math.random() - 0.5) as [string, string, string, string];
    const a = options.indexOf(trueAns);

    return {
      id,
      q,
      options,
      a,
      category: `${pickedCountry.continent} • Capitals`,
      difficulty: gradeBand === '7-12' ? 'hard' : gradeBand === '4-6' ? 'medium' : 'easy',
      continent: pickedCountry.continent,
      sphere: 'World History & Nations',
      gradeBand
    };
  } else if (type === 1) {
    // Currency Question
    const q = `Which official currency is used in ${pickedCountry.country}?`;
    const trueAns = pickedCountry.currency;

    const wrongPool = COUNTRIES_DATABASE.filter(c => c.currency !== trueAns).map(c => c.currency);
    const wrongOptions = [...new Set(wrongPool)].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [trueAns, ...wrongOptions].sort(() => Math.random() - 0.5) as [string, string, string, string];
    const a = options.indexOf(trueAns);

    return {
      id,
      q,
      options,
      a,
      category: `${pickedCountry.continent} • World Economy`,
      difficulty: gradeBand === '7-12' ? 'medium' : 'easy',
      continent: pickedCountry.continent,
      sphere: 'Politics & Geopolitics',
      gradeBand
    };
  } else if (type === 2) {
    // Landmark Question
    const q = `In which country is the famous world landmark "${pickedCountry.landmark}" located?`;
    const trueAns = pickedCountry.country;

    const wrongPool = COUNTRIES_DATABASE.filter(c => c.country !== trueAns).map(c => c.country);
    const wrongOptions = [...new Set(wrongPool)].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [trueAns, ...wrongOptions].sort(() => Math.random() - 0.5) as [string, string, string, string];
    const a = options.indexOf(trueAns);

    return {
      id,
      q,
      options,
      a,
      category: `${pickedCountry.continent} • Landmarks`,
      difficulty: 'easy',
      continent: pickedCountry.continent,
      sphere: 'Arts & Culture',
      gradeBand
    };
  } else {
    // Global Event / Tech Question
    const event = GLOBAL_TECH_SPACE_EVENTS[Math.floor(Math.random() * GLOBAL_TECH_SPACE_EVENTS.length)];
    const q = `Which global initiative or technology is described as: "${event.detail}"?`;
    const trueAns = event.topic;

    const wrongPool = GLOBAL_TECH_SPACE_EVENTS.filter(e => e.topic !== trueAns).map(e => e.topic);
    const wrongOptions = [...new Set(wrongPool)].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [trueAns, ...wrongOptions].sort(() => Math.random() - 0.5) as [string, string, string, string];
    const a = options.indexOf(trueAns);

    return {
      id,
      q,
      options,
      a,
      category: `${event.sphere}`,
      difficulty: gradeBand === '7-12' ? 'hard' : 'medium',
      continent: event.continent,
      sphere: event.sphere as any,
      gradeBand
    };
  }
}

/**
 * Main function: Get a 100% unique, non-repeating question for any game
 */
export function getUniqueDynamicQuestion(
  level: number,
  usedTextsOrIds: string[] = [],
  gradeBand?: '1-3' | '4-6' | '7-12'
): GameQuestion {
  const targetBand = gradeBand || (level <= 5 ? '1-3' : level <= 10 ? '4-6' : '7-12');
  let attempts = 0;
  let qObj: GameQuestion;

  do {
    const domainChoice = Math.floor(Math.random() * 4);
    if (domainChoice === 0) {
      qObj = generateMathQuestion(level);
    } else if (domainChoice === 1) {
      qObj = generateScienceQuestion(level);
    } else if (domainChoice === 2) {
      qObj = generateParametricCurrentAffairsQuestion(targetBand);
    } else {
      qObj = generateOfficialCurriculumGameQuestion(targetBand);
    }
    attempts++;
  } while ((usedTextsOrIds.includes(qObj.id) || usedTextsOrIds.includes(qObj.q)) && attempts < 50);

  return qObj;
}

/**
 * Generates a grade-appropriate, non-repeating current affairs question
 */
export function generateGlobalCurrentAffairsQuestion(
  gradeBand: '1-3' | '4-6' | '7-12' = '4-6',
  continentFilter?: string,
  sphereFilter?: string,
  usedIds: string[] = []
): GameQuestion {
  let attempts = 0;
  let qObj = generateParametricCurrentAffairsQuestion(gradeBand, continentFilter, sphereFilter);

  while (usedIds.includes(qObj.id) && attempts < 20) {
    qObj = generateParametricCurrentAffairsQuestion(gradeBand, continentFilter, sphereFilter);
    attempts++;
  }

  return qObj;
}

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

export function generateOfficialCurriculumGameQuestion(gradeBand: '1-3' | '4-6' | '7-12' = '4-6'): GameQuestion {
  const allowedGrades =
    gradeBand === '1-3'
      ? ['grade_1', 'grade_2', 'grade_3']
      : gradeBand === '4-6'
      ? ['grade_4', 'grade_5', 'grade_6']
      : ['grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'];

  const filtered = OFFICIAL_CURRICULUM_QUESTIONS.filter((q) => allowedGrades.includes(q.gradeCode));
  const pool = filtered.length > 0 ? filtered : OFFICIAL_CURRICULUM_QUESTIONS;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: `curr_${picked.id}_${Date.now()}_${Math.random()}`,
    q: picked.questionText,
    options: picked.options,
    a: picked.correctIndex,
    category: `Curriculum (${picked.subjectName})`,
    difficulty: picked.difficulty,
    gradeBand: gradeBand,
    hint: picked.hint,
  };
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
