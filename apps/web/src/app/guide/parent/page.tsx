import InfoPageShell from '@/components/marketing/InfoPageShell';

export default function ParentGuidePage() {
  return (
    <InfoPageShell
      eyebrow="Parent Guide"
      title="How Parents Monitor Progress with Confidence"
      intro="Edvoura gives parents direct visibility into attendance, progress, billing, and tutor activity. This guide shows the core workflow so the parent dashboard stays useful instead of confusing."
      sections={[
        {
          title: 'Link and Verify Students',
          body: [
            'Your parent account should be linked to the correct student records so reports, attendance, and schedules reflect the right child.',
            'If child data looks incomplete, the first thing to check is whether the account link is correct.',
          ],
        },
        {
          title: 'Track Learning Weekly',
          body: [
            'Use the monitor and reports areas to review recent lessons, assignment completion, score trends, and tutor comments.',
            'Pay close attention to repeated weak topics rather than only overall averages.',
          ],
        },
        {
          title: 'Manage Billing and Plans',
          body: [
            'Billing remains inside the platform so you can review invoices, upgrade plans, and monitor account status without leaving Edvoura.',
          ],
        },
        {
          title: 'Work with Tutors',
          body: [
            'Parents get the best results when they use progress data to ask clear questions about effort, weak topics, and next steps rather than waiting for exam periods.',
          ],
        },
      ]}
      ctaLabel="Speak with Support"
      ctaHref="/contact"
    />
  );
}
