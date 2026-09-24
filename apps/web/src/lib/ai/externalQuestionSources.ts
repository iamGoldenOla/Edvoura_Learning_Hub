import { QuestionInput } from './questionBankService';

export interface ExternalQuestionInput extends QuestionInput {
  source?: string;
}

export async function fetchFromALOC(subject: string, examType: string, year: string): Promise<ExternalQuestionInput[]> {
  const url = `https://questions.aloc.ng/api/v2/q?subject=${encodeURIComponent(subject)}&type=${encodeURIComponent(examType)}&year=${encodeURIComponent(year)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : []);
    
    return items.map((item: any) => {
      const optionsArray = item.option ? Object.values(item.option as Record<string, string>) : [];
      let correctAnswer = '';
      if (item.answer && item.option && item.option[item.answer]) {
        correctAnswer = item.option[item.answer];
      } else {
        correctAnswer = item.answer || optionsArray[0] || 'Unknown';
      }
      
      return {
        question_text: item.question || 'Unknown Question',
        options: optionsArray as string[],
        correct_answer: correctAnswer,
        explanation: item.solution || 'No explanation provided.',
        topic: item.section || 'General',
        curriculum_region: 'NG', // Assuming ALOC is Nigeria based on the NG domain
        subject: subject,
        grade_band: '10-12', // Assuming UTME is senior secondary
        source: 'aloc'
      };
    });
  } catch (error) {
    console.error('Error fetching from ALOC:', error);
    return [];
  }
}

export async function fetchFromOpenTriviaDB(amount: number, category: string, difficulty: string): Promise<ExternalQuestionInput[]> {
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    // Helper to decode HTML entities basic
    const decodeHtml = (html: string) => {
      return html
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    };

    if (!data.results) return [];

    return data.results.map((item: any) => {
      const options = [item.correct_answer, ...item.incorrect_answers].map(decodeHtml);
      // shuffle options briefly
      options.sort(() => Math.random() - 0.5);
      
      return {
        question_text: decodeHtml(item.question),
        options,
        correct_answer: decodeHtml(item.correct_answer),
        explanation: 'Sourced from OpenTriviaDB.',
        topic: item.category || 'Trivia',
        curriculum_region: 'GLOBAL',
        subject: 'General Knowledge',
        grade_band: 'Any',
        source: 'opentdb'
      };
    });
  } catch (error) {
    console.error('Error fetching from OpenTriviaDB:', error);
    return [];
  }
}

export async function fetchFromSdashAPI(subject: string, examType: string, year: string): Promise<ExternalQuestionInput[]> {
  if (!process.env.SDASH_API_KEY) {
    console.warn('SDASH_API_KEY not set.');
    return [];
  }
  // Placeholder implementation
  return [{
    question_text: `Placeholder SDASH question for ${subject}`,
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 'A',
    explanation: 'Placeholder explanation',
    topic: 'Placeholder Topic',
    curriculum_region: 'IN',
    subject,
    grade_band: '10-12',
    source: 'sdashapi'
  }];
}

export async function fetchFromMyQuest(subject: string, examType: string): Promise<ExternalQuestionInput[]> {
  if (!process.env.MYQUEST_API_TOKEN) {
    console.warn('MYQUEST_API_TOKEN not set.');
    return [];
  }
  // Placeholder implementation
  return [{
    question_text: `Placeholder MyQuest question for ${subject}`,
    options: ['True', 'False'],
    correct_answer: 'True',
    explanation: 'Placeholder explanation',
    topic: 'Placeholder Topic',
    curriculum_region: 'US',
    subject,
    grade_band: '9-12',
    source: 'myquest'
  }];
}

export async function fetchFromMMLU(subject: string, split: string): Promise<ExternalQuestionInput[]> {
  // Placeholder for MMLU CSV parsing
  // Reads from the MMLU CSV dataset format (subject CSVs with columns: question, A, B, C, D, answer)
  return [{
    question_text: `Placeholder MMLU question for ${subject} split ${split}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_answer: 'Option A',
    explanation: 'MMLU dataset answer',
    topic: subject,
    curriculum_region: 'GLOBAL',
    subject: subject,
    grade_band: '10-12',
    source: 'mmlu'
  }];
}

export async function fetchFromARC(difficulty: string): Promise<ExternalQuestionInput[]> {
  // Placeholder for ARC JSON parsing
  const gradeBand = difficulty.toLowerCase() === 'easy' ? '4-6' : '7-9';
  return [{
    question_text: `Placeholder ARC question, difficulty ${difficulty}`,
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 'A',
    explanation: 'ARC dataset answer',
    topic: 'Science',
    curriculum_region: 'GLOBAL',
    subject: 'Science',
    grade_band: gradeBand,
    source: 'arc'
  }];
}
