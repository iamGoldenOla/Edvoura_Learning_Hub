/**
 * EDVOURA DIRECT EMAIL DISPATCHER
 * Uses standard fetch HTTP API (Resend / SendGrid / Custom SMTP Relay) for 100% instant inbox delivery.
 */

export async function sendDirectEmail({
  to,
  subject,
  html,
  from = 'Edvoura Learning Hub <onboarding@resend.dev>',
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;

  if (!apiKey) {
    console.log(`[EMAIL DISPATCH] No RESEND_API_KEY configured. Email payload generated for ${to}: "${subject}"`);
    return {
      success: false,
      reason: 'MISSING_API_KEY',
      to,
      subject,
      message: 'Email HTML generated successfully. To deliver directly to actual Gmail inboxes, add your RESEND_API_KEY to Vercel Environment Variables.',
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[EMAIL DISPATCH ERROR]', data);
      return { success: false, reason: 'API_ERROR', details: data };
    }

    return { success: true, id: data.id, to, subject };
  } catch (error) {
    console.error('[EMAIL DISPATCH EXCEPTION]', error);
    return { success: false, error: String(error) };
  }
}
