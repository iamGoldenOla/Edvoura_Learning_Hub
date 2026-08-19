import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teacherId, name, region = 'NG', grade_band = '1-3' } = body;

    if (!teacherId || !name) {
      return NextResponse.json({ error: 'Missing required parameters: teacherId, name' }, { status: 400 });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const inviteCode = `EDV-${String(region).toUpperCase()}-${randomSuffix}`;

    const { data: classroom, error } = await supabaseAdmin
      .from('classrooms')
      .insert({
        teacher_id: teacherId,
        name,
        region: String(region).toUpperCase(),
        grade_band,
        invite_code: inviteCode,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[CREATE CLASSROOM ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Classroom created successfully with invite code.',
      classroom,
      inviteCode,
    });
  } catch (err: any) {
    console.error('[CREATE CLASSROOM API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
