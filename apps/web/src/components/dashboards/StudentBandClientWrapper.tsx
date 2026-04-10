'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBand } from './BandContext';
import StudentHome1to3 from './grades-1-3/StudentHome1to3';
import StudentHome4to6 from './grades-4-6/StudentHome4to6';
import StudentHome7to12 from './grades-7-12/StudentHome7to12';

interface WrapperProps {
  enrollments: any[];
  assignments: any[];
  upcomingLessons: any[];
  initialBand?: string;
}

export default function StudentBandClientWrapper(props: WrapperProps) {
  const { band, setBand } = useBand();

  const handleBandChange = (newBand: string) => {
    setBand(newBand);
  };

  return (
    <div className="p-8">
      
      {/* Developer / Testing Toggle */}
      <div className="mb-8 p-4 bg-slate-100 rounded-lg flex items-center gap-4 justify-between border border-slate-200">
        <div className="text-sm font-medium text-slate-500">
          Developer Toggle: Simulate Learner Band
        </div>
        <div className="flex bg-white rounded-md p-1 shadow-sm border border-slate-200">
          <button 
            onClick={() => handleBandChange('1-3')} 
            className={`px-3 py-1 text-xs font-bold rounded ${band === '1-3' ? 'bg-edvoura-navy text-white' : 'text-slate-500'}`}
          >
            Grades 1-3
          </button>
          <button 
            onClick={() => handleBandChange('4-6')} 
            className={`px-3 py-1 text-xs font-bold rounded ${band === '4-6' ? 'bg-edvoura-navy text-white' : 'text-slate-500'}`}
          >
            Grades 4-6
          </button>
          <button 
            onClick={() => handleBandChange('7-12')} 
            className={`px-3 py-1 text-xs font-bold rounded ${band === '7-12' ? 'bg-edvoura-navy text-white' : 'text-slate-500'}`}
          >
            Grades 7-12
          </button>
        </div>
      </div>

      {band === '1-3' && <StudentHome1to3 {...props} />}
      {band === '4-6' && <StudentHome4to6 {...props} />}
      {band === '7-12' && <StudentHome7to12 {...props} />}

    </div>
  );
}
