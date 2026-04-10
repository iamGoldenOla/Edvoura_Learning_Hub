import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TutorSchedulePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-edvoura-navy mb-8">Lesson Schedule</h1>
      
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Upcoming Sessions</CardTitle>
          <Button variant="outline" className="text-sm">Sync with Google Calendar</Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <span className="text-4xl block mb-4">📅</span>
            <p>Your schedule is clear! No upcoming classes found for this week.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
