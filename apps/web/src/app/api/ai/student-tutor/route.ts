import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { explainLessonContent } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : 'General Studies';
  const topic = typeof body?.topic === 'string' ? body.topic.trim() : 'General Topic';
  const gradeLevel = typeof body?.gradeLevel === 'string' ? body.gradeLevel.trim() : 'Grade 4';
  const lessonText = typeof body?.lessonText === 'string' ? body.lessonText.trim() : '';

  if (!question) {
    return NextResponse.json({ error: 'Missing question' }, { status: 400 });
  }

  try {
    const result = await explainLessonContent({
      mode: 'simple',
      subject,
      topic,
      gradeLevel,
      lessonText: lessonText ? `${lessonText}\n\nStudent Question: ${question}` : `Student Question: ${question}`,
    });

    if (result.success && result.data && typeof result.data === 'object') {
      const dataObj = result.data as Record<string, unknown>;
      const explanation = typeof dataObj.explanation === 'string' ? dataObj.explanation : String(dataObj.explanation || '');
      return NextResponse.json({
        answer: explanation || `Here is a clear explanation for ${topic}: ${question}`,
        examples: Array.isArray(dataObj.examples) ? dataObj.examples : [],
        checks: Array.isArray(dataObj.checks) ? dataObj.checks : [],
      });
    }

    const fallbackAnswer = `Great question about ${topic}! In ${gradeLevel} ${subject}, key concepts are best understood step-by-step. Keep practicing on your dashboard or ask your tutor in class!`;
    return NextResponse.json({ answer: fallbackAnswer, examples: [], checks: [] });
  } catch (error) {
    const fallbackAnswer = `Great question about ${topic}! In ${gradeLevel} ${subject}, remember that key concepts are best understood step-by-step. Keep practicing on your dashboard or ask your tutor for extra guidance!`;
    return NextResponse.json({ answer: fallbackAnswer, examples: [], checks: [] });
  }
}
