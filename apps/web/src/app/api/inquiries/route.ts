import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { sendDirectEmail } from '@/lib/sendEmail';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, country, subject, message } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const cleanName = String(fullName).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanSubject = String(subject || 'General Inquiry').trim();
    const cleanMessage = String(message || '').trim();
    const cleanPhone = phone ? String(phone).trim() : null;
    const cleanCountry = country ? String(country).trim() : null;

    // 1. Store lead in Supabase via service role
    const { data: lead, error: dbError } = await supabaseAdmin
      .from('lead_captures')
      .insert({
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        country: cleanCountry,
        subject_topic: cleanSubject,
        message_body: cleanMessage,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('[LEAD INSERT DB ERROR]', dbError);
    }

    // 2. Dispatch Confirmation Email to the Client / Parent
    const clientEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 3px solid #060E1C; border-radius: 16px; overflow: hidden; background-color: #FFFFFF;">
        <div style="background-color: #F5C518; padding: 24px; border-bottom: 3px solid #060E1C; text-align: center;">
          <h1 style="margin: 0; color: #060E1C; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">EDVOURA LEARNING HUB</h1>
          <p style="margin: 4px 0 0; color: #060E1C; font-size: 13px; font-weight: 700;">Global 1-on-1 Online Tutoring & Academic Mastery</p>
        </div>
        <div style="padding: 32px 24px; color: #060E1C;">
          <h2 style="font-size: 20px; font-weight: 800; margin-top: 0;">Hello ${cleanName},</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            Thank you for reaching out to <strong>Edvoura Learning Hub</strong>. We have received your inquiry regarding <strong>"${cleanSubject}"</strong>.
          </p>
          <div style="background-color: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748B;">Your Inquiry Details:</p>
            <p style="margin: 0 0 6px; font-size: 14px;"><strong>Subject:</strong> ${cleanSubject}</p>
            ${cleanMessage ? `<p style="margin: 0; font-size: 14px; color: #475569;">"${cleanMessage}"</p>` : ''}
          </div>
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            An academic advisor has been assigned to your request and will reach out to schedule your <strong>Free 1-on-1 Trial Session</strong> with a certified curriculum educator.
          </p>
          <div style="text-align: center; margin: 30px 0 10px;">
            <a href="https://edvouralearninghub.com/pricing" style="background-color: #060E1C; color: #FFFFFF; padding: 14px 28px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 10px; display: inline-block;">
              EXPLORE OUR PLANS ($20/session)
            </a>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 13px; color: #64748B;">
            <p style="margin: 0;">Official Inquiries: <a href="mailto:edvouralearninghub@gmail.com" style="color: #060E1C; font-weight: bold;">edvouralearninghub@gmail.com</a> • WhatsApp: <a href="https://wa.me/2349053363384" style="color: #059669; font-weight: bold; text-decoration: none;">+234 905 336 3384</a></p>
          </div>
        </div>
        <div style="background-color: #060E1C; color: #94A3B8; padding: 16px; text-align: center; font-size: 12px;">
          © ${new Date().getFullYear()} Edvoura Learning Hub • London • Lagos • Global
        </div>
      </div>
    `;

    await sendDirectEmail({
      to: cleanEmail,
      subject: `Welcome to Edvoura — We've received your inquiry!`,
      html: clientEmailHtml,
    });

    // 3. Dispatch Instant Alert Notification to the Administrator & Team Email
    const adminEmails = [
      'akinolaolujobi@gmail.com',
      'edvouralearninghub@gmail.com',
    ];

    const adminAlertHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 3px solid #060E1C; border-radius: 12px; padding: 24px; background: #FFFBEB;">
        <h2 style="color: #060E1C; margin-top: 0;">🚨 New Lead & Client Request on Edvoura!</h2>
        <p style="font-size: 15px; color: #334155;">A new prospective parent has submitted an inquiry through the website:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border: 2px solid #060E1C; border-radius: 8px;">
          <tr><td style="padding: 10px; border-bottom: 1px solid #CBD5E1; font-weight: bold;">Full Name:</td><td style="padding: 10px; border-bottom: 1px solid #CBD5E1;">${cleanName}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #CBD5E1; font-weight: bold;">Email Address:</td><td style="padding: 10px; border-bottom: 1px solid #CBD5E1;"><a href="mailto:${cleanEmail}">${cleanEmail}</a></td></tr>
          ${cleanPhone ? `<tr><td style="padding: 10px; border-bottom: 1px solid #CBD5E1; font-weight: bold;">Phone:</td><td style="padding: 10px; border-bottom: 1px solid #CBD5E1;">${cleanPhone}</td></tr>` : ''}
          <tr><td style="padding: 10px; border-bottom: 1px solid #CBD5E1; font-weight: bold;">Subject / Topic:</td><td style="padding: 10px; border-bottom: 1px solid #CBD5E1;">${cleanSubject}</td></tr>
          <tr><td style="padding: 10px; border-bottom: 1px solid #CBD5E1; font-weight: bold;">Message:</td><td style="padding: 10px; border-bottom: 1px solid #CBD5E1;">${cleanMessage || 'N/A'}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold;">Received At:</td><td style="padding: 10px;">${new Date().toUTCString()}</td></tr>
        </table>

        <div style="margin-top: 24px;">
          <a href="https://edvouralearninghub.com/eddy" style="background: #060E1C; color: #F5C518; padding: 12px 24px; text-decoration: none; font-weight: 800; border-radius: 8px; display: inline-block;">
            VIEW IN EDDY ADMIN PORTAL
          </a>
        </div>
      </div>
    `;

    for (const targetEmail of adminEmails) {
      await sendDirectEmail({
        to: targetEmail,
        subject: `🚨 [Edvoura Lead] ${cleanName} — ${cleanSubject}`,
        html: adminAlertHtml,
      });
    }

    return NextResponse.json({
      success: true,
      leadId: lead?.id,
      message: 'Inquiry submitted and confirmation emails queued successfully.',
    });
  } catch (err: any) {
    console.error('[SUBMIT INQUIRY API ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch form inquiries
    const { data: formLeads = [] } = await supabaseAdmin
      .from('lead_captures')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    // 2. Fetch existing signups & registrations from profiles table
    const { data: profileSignups = [] } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, created_at, phone')
      .order('created_at', { ascending: false })
      .limit(100);

    // Map existing registered users so they automatically appear in the Lead Generation Table
    const formattedSignups = (profileSignups || []).map((p: any) => ({
      id: `signup-${p.id}`,
      full_name: p.full_name || 'Registered User',
      email: p.email,
      phone: p.phone || null,
      country: null,
      subject_topic: `Account Signup (${(p.role || 'user').toUpperCase()})`,
      message_body: `Platform registration under role: ${p.role || 'user'}. Ready for lesson scheduling & onboarding.`,
      status: 'registered',
      created_at: p.created_at,
    }));

    // Merge inquiries and signups, sorted by most recent
    const combined = [...(formLeads || []), ...formattedSignups].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ leads: combined });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
