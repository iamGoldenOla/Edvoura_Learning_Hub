/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EDVOURA CURRICULUM WORKSHEET GENERATOR ENGINE
 * ══════════════════════════════════════════════════════════════════════════════
 * Generates authentic, rigorous, curriculum-aligned printable & annotatable
 * worksheets with REAL questions, real numbers, concrete word problems, and
 * full step-by-step teacher answer keys.
 */

export interface WorksheetQuestion {
  number: number;
  question: string;
  hint?: string;
  answerSpaceLines: number;
  options?: string[];
  answer: string;
}

export interface GeneratedWorksheet {
  title: string;
  subject: string;
  grade: string;
  instructions: string;
  questions: WorksheetQuestion[];
  bonusChallenge?: string;
  answerKey: string[];
}

interface GeneratorParams {
  topic: string;
  subject: string;
  gradeLevel: string;
  difficulty: 'Foundation' | 'Standard' | 'Advanced';
  questionCount: number;
  pupilName?: string;
}

// Helper random choice & range
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const STUDENT_NAMES = ['Titomi', 'Kendrick', 'David', 'Amara', 'Fatima', 'Michael', 'Chloe', 'Zainab', 'Kemi', 'Tariq'];

/**
 * Procedurally generates authentic, curriculum-grade questions
 * based on subject and topic keywords.
 */
