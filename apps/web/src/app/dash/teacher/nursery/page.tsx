'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  UserX,
  Users,
  Award,
  BookOpen,
  Heart,
  Baby,
  Smile,
  Save,
  CheckSquare,
  ListTodo,
} from 'lucide-react';

const EYFS_AREAS = [
  { name: 'Communication & Language', emoji: '🗣️', color: 'bg-blue-100', progress: 85 },
  { name: 'Physical Development', emoji: '🏃', color: 'bg-emerald-100', progress: 90 },
  { name: 'Personal, Social & Emotional', emoji: '🤝', color: 'bg-pink-100', progress: 78 },
  { name: 'Literacy / Phonics', emoji: '🔤', color: 'bg-yellow-100', progress: 82 },
  { name: 'Mathematics', emoji: '🔢', color: 'bg-purple-100', progress: 75 },
  { name: 'Understanding the World', emoji: '🌍', color: 'bg-amber-100', progress: 88 },
  { name: 'Expressive Arts & Design', emoji: '🎨', color: 'bg-rose-100', progress: 94 },
];

interface NurseryPupil {
  id: string;
  name: string;
  age: string;
  avatar: string;
  attendanceStatus: 'present' | 'absent' | 'late' | 'excused';
}

const INITIAL_PUPILS: NurseryPupil[] = [
  { id: 'p-1', name: 'Alice Smith', age: '3 yrs', avatar: '👧🏼', attendanceStatus: 'present' },
  { id: 'p-2', name: 'Bobby Jones', age: '4 yrs', avatar: '👦🏻', attendanceStatus: 'present' },
  { id: 'p-3', name: 'Charlie Brown', age: '3.5 yrs', avatar: '👦🏽', attendanceStatus: 'late' },
  { id: 'p-4', name: 'Daisy Williams', age: '4 yrs', avatar: '👧🏾', attendanceStatus: 'present' },
  { id: 'p-5', name: 'Ethan Adebayo', age: '3 yrs', avatar: '👦🏿', attendanceStatus: 'present' },
  { id: 'p-6', name: 'Fatima Al-Mansoor', age: '4 yrs', avatar: '👧🏽', attendanceStatus: 'absent' },
];

