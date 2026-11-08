'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Volume2,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Award,
  Lightbulb,
  Check,
  Flame,
} from 'lucide-react';
import Image from 'next/image';
import type { VocabularyWord } from '@/lib/curriculum/vocabulary/vocabularyEngine';

interface VocabularyAtlasExplorerProps {
  initialWords: VocabularyWord[];
  totalWords: number;
  topics: string[];
  levels: string[];
  dailyWord: VocabularyWord;
}

export function VocabularyAtlasExplorer({
  initialWords,
  totalWords,
  topics,
  levels,
  dailyWord,
}: VocabularyAtlasExplorerProps) {
  const [words, setWords] = useState<VocabularyWord[]>(initialWords);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedCefr, setSelectedCefr] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(totalWords / 24));
  const [totalCount, setTotalCount] = useState<number>(totalWords);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeWord, setActiveWord] = useState<VocabularyWord | null>(null);
  const [speakingAccent, setSpeakingAccent] = useState<string | null>(null);

  // Native Speech Synthesis with accent voice selection
  const playPronunciation = (text: string, accent: 'uk' | 'us') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
    utterance.rate = 0.9; // Slightly slower for clear educational articulation

    setSpeakingAccent(`${text}-${accent}`);
    utterance.onend = () => setSpeakingAccent(null);
    utterance.onerror = () => setSpeakingAccent(null);

    window.speechSynthesis.speak(utterance);
  };

  // Fetch filtered or paginated words
  const fetchWords = async (newPage = 1, topic = selectedTopic, cefr = selectedCefr, query = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(newPage),
        limit: '24',
      });
      if (topic !== 'all') params.append('topic', topic);
      if (cefr !== 'all') params.append('cefr', cefr);
      if (query.trim()) params.append('q', query.trim());

      const res = await fetch(`/api/vocabulary?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setWords(data.words);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalCount(data.total);
      }
    } catch (e) {
      console.error('[FAILED TO FETCH VOCABULARY]', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWords(1, selectedTopic, selectedCefr, searchQuery);
  };

  const handleTopicChange = (newTopic: string) => {
    setSelectedTopic(newTopic);
    fetchWords(1, newTopic, selectedCefr, searchQuery);
  };

  const handleCefrChange = (newCefr: string) => {
    setSelectedCefr(newCefr);
    fetchWords(1, selectedTopic, newCefr, searchQuery);
  };

  const getCefrColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'A1':
        return 'bg-emerald-100 text-emerald-900 border-emerald-400';
      case 'A2':
        return 'bg-teal-100 text-teal-900 border-teal-400';
      case 'B1':
        return 'bg-sky-100 text-sky-900 border-sky-400';
      case 'B2':
        return 'bg-blue-100 text-blue-900 border-blue-400';
      case 'C1':
        return 'bg-purple-100 text-purple-900 border-purple-400';
      case 'C2':
        return 'bg-rose-100 text-rose-900 border-rose-400';
      default:
        return 'bg-yellow text-navy border-navy';
    }
  };

  return (
    <div className="space-y-8">
      {/* Featured Word of the Day Banner */}
      {dailyWord && (
        <div className="bg-yellow border-4 border-navy rounded-[28px] p-6 sm:p-8 shadow-[8px_8px_0px_#060E1C] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-1 space-y-3 text-navy">
              <div className="inline-flex items-center gap-2 bg-navy text-white px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_#FFFFFF]">
                <Flame className="w-4 h-4 text-yellow" /> Word of the Day
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="font-heading font-black text-3xl sm:text-4xl capitalize tracking-tight">
                  {dailyWord.w}
                </h3>
                <span className="text-xs font-black uppercase tracking-wider bg-white/70 border border-navy px-2 py-0.5 rounded-md">
                  {dailyWord.senses[0]?.pos || 'n.'}
                </span>
                <span className="text-sm font-bold opacity-75 font-mono">{dailyWord.uk}</span>
              </div>

              <p className="text-base sm:text-lg font-bold leading-relaxed max-w-2xl">
                {dailyWord.senses[0]?.en}
              </p>

              {dailyWord.ex[0] && (
                <p className="text-xs sm:text-sm font-medium italic opacity-85">
                  &ldquo;{dailyWord.ex[0].en}&rdquo;
                </p>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => playPronunciation(dailyWord.w, 'uk')}
                  className="px-3.5 py-1.5 bg-white border-2 border-navy rounded-xl text-xs font-black shadow-[2px_2px_0px_#060E1C] flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-navy" /> UK Audio
                </button>
                <button
                  onClick={() => playPronunciation(dailyWord.w, 'us')}
                  className="px-3.5 py-1.5 bg-white border-2 border-navy rounded-xl text-xs font-black shadow-[2px_2px_0px_#060E1C] flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-navy" /> US Audio
                </button>
                <button
                  onClick={() => setActiveWord(dailyWord)}
                  className="px-4 py-1.5 bg-navy text-white border-2 border-navy rounded-xl text-xs font-black shadow-[2px_2px_0px_#FFFFFF] hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  View Full Word Card
                </button>
              </div>
            </div>

            {/* Daily Illustration */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl border-4 border-navy bg-white shadow-[6px_6px_0px_#060E1C] overflow-hidden shrink-0 relative">
              <img
                src={dailyWord.thumbnailUrl}
                alt={dailyWord.w}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border-3 sm:border-4 border-navy rounded-[24px] p-5 sm:p-6 shadow-[6px_6px_0px_#060E1C] space-y-5">
        {/* Search & CEFR Levels */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 7,298 illustrated words (e.g. photosynthesis, principle, library)..."
              className="w-full pl-12 pr-4 py-3 bg-off-white border-2 sm:border-3 border-navy rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-yellow transition-all"
            />
          </form>

          {/* CEFR Level Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-black uppercase text-navy/50 mr-1 shrink-0">Level:</span>
            {['all', ...levels].map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleCefrChange(lvl)}
                className={`px-3 py-1.5 rounded-lg border-2 border-navy text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCefr === lvl
                    ? 'bg-navy text-white shadow-[2px_2px_0px_#060E1C]'
                    : 'bg-off-white text-navy/70 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Thematic Topics Row */}
        <div className="pt-3 border-t border-navy/10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-black uppercase text-navy/50 shrink-0">Topic:</span>
          {['all', ...topics].map((top) => (
            <button
              key={top}
              onClick={() => handleTopicChange(top)}
              className={`px-3 py-1.5 rounded-lg border-2 border-navy text-[11px] font-bold capitalize shrink-0 transition-all cursor-pointer ${
                selectedTopic === top
                  ? 'bg-yellow text-navy font-black shadow-[2px_2px_0px_#060E1C]'
                  : 'bg-white text-navy/70 hover:bg-slate-100'
              }`}
            >
              {top}
            </button>
          ))}
        </div>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between text-xs font-black text-navy uppercase tracking-wider">
        <span>
          Showing {words.length} of {totalCount} words
          {selectedTopic !== 'all' ? ` in ${selectedTopic}` : ''}
          {selectedCefr !== 'all' ? ` (${selectedCefr.toUpperCase()})` : ''}
        </span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Grid of Vocabulary Cards */}
      {loading ? (
        <div className="p-16 text-center text-navy font-black text-base animate-pulse">
          Loading illustrated vocabulary...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {words.map((word) => (
            <div
              key={word.id}
              onClick={() => setActiveWord(word)}
              className="group bg-white border-3 sm:border-4 border-navy rounded-[22px] overflow-hidden shadow-[4px_4px_0px_#060E1C] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#060E1C] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Illustration Image */}
                <div className="relative h-40 w-full bg-slate-100 border-b-3 border-navy overflow-hidden">
                  <img
                    src={word.thumbnailUrl}
                    alt={word.w}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getCefrColor(
                        word.cefr
                      )} shadow-[1px_1px_0px_#060E1C]`}
                    >
                      {word.cefr}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-black uppercase bg-white/90 backdrop-blur-sm border border-navy px-2 py-0.5 rounded-md text-navy">
                      {word.topic}
                    </span>
                  </div>
                </div>

                {/* Word Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-heading font-black text-xl text-navy capitalize group-hover:text-info transition-colors">
                      {word.w}
                    </h4>
                    <span className="text-xs font-black uppercase text-navy/50">
                      {word.senses[0]?.pos || 'n.'}
                    </span>
                  </div>

                  <p className="text-xs text-navy/60 font-mono font-bold">{word.uk}</p>

                  <p className="text-xs text-navy/80 font-bold line-clamp-2 leading-relaxed">
                    {word.senses[0]?.en}
                  </p>
                </div>
              </div>

              {/* Card Footer with Audio Trigger */}
              <div className="p-3 border-t-2 border-navy/10 bg-off-white flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(word.w, 'uk');
                    }}
                    className="px-2 py-1 bg-white border border-navy rounded-md text-[10px] font-black hover:bg-yellow transition-colors flex items-center gap-1"
                    title="British Pronunciation"
                  >
                    <Volume2 className="w-3 h-3" /> UK
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(word.w, 'us');
                    }}
                    className="px-2 py-1 bg-white border border-navy rounded-md text-[10px] font-black hover:bg-yellow transition-colors flex items-center gap-1"
                    title="American Pronunciation"
                  >
                    <Volume2 className="w-3 h-3" /> US
                  </button>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-dark group-hover:translate-x-1 transition-transform">
                  Details &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => fetchWords(page - 1)}
            className="px-5 py-3 bg-white border-3 border-navy rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] disabled:opacity-40 disabled:shadow-none hover:translate-x-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs font-black text-navy px-4 py-2 bg-yellow rounded-xl border-2 border-navy shadow-[2px_2px_0px_#060E1C]">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => fetchWords(page + 1)}
            className="px-5 py-3 bg-white border-3 border-navy rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] disabled:opacity-40 disabled:shadow-none hover:translate-x-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detailed Word Modal */}
      {activeWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white border-4 sm:border-6 border-navy rounded-[28px] overflow-hidden shadow-[12px_12px_0px_#060E1C] animate-fade-up max-h-[90vh] overflow-y-auto">
            {/* Modal Image Header */}
            <div className="relative h-60 sm:h-72 w-full bg-slate-100 border-b-4 border-navy">
              <img
                src={activeWord.illustrationUrl}
                alt={activeWord.w}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop';
                }}
              />
              <button
                onClick={() => setActiveWord(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white border-2 border-navy rounded-xl flex items-center justify-center font-black text-navy text-xl shadow-[2px_2px_0px_#060E1C] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                &times;
              </button>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase px-3 py-1 rounded-md border-2 ${getCefrColor(
                    activeWord.cefr
                  )} shadow-[2px_2px_0px_#060E1C]`}
                >
                  CEFR {activeWord.cefr}
                </span>
                <span className="text-xs font-black uppercase bg-white border-2 border-navy px-3 py-1 rounded-md text-navy shadow-[2px_2px_0px_#060E1C]">
                  {activeWord.topic}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-baseline gap-3 flex-wrap mb-2">
                  <h3 className="font-heading font-black text-3xl sm:text-4xl text-navy capitalize">
                    {activeWord.w}
                  </h3>
                  <span className="text-xs font-black uppercase tracking-wider text-navy/60 bg-off-white border border-navy px-2 py-0.5 rounded-md">
                    {activeWord.senses[0]?.pos || 'n.'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold font-mono text-navy/70">
                  <span>UK: {activeWord.uk}</span>
                  <span>•</span>
                  <span>US: {activeWord.us}</span>
                </div>
              </div>

              {/* Pronunciation triggers */}
              <div className="flex gap-3">
                <button
                  onClick={() => playPronunciation(activeWord.w, 'uk')}
                  className="flex-1 py-2.5 bg-yellow border-2 border-navy rounded-xl text-xs font-black text-navy shadow-[2px_2px_0px_#060E1C] hover:translate-x-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" /> Listen British (UK)
                </button>
                <button
                  onClick={() => playPronunciation(activeWord.w, 'us')}
                  className="flex-1 py-2.5 bg-white border-2 border-navy rounded-xl text-xs font-black text-navy shadow-[2px_2px_0px_#060E1C] hover:translate-x-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" /> Listen American (US)
                </button>
              </div>

              {/* Definitions & Senses */}
              <div className="space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-navy/50">Definitions</h5>
                {activeWord.senses.map((sense, idx) => (
                  <div key={idx} className="p-4 bg-off-white border-2 border-navy rounded-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-navy text-white px-1.5 py-0.5 rounded">
                        {sense.pos}
                      </span>
                      <p className="text-sm font-bold text-navy">{sense.en}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Real-World Context & Examples */}
              {activeWord.ex && activeWord.ex.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-navy/50">Example Sentences</h5>
                  <div className="space-y-2">
                    {activeWord.ex.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border-2 border-navy/20 rounded-xl text-xs sm:text-sm font-bold text-navy italic">
                        &ldquo;{item.en}&rdquo;
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collocations */}
              {activeWord.col && activeWord.col.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-navy/50">Common Collocations</h5>
                  <div className="flex flex-wrap gap-2">
                    {activeWord.col.map((c, idx) => {
                      const clean = c.split('｜')[0];
                      return (
                        <span key={idx} className="text-xs font-bold bg-amber-50 border border-navy/40 px-2.5 py-1 rounded-lg text-navy">
                          {clean}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Word Family */}
              {activeWord.fam && activeWord.fam.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-navy/50">Word Family</h5>
                  <div className="flex flex-wrap gap-2">
                    {activeWord.fam.map((f, idx) => (
                      <span key={idx} className="text-xs font-bold bg-blue-50 border border-navy/40 px-2.5 py-1 rounded-lg text-navy">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t-3 border-navy bg-off-white flex justify-end gap-3">
              <button
                onClick={() => setActiveWord(null)}
                className="px-6 py-2.5 bg-navy text-white border-2 border-navy rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#FFFFFF] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
