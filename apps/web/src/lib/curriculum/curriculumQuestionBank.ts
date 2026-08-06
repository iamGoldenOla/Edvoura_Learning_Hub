/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EDVOURA OFFICIAL CURRICULUM LESSON NOTES QUESTION BANK (GRADES 1 TO 12)
 * ══════════════════════════════════════════════════════════════════════════════
 * Provides curated retention questions extracted directly from our 204 official
 * purchased lesson notes for Primary 1 to SS 3 (Grade 1 to 12).
 * Used to power interactive games and practice retention quizzes.
 */

export interface CurriculumQuestion {
  id: string;
  gradeCode: string; // 'grade_1' ... 'grade_12'
  gradeName: string;
  subjectName: string;
  questionText: string;
  options: [string, string, string, string];
  correctIndex: number; // 0..3
  explanation: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const OFFICIAL_CURRICULUM_QUESTIONS: CurriculumQuestion[] = [
  /* ═══════════════════════ PRIMARY 1 (GRADE 1) ═══════════════════════ */
  {
    id: 'p1_sci_q1',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'Basic Science',
    questionText: 'Which part of a plant grows under the soil and takes up water?',
    options: ['Roots', 'Leaves', 'Flowers', 'Fruits'],
    correctIndex: 0,
    explanation: 'Roots grow underground and absorb water and nutrients from the soil.',
    hint: 'Think of the bottom part hidden underground.',
    difficulty: 'easy',
  },
  {
    id: 'p1_math_q1',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'Mathematics',
    questionText: 'What is 5 + 4?',
    options: ['8', '9', '10', '7'],
    correctIndex: 1,
    explanation: 'Count 5 fingers then add 4 more fingers to get 9.',
    hint: 'One less than ten.',
    difficulty: 'easy',
  },
  {
    id: 'p1_eng_q1',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'English Studies',
    questionText: 'Which letter comes immediately after the letter "B"?',
    options: ['A', 'D', 'C', 'E'],
    correctIndex: 2,
    explanation: 'The alphabet starts A, B, C.',
    hint: 'Third letter of the alphabet.',
    difficulty: 'easy',
  },

  /* ═══════════════════════ PRIMARY 2 (GRADE 2) ═══════════════════════ */
  {
    id: 'p2_sci_q1',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'Basic Science',
    questionText: 'What gas do human beings breathe in to stay alive?',
    options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Helium'],
    correctIndex: 1,
    explanation: 'Humans inhale oxygen from the air for cellular respiration.',
    hint: 'Fresh air gas essential for life.',
    difficulty: 'easy',
  },
  {
    id: 'p2_math_q1',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'Mathematics',
    questionText: 'What is 15 - 7?',
    options: ['6', '8', '9', '7'],
    correctIndex: 1,
    explanation: 'Subtracting 7 from 15 gives 8.',
    hint: 'Double of 4.',
    difficulty: 'easy',
  },

  /* ═══════════════════════ PRIMARY 3 (GRADE 3) ═══════════════════════ */
  {
    id: 'p3_sci_q1',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'Basic Science',
    questionText: 'Which animal group lays eggs and has feathers on their body?',
    options: ['Mammals', 'Reptiles', 'Birds', 'Amphibians'],
    correctIndex: 2,
    explanation: 'Birds are warm-blooded vertebrates covered in feathers and lay hard-shelled eggs.',
    hint: 'Parrots, eagles, and hens belong to this group.',
    difficulty: 'easy',
  },
  {
    id: 'p3_math_q1',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'Mathematics',
    questionText: 'What is 6 multiplied by 8 (6 x 8)?',
    options: ['42', '48', '54', '36'],
    correctIndex: 1,
    explanation: '6 times 8 equals 48.',
    hint: 'Six tens minus twelve.',
    difficulty: 'medium',
  },

  /* ═══════════════════════ PRIMARY 4 (GRADE 4) ═══════════════════════ */
  {
    id: 'p4_tech_q1',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Digital Literacy',
    questionText: 'Which component is known as the "brain" of a desktop computer?',
    options: ['Monitor', 'Central Processing Unit (CPU)', 'Keyboard', 'Mouse'],
    correctIndex: 1,
    explanation: 'The CPU performs all instructions and calculations in a computer system.',
    hint: 'It stands for Central Processing Unit.',
    difficulty: 'medium',
  },
  {
    id: 'p4_sci_q1',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Basic Science',
    questionText: 'What process describes liquid water changing into water vapor when heated?',
    options: ['Condensation', 'Evaporation', 'Freezing', 'Melting'],
    correctIndex: 1,
    explanation: 'Evaporation is the phase change from liquid to gas.',
    hint: 'Steam rising from boiling water.',
    difficulty: 'medium',
  },

  /* ═══════════════════════ PRIMARY 5 (GRADE 5) ═══════════════════════ */
  {
    id: 'p5_sci_q1',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Basic Science',
    questionText: 'Which organ system pumps oxygenated blood throughout the human body?',
    options: ['Digestive System', 'Circulatory System', 'Respiratory System', 'Nervous System'],
    correctIndex: 1,
    explanation: 'The circulatory system (heart and blood vessels) pumps and circulates blood.',
    hint: 'Powered by the beating heart.',
    difficulty: 'medium',
  },
  {
    id: 'p5_math_q1',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Mathematics',
    questionText: 'What is the simple interest on ₦10,000 at 5% per annum for 2 years?',
    options: ['₦500', '₦1,000', '₦1,500', '₦2,000'],
    correctIndex: 1,
    explanation: 'Simple Interest = (Principal x Rate x Time) / 100 = (10000 x 5 x 2)/100 = ₦1,000.',
    hint: 'Formula: (P x R x T) / 100.',
    difficulty: 'medium',
  },

  /* ═══════════════════════ PRIMARY 6 (GRADE 6) ═══════════════════════ */
  {
    id: 'p6_sci_q1',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Basic Science',
    questionText: 'What type of simple machine is a pair of scissors or a seesaw?',
    options: ['Pulley', 'Lever', 'Inclined Plane', 'Wheel and Axle'],
    correctIndex: 1,
    explanation: 'A lever rotates around a fixed point called a fulcrum.',
    hint: 'Uses a rigid beam and fulcrum.',
    difficulty: 'medium',
  },
  {
    id: 'p6_tech_q1',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Digital Literacy',
    questionText: 'Which network connects millions of computers globally using TCP/IP?',
    options: ['LAN', 'Internet', 'Bluetooth', 'Intranet'],
    correctIndex: 1,
    explanation: 'The Internet is the global network of interconnecting computer networks.',
    hint: 'World Wide Web carrier.',
    difficulty: 'easy',
  },

  /* ═══════════════════════ JSS 1 (GRADE 7) ═══════════════════════ */
  {
    id: 'jss1_math_q1',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Mathematics',
    questionText: 'If 3x + 5 = 20, what is the value of x?',
    options: ['3', '4', '5', '6'],
    correctIndex: 2,
    explanation: '3x = 20 - 5 = 15; x = 15 / 3 = 5.',
    hint: 'Subtract 5 from 20 then divide by 3.',
    difficulty: 'medium',
  },
  {
    id: 'jss1_tech_q1',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Digital Technologies',
    questionText: 'What binary number represents the decimal value 5?',
    options: ['100', '101', '110', '111'],
    correctIndex: 1,
    explanation: 'Decimal 5 in binary is 4(1) + 2(0) + 1(1) = 101.',
    hint: 'Power of 2 breakdown: 4 + 0 + 1.',
    difficulty: 'medium',
  },

  /* ═══════════════════════ JSS 2 (GRADE 8) ═══════════════════════ */
  {
    id: 'jss2_sci_q1',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Basic Science',
    questionText: 'Which organelle is known as the site of protein synthesis in a cell?',
    options: ['Mitochondria', 'Ribosome', 'Golgi Body', 'Nucleus'],
    correctIndex: 1,
    explanation: 'Ribosomes assemble amino acids into proteins according to RNA instructions.',
    hint: 'Small granular structures in cytoplasm.',
    difficulty: 'medium',
  },
  {
    id: 'jss2_solar_q1',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Solar PV Installation',
    questionText: 'What instrument measures electrical current in a circuit?',
    options: ['Voltmeter', 'Ammeter', 'Ohmmeter', 'Wattmeter'],
    correctIndex: 1,
    explanation: 'An ammeter measures electric current in Amperes (A).',
    hint: 'Measures Amps.',
    difficulty: 'medium',
  },

  /* ═══════════════════════ JSS 3 (GRADE 9 - BECE PREP) ═══════════════════════ */
  {
    id: 'jss3_math_q1',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Mathematics',
    questionText: 'In a right-angled triangle, if opposite = 3 and adjacent = 4, what is the hypotenuse length?',
    options: ['5', '6', '7', '8'],
    correctIndex: 0,
    explanation: 'Pythagorean Theorem: c² = 3² + 4² = 9 + 16 = 25. c = √25 = 5.',
    hint: 'Use 3-4-5 Pythagorean triple.',
    difficulty: 'medium',
  },
  {
    id: 'jss3_sci_q1',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Basic Science',
    questionText: 'What law states that energy cannot be created nor destroyed, only transformed?',
    options: ['Ohm’s Law', 'Law of Conservation of Energy', 'Boyle’s Law', 'Newton’s First Law'],
    correctIndex: 1,
    explanation: 'The Law of Conservation of Energy states total energy in an isolated system remains constant.',
    hint: 'First Law of Thermodynamics concept.',
    difficulty: 'medium',
  },

  /* ═══════════════════════ SS 1 (GRADE 10) ═══════════════════════ */
  {
    id: 'ss1_phy_q1',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Physics',
    questionText: 'What is the SI unit of electric potential difference (Voltage)?',
    options: ['Ampere (A)', 'Volt (V)', 'Ohm (Ω)', 'Joule (J)'],
    correctIndex: 1,
    explanation: 'The Volt (V) is the SI unit of electric potential difference.',
    hint: 'Named after Alessandro Volta.',
    difficulty: 'medium',
  },
  {
    id: 'ss1_chem_q1',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Chemistry',
    questionText: 'Which subatomic particle carries a negative fundamental electrical charge?',
    options: ['Proton', 'Electron', 'Neutron', 'Positron'],
    correctIndex: 1,
    explanation: 'Electrons carry a unit negative charge (-1.6 x 10^-19 C).',
    hint: 'Orbits around the atomic nucleus.',
    difficulty: 'easy',
  },
  {
    id: 'ss1_bio_q1',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Biology',
    questionText: 'Which tissue in vascular plants conducts water and dissolved minerals upwards from roots?',
    options: ['Phloem', 'Xylem', 'Cambium', 'Epidermis'],
    correctIndex: 1,
    explanation: 'Xylem transports water and dissolved nutrients from roots to shoots.',
    hint: 'Transports water (wood tissue).',
    difficulty: 'medium',
  },

  /* ═══════════════════════ SS 2 (GRADE 11) ═══════════════════════ */
  {
    id: 'ss2_chem_q1',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Chemistry',
    questionText: 'What gas is evolved when dilute hydrochloric acid reacts with calcium carbonate (CaCO₃)?',
    options: ['Oxygen', 'Carbon Dioxide (CO₂)', 'Hydrogen', 'Chlorine'],
    correctIndex: 1,
    explanation: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑.',
    hint: 'Turns lime water milky.',
    difficulty: 'medium',
  },
  {
    id: 'ss2_phy_q1',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Physics',
    questionText: 'Which phenomenon explains the bending of light rays as they pass from air into glass?',
    options: ['Reflection', 'Refraction', 'Diffraction', 'Polarization'],
    correctIndex: 1,
    explanation: 'Refraction occurs when light changes speed entering a medium with different optical density.',
    hint: 'Governed by Snell’s Law.',
    difficulty: 'medium',
  },

  /* ═══════════════════════ SS 3 (GRADE 12 - WAEC/NECO/JAMB EXIT) ═══════════════════════ */
  {
    id: 'ss3_math_q1',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Mathematics',
    questionText: 'Evaluate the derivative dy/dx if y = 4x³ - 5x² + 7x - 9.',
    options: ['12x² - 10x + 7', '12x² - 5x + 7', '4x² - 10x', '12x - 10'],
    correctIndex: 0,
    explanation: 'Power rule: d/dx(x^n) = n*x^(n-1). d/dx(4x³) = 12x², d/dx(-5x²) = -10x, d/dx(7x) = 7.',
    hint: 'Multiply power by coefficient and subtract 1 from exponent.',
    difficulty: 'hard',
  },
  {
    id: 'ss3_phy_q1',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Physics',
    questionText: 'In photoelectric effect, what determines the maximum kinetic energy of emitted photoelectrons?',
    options: ['Intensity of light', 'Frequency of incident radiation', 'Exposure duration', 'Surface area'],
    correctIndex: 1,
    explanation: 'Einstein’s equation: E_k = hf - Φ. Kinetic energy depends strictly on frequency (f).',
    hint: 'Proportional to Planck’s constant times frequency.',
    difficulty: 'hard',
  },
  {
    id: 'ss3_chem_q1',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Chemistry',
    questionText: 'Which organic functional group characterizes alkanols (alcohols)?',
    options: ['-COOH', '-OH (Hydroxyl)', '-CHO', '-COOR'],
    correctIndex: 1,
    explanation: 'Alcohols contain the -OH (hydroxyl) functional group attached to a saturated carbon.',
    hint: 'Hydroxyl group.',
    difficulty: 'medium',
  },
  {
    id: 'ss3_econ_q1',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Economics',
    questionText: 'What international organization promotes petroleum policy coordination among member oil-exporting nations?',
    options: ['ECOWAS', 'OPEC', 'IMF', 'WTO'],
    correctIndex: 1,
    explanation: 'OPEC (Organization of the Petroleum Exporting Countries) coordinates oil production policies.',
    hint: 'Organization of the Petroleum Exporting Countries.',
    difficulty: 'easy',
  },
  {
    id: 'ss3_tech_q1',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Digital Technologies',
    questionText: 'Which architecture powers Transformer-based Large Language Models (LLMs)?',
    options: ['Convolutional Neural Networks', 'Self-Attention Mechanism', 'Recurrent Neural Networks', 'Decision Trees'],
    correctIndex: 1,
    explanation: 'Transformers rely on multi-head self-attention mechanisms to process tokens in parallel.',
    hint: '"Attention Is All You Need" paper architecture.',
    difficulty: 'hard',
  },
];

export function getCurriculumQuestionsByGrade(gradeCode: string): CurriculumQuestion[] {
  return OFFICIAL_CURRICULUM_QUESTIONS.filter(q => q.gradeCode === gradeCode);
}

export function getCurriculumQuestionsBySubject(subjectName: string): CurriculumQuestion[] {
  const norm = subjectName.toLowerCase();
  return OFFICIAL_CURRICULUM_QUESTIONS.filter(q => q.subjectName.toLowerCase().includes(norm) || norm.includes(q.subjectName.toLowerCase()));
}
