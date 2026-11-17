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
  Users,
  PhoneOff,
  Sparkles,
  Loader2,
  Upload,
  Share2,
  Check,
  X,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Home,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollaborativeWhiteboard } from './CollaborativeWhiteboard';
import { StudentDeskManager } from './StudentDeskManager';
import { PDFAnnotator } from './PDFAnnotator';
import { AIWorksheetModal } from './AIWorksheetModal';
import { VRLabExplorer } from './VRLabExplorer';
import { Glasses } from 'lucide-react';

interface ClassroomWorkspaceProps {
  lessonId: string;
  role: 'tutor' | 'student';
  userName: string;
}

type PresentationMode = 'none' | 'whiteboard' | 'worksheet' | 'desks' | 'youtube' | 'vrlab';


function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface ClassResource {
  id: string;
  title: string;
  public_url: string;
}

export function ClassroomWorkspace({ lessonId, role, userName }: ClassroomWorkspaceProps) {
  // Google Meet Presentation Architecture:
  // 1. When presenting Whiteboard or Worksheet: Content FILLS the large main stage.
  // 2. Right video column can be collapsed/expanded via toggle!
  // 3. When NOT presenting: Video takes 100% full screen.
  // 4. Zero vertical scrollbars, crystal-clear reading and writing.
  const [presentationMode, setPresentationMode] = useState<PresentationMode>('none');
  const [isVideoCollapsed, setIsVideoCollapsed] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [showAiWorksheetModal, setShowAiWorksheetModal] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [sharedYoutubeId, setSharedYoutubeId] = useState<string | null>(null);
  const [showYoutubeModal, setShowYoutubeModal] = useState<boolean>(false);
  const [youtubeInputUrl, setYoutubeInputUrl] = useState<string>('');

  const [lesson, setLesson] = useState<any>(null);
  const [studentDisplayName, setStudentDisplayName] = useState<string>('');
  const [gradeDisplayName, setGradeDisplayName] = useState<string>('Grade 4');
  const [loading, setLoading] = useState(true);
  const [availableResources, setAvailableResources] = useState<ClassResource[]>([]);

  // Selected PDF state
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');

  // Hardware state
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isJitsiReady, setIsJitsiReady] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenShareNotification, setScreenShareNotification] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoMountRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  // Open WebRTC Meeting Infrastructure (Zero Moderator Login Wall, Instant Classroom Join)
  const currentDomain = 'fairmeeting.net';
  const cleanRoom = `Edvoura-Classroom-${lessonId.replace(/[^a-zA-Z0-9]/g, '')}`;
  // Strictly stripped out all watermarks, logos, and donate popups
  const jitsiUrl = `https://${currentDomain}/${cleanRoom}#config.prejoinPageEnabled=false&config.prejoinConfig.enabled=false&config.skipPrejoin=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.enableClosePage=false&config.enableWelcomePage=false&config.disableDeepLinking=true&userInfo.displayName=${encodeURIComponent(userName)}&interfaceConfig.TOOLBAR_ALWAYS_VISIBLE=true&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false&interfaceConfig.SHOW_BRAND_WATERMARK=false&interfaceConfig.SHOW_POWERED_BY=false&interfaceConfig.DEFAULT_LOGO_URL=""&interfaceConfig.JITSI_WATERMARK_LINK=""&interfaceConfig.BRAND_WATERMARK_LINK=""`;

  // Initialize Supabase & lesson metadata
  useEffect(() => {
    const supabase = createClient();

    async function loadClassroomData() {
      try {
        if (lessonId && (lessonId.startsWith('1on1-') || lessonId.startsWith('instant-'))) {
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

            pupilName = userProfile?.full_name || '';
            if (pupilName) {
              setStudentDisplayName(pupilName);
              title = `1-on-1 Lesson with ${pupilName}`;
            }
            if (stProfile?.grade_level) {
              gradeName = (stProfile.grade_level as any).display_name || gradeName;
              gradeCode = (stProfile.grade_level as any).code || gradeCode;
              setGradeDisplayName(gradeName);
            }
          }

          setLesson({
            id: lessonId,
            title,
            description: `Live 1-on-1 coaching workspace with synchronized whiteboard, live video, and worksheet annotator.`,
            classes: {
              title,
              grade_levels: { display_name: gradeName, code: gradeCode },
            },
          });

          // Fetch preloaded worksheets
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

  // Mount WebRTC Meeting API with strict anti-watermark and anti-redirect configurations
  useEffect(() => {
    let isMounted = true;
    if (isSessionEnded) return;

    // Pre-request/prime camera & microphone on top-level origin so Opera GX & Chromium
    // allow iframe device capture without silently blocking or denying video feeds
    const primeMediaDevices = async () => {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          testStream.getTracks().forEach((track) => track.stop());
        } catch (err: any) {
          console.warn('Initial camera prime check:', err);
        }
      }
    };

    const initJitsi = () => {
      if (!isMounted || !videoMountRef.current || isSessionEnded) return;
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
            disableInitialGUM: false,
            prejoinConfig: { enabled: false },
            prejoinPageEnabled: false,
            skipPrejoin: true,
            disableDeepLinking: true,
            enableClosePage: false,
            enableWelcomePage: false,
            enableLobby: false,
            requireDisplayName: false,
            p2p: { enabled: true },
            // Clean video conferencing: strip out confusing internal backgrounds and filmstrip modals
            disableFilmstrip: true,
            filmStripOnly: false,
            DISABLE_VIDEO_BACKGROUND: true,
            SETTINGS_SECTIONS: [],
            toolbarButtons: [
              'microphone',
              'camera',
              'tileview',
              'chat',
              'fodeviceselection',
              'fullscreen',
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DEFAULT_LOGO_URL: '',
            JITSI_WATERMARK_LINK: '',
            BRAND_WATERMARK_LINK: '',
            GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            TOOLBAR_ALWAYS_VISIBLE: false,
            DEFAULT_BACKGROUND: '#060E1C',
            SETTINGS_SECTIONS: [],
            FILM_STRIP_MAX_HEIGHT: 0,
            DISABLE_VIDEO_BACKGROUND: true,
            ENABLE_FEEDBACK_ANIMATION: false,
          },
        });

        jitsiApiRef.current = api;
        setIsJitsiReady(true);

        // Explicitly inject device and camera/mic permissions onto the iframe
        setTimeout(() => {
          if (videoMountRef.current) {
            const iframe = videoMountRef.current.querySelector('iframe');
            if (iframe) {
              iframe.setAttribute(
                'allow',
                'camera *; microphone *; display-capture *; autoplay *; clipboard-write *; fullscreen *'
              );
            }
          }
        }, 150);

        api.addEventListeners({
          audioMuteStatusChanged: (e: any) => setMicEnabled(!e.muted),
          videoMuteStatusChanged: (e: any) => setCameraEnabled(!e.muted),
          videoConferenceJoined: () => {
            api.executeCommand('setDisplayName', userName);
            // Ensure camera & mic start active automatically
            setTimeout(() => {
              try {
                if (typeof api.isVideoMuted === 'function') {
                  api.isVideoMuted().then((muted: boolean) => {
                    if (muted) api.executeCommand('toggleVideo');
                    setCameraEnabled(!muted);
                  }).catch(() => {});
                }
                if (typeof api.isAudioMuted === 'function') {
                  api.isAudioMuted().then((muted: boolean) => {
                    if (muted) api.executeCommand('toggleAudio');
                    setMicEnabled(!muted);
                  }).catch(() => {});
                }
              } catch (_) {}
            }, 800);
          },
          videoConferenceLeft: () => {
            try { api.dispose(); } catch (_) {}
            jitsiApiRef.current = null;
            if (videoMountRef.current) {
              videoMountRef.current.innerHTML = '';
            }
            setIsSessionEnded(true);
          },
          readyToClose: () => {
            try { api.dispose(); } catch (_) {}
            jitsiApiRef.current = null;
            if (videoMountRef.current) {
              videoMountRef.current.innerHTML = '';
            }
            setIsSessionEnded(true);
          },
        });
      } catch (err) {
        console.warn('Jitsi External API mount error:', err);
      }
    };

    const scriptId = `webrtc-script-${currentDomain.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const existingScript = document.getElementById(scriptId);

    if (existingScript && (window as any).JitsiMeetExternalAPI) {
      void primeMediaDevices().finally(() => {
        if (isMounted) initJitsi();
      });
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://${currentDomain}/external_api.js`;
      script.async = true;
      script.onload = () => {
        if (isMounted) {
          void primeMediaDevices().finally(() => {
            if (isMounted) initJitsi();
          });
        }
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
  }, [cleanRoom, currentDomain, userName, isSessionEnded]);

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
      .on('broadcast', { event: 'share-youtube' }, ({ payload }) => {
        if (payload?.videoId) {
          setSharedYoutubeId(payload.videoId);
          setPresentationMode('youtube');
          setIsToolsOpen(false);
        }
      })
      .on('broadcast', { event: 'stop-youtube' }, () => {
        setSharedYoutubeId(null);
        setPresentationMode('none');
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

  // Native Browser Screen Sharing (W3C getDisplayMedia - 100% Free, NO Paywalls)
  const handleToggleScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setScreenShareNotification('Screen share finished. Returned to Edvoura Classroom.');
      setTimeout(() => setScreenShareNotification(null), 4000);
      try { window.focus(); } catch (_) {}
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
          setScreenShareNotification('Screen share finished. Returned to Edvoura Classroom.');
          setTimeout(() => setScreenShareNotification(null), 4000);
          try { window.focus(); } catch (_) {}
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

  const handleToggleCamera = async () => {
    if (jitsiApiRef.current) {
      try {
        if (!cameraEnabled && navigator.mediaDevices?.getUserMedia) {
          try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true });
            s.getTracks().forEach((t) => t.stop());
          } catch (_) {}
        }
        jitsiApiRef.current.executeCommand('toggleVideo');
      } catch (_) {}
    } else {
      setCameraEnabled(!cameraEnabled);
    }
  };

  const handleStartShareYouTube = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      alert('Please enter a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=...)');
      return;
    }
    setSharedYoutubeId(videoId);
    setPresentationMode('youtube');
    setShowYoutubeModal(false);
    setIsToolsOpen(false);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'share-youtube',
        payload: { videoId },
      });
    }

    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand('startShareVideo', `https://www.youtube.com/watch?v=${videoId}`);
      } catch (_) {}
    }
  };

  const handleStopShareYouTube = () => {
    setSharedYoutubeId(null);
    setPresentationMode('none');

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'stop-youtube',
        payload: {},
      });
    }

    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand('stopShareVideo');
      } catch (_) {}
    }
  };

  // Clean Leave Session: Destroys Jitsi completely and shows Edvoura Branded Summary screen
  const handleLeaveCall = () => {
    if (confirm('End the active classroom session?')) {
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
      setIsSessionEnded(true);
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
    setSelectedPdfUrl(null);
    setSelectedPdfTitle('');
    setSharedYoutubeId(null);
    if (channelRef.current && role === 'tutor') {
      channelRef.current.send({ type: 'broadcast', event: 'close-pdf' });
      channelRef.current.send({ type: 'broadcast', event: 'present-mode', payload: { mode: 'none' } });
      channelRef.current.send({ type: 'broadcast', event: 'stop-youtube', payload: {} });
    }
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand('stopShareVideo');
      } catch (_) {}
    }
  };

  const handlePresentAiWorksheet = (_worksheetText: string, title: string) => {
    setSelectedPdfTitle(title);
    setPresentationMode('whiteboard');
    if (channelRef.current && role === 'tutor') {
      channelRef.current.send({ type: 'broadcast', event: 'present-mode', payload: { mode: 'whiteboard' } });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070D18] text-white">
        <Loader2 className="h-12 w-12 animate-spin text-yellow mb-4" />
        <h3 className="text-xl font-black">Launching Edvoura Classroom Stage...</h3>
        <p className="text-xs text-white/60 mt-1">Connecting 100% widescreen video and interactive studio</p>
      </div>
    );
  }

  // ============================================================
  // EDVOURA BRANDED SESSION COMPLETED SCREEN
  // Replaces the viewport when tutor or student leaves the session.
  // 100% eliminates any third-party donation or fairmeeting exit pages!
  // ============================================================
  if (isSessionEnded) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070D18] text-white flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="bg-[#0f172a] border-[3px] border-yellow/60 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-[10px_10px_0px_#060E1C] space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-yellow border-2 border-dark mx-auto flex items-center justify-center shadow-[3px_3px_0px_#060E1C]">
            <CheckCircle2 className="w-10 h-10 text-dark" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Lesson Session Completed
            </h2>
            <p className="text-sm font-bold text-white/70">
              {studentDisplayName ? `Session with ${studentDisplayName}` : lesson?.title || 'Interactive Lesson'}
            </p>
            <p className="text-xs text-white/50">
              Whiteboard notes, completed exercises, and participation data have been logged to your dashboard.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => {
                window.location.replace(role === 'tutor' ? '/dash/tutor/roster' : '/dash/student');
              }}
              className="w-full h-12 bg-yellow hover:bg-yellow/90 border-2 border-dark text-dark font-black text-sm uppercase shadow-[3px_3px_0px_#060E1C] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to {role === 'tutor' ? 'Tutor Dashboard' : 'Student Hub'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setIsSessionEnded(false);
                setIsJitsiReady(false);
              }}
              className="w-full h-11 border-2 border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rejoin Classroom Session</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 w-screen h-screen bg-[#070D18] flex flex-col overflow-hidden select-none font-sans"
    >
      {/* Global CSS to strip any third-party watermarks/logos */}
      <style jsx global>{`
        .watermark, .leftwatermark, .rightwatermark, [class*="watermark"], .jitsi-icon {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
      `}</style>

      {/* ============================================================
          TOP STATUS BAR (CLEAN, MINIMALIST - NO GOOGLE MEET BUTTON)
          ============================================================ */}
      <header className="h-14 px-4 sm:px-6 bg-[#070D18]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-30 shrink-0">
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

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Worksheet Studio trigger */}
          {role === 'tutor' && (
            <button
              onClick={() => setShowAiWorksheetModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow/40 bg-yellow hover:bg-yellow/90 text-dark text-xs font-black shadow-md transition-all active:scale-95"
              title="Open AI Worksheet Studio (Canva Style)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Worksheets</span>
            </button>
          )}

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

      {/* Screen Share Notification Toast */}
      {screenShareNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600 border border-emerald-400 rounded-full text-white text-xs font-black shadow-2xl animate-in fade-in slide-in-from-top-2">
          {screenShareNotification}
        </div>
      )}

      {/* ============================================================
          MAIN BODY: GOOGLE MEET PRESENTATION ARCHITECTURE
          - When presenting: Worksheet / Whiteboard fills MAIN STAGE.
          - Right video column is COLLAPSIBLE via 1-click toggle!
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

                {role === 'tutor' && (
                  <button
                    onClick={() => setShowYoutubeModal(true)}
                    className={`px-2.5 py-1 rounded-lg border-[2px] border-dark text-xs font-black flex items-center gap-1.5 transition-all ${
                      presentationMode === 'youtube'
                        ? 'bg-rose-600 text-white shadow-[1px_1px_0px_#060E1C]'
                        : 'bg-white text-dark/70 hover:bg-slate-50'
                    }`}
                    title="Share YouTube Video for Pupils"
                  >
                    <Video className="w-3.5 h-3.5 text-rose-600" />
                    <span>YouTube</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setPresentationMode('vrlab');
                    if (channelRef.current && role === 'tutor') {
                      channelRef.current.send({
                        type: 'broadcast',
                        event: 'present-mode',
                        payload: { mode: 'vrlab' },
                      });
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg border-[2px] border-dark text-xs font-black flex items-center gap-1.5 transition-all ${
                    presentationMode === 'vrlab'
                      ? 'bg-purple-600 text-white shadow-[1px_1px_0px_#060E1C]'
                      : 'bg-white text-dark/70 hover:bg-slate-50'
                  }`}
                  title="Launch 3D & Virtual Reality Lab (Solar System, Heart, Geometry, Volcano)"
                >
                  <Glasses className="w-3.5 h-3.5 text-purple-600" />
                  <span>3D/VR Lab</span>
                </button>

                {/* Collapsed Video Quick Expand Pill */}
                {isVideoCollapsed && (
                  <button
                    onClick={() => setIsVideoCollapsed(false)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white hover:bg-slate-800 border-[2px] border-dark rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all"
                    title="Expand Live Video Strip"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show Video</span>
                  </button>
                )}

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

              {presentationMode === 'youtube' && sharedYoutubeId && (
                <div className="w-full h-full flex flex-col bg-slate-950 relative">
                  {/* Header */}
                  <div className="h-10 px-4 bg-slate-900 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Streaming Educational YouTube Video
                      </span>
                    </div>

                    {role === 'tutor' && (
                      <button
                        onClick={handleStopShareYouTube}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                        title="Stop sharing YouTube video"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Stop Video</span>
                      </button>
                    )}
                  </div>

                  {/* YouTube Player */}
                  <div className="flex-1 w-full relative bg-black flex items-center justify-center p-2 sm:p-4">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${sharedYoutubeId}?autoplay=1&enablejsapi=1&rel=0`}
                      title="Edvoura Shared Educational Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full max-w-5xl rounded-2xl shadow-2xl border-2 border-white/10"
                    />
                  </div>
                </div>
              )}

              {presentationMode === 'vrlab' && (
                <VRLabExplorer
                  lessonId={lessonId}
                  role={role}
                />
              )}

              {/* Floating Arrow Tab to slide Video back out when tucked in */}
              {isVideoCollapsed && (
                <button
                  onClick={() => setIsVideoCollapsed(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1 py-3 px-1.5 bg-slate-900/95 hover:bg-slate-900 text-white border-y-[2.5px] border-l-[2.5px] border-dark rounded-l-2xl shadow-[-4px_4px_0px_#060E1C] font-black text-xs transition-all active:scale-95 group cursor-pointer"
                  title="Slide open video & polls sidebar"
                >
                  <ChevronLeft className="w-4 h-4 text-yellow group-hover:-translate-x-0.5 transition-transform" />
                  <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-wider uppercase font-black py-1 text-slate-200">
                    Video & Polls
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ==========================================================
            STAGE 2: PARTICIPANTS LIVE VIDEO FRAME
            - When presenting: Shrinks into compact right frame (Collapsible with 1-click arrow!)
            - When NOT presenting: Fills 100% of the stage!
            - PERSISTENT DOM MOUNT: WebRTC call never disconnects!
            ========================================================== */}
        <div
          className={`h-full relative flex flex-col bg-black transition-all duration-300 ease-in-out ${
            presentationMode !== 'none'
              ? isVideoCollapsed
                ? 'w-0 overflow-hidden border-none shrink-0'
                : 'w-[220px] sm:w-[250px] xl:w-[275px] border-l-[3px] border-dark shrink-0 z-20'
              : 'flex-1 min-w-0'
          }`}
        >
          {/* Left-edge Tuck-In Arrow Toggle on the divider border */}
          {presentationMode !== 'none' && !isVideoCollapsed && (
            <button
              onClick={() => setIsVideoCollapsed(true)}
              className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-40 w-7 h-12 bg-slate-900 text-yellow border-[2px] border-dark rounded-l-xl shadow-[-2px_2px_0px_#060E1C] flex items-center justify-center transition-all hover:bg-slate-800 active:scale-95 group cursor-pointer"
              title="Tuck video in to give whiteboard full width"
            >
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Header Strip when shrunk with Collapse Button */}
          {presentationMode !== 'none' && !isVideoCollapsed && (
            <div className="h-9 px-3 bg-[#0d1527] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-white/90">Live Video</span>
              </div>

              {/* Collapse/Tuck-In Button */}
              <button
                onClick={() => setIsVideoCollapsed(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white/90 hover:text-white text-[10px] font-black uppercase transition-all"
                title="Tuck video in to maximize whiteboard"
              >
                <ChevronRight className="w-3 h-3 text-yellow" />
                <span>Tuck In</span>
              </button>
            </div>
          )}

          {/* Persistent Live Video Mount (Never drops WebRTC connection) */}
          <div className="flex-1 w-full relative bg-black flex items-center justify-center overflow-hidden">
            <div ref={videoMountRef} className="w-full h-full" />

            {!isJitsiReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060E1C] z-20 text-white gap-3 p-4 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-yellow" />
                <p className="text-xs font-black uppercase tracking-wider text-white">
                  Connecting Live Classroom Video...
                </p>
                <p className="text-[11px] text-white/50 font-semibold max-w-xs">
                  Initializing camera and microphone stream
                </p>
              </div>
            )}

            {isJitsiReady && !cameraEnabled && (
              <div className="absolute top-3 left-3 z-30">
                <button
                  onClick={handleToggleCamera}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/95 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wide shadow-lg border border-white/20 transition-all active:scale-95 animate-pulse cursor-pointer"
                  title="Click to turn on camera"
                >
                  <VideoOff className="w-3.5 h-3.5" />
                  <span>Camera Off • Tap to Turn On</span>
                </button>
              </div>
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
              {/* AI Worksheet Studio Banner */}
              {role === 'tutor' && (
                <div className="p-4 rounded-2xl border-[2.5px] border-dark bg-yellow/25 space-y-2 shadow-[2px_2px_0px_#060E1C]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-dark" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-dark">AI Worksheet Studio (Canva Style)</h4>
                  </div>
                  <p className="text-xs text-dark/80 font-bold leading-relaxed">
                    Generate instant printable and whiteboard-ready worksheets with math drills, exercises, and answer keys.
                  </p>
                  <Button
                    onClick={() => {
                      setIsToolsOpen(false);
                      setShowAiWorksheetModal(true);
                    }}
                    className="w-full bg-yellow border-[2px] border-dark text-dark font-black text-xs uppercase shadow-[2px_2px_0px_#060E1C] active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    <span>Open AI Worksheet Studio</span>
                  </Button>
                </div>
              )}

              {/* 3D & Virtual Reality Lab Card */}
              <div className="p-4 rounded-2xl border-[2.5px] border-dark bg-purple-50 space-y-2 shadow-[2px_2px_0px_#060E1C]">
                <div className="flex items-center gap-2">
                  <Glasses className="w-4 h-4 text-purple-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-dark">
                    3D &amp; Virtual Reality Lab
                  </h4>
                </div>
                <p className="text-xs text-dark/80 font-bold leading-relaxed">
                  Interactive 3D Solar System, Human Heart &amp; Anatomy, 3D Geometry, and Earth Volcano with Gyroscope &amp; VR support.
                </p>
                <Button
                  onClick={() => {
                    setIsToolsOpen(false);
                    setPresentationMode('vrlab');
                    if (channelRef.current && role === 'tutor') {
                      channelRef.current.send({
                        type: 'broadcast',
                        event: 'present-mode',
                        payload: { mode: 'vrlab' },
                      });
                    }
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white border-[2px] border-dark font-black text-xs uppercase shadow-[2px_2px_0px_#060E1C] active:scale-95"
                >
                  <Glasses className="w-4 h-4 mr-1.5" />
                  <span>Launch 3D / VR Lab Stage</span>
                </Button>
              </div>

              {/* Share YouTube Educational Video Card */}
              {role === 'tutor' && (
                <div className="p-4 rounded-2xl border-[2.5px] border-dark bg-rose-50 space-y-2 shadow-[2px_2px_0px_#060E1C]">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-dark">
                      Share Educational Video (YouTube)
                    </h4>
                  </div>
                  <p className="text-xs text-dark/80 font-bold leading-relaxed">
                    Stream synchronized educational YouTube songs, phonics, and math videos directly to your pupil.
                  </p>
                  <Button
                    onClick={() => {
                      setIsToolsOpen(false);
                      setShowYoutubeModal(true);
                    }}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white border-[2px] border-dark font-black text-xs uppercase shadow-[2px_2px_0px_#060E1C] active:scale-95"
                  >
                    <Video className="w-4 h-4 mr-1.5" />
                    <span>Share YouTube Video</span>
                  </Button>
                </div>
              )}

              {/* Quick Launch Whiteboard */}
              <div className="p-4 rounded-2xl border-[2px] border-dark bg-yellow/10 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-dark">Interactive Whiteboard</h4>
                <p className="text-xs text-dark/70 font-semibold leading-relaxed">
                  Open full-screen digital canvas to draw, solve math equations, and write notes.
                </p>
                <Button
                  onClick={handleToggleWhiteboard}
                  className="w-full bg-white hover:bg-slate-50 border-[2px] border-dark text-dark font-black text-xs uppercase shadow-[2px_2px_0px_#060E1C] active:scale-95"
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
                    No preloaded worksheets found. Upload above or generate with AI.
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
          FLOATING MINIMALIST BOTTOM DOCK (CLEAN - NO GOOGLE MEET BUTTON)
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

          {/* Whiteboard Toggle (Opens Whiteboard in Main Stage) */}
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

          {/* Red Hangup Button (Only Hangup Button on Screen - Triggers Branded Exit Screen) */}
          <button
            onClick={handleLeaveCall}
            className="w-14 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
            title="End classroom session"
            aria-label="End Classroom Session"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* AI Worksheet Studio Modal (Canva Style) */}
      <AIWorksheetModal
        isOpen={showAiWorksheetModal}
        onClose={() => setShowAiWorksheetModal(false)}
        onPresentOnWhiteboard={handlePresentAiWorksheet}
        pupilName={studentDisplayName || 'Pupil'}
        gradeLevel={gradeDisplayName}
        lessonId={lessonId}
      />

      {/* Share YouTube Video Modal */}
      {showYoutubeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border-[3px] border-dark rounded-3xl shadow-[8px_8px_0px_#060E1C] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-[2.5px] border-dark">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-100 rounded-xl border border-dark">
                  <Video className="w-5 h-5 text-rose-600" />
                </span>
                <div>
                  <h3 className="font-black text-sm uppercase text-dark">Share Educational YouTube Video</h3>
                  <p className="text-[11px] font-semibold text-dark/60">Stream synchronized video directly to your student</p>
                </div>
              </div>
              <button
                onClick={() => setShowYoutubeModal(false)}
                className="w-8 h-8 rounded-xl border-[2px] border-dark bg-white hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-dark">Paste YouTube Video Link</label>
              <input
                type="text"
                value={youtubeInputUrl}
                onChange={(e) => setYoutubeInputUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full h-11 px-3.5 bg-slate-50 border-[2px] border-dark rounded-xl font-bold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-dark"
              />
            </div>

            {/* Quick Educational Recommendations */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase text-dark/60">Or Select a Popular Topic:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: 'Multiplication Tables Song', id: 'ScMzIvxBSi4' },
                  { title: 'Phonics & Reading Drill', id: 'ffeZXPtTGC4' },
                  { title: 'Solar System & Planets', id: 'libKVRa01L8' },
                  { title: 'States of Matter Science', id: 'wclY8mW-UoQ' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setYoutubeInputUrl(`https://www.youtube.com/watch?v=${item.id}`)}
                    className="text-left p-2 rounded-xl border-[1.5px] border-dark/30 hover:border-dark hover:bg-yellow/20 text-xs font-bold text-dark transition-all truncate cursor-pointer"
                  >
                    🎵 {item.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t-[2px] border-dark/15">
              <Button
                variant="outline"
                onClick={() => setShowYoutubeModal(false)}
                className="border-[2px] border-dark font-black text-xs uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleStartShareYouTube(youtubeInputUrl)}
                className="bg-rose-600 hover:bg-rose-700 text-white border-[2px] border-dark font-black text-xs uppercase shadow-[2px_2px_0px_#060E1C] active:scale-95"
              >
                Start Sharing Video
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
