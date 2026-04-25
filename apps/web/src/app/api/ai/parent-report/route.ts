/**
 * POST /api/ai/parent-report
 *
 * Auto-generates a warm, professional weekly report for a parent about
 * their child's academic progress.  Powered by real data from
 * progress_snapshots and the Personalization Engine.
 *
 * Only Admins and the system (cron) should call this endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateParentReport } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.childUserId || !body?.reportPeriod) {
    return NextResponse.json(
      { error: 'Missing required fields: childUserId, reportPeriod' },
      { status: 400 },
    );
  }

  // Fetch the child's profile
  const { data: childProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', body.childUserId)
    .single();

  if (!childProfile) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 });
  }

  // Fetch learning profile
  const { data: learningProfile } = await supabase
    .from('student_learning_profiles')
    .select('*')
    .eq('student_user_id', body.childUserId)
    .single();

  // Fetch recent snapshots
  const { data: recentSnapshots } = await supabase
    .from('progress_snapshots')
    .select('*')
    .eq('student_user_id', body.childUserId)
    .order('snapshot_date', { ascending: false })
    .limit(4);

  // Build context for the AI
  const avgScore = recentSnapshots?.length
    ? Math.round(
        recentSnapshots.reduce((sum, s) => sum + (Number(s.average_score) || 0), 0) /
          recentSnapshots.length,
      )
    : null;

  const avgAttendance = recentSnapshots?.length
    ? Math.round(
        recentSnapshots.reduce((sum, s) => sum + (Number(s.attendance_rate) || 0), 0) /
          recentSnapshots.length,
      )
    : null;

  const performanceSummary = `Average score: ${avgScore ?? 'N/A'}%. Attendance rate: ${avgAttendance ?? 'N/A'}%. Learning pace: ${learningProfile?.learning_pace ?? 'standard'}.`;

  const highlights: string[] = [];
  const concerns: string[] = [];

  if (avgScore && avgScore >= 70) highlights.push(`Strong academic performance with ${avgScore}% average`);
  if (avgAttendance && avgAttendance >= 90) highlights.push(`Excellent attendance at ${avgAttendance}%`);
  if (avgScore && avgScore < 50) concerns.push(`Average score is below 50% — needs focused attention`);
  if (avgAttendance && avgAttendance < 70) concerns.push(`Attendance has dropped below 70%`);
  if (learningProfile?.learning_pace === 'needs_intervention')
    concerns.push('Learning pace flagged for intervention');

  if (highlights.length === 0) highlights.push('Steady engagement with learning activities');
  if (concerns.length === 0) concerns.push('No major concerns this period');

  // Generate the report
  const result = await generateParentReport({
    childName: childProfile.full_name ?? 'Your child',
    reportPeriod: body.reportPeriod,
    performanceSummary,
    highlights,
    concerns,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: 'Report generation failed', detail: result.error },
      { status: 422 },
    );
  }

  // Log the action
  await supabase.from('ai_action_logs').insert({
    trigger_type: 'weekly_report',
    target_user_id: body.childUserId,
    action_payload: { report: result.data },
  });

  // Optionally create a notification for the parent
  const { data: parentLinks } = await supabase
    .from('parent_child_links')
    .select('parent_user_id')
    .eq('child_user_id', body.childUserId);

  if (parentLinks?.length) {
    for (const link of parentLinks) {
      await supabase.from('notifications').insert({
        recipient_user_id: link.parent_user_id,
        title: `Weekly Report: ${childProfile.full_name ?? 'Your Child'}`,
        body: result.data.summary,
        status: 'unread',
        metadata: { reportData: result.data },
      });
    }
  }

  return NextResponse.json({
    message: 'Parent report generated successfully',
    report: result.data,
    attempts: result.attempts,
  });
}
