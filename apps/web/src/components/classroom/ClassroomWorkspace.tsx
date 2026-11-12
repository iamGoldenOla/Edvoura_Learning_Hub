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
  PhoneOff,
  Sparkles,
  Loader2,
  Upload,
  Share2,
  Check,
  X,
  ArrowLeft,
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

type PresentationMode = 'none' | 'whiteboard' | 'worksheet' | 'desks';
type VideoServer = 'open-webrtc' | 'jitsi-public';

interface ClassResource {
  id: string;
  title: string;
  public_url: string;
}

export function ClassroomWorkspace({ lessonId, role, userName }: ClassroomWorkspaceProps) {
  // Google Meet Presentation Architecture:
  // 1. When presenting Whiteboard or Worksheet: Content FILLS the large main stage, and video shrinks into a neat right column.
  // 2. When NOT presenting: Video takes 100% full screen.
  // 3. Zero vertical scrollbars, crystal-clear reading and writing.
  const [presentationMode, setPresentationMode] = useState<PresentationMode>('none');
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const [lesson, setLesson] = useState<any>(null);
  const [externalMeetingUrl, setExternalMeetingUrl] = useState<string | null>(null);
  const [studentDisplayName, setStudentDisplayName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [availableResources, setAvailableResources] = useState<ClassResource[]>([]);

  // Video Server Engine: fairmeeting.net (no moderator login wall, zero donation popups on exit)
  const [videoServer, setVideoServer] = useState<VideoServer>('open-webrtc');

  // Selected PDF state
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');

  // Floating menus & hardware state
  const [showMeetMenu, setShowMeetMenu] = useState(false);
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
          setPresentationMode('worksheet');
          setIsToolsOpen(false);
        }
      })
      .on('broadcast', { event: 'close-pdf' }, () => {
        setSelectedPdfUrl(null);
        setSelectedPdfTitle('');
        setPresentationMode('none');
      })
      .on('broadcast', { event: 'present-mode' }, ({ payload }) => {
        if (payload?.mode) {
          setPresentationMode(payload.mode);
        }
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
    setPresentationMode('worksheet');
    setIsToolsOpen(false);

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
    setPresentationMode('worksheet');
    setIsToolsOpen(false);

    if (channelRef.current && role === 'tutor') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'load-pdf',
        payload: { pdfUrl: pdf.public_url, pdfTitle: pdf.title },
      });
    }
  };

  const handleToggleWhiteboard = () => {
    if (presentationMode === 'whiteboard') {
      setPresentationMode('none');
      if (channelRef.current && role === 'tutor') {
        channelRef.current.send({ type: 'broadcast', event: 'present-mode', payload: { mode: 'none' } });
      }
    } else {
      setPresentationMode('whiteboard');
      setIsToolsOpen(false);
      if (channelRef.current && role === 'tutor') {
        channelRef.current.send({ type: 'broadcast', event: 'present-mode', payload: { mode: 'whiteboard' } });
      }
    }
  };

  const handleStopPresenting = () => {
    setPresentationMode('none');
    if (channelRef.current && role === 'tutor') {
      channelRef.current.send({ type: 'broadcast', event: 'close-pdf' });
      channelRef.current.send({ type: 'broadcast', event: 'present-mode', payload: { mode: 'none' } });
    }
  };

  const effectiveGoogleMeetUrl = externalMeetingUrl || 'https://meet.google.com/xyb-ikse-odx';

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
          MAIN BODY: GOOGLE MEET PRESENTATION ARCHITECTURE
          - When presenting: Worksheet / Whiteboard fills MAIN STAGE. Video shrinks to right frame!
          - When NOT presenting: Video takes 100% full stage!
          ============================================================ */}
      <main className="flex-1 w-full min-h-0 flex relative overflow-hidden bg-black">
        {/* ==========================================================
            STAGE 1: PRESENTATION CONTENT (LARGE MAIN STAGE ON LEFT)
            ========================================================== */}
        {presentationMode !== 'none' && (
          <div className="flex-1 h-full min-w-0 bg-white relative flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Presentation Header Strip */}
            <div className="h-12 px-3 sm:px-4 bg-yellow/20 border-b-[2.5px] border-dark flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-black text-dark flex items-center gap-1.5 uppercase tracking-wide truncate">
                  {presentationMode === 'whiteboard' && (
                    <>
                      <Presentation className="w-4 h-4 text-dark shrink-0" />
                      <span>Interactive Whiteboard</span>
                    </>
                  )}
                  {presentationMode === 'worksheet' && (
                    <>
                      <BookOpen className="w-4 h-4 text-dark shrink-0" />
                      <span className="truncate">Worksheet: {selectedPdfTitle || 'Lesson Tutorial'}</span>
                    </>
                  )}
                  {presentationMode === 'desks' && (
                    <>
                      <Users className="w-4 h-4 text-dark shrink-0" />
                      <span>Student Desks &amp; Seatwork</span>
                    </>
                  )}
                </span>
              </div>

              {/* Presentation Switchers & Stop Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setPresentationMode('whiteboard')}
                  className={`px-2.5 py-1 rounded-lg border-[2px] border-dark text-xs font-black transition-all ${
                    presentationMode === 'whiteboard'
                      ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]'
                      : 'bg-white text-dark/70 hover:bg-slate-50'
                  }`}
                  title="Switch to Whiteboard"
                >
                  Whiteboard
                </button>

                {selectedPdfUrl && (
                  <button
                    onClick={() => setPresentationMode('worksheet')}
                    className={`px-2.5 py-1 rounded-lg border-[2px] border-dark text-xs font-black transition-all ${
                      presentationMode === 'worksheet'
                        ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]'
                        : 'bg-white text-dark/70 hover:bg-slate-50'
                    }`}
                    title="Switch to Worksheet"
                  >
                    Worksheet
                  </button>
                )}

                <button
                  onClick={() => setPresentationMode('desks')}
                  className={`px-2.5 py-1 rounded-lg border-[2px] border-dark text-xs font-black transition-all ${
                    presentationMode === 'desks'
                      ? 'bg-yellow text-dark shadow-[1px_1px_0px_#060E1C]'
                      : 'bg-white text-dark/70 hover:bg-slate-50'
                  }`}
                  title="Switch to Student Desks"
                >
                  Desks
                </button>

                {/* Stop Presentation -> Restores 100% Video immediately */}
                <button
                  onClick={handleStopPresenting}
                  className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 border-[2px] border-dark rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all ml-1"
                  title="Stop presentation and restore full video"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Stop Presenting</span>
                </button>
              </div>
            </div>

            {/* Presentation Stage Content */}
            <div className="flex-1 min-h-0 relative w-full h-full overflow-hidden bg-white">
              {presentationMode === 'whiteboard' && (
                <CollaborativeWhiteboard
                  lessonId={lessonId}
                  role={role}
                  userName={userName}
                  onReturnToFullVideo={handleStopPresenting}
                />
              )}

              {presentationMode === 'worksheet' && selectedPdfUrl && (
                <PDFAnnotator pdfUrl={selectedPdfUrl} lessonId={lessonId} role={role} />
              )}

              {presentationMode === 'desks' && (
                <StudentDeskManager lessonId={lessonId} role={role} userName={userName} />
              )}
            </div>
          </div>
        )}

        {/* ==========================================================
            STAGE 2: PARTICIPANTS LIVE VIDEO FRAME
            - When presenting: Shrinks into small frame on the right (Google Meet Style!)
            - When NOT presenting: Fills 100% of the stage!
            ========================================================== */}
        <div
          className={`h-full relative flex flex-col bg-black transition-all duration-300 ease-in-out ${
            presentationMode !== 'none'
              ? 'w-[240px] sm:w-[280px] xl:w-[320px] border-l-[3px] border-dark shrink-0 z-20'
              : 'flex-1 min-w-0'
          }`}
        >
          {/* Right Header Strip when shrunk */}
          {presentationMode !== 'none' && (
            <div className="h-10 px-3 bg-[#0d1527] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-white/80">Live Video</span>
              </div>
              <span className="text-[9px] font-bold text-white/40">{role === 'tutor' ? 'Tutor & Pupil' : 'Class Feed'}</span>
            </div>
          )}

          {/* Persistent Live Video Mount (Never drops connection) */}
          <div className="flex-1 w-full relative bg-black flex items-center justify-center overflow-hidden">
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
        </div>

        {/* ============================================================
            TEACHING TOOLS DRAWER (WHEN NOT PRESENTING)
            Allows tutor to browse curriculum, select a worksheet, or push a custom PDF.
            ============================================================ */}
        {isToolsOpen && presentationMode === 'none' && (
          <aside className="w-[360px] sm:w-[400px] xl:w-[440px] h-full bg-white border-l-[3px] border-dark flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-200 shrink-0">
            {/* Drawer Header */}
            <div className="h-14 px-4 bg-yellow/20 border-b-[2.5px] border-dark flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-dark" />
                <h3 className="font-black text-sm text-dark uppercase tracking-tight">Teaching Activities</h3>
              </div>
              <button
                onClick={() => setIsToolsOpen(false)}
                className="w-8 h-8 rounded-lg border-[2px] border-dark bg-white hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-dark shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {/* Quick Launch Whiteboard */}
              <div className="p-4 rounded-2xl border-[2px] border-dark bg-yellow/10 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-dark">Interactive Whiteboard</h4>
                <p className="text-xs text-dark/70 font-semibold leading-relaxed">
                  Open full-screen digital canvas to draw, solve math equations, and write notes.
                </p>
                <Button
                  onClick={handleToggleWhiteboard}
                  className="w-full bg-yellow border-[2px] border-dark text-dark font-black text-xs uppercase shadow-[2px_2px_0px_#060E1C] active:scale-95"
                >
                  <Presentation className="w-4 h-4 mr-1.5" />
                  <span>Launch Whiteboard Stage</span>
                </Button>
              </div>

              {/* Upload Custom Worksheet */}
              {role === 'tutor' && (
                <div className="p-4 rounded-2xl border-[2px] border-dark bg-blue-50 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-dark">Present Custom Worksheet</h4>
                  <p className="text-xs text-dark/70 font-semibold leading-relaxed">
                    Upload any PDF, Word document, or image to present and annotate live.
                  </p>
                  <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-50 border-[2px] border-dark rounded-xl text-xs font-black text-dark shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all">
                    <Upload className="h-3.5 w-3.5 text-blue-600" />
                    <span>Upload &amp; Present Worksheet</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      onChange={handleUploadCustomPdf}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Preloaded Class Worksheets */}
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
                          className="h-7 px-3 text-[10px] font-black uppercase bg-dark text-white rounded-lg active:scale-95"
                        >
                          Present
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-dark/50 italic p-3 bg-slate-50 rounded-xl border border-dark/10">
                    No preloaded worksheets found. Upload above or assign from Tutor Builder.
                  </p>
                )}
              </div>

              {/* Lesson Objectives */}
              <div className="p-4 bg-slate-50 border-[2px] border-dark rounded-2xl space-y-1">
                <p className="text-[10px] font-black text-dark/50 uppercase tracking-wider">Lesson Goal</p>
                <p className="text-xs font-bold text-dark/80 leading-relaxed">
                  {lesson?.description || 'Active 1-on-1 tutoring session with live video and interactive stage.'}
                </p>
              </div>

              {/* Invite Link */}
              <div className="p-4 bg-yellow/10 border-[2px] border-dark rounded-2xl space-y-2">
                <p className="text-[10px] font-black text-dark/60 uppercase tracking-wider">Classroom Link</p>
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
          </aside>
        )}
      </main>

      {/* ============================================================
          FLOATING MINIMALIST BOTTOM DOCK (EXACT GOOGLE MEET DESIGN)
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

          {/* Share Screen (Native Windows/Tab dialog - Zero Paywalls) */}
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

          {/* Whiteboard Toggle (Opens Whiteboard in Main Stage & Shrinks Video to Right!) */}
          <button
            onClick={handleToggleWhiteboard}
            className={`px-3.5 h-11 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              presentationMode === 'whiteboard'
                ? 'bg-yellow text-dark shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={presentationMode === 'whiteboard' ? 'Stop Presenting Whiteboard' : 'Present Whiteboard on Main Stage'}
            aria-label="Whiteboard"
          >
            <Presentation className="w-4 h-4" />
            <span className="hidden sm:inline">Whiteboard</span>
          </button>

          {/* Teaching Tools / Worksheets Toggle */}
          <button
            onClick={() => {
              if (presentationMode === 'worksheet') {
                setPresentationMode('none');
              } else if (selectedPdfUrl) {
                setPresentationMode('worksheet');
              } else {
                setIsToolsOpen(!isToolsOpen);
              }
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              presentationMode === 'worksheet' || isToolsOpen
                ? 'bg-white text-dark shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Classroom Worksheets & Activities"
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