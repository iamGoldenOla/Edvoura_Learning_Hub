import { createClient } from '@/utils/supabase/server';
import { apiClient } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function StudentClassesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const enrollments = await apiClient.get<any[]>('/classes/my-enrollments', { token: session?.access_token }).catch(() => []);

  // Based on Edvoura Product Vision
  const learnerBand = "Grades 4-6"; // Placeholder logic 

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-edvoura-navy">My Classes</h1>
          <p className="mt-2 text-slate-600">Access your live lessons and course materials.</p>
        </div>
        <div className="bg-edvoura-navy text-edvoura-gold font-bold px-4 py-2 rounded-full text-sm">
          Band: {learnerBand}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.length > 0 ? (
          enrollments.map((course: any, i: number) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-edvoura-navy">{course.title}</CardTitle>
                <p className="text-xs text-slate-500 mt-1">{course.subject}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm border p-3 rounded bg-slate-50 text-slate-600 mb-4">
                  Next Live Lesson: <strong className="text-edvoura-navy-dark">Tomorrow, 10:00 AM</strong>
                </p>
                <div className="flex gap-2">
                  <Button variant="primary" className="flex-1">Join Zoom</Button>
                  <Button variant="outline" className="flex-1">Materials</Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full pt-12 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-slate-700">No Active Classes</h3>
            <p className="text-slate-500 mt-2">You are not enrolled in any classes for the current academic session.</p>
          </div>
        )}
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-bold text-edvoura-navy mb-6">Explore EDVOURA Sub-Systems</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:border-edvoura-gold transition-colors text-center p-6">
            <span className="text-3xl block mb-2">🎮</span>
            <span className="font-medium text-slate-700">Games Room</span>
          </Card>
          <Card className="cursor-pointer hover:border-edvoura-gold transition-colors text-center p-6">
            <span className="text-3xl block mb-2">🐝</span>
            <span className="font-medium text-slate-700">Spelling Bee</span>
          </Card>
          <Card className="cursor-pointer hover:border-edvoura-gold transition-colors text-center p-6">
            <span className="text-3xl block mb-2">📝</span>
            <span className="font-medium text-slate-700">Take a Quiz</span>
          </Card>
          <Card className="cursor-pointer hover:border-edvoura-gold transition-colors text-center p-6 bg-edvoura-navy text-white">
            <span className="text-3xl block mb-2">🏆</span>
            <span className="font-medium">Rewards & Badges</span>
          </Card>
        </div>
      </div>
    </div>
  );
}
