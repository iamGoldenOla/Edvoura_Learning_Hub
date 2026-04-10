import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, BookOpen, Clock, Activity, BarChart, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ExamPrepPage() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* Hero Header */}
      <div className="bg-edvoura-navy rounded-2xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute -right-20 -bottom-20 opacity-10">
          <Target className="w-96 h-96" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="max-w-2xl">
            <span className="bg-edvoura-gold text-edvoura-navy-dark px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm mb-4 inline-block">Pro Level Access</span>
            <h1 className="text-4xl font-light tracking-tight mb-4 text-white">JAMB & WAEC Preparation Centre</h1>
            <p className="text-slate-400 text-sm leading-relaxed">Engage with thousands of past questions natively integrated into Edvoura, take timed mock exams under real conditions, and analyze your weak spots using our prediction telemetry.</p>
          </div>
          <div className="mt-8 md:mt-0 flex flex-col gap-3">
            <Button variant="primary" className="bg-edvoura-gold hover:bg-yellow-400 text-edvoura-navy-dark font-bold px-8 py-6 rounded-xl flex items-center gap-3">
              Start Timed Mock Exam <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-medium">Continue Practice Mode</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Interface: Exam Types & Past Questions */}
        <div className="lg:col-span-2 space-y-8">
          
          <h2 className="text-xl font-bold text-slate-800">Available Modules</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-slate-200 hover:border-edvoura-navy hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Simulated CBT Mocks</h3>
                <p className="text-slate-500 text-sm mb-6">Experience the exact JAMB CBT interface. Timed, scored, and recorded for analytics.</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">JAMB</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">POST-UTME</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 hover:border-edvoura-navy hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Past Question Bank</h3>
                <p className="text-slate-500 text-sm mb-6">Browse 15+ years of past questions spanning WAEC, NECO, and JAMB. Topic by topic.</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">14 Subjects</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">Searchable</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold text-slate-800 pt-4">Recent Attempts</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {[
                { type: 'JAMB Mock', score: '284/400', date: 'Oct 12', time: '1h 45m', subjects: 'Eng, Phy, Chem, Math', color: 'text-green-600', bg: 'bg-green-50' },
                { type: 'WAEC Physics Objective', score: '42/50', date: 'Oct 08', time: '40m', subjects: 'Physics', color: 'text-blue-600', bg: 'bg-blue-50' }
              ].map((attempt, i) => (
                <div key={i} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${attempt.bg} ${attempt.color} flex items-center justify-center`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{attempt.type}</h4>
                      <p className="text-xs text-slate-500 mt-1">{attempt.subjects} • Took {attempt.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-800">{attempt.score}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{attempt.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <Button variant="ghost" className="text-xs text-edvoura-navy font-bold w-full h-8">View All History</Button>
            </div>
          </div>

        </div>

        {/* Analytics Pillar */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border-slate-200 bg-edvoura-navy text-white">
            <CardHeader className="pb-2 border-b border-slate-800 mb-4">
              <CardTitle className="text-sm uppercase tracking-wider font-bold text-slate-400">Readiness Predictor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-6 text-edvoura-gold">
                <span className="text-5xl font-light">76</span>
                <span className="text-xl font-bold pb-1">%</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">Based on your mock performance trajectory, you are currently projected to comfortably pass your target exams.</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-300">Physics</span><span className="text-white">88%</span></div>
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden"><div className="h-full bg-green-400 w-[88%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-300">Chemistry</span><span className="text-white">62%</span></div>
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden"><div className="h-full bg-amber-400 w-[62%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-300">English</span><span className="text-white">74%</span></div>
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden"><div className="h-full bg-blue-400 w-[74%]"></div></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm uppercase tracking-wider font-bold text-slate-500">Tutor Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 mb-4">
                <Activity className="w-6 h-6 text-purple-600 mt-1 shrink-0" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  "Your organic chemistry modules are causing a slight drag in your overall score. I recommend reviewing recorded Chemistry sessions from Week 3 before taking the next Mock."
                </p>
              </div>
              <Button variant="outline" className="w-full text-xs h-9 border-slate-200">Go to Course Notes</Button>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
