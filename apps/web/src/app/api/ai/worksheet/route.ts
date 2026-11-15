import { NextRequest, NextResponse } from 'next/server';
import { generateDirectTextWithFallback, extractJsonPayload } from '@/lib/ai';
import { generateCurriculumWorksheet } from '@/lib/curriculum/worksheetGenerator';

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

CRITICAL INSTRUCTIONS:
- Every question MUST be a real, complete, concrete question with specific numbers, word problems, and real-world scenarios.
- NEVER write placeholders like "Solve problem #1 on topic" or "Calculate problem 2".
- Include specific names like "${pupilName}", Kendrick, David, or Amara in word problems.
- Provide full step-by-step solutions in the answerKey.

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
        if (
          parsed &&
          parsed.title &&
          Array.isArray(parsed.questions) &&
          parsed.questions.length > 0 &&
          !parsed.questions[0].question.includes('Solve problem #')
        ) {
          return NextResponse.json({ worksheet: parsed });
        }
      }
    } catch (aiErr) {
      console.warn('AI direct generation fallback triggered:', aiErr);
    }

    // High-quality procedural curriculum generator (guaranteed real questions)
    const proceduralWorksheet = generateCurriculumWorksheet({
      topic,
      subject,
      gradeLevel,
      difficulty,
      questionCount,
      pupilName,
    });

    return NextResponse.json({ worksheet: proceduralWorksheet });
  } catch (error: any) {
    console.error('Worksheet API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
