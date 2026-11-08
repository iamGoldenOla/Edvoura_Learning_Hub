import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { sendDirectEmail } from '@/lib/sendEmail';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, source, website } = body;

    // Honeypot bot protection
    if (website && String(website).trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Subscription confirmed.',
      });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Check if email already exists in lead_captures
    const { data: existing } = await supabaseAdmin
      .from('lead_captures')
      .select('id, email, status, subject_topic')
      .eq('email', cleanEmail)
      .limit(1)
      .maybeSingle();

    if (existing && existing.subject_topic === 'Newsletter Subscription') {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed to the Edvoura Dispatch! Check your inbox for our latest updates.",
        alreadySubscribed: true,
      });
    }

    // 2. Insert into lead_captures table in Supabase
    const { error: dbError } = await supabaseAdmin
      .from('lead_captures')
      .insert({
        full_name: 'Subscriber',
        email: cleanEmail,
        subject_topic: 'Newsletter Subscription',
        message_body: `Subscribed to Edvoura Dispatch from ${source || 'Website Footer'}`,
        status: 'subscribed',
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('[NEWSLETTER DB INSERT ERROR]', dbError);
    }

    // 3. Dispatch Welcoming Email via Resend/direct email
    const welcomeHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 4px solid #060E1C; border-radius: 16px; overflow: hidden; background-color: #FFFFFF;">
        <div style="background-color: #F5C518; padding: 24px; border-bottom: 4px solid #060E1C; text-align: center;">
          <h1 style="margin: 0; color: #060E1C; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">EDVOURA LEARNING HUB</h1>
          <p style="margin: 6px 0 0; color: #060E1C; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Where Learners' Dreams Come True</p>
        </div>
        <div style="padding: 32px 24px; color: #060E1C;">
          <h2 style="font-size: 22px; font-weight: 900; margin-top: 0; color: #060E1C;">Welcome to the Edvoura Community! 🎓</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            You have successfully subscribed to the <strong>Edvoura Dispatch</strong>. Every week, our curriculum specialists curate the most actionable academic insights, study methods, and international exam strategies for parents and learners.
          </p>

          <div style="background-color: #F8FAFC; border: 2px solid #060E1C; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 12px; font-size: 13px; font-weight: 900; text-transform: uppercase; color: #060E1C;">Explore Our 4 Proprietary Learning Tools For Free:</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #1E293B;">
              <li><strong>Curriculum Matrix™:</strong> 1,860+ K-12 learning prerequisites (<a href="https://edvouralearninghub.com/roadmap" style="color: #0284C7; font-weight: bold;">Explore Matrix</a>)</li>
              <li><strong>LexiCore™ Word Atlas:</strong> 7,298 illustrated vocabulary words with audio (<a href="https://edvouralearninghub.com/vocabulary" style="color: #0284C7; font-weight: bold;">Browse LexiCore</a>)</li>
              <li><strong>MathMotion Studio™:</strong> 60 FPS interactive vector proofs (<a href="https://edvouralearninghub.com/math-studio" style="color: #059669; font-weight: bold;">Launch Math Studio</a>)</li>
              <li><strong>STEM MechLab™:</strong> Mechanical isometric simulation engine (<a href="https://edvouralearninghub.com/anatomy-lab" style="color: #7C3AED; font-weight: bold;">Operate MechLab</a>)</li>
            </ul>
          </div>

          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            Ready to give your child tailored 1-on-1 support? Our certified international educators start at <strong>$20/session</strong>.
          </p>

          <div style="text-align: center; margin: 30px 0 16px;">
            <a href="https://edvouralearninghub.com/signup" style="background-color: #F5C518; color: #060E1C; border: 3px solid #060E1C; padding: 14px 28px; font-size: 15px; font-weight: 900; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
              Book Your Free 1-on-1 Trial Session →
            </a>
          </div>

          <div style="margin-top: 32px; padding-top: 20px; border-top: 2px solid #E2E8F0; font-size: 12px; color: #64748B; text-align: center;">
            <p style="margin: 0 0 6px;">
              Need help? Reach our academic counselors at <a href="mailto:info@edvouralearninghub.com" style="color: #060E1C; font-weight: bold;">info@edvouralearninghub.com</a> or WhatsApp <a href="https://wa.me/2349053363384" style="color: #059669; font-weight: bold;">+234 905 336 3384</a>.
            </p>
            <p style="margin: 0;">© ${new Date().getFullYear()} Edvoura Learning Hub • London • Lagos • Global</p>
          </div>
        </div>
      </div>
    `;

    void sendDirectEmail({
      to: cleanEmail,
      subject: 'Welcome to the Edvoura Dispatch 🎓 (Your Free Academic Kit)',
      html: welcomeHtml,
    }).catch((err) => {
      console.warn('[WELCOME EMAIL NOTICE]', err);
    });

    return NextResponse.json({
      success: true,
      message: "🎉 You're subscribed! Check your inbox for your welcome email and free academic kit.",
    });
  } catch (error) {
    console.error('[NEWSLETTER EXCEPTION]', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
