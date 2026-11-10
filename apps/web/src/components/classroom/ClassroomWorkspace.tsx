'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ScreenShare,
  Maximize2,
  Minimize2,
  Presentation,
  BookOpen,
  FileText,
  Users,
  ExternalLink,
  MoreVertical,
  PhoneOff,
  Layout,
  PictureInPicture2,
  Columns,
  Sparkles,
  Loader2,
  Upload,
  ArrowRight,
  MonitorPlay,
  CheckCircle2,
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
type LayoutMode = 'video-stage' | 'split' | 'board-focus';

interface ClassResource {
  id: string;
  title: string;
  public_url: string;
}

export function ClassroomWorkspace({ lessonId, role, userName }: ClassroomWorkspaceProps) {
  // Google Meet-style layout modes:
  // - 'video-stage': Full widescreen cinema video with floating Google Meet bottom controls
  // - 'split': 50/50 Dual Studio (Video on left, Whiteboard/Worksheet on right)
  // - 'board-focus': Full Whiteboard with floating Picture-in-Picture camera tile in bottom right
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('video-stage');
  const [activeTab, setActiveTab] = useState<ActiveTab>('whiteboard');
  const [lesson, setLesson] = useState<any>(null);
  const [externalMeetingUrl, setExternalMeetingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableResources, setAvailableResources] = useState<ClassResource[]>([]);

  // Selected PDF state
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');

  // Meeting controls & Google Meet menu
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Initialize Supabase & classroom data
  useEffect(() => {
    const supabase = createClient();

    async function loadClassroomData() {
      try {
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
            description: 'Live 1-on-1 coaching workspace with synchronized whiteboard, live video, and worksheet annotator.',
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

        // Fetch pre-scheduled lesson
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('id, title, description, scheduled_start_at, class_id, classes(title, grade_levels(code, display_name))')
          .eq('id', lessonId)
          .single();

        if (lessonData) {
          setLesson(lessonData);
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
            if (resources) setAvailableResources(resources);
          }
        }

        // Check for private lesson live session link
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
        setActiveTab('pdf');
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

  // Handle Fullscreen edge-to-edge browser monitor expansion
  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => {
        setIsNativeFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsNativeFullscreen(false);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleUploadCustomPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    const localUrl = URL.createObjectURL(file);
    setSelectedPdfUrl(localUrl);
    setSelectedPdfTitle(file.name);
    setActiveTab('pdf');
    setLayoutMode('split');

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
    setLayoutMode('split');

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
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-off-white rounded-3xl border-4 border-dark p-12">
        <Loader2 className="h-12 w-12 animate-spin text-dark mb-4" />
        <h3 className="text-xl font-black text-dark">Connecting to Edvoura Classroom Hub...</h3>
        <p className="text-xs font-bold text-dark/60 mt-1">Initializing video stage and shared canvas</p>
      </div>
    );
  }

  // Widescreen Jitsi configuration (clean, skips prejoin, enables full widescreen HD)
  const roomName = `Edvoura-Classroom-${lessonId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent(userName)}`;

  return (
    <div ref={containerRef} className="space-y-3 font-sans select-none">
      
      {/* Top Classroom Bar with Google Meet-style Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-[3px] border-dark rounded-2xl p-3 shadow-[4px_4px_0px_#060E1C]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500 border-[2px] border-dark rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C]">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Live Session</span>
          </div>

          <span className="text-xs font-black text-dark tracking-tight hidden sm:inline">
            {lesson?.title || 'Interactive Hub'}
          </span>
        </div>

        {/* View Layout Controls (Google Meet Style) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border-[2.5px] border-dark rounded-xl p-1 bg-off-white shadow-[2px_2px_0px_#060E1C]">
            <button
              onClick={() => setLayoutMode('video-stage')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                layoutMode === 'video-stage'
                  ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]'
                  : 'text-dark/70 hover:text-dark hover:bg-white'
              }`}
              title="Full Video Stage: Widescreen view just like Google Meet & Zoom"
              aria-label="Full Video Stage Mode"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Full Video Stage</span>
            </button>

            <button
              onClick={() => setLayoutMode('split')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                layoutMode === 'split'
                  ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]'
                  : 'text-dark/70 hover:text-dark hover:bg-white'
              }`}
              title="Dual Studio: Side-by-side 50/50 view with whiteboard"
              aria-label="Side-by-side Split View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>

            <button
              onClick={() => setLayoutMode('board-focus')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                layoutMode === 'board-focus'
                  ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]'
                  : 'text-dark/70 hover:text-dark hover:bg-white'
              }`}
              title="Board Focus with Picture-in-Picture camera tile"
              aria-label="Board Focus with Picture-in-Picture"
            >
              <PictureInPicture2 className="w-3.5 h-3.5" />
              <span>Board &amp; PiP</span>
            </button>
          </div>

          {/* Native HTML5 Fullscreen (edge-to-edge monitor expansion) */}
          <button
            onClick={toggleNativeFullscreen}
            className="flex items-center gap-1.5 px-3 py-2 border-[2.5px] border-dark bg-white hover:bg-slate-50 text-dark font-black text-xs uppercase tracking-wider rounded-xl shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all"
            title={isNativeFullscreen ? 'Exit Fullscreen' : 'Enter Edge-to-Edge Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isNativeFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isNativeFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>

          {/* External Google Meet Backup if needed */}
          {externalMeetingUrl && (
            <a
              href={externalMeetingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-[2.5px] border-dark bg-white hover:bg-blue-50 text-blue-700 text-xs font-black shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all"
              title="Open Google Meet in pop-out tab if parent or tutor prefers second screen"
              aria-label="Open Google Meet in secondary tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Google Meet Popout</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Classroom Viewport */}
      <div className="relative w-full h-[84vh] min-h-[580px] rounded-3xl border-[3.5px] border-dark bg-slate-950 overflow-hidden shadow-[8px_8px_0px_#060E1C] flex flex-col xl:flex-row">
        
        {/* ============================================================
            VIDEO STAGE (GOOGLE MEET / ZOOM FULLSCREEN EXPERIENCE)
            ============================================================ */}
        <div
          className={`relative transition-all duration-300 ease-in-out flex flex-col bg-slate-900 ${
            layoutMode === 'video-stage'
              ? 'w-full h-full'
              : layoutMode === 'split'
              ? 'w-full xl:w-[50%] h-[40vh] xl:h-full border-b-[3px] xl:border-b-0 xl:border-r-[3px] border-dark'
              : 'fixed bottom-6 right-6 w-72 sm:w-88 h-48 sm:h-56 z-40 rounded-2xl border-4 border-dark shadow-2xl overflow-hidden'
          }`}
        >
          {/* Top Stage Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Edvoura Live Room</span>
              <span className="opacity-50">•</span>
              <span className="text-[11px] opacity-80">{userName} ({role})</span>
            </div>

            {/* Quick Button to Slide Open Whiteboard when in Full Video Stage */}
            {layoutMode === 'video-stage' && (
              <button
                onClick={() => setLayoutMode('split')}
                className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 bg-yellow hover:bg-yellow/90 border-[2.5px] border-dark text-dark font-black text-xs uppercase tracking-wider rounded-xl shadow-[3px_3px_0px_#060E1C] active:scale-95 transition-all"
                aria-label="Open Interactive Whiteboard and Seatwork"
              >
                <Presentation className="w-4 h-4" />
                <span>Open Whiteboard &amp; Worksheets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* In Picture-in-Picture mode: button to restore Full Video Stage */}
            {layoutMode === 'board-focus' && (
              <button
                onClick={() => setLayoutMode('video-stage')}
                className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-yellow text-dark border-2 border-dark font-black text-xs rounded-xl shadow-lg active:scale-95"
                title="Expand back to Big Video Stage"
                aria-label="Restore Full Video Stage"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Enlarge</span>
              </button>
            )}
          </div>

          {/* The Live Video iframe (Full Widescreen 16:9 Google Meet canvas) */}
          <div className="flex-1 w-full h-full bg-black relative">
            <iframe
              src={jitsiUrl}
              allow="camera; microphone; display-capture; autoplay; clipboard-write; screen-wake-lock; fullscreen"
              allowFullScreen
              className="w-full h-full border-none"
              title="Edvoura Live Video Meeting"
            />
          </div>

          {/* ============================================================
              GOOGLE MEET FLOATING BOTTOM CONTROL BAR (Screenshot 2 & 3)
              ============================================================ */}
          {layoutMode !== 'board-focus' && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
              <div className="bg-[#1e1e1e]/90 hover:bg-[#1e1e1e] backdrop-blur-md border border-white/20 p-2 sm:p-2.5 rounded-full shadow-[0px_10px_25px_rgba(0,0,0,0.6)] flex items-center gap-2 sm:gap-3 transition-all">
                
                {/* Audio Status Pill */}
                <button
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    micEnabled
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
                  aria-label="Toggle Microphone"
                >
                  {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                {/* Video Camera Status Pill */}
                <button
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    cameraEnabled
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                  aria-label="Toggle Video Camera"
                >
                  {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                {/* Screen Share / Project Desk */}
                <button
                  onClick={() => {
                    setLayoutMode('split');
                    setActiveTab('whiteboard');
                  }}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                  title="Share Screen or Project Board"
                  aria-label="Share Screen or Open Board"
                >
                  <ScreenShare className="w-5 h-5" />
                </button>

                {/* Switch to Whiteboard / Worksheets */}
                <button
                  onClick={() => setLayoutMode(layoutMode === 'split' ? 'video-stage' : 'split')}
                  className={`px-4 h-11 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    layoutMode === 'split'
                      ? 'bg-yellow text-dark shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Toggle Side-by-Side Shared Board"
                  aria-label="Toggle Shared Board"
                >
                  <Presentation className="w-4 h-4" />
                  <span className="hidden sm:inline">Shared Board</span>
                </button>

                {/* Fullscreen Expansion Button */}
                <button
                  onClick={toggleNativeFullscreen}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                  title="Full Screen Edge-to-Edge"
                  aria-label="Toggle Fullscreen Edge-to-Edge"
                >
                  {isNativeFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>

                {/* 3-Dots Options Menu (Google Meet Screenshot 3) */}
                <div className="relative">
                  <button
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                    title="More Options"
                    aria-label="More Meeting Options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Options Dropdown Menu */}
                  {showOptionsMenu && (
                    <div
                      className="absolute bottom-14 left-1/2 -translate-x-1/2 w-64 bg-slate-900 border-2 border-white/20 rounded-2xl shadow-2xl p-2 text-white z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setShowOptionsMenu(false)}
                    >
                      <button
                        onClick={toggleNativeFullscreen}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors"
                      >
                        <Maximize2 className="w-4 h-4 text-yellow" />
                        <span>Edge-to-Edge Fullscreen</span>
                      </button>

                      <button
                        onClick={() => setLayoutMode('board-focus')}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors"
                      >
                        <PictureInPicture2 className="w-4 h-4 text-emerald-400" />
                        <span>Open Picture-in-Picture mode</span>
                      </button>

                      <button
                        onClick={() => setLayoutMode(layoutMode === 'split' ? 'video-stage' : 'split')}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors"
                      >
                        <Layout className="w-4 h-4 text-blue-400" />
                        <span>Adjust view (Side-by-Side)</span>
                      </button>

                      {externalMeetingUrl && (
                        <a
                          href={externalMeetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors border-t border-white/10 mt-1 pt-2"
                        >
                          <ExternalLink className="w-4 h-4 text-cyan-400" />
                          <span>Google Meet Popout Backup</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Red End Call / Exit Button */}
                <button
                  onClick={() => {
                    if (confirm('Leave the active classroom session?')) {
                      window.location.href = role === 'tutor' ? '/dash/tutor/roster' : '/dash/student';
                    }
                  }}
                  className="w-14 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
                  title="Leave classroom"
                  aria-label="Leave Classroom"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            SHARED INTERACTIVE CANVAS & DESK WORKSPACE
            ============================================================ */}
        {(layoutMode === 'split' || layoutMode === 'board-focus') && (
          <div
            className={`flex flex-col bg-white overflow-hidden transition-all duration-300 ${
              layoutMode === 'split' ? 'w-full xl:w-[50%] h-[60vh] xl:h-full' : 'w-full h-full'
            }`}
          >
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between gap-2 p-3 border-b-[3px] border-dark bg-off-white shrink-0 overflow-x-auto">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('whiteboard')}
                  className={`border-[2px] border-dark rounded-xl font-bold text-xs shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all ${
                    activeTab === 'whiteboard' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
                  }`}
                  aria-label="Switch to Shared Board"
                >
                  <Presentation className="h-4 w-4 mr-1.5" /> Shared Board
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab('seatwork')}
                  className={`border-[2px] border-dark rounded-xl font-bold text-xs shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all ${
                    activeTab === 'seatwork' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
                  }`}
                  aria-label="Switch to Student Desks and Seatwork"
                >
                  <Users className="h-4 w-4 mr-1.5" /> {role === 'tutor' ? 'Student Desks & Mark Work' : 'My Seat-Work Desk'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab('pdf')}
                  disabled={!selectedPdfUrl}
                  className={`border-[2px] border-dark rounded-xl font-bold text-xs shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all disabled:opacity-50 ${
                    activeTab === 'pdf' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
                  }`}
                  aria-label="Switch to PDF Worksheet Annotations"
                >
                  <BookOpen className="h-4 w-4 mr-1.5" /> PDF Annotations {!selectedPdfUrl && '(No PDF loaded)'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab('info')}
                  className={`border-[2px] border-dark rounded-xl font-bold text-xs shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all ${
                    activeTab === 'info' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
                  }`}
                  aria-label="Switch to Curriculum and Worksheets"
                >
                  <FileText className="h-4 w-4 mr-1.5" /> Curriculum &amp; Worksheets
                </Button>
              </div>

              {/* Close / Return to Full Video Stage */}
              <button
                onClick={() => setLayoutMode('video-stage')}
                className="px-3 py-1.5 rounded-xl border-[2px] border-dark bg-white hover:bg-slate-50 text-dark font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
                title="Expand Video Stage to Fullscreen"
                aria-label="Back to Full Video Stage"
              >
                <Video className="w-3.5 h-3.5 text-red-500" />
                <span>Full Video Stage</span>
              </button>
            </div>

            {/* Active Canvas Display */}
            <div className="flex-1 min-h-0 overflow-y-auto">
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
                <div className="h-full w-full bg-white p-6 overflow-y-auto space-y-6 text-left">
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

                  {/* Resource Selection panel */}
                  <div className="border-t-[2px] border-dark/10 pt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-lg font-black text-dark uppercase tracking-tight flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow" />
                        <span>Preloaded Curriculum &amp; Worksheets</span>
                      </h3>

                      {role === 'tutor' && (
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-yellow border-[2px] border-dark rounded-xl text-xs font-black text-dark shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Push Custom PDF</span>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleUploadCustomPdf}
                            className="hidden"
                            aria-label="Upload custom PDF worksheet"
                          />
                        </label>
                      )}
                    </div>

                    {availableResources.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableResources.map((res) => (
                          <div
                            key={res.id}
                            className={`p-3 rounded-xl border-[2px] border-dark flex items-center justify-between gap-3 transition-all ${
                              selectedPdfUrl === res.public_url
                                ? 'bg-yellow/20 shadow-[2px_2px_0px_#060E1C]'
                                : 'bg-off-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-dark truncate">{res.title}</p>
                              <p className="text-[10px] font-black uppercase text-dark/40 mt-0.5">Comprehension / Worksheet</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSelectPdf(res)}
                              className="h-8 px-3 text-[11px] font-black uppercase tracking-wider bg-dark text-white rounded-lg active:scale-95"
                              aria-label={`Open ${res.title}`}
                            >
                              Open &amp; Push
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-dark/50 italic">
                        No preloaded worksheets found for this grade level. Use the button above to upload custom materials.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
