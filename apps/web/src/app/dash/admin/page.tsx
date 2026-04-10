import { Card, CardHeader, CardTitle, CardContent, MetricCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 rounded-2xl p-8 text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="text-edvoura-gold">⌘</span> Platform Operations
          </h1>
          <p className="mt-2 text-slate-400 font-medium tracking-wide text-sm">Super Admin Command Center</p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-4">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Audit Logs</Button>
          <Button variant="primary" className="bg-edvoura-gold text-edvoura-navy-dark hover:bg-yellow-400 font-bold">Generate Report</Button>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Active Students</p>
          <p className="text-2xl font-bold text-slate-800">1,248</p>
          <p className="text-xs text-green-600 font-medium mt-2">↑ 12% this month</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-purple-500">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Weekly Sessions</p>
          <p className="text-2xl font-bold text-slate-800">342</p>
          <p className="text-xs text-slate-400 font-medium mt-2">Running seamlessly</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs text-amber-600 uppercase font-bold tracking-wider mb-1">Pending Tutors</p>
          <p className="text-2xl font-bold text-slate-800">5</p>
          <p className="text-xs text-amber-600 font-medium mt-2 cursor-pointer hover:underline">Awaiting approval</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-green-500">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">MRR (Paystack)</p>
          <p className="text-2xl font-bold text-slate-800">₦2.4M</p>
          <p className="text-xs text-slate-400 font-medium mt-2">Net revenue active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Moderation & Users */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 rounded-t-2xl border-b border-slate-100 flex flex-row justify-between items-center pb-4">
              <CardTitle className="text-lg">Tutor Moderation Queue</CardTitle>
              <Button variant="outline" className="h-8 text-xs bg-white">View All Applications</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {[1,2].map(i => (
                  <div key={i} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Chukwudi N.</h4>
                        <p className="text-xs text-slate-500 mt-1">Specialty: Senior Secondary Physics • 5 Yrs Exp.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="text-xs h-8 text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                      <Button variant="outline" className="text-xs h-8 text-green-700 border-green-200 hover:bg-green-50">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 rounded-t-2xl border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Recent Paystack Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Parent / Customer</th>
                    <th className="px-6 py-4">Plan Name</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">Mrs. Folashade A.</td>
                    <td className="px-6 py-4">Family Premium (3 Children)</td>
                    <td className="px-6 py-4 font-bold text-slate-800">₦25,000</td>
                    <td className="px-6 py-4 text-right"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Success</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">Mr. Tunde O.</td>
                    <td className="px-6 py-4">Basic Explorer (1 Child)</td>
                    <td className="px-6 py-4 font-bold text-slate-800">₦10,000</td>
                    <td className="px-6 py-4 text-right"><span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Failed</span></td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Platform Controls */}
        <div className="space-y-6">
          
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">System Administration</h3>
              <div className="space-y-2">
                <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-3"><span>🗃️</span> Manage Content Library</span>
                </button>
                <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-3"><span>💳</span> Subscription Plans Config</span>
                </button>
                <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-3"><span>📢</span> Broadcast Notification</span>
                </button>
                <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-3"><span>🛠️</span> Support Tickets (3 New)</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-slate-200 bg-slate-50">
            <CardContent className="p-6 text-center text-sm text-slate-500">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">🛡️</div>
              <p className="font-bold text-slate-700 mb-1">Edvoura Sentinel Active</p>
              <p className="text-xs">All automated background workers (Progress, Reminders, Alerts) are operating nominally.</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
