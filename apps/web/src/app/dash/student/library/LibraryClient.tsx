'use client';

import React, { useState } from 'react';
import { FileText, Download, Eye, Library as LibraryIcon } from 'lucide-react';
import { PDFViewerModal } from '@/components/ui/PDFViewerModal';

interface LibraryClientProps {
  resources: Array<{
    id: string;
    event_type: string;
    payload: {
      title?: string;
      description?: string;
    };
    created_at: string;
    files: Array<{
      id: string;
      object_path: string;
      downloadUrl?: string;
    }>;
  }>;
}

export default function LibraryClient({ resources }: LibraryClientProps) {
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>('');

  const handleOpenPdf = (url: string, title: string) => {
    setActivePdfUrl(url);
    setActivePdfTitle(title);
  };

  const handleClosePdf = () => {
    setActivePdfUrl(null);
    setActivePdfTitle('');
  };

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-sky-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark flex items-center gap-4">
            <LibraryIcon className="h-10 w-10" /> Resource Library
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Access general lesson resources, study guides, and materials uploaded by your tutors.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {resources.length > 0 ? (
          resources.map((resource) => (
            <div key={resource.id} className="flex flex-col gap-6 rounded-[28px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_#060E1C]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className={`rounded-2xl border-[3px] border-dark p-4 shadow-[3px_3px_0px_#060E1C] ${resource.event_type === 'spelling_bee_created' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    <FileText className="h-7 w-7 text-dark" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black text-dark">{resource.payload.title}</h3>
                      {resource.event_type === 'spelling_bee_created' && (
                        <span className="inline-flex rounded-xl border-[2px] border-dark bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-900 shadow-[2px_2px_0px_#060E1C]">
                          Spelling Bee
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-bold text-dark/70 leading-relaxed">{resource.payload.description || 'No description provided.'}</p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-dark/40">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {resource.files.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2">
                  {resource.files.map((file) => {
                    const fileName = file.object_path.split('/').pop() || 'resource';
                    const isPdf = fileName.toLowerCase().endsWith('.pdf');

                    return (
                      <div 
                        key={file.id} 
                        className="flex flex-col gap-2 rounded-xl border-[3px] border-dark bg-off-white p-3 shadow-[4px_4px_0px_#060E1C]"
                      >
                        <span className="truncate text-xs font-black text-dark">{fileName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {isPdf && file.downloadUrl && (
                            <button
                              onClick={() => handleOpenPdf(file.downloadUrl!, fileName)}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border-[2px] border-dark bg-yellow px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-dark hover:translate-y-[-1px] transition-all"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View PDF
                            </button>
                          )}
                          <a 
                            href={file.downloadUrl}
                            download
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border-[2px] border-dark bg-white px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-dark hover:translate-y-[-1px] transition-all"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border-[4px] border-dashed border-dark/20 bg-slate-50 p-12 text-center flex flex-col items-center">
            <LibraryIcon className="h-10 w-10 text-dark/30 mb-4" />
            <p className="text-sm font-bold text-dark/60 italic">No resources available yet. When a tutor uploads a resource, it will appear here.</p>
          </div>
        )}
      </div>

      <PDFViewerModal
        isOpen={activePdfUrl !== null}
        onClose={handleClosePdf}
        pdfUrl={activePdfUrl}
        title={activePdfTitle}
      />
    </div>
  );
}
