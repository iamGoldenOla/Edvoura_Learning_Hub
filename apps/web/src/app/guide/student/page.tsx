import InfoPageShell from '@/components/marketing/InfoPageShell';

export default function StudentGuidePage() {
  return (
    <InfoPageShell
      eyebrow="Student Guide"
      title="How Students Get the Most Out of Edvoura"
      intro="This guide covers the essential flow for learners: joining classes, completing assignments, using AI study content, and staying on top of progress."
      sections={[
        {
          title: 'Before Class',
          body: [
            'Check your classes or live schedule early so you know the lesson time, subject, and tutor.',
            'Make sure your device, internet, and login are ready before the session starts.',
          ],
        },
        {
          title: 'During Learning',
          body: [
            'Use lesson notes, assignments, AI study hubs, and revision tools to reinforce what your tutor teaches.',
            'Ask for simpler explanations or extra checks when a topic is still unclear.',
          ],
        },
        {
          title: 'After Class',
          body: [
            'Review published materials, complete homework on time, and revisit weak topics shown in your analytics.',
            'Consistent follow-up matters more than last-minute cramming.',
          ],
        },
        {
          title: 'When Something Breaks',
          body: [
            'If a class link, assignment, or published AI challenge is missing, report it through your tutor or the Edvoura support team.',
          ],
        },
      ]}
      ctaLabel="Go to Contact"
      ctaHref="/contact"
    />
  );
}
