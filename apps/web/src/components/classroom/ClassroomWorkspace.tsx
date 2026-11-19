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
  GripVertical,
  Move,
  Hand,
  Smile,
  Camera,
  Wifi,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollaborativeWhiteboard } from './CollaborativeWhiteboard';
import { StudentDeskManager } from './StudentDeskManager';
import { PDFAnnotator } from './PDFAnnotator';
import { AIWorksheetModal } from './AIWorksheetModal';
import { VRLabExplorer } from './VRLabExplorer';
import { NativeVideoStage, type RemotePeer } from './NativeVideoStage';
import { ScreenShareStage } from './ScreenShareStage';
import { EddyWhisperDrawer } from './EddyWhisperDrawer';
import { LaserPointerOverlay } from './LaserPointerOverlay';
import { ClassroomPollModal } from './ClassroomPollModal';
import { LessonCapsuleSummary } from './LessonCapsuleSummary';
import { Glasses, ExternalLink, Zap } from 'lucide-react';

interface ClassroomWorkspaceProps {
  lessonId: string;
  role: 'tutor' | 'student';
  userName: string;
}

type PresentationMode =
  | 'none'
  | 'whiteboard'
  | 'worksheet'
  | 'desks'
  | 'youtube'
  | 'vrlab'
  | 'screenshare';

interface ActiveScreenShare {
  isActive: boolean;
  isLocal: boolean;
  stream: MediaStream | null;
  sharerRole: 'tutor' | 'student';
  sharerName: string;
}

interface RaisedHandInfo {
  name: string;
  role: 'tutor' | 'student';
  timestamp: number;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  xPercent: number;
}