export function generateCurriculumWorksheet(params: GeneratorParams): GeneratedWorksheet {
  const { topic, subject, gradeLevel, difficulty, questionCount, pupilName } = params;
  const name = pupilName && pupilName !== 'Pupil' ? pupilName : randPick(STUDENT_NAMES);
  const normalizedTopic = topic.toLowerCase();

  const questions: WorksheetQuestion[] = [];
  const answerKey: string[] = [];

  // =========================================================================
  // 1. MATHEMATICS
  // =========================================================================
  if (subject.toLowerCase().includes('math') || normalizedTopic.includes('multipli') || normalizedTopic.includes('fraction') || normalizedTopic.includes('divis')) {
    
    // -----------------------------------------------------------------------
    // A. Long Multiplication & Word Problems
    // -----------------------------------------------------------------------
    if (normalizedTopic.includes('multipli') || normalizedTopic.includes('product') || normalizedTopic.includes('times')) {
      const calcCount = Math.ceil(questionCount / 2);
      const wordCount = questionCount - calcCount;

      // Pure Calculation Problems
      for (let i = 0; i < calcCount; i++) {
        let num1 = 0;
        let num2 = 0;

        if (difficulty === 'Foundation') {
          num1 = randInt(25, 95);
          num2 = randInt(12, 19);
        } else if (difficulty === 'Advanced') {
          num1 = randInt(350, 980);
          num2 = randInt(35, 88);
        } else {
          // Standard Grade 4-6
          num1 = randInt(125, 650);
          num2 = randInt(16, 45);
        }

        const product = num1 * num2;
        const qNum = i + 1;
        questions.push({
          number: qNum,
          question: `Calculate: ${num1.toLocaleString()} × ${num2}. Show your column multiplication steps clearly with regrouping.`,
          hint: `Multiply by the units digit first (${num1} × ${num2 % 10}), then multiply by the tens digit (${num1} × ${Math.floor(num2 / 10) * 10}), then add the two partial products.`,
          answerSpaceLines: 4,
          answer: `${product.toLocaleString()} (Steps: ${num1} × ${num2 % 10} = ${(num1 * (num2 % 10)).toLocaleString()}; ${num1} × ${Math.floor(num2 / 10) * 10} = ${(num1 * (Math.floor(num2 / 10) * 10)).toLocaleString()}; Total = ${product.toLocaleString()})`,
        });
        answerKey.push(`Q${qNum}: ${num1} × ${num2} = ${product.toLocaleString()}`);
      }

      // Real-World Word Problems
      const wordTemplates = [
        () => {
          const boxes = randInt(15, 38);
          const perBox = randInt(24, 60);
          const total = boxes * perBox;
          return {
            q: `A school ordered ${boxes} boxes of exercise books for the new academic term. Each box contains ${perBox} books. How many exercise books did the school receive altogether?`,
            hint: `Multiply total boxes (${boxes}) by books per box (${perBox}).`,
            ans: `${total.toLocaleString()} books (${boxes} × ${perBox} = ${total.toLocaleString()})`,
          };
        },
        () => {
          const weeks = randInt(12, 26);
          const weekly = randInt(45, 125);
          const total = weeks * weekly;
          return {
            q: `${name} saves £${weekly} every week towards a new computer and robotics kit. How much money will ${name} have saved in total after ${weeks} weeks?`,
            hint: `Total savings = weekly amount (£${weekly}) × number of weeks (${weeks}).`,
            ans: `£${total.toLocaleString()} (£${weekly} × ${weeks} = £${total.toLocaleString()})`,
          };
        },
        () => {
          const rows = randInt(18, 36);
          const seats = randInt(22, 48);
          const total = rows * seats;
          return {
            q: `The National Children's Theatre has ${rows} rows of seats. Each row has ${seats} seats. If all tickets are sold for the evening performance, how many spectators will be seated?`,
            hint: `Capacity = rows (${rows}) × seats per row (${seats}).`,
            ans: `${total.toLocaleString()} spectators (${rows} × ${seats} = ${total.toLocaleString()})`,
          };
        },
        () => {
          const days = randInt(14, 30);
          const rate = randInt(120, 240);
          const total = days * rate;
          return {
            q: `A local bakery produces ${rate} loaves of fresh artisan bread each morning. How many loaves will the bakery produce over a period of ${days} days?`,
            hint: `Multiply daily production (${rate}) by total days (${days}).`,
            ans: `${total.toLocaleString()} loaves (${rate} × ${days} = ${total.toLocaleString()})`,
          };
        },
        () => {
          const pupils = randInt(28, 45);
          const cost = randInt(35, 68);
          const total = pupils * cost;
          return {
            q: `A class of ${pupils} students is going on an educational trip to the Science Museum. If each ticket costs £${cost}, what is the total cost of tickets for the whole class?`,
            hint: `Total cost = number of pupils (${pupils}) × ticket price (£${cost}).`,
            ans: `£${total.toLocaleString()} (${pupils} × £${cost} = £${total.toLocaleString()})`,
          };
        },
        () => {
          const cartons = randInt(24, 52);
          const packs = randInt(18, 35);
          const total = cartons * packs;
          return {
            q: `A supermarket warehouse received a shipment of ${cartons} cartons of fruit juice. Each carton contains ${packs} packs. How many packs of juice arrived in the shipment?`,
            hint: `Multiply cartons (${cartons}) by packs per carton (${packs}).`,
            ans: `${total.toLocaleString()} juice packs (${cartons} × ${packs} = ${total.toLocaleString()})`,
          };
        },
      ];

      for (let j = 0; j < wordCount; j++) {
        const template = wordTemplates[j % wordTemplates.length]();
        const qNum = calcCount + j + 1;
        questions.push({
          number: qNum,
          question: template.q,
          hint: template.hint,
          answerSpaceLines: 4,
          answer: template.ans,
        });
        answerKey.push(`Q${qNum}: ${template.ans}`);
      }
    }

    // -----------------------------------------------------------------------
    // B. Fractions & Decimals
    // -----------------------------------------------------------------------
    else if (normalizedTopic.includes('fraction') || normalizedTopic.includes('decimal')) {
      const fractionPairs = [
        { q: `Calculate: 2/5 + 1/3. Give your answer as a simplified fraction.`, ans: `11/15 (LCM of 5 and 3 is 15. 6/15 + 5/15 = 11/15)` },
        { q: `Calculate: 3/4 - 2/7. Show common denominator working.`, ans: `13/28 (LCM of 4 and 7 is 28. 21/28 - 8/28 = 13/28)` },
        { q: `Find 3/8 of £240. Show your working.`, ans: `£90 (Divide £240 by 8 = £30. Then multiply £30 × 3 = £90)` },
        { q: `Convert the fraction 7/20 into both a decimal and a percentage.`, ans: `Decimal: 0.35; Percentage: 35% (7/20 = 35/100 = 0.35 = 35%)` },
        { q: `${name} has a ribbon of length 4 1/2 metres. If ${name} cuts off 1 3/4 metres for an art project, how much ribbon remains?`, ans: `2 3/4 metres (4 2/4 - 1 3/4 = 2 3/4 m)` },
        { q: `Order these fractions from smallest to largest: 1/2, 3/5, 4/10, 7/10.`, ans: `4/10, 1/2 (5/10), 3/5 (6/10), 7/10` },
        { q: `Calculate: 5/6 × 2/3. Simplify your answer.`, ans: `5/9 (10/18 simplifies to 5/9 by dividing top and bottom by 2)` },
        { q: `In a class of 30 pupils, 2/5 walk to school and 1/3 take the bus. The rest travel by car. How many pupils travel by car?`, ans: `8 pupils (Walk: 12, Bus: 10. Total 22. Car = 30 - 22 = 8)` },
      ];

      for (let i = 0; i < Math.min(questionCount, fractionPairs.length); i++) {
        const item = fractionPairs[i];
        const qNum = i + 1;
        questions.push({
          number: qNum,
          question: item.q,
          answerSpaceLines: 4,
          answer: item.ans,
        });
        answerKey.push(`Q${qNum}: ${item.ans}`);
      }
    }

    // -----------------------------------------------------------------------
    // C. General Math & Word Problems Fallback
    // -----------------------------------------------------------------------
    else {
      const generalMath = [
        { q: `Solve: 548 + 389. Show your column addition with carrying.`, ans: `937` },
        { q: `Calculate: 800 - 347. Show your borrowing/regrouping across zeros.`, ans: `453` },
        { q: `A train departs at 09:45 and arrives at its destination at 12:20. How long did the journey take in hours and minutes?`, ans: `2 hours and 35 minutes` },
        { q: `A rectangular playground has a length of 24 metres and a width of 15 metres. Calculate: (a) Its perimeter (b) Its area.`, ans: `(a) Perimeter = 2 × (24 + 15) = 78m; (b) Area = 24 × 15 = 360m²` },
        { q: `${name} bought 4 books at £7.50 each and a pencil case for £4.25. How much change does ${name} get from a £50 note?`, ans: `£15.75 (Books: £30. Total spent: £34.25. Change: £50 - £34.25 = £15.75)` },
        { q: `Divide 432 by 6 using short division. Show the remainder if any.`, ans: `72 with no remainder` },
        { q: `Round 34,862 to: (a) The nearest ten (b) The nearest hundred (c) The nearest thousand.`, ans: `(a) 34,860; (b) 34,900; (c) 35,000` },
        { q: `Find the value of x in the algebraic equation: 3x + 14 = 41.`, ans: `x = 9 (3x = 41 - 14 = 27; x = 27 ÷ 3 = 9)` },
      ];

      for (let i = 0; i < Math.min(questionCount, generalMath.length); i++) {
        const item = generalMath[i];
        const qNum = i + 1;
        questions.push({
          number: qNum,
          question: item.q,
          answerSpaceLines: 4,
          answer: item.ans,
        });
        answerKey.push(`Q${qNum}: ${item.ans}`);
      }
    }

    return {
      title: `${topic} - Master Practice Worksheet`,
      subject: 'Mathematics',
      grade: gradeLevel,
      instructions: 'Read each question carefully. Write your full working, unit labels, and final answer in the spaces provided.',
      questions,
      bonusChallenge: `🌟 Bonus Brain Teaser: A farmer planted 28 rows of maize with 45 seeds in each row, and 16 rows of beans with 32 seeds in each row. How many seeds were planted in total? (Maize: 1,260 + Beans: 512 = 1,772 seeds)`,
      answerKey,
    };
  }

  // =========================================================================
  // 2. ENGLISH & PHONICS
  // =========================================================================
  if (subject.toLowerCase().includes('english') || subject.toLowerCase().includes('phonic') || normalizedTopic.includes('comprehension') || normalizedTopic.includes('grammar')) {
    const englishQuestions = [
      {
        q: `Identify and underline the ADVERB in this sentence, then state what verb it describes:\n"The brilliant young mathematician solved the puzzle effortlessly."`,
        ans: `Adverb: effortlessly. It describes the verb: solved.`,
      },
      {
        q: `Rewrite the following sentence with correct punctuation and capital letters:\n"titomi shouted watch out for the falling ball"`,
        ans: `Titomi shouted, "Watch out for the falling ball!"`,
      },
      {
        q: `Complete each sentence by adding a suitable SIMILE:\n(a) The sprinter ran as fast as _______________.\n(b) Her smile was as bright as _______________.`,
        ans: `(a) lightning / the wind; (b) the morning sun / a diamond.`,
      },
      {
        q: `Choose the correct homophone for each sentence:\n(a) We need to buy [there / their / they're] tickets today.\n(b) The ship sailed across the stormy [sea / see].`,
        ans: `(a) their; (b) sea.`,
      },
      {
        q: `Write two complex sentences using the conjunctions "although" and "because". Underline the subordinate clause in each.`,
        ans: `Example: "Although it was raining heavily, the students continued their football practice."`,
      },
      {
        q: `Add the prefix 'un-', 'dis-', or 'mis-' to each root word to create its opposite:\n(a) honest → _________\n(b) understand → _________\n(c) certain → _________`,
        ans: `(a) dishonest; (b) misunderstand; (c) uncertain.`,
      },
      {
        q: `Read this short passage: "The antique clock chimed twelve solemn times. Outside, a branch scratched against the glass like tapping fingers."\nWhat mood does the author create, and which words show this?`,
        ans: `Eerie / suspenseful / mysterious mood. Words: "solemn", "scratched", "tapping fingers".`,
      },
      {
        q: `Write a powerful 4-line description of an erupting volcano using at least one metaphor and one piece of alliteration.`,
        ans: `Sample: "The fiery mountain was an angry dragon spitting molten gold. Sizzling smoke swept silently into the darkened sky."`,
      },
    ];

    for (let i = 0; i < Math.min(questionCount, englishQuestions.length); i++) {
      const item = englishQuestions[i];
      const qNum = i + 1;
      questions.push({
        number: qNum,
        question: item.q,
        answerSpaceLines: 4,
        answer: item.ans,
      });
      answerKey.push(`Q${qNum}: ${item.ans}`);
    }

    return {
      title: `${topic} - Grammar & Comprehension Sheet`,
      subject: 'English Studies',
      grade: gradeLevel,
      instructions: 'Read each prompt carefully. Answer in full sentences using accurate grammar, spelling, and punctuation.',
      questions,
      bonusChallenge: `🌟 Bonus Vocabulary Quest: What is the meaning of the word "PERSEVERANCE"? Use it correctly in a sentence about learning.`,
      answerKey,
    };
  }

  // =========================================================================
  // 3. SCIENCE
  // =========================================================================
  const scienceQuestions = [
    {
      q: `Name the three main states of matter and describe how the particles are arranged in each state.`,
      ans: `Solid (particles tightly packed in fixed pattern), Liquid (particles close together but free to slide past one another), Gas (particles far apart moving rapidly in all directions).`,
    },
    {
      q: `Explain what happens during the process of EVAPORATION, and give one real-life example you observe at home.`,
      ans: `Evaporation is the transition of a liquid into a gas when heated. Real-life example: Puddles drying up in the sun or wet clothes drying on a washing line.`,
    },
    {
      q: `What is the primary role of chlorophyll in green leaves during photosynthesis?`,
      ans: `Chlorophyll traps light energy from the sun, which the plant uses to convert carbon dioxide and water into glucose (food) and oxygen.`,
    },
    {
      q: `Describe the difference between FRICTION and GRAVITY, and explain why friction is helpful when walking on ice versus concrete.`,
      ans: `Gravity pulls objects toward the centre of the Earth. Friction opposes motion between two surfaces in contact. Concrete provides high friction so shoes do not slip; ice has low friction causing slipping.`,
    },
    {
      q: `In an electric circuit, what is the function of: (a) The battery (b) The switch (c) The wire?`,
      ans: `(a) Battery provides electrical energy/voltage; (b) Switch opens or closes the circuit to control current; (c) Wires conduct electric charge.`,
    },
    {
      q: `Name the four inner rocky planets of our Solar System in order of distance from the Sun.`,
      ans: `Mercury, Venus, Earth, Mars.`,
    },
  ];

  for (let i = 0; i < Math.min(questionCount, scienceQuestions.length); i++) {
    const item = scienceQuestions[i];
    const qNum = i + 1;
    questions.push({
      number: qNum,
      question: item.q,
      answerSpaceLines: 4,
      answer: item.ans,
    });
    answerKey.push(`Q${qNum}: ${item.ans}`);
  }

  return {
    title: `${topic} - Science Investigation Sheet`,
    subject: subject || 'Science',
    grade: gradeLevel,
    instructions: 'Answer each question thoroughly using correct scientific terminology and clear diagrams where requested.',
    questions,
    bonusChallenge: `🌟 Scientist's Brain Teaser: Why do astronauts float inside the International Space Station even though Earth's gravity is still 90% as strong there? (Answer: Because they are in continuous free-fall around the Earth!)`,
    answerKey,
  };
}
