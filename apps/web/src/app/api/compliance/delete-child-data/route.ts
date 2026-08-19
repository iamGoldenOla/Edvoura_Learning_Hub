import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, guardianEmail, confirmationText } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Missing required parameter: studentId' }, { status: 400 });
    }

    if (confirmationText !== 'DELETE_MY_CHILD_DATA') {
      return NextResponse.json(
        { error: 'Confirmation text must match exactly "DELETE_MY_CHILD_DATA"' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // 1. Audit deletion BEFORE purging to ensure compliant record-keeping
    await supabaseAdmin.from('data_processing_log').insert({
      user_id: studentId,
      action_type: 'data_deletion',
      data_collected: { guardian_email: guardianEmail || 'unspecified', deleted_at: new Date().toISOString() },
      legal_basis: 'right_to_be_forgotten',
      ip_address: ipAddress,
      region_code: 'GLOBAL',
    });

    // 2. Hard purge student question history
    const { error: errHistory } = await supabaseAdmin
      .from('student_question_history')
      .delete()
      .eq('student_id', studentId);

    if (errHistory) console.error('[DELETE CHILD DATA ERROR history]', errHistory);

    // 3. Hard purge consent records
    const { error: errConsent } = await supabaseAdmin
      .from('consent_records')
      .delete()
      .eq('student_id', studentId);

    if (errConsent) console.error('[DELETE CHILD DATA ERROR consent]', errConsent);

    // 4. Hard purge student flags
    const { error: errFlags } = await supabaseAdmin
      .from('question_flags')
      .delete()
      .eq('flagged_by', studentId);

    if (errFlags) console.error('[DELETE CHILD DATA ERROR flags]', errFlags);

    return NextResponse.json({
      success: true,
      message: 'Child personal data has been permanently deleted and audited in data_processing_log.',
      studentId,
    });
  } catch (err: any) {
    console.error('[DELETE CHILD DATA API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
