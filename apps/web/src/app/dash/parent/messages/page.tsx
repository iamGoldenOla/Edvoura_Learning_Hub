import RoleChatBox from '@/components/dashboards/RoleChatBox';
import { requireAppViewer } from '@/lib/app-context';

export default async function ParentMessagesPage() {
  const viewer = await requireAppViewer();
  const senderName = viewer.currentUser.profile.fullName ?? 'Parent';

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Parent Messages</h1>
        <p className="mt-2 text-sm text-slate-600">
          Chat directly with tutors and Grade 7-12 learner support thread when needed.
        </p>
      </section>

      <RoleChatBox
        title="Parent Communication Hub"
        senderRole="parent"
        senderName={senderName}
        channels={[
          {
            id: 'tutor-parent',
            label: 'Parent ↔ Tutor',
            description: 'Ask tutor questions about class progress, behavior, and homework.',
          },
          {
            id: 'parent-student-7-12',
            label: 'Parent ↔ Grade 7-12 Student',
            description: 'Support and accountability communication with your learner.',
          },
        ]}
      />
    </div>
  );
}
