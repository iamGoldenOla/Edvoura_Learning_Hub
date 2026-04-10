import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, MetricCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StudentProps {
  enrollments: any[];
  assignments: any[];
  upcomingLessons: any[];
}

export default function StudentHome7to12({ enrollments, assignments, upcomingLessons }: StudentProps) {
  const pendingAssignments = assignments.filter((a: any) => a.status === 'pending');

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* Sleek Professional Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-edvoura-navy tracking-tight">Academic Overview</h1>
          <p className="mt-2 text-slate-600 text-sm">Review your WAEC/JAMB prep telemetry, upcoming schedules, and assignments.</p>
        </div>
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Attendance Rate</p>
            <p className="text-2xl font-light text-slate-800">94.2<span className="text-sm font-bold text-slate-500">%</span></p>
          </div>
          <div className="pl-8 border-l border-slate-200">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">GPA Equivalent</p>
            <p className="text-2xl font-light text-edvoura-navy-dark">3.8<span className="text-sm font-bold text-slate-500">/4.0</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column (Main Focus) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Exam Prep Center Hero */}
          <div className="bg-edvoura-navy text-white rounded-2xl p-8 relative overflow-hidden shadow-lg border border-slate-800">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-edvoura-navy-dark to-transparent z-0"></div>
            
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <span className="bg-edvoura-gold text-edvoura-navy-dark text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-widest mb-4 inline-block">
                  Dedicated Exam Track
                </span>
                <h2 className="text-3xl font-light mb-2">JAMB / UTME Prep Centre</h2>
                <p className="text-slate-300 text-sm max-w-md mb-6">Access mock exams, thousands of past questions, and specific timed modules designed perfectly for Nigerian tertiary entrance.</p>
                <div className="flex gap-4">
                  <Button variant="primary" className="bg-edvoura-gold text-edvoura-navy hover:bg-yellow-400 font-semibold rounded-lg px-6">
                    Start Mock Exam
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 font-semibold rounded-lg">
                    Past Questions Bank
                  </Button>
                </div>
              </div>
              <div className="hidden md:block pr-8">
                <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-edvoura-gold">68%</span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider mt-1">Readiness</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Live Session Hub */}
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Live Lecture Hub</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Google Meet Integrations</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {[1,2,3].map((i) => (
                    <li key={i} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Oct</span>
                          <span className="text-sm font-bold text-edvoura-navy">1{i}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{i===1?'Advanced Physics: Mechanics':'Organic Chemistry Intro'}</p>
                          <p className="text-xs text-slate-500">10:00 AM • Prof. Okafor</p>
                        </div>
                      </div>
                      <Button variant="outline" className="text-xs h-8 border-slate-200 text-slate-600 group-hover:bg-edvoura-navy group-hover:text-white group-hover:border-edvoura-navy transition-all">Join</Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Performance Analytics Snapshot */}
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Performance Analytics</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Submissions Score Average</p>
                </div>
                <Button variant="ghost" className="text-xs text-edvoura-navy">View All</Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {[
                    { sub: 'Physics', score: 88, color: 'bg-green-500' },
                    { sub: 'Mathematics', score: 92, color: 'bg-emerald-600' },
                    { sub: 'Chemistry', score: 64, color: 'bg-amber-500' }
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-semibold text-slate-700">{stat.sub}</span>
                        <span className="text-sm font-bold text-slate-900">{stat.score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`${stat.color} h-full rounded-full`} style={{ width: `${stat.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
                  <strong className="block mb-1">Insight</strong>
                  Your Chemistry scores are lagging relative to the cohort. Consider scheduling a 1-on-1 tutor review.
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          
          {/* Assignment Manager */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
              Deadline Tracker
              <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-full font-bold">2 PENDING</span>
            </h3>
            <div className="space-y-4">
              {[1,2].map(i => (
                <div key={i} className="border-l-2 border-amber-400 pl-4 py-1">
                  <h4 className="text-slate-800 font-semibold text-sm">Physics Lab Report</h4>
                  <p className="text-xs text-slate-500 mt-1">Due Tomorrow 11:59PM</p>
                </div>
              ))}
              <div className="border-l-2 border-green-400 pl-4 py-1 opacity-60">
                <h4 className="text-slate-800 font-semibold text-sm line-through">Maths Worksheet 4</h4>
                <p className="text-xs text-green-600 mt-1 font-medium">Submitted & Graded</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6 text-xs h-8 border-slate-200">Manage Assignments</Button>
          </div>

          {/* Quick Tools */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Productivity Suite</h3>
            <div className="space-y-2">
              <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center gap-3 shadow-sm">
                <span>📅</span> Study Planner
              </button>
              <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center gap-3 shadow-sm">
                <span>📚</span> Resource Library
              </button>
              <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center gap-3 shadow-sm">
                <span>💬</span> Tutor Direct Chat
              </button>
              <button className="w-full bg-white border border-slate-200 p-3 rounded-lg text-left text-sm font-medium text-slate-700 hover:border-edvoura-navy hover:text-edvoura-navy transition-colors flex items-center gap-3 shadow-sm">
                <span>🎓</span> Certificate Wall
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
