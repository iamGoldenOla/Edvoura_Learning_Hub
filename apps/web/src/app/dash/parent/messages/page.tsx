import RoleChatBox from '@/components/dashboards/RoleChatBox';
import { requireAppViewer } from '@/lib/app-context';

export default async function ParentMessagesPage() {
  const viewer = await requireAppViewer();
  const senderName = viewer.currentUser.profile.fullName ?? 'Parent';

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-5 p-3 pb-24 sm:space-y-8 sm:p-6 lg:p-8">
      <div className="min-w-0 overflow-hidden rounded-[24px] border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C] sm:rounded-[28px] sm:border-[4px] sm:shadow-[10px_10px_0px_#060E1C]">
        <div className="border-b-[4px] border-dark bg-sky-100 p-5 sm:p-8">
          <h1 className="text-[2rem] font-black tracking-tight leading-[0.92] text-dark sm:text-4xl md:text-5xl">
            Parent Messages
          </h1>
          <p className="mt-3 max-w-xl text-sm font-bold text-dark/70 sm:mt-4 md:text-base">
            Chat directly with tutors and Grade 7-12 learner support threads when needed.
          </p>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-[24px] border-[3px] border-dark bg-white p-3 shadow-[4px_4px_0px_#060E1C] sm:rounded-[28px] sm:border-[4px] sm:p-4 sm:shadow-[10px_10px_0px_#060E1C]">
        <RoleChatBox
          title="Parent Communication Hub"
          senderRole="parent"
          senderName={senderName}
          channels={[
            {
              id: 'tutor-parent',
              label: 'Parent to Tutor',
              description: 'Ask tutor questions about class progress, behavior, and homework.',
            },
            {
              id: 'parent-student-7-12',
              label: 'Parent to Grade 7-12 Student',
              description: 'Support and accountability communication with your learner.',
            },
          ]}
        />
      </div>
    </div>
  );
}
