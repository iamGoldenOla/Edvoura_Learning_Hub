'use client';

import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null | undefined;
  title: string;
}

export function PDFViewerModal({ isOpen, onClose, pdfUrl, title }: PDFViewerModalProps) {
  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/60 p-4 backdrop-blur-sm">
      <div className="relative flex h-[85vh] w-full max-w-5xl flex-col rounded-[24px] border-[4px] border-dark bg-white shadow-[12px_12px_0px_#060E1C] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-[4px] border-dark bg-yellow/20 p-4 sm:p-6 shrink-0">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-xl sm:text-2xl font-black text-dark truncate leading-tight uppercase tracking-tight">
              {title}
            </h2>
            <p className="text-[10px] sm:text-xs font-bold text-dark/60 tracking-wider uppercase mt-1">
              Document Viewer
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 px-4 items-center justify-center gap-2 rounded-xl border-[2px] border-dark bg-white hover:bg-yellow text-dark text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">New Tab</span>
            </a>
            
            <a
              href={pdfUrl}
              download
              className="inline-flex h-10 px-4 items-center justify-center gap-2 rounded-xl border-[2px] border-dark bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
              title="Download File"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
            
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-[2px] border-dark bg-rose-500 hover:bg-rose-600 text-white shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
              aria-label="Close document viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content iframe */}
        <div className="flex-1 bg-slate-100 relative min-h-0">
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="h-full w-full border-none"
            title="PDF Document Viewer"
          />
        </div>
      </div>
    </div>
  );
}
