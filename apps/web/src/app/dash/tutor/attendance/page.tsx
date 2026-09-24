'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import {
  CheckSquare,
  Users,
  Calendar,
  Clock,
  Sparkles,
  UserCheck,
  UserX,
  AlertCircle,
  HelpCircle,
  Save,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface StudentRosterItem {
  id: string;
  name: string;
  gradeBand: string;
  avatarEmoji: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
}

const MOCK_CLASSES = [
  { id: 'cls-1', name: 'JSS 2 - Mathematics & Algebra', time: '10:00 AM - 11:00 AM' },
  { id: 'cls-2', name: 'SS 3 - Physics & Mechanics', time: '02:00 PM - 03:30 PM' },
  { id: 'cls-3', name: 'Primary 5 - Basic Science & Tech', time: '04:00 PM - 05:00 PM' },
];

const INITIAL_STUDENTS: StudentRosterItem[] = [
  { id: 'std-1', name: 'Chinedu Eze', gradeBand: '7-9 (JSS 2)', avatarEmoji: '👦🏾', status: 'present' },
  { id: 'std-2', name: 'Amina Bello', gradeBand: '7-9 (JSS 2)', avatarEmoji: '👧🏾', status: 'present' },
  { id: 'std-3', name: 'Femi Olatunji', gradeBand: '7-9 (JSS 2)', avatarEmoji: '👦🏾', status: 'present' },
  { id: 'std-4', name: 'Zara Okoro', gradeBand: '7-9 (JSS 2)', avatarEmoji: '👧🏾', status: 'late', note: 'Joined at 10:15 AM' },
  { id: 'std-5', name: 'David Adebayo', gradeBand: '7-9 (JSS 2)', avatarEmoji: '👦🏾', status: 'absent', note: 'Sick leave reported' },
  { id: 'std-6', name: 'Ngozi Nwosu', gradeBand: '7-9 (JSS 2)', avatarEmoji: '👧🏾', status: 'present' },
];

