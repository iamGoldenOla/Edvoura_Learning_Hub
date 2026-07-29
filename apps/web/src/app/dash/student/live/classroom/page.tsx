import Link from 'next/link';
import { requireAppViewer } from '@/lib/app-context';
import { ClassroomWorkspace } from '@/components/classroom/ClassroomWorkspace';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: {
    lessonId?: string;
  };
}

export default async function StudentClassroomPage({ searchParams }: PageProps) {
  const viewer = await requireAppViewer();
  const lessonId = searchParams.lessonId;

  if (!lessonId) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-white border-[4px] border-dark rounded-[28px] p-8 shadow-[8px_8px_0px_#060E1C] mt-12">
        <h2 className="text-2xl font-black text-dark mb-4">Classroom Error</h2>
        <p className="text-sm font-bold text-dark/60 mb-6">No active class session identifier was supplied.</p>
        <Link
          href="/dash/student/live"
          className="inline-flex items-center gap-2 px-6 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C] rounded-xl hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:scale-95 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Waiting Room
        </Link>
      </div>
    );
  }

  const userName = viewer.currentUser.profile?.fullName || 'Student';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dash/student/live"
            className="flex h-10 w-10 items-center justify-center rounded-xl border-[2.5px] border-dark bg-white hover:bg-slate-50 text-dark shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95 shrink-0"
            title="Leave classroom"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-dark tracking-tight uppercase">Live Classroom Hub</h1>
        </div>
      </div>

      <ClassroomWorkspace
        lessonId={lessonId}
        role="student"
        userName={userName}
      />
    </div>
  );
}
