import InfoPageShell from '@/components/marketing/InfoPageShell';

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="Terms of Service"
      title="Clear Rules for Students, Families, and Tutors"
      intro="These platform terms set expectations for account use, tutoring conduct, payments, and responsible behavior across the Edvoura ecosystem."
      sections={[
        {
          title: 'Account Responsibility',
          body: [
            'Users are responsible for keeping their login details secure and for using the correct role-based portal.',
            'Parents are expected to supervise minor learners and maintain accurate child-link information.',
          ],
        },
        {
          title: 'Tutoring and Content',
          body: [
            'Tutors are responsible for the quality and accuracy of lessons, assignments, and published AI-assisted materials.',
            'Students may use platform content for learning, but not for resale or unauthorized redistribution.',
          ],
        },
        {
          title: 'Payments and Scheduling',
          body: [
            'Billing, plan upgrades, and platform payments follow the terms of the selected Edvoura subscription or service arrangement.',
            'Rescheduling and cancellation windows apply to booked sessions and may affect session availability or usage balances.',
          ],
        },
        {
          title: 'Safe Platform Use',
          body: [
            'Harassment, impersonation, abuse of platform tools, and attempts to bypass account restrictions are not allowed.',
            'Edvoura may suspend or restrict accounts that create safety, billing, or academic integrity risks.',
          ],
        },
      ]}
      ctaLabel="Talk to the Team"
      ctaHref="/contact"
    />
  );
}
