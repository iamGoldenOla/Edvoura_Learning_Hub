'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Compass,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import type { TaxonomyTopic, TopicEdgeDetail } from '@/lib/curriculum/taxonomy/skillGraph';

interface SkillRoadmapExplorerProps {
  initialTopics: TaxonomyTopic[];
  subjects: { subject: string; domains: string[] }[];
}

export function SkillRoadmapExplorer({ initialTopics, subjects }: SkillRoadmapExplorerProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<TaxonomyTopic | null>(null);

  const [activeNodeDetails, setActiveNodeDetails] = useState<{
    prerequisites: TopicEdgeDetail[];
    nextSteps: TopicEdgeDetail[];
    loading: boolean;
  }>({
    prerequisites: [],
    nextSteps: [],
    loading: false,
  });

  // Domains available for currently selected subject
  const currentDomains = useMemo(() => {
    const found = subjects.find((s) => s.subject === selectedSubject);
    return found ? ['All', ...found.domains] : ['All'];
  }, [selectedSubject, subjects]);

  // Filter topics based on user selection
  const filteredTopics = useMemo(() => {
    let result = initialTopics.filter((t) => t.subject === selectedSubject);

    if (selectedDomain !== 'All') {
      result = result.filter((t) => t.domain === selectedDomain);
    }

    if (selectedAge !== 'all') {
      const ageNum = parseInt(selectedAge, 10);
      result = result.filter((t) => t.ageRangeStart <= ageNum && t.ageRangeEnd >= ageNum);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.domain.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialTopics, selectedSubject, selectedDomain, selectedAge, searchQuery]);

  // Fetch full skill node details (prerequisites & next unlocked steps)
  const handleSelectTopic = async (topic: TaxonomyTopic) => {
    setActiveTopic(topic);
    setActiveNodeDetails({ prerequisites: [], nextSteps: [], loading: true });

    try {
      const res = await fetch(`/api/taxonomy?topicId=${topic.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setActiveNodeDetails({
          prerequisites: data.data.prerequisites || [],
          nextSteps: data.data.nextSteps || [],
          loading: false,
        });
      }
    } catch (e) {
      console.error('[FAILED TO LOAD TOPIC DETAILS]', e);
      setActiveNodeDetails({ prerequisites: [], nextSteps: [], loading: false });
    }
  };

  const getSubjectColor = (subj: string) => {
    switch (subj) {
      case 'Mathematics':
        return 'bg-yellow text-navy border-navy';
      case 'Science':
        return 'bg-emerald-300 text-navy border-navy';
      case 'English':
        return 'bg-sky-300 text-navy border-navy';
      case 'Computing':
        return 'bg-purple-300 text-navy border-navy';
      case 'History':
      case 'Geography':
        return 'bg-amber-300 text-navy border-navy';
      default:
        return 'bg-pink-300 text-navy border-navy';
    }
  };

  return (
    <div className="space-y-8">
      {/* Subject Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
        {subjects.map((s) => {
          const isActive = selectedSubject === s.subject;
          return (
            <button
              key={s.subject}
              onClick={() => {
                setSelectedSubject(s.subject);
                setSelectedDomain('All');
              }}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border-3 sm:border-4 font-black text-xs sm:text-sm tracking-tight transition-all shrink-0 cursor-pointer shadow-[3px_3px_0px_#060E1C] ${
                isActive
                  ? 'bg-navy text-white translate-x-1 translate-y-1 shadow-none'
                  : 'bg-white text-navy hover:bg-slate-50'
              }`}
            >
              {s.subject}
            </button>
          );
        })}
      </div>

      {/* Domain & Search Controls */}
      <div className="bg-white border-3 sm:border-4 border-navy rounded-[24px] p-5 sm:p-6 shadow-[6px_6px_0px_#060E1C] space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${selectedSubject} (e.g. fractions, algorithms, forces)...`}
              className="w-full pl-12 pr-4 py-3 bg-off-white border-2 sm:border-3 border-navy rounded-xl text-sm font-bold text-navy focus:outline-none focus:border-yellow focus:shadow-[2px_2px_0px_#060E1C] transition-all"
            />
          </div>

          {/* Age Bracket Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-navy/60 shrink-0">Age Band:</span>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="px-3 py-3 bg-off-white border-2 sm:border-3 border-navy rounded-xl text-xs font-black text-navy focus:outline-none"
            >
              <option value="all">All Ages (4-15 yrs)</option>
              <option value="5">EYFS / Early Years (Age 4-6)</option>
              <option value="8">Lower Primary (Age 7-9)</option>
              <option value="11">Upper Primary (Age 10-12)</option>
              <option value="14">Middle School / Junior High (Age 13-15)</option>
            </select>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="pt-2 border-t border-navy/10 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-navy/50 mr-1 shrink-0">Domain:</span>
          {currentDomains.slice(0, 14).map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3 py-1.5 rounded-lg border-2 border-navy text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                selectedDomain === dom
                  ? 'bg-yellow text-navy font-black shadow-[2px_2px_0px_#060E1C]'
                  : 'bg-white text-navy/70 hover:bg-slate-100'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-black text-navy uppercase tracking-wider">
        <span>
          Showing {filteredTopics.length} Micro-Topics in {selectedSubject}
          {selectedDomain !== 'All' ? ` • ${selectedDomain}` : ''}
        </span>
        <span className="text-navy/50">Click any skill to view prerequisites &amp; unlocks</span>
      </div>

      {/* Main Grid: Topic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTopics.slice(0, 60).map((topic) => (
          <div
            key={topic.id}
            onClick={() => handleSelectTopic(topic)}
            className="group relative bg-white border-3 sm:border-4 border-navy rounded-[20px] p-5 shadow-[4px_4px_0px_#060E1C] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#060E1C] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider bg-off-white border border-navy px-2 py-0.5 rounded-md text-navy">
                  {topic.domain}
                </span>
                <span className="text-[10px] font-bold text-navy/60 font-mono">
                  Age {topic.ageRangeStart}–{topic.ageRangeEnd}
                </span>
              </div>

              <h4 className="font-heading font-black text-base text-navy group-hover:text-info transition-colors line-clamp-2 mb-2">
                {topic.name}
              </h4>

              <p className="text-xs text-navy/70 line-clamp-3 font-medium leading-relaxed mb-4">
                {topic.description}
              </p>
            </div>

            <div className="pt-3 border-t border-navy/10 flex items-center justify-between text-xs font-bold text-navy">
              <span className="flex items-center gap-1.5 text-[11px] text-navy/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {topic.evidence?.length || 0} Mastery Points
              </span>
              <span className="text-yellow group-hover:translate-x-1 transition-transform flex items-center gap-1 font-black">
                Explore <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Skill Detail Modal / Drawer */}
      {activeTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8 bg-white border-4 sm:border-6 border-navy rounded-[28px] p-6 sm:p-8 shadow-[12px_12px_0px_#060E1C] animate-fade-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b-3 border-navy pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs font-black uppercase px-3 py-1 rounded-md border-2 ${getSubjectColor(activeTopic.subject)}`}>
                    {activeTopic.subject}
                  </span>
                  <span className="text-xs font-bold bg-off-white border border-navy px-2.5 py-1 rounded-md text-navy">
                    {activeTopic.domain}
                  </span>
                  <span className="text-xs font-bold text-navy/70">
                    Ages {activeTopic.ageRangeStart}–{activeTopic.ageRangeEnd}
                  </span>
                </div>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-navy">
                  {activeTopic.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveTopic(null)}
                className="w-10 h-10 bg-off-white border-2 border-navy rounded-xl flex items-center justify-center font-black text-navy hover:bg-slate-200 transition-colors shrink-0 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              {/* Context Explanation Banner */}
              <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 flex items-start gap-3">
                <Compass className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-950 font-medium leading-relaxed">
                  <strong className="font-black text-sky-900 block mb-0.5">Tutor &amp; Parent Lesson Guide:</strong>
                  This roadmap card shows what your child learns, the exact diagnostic question tutors use to test understanding, the stepping stones needed first, and the next lessons unlocked.
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-navy/50 mb-2">🎯 Learning Objective &amp; Goal</h5>
                <p className="text-sm sm:text-base font-bold text-navy leading-relaxed bg-off-white p-4 rounded-xl border-2 border-navy">
                  {activeTopic.description}
                </p>
              </div>

              {/* Assessment Prompt */}
              {activeTopic.assessmentPrompt && (
                <div className="bg-yellow/30 border-3 border-navy rounded-2xl p-5 shadow-[3px_3px_0px_#060E1C]">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-navy mb-1.5">
                    <HelpCircle className="w-4 h-4 text-navy" /> ❓ In-Class Diagnostic Question (How Tutors Test Understanding)
                  </div>
                  <p className="text-sm font-black text-navy italic">
                    &ldquo;{activeTopic.assessmentPrompt.replace(/\{\{name\}\}/g, 'the learner')}&rdquo;
                  </p>
                  <p className="text-[11px] text-navy/70 mt-2 font-medium">
                    During a lesson, your tutor asks this question to confirm the student actually understands the concept rather than just reciting textbook rules.
                  </p>
                </div>
              )}

              {/* Evidence of Mastery */}
              {activeTopic.evidence && activeTopic.evidence.length > 0 && (
                <div>
                  <h5 className="text-xs font-black uppercase tracking-wider text-navy/50 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" /> 📋 What the Student Must Demonstrate (Checklist)
                  </h5>
                  <div className="space-y-2">
                    {activeTopic.evidence.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 border-2 border-navy/20 rounded-xl text-xs sm:text-sm font-bold text-navy">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisite Knowledge Graph */}
              <div className="pt-2">
                <h5 className="text-xs font-black uppercase tracking-wider text-navy/50 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" /> 🧱 Stepping Stones (Skills to Master First)
                </h5>
                <p className="text-xs text-navy/60 mb-3 font-medium">
                  If a learner is stuck on this topic, our tutors step back to ensure these foundational concepts are solid:
                </p>

                {activeNodeDetails.loading ? (
                  <p className="text-xs font-bold text-navy/40">Loading skill connections...</p>
                ) : activeNodeDetails.prerequisites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeNodeDetails.prerequisites.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectTopic(p.topic)}
                        className="p-3.5 bg-amber-50 border-2 border-navy rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase bg-white border border-navy px-1.5 py-0.5 rounded text-navy">
                            {p.strength} foundation
                          </span>
                          <span className="text-[10px] text-navy/50 font-bold">Age {p.topic.ageRangeStart}–{p.topic.ageRangeEnd}</span>
                        </div>
                        <p className="text-xs font-black text-navy">{p.topic.name}</p>
                        <p className="text-[11px] text-navy/70 mt-1 italic leading-tight">&ldquo;{p.reason}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-300">
                    ✨ Foundational Concept: No prior prerequisites required. Great starting point!
                  </p>
                )}
              </div>

              {/* Unlocks Next Graph */}
              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-navy/50 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-info" /> 🚀 Next Lessons (What Mastering This Unlocks)
                </h5>
                <p className="text-xs text-navy/60 mb-3 font-medium">
                  Once your child masters this skill, they will advance directly to these next-level topics:
                </p>

                {activeNodeDetails.loading ? (
                  <p className="text-xs font-bold text-navy/40">Loading unlocked skills...</p>
                ) : activeNodeDetails.nextSteps.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeNodeDetails.nextSteps.map((n, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectTopic(n.topic)}
                        className="p-3.5 bg-blue-50 border-2 border-navy rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase bg-white border border-navy px-1.5 py-0.5 rounded text-navy">
                            Next Milestone
                          </span>
                          <span className="text-[10px] text-navy/50 font-bold">Age {n.topic.ageRangeStart}–{n.topic.ageRangeEnd}</span>
                        </div>
                        <p className="text-xs font-black text-navy">{n.topic.name}</p>
                        <p className="text-[11px] text-navy/70 mt-1 italic leading-tight">&ldquo;{n.reason}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-navy/50 bg-slate-50 p-3 rounded-xl border border-navy/10">
                    🏆 Capstone Skill: Highest-level mastery topic in this grade cycle.
                  </p>
                )}
              </div>
              {/* Standards Tags */}
              {activeTopic.standards && activeTopic.standards.length > 0 && (
                <div className="pt-2 border-t border-navy/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-navy/40 mb-2">Curriculum Alignments:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTopic.standards.slice(0, 8).map((st, i) => (
                      <span key={i} className="text-[10px] font-mono font-bold bg-off-white border border-navy/30 px-2 py-0.5 rounded text-navy/70">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="mt-8 pt-5 border-t-3 border-navy flex flex-col sm:flex-row gap-3">
              <Link
                href={`/dash/student/live?focusTopic=${encodeURIComponent(activeTopic.name)}`}
                className="flex-1 bg-yellow text-navy border-3 border-navy rounded-xl py-3 px-4 font-black text-xs uppercase tracking-wider text-center shadow-[3px_3px_0px_#060E1C] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" /> Practice on EDVOURA Board
              </Link>
              <button
                onClick={() => setActiveTopic(null)}
                className="bg-white text-navy border-2 border-navy rounded-xl py-3 px-6 font-black text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
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
