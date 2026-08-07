'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Volume2, Play, Pause, Square, Layers } from 'lucide-react';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null | undefined;
  title: string;
}

export function PDFViewerModal({ isOpen, onClose, pdfUrl, title }: PDFViewerModalProps) {
  const [viewEngine, setViewEngine] = useState<'google' | 'native'>('google');
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

  const fullAbsoluteUrl = typeof window !== 'undefined'
    ? (pdfUrl.startsWith('http') ? pdfUrl : `${window.location.origin}${pdfUrl}`)
    : pdfUrl;

  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullAbsoluteUrl)}&embedded=true`;
  const iframeSrc = viewEngine === 'google' ? googleViewerUrl : `${pdfUrl}#toolbar=0`;

  function handlePlayAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`Lesson Note Document: ${title}. Use the zoom buttons or download option to read the full pages.`);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/60 p-2 sm:p-4 backdrop-blur-sm">
      <div className="relative flex h-[92vh] sm:h-[85vh] w-full max-w-5xl flex-col rounded-[20px] sm:rounded-[24px] border-[3px] sm:border-[4px] border-dark bg-white shadow-[8px_8px_0px_#060E1C] sm:shadow-[12px_12px_0px_#060E1C] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex flex-col gap-2.5 border-b-[3px] sm:border-b-[4px] border-dark bg-yellow/20 p-3.5 sm:p-5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-black text-dark truncate leading-tight uppercase tracking-tight">
                {title}
              </h2>
              <p className="text-[9px] sm:text-xs font-bold text-dark/60 tracking-wider uppercase mt-0.5">
                Official Curriculum PDF Reader
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 sm:h-10 px-2.5 sm:px-4 items-center justify-center gap-1.5 rounded-xl border-[2px] border-dark bg-white hover:bg-yellow text-dark text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] active:scale-95"
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">New Tab</span>
              </a>
              
              <a
                href={pdfUrl}
                download
                className="inline-flex h-8 sm:h-10 px-2.5 sm:px-4 items-center justify-center gap-1.5 rounded-xl border-[2px] border-dark bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] active:scale-95"
                title="Download File"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
              
              <button
                type="button"
                onClick={() => { handleStopAudio(); onClose(); }}
                className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-[2px] border-dark bg-rose-500 hover:bg-rose-600 text-white shadow-[2px_2px_0px_#060E1C] active:scale-95"
                aria-label="Close document viewer"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Viewer Mode & Audio Controls Subbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-dark/10">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewEngine('google')}
                className={`px-2.5 py-1 rounded-lg border-[1.5px] border-dark text-[10px] font-black uppercase tracking-wider transition-all ${
                  viewEngine === 'google'
                    ? 'bg-dark text-white shadow-[1.5px_1.5px_0px_#F5C518]'
                    : 'bg-white text-dark shadow-[1.5px_1.5px_0px_#060E1C]'
                }`}
              >
                <Layers className="h-3 w-3 inline mr-1" />
                Mobile Render Engine
              </button>

              <button
                type="button"
                onClick={() => setViewEngine('native')}
                className={`px-2.5 py-1 rounded-lg border-[1.5px] border-dark text-[10px] font-black uppercase tracking-wider transition-all ${
                  viewEngine === 'native'
                    ? 'bg-dark text-white shadow-[1.5px_1.5px_0px_#F5C518]'
                    : 'bg-white text-dark shadow-[1.5px_1.5px_0px_#060E1C]'
                }`}
              >
                Direct Engine
              </button>
            </div>

            {/* Built-in Speech Synthesis Reader */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-dark/70 hidden xs:inline-flex items-center gap-1">
                <Volume2 className="h-3.5 w-3.5 text-dark" /> Reader:
              </span>
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-yellow px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark shadow-[1.5px_1.5px_0px_#060E1C]"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{isPaused ? 'Resume' : 'Listen'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseAudio}
                  className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-amber-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark shadow-[1.5px_1.5px_0px_#060E1C]"
                >
                  <Pause className="h-3 w-3 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              {(isPlaying || isPaused) && (
                <button
                  type="button"
                  onClick={handleStopAudio}
                  className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-rose-200 px-1.5 py-0.5 text-[10px] font-black uppercase text-dark shadow-[1.5px_1.5px_0px_#060E1C]"
                >
                  <Square className="h-3 w-3 fill-current" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content iframe */}
        <div className="flex-1 bg-slate-100 relative min-h-0">
          <iframe
            key={viewEngine}
            src={iframeSrc}
            className="h-full w-full border-none"
            title="PDF Document Viewer"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  );
}
