/**
 * EDVOURA LEARNING HUB — BRANDED HTML EMAIL TEMPLATES
 * Premium, mobile-responsive HTML templates for Parent Welcome & Follow-up Sequences.
 */

export function generateParentWelcomeEmailHtml({
  parentName,
  parentEmail,
  topic = 'General Inquiry',
}: {
  parentName: string;
  parentEmail: string;
  topic?: string;
}) {
  const firstName = parentName.split(' ')[0] || 'Parent';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Edvoura Learning Hub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #060E1C;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="640" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; background-color: #FFFFFF; border: 4px solid #060E1C; border-radius: 24px; overflow: hidden; box-shadow: 8px 8px 0px #060E1C;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color: #060E1C; padding: 32px 40px; text-align: center; border-bottom: 4px solid #060E1C;">
              <div style="display: inline-block; background-color: #F5C518; color: #060E1C; font-weight: 900; font-size: 14px; padding: 6px 16px; border-radius: 999px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; border: 2px solid #060E1C;">
                EDVOURA LEARNING HUB
              </div>
              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">
                Welcome to World-Class Learning, ${firstName}! 👋
              </h1>
            </td>
          </tr>

          <!-- MAIN BODY -->
          <tr>
            <td style="padding: 40px; background-color: #FFFFFF;">
              <p style="font-size: 16px; line-height: 1.6; font-weight: 700; color: #060E1C; margin-top: 0;">
                Dear ${parentName},
              </p>
              <p style="font-size: 15px; line-height: 1.7; color: #334155; font-weight: 500;">
                Thank you for reaching out to <strong>Edvoura Learning Hub</strong> regarding <em>"${topic}"</em>! We have safely received your inquiry and our academic care team is already working on your request.
              </p>

              <!-- WHY EDVOURA HIGHLIGHT BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FEF3C7; border: 3px solid #060E1C; border-radius: 16px; margin: 28px 0; padding: 24px; box-shadow: 4px 4px 0px #060E1C;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 12px 0; color: #060E1C; font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                      🚀 What Makes Edvoura Extraordinary?
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #1E293B; font-size: 14px; line-height: 1.8; font-weight: 600;">
                      <li style="margin-bottom: 8px;"><strong>1-on-1 Vetted Global Tutors:</strong> Top educators tailored to your child's learning pace.</li>
                      <li style="margin-bottom: 8px;"><strong>AI Learning Profiler:</strong> Real-time assessment identifying weak topics and visual strengths.</li>
                      <li style="margin-bottom: 8px;"><strong>3D Gamified Studio:</strong> Interactive quizzes &amp; Millionaire live studio game shows for peak retention.</li>
                      <li><strong>Curriculum Mastery:</strong> Complete alignment with WAEC, Cambridge IGCSE, AP, SAT, and primary grade standards (Grade 1 - 12).</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- WHAT HAPPENS NEXT TIMELINE -->
              <h3 style="color: #060E1C; font-size: 18px; font-weight: 900; margin-top: 32px; margin-bottom: 16px;">
                📋 Your 3-Step Next Journey:
              </h3>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="40" valign="top">
                    <div style="background-color: #22C55E; color: #060E1C; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 900; font-size: 14px; border: 2px solid #060E1C;">1</div>
                  </td>
                  <td style="padding-left: 12px; font-size: 14px; color: #334155; line-height: 1.5; font-weight: 600;">
                    <strong>Academic Consultation Review:</strong> Our academic advisor will contact you within 24 hours to align on your child's specific goals.
                  </td>
                </tr>
                <tr><td height="12"></td></tr>
                <tr>
                  <td width="40" valign="top">
                    <div style="background-color: #F5C518; color: #060E1C; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 900; font-size: 14px; border: 2px solid #060E1C;">2</div>
                  </td>
                  <td style="padding-left: 12px; font-size: 14px; color: #334155; line-height: 1.5; font-weight: 600;">
                    <strong>Free Introductory Live Session:</strong> Experience a live 1-on-1 class session with an expert tutor.
                  </td>
                </tr>
                <tr><td height="12"></td></tr>
                <tr>
                  <td width="40" valign="top">
                    <div style="background-color: #A855F7; color: #FFFFFF; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 900; font-size: 14px; border: 2px solid #060E1C;">3</div>
                  </td>
                  <td style="padding-left: 12px; font-size: 14px; color: #334155; line-height: 1.5; font-weight: 600;">
                    <strong>Custom Learning Roadmap:</strong> Receive a personalized academic report card &amp; weekly schedule tailored for your child.
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 36px; text-align: center;">
                <tr>
                  <td>
                    <a href="https://www.edvouralearninghub.com/login" target="_blank" style="display: inline-block; background-color: #060E1C; color: #F5C518; font-weight: 900; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 14px; border: 3px solid #060E1C; box-shadow: 4px 4px 0px #F5C518; text-transform: uppercase; letter-spacing: 1px;">
                      Explore Parent Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; line-height: 1.6; color: #64748B; font-weight: 500; margin-top: 36px; text-align: center;">
                Need immediate assistance? Call our support desk at <strong>+234 810 123 4567</strong> or WhatsApp us directly.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 24px 40px; text-align: center; border-top: 3px solid #060E1C; font-size: 12px; color: #64748B; font-weight: 600;">
              &copy; ${new Date().getFullYear()} Edvoura Learning Hub • Empowering Learners Worldwide.<br>
              Lagos, Nigeria • London, UK • Toronto, Canada
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * AUTOMATED FOLLOW-UP EMAIL #1 (DAY 2 NUDGE): Free 1-on-1 Trial Session Invite
 */
export function generateParentFollowUp1Html({
  parentName,
  parentEmail,
}: {
  parentName: string;
  parentEmail: string;
}) {
  const firstName = parentName.split(' ')[0] || 'Parent';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Free 1-on-1 Trial Session Awaits — Edvoura</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #060E1C;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="640" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; background-color: #FFFFFF; border: 4px solid #060E1C; border-radius: 24px; overflow: hidden; box-shadow: 8px 8px 0px #060E1C;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color: #060E1C; padding: 32px 40px; text-align: center; border-bottom: 4px solid #060E1C;">
              <div style="display: inline-block; background-color: #22C55E; color: #060E1C; font-weight: 900; font-size: 14px; padding: 6px 16px; border-radius: 999px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; border: 2px solid #060E1C;">
                AUTOMATED FOLLOW-UP • DAY 2
              </div>
              <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 900; margin: 0;">
                Still Thinking About Online Tutoring for Your Child? 🎓
              </h1>
            </td>
          </tr>

          <!-- MAIN BODY -->
          <tr>
            <td style="padding: 40px; background-color: #FFFFFF;">
              <p style="font-size: 16px; line-height: 1.6; font-weight: 700; color: #060E1C; margin-top: 0;">
                Hello ${firstName},
              </p>
              <p style="font-size: 15px; line-height: 1.7; color: #334155; font-weight: 500;">
                We noticed you inquired about <strong>Edvoura Learning Hub</strong> recently! We know how important it is to find the perfect tutor who understands your child&apos;s unique learning style.
              </p>

              <!-- FREE TRIAL CARD -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ECFDF5; border: 3px solid #060E1C; border-radius: 16px; margin: 28px 0; padding: 24px; box-shadow: 4px 4px 0px #060E1C;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; color: #060E1C; font-size: 18px; font-weight: 900; text-transform: uppercase;">
                      🎁 Claim Your Free 30-Minute Trial Session!
                    </h3>
                    <p style="margin: 0; font-size: 14px; color: #065F46; font-weight: 600; line-height: 1.6;">
                      Try our interactive 3D studio, meet an expert tutor, and experience how our AI Learning Profiler identifies weak topics instantly — completely free, with no commitment required.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px; text-align: center;">
                <tr>
                  <td>
                    <a href="https://www.edvouralearninghub.com/contact?action=book-free-trial" target="_blank" style="display: inline-block; background-color: #F5C518; color: #060E1C; font-weight: 900; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 14px; border: 3px solid #060E1C; box-shadow: 4px 4px 0px #060E1C; text-transform: uppercase; letter-spacing: 1px;">
                      Book Free Trial Session &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 20px 40px; text-align: center; border-top: 3px solid #060E1C; font-size: 12px; color: #64748B; font-weight: 600;">
              &copy; ${new Date().getFullYear()} Edvoura Learning Hub • Automated Parent Nudge Sequence
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * AUTOMATED FOLLOW-UP EMAIL #2 (DAY 5 NUDGE): AI Report & Success Case
 */
export function generateParentFollowUp2Html({
  parentName,
  parentEmail,
}: {
  parentName: string;
  parentEmail: string;
}) {
  const firstName = parentName.split(' ')[0] || 'Parent';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>See How Students Improve by 35% in 6 Weeks — Edvoura</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #060E1C;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="640" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; background-color: #FFFFFF; border: 4px solid #060E1C; border-radius: 24px; overflow: hidden; box-shadow: 8px 8px 0px #060E1C;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color: #060E1C; padding: 32px 40px; text-align: center; border-bottom: 4px solid #060E1C;">
              <div style="display: inline-block; background-color: #A855F7; color: #FFFFFF; font-weight: 900; font-size: 14px; padding: 6px 16px; border-radius: 999px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; border: 2px solid #060E1C;">
                AUTOMATED FOLLOW-UP • DAY 5
              </div>
              <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 900; margin: 0;">
                How Edvoura Students Boost Scores by 35% 📈
              </h1>
            </td>
          </tr>

          <!-- MAIN BODY -->
          <tr>
            <td style="padding: 40px; background-color: #FFFFFF;">
              <p style="font-size: 16px; line-height: 1.6; font-weight: 700; color: #060E1C; margin-top: 0;">
                Hi ${firstName},
              </p>
              <p style="font-size: 15px; line-height: 1.7; color: #334155; font-weight: 500;">
                Every child has brilliant potential when given the right guidance! At <strong>Edvoura Learning Hub</strong>, our 1-on-1 tutors and AI Topic Profiler help students achieve distinction in WAEC, Cambridge IGCSE, SAT, and primary grade exams.
              </p>

              <!-- SUCCESS METRIC BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F3E8FF; border: 3px solid #060E1C; border-radius: 16px; margin: 28px 0; padding: 24px; box-shadow: 4px 4px 0px #060E1C;">
                <tr>
                  <td align="center">
                    <div style="font-size: 42px; font-weight: 900; color: #6B21A8; margin-bottom: 4px;">+35% Average Score Boost</div>
                    <p style="margin: 0; font-size: 13px; color: #581C87; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                      Achieved by students within their first 6 weeks of 1-on-1 tutoring.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px; text-align: center;">
                <tr>
                  <td>
                    <a href="https://www.edvouralearninghub.com/signup?role=parent" target="_blank" style="display: inline-block; background-color: #060E1C; color: #F5C518; font-weight: 900; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 14px; border: 3px solid #060E1C; box-shadow: 4px 4px 0px #F5C518; text-transform: uppercase; letter-spacing: 1px;">
                      Start Your Family Onboarding &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 20px 40px; text-align: center; border-top: 3px solid #060E1C; font-size: 12px; color: #64748B; font-weight: 600;">
              &copy; ${new Date().getFullYear()} Edvoura Learning Hub • Automated Parent Nudge Sequence
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

