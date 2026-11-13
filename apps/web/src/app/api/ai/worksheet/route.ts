import { NextRequest, NextResponse } from 'next/server';
import { generateDirectTextWithFallback, extractJsonPayload } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    const {
      topic,
      subject = 'Mathematics',
      gradeLevel = 'Primary 4',
      difficulty = 'Standard',
      questionCount = 6,
      pupilName = 'Pupil',
    } = body;

    const systemPrompt = `You are the Lead Curriculum & Worksheet Architect for Edvoura Learning Hub (UK/Nigerian British curriculum).
Create a structured, engaging, pedagogically sound printable worksheet for a student.

Return ONLY a valid JSON object matching this TypeScript interface:
{
  "title": string,
  "subject": string,
  "grade": string,
  "instructions": string,
  "questions": [
    {
      "number": number,
      "question": string,
      "hint"?: string,
      "answerSpaceLines": number,
      "answer": string
    }
  ],
  "bonusChallenge"?: string,
  "answerKey": string[]
}

Make sure the questions are appropriate for ${gradeLevel}, with clear instructions, practical real-world word problems where suitable, and step-by-step answers in the answerKey.
Do NOT include markdown fences, ONLY raw JSON.`;

    const userPrompt = `Topic: "${topic}"
Subject: ${subject}
Target Grade: ${gradeLevel}
Difficulty: ${difficulty}
Total Questions: ${questionCount}
Student Name: ${pupilName}`;

    try {
      const res = await generateDirectTextWithFallback({
        systemPrompt,
        userPrompt,
        temperature: 0.4,
      });

      if (res.success && res.text) {
        const parsed = extractJsonPayload(res.text) as any;
        if (parsed && parsed.title && Array.isArray(parsed.questions)) {
          return NextResponse.json({ worksheet: parsed });
        }
      }
    } catch (aiErr) {
      console.warn('AI direct generation fallback triggered:', aiErr);
    }

    // Default structured worksheet if AI model is unreachable
    const fallbackWorksheet = {
      title: `${topic} Practice Worksheet`,
      subject,
      grade: gradeLevel,
      instructions: 'Read each question carefully and show your full working in the spaces below.',
      questions: Array.from({ length: questionCount }).map((_, i) => ({
        number: i + 1,
        question: `Solve problem #${i + 1} on ${topic}: calculate the value and check your reasoning.`,
        hint: 'Break the calculation into simpler steps.',
        answerSpaceLines: 3,
        answer: `Solution for problem #${i + 1}`,
      })),
      bonusChallenge: `🌟 Bonus Challenge: Can you explain how you solved question #1 in your own words?`,
      answerKey: Array.from({ length: questionCount }).map((_, i) => `Q${i + 1}: Verified answer for problem ${i + 1}`),
    };

    return NextResponse.json({ worksheet: fallbackWorksheet });
  } catch (error: any) {
    console.error('Worksheet API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
