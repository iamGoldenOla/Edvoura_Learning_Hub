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
  Columns,
  Sparkles,
  Loader2,
  Upload,
  Share2,
  Check,
  X,
  ChevronRight,
  Server,
  Info,
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
type VideoServer = 'open-webrtc' | 'jitsi-public';

interface ClassResource {
  id: string;
  title: string;
  public_url: string;
}

export function ClassroomWorkspace({ lessonId, role, userName }: ClassroomWorkspaceProps) {
  // Google Meet Minimalism Architecture:
  // - Video takes 100% of the stage cleanly (unobstructed edge-to-edge)
  // - All tools, overlay drawers, and layouts are accessible from the bottom dock & 3-dots menu
  const [viewMode, setViewMode] = useState<ViewMode>('full-video');
  const [activeTab, setActiveTab] = useState<ActiveTab>('whiteboard');
  const [lesson, setLesson] = useState<any>(null);
  const [externalMeetingUrl, setExternalMeetingUrl] = useState<string | null>(null);
  const [studentDisplayName, setStudentDisplayName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [availableResources, setAvailableResources] = useState<ClassResource[]>([]);

  // Video Server Engine:
  // - 'open-webrtc': Uses fairmeeting.net (zero moderator login or 8x8 auth wall)
  // - 'jitsi-public': Standard meet.jit.si
  const [videoServer, setVideoServer] = useState<VideoServer>('open-webrtc');

  // Selected PDF state
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');

  // Floating controls state
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDetailsMenu, setShowDetailsMenu] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isJitsiReady, setIsJitsiReady] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoMountRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  const currentDomain = videoServer === 'open-webrtc' ? 'fairmeeting.net' : 'meet.jit.si';
  const cleanRoom = `Edvoura-Classroom-${lessonId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const jitsiUrl = `https://${currentDomain}/${cleanRoom}#config.prejoinPageEnabled=false&config.prejoinConfig.enabled=false&config.skipPrejoin=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent(userName)}&interfaceConfig.TOOLBAR_ALWAYS_VISIBLE=true`;

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
          let pupilName = '';

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
              pupilName = userProfile.full_name;
              title = `1-on-1 Lesson • ${pupilName}`;
              setStudentDisplayName(pupilName);
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

  // Mount WebRTC Meeting API (No moderator login wall on fairmeeting.net)
  useEffect(() => {
    let isMounted = true;

    const initJitsi = () => {
      if (!videoMountRef.current || !(window as any).JitsiMeetExternalAPI) return;

      try {
        if (jitsiApiRef.current) {
          try {
            jitsiApiRef.current.dispose();
          } catch (_) {}
          jitsiApiRef.current = null;
        }

        videoMountRef.current.innerHTML = '';
        const api = new (window as any).JitsiMeetExternalAPI(currentDomain, {
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
            enableLobby: false,
            requireDisplayName: false,
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

    const scriptId = `webrtc-script-${currentDomain.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const existingScript = document.getElementById(scriptId);

    if (existingScript && (window as any).JitsiMeetExternalAPI) {
      initJitsi();
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://${currentDomain}/external_api.js`;
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
  }, [cleanRoom, userName, currentDomain]);

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
    <div ref={containerRef} className="font-sans select-none relative w-full">
      {/* ============================================================
          MAIN CLASSROOM STAGE (100% CLEAN FULL-SCREEN VIDEO VIEWPORT)
          ============================================================ */}
      <div className="relative w-full h-[88vh] min-h-[620px] rounded-3xl border-[3.5px] border-dark bg-slate-950 overflow-hidden shadow-[8px_8px_0px_#060E1C] flex">
        
        {/* ============================================================
            100% VIDEO VIEWPORT (NEVER SQUISHED, GOOGLE MEET MINIMALISM)
            ============================================================ */}
        <div
          className={`h-full relative flex flex-col bg-black transition-all duration-300 ease-in-out ${
            viewMode === 'split' ? 'w-full xl:w-[50%] border-r-[3px] border-dark' : 'w-full'
          }`}
        >
          {/* WebRTC Video Mount (100% Full Width & Height) */}
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
              BOTTOM DOCK LEFT: ROOM & PUPIL INFO (Google Meet Style)
              ============================================================ */}
          <div className="absolute bottom-5 left-6 z-30 hidden md:flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setShowDetailsMenu(!showDetailsMenu)}
              className="flex items-center gap-2 bg-[#1e1e1e]/90 hover:bg-[#1e1e1e] backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-full text-white text-xs font-bold shadow-lg transition-all"
              title="Classroom session details"
              aria-label="Classroom Details"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[200px]">
                {studentDisplayName ? `1-on-1 • ${studentDisplayName}` : lesson?.title || 'Interactive Hub'}
              </span>
              <Info className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Session Details Popup */}
            {showDetailsMenu && (
              <div className="absolute bottom-12 left-0 w-72 bg-slate-900 border-2 border-white/20 rounded-2xl shadow-2xl p-3 text-white z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-black text-yellow uppercase tracking-wider mb-1">
                  Active Lesson
                </div>
                <p className="text-xs font-bold text-white mb-2">{lesson?.title || '1-on-1 Mentorship'}</p>
                <div className="text-[11px] text-white/70 space-y-1 border-t border-white/10 pt-2">
                  <p>Role: <span className="font-bold text-white capitalize">{role}</span> ({userName})</p>
                  <p>Engine: <span className="font-bold text-emerald-400">{videoServer === 'open-webrtc' ? 'Open WebRTC (Zero Login)' : 'Public Jitsi'}</span></p>
                  {externalMeetingUrl && (
                    <p className="truncate">Meet URL: <span className="font-mono text-cyan-300">{externalMeetingUrl}</span></p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
              BOTTOM DOCK CENTER: GOOGLE MEET CONTROL DOCK
              ============================================================ */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <div className="bg-[#1e1e1e]/95 hover:bg-[#1e1e1e] backdrop-blur-md border border-white/20 p-2 sm:p-2.5 rounded-full shadow-[0px_10px_30px_rgba(0,0,0,0.7)] flex items-center gap-2 sm:gap-3 transition-all">
              
              {/* Mic Toggle */}
              <button
                onClick={handleToggleMic}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  micEnabled
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                }`}
                title={micEnabled ? 'Turn off microphone' : 'Turn on microphone'}
                aria-label="Toggle Microphone"
              >
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={handleToggleCamera}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  cameraEnabled
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                }`}
                title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                aria-label="Toggle Video Camera"
              >
                {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Share Button (Zoom / Google Meet Style Popover) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowShareMenu(!showShareMenu);
                    setShowOptionsMenu(false);
                    setShowDetailsMenu(false);
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    showShareMenu
                      ? 'bg-yellow text-dark shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Share Whiteboard, Screen, or Worksheets"
                  aria-label="Share Screen or Whiteboard"
                >
                  <ScreenShare className="w-5 h-5" />
                </button>

                {/* Share Options Menu */}
                {showShareMenu && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-80 bg-slate-900 border-2 border-white/20 rounded-2xl shadow-2xl p-3 text-white z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[11px] font-black uppercase tracking-wider text-white/50 px-2 py-1 mb-1">
                      Choose what to share:
                    </div>

                    {/* 1. Blank Interactive Whiteboard */}
                    <button
                      onClick={() => {
                        setViewMode('drawer-overlay');
                        setActiveTab('whiteboard');
                        setShowShareMenu(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3 transition-colors group mb-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-yellow text-dark flex items-center justify-center font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
                        <Presentation className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">Whiteboard (Blank Canvas)</p>
                        <p className="text-[10px] font-bold text-white/60">Draw, write equations, &amp; collaborate live</p>
                      </div>
                    </button>

                    {/* 2. Desktop Screen Share */}
                    <button
                      onClick={() => {
                        setShowShareMenu(false);
                        handleToggleScreenShare();
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3 transition-colors group mb-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
                        <ScreenShare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">Share Screen (Desktop / Tab)</p>
                        <p className="text-[10px] font-bold text-white/60">Present your screen or browser window</p>
                      </div>
                    </button>

                    {/* 3. School Worksheet / PDF */}
                    <button
                      onClick={() => {
                        setViewMode('drawer-overlay');
                        setActiveTab('pdf');
                        setShowShareMenu(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3 transition-colors group mb-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">Worksheets &amp; PDF</p>
                        <p className="text-[10px] font-bold text-white/60">Annotate homework and curriculum</p>
                      </div>
                    </button>

                    {/* 4. Google Meet Room Direct Launch */}
                    {externalMeetingUrl && (
                      <a
                        href={externalMeetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setShowShareMenu(false)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3 transition-colors group border-t border-white/10 mt-1 pt-2"
                      >
                        <div className="w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">Launch Pupil&apos;s Google Meet</p>
                          <p className="text-[10px] font-bold text-white/60">Open permanent room in dedicated tab</p>
                        </div>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Whiteboard / Tools Slide Drawer Toggle */}
              <button
                onClick={() => {
                  if (viewMode === 'full-video') {
                    setViewMode('drawer-overlay');
                    setActiveTab('whiteboard');
                  } else {
                    setViewMode('full-video');
                  }
                }}
                className={`px-4 h-11 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                  viewMode !== 'full-video'
                    ? 'bg-yellow text-dark shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={viewMode !== 'full-video' ? 'Hide tools drawer (100% video)' : 'Open whiteboard & worksheets drawer'}
                aria-label="Toggle Whiteboard and Tools Drawer"
              >
                <Presentation className="w-4 h-4" />
                <span className="hidden sm:inline">{viewMode !== 'full-video' ? 'Close Tools' : 'Board & Tools'}</span>
              </button>

              {/* 3-Dots Options Menu (Google Meet Style) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowOptionsMenu(!showOptionsMenu);
                    setShowShareMenu(false);
                    setShowDetailsMenu(false);
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    showOptionsMenu
                      ? 'bg-white text-dark shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="More Options"
                  aria-label="More Meeting Options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showOptionsMenu && (
                  <div
                    className="absolute bottom-14 left-1/2 -translate-x-1/2 w-72 bg-slate-900 border-2 border-white/20 rounded-2xl shadow-2xl p-2.5 text-white z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="text-[10px] font-black uppercase tracking-wider text-white/50 px-2.5 py-1 mb-1">
                      Classroom Tools &amp; Layout
                    </div>

                    {/* Edge-to-Edge Fullscreen */}
                    <button
                      onClick={() => {
                        toggleNativeFullscreen();
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors"
                    >
                      <Maximize2 className="w-4 h-4 text-yellow" />
                      <span>{isNativeFullscreen ? 'Exit Fullscreen' : 'Edge-to-Edge Fullscreen'}</span>
                    </button>

                    {/* Layout: Full Video */}
                    <button
                      onClick={() => {
                        setViewMode('full-video');
                        setShowOptionsMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors ${
                        viewMode === 'full-video' ? 'text-yellow bg-white/5' : ''
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>100% Full Video (No Clutter)</span>
                    </button>

                    {/* Layout: Board Drawer Overlay */}
                    <button
                      onClick={() => {
                        setViewMode('drawer-overlay');
                        setActiveTab('whiteboard');
                        setShowOptionsMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors ${
                        viewMode === 'drawer-overlay' ? 'text-yellow bg-white/5' : ''
                      }`}
                    >
                      <Presentation className="w-4 h-4" />
                      <span>Side Board Overlay Drawer</span>
                    </button>

                    {/* Layout: Dual Studio Split */}
                    <button
                      onClick={() => {
                        setViewMode('split');
                        setShowOptionsMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors ${
                        viewMode === 'split' ? 'text-yellow bg-white/5' : ''
                      }`}
                    >
                      <Columns className="w-4 h-4" />
                      <span>50/50 Dual Studio Split</span>
                    </button>

                    <div className="border-t border-white/10 my-1 pt-1" />

                    {/* Copy Class Invite */}
                    <button
                      onClick={() => {
                        handleCopyClassInvite();
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold transition-colors"
                    >
                      {copiedInvite ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
                      <span>{copiedInvite ? 'Invite Copied to Clipboard!' : 'Copy Student Invite Link'}</span>
                    </button>

                    {/* Launch Google Meet */}
                    {externalMeetingUrl && (
                      <a
                        href={externalMeetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setShowOptionsMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-xs font-bold text-cyan-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open in Google Meet</span>
                      </a>
                    )}

                    {/* Switch Video Provider (Never stuck on moderator wall) */}
                    <div className="border-t border-white/10 my-1 pt-1" />
                    <button
                      onClick={() => {
                        const nextServer = videoServer === 'open-webrtc' ? 'jitsi-public' : 'open-webrtc';
                        setVideoServer(nextServer);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-[11px] font-bold text-white/70 transition-colors"
                      title="Switch stream server"
                    >
                      <Server className="w-4 h-4 text-emerald-400" />
                      <span>Server: {videoServer === 'open-webrtc' ? 'Open WebRTC (No Login)' : 'Public Jitsi'}</span>
                    </button>
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

          {/* ============================================================
              BOTTOM DOCK RIGHT: GOOGLE MEET & FULLSCREEN SHORTCUTS
              ============================================================ */}
          <div className="absolute bottom-5 right-6 z-30 hidden md:flex items-center gap-2 pointer-events-auto">
            {externalMeetingUrl && (
              <a
                href={externalMeetingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/20 bg-[#1e1e1e]/90 hover:bg-[#1e1e1e] text-cyan-300 text-xs font-black shadow-lg active:scale-95 transition-all"
                title="Launch pupil's official Google Meet room"
                aria-label="Launch Google Meet"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Meet</span>
              </a>
            )}

            <button
              onClick={toggleNativeFullscreen}
              className="w-10 h-10 rounded-full bg-[#1e1e1e]/90 hover:bg-[#1e1e1e] border border-white/20 text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
              title={isNativeFullscreen ? 'Exit Fullscreen' : 'Edge-to-Edge Fullscreen'}
              aria-label="Toggle Fullscreen"
            >
              {isNativeFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
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
            {/* Drawer Header Strip */}
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

              {/* Close Drawer Button -> Returns immediately to 100% Video */}
              <button
                onClick={() => setViewMode('full-video')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border-[2px] border-dark rounded-xl font-black text-xs uppercase tracking-wider text-dark shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all shrink-0"
                title="Close drawer back to 100% Full Video"
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
