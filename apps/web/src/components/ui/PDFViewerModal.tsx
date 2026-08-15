'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Volume2, Play, Pause, Square, Layers, BookOpen, CheckCircle2, FileText, Award } from 'lucide-react';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null | undefined;
  title: string;
  unlockedWeek?: number;
}

function getSubjectSpecificManuscript(title: string) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('science')) {
    return {
      subject: 'Basic Science & Technology',
      badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-400',
      modules: [
        {
          unit: 'Module 1: Living and Non-Living Things',
          content: 'Living things perform key life processes: Feeding (nutrition), Growth, Respiration, Movement, Excretion, Sensitivity, and Reproduction. Non-living things do not breathe, grow, or reproduce. Examples of living things include plants, birds, and humans. Non-living things include rocks, chairs, and vehicles.',
          keyPoints: ['Living things need food, water, and air to survive.', 'Plants make their own food through photosynthesis using sunlight.', 'Animals consume plants or other animals for energy.'],
        },
        {
          unit: 'Module 2: The Human Body & Sense Organs',
          content: 'Humans possess 5 primary sense organs: Eyes (Sight/Vision), Ears (Hearing), Nose (Smell), Tongue (Taste - Sweet, Salty, Sour, Bitter), and Skin (Touch & Temperature). Maintaining personal hygiene (daily bathing, brushing teeth, washing hands) prevents disease transmission.',
          keyPoints: ['Wash hands with soap for 20 seconds before eating.', 'Protect eyes from direct bright sunlight.', 'Keep ears dry and clean without sharp objects.'],
        },
        {
          unit: 'Module 3: Plants, Animals & Soil Science',
          content: 'Plants consist of roots, stems, leaves, flowers, and seeds. Roots absorb water and anchor the plant. Seeds require 3 essential conditions to germinate: Water (Moisture), Air (Oxygen), and Suitable Warmth (Sunlight). Soil types include Sandy (rough), Clayey (sticky), and Loamy (rich in humus, best for agriculture).',
          keyPoints: ['Loam soil holds moisture and nutrients best for crops.', 'Animals are grouped into Herbivores (plant eaters), Carnivores (meat eaters), and Omnivores (both).'],
        },
        {
          unit: 'Module 4: Forces, Energy & Simple Machines',
          content: 'A force is a push or pull applied to an object. Forces can change an object’s speed, direction, or shape. Forms of energy include Light, Heat, Sound, and Electrical energy. Simple machines (levers, inclined planes, pulleys, wheels) make work easier and faster.',
          keyPoints: ['Friction is the resistance force between two surfaces touching.', 'Gravity pulls objects downward toward the Earth’s center.'],
        },
      ],
      workedExamples: [
        { question: 'Identify 3 living things and 3 non-living things in your classroom.', answer: 'Living: Classroom plant, fish in aquarium, students. Non-living: Desk, whiteboard, pencil.' },
        { question: 'Why is loamy soil preferred for growing maize?', answer: 'Loamy soil contains balanced sand and clay particles mixed with rich organic humus, retaining water and nutrients effectively.' },
      ],
      practiceQuestions: [
        'List the 5 human sense organs and state one function of each.',
        'What are the 3 essential conditions required for a seed to germinate?',
        'Explain the difference between a push force and a pull force with one daily example each.',
      ],
    };
  }

  if (lowerTitle.includes('math')) {
    return {
      subject: 'Mathematics & Quantitative Reasoning',
      badgeColor: 'bg-indigo-100 text-indigo-950 border-indigo-400',
      modules: [
        {
          unit: 'Module 1: Number Sense, Counting & Place Value',
          content: 'Numbers are organized into Place Values: Units (Ones), Tens, Hundreds, and Thousands. For example, in the number 458: 4 represents 4 Hundreds (400), 5 represents 5 Tens (50), and 8 represents 8 Units (8). Counting forward and backward strengthens mental math velocity.',
          keyPoints: ['10 Units = 1 Ten', '10 Tens = 1 Hundred', '10 Hundreds = 1 Thousand'],
        },
        {
          unit: 'Module 2: Addition & Subtraction Strategies',
          content: 'Addition means combining two or more quantities together (Sum). Subtraction means taking one quantity away from another (Difference). Always align numbers vertically by their place value columns starting from the Right (Units column) before adding or subtracting with regrouping.',
          keyPoints: ['Addition Key Terms: Plus, Sum, Total, Altogether, Increase.', 'Subtraction Key Terms: Minus, Difference, Take away, Remaining, Less than.'],
        },
        {
          unit: 'Module 3: Geometry, Shapes & Measurement',
          content: '2D Shapes have length and width: Circles (0 straight sides), Triangles (3 sides, 3 corners), Squares (4 equal sides, 4 right angles), Rectangles (4 sides, opposite sides equal). 3D Solids have length, width, and height: Cubes, Cuboids, Spheres, Cylinders, and Cones.',
          keyPoints: ['A square has 4 equal sides and 4 right angles (90°).', 'A cube has 6 square faces, 12 edges, and 8 vertices.'],
        },
        {
          unit: 'Module 4: Money, Time & Fractions',
          content: 'Money in Nigeria uses Naira (₦) and Kobo (k). 100 Kobo = 1 Naira (₦1.00). Time is measured in Hours, Minutes, and Seconds. 60 Seconds = 1 Minute; 60 Minutes = 1 Hour; 24 Hours = 1 Day. Fractions represent equal parts of a whole (Numerator / Denominator).',
          keyPoints: ['Half = 1/2', 'Quarter = 1/4', 'Three Quarters = 3/4'],
        },
      ],
      workedExamples: [
        { question: 'Add 348 + 275 showing step-by-step place value carrying.', answer: 'Step 1 (Units): 8 + 5 = 13 (write 3, carry 1 Ten). Step 2 (Tens): 4 + 7 + 1 = 12 (write 2, carry 1 Hundred). Step 3 (Hundreds): 3 + 2 + 1 = 6. Answer = 623.' },
        { question: 'If Titomi buys a notebook for ₦350 and pays with a ₦500 note, how much change does she receive?', answer: 'Change = ₦500 - ₦350 = ₦150.' },
      ],
      practiceQuestions: [
        'Write the place value of digit 7 in the number 4,792.',
        'Find the difference between 800 and 345.',
        'Draw a rectangle and label its sides. State two geometric properties of a rectangle.',
      ],
    };
  }

  if (lowerTitle.includes('english') || lowerTitle.includes('language') || lowerTitle.includes('phonic')) {
    return {
      subject: 'English Language & Phonics Mastery',
      badgeColor: 'bg-purple-100 text-purple-950 border-purple-400',
      modules: [
        {
          unit: 'Module 1: Parts of Speech & Grammar Foundations',
          content: 'Every word in English belongs to a grammatical family: NOUN (naming word for person, place, or thing), PRONOUN (replaces a noun: he, she, it, they), VERB (action word: run, write, sing), ADJECTIVE (describes a noun: bright, swift, gentle), ADVERB (describes a verb: quickly, softly).',
          keyPoints: ['Proper Nouns start with Capital Letters (e.g. Nigeria, Titomi, Lagos).', 'Verbs must agree with their subjects in singular and plural forms.'],
        },
        {
          unit: 'Module 2: Phonics, Spelling & Pronunciation Rules',
          content: 'English phonics connects letters to sounds. Short Vowels (a, e, i, o, u as in cat, bed, pin, mop, bus). Long Vowels (magic "e" rule: mat -> mate, pin -> pine). Consonant Blends (st, br, cl, tr). Digraphs (sh, ch, th, ph).',
          keyPoints: ['Magic "e" at the end of a word makes the inner vowel say its name.', 'Digraph "sh" makes a single quiet sound as in ship and wish.'],
        },
        {
          unit: 'Module 3: Reading Comprehension & Vocabulary Expansion',
          content: 'Effective reading involves predicting, locating main ideas, identifying supporting details, and making inferences. Context clues help decode unfamiliar words within sentences without stopping reading flow.',
          keyPoints: ['Always read comprehension questions first to know what key facts to scan for.', 'Summarize passages in 2-3 concise sentences.'],
        },
        {
          unit: 'Module 4: Composition & Creative Writing',
          content: 'A complete sentence requires a Subject, a Predicate (Verb), a starting Capital Letter, and a ending Punctuation Mark (. ! ?). Paragraphs combine related sentences focused on a single central idea.',
          keyPoints: ['Use transition words (first, next, furthermore, finally) to connect ideas logically.'],
        },
      ],
      workedExamples: [
        { question: 'Identify the Noun, Verb, and Adjective in: "The clever student solved the difficult puzzle."', answer: 'Nouns: student, puzzle. Verb: solved. Adjectives: clever, difficult.' },
        { question: 'Rewrite using correct punctuation: "does titomi live in lagos nigeria"', answer: 'Punctuation: "Does Titomi live in Lagos, Nigeria?"' },
      ],
      practiceQuestions: [
        'Write 4 sentences containing one Noun, one Verb, and one Adjective each.',
        'What is the difference between a short vowel sound and a long vowel sound? Give two word examples for each.',
        'Write a short 5-line descriptive paragraph about your favorite school subject.',
      ],
    };
  }

  // Default General Curriculum Manuscript for History, Arts, Social Studies, PHE, CRS, etc.
  return {
    subject: title.split(' ')[0] || 'Official Curriculum',
    badgeColor: 'bg-amber-100 text-amber-950 border-amber-400',
    modules: [
      {
        unit: 'Module 1: Foundations & Core Curriculum Principles',
        content: `This official term-by-term curriculum manuscript for "${title}" delivers comprehensive academic instruction aligned with national curriculum guidelines, WAEC, Cambridge IGCSE, and NERDC standards.`,
        keyPoints: ['Understand core terminology and historical/scientific origin.', 'Identify fundamental principles and practical applications.'],
      },
      {
        unit: 'Module 2: Key Concepts, Definitions & Theories',
        content: 'Detailed breakdown of essential topics, definitions, rules, and analytical framework designed to build deep conceptual understanding and long-term retention.',
        keyPoints: ['Master key definitions required for examination distinction.', 'Connect theoretical concepts to practical real-world scenarios.'],
      },
      {
        unit: 'Module 3: Analytical Problem Solving & Model Solutions',
        content: 'Step-by-step model answers, structured case studies, and guided solutions demonstrating exact examination scoring standards.',
        keyPoints: ['Follow logical step-by-step methodologies.', 'Review model answers to understand full-credit requirements.'],
      },
      {
        unit: 'Module 4: Revision Focus & Examination Practice Drills',
        content: 'Comprehensive review questions, self-assessment quizzes, and homework exercises designed for independent practice and classroom revision.',
        keyPoints: ['Complete all practice questions before your next live tutor session.', 'Focus on weak areas identified in your AI Topic Heatmap.'],
      },
    ],
    workedExamples: [
      { question: `What is the primary objective of studying ${title}?`, answer: 'To master core concepts, develop analytical problem-solving skills, and achieve distinction in term examinations.' },
    ],
    practiceQuestions: [
      `Summarize the key takeaways from Module 1 of ${title} in your own words.`,
      'Explain two real-world applications of the concepts covered in this guide.',
      'Complete the revision questions on your student dashboard under the Practice section.',
    ],
  };
}

