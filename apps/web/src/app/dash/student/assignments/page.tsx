import { createClient } from '@/utils/supabase/server';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function StudentAssignmentsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const assignments = await apiClient.get<any[]>('/assignments/me', { token: session?.access_token }).catch(() => []);

  const pending = assignments.filter((a: any) => a.status === 'pending');
  const graded = assignments.filter((a: any) => a.status === 'completed');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-edvoura-navy mb-8">Assignments Workspace</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Column */}
        <div className="bg-slate-100/50 p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-edvoura-navy-dark">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            To-Do Tasks ({pending.length})
          </h2>
          
          <div className="space-y-4">
            {pending.length > 0 ? (
              pending.map((a: any, i: number) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-slate-800">{a.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                    <Button variant="primary" className="w-full text-xs py-1">Submit Work</Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500 py-8">You are all caught up!</p>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-slate-100/50 p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-edvoura-navy-dark">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            Graded Submissions ({graded.length})
          </h2>
          
          <div className="space-y-4">
            {graded.length > 0 ? (
              graded.map((a: any, i: number) => (
                <Card key={i} className="opacity-80">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-800 line-through decoration-slate-400">{a.title}</h3>
                      <p className="text-xs text-green-600 mt-1 font-medium text-edvoura-gold">Score: 92/100</p>
                    </div>
                    <Button variant="outline" className="text-xs py-1 px-2">View Feedback</Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500 py-8">No graded work yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
