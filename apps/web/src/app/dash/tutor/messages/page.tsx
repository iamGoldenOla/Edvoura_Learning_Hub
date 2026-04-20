import RoleChatBox from '@/components/dashboards/RoleChatBox';
import { requireAppViewer } from '@/lib/app-context';

export default async function TutorMessagesPage() {
  const viewer = await requireAppViewer();
  const senderName = viewer.currentUser.profile.fullName ?? 'Tutor';

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Tutor Messages</h1>
        <p className="mt-2 text-sm text-slate-600">
          Chat with parents and Grade 7-12 students. Student-to-student chat is disabled.
        </p>
      </section>

      <RoleChatBox
        title="Tutor Communication Hub"
        senderRole="tutor"
        senderName={senderName}
        channels={[
          {
            id: 'tutor-parent',
            label: 'Tutor ↔ Parent',
            description: 'Progress updates, attendance alerts, homework communication.',
          },
          {
            id: 'tutor-student-7-12',
            label: 'Tutor ↔ Grade 7-12 Student',
            description: 'Academic support and lesson clarifications for Grade 7-12 learners.',
          },
        ]}
      />
    </div>
  );
}