export default function NurseryTeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'eyfs' | 'attendance'>('attendance');
  const [pupils, setPupils] = useState<NurseryPupil[]>(INITIAL_PUPILS);
  const [selectedStudent, setSelectedStudent] = useState(INITIAL_PUPILS[0]);
  const [notes, setNotes] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Attendance handlers
  const handlePupilStatusChange = (pupilId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setPupils((prev) =>
      prev.map((p) => (p.id === pupilId ? { ...p, attendanceStatus: status } : p))
    );
  };

  const handleMarkAllPresent = () => {
    setPupils((prev) => prev.map((p) => ({ ...p, attendanceStatus: 'present' })));
    toast.success('All nursery pupils marked Present!');
  };

  const handleSaveAttendance = async () => {
    setIsSavingAttendance(true);
    setTimeout(() => {
      setIsSavingAttendance(false);
      toast.success(`Saved Daily Attendance for Nursery Class on ${attendanceDate}!`);
    }, 400);
  };

  // Milestone handlers
  const handleMilestoneToggle = (area: string, milestone: string, checked: boolean) => {
    toast.success(`Milestone updated for ${selectedStudent.name} (${area})`);
  };

  const handleGiveSticker = () => {
    toast.success(`⭐ Digital Star Sticker awarded to ${selectedStudent.name}!`);
  };

  const presentCount = pupils.filter((p) => p.attendanceStatus === 'present').length;
  const lateCount = pupils.filter((p) => p.attendanceStatus === 'late').length;
  const absentCount = pupils.filter((p) => p.attendanceStatus === 'absent').length;
  const attendanceRate = Math.round(((presentCount + lateCount) / pupils.length) * 100);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-[4px] border-black bg-white p-6 rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-300 border-[2px] border-black rounded-lg text-xs font-black uppercase text-black shadow-[2px_2px_0px_#060E1C] mb-2">
            🧸 Early Educator Hub · Nursery &amp; Preschool
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
            Early Years Foundation Stage (EYFS) &amp; Attendance
          </h1>
          <p className="text-sm font-bold text-gray-700">
            Observation logging for the 7 Prime &amp; Specific Areas and daily pupil attendance tracking.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all ${
              activeTab === 'attendance'
                ? 'bg-emerald-300 text-black border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Daily Attendance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('eyfs')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all ${
              activeTab === 'eyfs'
                ? 'bg-yellow-300 text-black border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <ListTodo className="w-4 h-4" /> EYFS Milestones (7 Areas)
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DAILY ATTENDANCE REGISTER */}
      {/* ============================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 border-[4px] border-black bg-pink-100 p-5 rounded-[20px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-7 h-7 text-black" />
                <div>
                  <p className="text-xs font-black uppercase text-gray-700">Attendance Session Date</p>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="font-black text-base bg-white border-[3px] border-black rounded-xl px-3 py-1 mt-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleMarkAllPresent}
                  className="bg-yellow-300 hover:bg-yellow-400 text-black border-[3px] border-black font-black text-xs px-3.5 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" /> Mark All Present
                </Button>
                <Button
                  onClick={handleSaveAttendance}
                  isLoading={isSavingAttendance}
                  className="bg-emerald-400 hover:bg-emerald-500 text-black border-[3px] border-black font-black text-xs px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 transition-all"
                >
                  <Save className="w-4 h-4 mr-1.5" /> Save Register
                </Button>
              </div>
            </div>

            {/* Attendance Rate Card */}
            <div className="border-[4px] border-black bg-emerald-100 p-5 rounded-[20px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-700">Today's Attendance Rate</p>
                <p className="text-4xl font-black text-black mt-1">{attendanceRate}%</p>
                <p className="text-xs font-bold text-gray-600 mt-0.5">
                  {presentCount + lateCount} of {pupils.length} pupils present
                </p>
              </div>
              <span className="p-3 bg-white border-[3px] border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <UserCheck className="w-8 h-8 text-emerald-600" />
              </span>
            </div>
          </div>

          {/* KPI Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border-[3px] border-black bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-500">Total Enrolled</p>
                <p className="text-2xl font-black text-black">{pupils.length}</p>
              </div>
              <Users className="w-6 h-6 text-gray-400" />
            </div>

            <div className="border-[3px] border-black bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-500">Present</p>
                <p className="text-2xl font-black text-emerald-600">{presentCount}</p>
              </div>
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="border-[3px] border-black bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-500">Late Arrival</p>
                <p className="text-2xl font-black text-yellow-600">{lateCount}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>

            <div className="border-[3px] border-black bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-500">Absent</p>
                <p className="text-2xl font-black text-red-600">{absentCount}</p>
              </div>
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>

          {/* Pupil Attendance Roster */}
          <Card className="border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden rounded-[24px]">
            <CardHeader className="bg-yellow-200 border-b-[4px] border-black p-5">
              <CardTitle className="text-xl font-black uppercase text-black flex items-center gap-2">
                <span>🧸 Nursery Class Attendance Roll</span>
                <span className="text-xs bg-black text-white px-2.5 py-0.5 rounded-full">
                  {pupils.length} Little Learners
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y-[3px] divide-black">
              {pupils.map((pupil) => (
                <div
                  key={pupil.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-pink-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-pink-100 border-[2px] border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {pupil.avatar}
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-black">{pupil.name}</h3>
                      <p className="text-xs font-bold text-gray-500">Nursery Pupil • Age {pupil.age}</p>
                    </div>
                  </div>

                  {/* Attendance buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handlePupilStatusChange(pupil.id, 'present')}
                      className={`px-3 py-1.5 rounded-lg border-[2px] border-black text-xs font-black uppercase transition-all ${
                        pupil.attendanceStatus === 'present'
                          ? 'bg-emerald-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                          : 'bg-white text-gray-600 hover:bg-emerald-50'
                      }`}
                    >
                      🟢 Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePupilStatusChange(pupil.id, 'late')}
                      className={`px-3 py-1.5 rounded-lg border-[2px] border-black text-xs font-black uppercase transition-all ${
                        pupil.attendanceStatus === 'late'
                          ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                          : 'bg-white text-gray-600 hover:bg-yellow-50'
                      }`}
                    >
                      🟡 Late
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePupilStatusChange(pupil.id, 'absent')}
                      className={`px-3 py-1.5 rounded-lg border-[2px] border-black text-xs font-black uppercase transition-all ${
                        pupil.attendanceStatus === 'absent'
                          ? 'bg-red-400 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                          : 'bg-white text-gray-600 hover:bg-red-50'
                      }`}
                    >
                      🔴 Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePupilStatusChange(pupil.id, 'excused')}
                      className={`px-3 py-1.5 rounded-lg border-[2px] border-black text-xs font-black uppercase transition-all ${
                        pupil.attendanceStatus === 'excused'
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
      )}

      {/* ============================================================== */}
      {/* TAB 2: EYFS 7 PRIME & SPECIFIC AREAS TRACKER */}
      {/* ============================================================== */}
      {activeTab === 'eyfs' && (
        <div className="grid md:grid-cols-4 gap-8">
          {/* Pupil Selection Sidepanel */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-purple-100 rounded-[20px]">
              <CardHeader className="p-4 border-b-[3px] border-black">
                <CardTitle className="text-xl font-black uppercase text-black">Select Pupil</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {pupils.map((pupil) => (
                  <button
                    key={pupil.id}
                    onClick={() => setSelectedStudent(pupil)}
                    className={`w-full text-left p-3 border-[2px] border-black rounded-xl font-bold transition-all flex items-center gap-2.5 ${
                      selectedStudent.id === pupil.id
                        ? 'bg-yellow-300 shadow-none translate-y-0.5'
                        : 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="text-xl">{pupil.avatar}</span>
                    <span className="text-sm font-black text-black">{pupil.name}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Overall Class Progress */}
            <Card className="border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-blue-100 rounded-[20px]">
              <CardHeader className="p-4 border-b-[3px] border-black">
                <CardTitle className="text-lg font-black uppercase text-black">Class EYFS Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {EYFS_AREAS.slice(0, 4).map((area) => (
                  <div key={area.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-black text-black">
                      <span>
                        {area.emoji} {area.name}
                      </span>
                      <span>{area.progress}%</span>
                    </div>
                    <div className="w-full bg-white border-[2px] border-black h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full border-r-[2px] border-black transition-all"
                        style={{ width: `${area.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Student Detailed Tracker for the 7 Prime Areas */}
          <div className="md:col-span-3 space-y-6">
            <div className="border-[4px] border-black bg-yellow-100 p-6 rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-5xl p-3 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {selectedStudent.avatar}
                </span>
                <div>
                  <h2 className="text-3xl font-black text-black">{selectedStudent.name}</h2>
                  <p className="text-sm font-bold text-gray-700">
                    Age {selectedStudent.age} • Early Learning Profile
                  </p>
                </div>
              </div>

              <Button
                onClick={handleGiveSticker}
                className="bg-yellow-300 hover:bg-yellow-400 text-black border-[3px] border-black font-black text-base px-6 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                ⭐ Award Digital Sticker
              </Button>
            </div>

            {/* Grid of the 7 EYFS Areas */}
            <div className="grid md:grid-cols-2 gap-5">
              {EYFS_AREAS.map((area) => (
                <Card
                  key={area.name}
                  className="border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[20px] overflow-hidden bg-white"
                >
                  <CardHeader className={`${area.color} border-b-[3px] border-black p-4 flex flex-row items-center justify-between`}>
                    <CardTitle className="text-base font-black text-black flex items-center gap-2">
                      <span className="text-xl">{area.emoji}</span>
                      <span>{area.name}</span>
                    </CardTitle>
                    <span className="text-xs font-black bg-white border-[2px] border-black px-2 py-0.5 rounded-full">
                      {area.progress}% Achieved
                    </span>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`${area.name}-m1`}
                        onCheckedChange={(c: any) =>
                          handleMilestoneToggle(area.name, 'Core Milestone A', Boolean(c))
                        }
                        className="w-5 h-5 border-[2px] border-black"
                      />
                      <label htmlFor={`${area.name}-m1`} className="text-sm font-bold text-black cursor-pointer">
                        Foundational development indicator A
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`${area.name}-m2`}
                        onCheckedChange={(c: any) =>
                          handleMilestoneToggle(area.name, 'Core Milestone B', Boolean(c))
                        }
                        className="w-5 h-5 border-[2px] border-black"
                      />
                      <label htmlFor={`${area.name}-m2`} className="text-sm font-bold text-black cursor-pointer">
                        Independent exploration indicator B
                      </label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Observation Logger */}
            <Card className="border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[20px] p-5 bg-white">
              <h3 className="text-lg font-black text-black uppercase mb-2">
                📝 Log Teacher Observation for {selectedStudent.name}
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="e.g. Shared building blocks and identified letter sound 'M' during sensory play..."
                  value={notes}
                  onChange={(e: any) => setNotes(e.target.value)}
                  className="border-[3px] border-black rounded-xl font-medium"
                />
                <Button
                  onClick={() => {
                    if (!notes) return toast.error('Please enter an observation note');
                    toast.success(`Observation logged for ${selectedStudent.name}!`);
                    setNotes('');
                  }}
                  className="bg-purple-300 hover:bg-purple-400 text-black border-[3px] border-black font-black text-sm px-6 py-2.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 transition-all"
                >
                  Save Note
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