export function PDFViewerModal({ isOpen, onClose, pdfUrl, title, unlockedWeek = 1 }: PDFViewerModalProps) {
  const [viewEngine, setViewEngine] = useState<'google' | 'native'>('google');
  const [selectedTerm, setSelectedTerm] = useState<'all' | '1st' | '2nd' | '3rd'>('all');
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

  const manuscript = getSubjectSpecificManuscript(title);

  function handlePlayAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${title}. Subject: ${manuscript.subject}. ${manuscript.modules.map(m => `${m.unit}. ${m.content}`).join(' ')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
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
      <div className="relative flex h-[92vh] sm:h-[88vh] w-full max-w-5xl flex-col rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-white shadow-[12px_12px_0px_#060E1C] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex flex-col gap-2.5 border-b-[3px] sm:border-b-[4px] border-dark bg-yellow/20 p-3.5 sm:p-5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${manuscript.badgeColor}`}>
                  {manuscript.subject}
                </span>
                <span className="px-2 py-0.5 rounded border border-dark bg-white text-[9px] font-black uppercase text-dark">
                  Official Verified Note 📖
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-dark truncate leading-tight uppercase tracking-tight">
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 sm:h-10 px-2.5 sm:px-4 items-center justify-center gap-1.5 rounded-xl border-[2px] border-dark bg-white hover:bg-yellow text-dark text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] active:scale-95"
                title="Open raw file in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Raw File</span>
              </a>
              
              <a
                href={pdfUrl}
                download
                className="inline-flex h-8 sm:h-10 px-2.5 sm:px-4 items-center justify-center gap-1.5 rounded-xl border-[2px] border-dark bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] active:scale-95"
                title="Download PDF"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
              
              <button
                type="button"
                onClick={() => { handleStopAudio(); onClose(); }}
                className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-[2px] border-dark bg-rose-500 hover:bg-rose-600 text-white shadow-[2px_2px_0px_#060E1C] active:scale-95 cursor-pointer"
                aria-label="Close document viewer"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Subbar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-dark/10">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewEngine('google')}
                className={`px-3 py-1 rounded-lg border-[1.5px] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  viewEngine === 'google' ? 'bg-indigo-600 text-white border-dark shadow-[1.5px_1.5px_0px_#000]' : 'bg-white text-dark/70 border-dark/30'
                }`}
              >
                📄 Full Master PDF File Document
              </button>
              <button
                type="button"
                onClick={() => setViewEngine('native')}
                className={`px-3 py-1 rounded-lg border-[1.5px] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  viewEngine === 'native' ? 'bg-amber-400 text-dark border-dark shadow-[1.5px_1.5px_0px_#000]' : 'bg-white text-dark/70 border-dark/30'
                }`}
              >
                📖 Interactive Text Summary
              </button>
            </div>

            {/* Audio Speech Controls */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-dark/70 hidden xs:inline-flex items-center gap-1">
                <Volume2 className="h-3.5 w-3.5 text-dark" /> Read Aloud:
              </span>
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-yellow px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark shadow-[1.5px_1.5px_0px_#060E1C] cursor-pointer"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{isPaused ? 'Resume' : 'Listen'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseAudio}
                  className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-amber-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark shadow-[1.5px_1.5px_0px_#060E1C] cursor-pointer"
                >
                  <Pause className="h-3 w-3 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              {(isPlaying || isPaused) && (
                <button
                  type="button"
                  onClick={handleStopAudio}
                  className="flex items-center gap-1 rounded-lg border-[1.5px] border-dark bg-rose-200 px-1.5 py-0.5 text-[10px] font-black uppercase text-dark shadow-[1.5px_1.5px_0px_#060E1C] cursor-pointer"
                >
                  <Square className="h-3 w-3 fill-current" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reader View Engine */}
        <div className="flex-1 bg-slate-100 relative min-h-0 overflow-y-auto p-2 sm:p-6">
          {viewEngine === 'native' ? (
            <div id="interactive-document-reader" className="max-w-4xl mx-auto bg-white border-[3px] border-dark rounded-[24px] p-6 sm:p-10 shadow-[6px_6px_0px_#060E1C] space-y-8 animate-fade-up">
              
              {/* Document Banner with Pacing Lock Indicator */}
              <div className="p-6 rounded-2xl border-[3px] border-dark bg-gradient-to-r from-amber-100 via-yellow/40 to-sky-100 shadow-[3px_3px_0px_#060E1C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-dark text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Award className="h-3 w-3 text-yellow" /> Official Edvoura Curriculum Note
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-200 text-purple-950 border border-dark rounded-full text-[10px] font-black uppercase">
                      🔒 Pacing Lock: Unlocked Up To Week {unlockedWeek}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight leading-tight">{title}</h1>
                  <p className="text-xs font-bold text-dark/70 mt-1">
                    Verified Term-by-Term Manuscript &amp; Comprehensive Lesson Plan • Aligned with WAEC, IGCSE &amp; NERDC Standards
                  </p>
                </div>
                <div className="px-3.5 py-1.5 bg-emerald-300 border-[2px] border-dark rounded-xl text-xs font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C] shrink-0 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-dark" /> Published &amp; Live
                </div>
              </div>

              {/* Teaching Modules Loop with Weekly Lock Overlay */}
              <div className="space-y-6">
                <h2 className="text-xl font-black text-dark uppercase tracking-tight flex items-center gap-2 border-b-[2px] border-dark/10 pb-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" /> Teaching Modules &amp; Weekly Content
                </h2>

                {manuscript.modules.map((mod, idx) => {
                  const moduleWeekRequirement = (idx + 1) * 3; // Module 1 = Wk 1-3, Module 2 = Wk 4-6, etc.
                  const isLockedByPacing = unlockedWeek < moduleWeekRequirement && idx > 0;

                  if (isLockedByPacing) {
                    return (
                      <div key={idx} className="p-6 rounded-2xl border-[3px] border-dark bg-slate-100 opacity-85 shadow-[3px_3px_0px_#060E1C] space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-black text-dark/50">{mod.unit}</h3>
                          <span className="px-3 py-1 bg-amber-200 border-[1.5px] border-dark rounded-lg text-[10px] font-black uppercase text-amber-950 flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                            🔒 Locked by Tutor (Unlocks Week {moduleWeekRequirement})
                          </span>
                        </div>
                        <div className="p-6 rounded-xl border border-dashed border-dark/30 bg-white/70 text-center space-y-2">
                          <p className="text-xs font-black uppercase tracking-wider text-dark/60">
                            🔒 Topic Locked for Pacing Mastery
                          </p>
                          <p className="text-xs font-bold text-dark/60 max-w-md mx-auto">
                            Your tutor has locked this chapter until Week {moduleWeekRequirement} in live classes. Focus on mastering Week {unlockedWeek} notes and assignments first!
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="p-6 rounded-2xl border-[3px] border-dark bg-off-white shadow-[4px_4px_0px_#060E1C] space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-black text-dark">{mod.unit}</h3>
                        <span className="px-2.5 py-0.5 bg-emerald-200 border border-dark rounded-md text-[9px] font-black uppercase text-emerald-950">
                          🔓 Unlocked for Study
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-dark/80 leading-relaxed bg-white p-4 rounded-xl border border-dark/20">
                        {mod.content}
                      </p>
                      {mod.keyPoints && mod.keyPoints.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-dark/30 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-900">💡 Key Concept Takeaways:</span>
                          <ul className="list-disc pl-5 text-xs font-bold text-dark/80 space-y-1">
                            {mod.keyPoints.map((kp, kidx) => (
                              <li key={kidx}>{kp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Worked Examples */}
              {manuscript.workedExamples && manuscript.workedExamples.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-dark uppercase tracking-tight flex items-center gap-2 border-b-[2px] border-dark/10 pb-2">
                    <FileText className="h-5 w-5 text-purple-600" /> Step-by-Step Worked Problems &amp; Solutions
                  </h2>
                  <div className="space-y-3">
                    {manuscript.workedExamples.map((ex, idx) => (
                      <div key={idx} className="p-5 rounded-2xl border-[3px] border-dark bg-purple-50 shadow-[3px_3px_0px_#060E1C] space-y-2">
                        <p className="text-xs font-black text-dark uppercase tracking-wider">Example Problem #{idx + 1}:</p>
                        <p className="text-xs sm:text-sm font-black text-dark">{ex.question}</p>
                        <div className="p-3.5 rounded-xl bg-white border border-dark/30 text-xs font-bold text-dark/90 leading-relaxed">
                          <strong>Model Solution:</strong> {ex.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Questions */}
              {manuscript.practiceQuestions && manuscript.practiceQuestions.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-dark uppercase tracking-tight flex items-center gap-2 border-b-[2px] border-dark/10 pb-2">
                    📝 Classroom Practice &amp; Homework Exercises
                  </h2>
                  <div className="p-6 rounded-2xl border-[3px] border-dark bg-emerald-50 shadow-[3px_3px_0px_#060E1C] space-y-3">
                    <p className="text-xs font-bold text-dark/70">
                      Students should complete these practice questions independently or in class before the next tutor review:
                    </p>
                    <ol className="list-decimal pl-5 text-xs sm:text-sm font-bold text-dark/90 space-y-2">
                      {manuscript.practiceQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {/* Footer Stamp */}
              <div className="pt-4 border-t-[2px] border-dark/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-black text-dark/60">
                <span>Official Publication • Edvoura Learning Hub Academic Board</span>
                <span className="bg-white border border-dark px-3 py-1 rounded-md shadow-sm">DOC ID: EDV-PDF-2026-FULLMANUSCRIPT</span>
              </div>
            </div>
          ) : (
            <iframe
              key={viewEngine}
              src={`${pdfUrl}#toolbar=1`}
              className="h-full w-full border-none rounded-2xl bg-white shadow-inner min-h-[700px]"
              title="Full Authentic Curriculum PDF Document Viewer"
              allow="fullscreen"
            />
          )}
        </div>
      </div>
    </div>
  );
}
