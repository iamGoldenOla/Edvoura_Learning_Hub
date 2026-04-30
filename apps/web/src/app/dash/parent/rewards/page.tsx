import { Award, Star, Trophy } from 'lucide-react';
import { requireAppViewer, getParentDashboardData } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';

export default async function ParentRewardsPage() {
  await requireAppViewer();
  const parentData = await getParentDashboardData();
  const supabase = await createClient();

  const childIds = parentData.children.map((c) => c.userId);

  // Fetch real data for linked children
  let completedAssignments = 0;
  let totalAssignments = 0;
  let gradedSubmissions: Array<{ title: string; score: number; gradedAt: string }> = [];

  if (childIds.length > 0) {
    // Get classes children are enrolled in
    const { data: enrollmentsData = [] } = await supabase
      .from('class_enrollments')
      .select('class_id, student_user_id')
      .in('student_user_id', childIds)
      .eq('status', 'active');

    const classIds = [...new Set((enrollmentsData ?? []).map((e) => e.class_id))];

    if (classIds.length > 0) {
      // Get assignments in those classes
      const { data: assignmentsData = [] } = await supabase
        .from('assignments')
        .select('id, title')
        .in('class_id', classIds)
        .neq('status', 'archived');

      const normalizedAssignments = assignmentsData ?? [];
      totalAssignments = normalizedAssignments.length;
      const assignmentIds = normalizedAssignments.map((a) => a.id);
      const assignmentById = new Map(normalizedAssignments.map((a) => [a.id, a]));

      if (assignmentIds.length > 0) {
        // Get submissions for children
        const { data: submissionsData = [] } = await supabase
          .from('assignment_submissions')
          .select('id, assignment_id, status, created_at')
          .in('student_user_id', childIds)
          .in('assignment_id', assignmentIds);

        const normalizedSubmissions = submissionsData ?? [];
        const submissionIds = normalizedSubmissions.map((s) => s.id);
        const completedStatuses = ['graded', 'returned'];
        completedAssignments = normalizedSubmissions.filter((s) => completedStatuses.includes(s.status)).length;

        if (submissionIds.length > 0) {
          const { data: gradesData = [] } = await supabase
            .from('submission_grades')
            .select('submission_id, score, created_at')
            .in('submission_id', submissionIds)
            .order('created_at', { ascending: false })
            .limit(10);

          const submissionById = new Map(normalizedSubmissions.map((s) => [s.id, s]));

          gradedSubmissions = (gradesData ?? []).map((g) => {
            const submission = submissionById.get(g.submission_id);
            const assignment = submission ? assignmentById.get(submission.assignment_id) : null;
            return {
              title: assignment?.title ?? 'Assignment',
              score: g.score ?? 0,
              gradedAt: g.created_at,
            };
          });
        }
      }
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '--';
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24">
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-8 border-b-[4px] border-dark bg-yellow">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Rewards & Engagement
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Track assignment completions, scores, and learning milestones for your child.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-purple-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Total Assignments</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{totalAssignments}</p>
            <p className="text-xs font-bold text-dark/60 mt-2 uppercase tracking-widest">Assigned to children</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-emerald-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Completed & Graded</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{completedAssignments}</p>
            <p className="text-xs font-bold text-dark/60 mt-2 uppercase tracking-widest">Submissions graded</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-rose-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Linked Children</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{parentData.children.length}</p>
            <p className="text-xs font-bold text-dark/60 mt-2 uppercase tracking-widest">Active profiles</p>
          </div>
        </div>
      </section>

      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center gap-3">
          <Trophy className="h-6 w-6 text-dark" />
          <h2 className="text-2xl font-black text-dark tracking-tight">Recent Graded Work</h2>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          {gradedSubmissions.length > 0 ? (
            gradedSubmissions.map((item, index) => (
              <div key={`graded-${index}`} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-black text-dark">{item.title}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mt-1">
                    {formatDate(item.gradedAt)}
                  </p>
                </div>
                <span className="inline-flex rounded-xl border-[2px] border-dark bg-yellow px-4 py-2 text-sm font-black text-dark shadow-[2px_2px_0px_#060E1C]">
                  Score: {item.score}%
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-10 text-center flex flex-col items-center">
              <Trophy className="h-8 w-8 text-dark/30 mb-4" />
              <p className="text-sm font-bold text-dark/60 italic">No graded work yet. Achievements will appear here as assignments are completed and graded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
