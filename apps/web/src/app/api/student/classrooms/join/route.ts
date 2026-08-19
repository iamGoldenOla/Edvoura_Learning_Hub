import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, inviteCode } = body;

    if (!studentId || !inviteCode) {
      return NextResponse.json({ error: 'Missing required parameters: studentId, inviteCode' }, { status: 400 });
    }

    const cleanCode = String(inviteCode).trim().toUpperCase();

    // 1. Fetch classroom by invite_code
    const { data: classroom, error: fetchErr } = await supabaseAdmin
      .from('classrooms')
      .select('id, name, teacher_id, region, grade_band')
      .eq('invite_code', cleanCode)
      .maybeSingle();

    if (fetchErr || !classroom) {
      return NextResponse.json({ error: `Invalid classroom invite code: ${cleanCode}` }, { status: 404 });
    }

    // 2. Enroll student in classroom
    const { data: enrollment, error: enrollErr } = await supabaseAdmin
      .from('classroom_enrollments')
      .upsert(
        {
          classroom_id: classroom.id,
          student_id: studentId,
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: 'classroom_id,student_id' }
      )
      .select('*')
      .single();

    if (enrollErr) {
      console.error('[STUDENT JOIN CLASSROOM ERROR]', enrollErr);
      return NextResponse.json({ error: enrollErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Enrolled successfully in classroom "${classroom.name}"!`,
      classroomName: classroom.name,
      enrollment,
    });
  } catch (err: any) {
    console.error('[STUDENT JOIN CLASSROOM API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
