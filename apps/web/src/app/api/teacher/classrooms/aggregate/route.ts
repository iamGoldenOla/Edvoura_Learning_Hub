import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get('classroomId');

    if (!classroomId) {
      return NextResponse.json({ error: 'Missing required parameter: classroomId' }, { status: 400 });
    }

    // 1. Fetch classroom metadata
    const { data: classroom } = await supabaseAdmin
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .maybeSingle();

    // 2. Fetch enrolled students
    const { data: enrollments } = await supabaseAdmin
      .from('classroom_enrollments')
      .select('student_id')
      .eq('classroom_id', classroomId);

    const studentIds = (enrollments || []).map((e) => e.student_id);

    if (studentIds.length === 0) {
      return NextResponse.json({
        success: true,
        classroom,
        enrolledCount: 0,
        classWeakSpots: [],
        topicAggregates: [],
      });
    }

    // 3. Query topic_mastery for all enrolled students
    const { data: masteryRows } = await supabaseAdmin
      .from('topic_mastery')
      .select('student_id, subject, topic, correct_count, attempt_count, mastery_score')
      .in('student_id', studentIds);

    // 4. Group by Subject & Topic
    const topicMap = new Map<string, { subject: string; topic: string; totalScore: number; totalAttempts: number; studentCount: number }>();

    (masteryRows || []).forEach((row) => {
      const key = `${row.subject}:::${row.topic}`;
      const existing = topicMap.get(key) || {
        subject: row.subject,
        topic: row.topic,
        totalScore: 0,
        totalAttempts: 0,
        studentCount: 0,
      };

      existing.totalScore += Number(row.mastery_score || 0);
      existing.totalAttempts += row.attempt_count || 0;
      existing.studentCount += 1;
      topicMap.set(key, existing);
    });

    const topicAggregates = Array.from(topicMap.values()).map((item) => {
      const classAverageScore = parseFloat((item.totalScore / studentIds.length).toFixed(2));
      return {
        subject: item.subject,
        topic: item.topic,
        classAverageScore,
        totalAttempts: item.totalAttempts,
        studentsStrugglingCount: studentIds.length - Math.round(item.totalScore / 100),
      };
    });

    // Sort by classAverageScore ascending (class weak spots first)
    topicAggregates.sort((a, b) => a.classAverageScore - b.classAverageScore);

    const classWeakSpots = topicAggregates.filter((t) => t.classAverageScore < 70.0);

    return NextResponse.json({
      success: true,
      classroom,
      enrolledCount: studentIds.length,
      classWeakSpots,
      topicAggregates,
    });
  } catch (err: any) {
    console.error('[CLASSROOM AGGREGATE API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
