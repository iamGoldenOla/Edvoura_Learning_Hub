'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Volume2, Pause, Play, Sparkles, Award, GraduationCap } from 'lucide-react';

export interface StoryContent {
  title: string;
  moralLesson?: string;
  ageSuitability?: string;
  content?: string | string[];
  passage?: string | string[];
  explanation?: string;
  vocabulary?: Array<{ word: string; meaning: string }>;
  subject?: string;
  grade?: string;
  contentType?: string;
}

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryContent | null;
}

export function StoryViewerModal({ isOpen, onClose, story }: StoryViewerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, story]);

  if (!isOpen || !story) return null;

  // Extract story paragraphs
  const rawNarrative = story.content || story.passage || story.explanation || '';
  const paragraphs = Array.isArray(rawNarrative)
    ? rawNarrative
    : typeof rawNarrative === 'string'
    ? rawNarrative.split('\n\n').filter(Boolean)
    : [];

  const fullTextToRead = `${story.title}. ${
    story.moralLesson ? `Moral lesson: ${story.moralLesson}.` : ''
  } ${paragraphs.join(' ')}`;

  function handlePlayAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullTextToRead);
    utterance.rate = 0.95; // Slightly slower, child-friendly reading speed
    utterance.pitch = 1.0;
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }

  function handlePauseAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }

  function handleStopAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }

  const handleModalClose = () => {
    handleStopAudio();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/75 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[28px] border-[4px] border-dark bg-white shadow-[12px_12px_0px_#060E1C] overflow-hidden my-auto animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-[4px] border-dark bg-amber-300 p-5 sm:p-6">
          <div className="flex items-center gap-3.5">
            <div className="rounded-2xl border-[3px] border-dark bg-white p-2.5 shadow-[3px_3px_0px_#060E1C]">
              <BookOpen className="h-6 w-6 text-dark" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-xl border-[2px] border-dark bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark shadow-[2px_2px_0px_#060E1C]">
                  {story.contentType === 'story' ? 'Educational Story / Fable' : 'Learning Resource'}
                </span>
                {story.ageSuitability && (
                  <span className="inline-flex rounded-xl border-[2px] border-dark bg-sky-100 px-2.5 py-0.5 text-[10px] font-black text-dark shadow-[2px_2px_0px_#060E1C]">
                    Ages {story.ageSuitability}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-dark mt-1 line-clamp-1">{story.title}</h2>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="rounded-2xl border-[3px] border-dark bg-white p-2.5 text-dark shadow-[3px_3px_0px_#060E1C] transition-all hover:bg-slate-100 active:scale-95 shrink-0"
            aria-label="Close story reader"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Toolbar (Audio Reader Controls) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-dark bg-amber-50 px-5 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-dark uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-dark" /> Audio Reader:
            </span>
            {!isPlaying ? (
              <button
                onClick={handlePlayAudio}
                className="flex items-center gap-1.5 rounded-xl border-[2px] border-dark bg-emerald-400 px-3 py-1 text-xs font-black text-dark shadow-[2px_2px_0px_#060E1C] hover:translate-y-[-1px] active:scale-95 transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-dark" /> Listen to Story
              </button>
            ) : (
              <button
                onClick={handlePauseAudio}
                className="flex items-center gap-1.5 rounded-xl border-[2px] border-dark bg-yellow px-3 py-1 text-xs font-black text-dark shadow-[2px_2px_0px_#060E1C] hover:translate-y-[-1px] active:scale-95 transition-all"
              >
                <Pause className="h-3.5 w-3.5 fill-dark" /> Pause Audio
              </button>
            )}
          </div>
          <span className="text-[11px] font-bold text-dark/60 italic hidden sm:inline">
            Read along while listening!
          </span>
        </div>

        {/* Scrollable Story Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-amber-50/30">
          {/* Moral Lesson Callout Box */}
          {story.moralLesson && (
            <div className="rounded-2xl border-[3px] border-dark bg-amber-200 p-5 shadow-[5px_5px_0px_#060E1C]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-amber-900 fill-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-950">
                  Moral Lesson of the Story
                </h3>
              </div>
              <p className="text-sm sm:text-base font-black text-dark leading-relaxed">
                "{story.moralLesson}"
              </p>
            </div>
          )}

          {/* Story Narrative Text */}
          <div className="rounded-2xl border-[3px] border-dark bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#060E1C] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-dark/40 flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4" /> Story Narrative
            </h3>
            {paragraphs.length > 0 ? (
              paragraphs.map((p, idx) => (
                <p key={idx} className="text-base sm:text-lg font-medium text-dark leading-relaxed tracking-normal">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-base font-medium text-dark leading-relaxed">
                {typeof rawNarrative === 'string' ? rawNarrative : 'No story content available.'}
              </p>
            )}
          </div>

          {/* Vocabulary Section */}
          {story.vocabulary && story.vocabulary.length > 0 && (
            <div className="rounded-2xl border-[3px] border-dark bg-sky-100 p-6 shadow-[5px_5px_0px_#060E1C]">
              <h3 className="text-xs font-black uppercase tracking-widest text-dark/70 flex items-center gap-2 mb-4">
                <Award className="h-4 w-4 text-dark" /> Key Vocabulary Words & Meanings
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {story.vocabulary.map((v, idx) => (
                  <div 
                    key={idx} 
                    className="rounded-xl border-[2px] border-dark bg-white p-3.5 shadow-[3px_3px_0px_#060E1C]"
                  >
                    <span className="text-sm font-black text-dark block">{v.word}</span>
                    <span className="text-xs font-bold text-dark/70 mt-1 block">{v.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t-[3px] border-dark bg-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-dark/60">
            <GraduationCap className="h-4 w-4" /> Edvoura Storybook Reader
          </div>
          <button
            onClick={handleModalClose}
            className="rounded-xl border-[3px] border-dark bg-dark text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-dark/90 active:scale-95 transition-all shadow-[3px_3px_0px_#FACC15]"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}
