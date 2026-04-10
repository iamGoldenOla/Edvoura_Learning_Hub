import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Smile, Ruler, FileText, CreditCard, Calendar, CheckSquare, BookOpen } from 'lucide-react';

export default function ParentDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-edvoura-navy rounded-2xl p-8 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-edvoura-gold">Parent Control Centre</h1>
          <p className="mt-2 text-slate-300">Monitor your children's live sessions, progress reports, and billing.</p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-4">
          <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-800">Add Child Profile</Button>
          <Button variant="primary" className="bg-edvoura-gold text-edvoura-navy hover:bg-yellow-400">Message Support</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Children Overview & Live Session Monitor */}
        <div className="lg:col-span-2 space-y-8">
          
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-edvoura-navy" /> Enrolled Children Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Child Card 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                    <Smile className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">David O.</h3>
                    <p className="text-xs text-slate-500">Grade 5 • The Builder Band</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">In Live Class</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Live Session Monitor</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Mathematics</p>
                    <p className="text-xs text-slate-500">Started 15 mins ago with Dr. Adebayo</p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex gap-2">
                <Button variant="outline" className="flex-1 text-xs h-8">View Reports</Button>
                <Button variant="outline" className="flex-1 text-xs h-8">Message Tutor</Button>
              </div>
            </div>

            {/* Child Card 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500">
                    <Smile className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Sarah O.</h3>
                    <p className="text-xs text-slate-500">SS2 • The Achiever Band</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Offline</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Analytics</p>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs text-slate-600">JAMB Readiness</span>
                  <span className="text-xs font-bold text-slate-800">72%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-edvoura-navy h-full w-[72%]"></div>
                </div>
              </div>
              <div className="p-4 flex gap-2">
                <Button variant="outline" className="flex-1 text-xs h-8">View Reports</Button>
                <Button variant="outline" className="flex-1 text-xs h-8 opacity-50 cursor-not-allowed">Message Tutor</Button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Billing & Quick Actions */}
        <div className="space-y-6">
          
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100 bg-slate-50 rounded-t-2xl pb-4">
              <CardTitle className="text-base flex items-center gap-2 justify-between">
                <span>Billing & Subscriptions</span>
                <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">Paystack Configured</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-edvoura-navy">Family Premium</p>
                <p className="text-xs text-green-600 font-medium mt-1">Active • Auto-renews next month</p>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full text-xs h-9 justify-start gap-2">
                  <FileText className="w-3 h-3 text-slate-500" /> Download Recent Invoice
                </Button>
                <Button variant="outline" className="w-full text-xs h-9 justify-start gap-2">
                  <CreditCard className="w-3 h-3 text-slate-500" /> Update Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Quick Actions</h3>
              <ul className="space-y-3">
                <li className="text-sm text-slate-600 hover:text-edvoura-navy cursor-pointer flex items-center gap-2 font-medium">
                  <span className="bg-slate-100 p-1.5 rounded"><Calendar className="w-4 h-4 text-slate-500" /></span> View Upcoming Schedules
                </li>
                <li className="text-sm text-slate-600 hover:text-edvoura-navy cursor-pointer flex items-center gap-2 font-medium">
                  <span className="bg-slate-100 p-1.5 rounded"><CheckSquare className="w-4 h-4 text-slate-500" /></span> Review Assignment Statuses
                </li>
                <li className="text-sm text-slate-600 hover:text-edvoura-navy cursor-pointer flex items-center gap-2 font-medium">
                  <span className="bg-slate-100 p-1.5 rounded"><BookOpen className="w-4 h-4 text-slate-500" /></span> Download Term Reports (PDF)
                </li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
