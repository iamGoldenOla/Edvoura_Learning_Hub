import InfoPageShell from '@/components/marketing/InfoPageShell';

export default function HelpPage() {
  return (
    <InfoPageShell
      eyebrow="Help Centre"
      title="Find the Fastest Way to Get Unstuck"
      intro="Whether you are booking a session, accessing a dashboard, publishing tutor content, or checking a child’s progress, this guide points you to the right next step."
      sections={[
        {
          title: 'For Parents',
          body: [
            'Use the parent dashboard to review billing, monitor attendance, check child progress, and view tutor feedback.',
            'If a child is missing from your parent account, contact support so the student link can be verified safely.',
          ],
        },
        {
          title: 'For Students',
          body: [
            'Students should use the correct dashboard role, join scheduled classes from the live or classes area, and review assignments from the student hub.',
            'If AI study content is missing, confirm that a tutor has published it to student hubs first.',
          ],
        },
        {
          title: 'For Tutors',
          body: [
            'Tutors can manage schedules, grade submissions, generate AI content, and publish approved materials for students from the tutor workspace.',
            'If generation fails, verify your content settings and provider availability before retrying.',
          ],
        },
        {
          title: 'Still Need Support?',
          body: [
            'Use the contact page for account, billing, technical, or curriculum questions that require direct help from the Edvoura team.',
          ],
        },
      ]}
      ctaLabel="Open Contact Page"
      ctaHref="/contact"
    />
  );
}
