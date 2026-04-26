import { createClient } from '@/utils/supabase/server';
import { requireAppViewer } from '@/lib/app-context';
import { FileText, Download, Library as LibraryIcon } from 'lucide-react';

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

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-sky-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark flex items-center gap-4">
            <LibraryIcon className="h-10 w-10" /> Resource Library
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Access general lesson resources, study guides, and materials uploaded by your tutors.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {resourcesWithFiles.length > 0 ? (
          resourcesWithFiles.map((resource) => (
            <div key={resource.id} className="flex flex-col gap-6 rounded-[28px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_#060E1C]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className={`rounded-2xl border-[3px] border-dark p-4 shadow-[3px_3px_0px_#060E1C] ${resource.event_type === 'spelling_bee_created' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    <FileText className="h-7 w-7 text-dark" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black text-dark">{resource.payload.title}</h3>
                      {resource.event_type === 'spelling_bee_created' && (
                        <span className="inline-flex rounded-xl border-[2px] border-dark bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-900 shadow-[2px_2px_0px_#060E1C]">
                          Spelling Bee
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-bold text-dark/70 leading-relaxed">{resource.payload.description || 'No description provided.'}</p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-dark/40">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {resource.files.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2">
                  {resource.files.map((file: any) => (
                    <a 
                      key={file.id}
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 rounded-xl border-[3px] border-dark bg-off-white px-4 py-3 text-xs font-black text-dark shadow-[4px_4px_0px_#060E1C] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#060E1C] transition-all"
                    >
                      <span className="truncate">{file.object_path.split('/').pop()}</span>
                      <Download className="h-4 w-4 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border-[4px] border-dashed border-dark/20 bg-slate-50 p-12 text-center flex flex-col items-center">
            <LibraryIcon className="h-10 w-10 text-dark/30 mb-4" />
            <p className="text-sm font-bold text-dark/60 italic">No resources available yet. When a tutor uploads a resource, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
