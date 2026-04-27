import RoleChatBox from '@/components/dashboards/RoleChatBox';
import { requireAppViewer } from '@/lib/app-context';

export default async function ParentMessagesPage() {
  const viewer = await requireAppViewer();
  const senderName = viewer.currentUser.profile.fullName ?? 'Parent';

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-sky-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Parent Messages
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Chat directly with tutors and Grade 7-12 learner support thread when needed.
          </p>
        </div>
      </div>

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
