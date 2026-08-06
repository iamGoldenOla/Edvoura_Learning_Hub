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
  /* ═══════════════════════ VERIFIED CURRENT AFFAIRS (GRADES 1 TO 10) ═══════════════════════ */
  // Grade 1 (Class 1)
  {
    id: 'g1_ca_1', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'What is the full form of WPL in sports?', options: ['Women’s Premier League', 'World Players League', 'World Premier League', 'Women’s Power League'], correctIndex: 0,
    explanation: 'WPL stands for Women’s Premier League.', hint: 'Women’s professional cricket league.', difficulty: 'easy'
  },
  {
    id: 'g1_ca_2', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'How are plastic wastes harmful to the environment?', options: ['It makes plants grow faster', 'It releases chemicals into soil and water, harming humans and animals', 'It cleans ocean water', 'It provides food for birds'], correctIndex: 1,
    explanation: 'Plastic wastes break down into microplastics and toxic chemicals that harm wildlife and ecosystems.', hint: 'Pollutes soil and water.', difficulty: 'easy'
  },
  {
    id: 'g1_ca_3', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'What liquid is essential for human survival?', options: ['Kerosene', 'Water', 'Oil', 'Juice'], correctIndex: 1,
    explanation: 'Water makes up ~60% of human body weight and is vital for life.', hint: 'H2O.', difficulty: 'easy'
  },
  {
    id: 'g1_ca_4', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'Who was sworn in as Prime Minister of India in 2024 for a 3rd term?', options: ['Rahul Gandhi', 'Narendra Modi', 'Manmohan Singh', 'Amit Shah'], correctIndex: 1,
    explanation: 'Narendra Modi won election for a 3rd consecutive term in 2024.', hint: 'Leader of BJP.', difficulty: 'easy'
  },
  {
    id: 'g1_ca_5', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'A tooth cavity forms in which part of the body?', options: ['Heart', 'Lungs', 'Teeth', 'Stomach'], correctIndex: 2,
    explanation: 'Cavities are decay holes formed in human teeth.', hint: 'Inside the mouth.', difficulty: 'easy'
  },
  {
    id: 'g1_ca_6', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'What is the full form of NASA?', options: ['National Aeronautics and Space Administration', 'National Astronomy and Space Agency', 'North American Space Association', 'National Aviation and Science Agency'], correctIndex: 0,
    explanation: 'NASA stands for National Aeronautics and Space Administration.', hint: 'US space agency.', difficulty: 'easy'
  },
  {
    id: 'g1_ca_7', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'What was the official mascot name of the Paris 2024 Olympic Games?', options: ['Vinicius', 'Olympic Phryge', 'Bing Dwen Dwen', 'Miraitowa'], correctIndex: 1,
    explanation: 'The Paris 2024 Olympic mascot was the Olympic Phryge, based on traditional French hats.', hint: 'Phrygian cap mascot.', difficulty: 'medium'
  },
  {
    id: 'g1_ca_8', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'What are doctors who treat animals called?', options: ['Pediatricians', 'Dentists', 'Veterinarians', 'Cardiologists'], correctIndex: 2,
    explanation: 'Veterinarians (vets) specialize in animal healthcare.', hint: 'Pet doctors.', difficulty: 'easy'
  },
  {
    id: 'g1_ca_9', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'Sweden is located on which continent?', options: ['Asia', 'Africa', 'Europe', 'South America'], correctIndex: 2,
    explanation: 'Sweden is a Scandinavian nation in Northern Europe.', hint: 'European continent.', difficulty: 'easy'
  },
  {
    id: 'g1_ca_10', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'Which age group is at highest risk of contracting polio?', options: ['Adults over 60', 'Children under 5 years old', 'Teenagers aged 15-18', 'Only newborn infants'], correctIndex: 1,
    explanation: 'Polio mainly affects children under 5 years of age.', hint: 'Young toddlers.', difficulty: 'easy'
  },
  {
    id: 'g1_ca_11', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'What vision condition makes distant objects look blurry?', options: ['Hyperopia', 'Myopia', 'Cataract', 'Astigmatism'], correctIndex: 1,
    explanation: 'Myopia (nearsightedness) causes far objects to appear blurry.', hint: 'Nearsightedness.', difficulty: 'medium'
  },
  {
    id: 'g1_ca_12', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'Which country was the primary target of Trump’s trade tariff war?', options: ['Canada', 'China', 'Germany', 'Australia'], correctIndex: 1,
    explanation: 'China was the primary focus of U.S. tariff policy changes.', hint: 'Asian trade nation.', difficulty: 'medium'
  },
  {
    id: 'g1_ca_13', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'What celestial body did Firefly’s Blue Ghost spacecraft land on?', options: ['Mars', 'Venus', 'The Moon', 'Jupiter'], correctIndex: 2,
    explanation: 'Blue Ghost landed on the surface of the Moon.', hint: 'Earth’s satellite.', difficulty: 'easy'
  },
  {
    id: 'g1_ca_14', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'Which extinct woolly ice-age mammal is being resurrected by gene-editing scientists?', options: ['Dodo', 'Woolly Mammoth', 'Sabertooth Cat', 'Tasmanian Tiger'], correctIndex: 1,
    explanation: 'Scientists are using CRISPR technology to revive the Woolly Mammoth.', hint: 'Ancient elephant relative.', difficulty: 'medium'
  },
  {
    id: 'g1_ca_15', gradeCode: 'grade_1', gradeName: 'Primary 1 (Grade 1)', subjectName: 'Current Affairs',
    questionText: 'Which country won the ICC Champions Trophy 2025?', options: ['Australia', 'India', 'Pakistan', 'England'], correctIndex: 1,
    explanation: 'India defeated Pakistan in the final to claim the 2025 ICC Champions Trophy.', hint: 'Team India.', difficulty: 'medium'
  },

  // Grade 2 (Class 2)
  {
    id: 'g2_ca_1', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'Which type of chocolate helps reduce stress and boost heart health?', options: ['Milk Chocolate', 'Dark Chocolate', 'White Chocolate', 'Caramel'], correctIndex: 1,
    explanation: 'Dark chocolate is rich in antioxidants called flavonoids.', hint: 'High cocoa chocolate.', difficulty: 'easy'
  },
  {
    id: 'g2_ca_2', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'How frequently does a total solar eclipse occur somewhere on Earth?', options: ['Once every 10 years', 'Once every 18 months', 'Every month', 'Once every 50 years'], correctIndex: 1,
    explanation: 'A total solar eclipse happens on average once every 18 months somewhere on Earth.', hint: 'About 1.5 years.', difficulty: 'medium'
  },
  {
    id: 'g2_ca_3', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'Who won the ICC Men’s T20 World Cup 2024?', options: ['South Africa', 'India', 'Australia', 'England'], correctIndex: 1,
    explanation: 'India defeated South Africa in Barbados to win the 2024 T20 World Cup.', hint: 'Team India.', difficulty: 'easy'
  },
  {
    id: 'g2_ca_4', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'What term describes farm animals such as sheep, cows, and goats?', options: ['Wildlife', 'Livestock', 'Reptiles', 'Rodents'], correctIndex: 1,
    explanation: 'Livestock refers to domesticated farm animals raised for agriculture.', hint: 'Farm animals.', difficulty: 'easy'
  },
  {
    id: 'g2_ca_5', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'What is the popular alternate name for the ultra-spicy Bhut Jolokia chili?', options: ['Jalapeño', 'Ghost pepper', 'Habanero', 'Cayenne'], correctIndex: 1,
    explanation: 'Bhut Jolokia is widely known as the Ghost Pepper.', hint: 'Spooky pepper name.', difficulty: 'easy'
  },
  {
    id: 'g2_ca_6', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'The word "lunar" refers to which celestial body?', options: ['The Sun', 'The Moon', 'Mars', 'Jupiter'], correctIndex: 1,
    explanation: 'Lunar originates from Luna, meaning the Moon.', hint: 'Night sky body.', difficulty: 'easy'
  },
  {
    id: 'g2_ca_7', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'Which southern African nation was forced to cull wild animals due to severe drought in 2024?', options: ['Namibia', 'Brazil', 'Japan', 'Canada'], correctIndex: 0,
    explanation: 'Namibia announced a wildlife culling plan to feed drought-affected citizens.', hint: 'Windhoek capital nation.', difficulty: 'medium'
  },
  {
    id: 'g2_ca_8', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'What is the full form of WHO?', options: ['World Housing Office', 'World Health Organization', 'Western Heritage Agency', 'World Highway Office'], correctIndex: 1,
    explanation: 'WHO stands for World Health Organization.', hint: 'UN health agency.', difficulty: 'easy'
  },
  {
    id: 'g2_ca_9', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'Which natural stimulant in coffee provides an energy boost?', options: ['Sugar', 'Caffeine', 'Vitamin C', 'Calcium'], correctIndex: 1,
    explanation: 'Caffeine stimulates the central nervous system to increase alertness.', hint: 'Coffee stimulant.', difficulty: 'easy'
  },
  {
    id: 'g2_ca_10', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'Where are Apple Inc.’s global headquarters located?', options: ['New York', 'California, USA', 'Texas', 'London'], correctIndex: 1,
    explanation: 'Apple Park is located in Cupertino, California.', hint: 'Silicon Valley state.', difficulty: 'easy'
  },
  {
    id: 'g2_ca_11', gradeCode: 'grade_11', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'What object blocks the sun during a solar eclipse?', options: ['Clouds', 'The Moon', 'Venus', 'Mars'], correctIndex: 1,
    explanation: 'The Moon passes between Earth and Sun, casting a shadow.', hint: 'Lunar body.', difficulty: 'easy'
  },
  {
    id: 'g2_ca_12', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'Which solar system planet is famous for its prominent ring system?', options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'], correctIndex: 2,
    explanation: 'Saturn has the most spectacular and visible rings in our solar system.', hint: 'Ringed gas giant.', difficulty: 'easy'
  },
  {
    id: 'g2_ca_13', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'What atomic reaction powers the energy core of the Sun?', options: ['Nuclear Fission', 'Nuclear Fusion', 'Chemical Combustion', 'Geothermal Heating'], correctIndex: 1,
    explanation: 'Nuclear fusion of hydrogen atoms into helium powers the Sun.', hint: 'Hydrogen atoms fusing.', difficulty: 'medium'
  },
  {
    id: 'g2_ca_14', gradeCode: 'grade_2', gradeName: 'Primary 2 (Grade 2)', subjectName: 'Current Affairs',
    questionText: 'What is Sunita Williams by profession?', options: ['Pilot', 'Astronaut', 'Doctor', 'Architect'], correctIndex: 1,
    explanation: 'Sunita Williams is a NASA astronaut and Navy officer.', hint: 'Space explorer.', difficulty: 'easy'
  },

  // Grade 3 (Class 3)
  {
    id: 'g3_ca_1', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'How many maximum overs can a single bowler bowl in a T20 cricket match?', options: ['2 overs', '4 overs', '6 overs', '10 overs'], correctIndex: 1,
    explanation: 'In T20 cricket, each bowler is restricted to a maximum of 4 overs.', hint: 'One fifth of 20 overs.', difficulty: 'easy'
  },
  {
    id: 'g3_ca_2', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'Which Indian state pioneered mandatory "water breaks" for school students?', options: ['Punjab', 'Kerala', 'Gujarat', 'Maharashtra'], correctIndex: 1,
    explanation: 'Kerala introduced scheduled water bell breaks in schools to keep kids hydrated.', hint: 'God’s own country.', difficulty: 'medium'
  },
  {
    id: 'g3_ca_3', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'What is the name of India’s longest sea bridge opened in 2024?', options: ['Bandra-Worli Link', 'Atal Setu', 'Pamban Bridge', 'Howrah Bridge'], correctIndex: 1,
    explanation: 'Atal Setu (Mumbai Trans Harbour Link) spans 21.8 km.', hint: 'Atal Setu.', difficulty: 'medium'
  },
  {
    id: 'g3_ca_4', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'What is the capital city of Telangana state?', options: ['Chennai', 'Hyderabad', 'Bengaluru', 'Vijayawada'], correctIndex: 1,
    explanation: 'Hyderabad is the capital city of Telangana.', hint: 'Charminar city.', difficulty: 'easy'
  },
  {
    id: 'g3_ca_5', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'Which action involving trees helps prevent soil erosion and landslides?', options: ['Deforestation', 'Planting trees', 'Cutting roots', 'Burning grass'], correctIndex: 1,
    explanation: 'Tree roots anchor the soil and absorb excess rainwater, preventing landslides.', hint: 'Afforestation.', difficulty: 'easy'
  },
  {
    id: 'g3_ca_6', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'Who served as the 46th President of the United States?', options: ['Barack Obama', 'Joe Biden', 'Donald Trump', 'George Bush'], correctIndex: 1,
    explanation: 'Joe Biden served as the 46th U.S. President (2021-2025).', hint: 'Preceded 47th president.', difficulty: 'easy'
  },
  {
    id: 'g3_ca_7', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'In which state is the Itanagar Biological Park situated?', options: ['Assam', 'Arunachal Pradesh', 'Sikkim', 'Meghalaya'], correctIndex: 1,
    explanation: 'Itanagar Biological Park is in Arunachal Pradesh.', hint: 'Itanagar capital state.', difficulty: 'medium'
  },
  {
    id: 'g3_ca_8', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'Which paralympic sport is athlete Manish Narwal famous for competing in?', options: ['Archery', 'Shooting', 'Swimming', 'Javelin'], correctIndex: 1,
    explanation: 'Manish Narwal won Paralympic medals in 10m Air Pistol Shooting.', hint: 'Pistol target sport.', difficulty: 'medium'
  },
  {
    id: 'g3_ca_9', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'What does the abbreviation AQLI stand for in environmental science?', options: ['Air Quality Life Index', 'Atmospheric Quantity Level Indicator', 'Air Pollution Quality Index', 'Annual Living Index'], correctIndex: 0,
    explanation: 'AQLI stands for Air Quality Life Index.', hint: 'Air Quality Life Index.', difficulty: 'medium'
  },
  {
    id: 'g3_ca_10', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'Giant Pandas are native to bamboo forests in which country?', options: ['Japan', 'China', 'India', 'Thailand'], correctIndex: 1,
    explanation: 'Giant Pandas are endemic to South Central China.', hint: 'Beijing nation.', difficulty: 'easy'
  },
  {
    id: 'g3_ca_11', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'Who was appointed Chief Minister of Delhi in September 2024?', options: ['Arvind Kejriwal', 'Atishi Marlena', 'Manish Sisodia', 'Sunita Kejriwal'], correctIndex: 1,
    explanation: 'Atishi Marlena became Delhi’s third female Chief Minister in 2024.', hint: 'Atishi.', difficulty: 'medium'
  },
  {
    id: 'g3_ca_12', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'Which nation won the Kabaddi World Cup 2025?', options: ['Iran', 'India', 'Pakistan', 'South Korea'], correctIndex: 1,
    explanation: 'India retained the Kabaddi World Cup title in 2025.', hint: 'Team India.', difficulty: 'easy'
  },
  {
    id: 'g3_ca_13', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'Studio Ghibli (creators of Spirited Away) is an animation studio from which country?', options: ['South Korea', 'Japan', 'China', 'USA'], correctIndex: 1,
    explanation: 'Studio Ghibli is a legendary anime studio based in Tokyo, Japan.', hint: 'Japanese anime studio.', difficulty: 'easy'
  },
  {
    id: 'g3_ca_14', gradeCode: 'grade_3', gradeName: 'Primary 3 (Grade 3)', subjectName: 'Current Affairs',
    questionText: 'On which date is April Fools’ Day celebrated worldwide?', options: ['1st April', '15th April', '30th March', '1st May'], correctIndex: 0,
    explanation: 'April Fools’ Day is observed globally on the 1st of April.', hint: 'First day of April.', difficulty: 'easy'
  },

  // Grade 4 (Class 4)
  {
    id: 'g4_ca_1', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'Where is India’s first underwater metro transportation system operating?', options: ['Mumbai', 'Kolkata, West Bengal', 'Delhi', 'Chennai'], correctIndex: 1,
    explanation: 'Kolkata Metro runs underwater beneath the Hooghly River.', hint: 'Hooghly River city.', difficulty: 'medium'
  },
  {
    id: 'g4_ca_2', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'What is Ramadan?', options: ['The 1st month of the year', 'The 9th month of the Islamic calendar observed with fasting', 'A 3-day festival', 'The last month of summer'], correctIndex: 1,
    explanation: 'Ramadan is the 9th Islamic month dedicated to prayer, reflection, and fasting.', hint: 'Month of fasting.', difficulty: 'easy'
  },
  {
    id: 'g4_ca_3', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'Who was the iconic industrialist and Emeritus Chairman of Tata Sons who passed away in 2024?', options: ['N. Chandrasekaran', 'Mr. Ratan Tata', 'Mukesh Ambani', 'Azim Premji'], correctIndex: 1,
    explanation: 'Ratan Tata was the legendary former chairman of Tata Group.', hint: 'Ratan Tata.', difficulty: 'easy'
  },
  {
    id: 'g4_ca_4', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'Who serves as Union Home Minister of India?', options: ['Rajnath Singh', 'Amit Shah', 'Nitin Gadkari', 'S. Jaishankar'], correctIndex: 1,
    explanation: 'Amit Shah is the Union Minister of Home Affairs.', hint: 'Amit Shah.', difficulty: 'easy'
  },
  {
    id: 'g4_ca_5', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'Which Prime Minister of Bangladesh resigned and left the nation in August 2024?', options: ['Khaleda Zia', 'Sheikh Hasina', 'Muhammad Yunus', 'Tarique Rahman'], correctIndex: 1,
    explanation: 'Sheikh Hasina resigned as Bangladesh PM after student protests.', hint: 'Hasina.', difficulty: 'medium'
  },
  {
    id: 'g4_ca_6', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'Which major operating system platform experienced a massive worldwide IT disruption in July 2024?', options: ['Apple', 'Microsoft Windows', 'Google Android', 'IBM AIX'], correctIndex: 1,
    explanation: 'A CrowdStrike sensor update caused a global BSOD crash on Microsoft Windows systems.', hint: 'Windows OS.', difficulty: 'medium'
  },
  {
    id: 'g4_ca_7', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'What was the former brand name of social network platform "X"?', options: ['Instagram', 'Twitter', 'Vine', 'Myspace'], correctIndex: 1,
    explanation: 'Elon Musk rebranded Twitter to X in 2023.', hint: 'Blue bird platform.', difficulty: 'easy'
  },
  {
    id: 'g4_ca_8', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'Who is the first Indian woman athlete to win two gold medals in Paralympic history?', options: ['Deepa Malik', 'Avani Lekhara', 'Bhavina Patel', 'Ekta Bhyan'], correctIndex: 1,
    explanation: 'Avani Lekhara won gold medals in rifle shooting at Tokyo 2020 and Paris 2024.', hint: 'Paralympic shooter.', difficulty: 'medium'
  },
  {
    id: 'g4_ca_9', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'What is the highest mountain peak on the African continent?', options: ['Mount Kenya', 'Mount Kilimanjaro', 'Mount Everest', 'Atlas Peak'], correctIndex: 1,
    explanation: 'Mount Kilimanjaro in Tanzania stands at 5,895 meters above sea level.', hint: 'Tanzanian volcano peak.', difficulty: 'easy'
  },
  {
    id: 'g4_ca_10', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'When was the commercial Polaris Dawn space mission launched?', options: ['1 Jan 2024', '10 Sep 2024', '15 Nov 2024', '4 Jul 2024'], correctIndex: 1,
    explanation: 'Polaris Dawn launched on September 10, 2024 on a Falcon 9 rocket.', hint: 'September 2024.', difficulty: 'medium'
  },
  {
    id: 'g4_ca_11', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'Which famous block-building sandbox game was adapted into a 2025 feature film?', options: ['Roblox', 'Minecraft', 'Fortnite', 'Tetris'], correctIndex: 1,
    explanation: 'A Minecraft Movie stars Jason Momoa and Jack Black.', hint: 'Mojang block game.', difficulty: 'easy'
  },
  {
    id: 'g4_ca_12', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'Which extinct ice-age apex wolf species is being targeted for de-extinction?', options: ['Tasmanian wolf', 'Dire wolf', 'Gray wolf', 'Red wolf'], correctIndex: 1,
    explanation: 'Colossal Biosciences announced de-extinction work on the Dire Wolf.', hint: 'Dire wolf.', difficulty: 'medium'
  },
  {
    id: 'g4_ca_13', gradeCode: 'grade_4', gradeName: 'Primary 4 (Grade 4)', subjectName: 'Current Affairs',
    questionText: 'Which small animal species was trained by APOPO to detect over 100 buried landmines?', options: ['Dog', 'Rat', 'Pigeon', 'Dolphin'], correctIndex: 1,
    explanation: 'African Giant Pouched Rats (HeroRats like Magawa) detect explosive scent compounds.', hint: 'HeroRats.', difficulty: 'easy'
  },

  // Grade 5 (Class 5)
  {
    id: 'g5_ca_1', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Which nation operates the "Iron Dome" missile interception system?', options: ['United States', 'Israel', 'Russia', 'France'], correctIndex: 1,
    explanation: 'The Iron Dome is Israel’s mobile all-weather air defense system.', hint: 'Air defense system.', difficulty: 'easy'
  },
  {
    id: 'g5_ca_2', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'What does UNSC stand for in global diplomacy?', options: ['United Nations Science Council', 'United Nations Security Council', 'Universal National Safety Corps', 'United Nations Social Commission'], correctIndex: 1,
    explanation: 'UNSC stands for United Nations Security Council.', hint: '15-member UN council.', difficulty: 'easy'
  },
  {
    id: 'g5_ca_3', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Where did the ancient festival of colors (Holi) originate?', options: ['Ancient Rome', 'Indian subcontinent (India and Nepal)', 'Egypt', 'Greece'], correctIndex: 1,
    explanation: 'Holi originated in the Indian subcontinent.', hint: 'India and Nepal.', difficulty: 'easy'
  },
  {
    id: 'g5_ca_4', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Which ancient Greek inventor is famed for devising a parabolic mirror "Death Ray"?', options: ['Galileo', 'Archimedes', 'Tesla', 'Aristotle'], correctIndex: 1,
    explanation: 'Archimedes used polished mirrors to focus sunlight at invading ships during the Siege of Syracuse.', hint: 'Eureka inventor.', difficulty: 'medium'
  },
  {
    id: 'g5_ca_5', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Which air force conducted the first real-world AI vs human fighter jet dogfight flight test?', options: ['Royal Air Force', 'United States Air Force', 'Indian Air Force', 'Luftwaffe'], correctIndex: 1,
    explanation: 'USAF’s X-62A VISTA aircraft flew autonomous AI dogfights at Edwards AFB.', hint: 'USAF.', difficulty: 'medium'
  },
  {
    id: 'g5_ca_6', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'What does UN SDG stand for?', options: ['United Nations Solar Development Group', 'United Nations Sustainable Development Goals', 'Universal National Safety Guidelines', 'United Nations Science Division'], correctIndex: 1,
    explanation: 'SDGs are 17 global goals adopted by the UN in 2015.', hint: '17 Sustainable Goals.', difficulty: 'easy'
  },
  {
    id: 'g5_ca_7', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Which sport does international star athlete Kylian Mbappé play?', options: ['Basketball', 'Football (Soccer)', 'Tennis', 'Cricket'], correctIndex: 1,
    explanation: 'Kylian Mbappé is a star football player for Real Madrid and France.', hint: 'Real Madrid star.', difficulty: 'easy'
  },
  {
    id: 'g5_ca_8', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Who became the first Indian woman shooter to win an Olympic medal (Paris 2024)?', options: ['Sania Mirza', 'Manu Bhaker', 'P.V. Sindhu', 'Saina Nehwal'], correctIndex: 1,
    explanation: 'Manu Bhaker won bronze in 10m Air Pistol at Paris 2024.', hint: 'Pistol shooter.', difficulty: 'medium'
  },
  {
    id: 'g5_ca_9', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Name NASA’s car-sized Mars rover that landed in Gale Crater in 2012.', options: ['Voyager', 'Curiosity', 'Apollo 11', 'Sputnik'], correctIndex: 1,
    explanation: 'Curiosity rover continues exploring Martian geology.', hint: 'Desire to learn rover.', difficulty: 'medium'
  },
  {
    id: 'g5_ca_10', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'What type of birds (like vultures) feed primarily on dead animal carcasses?', options: ['Predators', 'Scavengers', 'Herbivores', 'Parasites'], correctIndex: 1,
    explanation: 'Scavengers clean up ecosystems by consuming dead organic matter.', hint: 'Carcass feeders.', difficulty: 'easy'
  },
  {
    id: 'g5_ca_11', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Who served as the 44th and first African American President of the United States?', options: ['Martin Luther King Jr.', 'Barack Obama', 'Colin Powell', 'Kamala Harris'], correctIndex: 1,
    explanation: 'Barack Obama served two terms as U.S. President (2009-2017).', hint: '44th President.', difficulty: 'easy'
  },
  {
    id: 'g5_ca_12', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Which pop music star launched into space aboard Blue Origin across the Karman Line?', options: ['Taylor Swift', 'Katy Perry', 'Beyoncé', 'Lady Gaga'], correctIndex: 1,
    explanation: 'Katy Perry joined a commercial spaceflight mission.', hint: 'Roar singer.', difficulty: 'medium'
  },
  {
    id: 'g5_ca_13', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Who is the head of the Catholic Church and Bishop of Rome?', options: ['Pope Benedict', 'Pope Francis', 'Pope John Paul II', 'Pope Pius'], correctIndex: 1,
    explanation: 'Pope Francis has served as head of the Catholic Church since 2013.', hint: 'Pontiff Francis.', difficulty: 'easy'
  },
  {
    id: 'g5_ca_14', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Who serves as Vice President of the United States (taking office 2025)?', options: ['Kamala Harris', 'J.D. Vance', 'Mike Pence', 'Tim Walz'], correctIndex: 1,
    explanation: 'J.D. Vance was elected U.S. Vice President alongside Donald Trump.', hint: 'Author of Hillbilly Elegy.', difficulty: 'easy'
  },
  {
    id: 'g5_ca_15', gradeCode: 'grade_5', gradeName: 'Primary 5 (Grade 5)', subjectName: 'Current Affairs',
    questionText: 'Which artificial intelligence lab created ChatGPT and GPT-4o?', options: ['Google DeepMind', 'OpenAI', 'Meta AI', 'Anthropic'], correctIndex: 1,
    explanation: 'OpenAI developed ChatGPT.', hint: 'Sam Altman’s lab.', difficulty: 'easy'
  },

  // Grade 6 (Class 6)
  {
    id: 'g6_ca_1', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'Which is the most widely installed mobile operating system globally?', options: ['iOS', 'Android', 'Windows Phone', 'Symbian'], correctIndex: 1,
    explanation: 'Android holds over 70% of global smartphone market share.', hint: 'Google OS.', difficulty: 'easy'
  },
  {
    id: 'g6_ca_2', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'What is the name of ISRO’s female humanoid astronaut robot for space missions?', options: ['Sophia', 'Vyomitra', 'Robonaut', 'Astra'], correctIndex: 1,
    explanation: 'Vyomitra ("friend in space") is ISRO’s uncrewed Gaganyaan test robot.', hint: 'Vyomitra.', difficulty: 'medium'
  },
  {
    id: 'g6_ca_3', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'What was the RMS Titanic?', options: ['A submarine', 'A famous passenger liner that struck an iceberg and sank in 1912', 'A spaceship', 'A naval warship'], correctIndex: 1,
    explanation: 'Titanic sank on its maiden voyage in April 1912.', hint: 'Unsinkable liner.', difficulty: 'easy'
  },
  {
    id: 'g6_ca_4', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'What does GSI stand for in Indian earth science research?', options: ['Geological Survey of India', 'Global Science Institute', 'General Space Initiative', 'Government Security Corps'], correctIndex: 0,
    explanation: 'GSI stands for Geological Survey of India.', hint: 'Geological Survey.', difficulty: 'medium'
  },
  {
    id: 'g6_ca_5', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'Which European nation enacted body image transparency laws requiring photo edit labels?', options: ['France', 'Norway', 'Germany', 'Spain'], correctIndex: 1,
    explanation: 'Norway passed laws requiring influencers and advertisers to disclose edited photos.', hint: 'Oslo nation.', difficulty: 'medium'
  },
  {
    id: 'g6_ca_6', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'Which Southeast Asian country legally approved marriage equality in 2024?', options: ['Vietnam', 'Thailand', 'Indonesia', 'Malaysia'], correctIndex: 1,
    explanation: 'Thailand became the first Southeast Asian nation to legalize same-sex marriage.', hint: 'Bangkok nation.', difficulty: 'medium'
  },
  {
    id: 'g6_ca_7', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'Which chili pepper holds the Guinness record as the world’s hottest pepper?', options: ['Carolina Reaper', 'Pepper X', 'Bhut Jolokia', 'Habanero'], correctIndex: 1,
    explanation: 'Pepper X was bred by Ed Currie and measures ~2.69 million Scoville Heat Units.', hint: 'Ed Currie’s Pepper X.', difficulty: 'medium'
  },
  {
    id: 'g6_ca_8', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'Where in the human body is the vast gut microbiome located?', options: ['Stomach', 'Intestines', 'Lungs', 'Kidneys'], correctIndex: 1,
    explanation: 'Trillions of beneficial bacteria live in the large and small intestines.', hint: 'Digestive tract.', difficulty: 'easy'
  },
  {
    id: 'g6_ca_9', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'What is the capital city of Tripura state?', options: ['Dispur', 'Agartala', 'Shillong', 'Imphal'], correctIndex: 1,
    explanation: 'Agartala is the capital city of Tripura.', hint: 'Agartala.', difficulty: 'easy'
  },
  {
    id: 'g6_ca_10', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'Which paralytic viral disease resurfaced in Gaza in 2024 after 25 years of elimination?', options: ['Cholera', 'Polio', 'Measles', 'Malaria'], correctIndex: 1,
    explanation: 'Type 2 poliovirus cases led to emergency WHO vaccination campaigns in Gaza.', hint: 'Poliovirus.', difficulty: 'medium'
  },
  {
    id: 'g6_ca_11', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'Where is NASA’s Johnson Space Center located?', options: ['Cape Canaveral', 'Houston, Texas, USA', 'Pasadena', 'Washington D.C.'], correctIndex: 1,
    explanation: 'Johnson Space Center (Mission Control) is located in Houston, Texas.', hint: '"Houston, we have a problem".', difficulty: 'easy'
  },
  {
    id: 'g6_ca_12', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'What high-speed train technology floats above tracks using magnetic repulsion?', options: ['Bullet Train', 'Maglev', 'Hyperloop', 'TGV'], correctIndex: 1,
    explanation: 'Maglev (magnetic levitation) trains eliminate track friction to achieve 600+ km/h speeds.', hint: 'Magnetic levitation.', difficulty: 'easy'
  },
  {
    id: 'g6_ca_13', gradeCode: 'grade_6', gradeName: 'Primary 6 (Grade 6)', subjectName: 'Current Affairs',
    questionText: 'What tax on imported foreign goods was expanded by U.S. trade policies?', options: ['Subsidies', 'Tariff', 'VAT', 'Dividend'], correctIndex: 1,
    explanation: 'Tariffs are import duties levied on foreign products.', hint: 'Import tax.', difficulty: 'easy'
  },

  // Grade 7 (Class 7)
  {
    id: 'g7_ca_1', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'How many security organizations function under India’s Central Armed Police Forces (CAPFs)?', options: ['Five', 'Seven', 'Nine', 'Twelve'], correctIndex: 1,
    explanation: 'CAPF comprises 7 forces: BSF, CRPF, CISF, ITBP, SSB, NSG, and AR.', hint: 'Seven forces.', difficulty: 'medium'
  },
  {
    id: 'g7_ca_2', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'Why is atmospheric methane gas a major environmental concern?', options: ['It breaks glass windows', 'It is a potent greenhouse gas trapping atmospheric heat', 'It turns rainwater pink', 'It stops plant photosynthesis'], correctIndex: 1,
    explanation: 'Methane (CH4) traps over 28x more heat per molecule than carbon dioxide.', hint: 'Greenhouse gas.', difficulty: 'medium'
  },
  {
    id: 'g7_ca_3', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'Which U.S. state banned social media accounts for children under age 14 in 2024?', options: ['Texas', 'Florida, USA', 'California', 'New York'], correctIndex: 1,
    explanation: 'Florida passed landmark bill HB 3 prohibiting social media accounts for under-14s.', hint: 'Sunshine state.', difficulty: 'medium'
  },
  {
    id: 'g7_ca_4', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'Commercial jet fuel (aviation turbine fuel) is refined from which energy resource?', options: ['Coal', 'Crude oil (Petroleum)', 'Natural gas', 'Ethanol'], correctIndex: 1,
    explanation: 'Jet fuel is a specialized kerosene derivative refined from crude petroleum.', hint: 'Fossil crude oil.', difficulty: 'easy'
  },
  {
    id: 'g7_ca_5', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'Which city introduced environmental "Garbage Cafes" exchanging plastic trash for food vouchers?', options: ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata'], correctIndex: 1,
    explanation: 'Municipal initiatives in Delhi and Chhattisgarh offer hot meals in exchange for plastic waste.', hint: 'National capital territory.', difficulty: 'medium'
  },
  {
    id: 'g7_ca_6', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'What does IMD stand for in Indian weather forecasting?', options: ['India Meteorological Department', 'International Monetary Division', 'Integrated Marine Directorate', 'Indian Mining Dept'], correctIndex: 0,
    explanation: 'IMD is India Meteorological Department.', hint: 'Meteorological department.', difficulty: 'easy'
  },
  {
    id: 'g7_ca_7', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'Which state introduced gender-neutral occupational illustrations in school textbooks?', options: ['Tamil Nadu', 'Kerala', 'Karnataka', 'Goa'], correctIndex: 1,
    explanation: 'Kerala State Board introduced textbook pictures showing fathers cooking and women driving.', hint: 'Kerala.', difficulty: 'medium'
  },
  {
    id: 'g7_ca_8', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'In which ocean seabed was non-photosynthetic "dark oxygen" production discovered?', options: ['Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean', 'Arctic Ocean'], correctIndex: 1,
    explanation: 'Polymetallic nodules in the Clarion-Clipperton Zone of the Pacific produce oxygen via electrolysis.', hint: 'Largest ocean.', difficulty: 'hard'
  },
  {
    id: 'g7_ca_9', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'Which former U.S. President survived an assassination attempt at a July 2024 campaign rally?', options: ['Joe Biden', 'Donald Trump', 'Bill Clinton', 'George W. Bush'], correctIndex: 1,
    explanation: 'Donald Trump survived a shooting attempt in Butler, Pennsylvania.', hint: '45th/47th President.', difficulty: 'easy'
  },
  {
    id: 'g7_ca_10', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'Which major tech corporation matched 100% of its global electricity consumption with renewable energy?', options: ['Microsoft', 'Amazon', 'Meta', 'Intel'], correctIndex: 1,
    explanation: 'Amazon reached its 100% renewable energy milestone 7 years ahead of target.', hint: 'Jeff Bezos tech firm.', difficulty: 'medium'
  },
  {
    id: 'g7_ca_11', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'Who is the CEO and founder of brain-implant company Neuralink?', options: ['Sam Altman', 'Elon Musk', 'Mark Zuckerberg', 'Bill Gates'], correctIndex: 1,
    explanation: 'Elon Musk co-founded Neuralink in 2016.', hint: 'Tesla/SpaceX CEO.', difficulty: 'easy'
  },
  {
    id: 'g7_ca_12', gradeCode: 'grade_7', gradeName: 'JSS 1 (Grade 7)', subjectName: 'Current Affairs',
    questionText: 'What key copyright concern was raised by Ghibli-styled generative AI art tools?', options: ['High electricity costs', 'Unauthorized scraping of artists’ copyrighted works', 'Slow download speeds', 'File size limits'], correctIndex: 1,
    explanation: 'Artists protested that AI image generators trained on copyrighted artwork without consent.', hint: 'Artist copyright consent.', difficulty: 'medium'
  },

  // Grade 8 (Class 8)
  {
    id: 'g8_ca_1', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'What organ transplant replaces a failed liver with a healthy organ from a donor?', options: ['Dialysis', 'Liver transplant', 'Chemotherapy', 'Angioplasty'], correctIndex: 1,
    explanation: 'A liver transplant is a life-saving surgical procedure for end-stage liver disease.', hint: 'Liver replacement.', difficulty: 'easy'
  },
  {
    id: 'g8_ca_2', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'Which High Court became India’s first to hear arguments from a hearing/speech-impaired advocate using sign language?', options: ['Delhi High Court', 'Karnataka High Court', 'Bombay High Court', 'Madras High Court'], correctIndex: 1,
    explanation: 'Karnataka High Court accommodated advocate Sarah Sunny using sign language interpretation.', hint: 'Bengaluru court.', difficulty: 'medium'
  },
  {
    id: 'g8_ca_3', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'What primary sequence does C-A-B stand for in emergency CPR guidelines?', options: ['Circulation - Action - Blood', 'Compressions - Airway - Breathing', 'Care - Assessment - Bandage', 'Control - Air - Pulse'], correctIndex: 1,
    explanation: 'AHA CPR guidelines specify Compressions first, followed by Airway and Breathing.', hint: 'Chest compressions first.', difficulty: 'easy'
  },
  {
    id: 'g8_ca_4', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'Which delivery firm trained 4,300+ delivery partners in emergency lifesaving first-aid CPR?', options: ['Swiggy', 'Zomato', 'Uber Eats', 'DoorDash'], correctIndex: 1,
    explanation: 'Zomato conducted mass emergency CPR training workshops for delivery partners.', hint: 'Red app delivery firm.', difficulty: 'easy'
  },
  {
    id: 'g8_ca_5', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'Which biocompatible metal is heavily used in artificial joints and total artificial hearts (BiVACOR)?', options: ['Aluminum', 'Titanium', 'Copper', 'Lead'], correctIndex: 1,
    explanation: 'Titanium is strong, light, non-toxic, and biocompatible with human blood and tissue.', hint: 'Lightweight strong metal.', difficulty: 'medium'
  },
  {
    id: 'g8_ca_6', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'Who is the founder of e-commerce giant Amazon and space exploration company Blue Origin?', options: ['Bill Gates', 'Jeff Bezos', 'Steve Jobs', 'Larry Page'], correctIndex: 1,
    explanation: 'Jeff Bezos founded Amazon in 1994 and Blue Origin in 2000.', hint: 'Jeff Bezos.', difficulty: 'easy'
  },
  {
    id: 'g8_ca_7', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'Which specific blood cells are infected and destroyed by the HIV virus?', options: ['Red Blood Cells', 'White Blood Cells (CD4+ T-cells)', 'Platelets', 'Plasma cells'], correctIndex: 1,
    explanation: 'HIV attacks CD4+ T-lymphocyte white blood cells, weakening immune defense.', hint: 'Immune White Blood Cells.', difficulty: 'medium'
  },
  {
    id: 'g8_ca_8', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'Which scientific instrument detects and records earthquake shockwave vibrations?', options: ['Barometer', 'Seismometer (Seismograph)', 'Hygrometer', 'Altimeter'], correctIndex: 1,
    explanation: 'Seismometers record seismic waves generated by earthquakes.', hint: 'Seismograph.', difficulty: 'easy'
  },
  {
    id: 'g8_ca_9', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'In which country is the Fukushima Daiichi nuclear power complex located?', options: ['China', 'Japan', 'South Korea', 'Ukraine'], correctIndex: 1,
    explanation: 'Fukushima Daiichi is in Fukushima Prefecture, Japan.', hint: 'Japanese nuclear station.', difficulty: 'easy'
  },
  {
    id: 'g8_ca_10', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'Which logarithmic scale measures the energy released by an earthquake?', options: ['Celsius Scale', 'Richter Scale', 'Kelvin Scale', 'Beaufort Scale'], correctIndex: 1,
    explanation: 'The Richter Magnitude Scale measures earthquake seismic energy.', hint: 'Richter Scale.', difficulty: 'easy'
  },
  {
    id: 'g8_ca_11', gradeCode: 'grade_8', gradeName: 'JSS 2 (Grade 8)', subjectName: 'Current Affairs',
    questionText: 'The prehistoric "Dire" species belongs to which animal group?', options: ['Bear', 'Wolf', 'Tiger', 'Hyena'], correctIndex: 1,
    explanation: 'Dire wolves (Aenocyon dirus) were large extinct ice-age canids.', hint: 'Dire wolf.', difficulty: 'easy'
  },

  // Grade 9 (Class 9)
  {
    id: 'g9_ca_1', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'Why are General Elections conducted for the Lok Sabha in India?', options: ['To elect mayors', 'To elect Members of Parliament (MPs) who form the Central Government', 'To choose state governors', 'To select judges'], correctIndex: 1,
    explanation: 'Lok Sabha elections elect 543 MPs to form the ruling national government.', hint: 'Elect MPs.', difficulty: 'easy'
  },
  {
    id: 'g9_ca_2', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'What two fundamental components power modern Artificial Intelligence systems?', options: ['Hardware and Cables', 'Data and Algorithms', 'Monitors and Displays', 'Pixels and Cables'], correctIndex: 1,
    explanation: 'AI systems rely on algorithms (model logic) trained on vast datasets.', hint: 'Data & Algorithms.', difficulty: 'easy'
  },
  {
    id: 'g9_ca_3', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'Under which Union Ministry does the Central Reserve Police Force (CRPF) operate?', options: ['Ministry of Defence', 'Ministry of Home Affairs', 'Ministry of External Affairs', 'Ministry of Law'], correctIndex: 1,
    explanation: 'CRPF functions under India’s Ministry of Home Affairs.', hint: 'Home Affairs.', difficulty: 'medium'
  },
  {
    id: 'g9_ca_4', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'Which cybersecurity firm caused a worldwide IT outage via a broken kernel update in 2024?', options: ['McAfee', 'CrowdStrike', 'Norton', 'Kaspersky'], correctIndex: 1,
    explanation: 'CrowdStrike’s Falcon sensor update triggered blue screens globally.', hint: 'CrowdStrike.', difficulty: 'medium'
  },
  {
    id: 'g9_ca_5', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'What legal property right protects inventors from unauthorized copying of their inventions?', options: ['Copyright', 'Patent', 'Trademark', 'Trade Secret'], correctIndex: 1,
    explanation: 'Patents grant exclusive rights to inventors for a limited period.', hint: 'Patent right.', difficulty: 'easy'
  },
  {
    id: 'g9_ca_6', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'Which sport made David Beckham an international celebrity?', options: ['Cricket', 'Football (Soccer)', 'Tennis', 'Golf'], correctIndex: 1,
    explanation: 'David Beckham is an iconic English football midfielder.', hint: 'English football star.', difficulty: 'easy'
  },
  {
    id: 'g9_ca_7', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'What severe chronic condition can develop if HIV infection is left untreated?', options: ['Lupus', 'AIDS', 'Scurvy', 'Diabetes'], correctIndex: 1,
    explanation: 'Untreated HIV progresses to Acquired Immunodeficiency Syndrome (AIDS).', hint: 'AIDS.', difficulty: 'easy'
  },
  {
    id: 'g9_ca_8', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'Who was chosen as prime astronaut for the joint ISRO-NASA Axiom-4 ISS space mission?', options: ['Rakesh Sharma', 'Group Captain Shubhanshu Shukla', 'Prasanth Nair', 'Ajit Krishnan'], correctIndex: 1,
    explanation: 'Shubhanshu Shukla was selected for the Axiom-4 ISS flight.', hint: 'Shubhanshu Shukla.', difficulty: 'medium'
  },
  {
    id: 'g9_ca_9', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'Which major tech companies are led by Elon Musk as CEO or founder?', options: ['Apple, Google, Microsoft, Meta', 'SpaceX, Neuralink, X, and xAI', 'Amazon, Intel, Nvidia, AMD', 'Oracle, IBM, Cisco, Uber'], correctIndex: 1,
    explanation: 'Elon Musk leads SpaceX, Neuralink, X, xAI, and Tesla.', hint: 'SpaceX, Neuralink, X.', difficulty: 'easy'
  },
  {
    id: 'g9_ca_10', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'Who captained Team India to victory in the 2025 ICC Champions Trophy?', options: ['Virat Kohli', 'Rohit Sharma', 'Hardik Pandya', 'KL Rahul'], correctIndex: 1,
    explanation: 'Rohit Sharma captained India to the 2025 Champions Trophy title.', hint: 'Rohit Sharma.', difficulty: 'easy'
  },
  {
    id: 'g9_ca_11', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'Which NASA astronaut returned to Earth after an extended 286-day stay aboard the ISS?', options: ['Peggy Whitson', 'Sunita Williams', 'Christina Koch', 'Jessica Meir'], correctIndex: 1,
    explanation: 'Sunita Williams completed an extended orbital stay aboard the ISS.', hint: 'Sunita Williams.', difficulty: 'easy'
  },
  {
    id: 'g9_ca_12', gradeCode: 'grade_9', gradeName: 'JSS 3 (Grade 9)', subjectName: 'Current Affairs',
    questionText: 'On which continent did APOPO use trained pouch rats to locate underground landmines?', options: ['Europe', 'Africa', 'South America', 'Australia'], correctIndex: 1,
    explanation: 'HeroRats operate extensively in African nations like Tanzania and Mozambique.', hint: 'African continent.', difficulty: 'easy'
  },

  // Grade 10 (Class 10)
  {
    id: 'g10_ca_1', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'What breakthrough capability does Neuralink’s brain chip implant afford paralyzed patients?', options: ['Infinite memory storage', 'Direct thought control of computers and digital cursor', 'X-ray vision', 'Teleportation'], correctIndex: 1,
    explanation: 'Neuralink’s N1 implant decodes motor intent signals to control computer interfaces.', hint: 'Thought computer control.', difficulty: 'medium'
  },
  {
    id: 'g10_ca_2', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'What was unveiled as the world’s first autonomous AI Software Engineer?', options: ['GitHub Copilot', 'Devin', 'ChatGPT', 'Claude 3'], correctIndex: 1,
    explanation: 'Devin, developed by Cognition, can plan, code, and deploy complex apps autonomously.', hint: 'Devin by Cognition.', difficulty: 'medium'
  },
  {
    id: 'g10_ca_3', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'Which robotics manufacturer launched "Thermonator", a flamethrower-equipped quadruped robot dog?', options: ['Boston Dynamics', 'Throwflame', 'Tesla Robotics', 'Agility Robotics'], correctIndex: 1,
    explanation: 'Throwflame developed Thermonator for wildfire control and industrial burns.', hint: 'Throwflame.', difficulty: 'medium'
  },
  {
    id: 'g10_ca_4', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'Which constitutional authority conducts parliamentary and state elections in India?', options: ['Supreme Court', 'Election Commission of India (ECI)', 'Law Commission', 'Union Public Service Commission'], correctIndex: 1,
    explanation: 'The Election Commission of India (ECI) administers national election processes.', hint: 'ECI.', difficulty: 'easy'
  },
  {
    id: 'g10_ca_5', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'Who serves as Union Minister of Education in India?', options: ['Ramesh Pokhriyal', 'Dharmendra Pradhan', 'Smriti Irani', 'Prakash Javadekar'], correctIndex: 1,
    explanation: 'Dharmendra Pradhan serves as Cabinet Minister of Education.', hint: 'Dharmendra Pradhan.', difficulty: 'easy'
  },
  {
    id: 'g10_ca_6', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'Who was the founder of the global industrial conglomerate Hinduja Group?', options: ['Gopichand Hinduja', 'Parmanand Deepchand Hinduja', 'Srichand Hinduja', 'Prakash Hinduja'], correctIndex: 1,
    explanation: 'Parmanand Deepchand Hinduja founded the group in 1914 in Mumbai/Sindh.', hint: 'Parmanand Hinduja.', difficulty: 'medium'
  },
  {
    id: 'g10_ca_7', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'Who is Leader of the Opposition in the 18th Lok Sabha?', options: ['Adhir Ranjan Chowdhury', 'Rahul Gandhi', 'Mallikarjun Kharge', 'Akhilesh Yadav'], correctIndex: 1,
    explanation: 'Rahul Gandhi assumed Leader of the Opposition in Lok Sabha in 2024.', hint: 'Rahul Gandhi.', difficulty: 'easy'
  },
  {
    id: 'g10_ca_8', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'Which animation studio produced the blockbuster Shrek movie franchise?', options: ['Pixar', 'DreamWorks Animation', 'Walt Disney Animation', 'Illumination'], correctIndex: 1,
    explanation: 'DreamWorks Animation produced Shrek, How to Train Your Dragon, and Kung Fu Panda.', hint: 'DreamWorks.', difficulty: 'easy'
  },
  {
    id: 'g10_ca_9', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'Which virus targets human CD4 T-cells and causes AIDS if untreated?', options: ['Hepatitis B', 'HIV', 'Influenza', 'Ebola'], correctIndex: 1,
    explanation: 'HIV (Human Immunodeficiency Virus) attacks immune cells.', hint: 'Human Immunodeficiency Virus.', difficulty: 'easy'
  },
  {
    id: 'g10_ca_10', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'What industry sector forms the primary legacy operations of The Trump Organization?', options: ['Aviation', 'Commercial & Residential Real Estate', 'Automotive', 'Pharmaceuticals'], correctIndex: 1,
    explanation: 'The Trump Organization is a luxury real estate development conglomerate.', hint: 'Real estate.', difficulty: 'easy'
  },
  {
    id: 'g10_ca_11', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'What constitutional body officially elects the U.S. President based on state electors?', options: ['The Supreme Court', 'The Electoral College', 'The Senate', 'Popular Vote Committee'], correctIndex: 1,
    explanation: '538 electors in the Electoral College cast formal votes for President and VP.', hint: 'Electoral College.', difficulty: 'medium'
  },
  {
    id: 'g10_ca_12', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'What is the internationally recognized boundary line defining the edge of outer space (100 km altitude)?', options: ['Stratosphere Limit', 'Kármán Line', 'Armstrong Limit', 'Van Allen Belt'], correctIndex: 1,
    explanation: 'The Kármán Line at 100 km altitude marks the boundary between aeronautics and astronautics.', hint: 'Kármán Line.', difficulty: 'medium'
  },
  {
    id: 'g10_ca_13', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'In which independent city-state enclave is the Pope based?', options: ['Rome', 'Vatican City', 'Florence', 'Venice'], correctIndex: 1,
    explanation: 'Vatican City is an independent city-state enclave inside Rome.', hint: 'Vatican City.', difficulty: 'easy'
  },
  {
    id: 'g10_ca_14', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'What position does J.D. Vance hold in the U.S. executive branch?', options: ['Speaker of the House', 'Vice President of the United States', 'Secretary of State', 'Senate Leader'], correctIndex: 1,
    explanation: 'J.D. Vance serves as Vice President of the United States.', hint: 'U.S. Vice President.', difficulty: 'easy'
  },
  {
    id: 'g10_ca_15', gradeCode: 'grade_10', gradeName: 'SS 1 (Grade 10)', subjectName: 'Current Affairs',
    questionText: 'Which frontier AI model family is OpenAI best known for creating?', options: ['Gemini', 'ChatGPT (GPT-4)', 'Claude', 'Llama'], correctIndex: 1,
    explanation: 'OpenAI created ChatGPT powered by GPT-4 and GPT-4o.', hint: 'ChatGPT.', difficulty: 'easy'
  },
];

export function getCurriculumQuestionsByGrade(gradeCode: string): CurriculumQuestion[] {
  return OFFICIAL_CURRICULUM_QUESTIONS.filter(q => q.gradeCode === gradeCode);
}

export function getCurriculumQuestionsBySubject(subjectName: string): CurriculumQuestion[] {
  const norm = subjectName.toLowerCase();
  return OFFICIAL_CURRICULUM_QUESTIONS.filter(q => q.subjectName.toLowerCase().includes(norm) || norm.includes(q.subjectName.toLowerCase()));
}
