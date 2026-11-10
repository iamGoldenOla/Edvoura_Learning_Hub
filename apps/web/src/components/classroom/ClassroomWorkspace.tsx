'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Video,
  BookOpen,
  Presentation,
  FileText,
  Loader2,
  Sparkles,
  Users,
  Maximize2,
  Minimize2,
  ExternalLink,
  MonitorPlay,
  Columns,
  Eye,
  EyeOff,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollaborativeWhiteboard } from './CollaborativeWhiteboard';
import { StudentDeskManager } from './StudentDeskManager';
import { PDFAnnotator } from './PDFAnnotator';

interface ClassroomWorkspaceProps {
  lessonId: string;
  role: 'tutor' | 'student';
  userName: string;
}

type ActiveTab = 'whiteboard' | 'seatwork' | 'pdf' | 'info';
type LayoutMode = 'split' | 'expanded-board' | 'board-only';
type MobileTab = 'video' | 'workspace';

interface ClassResource {
  id: string;
  title: string;
  public_url: string;
}

export function ClassroomWorkspace({ lessonId, role, userName }: ClassroomWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('whiteboard');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [mobileTab, setMobileTab] = useState<MobileTab>('workspace');
  const [lesson, setLesson] = useState<any>(null);
  const [externalMeetingUrl, setExternalMeetingUrl] = useState<string | null>(null);
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
        // Check if this is a direct 1-on-1 session or instant teaching studio
        if (lessonId && (lessonId.startsWith('1on1-') || lessonId.startsWith('instant-'))) {
          let meetUrl: string | null = null;
          let title = '1-on-1 Interactive Classroom Hub';
          let gradeName = 'Primary / All Grades';
          let gradeCode = 'grade_3';

          if (lessonId.startsWith('1on1-')) {
            const targetStudentId = lessonId.replace('1on1-', '');
            const [{ data: stProfile }, { data: userProfile }] = await Promise.all([
              supabase
                .from('student_profiles')
                .select('personal_meet_url, grade_level:grade_levels(code, display_name)')
                .eq('user_id', targetStudentId)
                .maybeSingle(),
              supabase
                .from('profiles')
                .select('full_name')
                .eq('id', targetStudentId)
                .maybeSingle(),
            ]);

            if (stProfile?.personal_meet_url) {
              meetUrl = stProfile.personal_meet_url;
            }
            if ((stProfile?.grade_level as any)?.code) {
              gradeCode = (stProfile?.grade_level as any).code;
            }
            if ((stProfile?.grade_level as any)?.display_name) {
              gradeName = (stProfile?.grade_level as any).display_name;
            }
            if (userProfile?.full_name) {
              title = `1-on-1 Mentorship • ${userProfile.full_name}`;
            }
          }

          setLesson({
            title,
            description: 'Live coaching workspace with synchronized whiteboard, live video, and worksheet annotator.',
            classes: {
              title,
              grade_levels: { display_name: gradeName },
            },
          });

          if (meetUrl) {
            setExternalMeetingUrl(meetUrl);
          }

          const { data: resources } = await supabase
            .from('preloaded_resources')
            .select('id, title, public_url')
            .or(`grade_level_code.eq.${gradeCode},grade_level_code.eq.grade_3`)
            .eq('resource_type', 'comprehension')
            .limit(10);

          if (resources) setAvailableResources(resources);
          setLoading(false);
          return;
        }

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

        // 3. Check for external meeting link (like Google Meet if configured)
        const { data: sessionData } = await supabase
          .from('private.lesson_live_sessions' as any)
          .select('join_url, host_url')
          .eq('lesson_id', lessonId)
          .maybeSingle();

        if (sessionData?.join_url) {
          setExternalMeetingUrl(sessionData.join_url);
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

  const handleUploadCustomPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    const localUrl = URL.createObjectURL(file);
    setSelectedPdfUrl(localUrl);
    setSelectedPdfTitle(file.name);
    setActiveTab('pdf');

    try {
      const supabase = createClient();
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const objectPath = `classroom/${lessonId}/${safeName}`;
      const upload = await supabase.storage.from('assignment-assets').upload(objectPath, file);
      if (!upload.error) {
        const { data: publicData } = supabase.storage.from('assignment-assets').getPublicUrl(objectPath);
        if (publicData?.publicUrl) {
          setSelectedPdfUrl(publicData.publicUrl);
          if (channelRef.current && role === 'tutor') {
            channelRef.current.send({
              type: 'broadcast',
              event: 'load-pdf',
              payload: { pdfUrl: publicData.publicUrl, pdfTitle: file.name },
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to upload classroom pdf:', err);
    }
  };

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
        <p className="text-base font-bold text-dark/70">Connecting to Edvoura Classroom Hub...</p>
      </div>
    );
  }

  // Sanitize room name to allow only alphanumeric characters
  const roomName = `Edvoura-Classroom-${lessonId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(userName)}`;

  // Determine width based on layoutMode
  let videoPaneClass = 'xl:w-[45%]';
  if (layoutMode === 'expanded-board') {
    videoPaneClass = 'xl:w-[28%]';
  } else if (layoutMode === 'board-only') {
    videoPaneClass = 'hidden';
  }

  return (
    <div className="space-y-3">
      {/* Top Workspace Helper & Layout Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-[3px] border-dark rounded-2xl p-3 shadow-[4px_4px_0px_#060E1C]">
        <div className="flex items-center gap-2 text-xs font-bold text-dark">
          <MonitorPlay className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">
            <strong>All-in-One Hub:</strong> Video &amp; Interactive Board are synchronized here. Click the screen-share button in the video window to project anytime.
          </span>
          <span className="inline sm:hidden">
            <strong>Unified Hub:</strong> Video &amp; Board in one workspace.
          </span>
        </div>

        {/* Layout & Popout Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile view switcher */}
          <div className="flex xl:hidden border-[2px] border-dark rounded-xl overflow-hidden shadow-[2px_2px_0px_#060E1C]">
            <button
              onClick={() => setMobileTab('video')}
              className={`px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                mobileTab === 'video' ? 'bg-red-500 text-white' : 'bg-white text-dark'
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Video
            </button>
            <button
              onClick={() => setMobileTab('workspace')}
              className={`px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                mobileTab === 'workspace' ? 'bg-yellow text-dark' : 'bg-white text-dark'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" /> Workspace
            </button>
          </div>

          {/* Desktop Layout Toggles */}
          <div className="hidden xl:flex items-center gap-1.5 border-[2px] border-dark rounded-xl p-1 bg-off-white">
            <button
              onClick={() => setLayoutMode('split')}
              title="Split View (50 / 50)"
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1 ${
                layoutMode === 'split' ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]' : 'text-dark/60 hover:text-dark'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> 50/50
            </button>
            <button
              onClick={() => setLayoutMode('expanded-board')}
              title="Expand Board (Bigger Whiteboard)"
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1 ${
                layoutMode === 'expanded-board' ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]' : 'text-dark/60 hover:text-dark'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" /> Big Board
            </button>
            <button
              onClick={() => setLayoutMode(layoutMode === 'board-only' ? 'split' : 'board-only')}
              title={layoutMode === 'board-only' ? 'Show Video Pane' : 'Full Screen Board (Hide Video)'}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1 ${
                layoutMode === 'board-only' ? 'bg-navy text-white' : 'text-dark/60 hover:text-dark'
              }`}
            >
              {layoutMode === 'board-only' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {layoutMode === 'board-only' ? 'Show Video' : 'Hide Video'}
            </button>
          </div>

          {/* External Google Meet Backup if tutor/parent requested it */}
          {externalMeetingUrl && (
            <a
              href={externalMeetingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border-[2px] border-dark bg-white hover:bg-slate-50 text-dark text-xs font-black shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all"
              title="Open Google Meet in pop-out tab if parent prefers Google Meet on a second screen"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Google Meet Backup</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className="flex flex-col xl:flex-row gap-6 w-full h-[85vh] min-h-[550px]">
        
        {/* Left Pane: Embedded Live Video (Jitsi inside Edvoura) */}
        <div
          className={`${videoPaneClass} h-full flex flex-col rounded-3xl border-[3px] border-dark bg-white overflow-hidden shadow-[6px_6px_0px_#060E1C] shrink-0 ${
            mobileTab === 'video' ? 'flex' : 'hidden xl:flex'
          }`}
        >
          <div className="bg-red-500 text-white p-3.5 border-b-[3px] border-dark flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Edvoura Live Video</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                In-Hub Stream
              </span>
            </div>
          </div>
          <div className="flex-1 bg-slate-900 relative">
            <iframe
              src={jitsiUrl}
              allow="camera; microphone; display-capture; autoplay; clipboard-write; screen-wake-lock; fullscreen"
              allowFullScreen
              className="w-full h-full border-none"
              title="Classroom Video Conference"
            />
          </div>
        </div>

        {/* Right Pane: Interactive Shared Workspace (Whiteboard / Seatwork / PDF / Resources) */}
        <div
          className={`flex-1 h-full flex flex-col min-w-0 ${
            mobileTab === 'workspace' ? 'flex' : 'hidden xl:flex'
          }`}
        >
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mb-3 shrink-0 overflow-x-auto pb-1">
            <Button
              variant="outline"
              onClick={() => setActiveTab('whiteboard')}
              className={`border-[2px] border-dark rounded-xl font-bold shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all text-xs ${
                activeTab === 'whiteboard' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
              }`}
            >
              <Presentation className="h-4 w-4 mr-1.5" /> Shared Board
            </Button>

            <Button
              variant="outline"
              onClick={() => setActiveTab('seatwork')}
              className={`border-[2px] border-dark rounded-xl font-bold shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all text-xs ${
                activeTab === 'seatwork' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
              }`}
            >
              <Users className="h-4 w-4 mr-1.5" /> {role === 'tutor' ? 'Student Desks & Mark Work' : 'My Seat-Work Desk'}
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
              <FileText className="h-4 w-4 mr-1.5" /> Curriculum &amp; Worksheets
            </Button>
          </div>

          {/* Workspace Display */}
          <div className="flex-1 min-h-0">
            {activeTab === 'whiteboard' && (
              <CollaborativeWhiteboard lessonId={lessonId} role={role} userName={userName} />
            )}

            {activeTab === 'seatwork' && (
              <StudentDeskManager lessonId={lessonId} role={role} userName={userName} />
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-black text-dark uppercase tracking-tight flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow" />
                      Comprehension Library &amp; Lesson Worksheets
                    </h3>
                    {role === 'tutor' && (
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-[2px] border-dark bg-yellow hover:bg-yellow/90 text-dark font-black text-xs shadow-[2px_2px_0px_#060E1C] cursor-pointer active:scale-95 transition-all shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Tutorial / PDF</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf"
                          onChange={handleUploadCustomPdf}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {role === 'tutor' ? (
                    <p className="text-xs font-bold text-dark/50 mb-4">
                      Select a worksheet or curriculum resource below to load it into the <strong>PDF Annotator</strong> for yourself and the student.
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
                      <p className="text-xs font-bold text-dark/50">No worksheets mapped to this class grade level yet. You can upload custom PDFs or use the Shared Board.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
