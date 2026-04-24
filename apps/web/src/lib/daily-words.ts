export type GradeLevel = '1-3' | '4-6' | '7-12';

const WORD_LISTS: Record<string, string[]> = {
  '1-3': [
    'Apple', 'Beach', 'Cloud', 'Dream', 'Earth', 'Friend', 'Grass', 'House', 'Island', 'Jelly',
    'Kite', 'Lemon', 'Moon', 'Night', 'Ocean', 'Piano', 'Queen', 'River', 'Star', 'Tree',
    'Under', 'Voice', 'Water', 'X-ray', 'Young', 'Zebra', 'Bird', 'Fish', 'Jump', 'Play',
    'Smile', 'Read', 'Write', 'Book', 'School', 'Family', 'Happy', 'Small', 'Green', 'Yellow'
  ],
  '4-6': [
    'Acknowledge', 'Believe', 'Calendar', 'Definitely', 'Experience', 'February', 'Government', 'Height', 'Imagine', 'Journey',
    'Knowledge', 'Library', 'Mountain', 'Neighbor', 'Occasion', 'Parallel', 'Question', 'Receipt', 'Separate', 'Thorough',
    'Understand', 'Vacuum', 'Weather', 'Yesterday', 'Zealous', 'Achievement', 'Beneficial', 'Challenge', 'Difference', 'Environment',
    'Frequency', 'Guarantee', 'Horizontal', 'Influence', 'Judgment', 'Language', 'Mechanism', 'Necessary', 'Opportunity', 'Position'
  ],
  '7-12': [
    'Abundance', 'Benevolent', 'Cacophony', 'Diligence', 'Eloquent', 'Fastidious', 'Garrulous', 'Hegemony', 'Immutable', 'Juxtapose',
    'Kindle', 'Languid', 'Magnanimous', 'Nefarious', 'Obfuscate', 'Paradigm', 'Quixotic', 'Reticent', 'Sycophant', 'Tenable',
    'Ubiquitous', 'Venerable', 'Wanderlust', 'Xenophobia', 'Yielding', 'Zephyr', 'Ambiguous', 'Belligerent', 'Capricious', 'Ephemeral',
    'Fortuitous', 'Gregarious', 'Hackneyed', 'Ineffable', 'Lethargic', 'Meticulous', 'Nonchalant', 'Ostentatious', 'Pragmatic', 'Reiterate'
  ]
};

export function getDailyWords(grade: GradeLevel, dateStr: string): string[] {
  const words = WORD_LISTS[grade] || WORD_LISTS['1-3'];
  const date = new Date(dateStr);
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  
  // Simple deterministic shuffle based on seed
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % shuffled.length;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, 10);
}
