import RoleChatBox from '@/components/dashboards/RoleChatBox';
import { requireAppViewer } from '@/lib/app-context';
import { MessageSquare } from 'lucide-react';

export default async function TutorMessagesPage() {
  const viewer = await requireAppViewer();
  const senderName = viewer.currentUser.profile.fullName ?? 'Tutor';

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 pb-20 sm:p-8">
      <section className="overflow-hidden rounded-[28px] border-[4px] border-dark bg-white shadow-[10px_10px_0px_#060E1C]">
        <div className="border-b-[4px] border-dark bg-yellow/20 p-8 md:p-12">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="min-w-0 space-y-3">
              <span className="inline-flex items-center gap-2 border-[3px] border-dark bg-white px-4 py-2 text-[10px] font-black tracking-[0.2em] shadow-[4px_4px_0px_#060E1C]">
                COMMUNICATION HUB
              </span>
              <h1 className="flex items-center gap-4 text-4xl font-black leading-[0.92] tracking-tight text-dark md:text-5xl">
                Tutor Messages
                <div className="hidden h-12 w-12 rotate-6 items-center justify-center rounded-2xl border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C] md:flex">
                  <MessageSquare className="h-6 w-6 text-dark" />
                </div>
              </h1>
              <p className="max-w-xl text-sm font-semibold normal-case text-dark/70 md:text-base">
                Chat securely with parents and Grade 7-12 students. Student-to-student chat is permanently disabled for safety.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="overflow-hidden rounded-3xl border-[3px] border-dark bg-white shadow-[8px_8px_0px_#060E1C]">
            <RoleChatBox
              title="Tutor Communication Hub"
              senderRole="tutor"
              senderName={senderName}
              channels={[
                {
                  id: 'tutor-parent',
                  label: 'Tutor <-> Parent',
                  description: 'Progress updates, attendance alerts, homework communication.',
                },
                {
                  id: 'tutor-student-7-12',
                  label: 'Tutor <-> Grade 7-12 Student',
                  description: 'Academic support and lesson clarifications for Grade 7-12 learners.',
                },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
