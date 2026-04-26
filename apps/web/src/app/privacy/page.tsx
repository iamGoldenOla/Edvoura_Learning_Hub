import InfoPageShell from '@/components/marketing/InfoPageShell';

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="Privacy Policy"
      title="Your Learning Data Should Stay Protected"
      intro="Edvoura handles student, parent, and tutor data with care. This summary explains what we collect, why we collect it, and how we keep it secure across the platform."
      sections={[
        {
          title: 'What We Collect',
          body: [
            'We collect account details, learning activity, session schedules, assignments, and billing records needed to operate Edvoura safely and effectively.',
            'For minors, parent-linked access is used so guardians can monitor progress without exposing data publicly.',
          ],
        },
        {
          title: 'How We Use It',
          body: [
            'We use data to run tutoring sessions, track academic progress, personalize dashboards, support billing, and improve platform reliability.',
            'We do not sell student or family data to third parties for advertising.',
          ],
        },
        {
          title: 'Security and Access',
          body: [
            'Access is limited by role so students, parents, tutors, and admins only see the data they are meant to see.',
            'We use secure authentication, database policies, and provider-level protections to reduce unauthorized access risk.',
          ],
        },
        {
          title: 'Questions or Requests',
          body: [
            'If you need data correction, account deletion help, or a privacy clarification, contact the Edvoura support team directly.',
          ],
        },
      ]}
      ctaLabel="Contact Privacy Support"
      ctaHref="/contact"
    />
  );
}
