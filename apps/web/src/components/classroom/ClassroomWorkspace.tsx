'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Video, BookOpen, Presentation, FileText, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollaborativeWhiteboard } from './CollaborativeWhiteboard';
import { PDFAnnotator } from './PDFAnnotator';

interface ClassroomWorkspaceProps {
  lessonId: string;
  role: 'tutor' | 'student';
  userName: string;
}

type ActiveTab = 'whiteboard' | 'pdf' | 'info';

interface ClassResource {
  id: string;
  title: string;
  public_url: string;
}

export function ClassroomWorkspace({ lessonId, role, userName }: ClassroomWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('whiteboard');
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availableResources, setAvailableResources] = useState<ClassResource[]>([]);
  
  // Selected PDF state
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');

  const channelRef = useRef<any>(null);

  // Initialize Supabase and Fetch Lesson Details + Preloaded Resources
  useEffect(() => {
    const supabase = createClient();

    async function loadClassroomData() {
      try {
        // 1. Fetch lesson details
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('id, title, description, scheduled_start_at, class_id, classes(title, grade_levels(code, display_name))')
          .eq('id', lessonId)
          .single();

        if (lessonData) {
          setLesson(lessonData);

          // 2. Fetch preloaded comprehension resources matching this grade level
          const classes = Array.isArray(lessonData.classes) ? lessonData.classes[0] : (lessonData.classes as any);
          const gradeLevel = classes?.grade_levels;
          const gradeLevelSingle = Array.isArray(gradeLevel) ? gradeLevel[0] : gradeLevel;
          const gradeCode = gradeLevelSingle?.code;

          if (gradeCode) {
            const { data: resources } = await supabase
              .from('preloaded_resources')
              .select('id, title, public_url')
              .eq('grade_level_code', gradeCode)
              .eq('resource_type', 'comprehension');
            
            if (resources) {
              setAvailableResources(resources);
            }
          }
        }
      } catch (err) {
        console.error('Error loading classroom details:', err);
      } finally {
        setLoading(false);
      }
    }

    void loadClassroomData();
  }, [lessonId]);

  // Sync selected PDF across tutor and students
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`classroom-pdf-sync:${lessonId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'load-pdf' }, ({ payload }: { payload: { pdfUrl: string; pdfTitle: string } }) => {
        setSelectedPdfUrl(payload.pdfUrl);
        setSelectedPdfTitle(payload.pdfTitle);
        setActiveTab('pdf'); // Auto-switch to PDF tab when tutor pushes a PDF
      })
      .on('broadcast', { event: 'pdf-sync-request' }, () => {
        if (role === 'tutor' && selectedPdfUrl) {
          channel.send({
            type: 'broadcast',
            event: 'load-pdf',
            payload: { pdfUrl: selectedPdfUrl, pdfTitle: selectedPdfTitle },
          });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && role === 'student') {
          // Ask tutor what PDF is currently active
          channel.send({
            type: 'broadcast',
            event: 'pdf-sync-request',
            payload: {},
          });
        }
      });

    return () => {
      void channel.unsubscribe();
    };
  }, [lessonId, role, selectedPdfUrl, selectedPdfTitle]);

  const handleSelectPdf = (pdf: ClassResource) => {
    setSelectedPdfUrl(pdf.public_url);
    setSelectedPdfTitle(pdf.title);
    setActiveTab('pdf');

    // Broadcast PDF load event to students
    if (channelRef.current && role === 'tutor') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'load-pdf',
        payload: { pdfUrl: pdf.public_url, pdfTitle: pdf.title },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-base font-bold text-dark/70">Connecting to Live Classroom...</p>
      </div>
    );
  }

  // Create Jitsi embedded video URL
  // We sanitize the room name to allow only alphanumeric characters
  const roomName = `Edvoura-Classroom-${lessonId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(userName)}`;

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full h-[85vh] min-h-[500px]">
      
      {/* Left Pane: Video Conference */}
      <div className="xl:w-[45%] h-full flex flex-col rounded-3xl border-[3px] border-dark bg-white overflow-hidden shadow-[6px_6px_0px_#060E1C] shrink-0">
        <div className="bg-red-500 text-white p-4 border-b-[3px] border-dark flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Edvoura Live Video</span>
          </div>
          <span className="px-3 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">
            Embedded Jitsi
          </span>
        </div>
        <div className="flex-1 bg-slate-900 relative">
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
            className="w-full h-full border-none"
            title="Classroom Video Conference"
          />
        </div>
      </div>

      {/* Right Pane: Interactive Shared Workspace */}
      <div className="flex-1 h-full flex flex-col min-w-0">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-4 shrink-0 overflow-x-auto pb-1">
          <Button
            variant="outline"
            onClick={() => setActiveTab('whiteboard')}
            className={`border-[2px] border-dark rounded-xl font-bold shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all text-xs ${
              activeTab === 'whiteboard' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
          >
            <Presentation className="h-4 w-4 mr-1.5" /> Shared Whiteboard
          </Button>

          <Button
            variant="outline"
            onClick={() => setActiveTab('pdf')}
            disabled={!selectedPdfUrl}
            className={`border-[2px] border-dark rounded-xl font-bold shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all text-xs disabled:opacity-50 ${
              activeTab === 'pdf' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
          >
            <BookOpen className="h-4 w-4 mr-1.5" /> PDF Annotations {!selectedPdfUrl && '(No PDF loaded)'}
          </Button>

          <Button
            variant="outline"
            onClick={() => setActiveTab('info')}
            className={`border-[2px] border-dark rounded-xl font-bold shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all text-xs ${
              activeTab === 'info' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
          >
            <FileText className="h-4 w-4 mr-1.5" /> Lesson Resources & Info
          </Button>
        </div>

        {/* Workspace Display */}
        <div className="flex-1 min-h-0">
          {activeTab === 'whiteboard' && (
            <CollaborativeWhiteboard lessonId={lessonId} role={role} />
          )}

          {activeTab === 'pdf' && selectedPdfUrl && (
            <PDFAnnotator lessonId={lessonId} role={role} pdfUrl={selectedPdfUrl} />
          )}

          {activeTab === 'info' && (
            <div className="h-full w-full bg-white rounded-3xl border-[3px] border-dark p-6 shadow-[6px_6px_0px_#060E1C] overflow-y-auto space-y-6 text-left">
              <div>
                <h2 className="text-2xl font-black text-dark">{lesson?.title || 'Class Lesson'}</h2>
                <p className="text-sm font-bold text-dark/50 mt-1">
                  Class: {lesson?.classes?.title || 'General'} • Grade: {lesson?.classes?.grade_levels?.display_name || 'All'}
                </p>
                <div className="mt-4 p-4 bg-slate-50 border-[2px] border-dark rounded-2xl">
                  <p className="text-xs font-black text-dark/40 uppercase tracking-wider">Lesson Goal / Instructions</p>
                  <p className="text-sm font-bold text-dark/80 mt-1 leading-relaxed">
                    {lesson?.description || 'Review worksheets and participate in the whiteboard discussions.'}
                  </p>
                </div>
              </div>

              {/* Resource Selection panel (only tutor can push new PDFs, students can only see available list) */}
              <div className="border-t-[2px] border-dark/10 pt-6">
                <h3 className="text-lg font-black text-dark mb-4 uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow" />
                  Comprehension Library & Lesson Worksheets
                </h3>
                {role === 'tutor' ? (
                  <p className="text-xs font-bold text-dark/50 mb-4">
                    Select a worksheet below to load it into the **PDF Annotator** for yourself and the student.
                  </p>
                ) : (
                  <p className="text-xs font-bold text-dark/50 mb-4">
                    Worksheets published by the tutor. Tutors can load a PDF to start annotating it.
                  </p>
                )}

                {availableResources.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availableResources.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => handleSelectPdf(res)}
                        className={`flex items-start text-left p-4 rounded-2xl border-[2px] border-dark bg-white transition-all shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:scale-95 ${
                          selectedPdfUrl === res.public_url ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : ''
                        }`}
                      >
                        <div className="h-8 w-8 bg-indigo-100 border-[2px] border-dark rounded-xl flex items-center justify-center text-lg mr-3 shrink-0">📄</div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-dark truncate">{res.title}</p>
                          <p className="text-[10px] font-bold text-indigo-600 mt-0.5">
                            {selectedPdfUrl === res.public_url ? 'Currently Active' : role === 'tutor' ? 'Click to load & share' : 'Click to preview'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 border-[2px] border-dark border-dashed rounded-2xl text-center">
                    <p className="text-xs font-bold text-dark/50">No worksheets mapped to this class grade level yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