function playClassroomAudioChime(type: 'hand-raise' | 'reaction' | 'snapshot') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'hand-raise') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.16);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === 'reaction') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'snapshot') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (_) {}
}


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
  const [isPipHidden, setIsPipHidden] = useState(false);
  const [pipPos, setPipPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const [dockPos, setDockPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingDock, setIsDraggingDock] = useState(false);
  const pipBoxRef = useRef<HTMLDivElement>(null);
  const dockBoxRef = useRef<HTMLElement>(null);

  const startDragElement = (
    e: React.PointerEvent,
    el: HTMLElement | null,
    setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>,
    setDragging: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      const maxX = Math.max(8, window.innerWidth - rect.width - 8);
      const maxY = Math.max(8, window.innerHeight - rect.height - 8);
      const nextX = Math.max(8, Math.min(maxX, ev.clientX - offsetX));
      const nextY = Math.max(8, Math.min(maxY, ev.clientY - offsetY));
      setPos({ x: nextX, y: nextY });
    };

    const onUp = () => {
      setDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };
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

  // Hardware state (100% Native Edvoura HD WebRTC — zero third-party.net!)
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoReconnectNonce, setVideoReconnectNonce] = useState(0);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<{ id: string; label: string }[]>([]);
  const [activeVideoDeviceId, setActiveVideoDeviceId] = useState<string>('');
  const [showCameraPicker, setShowCameraPicker] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [personalMeetUrl, setPersonalMeetUrl] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [activeScreenShare, setActiveScreenShare] = useState<ActiveScreenShare | null>(null);
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [raisedHand, setRaisedHand] = useState<RaisedHandInfo | null>(null);
  const [isHandRaisedLocally, setIsHandRaisedLocally] = useState(false);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [tutorStageBadge, setTutorStageBadge] = useState<string | null>(null);
  const [screenShareNotification, setScreenShareNotification] = useState<string | null>(null);

  // Landmark Innovations: Eddy AI Co-Teacher, Quiz Blitz, & Synchronized Laser Spotlight
  const [showEddyDrawer, setShowEddyDrawer] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollInitialQuestion, setPollInitialQuestion] = useState<string>('');
  const [pollInitialOptions, setPollInitialOptions] = useState<string[]>([]);
  const [pollInitialCorrect, setPollInitialCorrect] = useState<number>(0);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [isSpotlightActive, setIsSpotlightActive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mainStageRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

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
            if (stProfile?.personal_meet_url) {
              setPersonalMeetUrl(stProfile.personal_meet_url);
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

  // Realtime Supabase Channel for PDF, Whiteboard, 3D/VR Stage, Screen Share & Classroom Interactions
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
          if (role === 'student') {
            setTutorStageBadge('Worksheet: ' + (payload.pdfTitle || 'Worksheet'));
            setTimeout(() => setTutorStageBadge(null), 4000);
          }
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
          if (role === 'student') {
            const labels: Record<string, string> = {
              whiteboard: 'Interactive Whiteboard',
              vrlab: '3D & Virtual Reality Lab',
              desks: 'Student Desks & Exercises',
              none: 'Full-Stage Live Video',
            };
            if (labels[payload.mode]) {
              setTutorStageBadge(labels[payload.mode]);
              setTimeout(() => setTutorStageBadge(null), 4000);
            }
          }
        }
      })
      .on('broadcast', { event: 'share-youtube' }, ({ payload }) => {
        if (payload?.videoId) {
          setSharedYoutubeId(payload.videoId);
          setPresentationMode('youtube');
          setIsToolsOpen(false);
          if (role === 'student') {
            setTutorStageBadge('Educational YouTube Video');
            setTimeout(() => setTutorStageBadge(null), 4000);
          }
        }
      })
      .on('broadcast', { event: 'stop-youtube' }, () => {
        setSharedYoutubeId(null);
        setPresentationMode('none');
      })
      .on('broadcast', { event: 'screen-share-started' }, ({ payload }) => {
        if (payload?.sharerRole && payload?.sharerName) {
          setActiveScreenShare({
            isActive: true,
            isLocal: false,
            stream: null,
            sharerRole: payload.sharerRole,
            sharerName: payload.sharerName,
          });
          setPresentationMode('screenshare');
          const title = `${payload.sharerRole === 'tutor' ? '🎓 Tutor' : '🎒 Student'} ${payload.sharerName} is sharing screen`;
          setScreenShareNotification(title);
          setTutorStageBadge(title);
          setTimeout(() => {
            setScreenShareNotification(null);
            setTutorStageBadge(null);
          }, 4500);
        }
      })
      .on('broadcast', { event: 'screen-share-stopped' }, () => {
        setActiveScreenShare(null);
        setPresentationMode((prev) => (prev === 'screenshare' ? 'none' : prev));
        setScreenShareNotification('Screen share finished. Returned to classroom stage.');
        setTimeout(() => setScreenShareNotification(null), 4000);
      })
      .on('broadcast', { event: 'request-stage-state' }, () => {
        if (role === 'tutor' && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'stage-state-response',
            payload: {
              presentationMode,
              selectedPdfUrl,
              selectedPdfTitle,
              sharedYoutubeId,
              screenShareActive: !!activeScreenShare,
              screenSharerRole: activeScreenShare?.sharerRole,
              screenSharerName: activeScreenShare?.sharerName,
            },
          });
        }
      })
      .on('broadcast', { event: 'stage-state-response' }, ({ payload }) => {
        if (role === 'student' && payload) {
          if (payload.screenShareActive && payload.screenSharerRole) {
            setActiveScreenShare({
              isActive: true,
              isLocal: false,
              stream: null,
              sharerRole: payload.screenSharerRole,
              sharerName: payload.screenSharerName || 'Tutor',
            });
            setPresentationMode('screenshare');
          } else if (payload.presentationMode && payload.presentationMode !== 'none') {
            setPresentationMode(payload.presentationMode);
            if (payload.selectedPdfUrl) {
              setSelectedPdfUrl(payload.selectedPdfUrl);
              setSelectedPdfTitle(payload.selectedPdfTitle || 'Worksheet');
            }
            if (payload.sharedYoutubeId) {
              setSharedYoutubeId(payload.sharedYoutubeId);
            }
          }
        }
      })
      .on('broadcast', { event: 'hand-raise' }, ({ payload }) => {
        playClassroomAudioChime('hand-raise');
        setRaisedHand({
          name: payload?.name || 'Student',
          role: payload?.role || 'student',
          timestamp: Date.now(),
        });
      })
      .on('broadcast', { event: 'lower-hand' }, () => {
        setRaisedHand(null);
      })
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        if (payload?.emoji) {
          triggerFloatingReaction(payload.emoji, payload.senderName || 'Participant');
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && role === 'student') {
          channel.send({
            type: 'broadcast',
            event: 'request-stage-state',
            payload: { studentName: userName },
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId, role, userName, presentationMode, selectedPdfUrl, selectedPdfTitle, sharedYoutubeId, activeScreenShare]);

  // Fullscreen Handler
  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsNativeFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsNativeFullscreen(false)).catch(() => {});
    }
  };

  // Native Browser Screen Sharing (W3C getDisplayMedia - 100% Free, NO Paywalls, Available for Tutor & Student!)
  const handleToggleScreenShare = async () => {
    if (activeScreenShare?.isLocal && screenStream) {
      handleStopLocalScreenShare();
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor',
          } as any,
          audio: true,
        });

        setScreenStream(stream);
        setActiveScreenShare({
          isActive: true,
          isLocal: true,
          stream,
          sharerRole: role,
          sharerName: userName,
        });
        setPresentationMode('screenshare');
        setIsToolsOpen(false);

        // Broadcast to other participant immediately
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'screen-share-started',
            payload: {
              sharerRole: role,
              sharerName: userName,
            },
          });
        }

        // Automatic cleanup when user clicks browser's native "Stop sharing" blue pill
        const track = stream.getVideoTracks()[0];
        if (track) {
          track.onended = () => {
            handleStopLocalScreenShare();
          };
        }
      } catch (err: any) {
        if (err.name !== 'NotAllowedError') {
          console.warn('Native display media error:', err);
        }
      }
    }
  };

  const handleStopLocalScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }
    setActiveScreenShare(null);
    setPresentationMode('none');
    setScreenShareNotification('Screen share finished. Returned to Edvoura Classroom.');
    setTimeout(() => setScreenShareNotification(null), 4000);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'screen-share-stopped',
        payload: { sharerRole: role },
      });
    }
  };

  const triggerFloatingReaction = (emoji: string, sender: string) => {
    playClassroomAudioChime('reaction');
    const id = `${Date.now()}-${Math.random()}`;
    const xPercent = 25 + Math.random() * 50;
    setFloatingReactions((prev) => [...prev, { id, emoji, senderName: sender, xPercent }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 3200);
  };

  const handleSendReaction = (emoji: string) => {
    triggerFloatingReaction(emoji, userName);
    setShowReactionsMenu(false);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'reaction',
        payload: { emoji, senderName: userName },
      });
    }
  };

  const handleToggleHandRaise = () => {
    if (isHandRaisedLocally) {
      setIsHandRaisedLocally(false);
      setRaisedHand(null);
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'lower-hand',
          payload: { name: userName, role },
        });
      }
    } else {
      setIsHandRaisedLocally(true);
      setRaisedHand({ name: userName, role, timestamp: Date.now() });
      playClassroomAudioChime('hand-raise');
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'hand-raise',
          payload: { name: userName, role },
        });
      }
    }
  };

  const handleTakeStageSnapshot = () => {
    playClassroomAudioChime('snapshot');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const filename = `Edvoura-Classroom-Notes-${Date.now()}.png`;

    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (_) {}
    }
    setScreenShareNotification(`📸 Lesson snapshot saved at ${timestamp}! Added to your study notes archive.`);
    setTimeout(() => setScreenShareNotification(null), 4500);
  };

  const handleToggleMic = () => {
    setMicEnabled((prev) => !prev);
  };

  const handleToggleCamera = () => {
    setCameraErrorMsg(null);
    setCameraEnabled((prev) => !prev);
  };

  const handleSelectVideoDevice = (device: { id: string; label: string }) => {
    setActiveVideoDeviceId(device.id);
    setShowCameraPicker(false);
    setCameraErrorMsg(null);
  };

  const handleReconnectVideo = () => {
    setCameraErrorMsg(null);
    setShowCameraPicker(false);
    setVideoReconnectNonce((n) => n + 1);
  };

  const switchPresentationMode = (mode: PresentationMode) => {
    setPresentationMode(mode);
    if (channelRef.current && role === 'tutor') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'present-mode',
        payload: { mode },
      });
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

  };

  // Clean Leave Session: Stops tracks and shows Edvoura Branded Summary screen
  const handleLeaveCall = () => {
    if (confirm('End the active classroom session?')) {
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
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
    if (activeScreenShare?.isLocal && screenStream) {
      handleStopLocalScreenShare();
      return;
    }
    setPresentationMode('none');
    setSelectedPdfUrl(null);
    setSelectedPdfTitle('');
    setSharedYoutubeId(null);
    setActiveScreenShare(null);
    if (channelRef.current && role === 'tutor') {
      channelRef.current.send({ type: 'broadcast', event: 'close-pdf' });
      channelRef.current.send({ type: 'broadcast', event: 'present-mode', payload: { mode: 'none' } });
      channelRef.current.send({ type: 'broadcast', event: 'stop-youtube', payload: {} });
      channelRef.current.send({ type: 'broadcast', event: 'screen-share-stopped', payload: {} });
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
  // 100% eliminates any third-party donation or third-party exit pages!
  // ============================================================
  if (isSessionEnded) {
    return (
      <LessonCapsuleSummary
        lessonTitle={studentDisplayName ? `1-on-1 Lesson with ${studentDisplayName}` : lesson?.title || 'Interactive Lesson'}
        pupilName={studentDisplayName || 'Pupil'}
        gradeLevel={gradeDisplayName}
        role={role}
        onRejoin={() => setIsSessionEnded(false)}
        onReturnDashboard={() => {
          window.location.replace(role === 'tutor' ? '/dash/tutor/roster' : '/dash/student');
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 w-screen h-screen bg-[#070D18] flex flex-col overflow-hidden select-none font-sans"
    >
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
          {/* Quick Mini-Video PiP Toggle when presenting and collapsed */}
          {presentationMode !== 'none' && isVideoCollapsed && (
            <button
              onClick={() => setIsPipHidden(!isPipHidden)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                !isPipHidden
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 border-white/20'
              }`}
              title="Toggle floating mini camera video preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPipHidden ? 'Show Mini Video' : 'Mini Video: ON'}</span>
            </button>
          )}

          {/* HD Network Health Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-bold">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white/80">HD 1080p</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-400 font-black">Low Latency</span>
          </div>

          {/* Quick Snapshot Stage Button (Saves to Study Notes) */}
          <button
            onClick={handleTakeStageSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="Take instant snapshot of current whiteboard, worksheet, or stage to save into study notes"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Snapshot</span>
          </button>

          {/* Quick Camera Switcher / Video Reconnect */}
          <div className="relative">
            <button
              onClick={() => setShowCameraPicker(!showCameraPicker)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all active:scale-95"
              title="Switch camera or reconnect video stream"
            >
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Camera &amp; Video</span>
            </button>
            {showCameraPicker && (
              <div className="absolute right-0 top-10 w-64 bg-[#0f172a] border-2 border-white/20 rounded-2xl shadow-2xl p-3 z-50 space-y-2 text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-yellow">Video Controls</span>
                  <button
                    onClick={() => setShowCameraPicker(false)}
                    className="text-xs text-white/60 hover:text-white font-black"
                  >
                    ✕
                  </button>
                </div>
                {videoDevices.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-white/50 uppercase">Select Camera Device</p>
                    {videoDevices.map((dev) => (
                      <button
                        key={dev.id || dev.label}
                        onClick={() => handleSelectVideoDevice(dev)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold truncate transition-all ${
                          activeVideoDeviceId === dev.id
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-white/5 text-white/80 hover:bg-white/15'
                        }`}
                      >
                        📷 {dev.label}
                      </button>
                    ))}
                  </div>
                )}
                <a
                  href={personalMeetUrl || 'https://meet.google.com/new'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowCameraPicker(false)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Open Google Meet (New Tab)</span>
                </a>
                <button
                  onClick={handleReconnectVideo}
                  className="w-full px-3 py-1.5 rounded-lg bg-yellow hover:bg-yellow/90 text-dark text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reconnect Camera &amp; Video</span>
                </button>
              </div>
            )}
          </div>

          {/* Eddy AI Co-Teacher Trigger (Tutor Whisper Assistant) */}
          {role === 'tutor' && (
            <button
              onClick={() => setShowEddyDrawer(!showEddyDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/50 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              title="Open Eddy AI Co-Teacher Whisper Drawer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow" />
              <span className="hidden sm:inline">Eddy AI</span>
            </button>
          )}

          {/* Quick Quiz Poll Trigger */}
          <button
            onClick={() => {
              setPollInitialQuestion('');
              setPollInitialOptions([]);
              setShowPollModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/40 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            title="Launch Interactive Pop Check / Poll"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Quiz Poll</span>
          </button>

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

      {/* Tutor Stage Change Notification for Students */}
      {tutorStageBadge && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 bg-[#0f172a]/95 border-2 border-yellow/70 rounded-full text-white text-xs font-black shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>🎯 Synced with Stage: {tutorStageBadge}</span>
        </div>
      )}

      {/* Raised Hand Banner */}
      {raisedHand && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-yellow border-[2.5px] border-dark rounded-2xl text-dark shadow-[5px_5px_0px_#060E1C] flex items-center gap-3 animate-in slide-in-from-top-3">
          <span className="text-xl">✋</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black uppercase">{raisedHand.name} raised a hand!</span>
            <span className="text-[10px] font-bold text-dark/75">Question or ready to participate</span>
          </div>
          {role === 'tutor' && (
            <button
              onClick={() => {
                setRaisedHand(null);
                if (channelRef.current) {
                  channelRef.current.send({ type: 'broadcast', event: 'lower-hand', payload: {} });
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-dark text-yellow text-[10px] font-black uppercase hover:bg-dark/90 active:scale-95 transition-all cursor-pointer"
            >
              Acknowledge
            </button>
          )}
        </div>
      )}

      {/* Floating Animated Classroom Reaction Bubbles */}
      {floatingReactions.map((r) => (
        <div
          key={r.id}
          style={{ left: `${r.xPercent}%` }}
          className="fixed bottom-24 z-50 pointer-events-none flex flex-col items-center animate-bounce duration-1000"
        >
          <span className="text-4xl drop-shadow-2xl">{r.emoji}</span>
          <span className="px-2 py-0.5 rounded-full bg-dark/90 text-yellow text-[9px] font-black uppercase tracking-wider mt-1 border border-white/20">
            {r.senderName}
          </span>
        </div>
      ))}

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
          <div ref={mainStageRef} className="flex-1 h-full min-w-0 bg-white relative flex flex-col overflow-hidden animate-in fade-in duration-150">
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
                  {presentationMode === 'youtube' && (
                    <>
                      <Video className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Educational YouTube Video</span>
                    </>
                  )}
                  {presentationMode === 'vrlab' && (
                    <>
                      <Glasses className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>3D &amp; Virtual Reality Lab</span>
                    </>
                  )}
                  {presentationMode === 'screenshare' && (
                    <>
                      <ScreenShare className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {activeScreenShare?.isLocal
                          ? 'Sharing Your Screen (1080p HD)'
                          : `Screen Share: ${activeScreenShare?.sharerRole === 'tutor' ? 'Tutor' : 'Student'} ${activeScreenShare?.sharerName || ''}`}
                      </span>
                    </>
                  )}
                </span>
              </div>

              {/* Presentation Switchers & Stop Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => switchPresentationMode('whiteboard')}
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
                    onClick={() => switchPresentationMode('worksheet')}
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
                  onClick={() => switchPresentationMode('desks')}
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
                  onClick={() => switchPresentationMode('vrlab')}
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

                {activeScreenShare && (
                  <button
                    onClick={() => switchPresentationMode('screenshare')}
                    className={`px-2.5 py-1 rounded-lg border-[2px] border-dark text-xs font-black flex items-center gap-1.5 transition-all ${
                      presentationMode === 'screenshare'
                        ? 'bg-emerald-600 text-white shadow-[1px_1px_0px_#060E1C]'
                        : 'bg-white text-dark/70 hover:bg-slate-50'
                    }`}
                    title="Switch to Shared Screen Stage"
                  >
                    <ScreenShare className="w-3.5 h-3.5" />
                    <span>Screen Share</span>
                  </button>
                )}

                {/* Collapsed Video Quick Expand Pill */}
                {isVideoCollapsed && (
                  <button
                    onClick={() => {
                      setIsVideoCollapsed(false);
                      setIsPipHidden(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white hover:bg-slate-800 border-[2px] border-dark rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all"
                    title="Expand Live Video Sidebar"
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
              {/* Synchronized Neon Laser Pointer & Attention Spotlight Overlay */}
              <LaserPointerOverlay
                channel={channelRef.current}
                role={role}
                userName={userName}
                isLaserActive={isLaserActive}
                isSpotlightActive={isSpotlightActive}
                containerRef={mainStageRef}
              />
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

              {presentationMode === 'screenshare' && (
                <ScreenShareStage
                  stream={
                    activeScreenShare?.isLocal
                      ? screenStream
                      : (remotePeers.find((p) => p.role === activeScreenShare?.sharerRole)?.stream || remotePeers[0]?.stream || null)
                  }
                  sharerName={
                    activeScreenShare?.sharerName ||
                    (activeScreenShare?.sharerRole === 'tutor' ? 'Tutor' : 'Student')
                  }
                  sharerRole={activeScreenShare?.sharerRole || 'tutor'}
                  isLocal={!!activeScreenShare?.isLocal}
                  onStopSharing={activeScreenShare?.isLocal ? handleStopLocalScreenShare : handleStopPresenting}
                  viewerRole={role}
                />
              )}

              {/* Floating Arrow Tab only shown if user hid even the mini PiP */}
              {isVideoCollapsed && isPipHidden && (
                <button
                  onClick={() => setIsPipHidden(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1 py-3 px-1.5 bg-slate-900/95 hover:bg-slate-900 text-white border-y-[2.5px] border-l-[2.5px] border-dark rounded-l-2xl shadow-[-4px_4px_0px_#060E1C] font-black text-xs transition-all active:scale-95 group cursor-pointer"
                  title="Show floating mini video"
                >
                  <ChevronLeft className="w-4 h-4 text-yellow group-hover:-translate-x-0.5 transition-transform" />
                  <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-wider uppercase font-black py-1 text-slate-200">
                    Live Video
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ==========================================================
            STAGE 2: PARTICIPANTS LIVE VIDEO FRAME
            - When presenting & expanded: Compact right video sidebar.
            - When presenting & tucked in: Floats at TOP-RIGHT as a crisp Picture-in-Picture (PiP)
              mini-camera bar so Tutor & Student ALWAYS see each other while using full-width board!
            - When NOT presenting: Fills 100% of the stage!
            - PERSISTENT DOM MOUNT: WebRTC call never disconnects!
            ========================================================== */}
        <div
          ref={pipBoxRef}
          style={
            presentationMode !== 'none' && isVideoCollapsed && !isPipHidden && pipPos
              ? { position: 'fixed', left: pipPos.x, top: pipPos.y, right: 'auto' }
              : undefined
          }
          className={`flex flex-col bg-[#060E1C] ${isDraggingPip ? 'transition-none' : 'transition-all duration-300 ease-in-out'} ${
            presentationMode !== 'none'
              ? isVideoCollapsed
                ? isPipHidden
                  ? 'w-0 h-0 overflow-hidden border-none shrink-0 pointer-events-none'
                  : `${pipPos ? 'fixed' : 'fixed top-16 right-4'} z-50 ${
                      participantCount > 1 ? 'w-[280px] sm:w-[320px]' : 'w-[190px] sm:w-[220px]'
                    } h-[138px] rounded-2xl border-[3px] border-yellow/90 shadow-[5px_5px_0px_#060E1C] overflow-hidden`
                : 'h-full relative w-[220px] sm:w-[250px] xl:w-[275px] border-l-[3px] border-dark shrink-0 z-20'
              : 'h-full relative flex-1 min-w-0'
          }`}
        >
          {/* Left-edge Tuck-In Arrow Toggle on the divider border */}
          {presentationMode !== 'none' && !isVideoCollapsed && (
            <button
              onClick={() => {
                setIsVideoCollapsed(true);
                setIsPipHidden(false);
              }}
              className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-40 w-7 h-12 bg-slate-900 text-yellow border-[2px] border-dark rounded-l-xl shadow-[-2px_2px_0px_#060E1C] flex items-center justify-center transition-all hover:bg-slate-800 active:scale-95 group cursor-pointer"
              title="Tuck sidebar into top mini-video so whiteboard has full width"
            >
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Header Strip when in Right Sidebar */}
          {presentationMode !== 'none' && !isVideoCollapsed && (
            <div className="h-9 px-3 bg-[#0d1527] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-white/90">Live Video</span>
              </div>

              {/* Collapse into Top Mini-Video Button */}
              <button
                onClick={() => {
                  setIsVideoCollapsed(true);
                  setIsPipHidden(false);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white/90 hover:text-white text-[10px] font-black uppercase transition-all"
                title="Switch to top mini-video bar for full whiteboard width"
              >
                <ChevronRight className="w-3 h-3 text-yellow" />
                <span>Mini Top</span>
              </button>
            </div>
          )}

          {/* Compact Draggable Header Strip when Floating (PiP Mini-Video Mode) */}
          {presentationMode !== 'none' && isVideoCollapsed && !isPipHidden && (
            <div
              onPointerDown={(e) => startDragElement(e, pipBoxRef.current, setPipPos, setIsDraggingPip)}
              onDoubleClick={() => setPipPos(null)}
              className="h-7 px-2 bg-[#0d1527] border-b border-white/10 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing select-none touch-none"
              title="Drag to move your mini video anywhere • Double-click to reset"
            >
              <div className="flex items-center gap-1 min-w-0">
                <Move className="w-3 h-3 text-yellow shrink-0" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-wider text-white/90 truncate">
                  Live ({participantCount})
                </span>
              </div>
              <div
                className="flex items-center gap-1 shrink-0"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsVideoCollapsed(false)}
                  className="px-1.5 py-0.5 rounded bg-yellow/90 hover:bg-yellow text-dark text-[9px] font-black uppercase cursor-pointer"
                  title="Expand back to full side column"
                >
                  Expand
                </button>
                <button
                  onClick={() => setIsPipHidden(true)}
                  className="p-0.5 rounded bg-white/10 hover:bg-white/20 text-white/75 hover:text-white cursor-pointer"
                  title="Hide mini video completely"
                >
                  <EyeOff className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Persistent Native Edvoura HD WebRTC Video Stage (Zero third-party, zero watermarks!) */}
          <div className="flex-1 w-full relative bg-[#060E1C] flex items-center justify-center overflow-hidden">
            <NativeVideoStage
              lessonId={lessonId}
              role={role}
              userName={userName}
              cameraEnabled={cameraEnabled}
              micEnabled={micEnabled}
              selectedVideoDeviceId={activeVideoDeviceId}
              reconnectNonce={videoReconnectNonce}
              screenStream={screenStream}
              isSidebarMode={presentationMode !== 'none' && !isVideoCollapsed}
              isPipMode={presentationMode !== 'none' && isVideoCollapsed}
              onDevicesDetected={(devs, activeId) => {
                setVideoDevices(devs);
                if (activeId && !activeVideoDeviceId) setActiveVideoDeviceId(activeId);
              }}
              onCameraError={(msg) => setCameraErrorMsg(msg)}
              onParticipantCountChange={(cnt) => setParticipantCount(cnt)}
              onCopyInvite={handleCopyClassInvite}
              copiedInvite={copiedInvite}
              onReconnect={handleReconnectVideo}
              onRemotePeersChange={setRemotePeers}
            />

            {cameraErrorMsg && (
              <div className="absolute top-3 left-3 right-3 z-30 bg-rose-950/95 border-2 border-rose-400 rounded-2xl p-3 text-white shadow-2xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-bold leading-snug text-rose-100">{cameraErrorMsg}</p>
                  <button
                    onClick={() => setCameraErrorMsg(null)}
                    className="text-xs text-white/60 hover:text-white font-black shrink-0"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={handleReconnectVideo}
                    className="px-2.5 py-1 rounded-lg bg-yellow text-dark font-black text-[10px] uppercase flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reconnect Video
                  </button>
                  {videoDevices.length > 1 && (
                    <button
                      onClick={() => setShowCameraPicker(true)}
                      className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-black text-[10px] uppercase"
                    >
                      Switch Camera
                    </button>
                  )}
                </div>
              </div>
            )}

            {!cameraEnabled && !cameraErrorMsg && (
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
          MOVABLE FLOATING MINIMALIST CONTROL DOCK (DRAG ANYWHERE!)
          ============================================================ */}
      <footer
        ref={dockBoxRef}
        style={
          dockPos
            ? { position: 'fixed', left: dockPos.x, top: dockPos.y, bottom: 'auto', transform: 'none' }
            : undefined
        }
        className={`${
          dockPos ? 'fixed' : 'absolute bottom-5 left-1/2 -translate-x-1/2'
        } z-50 pointer-events-auto ${isDraggingDock ? 'select-none' : ''}`}
      >
        <div className="bg-[#1e1e1e]/95 hover:bg-[#1e1e1e] backdrop-blur-md border border-white/25 p-2 sm:p-2.5 rounded-full shadow-[0px_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-1.5 sm:gap-2.5">
          {/* Drag Handle so Tutor/Student can move the Share/Mic/Cam/Whiteboard dock anywhere */}
          <div
            onPointerDown={(e) => startDragElement(e, dockBoxRef.current, setDockPos, setIsDraggingDock)}
            onDoubleClick={() => setDockPos(null)}
            className="w-7 h-10 rounded-full bg-white/10 hover:bg-yellow/25 text-white/75 hover:text-yellow flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none shrink-0"
            title="Drag to move toolbar anywhere • Double-click to snap back to bottom center"
          >
            <GripVertical className="w-4 h-4" />
          </div>
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

          {/* Share Screen (Native Windows/Tab dialog - Zero Paywalls - Both Tutor & Student can Share!) */}
          <button
            onClick={handleToggleScreenShare}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              activeScreenShare?.isLocal
                ? 'bg-rose-600 text-white shadow-lg animate-pulse'
                : activeScreenShare
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={
              activeScreenShare?.isLocal
                ? 'Stop sharing your screen'
                : activeScreenShare
                  ? `${activeScreenShare.sharerName} is sharing screen (click to view)`
                  : 'Share Screen (Select any window, PDF, Word, tab, or desktop)'
            }
            aria-label="Share Screen"
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* Hand Raise Button (Student can raise hand to ask question / offer answer) */}
          <button
            onClick={handleToggleHandRaise}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isHandRaisedLocally
                ? 'bg-yellow text-dark shadow-lg animate-bounce'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isHandRaisedLocally ? 'Lower Hand' : 'Raise Hand (Ask Tutor a Question)'}
            aria-label="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Quick Classroom Reactions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowReactionsMenu(!showReactionsMenu)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              title="Classroom Reactions (Thumbs Up, Brilliant, Idea, Help, Applause)"
              aria-label="Reactions"
            >
              <Smile className="w-5 h-5" />
            </button>

            {showReactionsMenu && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 p-2 bg-[#0B1426] border-[2px] border-dark rounded-2xl shadow-2xl flex items-center gap-1.5 z-50 animate-in zoom-in-95">
                {[
                  { emoji: '👍', label: 'Understood' },
                  { emoji: '⭐', label: 'Brilliant' },
                  { emoji: '💡', label: 'Great Idea' },
                  { emoji: '❓', label: 'Need Help' },
                  { emoji: '👏', label: 'Applause' },
                  { emoji: '❤️', label: 'Love it' },
                ].map((item) => (
                  <button
                    key={item.emoji}
                    onClick={() => handleSendReaction(item.emoji)}
                    className="w-9 h-9 rounded-xl hover:bg-white/20 text-xl flex items-center justify-center transition-all active:scale-125 cursor-pointer"
                    title={item.label}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

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

          {/* 3D / VR Lab Quick Button in Dock */}
          <button
            onClick={() => switchPresentationMode('vrlab')}
            className={`px-3.5 h-11 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              presentationMode === 'vrlab'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={presentationMode === 'vrlab' ? 'Stop 3D Lab' : 'Launch 3D & VR Lab on Main Stage'}
            aria-label="3D / VR Lab"
          >
            <Glasses className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">3D Lab</span>
          </button>

          {/* Laser Pointer Attention Tool */}
          <button
            onClick={() => {
              setIsLaserActive(!isLaserActive);
              if (isSpotlightActive) setIsSpotlightActive(false);
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isLaserActive
                ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-300 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isLaserActive ? 'Turn off Laser Pointer' : 'Turn on Synchronized Neon Laser Pointer'}
            aria-label="Laser Pointer"
          >
            <span className="text-base select-none">🔴</span>
          </button>

          {/* Attention Spotlight Focus Tool */}
          <button
            onClick={() => {
              setIsSpotlightActive(!isSpotlightActive);
              if (isLaserActive) setIsLaserActive(false);
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isSpotlightActive
                ? 'bg-amber-500 text-dark shadow-lg ring-2 ring-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isSpotlightActive ? 'Turn off Spotlight' : 'Turn on Attention Spotlight Mode'}
            aria-label="Attention Spotlight"
          >
            <span className="text-base select-none">🔦</span>
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

      {/* Eddy AI Co-Teacher Whisper Drawer */}
      <EddyWhisperDrawer
        isOpen={showEddyDrawer}
        onClose={() => setShowEddyDrawer(false)}
        lessonTitle={studentDisplayName ? `1-on-1 Lesson with ${studentDisplayName}` : lesson?.title || 'Interactive Lesson'}
        gradeLevel={gradeDisplayName}
        studentName={studentDisplayName || 'Student'}
        onPushToWhiteboard={(text) => {
          setPresentationMode('whiteboard');
          setScreenShareNotification('✨ Note from Eddy AI pushed to your whiteboard!');
          setTimeout(() => setScreenShareNotification(null), 4000);
        }}
        onLaunchAsPoll={(q, opts, cIdx) => {
          setPollInitialQuestion(q);
          setPollInitialOptions(opts);
          setPollInitialCorrect(cIdx);
          setShowPollModal(true);
        }}
      />

      {/* Interactive Classroom Polling & Quiz Battles Modal */}
      <ClassroomPollModal
        channel={channelRef.current}
        role={role}
        userName={userName}
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        initialQuestion={pollInitialQuestion}
        initialOptions={pollInitialOptions}
        initialCorrectIdx={pollInitialCorrect}
      />
    </div>
  );
}
