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
  Sparkles,
  Loader2,
  Upload,
  Share2,
  Check,
  X,
  ArrowLeft,
  ChevronRight,
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

type ViewMode = 'full-video' | 'whiteboard-full';
type SidebarTab = 'whiteboard' | 'worksheets' | 'seatwork' | 'curriculum';
type VideoServer = 'open-webrtc' | 'jitsi-public';

interface ClassResource {
  id: string;
  title: string;
  public_url: string;
}

export function ClassroomWorkspace({ lessonId, role, userName }: ClassroomWorkspaceProps) {
  // Google Meet Minimalist Architecture:
  // 1. Video takes 100% of the entire viewport (zero outer or inner scrollbars)
  // 2. Minimalist floating bottom dock (Mic, Camera, Screen Share, Whiteboard, Teaching Tools, Leave)
  // 3. Sleek right-hand sidebar for Whiteboard, Worksheets, Student Desks, and Curriculum (never squashing or cluttering video)
  // 4. Same-tab Google Meet option for seamless transition to Google Meet without opening extra tabs
  const [viewMode, setViewMode] = useState<ViewMode>('full-video');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('whiteboard');

  const [lesson, setLesson] = useState<any>(null);
  const [externalMeetingUrl, setExternalMeetingUrl] = useState<string | null>(null);
  const [studentDisplayName, setStudentDisplayName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [availableResources, setAvailableResources] = useState<ClassResource[]>([]);

  // Video Server Engine: fairmeeting.net (no moderator login wall, zero donation pages on exit)
  const [videoServer, setVideoServer] = useState<VideoServer>('open-webrtc');

  // Selected PDF state
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');

  // Floating menus & hardware state
  const [showMeetMenu, setShowMeetMenu] = useState(false);
  const [showDetailsMenu, setShowDetailsMenu] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isJitsiReady, setIsJitsiReady] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoMountRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  const currentDomain = videoServer === 'open-webrtc' ? 'fairmeeting.net' : 'meet.jit.si';
  const cleanRoom = `Edvoura-Classroom-${lessonId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const jitsiUrl = `https://${currentDomain}/${cleanRoom}#config.prejoinPageEnabled=false&config.prejoinConfig.enabled=false&config.skipPrejoin=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent(userName)}&interfaceConfig.TOOLBAR_ALWAYS_VISIBLE=true&interfaceConfig.SHOW_JITSI_WATERMARK=false`;

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

            meetUrl = stProfile?.personal_meet_url || null;
            pupilName = userProfile?.full_name || '';
            if (pupilName) {
              setStudentDisplayName(pupilName);
              title = `1-on-1 Lesson with ${pupilName}`;
            }
            if (stProfile?.grade_level) {
              gradeName = (stProfile.grade_level as any).display_name || gradeName;
              gradeCode = (stProfile.grade_level as any).code || gradeCode;
            }
          }

          setExternalMeetingUrl(meetUrl);
          setLesson({
            id: lessonId,
            title,
            description: `Live 1-on-1 coaching workspace with synchronized whiteboard, live video, and worksheet annotator.`,
            classes: {
              title,
              grade_levels: { display_name: gradeName, code: gradeCode },
            },
          });

          // Fetch preloaded worksheets for this grade
          const { data: dbResources } = await supabase
            .from('resources')
            .select('id, title, file_path')
            .order('created_at', { ascending: false })
            .limit(10);

          if (dbResources) {
            const mapped = dbResources
              .filter((r) => r.file_path)
              .map((r) => {
                const { data: publicData } = supabase.storage
                  .from('assignment-assets')
                  .getPublicUrl(r.file_path);
                return {
                  id: r.id,
                  title: r.title,
                  public_url: publicData?.publicUrl || '',
                };
              })
              .filter((r) => r.public_url);
            setAvailableResources(mapped);
          }

          setLoading(false);
          return;
        }

        // Standard lesson row
        const { data: lessonData } = await supabase
          .from('lessons')
          .select(`
            id,
            title,
            description,
            status,
            meeting_url,
            classes (
              id,
              title,
              grade_level_id,
              grade_levels (code, display_name)
            )
          `)
          .eq('id', lessonId)
          .maybeSingle();

        if (lessonData) {
          setLesson(lessonData);
          setExternalMeetingUrl(lessonData.meeting_url || null);

          const gradeLevelId = (lessonData.classes as any)?.grade_level_id || (Array.isArray(lessonData.classes) ? (lessonData.classes[0] as any)?.grade_level_id : null);
          if (gradeLevelId) {
            const { data: gradeResources } = await supabase
              .from('resources')
              .select('id, title, file_path')
              .eq('grade_level_id', gradeLevelId)
              .limit(10);

            if (gradeResources) {
              const mapped = gradeResources
                .filter((r) => r.file_path)
                .map((r) => {
                  const { data: publicData } = supabase.storage
                    .from('assignment-assets')
                    .getPublicUrl(r.file_path);
                  return {
                    id: r.id,
                    title: r.title,
                    public_url: publicData?.publicUrl || '',
                  };
                })
                .filter((r) => r.public_url);
              setAvailableResources(mapped);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load classroom lesson:', err);
      } finally {
        setLoading(false);
      }
    }

    void loadClassroomData();
  }, [lessonId]);

  // Mount WebRTC Meeting API with strict anti-redirect / anti-donation handlers
  useEffect(() => {
    let isMounted = true;

    const initJitsi = () => {
      if (!isMounted || !videoMountRef.current) return;
      if (!(window as any).JitsiMeetExternalAPI) return;

      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (_) {}
      }

      videoMountRef.current.innerHTML = '';

      try {
        const api = new (window as any).JitsiMeetExternalAPI(currentDomain, {
          roomName: cleanRoom,
          parentNode: videoMountRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: userName },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinConfig: { enabled: false },
            prejoinPageEnabled: false,
            skipPrejoin: true,
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
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
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
          videoConferenceLeft: () => {
            try { api.dispose(); } catch (_) {}
            window.location.replace(role === 'tutor' ? '/dash/tutor/roster' : '/dash/student');
          },
          readyToClose: () => {
            try { api.dispose(); } catch (_) {}
            window.location.replace(role === 'tutor' ? '/dash/tutor/roster' : '/dash/student');
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
  }, [cleanRoom, currentDomain, userName, role]);

  // Realtime Supabase Channel for PDF & Whiteboard synchronization
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`classroom:${lessonId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'load-pdf' }, ({ payload }) => {
        if (payload?.pdfUrl) {
          setSelectedPdfUrl(payload.pdfUrl);
          setSelectedPdfTitle(payload.pdfTitle || 'Shared Worksheet');
          setSidebarTab('worksheets');
          setIsSidebarOpen(true);
        }
      })
      .on('broadcast', { event: 'close-pdf' }, () => {
        setSelectedPdfUrl(null);
        setSelectedPdfTitle('');
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  // Fullscreen Handler
  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsNativeFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsNativeFullscreen(false)).catch(() => {});
    }
  };

  // Native Browser Screen Sharing (Direct W3C getDisplayMedia - 100% Free, Zero Paywalls)
  const handleToggleScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
          } as any,
          audio: true,
        });

        setScreenStream(stream);

        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
        };
      } catch (err: any) {
        if (err.name !== 'NotAllowedError') {
          console.warn('Native display media error:', err);
        }
      }
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
          jitsiApiRef.current.dispose();
        } catch (_) {}
        jitsiApiRef.current = null;
      }
      if (videoMountRef.current) {
        videoMountRef.current.innerHTML = '';
      }
      window.location.replace(role === 'tutor' ? '/dash/tutor/roster' : '/dash/student');
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
    setSidebarTab('worksheets');
    setIsSidebarOpen(true);

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
    setSidebarTab('worksheets');
    setIsSidebarOpen(true);

    if (channelRef.current && role === 'tutor') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'load-pdf',
        payload: { pdfUrl: pdf.public_url, pdfTitle: pdf.title },
      });
    }
  };

  const effectiveGoogleMeetUrl = externalMeetingUrl || 'https://meet.google.com/new';

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070D18] text-white">
        <Loader2 className="h-12 w-12 animate-spin text-yellow mb-4" />
        <h3 className="text-xl font-black">Launching Edvoura Classroom Stage...</h3>
        <p className="text-xs text-white/60 mt-1">Connecting 100% widescreen video and interactive studio</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 w-screen h-screen bg-[#070D18] flex flex-col overflow-hidden select-none font-sans"
    >
      {/* ============================================================
          TOP FLOATING STATUS BAR (CLEAN, MINIMALIST, GOOGLE MEET STYLE)
          ============================================================ */}
      <header className="h-14 px-4 sm:px-6 bg-[#070D18]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeaveCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            title="Leave classroom"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-black text-white truncate max-w-[200px] sm:max-w-md">
              {studentDisplayName ? `1-on-1 Lesson • ${studentDisplayName}` : lesson?.title || 'Interactive Session'}
            </span>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switch to Google Meet Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMeetMenu(!showMeetMenu)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-black shadow-md transition-all active:scale-95"
              title="Launch or Switch to Google Meet"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Meet</span>
            </button>

            {showMeetMenu && (
              <div className="absolute right-0 top-11 w-64 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl p-2.5 text-white z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-black uppercase tracking-wider text-white/50 px-2 py-1 mb-1">
                  Google Meet Integration
                </div>

                {/* Same Tab Navigation */}
                <button
                  onClick={() => {
                    setShowMeetMenu(false);
                    if (confirm('Switch directly to Google Meet in this tab?')) {
                      window.location.href = effectiveGoogleMeetUrl;
                    }
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-xs font-bold transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-white">Switch on Same Tab</p>
                    <p className="text-[10px] text-white/50">Replaces current tab directly</p>
                  </div>
                </button>

                {/* New Tab Option */}
                <button
                  onClick={() => {
                    setShowMeetMenu(false);
                    window.open(effectiveGoogleMeetUrl, '_blank');
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-xs font-bold transition-colors"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-white">Open in New Tab</p>
                    <p className="text-[10px] text-white/50">Side-by-side or dual screen</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleNativeFullscreen}
            className="w-8 h-8 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            title={isNativeFullscreen ? 'Exit Fullscreen' : 'Edge-to-Edge Fullscreen'}
          >
            {isNativeFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ============================================================
          MAIN BODY: 100% WIDESCREEN VIDEO + SLEEK GOOGLE MEET SIDEBAR
          ============================================================ */}
      <main className="flex-1 w-full min-h-0 flex relative overflow-hidden bg-black">
        {/* ==========================================================
            VIEW MODE A: FULL-STAGE WHITEBOARD (GOOGLE JAMBOARD STYLE)
            ========================================================== */}
        {viewMode === 'whiteboard-full' ? (
          <div className="w-full h-full relative flex flex-col bg-white">
            <CollaborativeWhiteboard
              lessonId={lessonId}
              role={role}
              userName={userName}
              onReturnToFullVideo={() => setViewMode('full-video')}
            />

            {/* Corner Picture-in-Picture Video */}
            <div className="absolute bottom-20 right-6 w-60 h-36 sm:w-72 sm:h-44 rounded-2xl border-[3px] border-dark bg-black shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-90">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Feed ({userName})</span>
              </div>
              <div ref={videoMountRef} className="w-full h-full" />
            </div>
          </div>
        ) : (
          /* ==========================================================
              VIEW MODE B: 100% WIDESCREEN VIDEO STAGE (DEFAULT)
              ========================================================== */
          <div className="flex-1 h-full min-w-0 relative flex flex-col bg-black overflow-hidden">
            <div ref={videoMountRef} className="w-full h-full" />

            {!isJitsiReady && (
              <iframe
                src={jitsiUrl}
                allow="camera; microphone; display-capture; autoplay; clipboard-write; screen-wake-lock; fullscreen"
                allowFullScreen
                className="w-full h-full border-none absolute inset-0"
                title="Edvoura Live Video Meeting"
              />
            )}

            {/* Native Screen Share Overlay (Crystal Clear 1080p, 100% Free, NO Paywalls) */}
            {screenStream && (
              <div className="absolute inset-0 z-30 bg-black flex items-center justify-center">
                <video
                  ref={(el) => {
                    if (el && el.srcObject !== screenStream) {
                      el.srcObject = screenStream;
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/20 text-white text-xs font-bold shadow-2xl backdrop-blur-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Sharing Screen (HD Window / Tab)</span>
                  <button
                    onClick={handleToggleScreenShare}
                    className="ml-2 px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase transition-all active:scale-95"
                  >
                    Stop Sharing
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            SLEEK GOOGLE MEET STYLE RIGHT SIDEBAR (ACTIVITIES & TOOLS)
            Width: 380px-420px. Never squashes video, never shows outer scrollbar!
            ============================================================ */}
        {isSidebarOpen && viewMode !== 'whiteboard-full' && (
          <aside className="w-[360px] sm:w-[400px] xl:w-[440px] h-full bg-white border-l-[3px] border-dark flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-200 shrink-0">
            {/* Sidebar Tab Header */}
            <div className="h-14 px-3 bg-yellow/20 border-b-[2.5px] border-dark flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setSidebarTab('whiteboard')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-[2px] border-dark font-black text-xs transition-all ${
                    sidebarTab === 'whiteboard' ? 'bg-yellow text-dark shadow-[1.5px_1.5px_0px_#060E1C]' : 'bg-white text-dark/70 hover:bg-slate-50'
                  }`}
                  title="Collaborative Whiteboard"
                >
                  <Presentation className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Whiteboard</span>
                </button>

                <button
                  onClick={() => setSidebarTab('worksheets')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-[2px] border-dark font-black text-xs transition-all ${
                    sidebarTab === 'worksheets' ? 'bg-yellow text-dark shadow-[1.5px_1.5px_0px_#060E1C]' : 'bg-white text-dark/70 hover:bg-slate-50'
                  }`}
                  title="Worksheets & PDF"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Worksheets</span>
                </button>

                <button
                  onClick={() => setSidebarTab('seatwork')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-[2px] border-dark font-black text-xs transition-all ${
                    sidebarTab === 'seatwork' ? 'bg-yellow text-dark shadow-[1.5px_1.5px_0px_#060E1C]' : 'bg-white text-dark/70 hover:bg-slate-50'
                  }`}
                  title="Student Desks"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{role === 'tutor' ? 'Desks' : 'Seatwork'}</span>
                </button>

                <button
                  onClick={() => setSidebarTab('curriculum')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-[2px] border-dark font-black text-xs transition-all ${
                    sidebarTab === 'curriculum' ? 'bg-yellow text-dark shadow-[1.5px_1.5px_0px_#060E1C]' : 'bg-white text-dark/70 hover:bg-slate-50'
                  }`}
                  title="Curriculum & Notes"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Curriculum</span>
                </button>
              </div>

              {/* Close Sidebar Button -> Restores 100% Video immediately */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 rounded-lg border-[2px] border-dark bg-white hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-dark shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all shrink-0 ml-1"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {/* TAB 1: WHITEBOARD */}
              {sidebarTab === 'whiteboard' && (
                <div className="h-full flex flex-col">
                  <div className="p-2 border-b border-dark/10 bg-slate-50 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-dark/60">
                      Shared Canvas
                    </span>
                    <button
                      onClick={() => setViewMode('whiteboard-full')}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-yellow border-[2px] border-dark text-[10px] font-black uppercase text-dark shadow-[1px_1px_0px_#060E1C] hover:translate-y-[-1px] transition-all"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Full Stage Canvas</span>
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 relative">
                    <CollaborativeWhiteboard lessonId={lessonId} role={role} userName={userName} />
                  </div>
                </div>
              )}

              {/* TAB 2: WORKSHEETS & PDF */}
              {sidebarTab === 'worksheets' && (
                <div className="h-full flex flex-col">
                  {selectedPdfUrl ? (
                    <div className="h-full flex flex-col">
                      <div className="p-2 border-b border-dark/10 bg-yellow/10 flex items-center justify-between shrink-0">
                        <span className="text-xs font-black truncate max-w-[240px] text-dark">
                          {selectedPdfTitle}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedPdfUrl(null);
                            setSelectedPdfTitle('');
                            if (channelRef.current && role === 'tutor') {
                              channelRef.current.send({ type: 'broadcast', event: 'close-pdf' });
                            }
                          }}
                          className="text-[10px] font-black text-rose-600 hover:underline"
                        >
                          Close Worksheet
                        </button>
                      </div>
                      <div className="flex-1 min-h-0">
                        <PDFAnnotator pdfUrl={selectedPdfUrl} lessonId={lessonId} role={role} />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      <div className="p-4 rounded-2xl border-[2px] border-dark bg-yellow/10 space-y-2">
                        <h4 className="text-sm font-black text-dark">Annotate Worksheets &amp; Tutorials</h4>
                        <p className="text-xs text-dark/70 font-semibold leading-relaxed">
                          Select a curriculum worksheet below or upload a custom worksheet to annotate live with your student.
                        </p>
                        {role === 'tutor' && (
                          <label className="cursor-pointer inline-flex items-center gap-2 mt-2 px-3 py-2 bg-yellow border-[2px] border-dark rounded-xl text-xs font-black text-dark shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload Custom Worksheet</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.png,.jpg"
                              onChange={handleUploadCustomPdf}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-dark/60">
                          Preloaded Class Worksheets
                        </h5>
                        {availableResources.length > 0 ? (
                          <div className="space-y-2">
                            {availableResources.map((res) => (
                              <div
                                key={res.id}
                                className="p-3 rounded-xl border-[2px] border-dark bg-white hover:bg-slate-50 flex items-center justify-between gap-2 shadow-[2px_2px_0px_#060E1C]"
                              >
                                <span className="text-xs font-black text-dark truncate">{res.title}</span>
                                <Button
                                  size="sm"
                                  onClick={() => handleSelectPdf(res)}
                                  className="h-7 px-2.5 text-[10px] font-black uppercase bg-dark text-white rounded-lg active:scale-95"
                                >
                                  Open
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-dark/50 italic p-3 bg-slate-50 rounded-xl border border-dark/10">
                            No worksheets attached yet. Upload tutorial notes or assign directly to student.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STUDENT DESKS */}
              {sidebarTab === 'seatwork' && (
                <div className="h-full flex flex-col">
                  <StudentDeskManager lessonId={lessonId} role={role} userName={userName} />
                </div>
              )}

              {/* TAB 4: CURRICULUM & LESSON GOALS */}
              {sidebarTab === 'curriculum' && (
                <div className="p-5 space-y-4 text-dark font-sans">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400">
                      Live Lesson Plan
                    </span>
                    <h3 className="text-lg font-black text-dark mt-2 leading-snug">
                      {lesson?.title || 'Interactive Lesson'}
                    </h3>
                    <p className="text-xs font-bold text-dark/60 mt-1">
                      Class: {lesson?.classes?.title || 'General'} • Grade: {lesson?.classes?.grade_levels?.display_name || 'All'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border-[2px] border-dark rounded-2xl">
                    <p className="text-[10px] font-black text-dark/50 uppercase tracking-wider">Lesson Goal &amp; Objective</p>
                    <p className="text-xs font-bold text-dark/80 mt-1 leading-relaxed">
                      {lesson?.description || 'Active 1-on-1 tutoring session with live video, synchronized whiteboard, and worksheet review.'}
                    </p>
                  </div>

                  <div className="p-4 bg-yellow/10 border-[2px] border-dark rounded-2xl space-y-2">
                    <p className="text-[10px] font-black text-dark/60 uppercase tracking-wider">Direct Classroom Link</p>
                    <Button
                      size="sm"
                      onClick={handleCopyClassInvite}
                      className="w-full h-8 text-xs font-black bg-white text-dark border-[2px] border-dark shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
                    >
                      {copiedInvite ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
                      <span>{copiedInvite ? 'Copied to Clipboard!' : 'Copy Student Invite Link'}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </main>

      {/* ============================================================
          FLOATING MINIMALIST BOTTOM DOCK (EXACT GOOGLE MEET DESIGN)
          Centered, translucent, zero clutter!
          ============================================================ */}
      <footer className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <div className="bg-[#1e1e1e]/95 hover:bg-[#1e1e1e] backdrop-blur-md border border-white/20 p-2 sm:p-2.5 rounded-full shadow-[0px_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-2 sm:gap-3 transition-all">
          {/* Mic Button */}
          <button
            onClick={handleToggleMic}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              micEnabled
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-red-600 text-white shadow-lg'
            }`}
            title={micEnabled ? 'Turn off microphone' : 'Turn on microphone'}
            aria-label="Toggle Microphone"
          >
            {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={handleToggleCamera}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              cameraEnabled
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-red-600 text-white shadow-lg'
            }`}
            title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            aria-label="Toggle Camera"
          >
            {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Share Screen (Native browser window/tab dialog - Zero Paywalls) */}
          <button
            onClick={handleToggleScreenShare}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              screenStream
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={screenStream ? 'Stop Sharing Screen' : 'Share Screen (Select any window, PDF, Word, or tab)'}
            aria-label="Share Screen"
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* Whiteboard Toggle (Opens Whiteboard in Sidebar or Full Stage) */}
          <button
            onClick={() => {
              if (viewMode === 'whiteboard-full') {
                setViewMode('full-video');
              } else if (isSidebarOpen && sidebarTab === 'whiteboard') {
                setViewMode('whiteboard-full');
              } else {
                setSidebarTab('whiteboard');
                setIsSidebarOpen(true);
              }
            }}
            className={`px-3.5 h-11 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              viewMode === 'whiteboard-full' || (isSidebarOpen && sidebarTab === 'whiteboard')
                ? 'bg-yellow text-dark shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Open Interactive Whiteboard"
            aria-label="Whiteboard"
          >
            <Presentation className="w-4 h-4" />
            <span className="hidden sm:inline">Whiteboard</span>
          </button>

          {/* Teaching Tools / Sidebar Toggle */}
          <button
            onClick={() => {
              if (viewMode === 'whiteboard-full') {
                setViewMode('full-video');
                setIsSidebarOpen(true);
              } else {
                setIsSidebarOpen(!isSidebarOpen);
              }
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isSidebarOpen && viewMode !== 'whiteboard-full'
                ? 'bg-white text-dark shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Classroom Activities & Teaching Tools"
            aria-label="Teaching Tools"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* Switch to Google Meet (Same Tab) */}
          <button
            onClick={() => {
              if (confirm('Switch directly to Google Meet for this lesson in this tab?')) {
                window.location.href = effectiveGoogleMeetUrl;
              }
            }}
            className="px-3.5 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            title="Switch directly to Google Meet in this tab"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Google Meet</span>
          </button>

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
      </footer>
    </div>
  );
}