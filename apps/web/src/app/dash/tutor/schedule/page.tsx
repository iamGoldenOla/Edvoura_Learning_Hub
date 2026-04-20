import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Users, Video, ChevronLeft, ChevronRight, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

export default async function TutorSchedulePage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const scheduleDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayParam = typeof searchParams.day === 'string' ? searchParams.day : null;
  const activeDay = dayParam && scheduleDays.includes(dayParam) ? dayParam : 'Wed';
  const action = typeof searchParams.action === 'string' ? searchParams.action : null;

  const todaySessions = [
    { id: 1, time: '10:00 AM', duration: '1h', title: 'Grade 7 Pre-Algebra', type: 'Group (12)', status: 'completed' },
    { id: 2, time: '02:00 PM', duration: '45m', title: 'JSS3 Basic Science', type: 'Group (8)', status: 'next' },
    { id: 3, time: '04:30 PM', duration: '1h', title: 'WAEC Physics Prep', type: 'Private (1)', status: 'upcoming' },
    { id: 4, time: '06:00 PM', duration: '1.5h', title: 'Coding Bootcamp - Python', type: 'Group (24)', status: 'upcoming' }
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-edvoura-navy flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-edvoura-gold" /> Master Schedule
          </h1>
          <p className="mt-2 text-slate-600 text-sm">View, accept, and manage all your upcoming virtual sessions.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/dash/tutor/schedule?action=sync-calendar">
            <Button variant="outline" className="border-slate-300 text-slate-700 bg-white shadow-sm flex-1 md:flex-none flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Sync to Google Calendar
            </Button>
          </Link>
          <Link href="/dash/tutor/schedule?action=open-slot">
            <Button variant="primary" className="bg-edvoura-navy hover:bg-slate-800 text-white flex-1 md:flex-none flex items-center gap-2">
              <Plus className="w-4 h-4" /> Open Time Slot
            </Button>
          </Link>
        </div>
      </div>

      {action ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Action Center: <strong>{action}</strong> request loaded.
        </section>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Schedule Pane (Left) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Day Selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex justify-between items-center overflow-x-auto gap-4">
            <Link href="/dash/tutor/schedule?day=prev">
              <Button variant="ghost" className="w-10 h-10 p-0 shrink-0 rounded-full text-slate-400 hover:text-edvoura-navy"><ChevronLeft className="w-5 h-5"/></Button>
            </Link>
            <div className="flex gap-2 min-w-max flex-1 justify-center">
              {scheduleDays.map((day, i) => (
                <Link
                  key={day}
                  href={`/dash/tutor/schedule?day=${day}`}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
                    day === activeDay 
                      ? 'bg-edvoura-navy text-white shadow-md scale-105' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-80">{day}</span>
                  <span className="text-lg font-black">{12 + i}</span>
                </Link>
              ))}
            </div>
            <Link href="/dash/tutor/schedule?day=next">
              <Button variant="ghost" className="w-10 h-10 p-0 shrink-0 rounded-full text-slate-400 hover:text-edvoura-navy"><ChevronRight className="w-5 h-5"/></Button>
            </Link>
          </div>

          <h2 className="text-lg font-bold text-slate-800 pt-2">Wednesday, Oct 14th</h2>

          {/* Time Blocks */}
          <div className="space-y-4">
            {todaySessions.map((session) => (
              <div 
                key={session.id} 
                className={`bg-white rounded-2xl border flex flex-col sm:flex-row transition-all shadow-sm
                  ${session.status === 'next' ? 'border-edvoura-gold ring-4 ring-yellow-50 scale-[1.01]' : 'border-slate-200 hover:border-edvoura-navy'}
                  ${session.status === 'completed' ? 'opacity-60 grayscale' : ''}
                `}
              >
                
                {/* Time Strip */}
                <div className={`p-6 sm:w-48 flex sm:flex-col justify-between sm:justify-center items-center sm:items-start border-b sm:border-b-0 sm:border-r border-slate-100 rounded-t-2xl sm:rounded-bl-2xl sm:rounded-tr-none ${session.status === 'next' ? 'bg-amber-50/50' : session.status === 'completed' ? 'bg-slate-50' : ''}`}>
                  <h3 className="text-xl font-bold text-edvoura-navy">{session.time}</h3>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {session.duration}
                  </span>
                </div>

                {/* Content Block */}
                <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       {session.status === 'completed' && <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">Done</span>}
                       {session.status === 'next' && <span className="bg-edvoura-gold text-edvoura-navy-dark text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider animate-pulse flex items-center gap-1"><Video className="w-3 h-3"/> Happening Now</span>}
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">{session.title}</h4>
                    <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" /> {session.type}
                    </p>
                  </div>
                  
                  <div className="w-full md:w-auto flex flex-col gap-2">
                    {session.status === 'next' && (
                      <Link href={`/dash/tutor/schedule?action=join&id=${session.id}`}>
                        <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full md:w-48 shadow-lg shadow-blue-200">
                          Join Google Meet
                        </Button>
                      </Link>
                    )}
                    {session.status === 'upcoming' && (
                      <Link href={`/dash/tutor/lesson-notes?session=${session.id}`}>
                        <Button variant="outline" className="font-bold w-full md:w-48 border-slate-300 text-slate-700 hover:bg-slate-50">
                          Prepare Materials
                        </Button>
                      </Link>
                    )}
                    {session.status === 'completed' && (
                      <Link href={`/dash/tutor/schedule?action=view-summary&id=${session.id}`}>
                        <Button variant="ghost" className="font-bold w-full md:w-48 text-edvoura-navy hover:bg-slate-100">
                          View Session Summary
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Analytics Pillar */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 relative overflow-hidden">
             {/* Decorative */}
             <div className="absolute right-[-20%] bottom-[-20%] opacity-10"><Clock className="w-48 h-48 text-amber-600" /></div>
            
            <CardContent className="p-6 relative z-10">
              <h3 className="text-xs uppercase tracking-widest font-black text-amber-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Action Required
              </h3>
              <p className="text-amber-900 font-medium text-sm leading-relaxed mb-6">You have 2 private session requests waiting for your approval. If unaccepted within 4 hours, they will automatically bounce to another available tutor.</p>
              <Link href="/dash/tutor/schedule?action=review-requests">
                <Button variant="outline" className="w-full border-amber-300 bg-white text-amber-900 font-bold hover:bg-amber-50">Review Requests (2)</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm uppercase tracking-wider font-bold text-slate-500">Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><Video className="w-4 h-4" /></div>
                    <span className="text-sm font-bold text-slate-700">Total Hours</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">14.5</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                    <span className="text-sm font-bold text-slate-700">Students Taught</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">62</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
                    <span className="text-sm font-bold text-slate-700">Session Rating</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">4.9<span className="text-xs text-slate-400">/5</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
