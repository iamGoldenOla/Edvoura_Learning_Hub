import { useState } from 'react';
import { BookOpen, Star, CheckCircle2, PlayCircle, Clock, X, Upload, Send, ArrowLeft, Eye, Download } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { PDFViewerModal } from '@/components/ui/PDFViewerModal';

type Assignment = {
  id: string;
  title: string;
  classTitle: string;
  subjectName: string;
  dueAt: string | null;
  instructions: string | null;
  submissionStatus: string | null;
  score: string | null;
  feedbackText: string | null;
  resources: Array<{
    id: string;
    fileName: string;
    downloadUrl: string | null;
  }>;
};

export default function ChildHomeworkView({ assignments }: { assignments: Assignment[] }) {
  const [activeMission, setActiveMission] = useState<Assignment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>('');

  const pending = assignments.filter(
    (a) =>
      !a.submissionStatus ||
      a.submissionStatus === 'draft' ||
      a.submissionStatus === 'submitted' ||
      a.submissionStatus === 'late',
  );
  
  const completed = assignments.filter(
    (a) => a.submissionStatus === 'graded' || a.submissionStatus === 'returned'
  );

  const handleSubmit = async () => {
    if (!activeMission) return;
    if (!selectedFile && !note.trim()) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.rpc('submit_student_assignment', {
        target_assignment_id: activeMission.id,
        submission_text: note.trim() || null,
        submission_metadata: selectedFile ? { fileName: selectedFile.name } : {},
      });

      if (error) throw error;
      const submission = Array.isArray(data) ? data[0] : null;

      if (submission?.submission_id && selectedFile) {
        const safeName = `${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
        const objectPath = `submissions/${submission.submission_id}/${safeName}`;
        await supabase.storage.from('student-work').upload(objectPath, selectedFile);
        await supabase.rpc('attach_submission_file', {
          target_submission_id: submission.submission_id,
          object_path: objectPath,
          bucket_id: 'student-work',
        });
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Oops! Something went wrong. Try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 w-full min-w-0">
      <header className="text-center bg-white border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[40px] p-5 sm:p-10 shadow-[6px_6px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] min-w-0">
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-dark break-words">My Learning Missions</h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-xl text-dark/60 font-semibold italic break-words">Finish your missions to grow your magic garden!</p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
           <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-yellow border-[3px] border-dark flex items-center justify-center shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] shrink-0">
             <Star className="h-4 w-4 sm:h-5 sm:w-5" />
           </div>
           <h2 className="text-2xl sm:text-3xl font-black text-dark uppercase tracking-tight">Active Missions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {pending.length > 0 ? (
            pending.map((item) => (
              <div key={item.id} className="bg-white border-[3px] sm:border-[4px] border-dark rounded-[24px] sm:rounded-[32px] shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden flex flex-col hover:translate-y-[-4px] transition-all min-w-0">
                <div className="bg-blue-600 p-6 flex items-center justify-between border-b-[4px] border-dark">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="px-3 py-1 bg-white text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Ready!
                  </span>
                </div>
                <div className="p-5 sm:p-8 flex-1 flex flex-col min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 mb-2">{item.subjectName}</p>
                  <h3 className="text-xl sm:text-2xl font-black text-dark mb-3 sm:mb-4 break-words">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-dark/60 font-semibold mb-4 sm:mb-6 line-clamp-2 break-words">{item.instructions || 'No instructions provided.'}</p>
                  
                  <div className="mt-auto pt-6 flex flex-col gap-3">
                    <button 
                      onClick={() => setActiveMission(item)}
                      className="w-full py-4 border-[3px] border-dark bg-yellow rounded-2xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                       <PlayCircle className="h-5 w-5" /> Start Mission
                    </button>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-dark/40">
                       <Clock className="h-3 w-3" /> Due: {item.dueAt ? new Date(item.dueAt).toLocaleDateString() : 'No deadline'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white border-[4px] border-dark border-dashed rounded-[40px]">
               <div className="text-6xl mb-4">🏆</div>
               <h3 className="text-2xl font-black text-dark">All Missions Complete!</h3>
               <p className="text-dark/60 font-semibold italic">You are a superstar learner!</p>
            </div>
          )}
        </div>
      </section>

      {/* Mission Modal */}
      {activeMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border-[6px] border-dark rounded-[60px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-[20px_20px_0px_#000] animate-in zoom-in-95 duration-300">
             <div className="bg-indigo-600 p-8 border-b-[4px] border-dark flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveMission(null)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all mr-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <div className="hidden sm:flex h-10 w-10 rounded-2xl bg-white/20 items-center justify-center">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Mission Briefing</h2>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{activeMission.subjectName}</p>
                  </div>
                </div>
                <button onClick={() => setActiveMission(null)} className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                  <X className="h-6 w-6" />
                </button>
             </div>

             <div className="p-8 md:p-10 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-dark">{activeMission.title}</h3>
                  <div className="p-6 bg-slate-50 border-[3px] border-dark rounded-3xl">
                    <p className="text-sm font-bold text-dark/70 normal-case italic">{activeMission.instructions || 'No instructions provided.'}</p>
                  </div>

                  {/* Direct Interactive Launchers */}
                  {(activeMission.title.toLowerCase().includes('quiz') || activeMission.title.toLowerCase().includes('subtraction') || activeMission.title.toLowerCase().includes('math') || activeMission.title.toLowerCase().includes('test')) && (
                    <a href="/dash/student/quiz" className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 border-[3px] border-dark rounded-2xl font-black uppercase text-xs tracking-widest text-dark shadow-[4px_4px_0px_#060E1C] flex items-center justify-center gap-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                      🎯 Launch Interactive Quiz Now
                    </a>
                  )}

                  {(activeMission.title.toLowerCase().includes('spelling') || activeMission.title.toLowerCase().includes('spell')) && (
                    <a href="/dash/student/spelling-bee" className="w-full py-4 bg-yellow hover:bg-yellow-light border-[3px] border-dark rounded-2xl font-black uppercase text-xs tracking-widest text-dark shadow-[4px_4px_0px_#060E1C] flex items-center justify-center gap-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                      🐝 Launch Spelling Bee Now
                    </a>
                  )}

                  {(activeMission.title.toLowerCase().includes('story') || activeMission.title.toLowerCase().includes('read')) && (
                    <a href="/dash/student/library" className="w-full py-4 bg-amber-300 hover:bg-amber-200 border-[3px] border-dark rounded-2xl font-black uppercase text-xs tracking-widest text-dark shadow-[4px_4px_0px_#060E1C] flex items-center justify-center gap-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                      📖 Read Story in Library
                    </a>
                  )}
                </div>

                 <div className="space-y-4">
                   <h4 className="text-xs font-black uppercase tracking-widest text-dark/40">Your Mission Report</h4>
                   <textarea 
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     placeholder="Write your answer or a note here..."
                     className="w-full min-h-[120px] p-6 border-[3px] border-dark rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-100 text-dark font-semibold"
                   />
                </div>

                {activeMission.resources && activeMission.resources.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-dark/40">Mission Materials</h4>
                    <div className="grid gap-3">
                      {activeMission.resources.map((res) => {
                        const isPdf = res.fileName.toLowerCase().endsWith('.pdf');
                        return res.downloadUrl ? (
                          <div 
                            key={res.id}
                            className="flex items-center justify-between gap-4 p-4 border-[3px] border-dark bg-yellow/10 rounded-2xl transition-all"
                          >
                            <div className="flex items-center gap-3 truncate">
                              <BookOpen className="h-5 w-5 text-dark shrink-0" />
                              <span className="text-sm font-black text-dark truncate">{res.fileName}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isPdf && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActivePdfUrl(res.downloadUrl);
                                    setActivePdfTitle(res.fileName);
                                  }}
                                  className="flex items-center gap-1 bg-yellow border-[2px] border-dark rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-dark hover:translate-y-[-1px] transition-all shadow-[1px_1px_0px_#000]"
                                >
                                  <Eye className="h-3.5 w-3.5" /> View
                                </button>
                              )}
                              <a
                                href={res.downloadUrl}
                                download
                                className="flex items-center gap-1 bg-white border-[2px] border-dark rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-dark hover:translate-y-[-1px] transition-all shadow-[1px_1px_0px_#000]"
                              >
                                <Download className="h-3.5 w-3.5" /> Get
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div key={res.id} className="p-4 border-[3px] border-dark/10 bg-slate-50 rounded-2xl text-xs font-bold text-dark/30 italic">
                            {res.fileName} (Preparing...)
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-[3px] border-dashed border-dark/20 rounded-3xl cursor-pointer hover:bg-slate-50 transition-all">
                       <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-dark/30" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-dark/40">
                             {selectedFile ? selectedFile.name : 'Upload your work (PDF/JPG)'}
                          </p>
                       </div>
                       <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <button 
                    disabled={isSubmitting || (!selectedFile && !note.trim())}
                    onClick={handleSubmit}
                    className="md:w-48 bg-green-500 text-white border-[4px] border-dark rounded-3xl font-black uppercase text-sm tracking-widest shadow-[8px_8px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-2 p-6"
                  >
                     <Send className="h-8 w-8" />
                     {isSubmitting ? 'Sending...' : 'Send Mission!'}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <section className="pt-12 space-y-6 opacity-80">
          <div className="flex items-center gap-3 mb-8">
             <div className="h-10 w-10 rounded-full bg-green-400 border-[3px] border-dark flex items-center justify-center shadow-[4px_4px_0px_#060E1C]">
               <CheckCircle2 className="h-5 w-5" />
             </div>
             <h2 className="text-3xl font-black text-dark uppercase tracking-tight">Finished Missions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {completed.map((item) => (
              <div key={item.id} className="bg-slate-50 border-[3px] border-dark/20 rounded-[32px] p-8 flex flex-col grayscale opacity-60">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 mb-2">{item.subjectName}</p>
                <h3 className="text-xl font-black text-dark mb-4">{item.title}</h3>
                <div className="mt-auto flex items-center justify-between">
                   <span className="text-xs font-black text-green-600 uppercase tracking-widest">Done!</span>
                   {item.score && (
                     <div className="h-10 w-10 rounded-full bg-yellow border-2 border-dark flex items-center justify-center font-black text-xs">
                        {Number(item.score).toFixed(0)}
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <PDFViewerModal
        isOpen={activePdfUrl !== null}
        onClose={() => {
          setActivePdfUrl(null);
          setActivePdfTitle('');
        }}
        pdfUrl={activePdfUrl}
        title={activePdfTitle}
      />
    </div>
  );
}

function Rocket(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
      <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
    </svg>
  );
}
