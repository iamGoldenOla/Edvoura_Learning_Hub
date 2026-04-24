import RoleChatBox from '@/components/dashboards/RoleChatBox';
import { requireAppViewer } from '@/lib/app-context';
import { MessageSquare } from 'lucide-react';

export default async function TutorMessagesPage() {
  const viewer = await requireAppViewer();
  const senderName = viewer.currentUser.profile.fullName ?? 'Tutor';

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <section className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        
        {/* Header */}
        <div className="p-8 md:p-12 border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 min-w-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-dark bg-white text-[10px] tracking-[0.2em] font-black shadow-[4px_4px_0px_#060E1C]">
                COMMUNICATION HUB
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark flex items-center gap-4">
                Tutor Messages
                <div className="hidden md:flex h-12 w-12 rounded-2xl border-[3px] border-dark bg-white items-center justify-center shadow-[4px_4px_0px_#060E1C] rotate-6">
                  <MessageSquare className="h-6 w-6 text-dark" />
                </div>
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl">
                Chat securely with parents and Grade 7-12 students. Note: Student-to-student chat is permanently disabled for safety.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="border-[3px] border-dark rounded-3xl bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
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
        </div>
      </section>
    </div>
  );
}
