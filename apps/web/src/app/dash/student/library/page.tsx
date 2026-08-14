import { createClient } from '@/utils/supabase/server';
import { requireAppViewer } from '@/lib/app-context';
import LibraryClient from './LibraryClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LibraryPage() {
  const viewer = await requireAppViewer();
  const supabase = await createClient();

  // 1. Get the student's enrolled class IDs
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id')
    .eq('student_user_id', viewer.currentUser.userId)
    .eq('status', 'active');

  const classIds = enrollments?.map(e => e.class_id) || [];

  // 2. Fetch events (Resources + Spelling Bees) for those classes
  const { data: resources } = await supabase
    .from('learning_activity_events')
    .select('id, event_type, payload, created_at, assignment_id')
    .in('event_type', ['lesson_resource_uploaded', 'spelling_bee_created'])
    .in('class_id', classIds)
    .order('created_at', { ascending: false });

  // 3. Fetch files for these resources
  const assignmentIds = resources?.map(r => r.assignment_id).filter(Boolean) || [];
  const { data: files } = assignmentIds.length > 0 
    ? await supabase.from('assignment_files').select('*').in('assignment_id', assignmentIds)
    : { data: [] };

  // 4. Fetch AI content details for published resources
  const aiContentIds = (resources || [])
    .map((r) => r.payload?.ai_content_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const { data: aiContents } = aiContentIds.length > 0
    ? await supabase
        .from('ai_generated_content')
        .select('id, content_type, task_type, content_json, title, topic, subject')
        .in('id', aiContentIds)
    : { data: [] };

  const aiContentMap = new Map((aiContents || []).map((item) => [item.id, item]));

  const resourcesWithFiles = await Promise.all((resources || []).map(async (res) => {
    const relatedFiles = files?.filter(f => f.assignment_id === res.assignment_id) || [];
    const filesWithUrls = await Promise.all(relatedFiles.map(async (f) => {
      const { data } = await supabase.storage.from(f.bucket_id).createSignedUrl(f.object_path, 3600);
      return { ...f, downloadUrl: data?.signedUrl };
    }));
    return { ...res, files: filesWithUrls };
  }));

  // Map to the format needed by the client component
  const formattedResources = resourcesWithFiles.map(res => {
    const aiContentId = res.payload?.ai_content_id;
    const aiData = typeof aiContentId === 'string' ? aiContentMap.get(aiContentId) : null;
    const contentJson = (aiData?.content_json || res.payload?.content_json || null) as Record<string, unknown> | null;
    const contentType = String(aiData?.content_type || res.payload?.content_type || (res.payload?.title?.toLowerCase().includes('story') ? 'story' : 'resource'));

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
      files: res.files.map(f => ({
        id: f.id,
        object_path: f.object_path,
        downloadUrl: f.downloadUrl || undefined,
      })),
    };
  });

  return <LibraryClient resources={formattedResources} />;
}
