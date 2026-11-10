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
  Share2,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
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
type ViewMode = 'full-video' | 'drawer-overlay' | 'split';

interface ClassResource {
  id: string;
  title: string;
  public_url: string;
}

export function ClassroomWorkspace({ lessonId, role, userName }: ClassroomWorkspaceProps) {
  // 100% Video Persistence Architecture:
  // - 'full-video': Video takes 100% full stage (uninterrupted widescreen)
  // - 'drawer-overlay': Video stays 100% full stage while interactive board slides in as an overlay drawer on the right
  // - 'split': Dual 50/50 stage when actively drawing together
  const [viewMode, setViewMode] = useState<ViewMode>('full-video');
  const [activeTab, setActiveTab] = useState<ActiveTab>('whiteboard');
  const [lesson, setLesson] = useState<any>(null);
  const [externalMeetingUrl, setExternalMeetingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableResources, setAvailableResources] = useState<ClassResource[]>([]);

  // Selected PDF state
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');

  // Floating controls state
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isJitsiReady, setIsJitsiReady] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoMountRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  const cleanRoom = `Edvoura-Classroom-${lessonId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const jitsiUrl = `https://meet.jit.si/${cleanRoom}#config.prejoinPageEnabled=false&config.prejoinConfig.enabled=false&config.skipPrejoin=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent(userName)}&interfaceConfig.TOOLBAR_ALWAYS_VISIBLE=true`;

  // Initialize Supabase & lesson metadata
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

  // Mount Jitsi Meet API with zero prejoin prompt & authenticated user name
  useEffect(() => {
    let isMounted = true;

    const initJitsi = () => {
      if (!videoMountRef.current || jitsiApiRef.current || !(window as any).JitsiMeetExternalAPI) return;

      try {
        videoMountRef.current.innerHTML = '';
        const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName: cleanRoom,
          parentNode: videoMountRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: userName,
          },
          configOverwrite: {
            prejoinConfig: { enabled: false },
            prejoinPageEnabled: false,
            skipPrejoin: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            enableClosePage: false,
            enableWelcomePage: false,
            p2p: { enabled: true },
            toolbarButtons: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'raisehand',
              'videoquality',
              'filmstrip',
              'tileview',
              'select-background',
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
            DEFAULT_BACKGROUND: '#060E1C',
          },
        });

        jitsiApiRef.current = api;
        setIsJitsiReady(true);

        api.addEventListeners({
          audioMuteStatusChanged: (e: any) => setMicEnabled(!e.muted),
          videoMuteStatusChanged: (e: any) => setCameraEnabled(!e.muted),
          videoConferenceJoined: () => {
            api.executeCommand('setDisplayName', userName);
          },
        });
      } catch (err) {
        console.warn('Jitsi External API mount error:', err);
      }
    };

    if ((window as any).JitsiMeetExternalAPI) {
      initJitsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        if (isMounted) initJitsi();
      };
      document.body.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (_) {}
        jitsiApiRef.current = null;
      }
    };
  }, [cleanRoom, userName]);

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
        setViewMode('drawer-overlay');
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

  // Native Fullscreen edge-to-edge monitor expansion
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

  // Screen Share Handler
  const handleToggleScreenShare = async () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand('toggleShareScreen');
      } catch (err) {
        console.warn('Jitsi share command error:', err);
      }
    } else if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      try {
        await navigator.mediaDevices.getDisplayMedia({ video: true });
      } catch (err) {
        console.warn('Display capture cancelled', err);
      }
    } else {
      alert('Screen sharing is available on desktop browsers or via the in-video controls.');
    }
  };

  const handleToggleMic = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand('toggleAudio');
      } catch (_) {}
    } else {
      setMicEnabled(!micEnabled);
    }
  };

  const handleToggleCamera = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand('toggleVideo');
      } catch (_) {}
    } else {
      setCameraEnabled(!cameraEnabled);
    }
  };

  const handleLeaveCall = () => {
    if (confirm('Leave the active classroom session?')) {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.executeCommand('hangup');
        } catch (_) {}
      }
      window.location.href = role === 'tutor' ? '/dash/tutor/roster' : '/dash/student';
    }
  };

  const handleCopyClassInvite = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/dash/student/live/classroom?lessonId=${lessonId}`;
    navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 3000);
  };

  const handleUploadCustomPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    const localUrl = URL.createObjectURL(file);
    setSelectedPdfUrl(localUrl);
    setSelectedPdfTitle(file.name);
    setActiveTab('pdf');
    setViewMode('drawer-overlay');

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
    setViewMode('drawer-overlay');

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
        <p className="text-xs font-bold text-dark/60 mt-1">Initializing 100% video stage and shared canvas</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-3 font-sans select-none">
      
      {/* Top Classroom Bar */}
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

        {/* View Layout & Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyClassInvite}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-[2.5px] border-dark bg-white hover:bg-slate-50 text-dark font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all"
            title="Copy Student Invite Link"
            aria-label="Copy Student Invite Link"
          >
            {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copiedInvite ? 'Invite Copied!' : 'Copy Invite'}</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 border-[2.5px] border-dark rounded-xl p-1 bg-off-white shadow-[2px_2px_0px_#060E1C]">
            <button
              onClick={() => setViewMode('full-video')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'full-video'
                  ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]'
                  : 'text-dark/70 hover:text-dark hover:bg-white'
              }`}
              title="100% Full Video Stage (Uninterrupted widescreen)"
              aria-label="Full Video Stage"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Full Video</span>
            </button>

            <button
              onClick={() => {
                setViewMode('drawer-overlay');
                setActiveTab('whiteboard');
              }}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'drawer-overlay'
                  ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]'
                  : 'text-dark/70 hover:text-dark hover:bg-white'
              }`}
              title="Video + Slide-over Whiteboard Drawer"
              aria-label="Video with Slide-over Board"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Board Overlay</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]'
                  : 'text-dark/70 hover:text-dark hover:bg-white'
              }`}
              title="50/50 Dual Studio"
              aria-label="Side-by-side Dual Studio"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual Studio</span>
            </button>
          </div>

          {/* Edge-to-Edge Monitor Fullscreen */}
          <button
            onClick={toggleNativeFullscreen}
            className="flex items-center gap-1.5 px-3 py-2 border-[2.5px] border-dark bg-white hover:bg-slate-50 text-dark font-black text-xs uppercase tracking-wider rounded-xl shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all"
            title={isNativeFullscreen ? 'Exit Fullscreen' : 'Enter Edge-to-Edge Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isNativeFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isNativeFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>

          {/* External Google Meet Backup if parent/tutor requested it */}
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

      {/* ============================================================
          MAIN CLASSROOM STAGE (100% VIDEO VIEWPORT AT ALL TIMES)
          ============================================================ */}
      <div className="relative w-full h-[84vh] min-h-[580px] rounded-3xl border-[3.5px] border-dark bg-slate-950 overflow-hidden shadow-[8px_8px_0px_#060E1C] flex">
        
        {/* ============================================================
            100% VIDEO VIEWPORT (NEVER SQUISHED, PERMANENT WIDESCREEN)
            ============================================================ */}
        <div
          className={`h-full relative flex flex-col bg-black transition-all duration-300 ease-in-out ${
            viewMode === 'split' ? 'w-full xl:w-[50%] border-r-[3px] border-dark' : 'w-full'
          }`}
        >
          {/* Top In-Video Status Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Edvoura 100% Video Stage</span>
              <span className="opacity-50">•</span>
              <span className="text-[11px] opacity-80">{userName} ({role})</span>
            </div>

            {/* Quick Trigger to Open Whiteboard Drawer when in Full-Video view */}
            {viewMode === 'full-video' && (
              <button
                onClick={() => {
                  setViewMode('drawer-overlay');
                  setActiveTab('whiteboard');
                }}
                className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-yellow hover:bg-yellow/90 border-[2.5px] border-dark text-dark font-black text-xs uppercase tracking-wider rounded-xl shadow-[3px_3px_0px_#060E1C] active:scale-95 transition-all"
                title="Slide open the collaborative whiteboard without shrinking video"
                aria-label="Open Whiteboard Overlay Drawer"
              >
                <Presentation className="w-4 h-4" />
                <span>Open Board &amp; Worksheets</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Jitsi Meet Video Mount (100% Full Width & Height) */}
          <div className="w-full h-full relative bg-black">
            <div ref={videoMountRef} className="w-full h-full" />
            
            {/* Fallback iframe while script initialises */}
            {!isJitsiReady && (
              <iframe
                src={jitsiUrl}
                allow="camera; microphone; display-capture; autoplay; clipboard-write; screen-wake-lock; fullscreen"
                allowFullScreen
                className="w-full h-full border-none absolute inset-0"
                title="Edvoura Live Video Meeting"
              />
            )}
          </div>

          {/* ============================================================
              UNIFIED GOOGLE MEET BOTTOM CONTROL DOCK (Screenshot 2 & 3)
              ============================================================ */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <div className="bg-[#1e1e1e]/90 hover:bg-[#1e1e1e] backdrop-blur-md border border-white/20 p-2 sm:p-2.5 rounded-full shadow-[0px_10px_25px_rgba(0,0,0,0.6)] flex items-center gap-2 sm:gap-3 transition-all">
              
              {/* Mic Status */}
              <button
                onClick={handleToggleMic}
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

              {/* Camera Status */}
              <button
                onClick={handleToggleCamera}
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

              {/* Real Screen Share Presentation */}
              <button
                onClick={handleToggleScreenShare}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                title="Share Screen (Present Your Display / Tab to Pupil)"
                aria-label="Share Screen"
              >
                <ScreenShare className="w-5 h-5" />
              </button>

              {/* Whiteboard Overlay Drawer Toggle */}
              <button
                onClick={() => {
                  if (viewMode === 'full-video') {
                    setViewMode('drawer-overlay');
                    setActiveTab('whiteboard');
                  } else {
                    setViewMode('full-video');
                  }
                }}
                className={`px-4 h-11 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  viewMode !== 'full-video'
                    ? 'bg-yellow text-dark shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Slide-over Collaborative Whiteboard"
                aria-label="Toggle Whiteboard"
              >
                <Presentation className="w-4 h-4" />
                <span className="hidden sm:inline">Shared Board</span>
              </button>

              {/* Edge-to-Edge Fullscreen Button */}
              <button
                onClick={toggleNativeFullscreen}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                title="Edge-to-Edge Monitor Fullscreen"
                aria-label="Toggle Fullscreen"
              >
                {isNativeFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>

              {/* 3-Dots Options Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                  title="More Options"
                  aria-label="More Meeting Options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

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
                      onClick={() => setViewMode(viewMode === 'split' ? 'full-video' : 'split')}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors"
                    >
                      <Layout className="w-4 h-4 text-blue-400" />
                      <span>{viewMode === 'split' ? 'Switch to Full Video' : 'Switch to 50/50 Dual Studio'}</span>
                    </button>

                    <button
                      onClick={handleCopyClassInvite}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors border-t border-white/10 mt-1 pt-2"
                    >
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span>Copy Class Invite Link</span>
                    </button>

                    {externalMeetingUrl && (
                      <a
                        href={externalMeetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                        <span>Google Meet Popout Backup</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Red Hangup Button */}
              <button
                onClick={handleLeaveCall}
                className="w-14 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
                title="Leave classroom"
                aria-label="Leave Classroom"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            INTERACTIVE SLIDE-OVER DRAWER / SPLIT WORKSPACE
            ============================================================ */}
        {(viewMode === 'drawer-overlay' || viewMode === 'split') && (
          <div
            className={`flex flex-col bg-white overflow-hidden z-40 transition-all duration-300 ease-out ${
              viewMode === 'split'
                ? 'w-full xl:w-[50%] h-full relative'
                : 'absolute top-0 right-0 w-full sm:w-[85%] md:w-[70%] xl:w-[62%] h-full border-l-[4px] border-dark shadow-[-10px_0px_30px_rgba(0,0,0,0.5)]'
            }`}
          >
            {/* Drawer Top Bar */}
            <div className="flex items-center justify-between gap-2 p-3 border-b-[3px] border-dark bg-yellow/20 shrink-0 overflow-x-auto">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('whiteboard')}
                  className={`border-[2px] border-dark rounded-xl font-black text-xs shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all ${
                    activeTab === 'whiteboard' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
                  }`}
                  aria-label="Switch to Shared Board"
                >
                  <Presentation className="h-4 w-4 mr-1.5" /> Shared Board
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab('seatwork')}
                  className={`border-[2px] border-dark rounded-xl font-black text-xs shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all ${
                    activeTab === 'seatwork' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
                  }`}
                  aria-label="Switch to Student Desks"
                >
                  <Users className="h-4 w-4 mr-1.5" /> {role === 'tutor' ? 'Student Desks & Mark Work' : 'My Seat-Work'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab('pdf')}
                  disabled={!selectedPdfUrl}
                  className={`border-[2px] border-dark rounded-xl font-black text-xs shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all disabled:opacity-50 ${
                    activeTab === 'pdf' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
                  }`}
                  aria-label="Switch to PDF Annotations"
                >
                  <BookOpen className="h-4 w-4 mr-1.5" /> PDF {!selectedPdfUrl && '(No PDF)'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab('info')}
                  className={`border-[2px] border-dark rounded-xl font-black text-xs shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all ${
                    activeTab === 'info' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
                  }`}
                  aria-label="Switch to Curriculum Worksheets"
                >
                  <FileText className="h-4 w-4 mr-1.5" /> Curriculum
                </Button>
              </div>

              {/* Close Drawer / Slide Away Button */}
              <button
                onClick={() => setViewMode('full-video')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border-[2px] border-dark rounded-xl font-black text-xs uppercase tracking-wider text-dark shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all shrink-0"
                title="Minimize Drawer back to Full Video"
                aria-label="Close Drawer"
              >
                <span>Full Video</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
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

                  {/* Preloaded Resources List */}
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
