import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TutorGradingPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-edvoura-navy mb-2">Grading Tasks</h1>
      <p className="text-slate-600 mb-8">Submissions awaiting your review and scoring.</p>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-8 text-sm flex justify-between items-center">
        <span><strong>Reminder:</strong> Submissions should be graded within 48 hours to maintain platform quality standards.</span>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Needs Grading (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <span className="text-4xl block mb-4">✨</span>
            <p>Incredible! You have zero pending grading tasks. All caught up.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
