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

  const resourcesWithFiles = await Promise.all((resources || []).map(async (res) => {
    const relatedFiles = files?.filter(f => f.assignment_id === res.assignment_id) || [];
    const filesWithUrls = await Promise.all(relatedFiles.map(async (f) => {
      const { data } = await supabase.storage.from(f.bucket_id).createSignedUrl(f.object_path, 3600);
      return { ...f, downloadUrl: data?.signedUrl };
    }));
    return { ...res, files: filesWithUrls };
  }));

  // Map to the format needed by the client component
  const formattedResources = resourcesWithFiles.map(res => ({
    id: res.id,
    event_type: res.event_type,
    payload: {
      title: String(res.payload?.title || ''),
      description: String(res.payload?.description || ''),
    },
    created_at: res.created_at,
    files: res.files.map(f => ({
      id: f.id,
      object_path: f.object_path,
      downloadUrl: f.downloadUrl || undefined,
    })),
  }));

  return <LibraryClient resources={formattedResources} />;
}
