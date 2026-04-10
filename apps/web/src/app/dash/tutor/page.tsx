import { Card, CardHeader, CardTitle, CardContent, MetricCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TutorDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-edvoura-navy">Tutor Headquarters</h1>
          <p className="mt-2 text-slate-600 text-sm">Manage your schedule, students, and grading workflows.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white border-slate-300">Set Availability</Button>
          <Button variant="primary" className="bg-edvoura-navy text-white">Create Assignment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Today's Sessions" value="2" description="Google Meet links ready" />
        <MetricCard title="Active Students" value="48" description="Across 3 subjects" />
        <MetricCard title="Ungraded Tasks" value="12" description="Please review within 48 hrs" />
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium opacity-90">Current Earnings</span>
          <span className="text-3xl font-bold">₦125,000</span>
          <span className="text-xs opacity-80 mt-1 cursor-pointer hover:underline">View Payout History →</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Schedule & Google Meet Generator */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>📹</span> Today's Sessions & Conferencing
              </CardTitle>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                
                {/* Session 1 */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-center font-bold border border-blue-100 min-w-20">
                      14:00
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">JSS3 Mathematics - Group A</h4>
                      <p className="text-xs text-slate-500 mt-1">12 Students Enrolled • 60 mins</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none text-xs border-slate-300">View Roster</Button>
                    <Button variant="primary" className="flex-1 md:flex-none text-xs bg-blue-600 hover:bg-blue-700">Launch Google Meet</Button>
                  </div>
                </div>

                {/* Session 2 */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-center font-bold border border-slate-200 min-w-20">
                      16:30
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">SS2 Physics - Private</h4>
                      <p className="text-xs text-slate-500 mt-1">1 Student (David O.) • 45 mins</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none text-xs border-slate-300">Notes</Button>
                    <Button variant="outline" className="flex-1 md:flex-none text-xs text-slate-500 opacity-70 border-dashed">Meet Link Pending</Button>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Workflow Tools */}
        <div className="space-y-6">
          
          {/* Grading Tool Reminder */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-amber-900 font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Attention Required
            </h3>
            <p className="text-sm text-amber-800 mb-4">You have <strong>12</strong> assignments from the 'G4 Basic Science' cohort that are unreviewed past the 48-hour SLA.</p>
            <Button variant="outline" className="w-full bg-white border-amber-300 text-amber-900 hover:bg-amber-100">Open Grading Tool</Button>
          </div>

          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Creation Suite</h3>
              <div className="space-y-2">
                <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-3"><span>📋</span> Quiz Builder</span>
                  <span className="text-slate-300 font-bold">→</span>
                </button>
                <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-3"><span>📁</span> Resource Uploader</span>
                  <span className="text-slate-300 font-bold">→</span>
                </button>
                <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-3"><span>👔</span> Manage Roster</span>
                  <span className="text-slate-300 font-bold">→</span>
                </button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
