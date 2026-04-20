import Link from 'next/link';

import RoleChatBox from '@/components/dashboards/RoleChatBox';
import { gradeBandCodeToUiBand, requireAppViewer } from '@/lib/app-context';

export default async function StudentTutorChatPage() {
  const viewer = await requireAppViewer();
  const senderName = viewer.currentUser.profile.fullName ?? 'Student';
  const uiBand = gradeBandCodeToUiBand(viewer.currentUser.learnerProfile?.gradeBandCode ?? null);

  if (uiBand !== '7-12') {
    return (
      <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-edvoura-navy">Tutor Chat Restricted</h1>
        <p className="text-sm text-slate-600">
          Direct chat is enabled for Grade 7-12 learners only. Please use assignments and live class tools.
        </p>
        <Link
          href="/dash/student"
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Student Overview
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Grade 7-12 Tutor Chat</h1>
        <p className="mt-2 text-sm text-slate-600">
          Chat with tutor and parent support only. Student-to-student chat is disabled.
        </p>
      </section>

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
