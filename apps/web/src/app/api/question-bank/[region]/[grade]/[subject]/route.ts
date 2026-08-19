import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ region: string; grade: string; subject: string }> }
) {
  try {
    const { region, grade, subject } = await params;
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const limitParam = parseInt(searchParams.get('limit') || '5', 10);
    const decodedSubject = decodeURIComponent(subject);
    const decodedRegion = decodeURIComponent(region).toUpperCase();
    const decodedGrade = decodeURIComponent(grade);

    // Normalize grade to internal grade band ('1-3', '4-6', '7-9', '10-12')
    let gradeBand = '7-9';
    if (decodedGrade.includes('1') || decodedGrade.includes('2') || decodedGrade.includes('3')) {
      gradeBand = '1-3';
    } else if (decodedGrade.includes('4') || decodedGrade.includes('5') || decodedGrade.includes('6')) {
      gradeBand = '4-6';
    } else if (decodedGrade.includes('10') || decodedGrade.includes('11') || decodedGrade.includes('12') || decodedGrade.includes('ss1') || decodedGrade.includes('ss2') || decodedGrade.includes('ss3')) {
      gradeBand = '10-12';
    }

    // 1. Fetch recently answered question IDs for this student (Layer 3 Dedup: exclude last 60 days)
    let excludeIds: string[] = [];
    if (studentId) {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const { data: history } = await supabaseAdmin
        .from('student_question_history')
        .select('question_id')
        .eq('student_id', studentId)
        .gte('shown_at', sixtyDaysAgo);

      if (history && history.length > 0) {
        excludeIds = history.map((h) => h.question_id);
      }
    }

    // 2. Query approved questions where curriculum_region matches region OR 'GLOBAL'
    let query = supabaseAdmin
      .from('question_bank')
      .select('id, subject, grade_band, curriculum_region, topic, subtopic, question_text, question_type, options, correct_answer, explanation, difficulty, shown_count')
      .eq('status', 'approved')
      .eq('grade_band', gradeBand)
      .or(`curriculum_region.eq.${decodedRegion},curriculum_region.eq.GLOBAL`)
      .order('shown_count', { ascending: true })
      .limit(limitParam * 3);

    if (decodedSubject && decodedSubject.toLowerCase() !== 'all') {
      query = query.ilike('subject', `%${decodedSubject}%`);
    }

    const { data: candidateQuestions, error: fetchErr } = await query;

    if (fetchErr) {
      console.error('[DELIVERY API FETCH ERROR]', fetchErr);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    let questions = candidateQuestions || [];

    // Apply Layer 3 exclusion filter
    if (excludeIds.length > 0) {
      const filtered = questions.filter((q) => !excludeIds.includes(q.id));
      if (filtered.length >= limitParam) {
        questions = filtered;
      }
    }

    // Section H: Adaptive Difficulty Algorithm Pass
    let targetDifficulty = 'medium';
    if (studentId && questions.length > 0) {
      const sampleTopic = questions[0].topic;
      const { data: masteryRec } = await supabaseAdmin
        .from('topic_mastery')
        .select('mastery_score')
        .eq('student_id', studentId)
        .eq('topic', sampleTopic)
        .maybeSingle();

      const score = masteryRec ? Number(masteryRec.mastery_score || 0) : 60;
      if (score < 50) {
        targetDifficulty = 'easy';
      } else if (score >= 80) {
        targetDifficulty = 'hard';
      } else {
        targetDifficulty = 'medium';
      }
    }

    // Adaptive weighting pass: Prioritize questions matching targetDifficulty
    const selectedQuestions = questions
      .sort((a, b) => {
        if (a.difficulty === targetDifficulty && b.difficulty !== targetDifficulty) return -1;
        if (a.difficulty !== targetDifficulty && b.difficulty === targetDifficulty) return 1;
        return 0.5 - Math.random();
      })
      .slice(0, limitParam);

    // 3. Immediately log delivered questions into student_question_history & increment shown_count
    if (studentId && selectedQuestions.length > 0) {
      const historyRows = selectedQuestions.map((q) => ({
        student_id: studentId,
        question_id: q.id,
        shown_at: new Date().toISOString(),
      }));

      await supabaseAdmin.from('student_question_history').insert(historyRows);

      for (const q of selectedQuestions) {
        await supabaseAdmin
          .from('question_bank')
          .update({ shown_count: (q.shown_count || 0) + 1 })
          .eq('id', q.id);
      }
    }

    return NextResponse.json({
      success: true,
      region: decodedRegion,
      gradeBand,
      subject: decodedSubject,
      count: selectedQuestions.length,
      questions: selectedQuestions.map((q) => ({
        id: q.id,
        questionText: q.question_text,
        questionType: q.question_type,
        options: q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        topic: q.topic,
        curriculumRegion: q.curriculum_region,
      })),
    });
  } catch (err: any) {
    console.error('[QUESTION BANK DELIVERY API ERROR]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
