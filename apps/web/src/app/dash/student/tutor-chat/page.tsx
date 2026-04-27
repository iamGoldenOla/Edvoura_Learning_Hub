import Link from 'next/link';

import RoleChatBox from '@/components/dashboards/RoleChatBox';
import { gradeBandCodeToUiBand, requireAppViewer } from '@/lib/app-context';

export default async function StudentTutorChatPage() {
  const viewer = await requireAppViewer();
  const senderName = viewer.currentUser.profile.fullName ?? 'Student';
  const uiBand = gradeBandCodeToUiBand(viewer.currentUser.learnerProfile?.gradeBandCode ?? null);

  if (uiBand !== '7-12') {
    return (
      <div className="mx-auto max-w-[1680px] p-6 sm:p-8 pb-20">
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-8 border-b-[4px] border-dark bg-rose-100">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-dark">Messages Restricted</h1>
            <p className="mt-4 text-sm font-bold text-dark/70 max-w-xl">
              Direct messaging is enabled for Grade 7-12 learners only. Please use assignments and live class tools.
            </p>
          </div>
          <div className="p-8">
            <Link
              href="/dash/student"
              className="inline-flex items-center bg-yellow border-[3px] border-dark !text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4"
            >
              Back to Student Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-sky-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Messages
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Chat with tutor and parent support only. Student-to-student chat is disabled.
          </p>
        </div>
      </div>

      <RoleChatBox
        title="Student Support Chat"
        senderRole="student"
        senderName={senderName}
        channels={[
          {
            id: 'tutor-student-7-12',
            label: 'Student ↔ Tutor',
            description: 'Ask tutor about lessons, assignments, quizzes, and feedback.',
          },
          {
            id: 'parent-student-7-12',
            label: 'Student ↔ Parent',
            description: 'Parent support and accountability messages.',
          },
        ]}
      />
    </div>
  );
}
