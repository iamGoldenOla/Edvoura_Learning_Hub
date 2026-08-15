/**
 * EDVOURA LEARNING HUB — CLEAN, PROFESSIONAL HTML EMAIL TEMPLATES
 * Mobile-responsive, inbox-tested HTML email templates for Gmail, Outlook, Apple Mail & Yahoo.
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
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F5F9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);">
          
          <!-- BRAND HEADER LOGO -->
          <tr>
            <td style="background-color: #060E1C; padding: 28px 32px; text-align: center;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #F5C518; color: #060E1C; font-weight: 800; font-size: 12px; padding: 6px 14px; border-radius: 20px; letter-spacing: 1.5px; text-transform: uppercase;">
                    EDVOURA LEARNING HUB
                  </td>
                </tr>
              </table>
              <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 16px 0 0 0; line-height: 1.3;">
                Welcome to Edvoura, ${firstName}!
              </h1>
            </td>
          </tr>

          <!-- EMAIL BODY CONTENT -->
          <tr>
            <td style="padding: 32px; background-color: #FFFFFF;">
              <p style="font-size: 15px; line-height: 1.6; color: #0F172A; margin-top: 0;">
                Dear <strong>${parentName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                Thank you for reaching out regarding <em>"${topic}"</em>. We have received your message and our academic care team is already preparing your child's personalized learning overview.
              </p>

              <!-- WHAT MAKES EDVOURA SPECIAL BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FFFBEB; border-left: 4px solid #F5C518; border-radius: 8px; margin: 24px 0; padding: 18px 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 10px 0; color: #060E1C; font-size: 15px; font-weight: 700;">
                      ✨ What You Can Expect with Edvoura:
                    </h2>
                    <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 13px; line-height: 1.7;">
                      <li style="margin-bottom: 6px;"><strong>1-on-1 Vetted Tutors:</strong> Top educators matched to your child's grade and goals.</li>
                      <li style="margin-bottom: 6px;"><strong>AI Learning Profiler:</strong> Detects weak topics in real time and reinforces mastery.</li>
                      <li style="margin-bottom: 6px;"><strong>3D Gamified Live Studio:</strong> Interactive quizzes &amp; Millionaire live studio game shows.</li>
                      <li><strong>Curriculum Standards:</strong> Full alignment with Primary Grade 1-12, WAEC, Cambridge IGCSE, AP &amp; SAT.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- 3-STEP NEXT STEPS -->
              <h2 style="color: #060E1C; font-size: 15px; font-weight: 700; margin-top: 24px; margin-bottom: 12px;">
                📋 What Happens Next:
              </h2>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="28" valign="top">
                    <div style="background-color: #22C55E; color: #FFFFFF; width: 22px; height: 22px; border-radius: 50%; text-align: center; line-height: 22px; font-weight: 700; font-size: 12px;">1</div>
                  </td>
                  <td style="padding-left: 10px; font-size: 13px; color: #334155; line-height: 1.5;">
                    <strong>Academic Consultation:</strong> Our advisor will reach out within 24 hours to confirm your child's grade.
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
                <tr>
                  <td width="28" valign="top">
                    <div style="background-color: #F5C518; color: #060E1C; width: 22px; height: 22px; border-radius: 50%; text-align: center; line-height: 22px; font-weight: 700; font-size: 12px;">2</div>
                  </td>
                  <td style="padding-left: 10px; font-size: 13px; color: #334155; line-height: 1.5;">
                    <strong>Free Trial Live Class:</strong> Experience a 1-on-1 live session with an expert tutor.
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
                <tr>
                  <td width="28" valign="top">
                    <div style="background-color: #A855F7; color: #FFFFFF; width: 22px; height: 22px; border-radius: 50%; text-align: center; line-height: 22px; font-weight: 700; font-size: 12px;">3</div>
                  </td>
                  <td style="padding-left: 10px; font-size: 13px; color: #334155; line-height: 1.5;">
                    <strong>Custom Roadmap &amp; Portal Pass:</strong> Access weekly progress reports and study resources.
                  </td>
                </tr>
              </table>

              <!-- PERFECTLY CENTERED CALL TO ACTION BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.edvouralearninghub.com/login" target="_blank" style="display: inline-block; background-color: #060E1C; color: #F5C518; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px; text-align: center;">
                      Explore Parent Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.5; color: #64748B; margin-top: 24px; text-align: center;">
                Need immediate help? Contact our academic desk at <strong>07010158258</strong>.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">
              &copy; ${new Date().getFullYear()} Edvoura Learning Hub • All Rights Reserved.<br>
              Lagos, Nigeria
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
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F5F9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color: #060E1C; padding: 28px 32px; text-align: center;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #22C55E; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 5px 12px; border-radius: 20px; letter-spacing: 1.5px; text-transform: uppercase;">
                    SPECIAL INVITATION
                  </td>
                </tr>
              </table>
              <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 14px 0 0 0; line-height: 1.3;">
                Still Thinking About Online Tutoring for Your Child?
              </h1>
            </td>
          </tr>

          <!-- EMAIL BODY CONTENT -->
          <tr>
            <td style="padding: 32px; background-color: #FFFFFF;">
              <p style="font-size: 15px; line-height: 1.6; color: #0F172A; margin-top: 0;">
                Hello <strong>${firstName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                We noticed you inquired about <strong>Edvoura Learning Hub</strong> recently! We know how important it is to find a patient, expert tutor who truly understands your child's unique learning pace.
              </p>

              <!-- FREE TRIAL BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ECFDF5; border-left: 4px solid #22C55E; border-radius: 8px; margin: 24px 0; padding: 18px 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 8px 0; color: #065F46; font-size: 15px; font-weight: 700;">
                      🎁 Claim Your Free 30-Minute Trial Class
                    </h2>
                    <p style="margin: 0; font-size: 13px; color: #047857; line-height: 1.5;">
                      Experience our 1-on-1 live session, test our 3D learning studio, and see how our AI Profiler identifies weak topics instantly — 100% free with no commitment required.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- PERFECTLY CENTERED CALL TO ACTION BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.edvouralearninghub.com/contact?action=book-free-trial" target="_blank" style="display: inline-block; background-color: #F5C518; color: #060E1C; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px; text-align: center;">
                      Book Free Trial Class &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">
              &copy; ${new Date().getFullYear()} Edvoura Learning Hub • Automated Parent Assistance
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
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F5F9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color: #060E1C; padding: 28px 32px; text-align: center;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #A855F7; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 5px 12px; border-radius: 20px; letter-spacing: 1.5px; text-transform: uppercase;">
                    ACADEMIC EXCELLENCE
                  </td>
                </tr>
              </table>
              <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 14px 0 0 0; line-height: 1.3;">
                How Edvoura Students Boost Test Scores by 35%
              </h1>
            </td>
          </tr>

          <!-- EMAIL BODY CONTENT -->
          <tr>
            <td style="padding: 32px; background-color: #FFFFFF;">
              <p style="font-size: 15px; line-height: 1.6; color: #0F172A; margin-top: 0;">
                Hi <strong>${firstName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                Every student thrives when given personalized attention! At <strong>Edvoura Learning Hub</strong>, our 1-on-1 tutors and AI Topic Profiler help learners build confidence and achieve distinction in WAEC, Cambridge IGCSE, AP, SAT, and primary grade exams.
              </p>

              <!-- STATISTIC HIGHLIGHT BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F3E8FF; border-left: 4px solid #A855F7; border-radius: 8px; margin: 24px 0; padding: 20px;">
                <tr>
                  <td align="center">
                    <div style="font-size: 32px; font-weight: 800; color: #6B21A8;">+35% Score Boost</div>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #581C87; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Average academic improvement within the first 6 weeks of 1-on-1 tutoring.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- PERFECTLY CENTERED CALL TO ACTION BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.edvouralearninghub.com/signup?role=parent" target="_blank" style="display: inline-block; background-color: #060E1C; color: #F5C518; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 10px; text-align: center;">
                      Start Family Onboarding &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">
              &copy; ${new Date().getFullYear()} Edvoura Learning Hub • Empowering Learners Worldwide
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
