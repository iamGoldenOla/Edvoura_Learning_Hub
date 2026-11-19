'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Video,
  VideoOff,
  MicOff,
  Loader2,
  RotateCcw,
  Share2,
  Check,
  Users,
} from 'lucide-react';

export interface RemotePeer {
  peerId: string;
  name: string;
  role: 'tutor' | 'student';
  stream: MediaStream | null;
  camOn: boolean;
  micOn: boolean;
  connectionState: string;
}

export interface NativeVideoStageProps {
  lessonId: string;
  role: 'tutor' | 'student';
  userName: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
  selectedVideoDeviceId?: string;
  reconnectNonce: number;
  screenStream: MediaStream | null;
  isSidebarMode: boolean;
  isPipMode?: boolean;
  onDevicesDetected?: (devices: { id: string; label: string }[], activeId: string) => void;
  onCameraError?: (message: string | null) => void;
  onParticipantCountChange?: (count: number) => void;
  onCopyInvite?: () => void;
  copiedInvite?: boolean;
  onReconnect?: () => void;
  onRemotePeersChange?: (peers: RemotePeer[]) => void;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
];

const isVirtualCameraLabel = (label: string) =>
  /obs|virtual|snap|manycam|droidcam|iriun|nvidia broadcast|xsplit|chroma/i.test(label);

