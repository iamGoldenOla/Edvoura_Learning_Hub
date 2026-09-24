'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';

const EYFS_AREAS = [
  'Communication & Language',
  'Physical Development',
  'Personal, Social & Emotional',
  'Literacy / Phonics',
  'Mathematics',
  'Understanding the World',
  'Expressive Arts & Design'
];

const MOCK_STUDENTS = [
  { id: '1', name: 'Alice Smith' },
  { id: '2', name: 'Bobby Jones' },
  { id: '3', name: 'Charlie Brown' },
];

export default function NurseryTeacherDashboard() {
  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0]);
  const [notes, setNotes] = useState('');

  const handleMilestoneToggle = (area: string, milestone: string, checked: boolean) => {
    // In a real app, call /api/nursery/milestones
    toast.success(`Milestone updated for ${selectedStudent.name}`);
  };

  const handleGiveSticker = () => {
    toast.success(`⭐ Sticker awarded to ${selectedStudent.name}!`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-black uppercase">Early Years Foundation Stage (EYFS) Tracker</h1>

      <div className="grid md:grid-cols-4 gap-8">
        
        {/* Class List & Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-purple-100">
            <CardHeader>
              <CardTitle className="text-2xl font-black uppercase">Class List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_STUDENTS.map(student => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-4 border-[3px] border-black rounded-xl font-bold transition-all ${selectedStudent.id === student.id ? 'bg-yellow-300 shadow-none translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'}`}
                >
                  {student.name}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-blue-100">
            <CardHeader>
              <CardTitle className="text-2xl font-black uppercase">Class Overview</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-2">
                 <div className="flex justify-between font-bold"><span>Comm & Lang</span> <span>75%</span></div>
                 <div className="w-full bg-white border-2 border-black h-4 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-3/4 border-r-2 border-black"></div>
                 </div>
                 {/* Add more areas as needed */}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Tracker */}
        <div className="md:col-span-3 space-y-6">
          
          <div className="flex justify-between items-center bg-white border-[4px] border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             <h2 className="text-3xl font-black">{selectedStudent.name}'s Profile</h2>
             <Button 
               onClick={handleGiveSticker}
               className="text-xl font-bold bg-yellow-400 hover:bg-yellow-500 text-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
             >
               ⭐ Award Sticker
             </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {EYFS_AREAS.map(area => (
              <Card key={area} className="border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="bg-green-100 border-b-[4px] border-black">
                  <CardTitle className="text-xl font-bold">{area}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                   <div className="flex items-center space-x-3">
                     <Checkbox id={`${area}-m1`} onCheckedChange={(c: any) => handleMilestoneToggle(area, 'Milestone 1', Boolean(c))} className="border-2 border-black data-[state=checked]:bg-green-500 data-[state=checked]:text-white w-6 h-6" />
                     <label htmlFor={`${area}-m1`} className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                       Example Milestone 1
                     </label>
                   </div>
                   <div className="flex items-center space-x-3">
                     <Checkbox id={`${area}-m2`} onCheckedChange={(c: any) => handleMilestoneToggle(area, 'Milestone 2', Boolean(c))} className="border-2 border-black data-[state=checked]:bg-green-500 data-[state=checked]:text-white w-6 h-6" />
                     <label htmlFor={`${area}-m2`} className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                       Example Milestone 2
                     </label>
                   </div>
                   
                   <Input 
                     placeholder="Quick observation note..." 
                     className="mt-4 border-2 border-black shadow-inner"
                     value={notes}
                     onChange={(e: any) => setNotes(e.target.value)}
                   />
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
