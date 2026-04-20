import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function TutorGradingPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const action = typeof searchParams.action === 'string' ? searchParams.action : null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-edvoura-navy mb-2">Grading Tasks</h1>
      <p className="text-slate-600 mb-8">Submissions awaiting your review and scoring.</p>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-8 text-sm flex justify-between items-center">
        <span><strong>Reminder:</strong> Submissions should be graded within 48 hours to maintain platform quality standards.</span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/dash/tutor/grading?action=open-queue">
          <Button variant="primary" className="text-xs">Open Grading Queue</Button>
        </Link>
        <Link href="/dash/tutor/builder?tool=assignment">
          <Button variant="outline" className="border-slate-300 bg-white text-xs">Create Assignment</Button>
        </Link>
      </div>

      {action ? (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          Action Center: <strong>{action}</strong> mode active.
        </div>
      ) : null}
      
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
