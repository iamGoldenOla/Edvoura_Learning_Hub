import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, guardianEmail, consentType = 'parental', regionCode = 'NG' } = body;

    if (!studentId || !guardianEmail) {
      return NextResponse.json({ error: 'Missing required parameters: studentId, guardianEmail' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // 1. Insert into consent_records
    const { data: consentRecord, error: consentErr } = await supabaseAdmin
      .from('consent_records')
      .insert({
        student_id: studentId,
        guardian_email: guardianEmail,
        consent_type: consentType,
        region_at_consent: String(regionCode).toUpperCase(),
        ip_address: ipAddress,
      })
      .select('*')
      .single();

    if (consentErr) {
      console.error('[PARENTAL CONSENT INSERT ERROR]', consentErr);
      return NextResponse.json({ error: consentErr.message }, { status: 500 });
    }

    // 2. Audit in data_processing_log
    await supabaseAdmin.from('data_processing_log').insert({
      user_id: studentId,
      action_type: 'signup_consent',
      data_collected: { guardian_email: guardianEmail, consent_type: consentType },
      legal_basis: consentType === 'parental' ? 'parental_consent' : 'self_consent',
      ip_address: ipAddress,
      region_code: String(regionCode).toUpperCase(),
    });

    return NextResponse.json({
      success: true,
      message: 'Parental consent record created successfully.',
      consentRecord,
    });
  } catch (err: any) {
    console.error('[PARENTAL CONSENT API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
