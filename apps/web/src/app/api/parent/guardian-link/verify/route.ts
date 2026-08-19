import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guardianId, studentId, relationship = 'parent' } = body;

    if (!guardianId || !studentId) {
      return NextResponse.json({ error: 'Missing required parameters: guardianId, studentId' }, { status: 400 });
    }

    const { data: link, error } = await supabaseAdmin
      .from('guardian_links')
      .upsert(
        {
          guardian_id: guardianId,
          student_id: studentId,
          relationship,
          verified_at: new Date().toISOString(),
        },
        { onConflict: 'guardian_id,student_id' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('[GUARDIAN LINK VERIFY ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Guardian link verified successfully.',
      link,
    });
  } catch (err: any) {
    console.error('[GUARDIAN LINK VERIFY API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
