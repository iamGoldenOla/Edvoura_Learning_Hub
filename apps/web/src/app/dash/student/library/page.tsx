import { createClient } from '@/utils/supabase/server';
import { requireAppViewer } from '@/lib/app-context';
import { FileText, Download } from 'lucide-react';

export default async function LibraryPage() {
  const viewer = await requireAppViewer();
  const supabase = await createClient();

  // Fetch events from learning_activity_events where event_type = 'lesson_resource_uploaded'
  const { data: resources } = await supabase
    .from('learning_activity_events')
    .select('id, payload, created_at')
    .eq('event_type', 'lesson_resource_uploaded')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Resource Library</h1>
        <p className="mt-2 text-sm text-slate-600">
          Access general lesson resources, study guides, and materials uploaded by your tutors.
        </p>
      </section>

      <div className="space-y-4">
        {resources && resources.length > 0 ? (
          resources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-edvoura-navy hover:bg-slate-50">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{resource.payload.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{resource.payload.description || 'No description provided.'}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(resource.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-edvoura-navy hover:text-white transition-colors">
                <Download className="h-5 w-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No resources available yet. When a tutor uploads a resource, it will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
