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

    // Parse exact individual grade level and broad grade band
    const lowerGrade = decodedGrade.toLowerCase().replace(/[^w]/g, '');
    let specificGrade = 'Grade 3';
    let gradeBand = '1-3';

    if (lowerGrade.includes('1') && !lowerGrade.includes('10') && !lowerGrade.includes('11') && !lowerGrade.includes('12') && !lowerGrade.includes('13')) {
      specificGrade = 'Grade 1';
      gradeBand = '1-3';
    } else if (lowerGrade.includes('2')) {
      specificGrade = 'Grade 2';
      gradeBand = '1-3';
    } else if (lowerGrade.includes('3')) {
      specificGrade = 'Grade 3';
      gradeBand = '1-3';
    } else if (lowerGrade.includes('4')) {
      specificGrade = 'Grade 4';
      gradeBand = '4-6';
    } else if (lowerGrade.includes('5')) {
      specificGrade = 'Grade 5';
      gradeBand = '4-6';
    } else if (lowerGrade.includes('6')) {
      specificGrade = 'Grade 6';
      gradeBand = '4-6';
    } else if (lowerGrade.includes('7') || lowerGrade.includes('jss1')) {
      specificGrade = 'Grade 7 / JSS 1';
      gradeBand = '7-9';
    } else if (lowerGrade.includes('8') || lowerGrade.includes('jss2')) {
      specificGrade = 'Grade 8 / JSS 2';
      gradeBand = '7-9';
    } else if (lowerGrade.includes('9') || lowerGrade.includes('jss3')) {
      specificGrade = 'Grade 9 / JSS 3';
      gradeBand = '7-9';
    } else if (lowerGrade.includes('10') || lowerGrade.includes('ss1')) {
      specificGrade = 'Grade 10 / SS 1';
      gradeBand = '10-12';
    } else if (lowerGrade.includes('11') || lowerGrade.includes('ss2')) {
      specificGrade = 'Grade 11 / SS 2';
      gradeBand = '10-12';
    } else if (lowerGrade.includes('12') || lowerGrade.includes('ss3')) {
      specificGrade = 'Grade 12 / SS 3';
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
      .select('id, subject, grade_band, specific_grade, curriculum_region, topic, subtopic, question_text, question_type, options, correct_answer, explanation, difficulty, shown_count')
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
      specificGrade,
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
