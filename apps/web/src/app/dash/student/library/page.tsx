import { createClient } from '@/utils/supabase/server';
import { requireAppViewer } from '@/lib/app-context';
import LibraryClient from './LibraryClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LibraryPage() {
  const viewer = await requireAppViewer();
  const supabase = await createClient();
  const studentUserId = viewer.currentUser.userId;

  // 1. Fetch student profile to get grade_level_id & name
  const [{ data: stProfile }, { data: userProfile }] = await Promise.all([
    supabase
      .from('student_profiles')
      .select('grade_level_id, grade_level:grade_levels(id, code, display_name)')
      .eq('user_id', studentUserId)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', studentUserId)
      .maybeSingle(),
  ]);

  const studentName = userProfile?.full_name || '';
  const studentFirstName = studentName.split(' ')[0]?.toLowerCase() || '';
  const gradeLevelId = stProfile?.grade_level_id;

  // 2. Get student's enrolled class IDs + all classes for student's grade level
  const [{ data: enrollments }, { data: gradeClasses }] = await Promise.all([
    supabase
      .from('class_enrollments')
      .select('class_id')
      .eq('student_user_id', studentUserId)
      .eq('status', 'active'),
    gradeLevelId
      ? supabase.from('classes').select('id').eq('grade_level_id', gradeLevelId)
      : { data: [] },
  ]);

  const classIds = Array.from(
    new Set([
      ...(enrollments?.map((e) => e.class_id) || []),
      ...(gradeClasses?.map((c) => c.id) || []),
    ])
  );

  // 3. Fetch events (Resources + Spelling Bees) for enrolled classes AND recent resources to check for name/target matches
  const [{ data: classResources = [] }, { data: recentEvents = [] }] = await Promise.all([
    classIds.length > 0
      ? supabase
          .from('learning_activity_events')
          .select('id, event_type, payload, created_at, assignment_id, class_id')
          .in('event_type', ['lesson_resource_uploaded', 'spelling_bee_created'])
          .in('class_id', classIds)
          .order('created_at', { ascending: false })
      : { data: [] },
    supabase
      .from('learning_activity_events')
      .select('id, event_type, payload, created_at, assignment_id, class_id')
      .in('event_type', ['lesson_resource_uploaded', 'spelling_bee_created'])
      .order('created_at', { ascending: false })
      .limit(60),
  ]);

  // Combine and deduplicate
  const combinedMap = new Map();
  for (const item of classResources || []) {
    combinedMap.set(item.id, item);
  }
  for (const item of recentEvents || []) {
    const payload = item.payload || {};
    const titleLower = String(payload.title || '').toLowerCase();
    const isTargeted = payload.target_student_id === studentUserId;
    const isNameMatch = studentFirstName && titleLower.includes(studentFirstName);
    if (isTargeted || isNameMatch || classIds.includes(item.class_id)) {
      combinedMap.set(item.id, item);
    }
  }

  const resources = Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // 4. Fetch files for these resources
  const assignmentIds = resources.map((r) => r.assignment_id).filter(Boolean);
  const { data: files } = assignmentIds.length > 0
    ? await supabase.from('assignment_files').select('*').in('assignment_id', assignmentIds)
    : { data: [] };

  // 5. Fetch AI content details for published resources
  const aiContentIds = resources
    .map((r) => r.payload?.ai_content_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const { data: aiContents } = aiContentIds.length > 0
    ? await supabase
        .from('ai_generated_content')
        .select('id, content_type, task_type, content_json, title, topic, subject')
        .in('id', aiContentIds)
    : { data: [] };

  const aiContentMap = new Map((aiContents || []).map((item) => [item.id, item]));

  const resourcesWithFiles = await Promise.all(
    resources.map(async (res) => {
      const relatedFiles = files?.filter((f) => f.assignment_id === res.assignment_id) || [];
      const filesWithUrls = await Promise.all(
        relatedFiles.map(async (f) => {
          const { data } = await supabase.storage.from(f.bucket_id).createSignedUrl(f.object_path, 86400); // 24 hours
          return { ...f, downloadUrl: data?.signedUrl };
        })
      );
      return { ...res, files: filesWithUrls };
    })
  );

  // Format resources for LibraryClient
  const formattedResources = resourcesWithFiles.map((res) => {
    const aiContentId = res.payload?.ai_content_id;
    const aiData = typeof aiContentId === 'string' ? aiContentMap.get(aiContentId) : null;
    const contentJson = (aiData?.content_json || res.payload?.content_json || null) as Record<string, unknown> | null;
    const contentType = String(
      aiData?.content_type ||
        res.payload?.content_type ||
        (res.payload?.title?.toLowerCase().includes('story') ? 'story' : 'resource')
    );

    return {
      id: res.id,
      event_type: res.event_type,
      content_type: contentType,
      payload: {
        title: String(res.payload?.title || aiData?.title || 'Learning Resource'),
        description: String(res.payload?.description || ''),
        content_json: contentJson,
        content_type: contentType,
      },
      created_at: res.created_at,
      files: res.files.map((f: { id: string; object_path: string; downloadUrl: string | null }) => ({
        id: f.id,
        object_path: f.object_path,
        downloadUrl: f.downloadUrl || undefined,
      })),
    };
  });

  return <LibraryClient resources={formattedResources} />;
}
