import Link from 'next/link';
import { requireAppViewer } from '@/lib/app-context';
import { ClassroomWorkspace } from '@/components/classroom/ClassroomWorkspace';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams?: Promise<{
    lessonId?: string;
    studentId?: string;
  }> | {
    lessonId?: string;
    studentId?: string;
  };
}

export default async function StudentClassroomPage(props: PageProps) {
  const viewer = await requireAppViewer();
  const searchParams = (await props.searchParams) ?? {};
  let lessonId = searchParams.lessonId;

  if (!lessonId) {
    // Default to student's personal 1-on-1 room if no specific lesson id
    lessonId = `1on1-${viewer.currentUser.userId}`;
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
