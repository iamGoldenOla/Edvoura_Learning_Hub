import RoleChatBox from '@/components/dashboards/RoleChatBox';
import { requireAppViewer } from '@/lib/app-context';
import { MessageSquare } from 'lucide-react';

export default async function TutorMessagesPage() {
  const viewer = await requireAppViewer();
  const senderName = viewer.currentUser.profile.fullName ?? 'Tutor';

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1400px] space-y-6 pb-20 sm:space-y-8">
      <section className="overflow-hidden rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] min-w-0">
        <div className="border-b-[3px] sm:border-b-[4px] border-dark bg-yellow/20 p-5 sm:p-8 md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:gap-8 lg:flex-row lg:items-center min-w-0">
            <div className="min-w-0 space-y-3 w-full">
              <span className="inline-flex items-center justify-center text-center gap-2 border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.2em] shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] break-words max-w-full">
                COMMUNICATION HUB
              </span>
              <h1 className="flex flex-wrap items-center gap-3 sm:gap-4 text-3xl sm:text-4xl md:text-5xl font-black leading-[0.92] tracking-tight text-dark break-words">
                Tutor Messages
                <div className="hidden h-10 w-10 sm:h-12 sm:w-12 rotate-6 items-center justify-center rounded-xl sm:rounded-2xl border-[2px] sm:border-[3px] border-dark bg-white shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] md:flex">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-dark" />
                </div>
              </h1>
              <p className="max-w-xl text-sm font-semibold normal-case text-dark/70 md:text-base break-words">
                Chat securely with parents and Grade 7-12 students. Student-to-student chat is permanently disabled for safety.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 md:p-12 min-w-0">
          <div className="overflow-hidden rounded-[20px] sm:rounded-3xl border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] min-w-0">
            <RoleChatBox
              title="Tutor Hub"
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
