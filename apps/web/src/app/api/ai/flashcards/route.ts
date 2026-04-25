import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, topic, gradeLevel } = await request.json();

    if (!subject || !topic || !gradeLevel) {
      return NextResponse.json({ error: 'Missing subject, topic or gradeLevel' }, { status: 400 });
    }

    const prompt = `Generate 10 educational flashcards for a ${gradeLevel} student.
Subject: ${subject}
Topic: ${topic}

Each flashcard must have a "front" (question or concept) and a "back" (answer or explanation).
Make them engaging, simple, and age-appropriate.

Return ONLY a JSON array of objects with "front" and "back" keys.
Example:
[
  {"front": "What is 2+2?", "back": "4"},
  {"front": "The red planet", "back": "Mars"}
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from markdown if needed
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const flashcards = JSON.parse(jsonStr);

    return NextResponse.json({ flashcards });
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