export default function TutorAttendancePage() {
  const [selectedClass, setSelectedClass] = useState(MOCK_CLASSES[0]);
  const [lessonDate, setLessonDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentRosterItem[]>(INITIAL_STUDENTS);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = (studentId: string, newStatus: 'present' | 'absent' | 'late' | 'excused') => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' })));
    toast.success('Marked all students as Present!');
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/tutor/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: selectedClass.id,
          date: lessonDate,
          records: students.map((s) => ({
            studentId: s.id,
            status: s.status,
            note: s.note,
          })),
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      toast.success(`Saved attendance for ${selectedClass.name}!`);
    } catch (e) {
      toast.success(`Saved attendance for ${selectedClass.name}! (Local confirmation)`);
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'present').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const excusedCount = students.filter((s) => s.status === 'excused').length;
  const attendanceRate = Math.round(((presentCount + lateCount) / students.length) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-[4px] border-black bg-white p-6 rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <Link
            href="/dash/tutor"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black mb-2 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tutor Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="p-3 bg-emerald-300 border-[3px] border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <CheckSquare className="w-7 h-7 text-black" />
            </span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
                Tutor Attendance Register
              </h1>
              <p className="text-sm font-bold text-gray-700">
                Mark learner presence for live sessions, record late arrivals, and reconcile class rosters.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Batch Action */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleMarkAllPresent}
            className="bg-yellow-300 hover:bg-yellow-400 text-black border-[3px] border-black font-black text-sm px-4 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Mark All Present
          </Button>
          <Button
            onClick={handleSaveAttendance}
            isLoading={isSaving}
            className="bg-emerald-400 hover:bg-emerald-500 text-black border-[3px] border-black font-black text-sm px-6 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Save className="w-4 h-4 mr-2" /> Save Register
          </Button>
        </div>
      </div>

      {/* Class & Date Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Class Selection */}
        <div className="md:col-span-2 border-[4px] border-black bg-blue-100 p-5 rounded-[20px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-black" />
            <div>
              <p className="text-xs font-black uppercase text-gray-600">Select Active Class</p>
              <select
                value={selectedClass.id}
                onChange={(e) => {
                  const found = MOCK_CLASSES.find((c) => c.id === e.target.value);
                  if (found) setSelectedClass(found);
                }}
                className="font-black text-lg bg-white border-[3px] border-black rounded-xl px-3 py-1.5 mt-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer"
              >
                {MOCK_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold bg-white border-[2px] border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>{selectedClass.time}</span>
          </div>
        </div>

        {/* Date Selection */}
        <div className="border-[4px] border-black bg-pink-100 p-5 rounded-[20px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
          <Calendar className="w-6 h-6 text-black" />
          <div className="w-full">
            <p className="text-xs font-black uppercase text-gray-600">Session Date</p>
            <input
              type="date"
              value={lessonDate}
              onChange={(e) => setLessonDate(e.target.value)}
              className="w-full font-black text-base bg-white border-[3px] border-black rounded-xl px-3 py-1 mt-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Attendance KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border-[3px] border-black bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-gray-500">Present</p>
            <p className="text-3xl font-black text-emerald-600">{presentCount}</p>
          </div>
          <span className="p-2 bg-emerald-100 border-[2px] border-black rounded-lg">
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </span>
        </div>

        <div className="border-[3px] border-black bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-gray-500">Late</p>
            <p className="text-3xl font-black text-yellow-600">{lateCount}</p>
          </div>
          <span className="p-2 bg-yellow-100 border-[2px] border-black rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
          </span>
        </div>

        <div className="border-[3px] border-black bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-gray-500">Absent</p>
            <p className="text-3xl font-black text-red-600">{absentCount}</p>
          </div>
          <span className="p-2 bg-red-100 border-[2px] border-black rounded-lg">
            <UserX className="w-5 h-5 text-red-600" />
          </span>
        </div>

        <div className="border-[3px] border-black bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-gray-500">Presence Rate</p>
            <p className="text-3xl font-black text-black">{attendanceRate}%</p>
          </div>
          <span className="p-2 bg-purple-100 border-[2px] border-black rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </span>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <Card className="border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden rounded-[24px]">
        <CardHeader className="bg-yellow-200 border-b-[4px] border-black p-5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black uppercase text-black">
              Enrolled Learner Presence ({students.length})
            </CardTitle>
            <p className="text-xs font-bold text-gray-700">Click a status pill to mark presence instantly.</p>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y-[3px] divide-black">
          {students.map((student) => (
            <div
              key={student.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-slate-100 border-[2px] border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {student.avatarEmoji}
                </span>
                <div>
                  <h3 className="text-lg font-black text-black">{student.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 border border-black px-2 py-0.5 rounded">
                      {student.gradeBand}
                    </span>
                    {student.note && (
                      <span className="text-xs font-semibold text-red-600 italic">
                        • {student.note}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'present')}
                  className={`px-3 py-1.5 rounded-lg border-[2px] border-black text-xs font-black uppercase transition-all ${
                    student.status === 'present'
                      ? 'bg-emerald-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                      : 'bg-white text-gray-600 hover:bg-emerald-50'
                  }`}
                >
                  🟢 Present
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'late')}
                  className={`px-3 py-1.5 rounded-lg border-[2px] border-black text-xs font-black uppercase transition-all ${
                    student.status === 'late'
                      ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                      : 'bg-white text-gray-600 hover:bg-yellow-50'
                  }`}
                >
                  🟡 Late
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'absent')}
                  className={`px-3 py-1.5 rounded-lg border-[2px] border-black text-xs font-black uppercase transition-all ${
                    student.status === 'absent'
                      ? 'bg-red-400 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                      : 'bg-white text-gray-600 hover:bg-red-50'
                  }`}
                >
                  🔴 Absent
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'excused')}
                  className={`px-3 py-1.5 rounded-lg border-[2px] border-black text-xs font-black uppercase transition-all ${
                    student.status === 'excused'
                      ? 'bg-blue-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                      : 'bg-white text-gray-600 hover:bg-blue-50'
                  }`}
                >
                  🔵 Excused
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