function VideoTile({
  stream,
  label,
  badge,
  muted = false,
  mirror = false,
  camOn = true,
  micOn = true,
  compact = false,
  isScreenShare = false,
}: {
  stream: MediaStream | null;
  label: string;
  badge?: string;
  muted?: boolean;
  mirror?: boolean;
  camOn?: boolean;
  micOn?: boolean;
  compact?: boolean;
  isScreenShare?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream && el.srcObject !== stream) {
      el.srcObject = stream;
      el.play().catch(() => {});
    }
  }, [stream]);

  const hasLiveVideoTrack =
    camOn && !!stream && stream.getVideoTracks().some((t) => t.readyState === 'live' && t.enabled);

  const initials = (label || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#0c162b] border-2 border-white/15 flex items-center justify-center shadow-xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full ${
          isScreenShare ? 'object-contain bg-black' : 'object-cover'
        } transition-opacity duration-200 ${
          mirror && !isScreenShare ? '-scale-x-100' : ''
        } ${hasLiveVideoTrack ? 'opacity-100' : 'opacity-0'}`}
      />

      {!hasLiveVideoTrack && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0f1c36] to-[#070d18] text-white p-3 text-center">
          <div
            className={`${
              compact ? 'w-12 h-12 text-base' : 'w-20 h-20 text-2xl'
            } rounded-full bg-yellow text-dark border-[3px] border-dark font-black flex items-center justify-center shadow-[3px_3px_0px_#060E1C]`}
          >
            {initials || 'ED'}
          </div>
          <p className="text-xs font-black text-white/90 truncate max-w-full">{label}</p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white/70">
            <VideoOff className="w-3 h-3 text-rose-400" />
            Camera Off
          </span>
        </div>
      )}

      {/* Bottom Name & Audio Badge */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md border border-white/15 text-white text-[11px] font-black truncate max-w-[80%]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="truncate">{label}</span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded bg-yellow/90 text-dark text-[9px] font-black uppercase shrink-0">
              {badge}
            </span>
          )}
        </div>
        {!micOn && (
          <span className="p-1.5 rounded-lg bg-rose-600/90 text-white border border-white/20 shrink-0">
            <MicOff className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
}

export function NativeVideoStage({
  lessonId,
  role,
  userName,
  cameraEnabled,
  micEnabled,
  selectedVideoDeviceId,
  reconnectNonce,
  screenStream,
  isSidebarMode,
  isPipMode = false,
  onDevicesDetected,
  onCameraError,
  onParticipantCountChange,
  onCopyInvite,
  copiedInvite,
  onReconnect,
  onRemotePeersChange,
}: NativeVideoStageProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);

  const peerIdRef = useRef<string>(
    `${role}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
  );
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const channelRef = useRef<any>(null);
  const cameraEnabledRef = useRef(cameraEnabled);
  const micEnabledRef = useRef(micEnabled);

  cameraEnabledRef.current = cameraEnabled;
  micEnabledRef.current = micEnabled;
  screenStreamRef.current = screenStream;

  const updateRemotePeer = useCallback((peerId: string, updater: (prev: RemotePeer | undefined) => RemotePeer | null) => {
    setRemotePeers((prev) => {
      const idx = prev.findIndex((p) => p.peerId === peerId);
      const current = idx >= 0 ? prev[idx] : undefined;
      const next = updater(current);
      if (next === null) {
        return idx >= 0 ? prev.filter((p) => p.peerId !== peerId) : prev;
      }
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = next;
        return copy;
      }
      return [...prev, next];
    });
  }, []);

  useEffect(() => {
    onParticipantCountChange?.(1 + remotePeers.length);
    onRemotePeersChange?.(remotePeers);
  }, [remotePeers, onParticipantCountChange, onRemotePeersChange]);

  // 1. Acquire real local webcam + mic immediately (zero third-party iframe, zero virtual background!)
  useEffect(() => {
    let active = true;
    setInitializing(true);

    const startLocalMedia = async () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        onCameraError?.('Your browser does not support camera/microphone capture. Use Chrome, Edge, Opera, or Safari.');
        setInitializing(false);
        return;
      }

      // Stop any previous local tracks before acquiring new device
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }

      try {
        // Choose preferred physical webcam if no explicit device was picked
        let targetDeviceId = selectedVideoDeviceId || '';
        if (!targetDeviceId && navigator.mediaDevices.enumerateDevices) {
          try {
            const existing = await navigator.mediaDevices.enumerateDevices();
            const cams = existing.filter((d) => d.kind === 'videoinput' && d.deviceId);
            const physical = cams.find((c) => c.label && !isVirtualCameraLabel(c.label));
            if (physical) targetDeviceId = physical.deviceId;
          } catch (_) {}
        }

        const videoConstraint: MediaTrackConstraints | boolean = targetDeviceId
          ? { deviceId: { ideal: targetDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' };

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraint,
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });
        } catch (firstErr: any) {
          // Retry with simple constraints or audio-only if camera busy/missing
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          } catch {
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            } catch {
              stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
              onCameraError?.('Camera unavailable (audio connected). Check if another app is using your webcam, then click Reconnect Video.');
            }
          }
          if (firstErr?.name === 'NotReadableError') {
            console.warn('Primary camera busy, fell back cleanly.');
          }
        }

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // Sync initial mute toggles
        stream.getVideoTracks().forEach((t) => {
          t.enabled = cameraEnabledRef.current;
        });
        stream.getAudioTracks().forEach((t) => {
          t.enabled = micEnabledRef.current;
        });

        localStreamRef.current = stream;
        setLocalStream(stream);
        if (stream.getVideoTracks().length > 0) {
          onCameraError?.(null);
        }

        // Populate device switcher with real labels now that permission is granted
        if (navigator.mediaDevices.enumerateDevices) {
          const allDevices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
          const cams = allDevices
            .filter((d) => d.kind === 'videoinput')
            .map((d, i) => ({
              id: d.deviceId,
              label: d.label || `Camera ${i + 1}`,
            }));
          const activeVideoTrack = stream.getVideoTracks()[0];
          const activeId = activeVideoTrack?.getSettings?.().deviceId || cams[0]?.id || '';
          onDevicesDetected?.(cams, activeId);
        }

        // Replace tracks on any already-open peer connections (e.g. when user switches camera mid-lesson)
        const activeVideoTrack = screenStreamRef.current?.getVideoTracks()[0] || stream.getVideoTracks()[0] || null;
        const activeAudioTrack = stream.getAudioTracks()[0] || null;
        pcsRef.current.forEach((pc) => {
          const senders = pc.getSenders();
          if (activeVideoTrack) {
            const vSender = senders.find((s) => s.track?.kind === 'video');
            if (vSender) {
              void vSender.replaceTrack(activeVideoTrack).catch(() => {});
            } else {
              try { pc.addTrack(activeVideoTrack, stream); } catch (_) {}
            }
          }
          if (activeAudioTrack) {
            const aSender = senders.find((s) => s.track?.kind === 'audio');
            if (aSender) {
              void aSender.replaceTrack(activeAudioTrack).catch(() => {});
            } else {
              try { pc.addTrack(activeAudioTrack, stream); } catch (_) {}
            }
          }
        });
      } catch (err: any) {
        if (!active) return;
        console.warn('Local media acquisition error:', err);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          onCameraError?.(
            'Camera/microphone permission is blocked. Click the lock/camera icon in your browser address bar, set Camera & Mic to Allow, then click Reconnect Video.'
          );
        } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
          onCameraError?.(
            'Your webcam is currently in use by another app or browser tab. Close the other video tab/app and click Reconnect Video.'
          );
        } else {
          onCameraError?.(err?.message || 'Could not access camera. Click Reconnect Video to retry.');
        }
      } finally {
        if (active) setInitializing(false);
      }
    };

    void startLocalMedia();

    return () => {
      active = false;
    };
  }, [selectedVideoDeviceId, reconnectNonce]);

  // Cleanup local stream on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

  // 2. Toggle Camera & Mic tracks live without dropping connection
  useEffect(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach((t) => {
        t.enabled = cameraEnabled;
      });
      stream.getAudioTracks().forEach((t) => {
        t.enabled = micEnabled;
      });
    }
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'media-state',
        payload: { from: peerIdRef.current, camOn: cameraEnabled, micOn: micEnabled },
      });
    }
  }, [cameraEnabled, micEnabled]);

  // 3. Swap outgoing WebRTC video & audio tracks when tutor or student shares screen (so peer sees & hears shared screen live!)
  useEffect(() => {
    const targetVideoTrack =
      screenStream?.getVideoTracks()[0] || localStreamRef.current?.getVideoTracks()[0] || null;

    if (targetVideoTrack) {
      pcsRef.current.forEach((pc) => {
        const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (videoSender) {
          void videoSender.replaceTrack(targetVideoTrack).catch(() => {});
        }
      });
    }

    // Handle screen audio if user shared tab/window audio
    const screenAudioTrack = screenStream?.getAudioTracks()[0];
    if (screenAudioTrack) {
      pcsRef.current.forEach((pc) => {
        const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
        if (audioSender) {
          void audioSender.replaceTrack(screenAudioTrack).catch(() => {});
        }
      });
    } else if (localStreamRef.current?.getAudioTracks()[0]) {
      const micTrack = localStreamRef.current.getAudioTracks()[0];
      pcsRef.current.forEach((pc) => {
        const audioSender = pc.getSenders().find((s) => s.track?.kind === 'audio');
        if (audioSender && audioSender.track !== micTrack) {
          void audioSender.replaceTrack(micTrack).catch(() => {});
        }
      });
    }
  }, [screenStream]);

  // 4. Native WebRTC Signaling over Supabase Realtime (`webrtc:${lessonId}`)
  useEffect(() => {
    const supabase = createClient();
    const myId = peerIdRef.current;

    const closePeer = (remoteId: string) => {
      const existing = pcsRef.current.get(remoteId);
      if (existing) {
        try { existing.close(); } catch (_) {}
        pcsRef.current.delete(remoteId);
      }
      pendingIceRef.current.delete(remoteId);
      updateRemotePeer(remoteId, () => null);
    };

    const getOrCreatePC = (remoteId: string, remoteName: string, remoteRole: 'tutor' | 'student') => {
      const existing = pcsRef.current.get(remoteId);
      if (existing && existing.connectionState !== 'closed' && existing.connectionState !== 'failed') {
        return existing;
      }
      if (existing) {
        try { existing.close(); } catch (_) {}
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcsRef.current.set(remoteId, pc);

      // Attach current local tracks (or screen share video track if currently sharing)
      const stream = localStreamRef.current;
      if (stream) {
        const videoTrack = screenStreamRef.current?.getVideoTracks()[0] || stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        if (videoTrack) pc.addTrack(videoTrack, stream);
        if (audioTrack) pc.addTrack(audioTrack, stream);
      }

      const remoteStream = new MediaStream();
      updateRemotePeer(remoteId, (prev) => ({
        peerId: remoteId,
        name: remoteName || prev?.name || (remoteRole === 'tutor' ? 'Tutor' : 'Student'),
        role: remoteRole || prev?.role || 'student',
        stream: remoteStream,
        camOn: prev?.camOn ?? true,
        micOn: prev?.micOn ?? true,
        connectionState: 'connecting',
      }));

      pc.ontrack = (event) => {
        const incomingStream = event.streams?.[0];
        if (incomingStream) {
          incomingStream.getTracks().forEach((t) => {
            if (!remoteStream.getTracks().some((existingTrack) => existingTrack.id === t.id)) {
              remoteStream.addTrack(t);
            }
          });
        } else if (event.track) {
          remoteStream.addTrack(event.track);
        }
        // Trigger React re-render with live stream
        updateRemotePeer(remoteId, (prev) =>
          prev ? { ...prev, stream: new MediaStream(remoteStream.getTracks()) } : null
        );
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'rtc-ice',
            payload: { from: myId, to: remoteId, candidate: event.candidate.toJSON() },
          });
        }
      };

      pc.onconnectionstatechange = () => {
        const st = pc.connectionState;
        updateRemotePeer(remoteId, (prev) => (prev ? { ...prev, connectionState: st } : null));
        if (st === 'failed') {
          try { pc.restartIce(); } catch (_) {}
        } else if (st === 'closed') {
          closePeer(remoteId);
        }
      };

      return pc;
    };

    const flushPendingIce = async (remoteId: string, pc: RTCPeerConnection) => {
      const queued = pendingIceRef.current.get(remoteId) || [];
      pendingIceRef.current.delete(remoteId);
      for (const cand of queued) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (_) {}
      }
    };

    const initiateOffer = async (remoteId: string, remoteName: string, remoteRole: 'tutor' | 'student') => {
      try {
        const pc = getOrCreatePC(remoteId, remoteName, remoteRole);
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);
        channelRef.current?.send({
          type: 'broadcast',
          event: 'rtc-offer',
          payload: {
            from: myId,
            to: remoteId,
            sdp: pc.localDescription,
            name: userName,
            role,
          },
        });
      } catch (err) {
        console.warn('WebRTC createOffer warning:', err);
      }
    };

    const channel = supabase.channel(`webrtc:${lessonId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'peer-hello' }, ({ payload }) => {
        if (!payload?.from || payload.from === myId) return;
        // Reply so newcomer knows we exist
        channel.send({
          type: 'broadcast',
          event: 'peer-welcome',
          payload: {
            from: myId,
            to: payload.from,
            name: userName,
            role,
            camOn: cameraEnabledRef.current,
            micOn: micEnabledRef.current,
          },
        });
        // Deterministic initiator rule avoids SDP glare
        if (myId > payload.from) {
          void initiateOffer(payload.from, payload.name, payload.role);
        }
      })
      .on('broadcast', { event: 'peer-welcome' }, ({ payload }) => {
        if (!payload?.from || payload.to !== myId) return;
        if (myId > payload.from) {
          void initiateOffer(payload.from, payload.name, payload.role);
        }
      })
      .on('broadcast', { event: 'rtc-offer' }, async ({ payload }) => {
        if (!payload?.from || payload.to !== myId || !payload.sdp) return;
        try {
          const pc = getOrCreatePC(payload.from, payload.name, payload.role);
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          await flushPendingIce(payload.from, pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({
            type: 'broadcast',
            event: 'rtc-answer',
            payload: { from: myId, to: payload.from, sdp: pc.localDescription },
          });
        } catch (err) {
          console.warn('WebRTC handleOffer warning:', err);
        }
      })
      .on('broadcast', { event: 'rtc-answer' }, async ({ payload }) => {
        if (!payload?.from || payload.to !== myId || !payload.sdp) return;
        const pc = pcsRef.current.get(payload.from);
        if (!pc) return;
        try {
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            await flushPendingIce(payload.from, pc);
          }
        } catch (err) {
          console.warn('WebRTC handleAnswer warning:', err);
        }
      })
      .on('broadcast', { event: 'rtc-ice' }, async ({ payload }) => {
        if (!payload?.from || payload.to !== myId || !payload.candidate) return;
        const pc = pcsRef.current.get(payload.from);
        if (pc && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (_) {}
        } else {
          const list = pendingIceRef.current.get(payload.from) || [];
          list.push(payload.candidate);
          pendingIceRef.current.set(payload.from, list);
        }
      })
      .on('broadcast', { event: 'media-state' }, ({ payload }) => {
        if (!payload?.from) return;
        updateRemotePeer(payload.from, (prev) =>
          prev
            ? {
                ...prev,
                camOn: typeof payload.camOn === 'boolean' ? payload.camOn : prev.camOn,
                micOn: typeof payload.micOn === 'boolean' ? payload.micOn : prev.micOn,
              }
            : null
        );
      })
      .on('broadcast', { event: 'peer-bye' }, ({ payload }) => {
        if (payload?.from) closePeer(payload.from);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'peer-hello',
            payload: { from: myId, name: userName, role },
          });
        }
      });

    channelRef.current = channel;

    const handleBeforeUnload = () => {
      channel.send({ type: 'broadcast', event: 'peer-bye', payload: { from: myId } });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      try {
        channel.send({ type: 'broadcast', event: 'peer-bye', payload: { from: myId } });
      } catch (_) {}
      pcsRef.current.forEach((pc) => {
        try { pc.close(); } catch (_) {}
      });
      pcsRef.current.clear();
      pendingIceRef.current.clear();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [lessonId, role, userName, reconnectNonce, updateRemotePeer]);

  // Re-announce once localStream finishes initializing so peers immediately receive tracks
  useEffect(() => {
    if (localStream && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'peer-hello',
        payload: { from: peerIdRef.current, name: userName, role },
      });
    }
  }, [localStream, userName, role]);

  if (initializing) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#060E1C] text-white gap-3 p-4 text-center">
        <Loader2 className="w-9 h-9 animate-spin text-yellow" />
        <p className="text-xs font-black uppercase tracking-wider">Starting Edvoura HD Camera...</p>
        <p className="text-[11px] text-white/55 font-semibold max-w-xs">
          Zero third-party watermarks — connecting directly to your webcam
        </p>
      </div>
    );
  }

  // FLOATING TOP PICTURE-IN-PICTURE MINI-STRIP (when sidebar is tucked in for 100% full-width board!)
  if (isPipMode) {
    return (
      <div className="w-full h-full bg-[#060E1C] p-1.5 flex items-center gap-1.5 overflow-hidden">
        {remotePeers.slice(0, 2).map((peer) => (
          <div key={peer.peerId} className="flex-1 h-full min-w-0">
            <VideoTile
              stream={peer.stream}
              label={peer.name}
              camOn={peer.camOn}
              micOn={peer.micOn}
              compact
            />
          </div>
        ))}
        <div className="flex-1 h-full min-w-0">
          <VideoTile
            stream={localStream}
            label="You"
            muted
            mirror={!screenStream}
            camOn={cameraEnabled}
            micOn={micEnabled}
            compact
          />
        </div>
      </div>
    );
  }

  // SIDEBAR STACKED MODE (next to Whiteboard / 3D VR Lab / Worksheet)
  if (isSidebarMode) {
    return (
      <div className="w-full h-full bg-[#060E1C] p-2 flex flex-col gap-2 overflow-y-auto">
        {remotePeers.map((peer) => (
          <div key={peer.peerId} className="flex-1 min-h-[155px]">
            <VideoTile
              stream={peer.stream}
              label={peer.name}
              badge={peer.role}
              camOn={peer.camOn}
              micOn={peer.micOn}
              compact
            />
          </div>
        ))}

        <div className="flex-1 min-h-[155px]">
          <VideoTile
            stream={localStream}
            label={`${userName} (You)`}
            badge={role}
            muted
            mirror={!screenStream}
            camOn={cameraEnabled}
            micOn={micEnabled}
            compact
          />
        </div>

        {remotePeers.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center space-y-2 shrink-0">
            <p className="text-[10px] font-bold text-white/70 flex items-center justify-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-yellow" />
              Waiting for {role === 'tutor' ? 'student' : 'tutor'} to join...
            </p>
            {role === 'tutor' && onCopyInvite && (
              <button
                onClick={onCopyInvite}
                className="w-full py-1.5 px-2 rounded-lg bg-yellow hover:bg-yellow/90 text-dark font-black text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                {copiedInvite ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                <span>{copiedInvite ? 'Invite Copied!' : 'Copy Student Link'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // FULL-STAGE VIDEO MODE (100% HD Widescreen)
  return (
    <div className="w-full h-full bg-[#060E1C] p-3 sm:p-5 pb-24 flex flex-col gap-3">
      {/* Subtle Waiting / Connected Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-black text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Edvoura HD Live Video</span>
          <span className="text-white/50">•</span>
          <span className="text-yellow">
            {remotePeers.length > 0
              ? `${1 + remotePeers.length} Connected`
              : `Waiting for ${role === 'tutor' ? 'student' : 'tutor'}...`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {role === 'tutor' && onCopyInvite && (
            <button
              onClick={onCopyInvite}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow hover:bg-yellow/90 text-dark text-[11px] font-black transition-all active:scale-95 cursor-pointer"
            >
              {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedInvite ? 'Student Link Copied!' : 'Copy Student Invite Link'}</span>
            </button>
          )}
          {onReconnect && (
            <button
              onClick={onReconnect}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-[11px] font-bold transition-all cursor-pointer"
              title="Refresh camera and peer connection"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Refresh Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Responsive HD Video Grid */}
      <div
        className={`flex-1 min-h-0 grid gap-3 sm:gap-4 ${
          remotePeers.length === 0
            ? 'grid-cols-1 max-w-5xl w-full mx-auto'
            : remotePeers.length === 1
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {remotePeers.map((peer) => (
          <div key={peer.peerId} className="w-full h-full min-h-[240px]">
            <VideoTile
              stream={peer.stream}
              label={peer.name}
              badge={peer.role}
              camOn={peer.camOn}
              micOn={peer.micOn}
            />
          </div>
        ))}

        <div className="w-full h-full min-h-[240px]">
          <VideoTile
            stream={localStream}
            label={`${userName} (You)`}
            badge={role}
            muted
            mirror={!screenStream}
            camOn={cameraEnabled}
            micOn={micEnabled}
          />
        </div>
      </div>
    </div>
  );
}
