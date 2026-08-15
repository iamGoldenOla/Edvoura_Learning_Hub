/**
 * EDVOURA DIRECT EMAIL DISPATCHER
 * Uses standard fetch HTTP API (Resend / SendGrid / Custom SMTP Relay) for 100% instant inbox delivery.
 */

export async function sendDirectEmail({
  to,
  subject,
  html,
  from = 'Edvoura Learning Hub <support@edvouralearninghub.com>',
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;

  if (!apiKey) {
    console.log(`[EMAIL DISPATCH] No RESEND_API_KEY configured in environment variables. Target: ${to}`);
    return {
      success: false,
      reason: 'MISSING_API_KEY',
      errorMsg: 'RESEND_API_KEY is not set in Vercel Environment Variables. Please add RESEND_API_KEY in Vercel settings and trigger redeploy.',
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
      console.error('[RESEND DISPATCH ERROR]', data);
      return {
        success: false,
        reason: 'RESEND_API_ERROR',
        status: res.status,
        errorMsg: data.message || data.error || JSON.stringify(data),
      };
    }

    return { success: true, id: data.id, to, subject };
  } catch (error) {
    console.error('[EMAIL DISPATCH EXCEPTION]', error);
    return { success: false, error: String(error) };
  }
}
