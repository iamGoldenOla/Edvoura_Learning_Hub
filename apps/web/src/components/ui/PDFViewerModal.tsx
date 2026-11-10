'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Volume2, Play, Pause, Square, BookOpen, CheckCircle2, FileText, Award, FileCode } from 'lucide-react';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null | undefined;
  title: string;
  unlockedWeek?: number;
  subjectId?: string;
}

function cleanTitle(raw: string) {
  if (!raw) return 'Document Viewer';
  // Remove Unix timestamp prefixes like 1794342445335-1-
  const cleaned = raw.replace(/^\d+[-_]/, '').replace(/\.{2,}/g, '.');
  return cleaned;
}

export function PDFViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
  unlockedWeek = 36, // Default fully unlocked for all user uploads
  subjectId = 'general',
}: PDFViewerModalProps) {
  const [viewEngine, setViewEngine] = useState<'document' | 'summary'>('document');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen || !pdfUrl) return null;

  const displayTitle = cleanTitle(title);
  const isDocx = pdfUrl.toLowerCase().includes('.doc') || pdfUrl.toLowerCase().includes('.docx');
  const isImage = /\.(png|jpe?g|webp|gif)$/i.test(pdfUrl);

  const fullAbsoluteUrl = typeof window !== 'undefined'
    ? (pdfUrl.startsWith('http') ? pdfUrl : `${window.location.origin}${pdfUrl}`)
    : pdfUrl;

  // For Word documents (.doc / .docx), use Office Online Embed or Google Docs Viewer
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullAbsoluteUrl)}`;
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullAbsoluteUrl)}&embedded=true`;

  const streamSrc = isDocx
    ? officeViewerUrl
    : isImage
    ? fullAbsoluteUrl
    : pdfUrl.startsWith('http')
    ? `${pdfUrl}#toolbar=1&navpanes=0&view=FitH`
    : `/api/pdf-stream?pdfUrl=${encodeURIComponent(pdfUrl)}&unlockedWeek=${unlockedWeek}&subjectId=${encodeURIComponent(subjectId)}#page=1&toolbar=1`;

  function handlePlayAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`Viewing document: ${displayTitle}.`);
    utterance.rate = 1.0;
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }

  function handlePauseAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }

  function handleStopAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/70 p-2 sm:p-4 backdrop-blur-md">
      <div className="relative flex h-[95vh] w-full max-w-7xl flex-col rounded-[24px] border-[4px] border-dark bg-white shadow-[12px_12px_0px_#060E1C] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="flex flex-col gap-2.5 border-b-[3px] border-dark bg-yellow/20 p-3 sm:p-4 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg border-[1.5px] border-dark bg-yellow text-[10px] font-black uppercase tracking-wider text-dark shadow-[1px_1px_0px_#060E1C]">
                  {isDocx ? 'Word Document' : isImage ? 'Image Worksheet' : 'PDF Document'}
                </span>
                <span className="px-2 py-0.5 rounded-lg border border-dark bg-white text-[10px] font-black uppercase text-dark">
                  Student Learning Resource
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-dark truncate leading-tight uppercase tracking-tight">
                {displayTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={fullAbsoluteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 sm:h-10 px-3 sm:px-4 items-center justify-center gap-1.5 rounded-xl border-[2px] border-dark bg-white hover:bg-yellow text-dark text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all"
                title="Open raw file in separate full tab"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Open in New Tab</span>
              </a>
              
              <a
                href={fullAbsoluteUrl}
                download
                className="inline-flex h-9 sm:h-10 px-3 sm:px-4 items-center justify-center gap-1.5 rounded-xl border-[2px] border-dark bg-dark hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all"
                title="Download original file"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
              
              <button
                type="button"
                onClick={() => { handleStopAudio(); onClose(); }}
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-[2px] border-dark bg-rose-500 hover:bg-rose-600 text-white shadow-[2px_2px_0px_#060E1C] active:scale-95 cursor-pointer transition-all"
                aria-label="Close document viewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Master Document View Container */}
        <div className="flex-1 bg-slate-900 relative min-h-0 overflow-hidden flex flex-col">
          {isImage ? (
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fullAbsoluteUrl}
                alt={displayTitle}
                className="max-h-full max-w-full object-contain rounded-xl border-2 border-white/20 shadow-2xl"
              />
            </div>
          ) : isDocx ? (
            <div className="flex-1 w-full h-full relative flex flex-col bg-white">
              <iframe
                src={streamSrc}
                className="w-full flex-1 border-none min-h-[500px]"
                title={displayTitle}
                allow="fullscreen"
              />
              <div className="p-3 bg-slate-100 border-t border-dark/20 flex items-center justify-between text-xs font-bold text-dark/70">
                <span>Microsoft Word Document (.docx/.doc) preview</span>
                <div className="flex items-center gap-3">
                  <a
                    href={googleViewerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Open with Google Docs Viewer
                  </a>
                  <a
                    href={fullAbsoluteUrl}
                    download
                    className="px-3 py-1 bg-yellow border-[2px] border-dark rounded-lg text-dark font-black uppercase text-[10px]"
                  >
                    Download Original
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full h-full relative bg-white">
              <iframe
                key={`${pdfUrl}-${unlockedWeek}`}
                src={streamSrc}
                className="w-full h-full border-none bg-white shadow-inner"
                title={displayTitle}
                allow="fullscreen"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
