'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, CheckSquare, ClipboardList, FilePenLine, Lock, Pencil, PlusCircle, ShieldCheck, Sparkles, Target, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

type LessonPlan = {
  id: string;
  className: string;
  topic: string;
  duration: string;
  lessonDate: string;
  objective: string;
  priorKnowledge: string;
  keyVocabulary: string;
  resources: string;
  differentiation: string;
  formativeAssessment: string;
  homework: string;
  safeguarding: string;
  reflection: string;
  status: 'Ready' | 'Draft';
};

import { PDFViewerModal } from '@/components/ui/PDFViewerModal';

export type OfficialCurriculumNote = {
  id: string;
  gradeCode: string;
  gradeName: string;
  subjectName: string;
  title: string;
  fileName: string;
  fileUrl: string;
  description: string;
  isPublished: boolean;
};

export const PRIMARY_1_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'p1_basic_science',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'Basic Science',
    title: 'Primary 1 Basic Science Comprehensive Lesson Notes',
    fileName: 'PRIMARY 1 BASIC SCIENCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_1/PRIMARY 1 BASIC SCIENCE LESSON NOTES.pdf',
    description: 'Complete term-by-term lesson notes covering living & non-living things, plants, animals, weather, and senses.',
    isPublished: true,
  },
  {
    id: 'p1_mathematics',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'Mathematics',
    title: 'Primary 1 Mathematics Comprehensive Lesson Notes',
    fileName: 'PRIMARY 1 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_1/PRIMARY 1 MATHEMATICS LESSON NOTES.pdf',
    description: 'Complete lesson notes covering counting 1-100, addition, subtraction, shapes, money, and time.',
    isPublished: true,
  },
  {
    id: 'p1_english',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'English Language',
    title: 'Primary 1 English Language Comprehensive Lesson Notes',
    fileName: 'PRIMARY 1 ENGLISH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_1/PRIMARY 1 ENGLISH LANGUAGE LESSON NOTES.pdf',
    description: 'Comprehensive phonics, grammar, vocabulary, reading comprehension, and handwriting lesson guides.',
    isPublished: true,
  },
  {
    id: 'p1_history',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'Nigerian History',
    title: 'Primary 1 Nigerian History Comprehensive Lesson Notes',
    fileName: 'PRIMARY 1 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_1/PRIMARY 1 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'Introduction to Nigerian heroes, national symbols, culture, traditions, and historical heritage.',
    isPublished: true,
  },
  {
    id: 'p1_arts',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'Cultural & Creative Arts',
    title: 'Primary 1 Cultural & Creative Arts Lesson Notes',
    fileName: 'PRIMARY 1 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_1/PRIMARY 1 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    description: 'Drawing, color identification, traditional music, dance, and creative crafts for young learners.',
    isPublished: true,
  },
  {
    id: 'p1_social',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'Social & Citizenship Studies',
    title: 'Primary 1 Social & Citizenship Studies Lesson Notes',
    fileName: 'PRIMARY 1 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_1/PRIMARY 1 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    description: 'Family roles, community values, civic duties, friendship, and social responsibility for Grade 1.',
    isPublished: true,
  },
  {
    id: 'p1_phe',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'Physical & Health Education',
    title: 'Primary 1 Physical & Health Education Lesson Notes',
    fileName: 'PRIMARY 1 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_1/PRIMARY 1 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    description: 'Basic bodily movements, personal hygiene, sportsmanship, and health habits.',
    isPublished: true,
  },
  {
    id: 'p1_crs',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'Christian Religious Studies',
    title: 'Primary 1 Christian Religious Studies Lesson Notes',
    fileName: 'PRIMARY 1 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_1/PRIMARY 1 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'Creation stories, moral lessons, kindness, love, and spiritual values for young children.',
    isPublished: true,
  },
  {
    id: 'p1_irs',
    gradeCode: 'grade_1',
    gradeName: 'Primary 1 (Grade 1)',
    subjectName: 'Islamic Studies',
    title: 'Primary 1 Islamic Studies Lesson Notes',
    fileName: 'PRIMARY 1 ISLAMIC STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_1/PRIMARY 1 ISLAMIC STUDIES LESSON NOTES.pdf',
    description: 'Basic Tawheed, short surahs, Islamic manners, and moral teachings for Grade 1 pupils.',
    isPublished: true,
  },
];

export const PRIMARY_2_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'p2_basic_science',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'Basic Science',
    title: 'Primary 2 Basic Science Comprehensive Lesson Notes',
    fileName: 'PRIMARY 2 BASIC SCIENCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_2/PRIMARY 2 BASIC SCIENCE LESSON NOTES.pdf',
    description: 'Detailed lesson notes covering energy, soil, water, plants, human body systems, and simple machines.',
    isPublished: true,
  },
  {
    id: 'p2_mathematics',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'Mathematics',
    title: 'Primary 2 Mathematics Comprehensive Lesson Notes',
    fileName: 'PRIMARY 2 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_2/PRIMARY 2 MATHEMATICS LESSON NOTES.pdf',
    description: 'Lesson guides covering numbers up to 500, place value, fraction concepts, 2D/3D shapes, and word problems.',
    isPublished: true,
  },
  {
    id: 'p2_english',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'English Language',
    title: 'Primary 2 English Language Comprehensive Lesson Notes',
    fileName: 'PRIMARY 2 ENGLISH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_2/PRIMARY 2 ENGLISH LANGUAGE LESSON NOTES.pdf',
    description: 'Advanced phonics, sentence building, nouns, verbs, adjectives, spelling rules, and guided reading.',
    isPublished: true,
  },
  {
    id: 'p2_history',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'Nigerian History',
    title: 'Primary 2 Nigerian History Comprehensive Lesson Notes',
    fileName: 'PRIMARY 2 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_2/PRIMARY 2 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'Traditional kingdoms, ancient leaders, state capitals, national monuments, and cultural traditions.',
    isPublished: true,
  },
  {
    id: 'p2_arts',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'Cultural & Creative Arts',
    title: 'Primary 2 Cultural & Creative Arts Lesson Notes',
    fileName: 'PRIMARY 2 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_2/PRIMARY 2 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    description: 'Craft making, traditional drama, rhythm, melody, folk songs, and Nigerian artistic heritage.',
    isPublished: true,
  },
  {
    id: 'p2_social',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'Social & Citizenship Studies',
    title: 'Primary 2 Social & Citizenship Studies Lesson Notes',
    fileName: 'PRIMARY 2 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_2/PRIMARY 2 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    description: 'Civic rights, environmental sanitation, road safety, community leadership, and social values.',
    isPublished: true,
  },
  {
    id: 'p2_phe',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'Physical & Health Education',
    title: 'Primary 2 Physical & Health Education Lesson Notes',
    fileName: 'PRIMARY 2 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_2/PRIMARY 2 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    description: 'Track and field basics, body posture, balanced diet, water sanitation, and first aid for children.',
    isPublished: true,
  },
  {
    id: 'p2_crs',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'Christian Religious Studies',
    title: 'Primary 2 Christian Religious Studies Lesson Notes',
    fileName: 'PRIMARY 2 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_2/PRIMARY 2 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'Stories of obedience, prayer habits, faith, helping others, and moral living for Grade 2.',
    isPublished: true,
  },
  {
    id: 'p2_irs',
    gradeCode: 'grade_2',
    gradeName: 'Primary 2 (Grade 2)',
    subjectName: 'Islamic Studies',
    title: 'Primary 2 Islamic Studies Lesson Notes',
    fileName: 'PRIMARY 2 ISLAMIC STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_2/PRIMARY 2 ISLAMIC STUDIES LESSON NOTES.pdf',
    description: 'Sirah of Prophet Muhammad (PBUH), daily Adhkar, Hadith, and Islamic moral etiquette for Grade 2.',
    isPublished: true,
  },
];

export const PRIMARY_3_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'p3_basic_science',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'Basic Science',
    title: 'Primary 3 Basic Science Comprehensive Lesson Notes',
    fileName: 'PRIMARY 3 BASIC SCIENCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_3/PRIMARY 3 BASIC SCIENCE LESSON NOTES.pdf',
    description: 'Comprehensive lesson notes covering living processes, technology, measurement, forces, and environmental conservation.',
    isPublished: true,
  },
  {
    id: 'p3_mathematics',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'Mathematics',
    title: 'Primary 3 Mathematics Comprehensive Lesson Notes',
    fileName: 'PRIMARY 3 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_3/PRIMARY 3 MATHEMATICS LESSON NOTES.pdf',
    description: 'Lesson guides covering numbers up to 1000, long addition/subtraction, multiplication tables, division, and introductory geometry.',
    isPublished: true,
  },
  {
    id: 'p3_english',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'English Language',
    title: 'Primary 3 English Language Comprehensive Lesson Notes',
    fileName: 'PRIMARY 3 ENGLISH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_3/PRIMARY 3 ENGLISH LANGUAGE LESSON NOTES.pdf',
    description: 'Grammar structures, composition writing, tenses, vocabulary expansion, and silent reading comprehension.',
    isPublished: true,
  },
  {
    id: 'p3_history',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'Nigerian History',
    title: 'Primary 3 Nigerian History Comprehensive Lesson Notes',
    fileName: 'PRIMARY 3 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_3/PRIMARY 3 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'Pre-colonial trade routes, ethnic groups, regional geography, national achievements, and pioneer leaders.',
    isPublished: true,
  },
  {
    id: 'p3_arts',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'Cultural & Creative Arts',
    title: 'Primary 3 Cultural & Creative Arts Lesson Notes',
    fileName: 'PRIMARY 3 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_3/PRIMARY 3 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    description: 'Modelling, traditional crafts, playwriting basics, musical instruments, and cultural festivals across Nigeria.',
    isPublished: true,
  },
  {
    id: 'p3_social',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'Social & Citizenship Studies',
    title: 'Primary 3 Social & Citizenship Studies Lesson Notes',
    fileName: 'PRIMARY 3 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_3/PRIMARY 3 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    description: 'Democracy concepts, constitution basics, environmental protection, consumer rights, and community cooperation.',
    isPublished: true,
  },
  {
    id: 'p3_phe',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'Physical & Health Education',
    title: 'Primary 3 Physical & Health Education Lesson Notes',
    fileName: 'PRIMARY 3 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_3/PRIMARY 3 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    description: 'Gymnastic movements, team sports, drug awareness, personal hygiene, and safety precautions.',
    isPublished: true,
  },
  {
    id: 'p3_crs',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'Christian Religious Studies',
    title: 'Primary 3 Christian Religious Studies Lesson Notes',
    fileName: 'PRIMARY 3 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_3/PRIMARY 3 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'Old Testament prophets, parables of Jesus, Christian ethics, forgiveness, and moral courage.',
    isPublished: true,
  },
  {
    id: 'p3_irs',
    gradeCode: 'grade_3',
    gradeName: 'Primary 3 (Grade 3)',
    subjectName: 'Islamic Studies',
    title: 'Primary 3 Islamic Studies Lesson Notes',
    fileName: 'PRIMARY 3 ISLAMIC STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_3/PRIMARY 3 ISLAMIC STUDIES LESSON NOTES.pdf',
    description: 'Surah memorization, Fiqh of Taharah & Salah, Islamic history, and ethical character building.',
    isPublished: true,
  },
];

export const PRIMARY_4_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'p4_basic_science',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Basic Science & Technology',
    title: 'Primary 4 Basic Science and Technology Lesson Notes',
    fileName: 'PRIMARY 4 BASIC SCIENCE AND TECHNOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 BASIC SCIENCE AND TECHNOLOGY LESSON NOTES.pdf',
    description: 'Comprehensive lesson notes covering living organisms, environmental pollution, energy forms, materials, and simple mechanisms.',
    isPublished: true,
  },
  {
    id: 'p4_digital_literacy',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Basic Digital Literacy',
    title: 'Primary 4 Basic Digital Literacy Lesson Notes',
    fileName: 'PRIMARY 4 BASIC DIGITAL LITERACY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 BASIC DIGITAL LITERACY LESSON NOTES.pdf',
    description: 'Introduction to computers, hardware/software, internet basics, typing, digital safety, and productivity applications.',
    isPublished: true,
  },
  {
    id: 'p4_mathematics',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Mathematics',
    title: 'Primary 4 Mathematics Comprehensive Lesson Notes',
    fileName: 'PRIMARY 4 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 MATHEMATICS LESSON NOTES.pdf',
    description: 'Numbers up to 100,000, place value, long division, fractions, decimals, perimeter, area, and estimation.',
    isPublished: true,
  },
  {
    id: 'p4_english',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'English Language',
    title: 'Primary 4 English Language Comprehensive Lesson Notes',
    fileName: 'PRIMARY 4 ENGLISH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 ENGLISH LANGUAGE LESSON NOTES.pdf',
    description: 'Parts of speech, clauses, narrative writing, descriptive essays, listening comprehension, and speech work.',
    isPublished: true,
  },
  {
    id: 'p4_french',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'French Language',
    title: 'Primary 4 French Language Comprehensive Lesson Notes',
    fileName: 'PRIMARY 4 FRENCH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 FRENCH LANGUAGE LESSON NOTES.pdf',
    description: 'Basic French greetings, family vocabulary, numbers, classroom objects, simple dialogue, and introductory grammar.',
    isPublished: true,
  },
  {
    id: 'p4_history',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Nigerian History',
    title: 'Primary 4 Nigerian History Comprehensive Lesson Notes',
    fileName: 'PRIMARY 4 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'Colonial period in Nigeria, amalgamation of 1914, nationalist leaders, independence movement, and constitutional developments.',
    isPublished: true,
  },
  {
    id: 'p4_arts',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Cultural & Creative Arts',
    title: 'Primary 4 Cultural & Creative Arts Lesson Notes',
    fileName: 'PRIMARY 4 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    description: 'Sculpture, tie and dye, traditional music composition, theatre production, and Nigerian cultural heritage.',
    isPublished: true,
  },
  {
    id: 'p4_prevocational',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Pre-Vocational Studies',
    title: 'Primary 4 Pre-Vocational Studies Lesson Notes',
    fileName: 'PRIMARY 4 PRE-VOCATIONAL STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 PRE-VOCATIONAL STUDIES LESSON NOTES.pdf',
    description: 'Agriculture fundamentals, crop farming, livestock production, home economics, nutrition, and sewing basics.',
    isPublished: true,
  },
  {
    id: 'p4_social',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Social & Citizenship Studies',
    title: 'Primary 4 Social & Citizenship Studies Lesson Notes',
    fileName: 'PRIMARY 4 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    description: 'Social problems, drug abuse prevention, civic responsibilities, state governance, and national unity.',
    isPublished: true,
  },
  {
    id: 'p4_phe',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Physical & Health Education',
    title: 'Primary 4 Physical & Health Education Lesson Notes',
    fileName: 'PRIMARY 4 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    description: 'Athletic field events, ball games, community health, personal fitness, nutrition, and emergency first aid.',
    isPublished: true,
  },
  {
    id: 'p4_crs',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Christian Religious Studies',
    title: 'Primary 4 Christian Religious Studies Lesson Notes',
    fileName: 'PRIMARY 4 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'God as Creator, life of Jesus Christ, miracles, Christian virtues, citizenship, and moral integrity.',
    isPublished: true,
  },
  {
    id: 'p4_irs',
    gradeCode: 'grade_4',
    gradeName: 'Primary 4 (Grade 4)',
    subjectName: 'Islamic Religious Studies',
    title: 'Primary 4 Islamic Religious Studies Lesson Notes',
    fileName: 'PRIMARY 4 ISLAMIC RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_4/PRIMARY 4 ISLAMIC RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'Surah recitation & translation, Hadith study, Pillars of Islam, Sunnah practices, and Islamic moral conduct.',
    isPublished: true,
  },
];

export const PRIMARY_5_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'p5_basic_science',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Basic Science & Technology',
    title: 'Primary 5 Basic Science and Technology Lesson Notes',
    fileName: 'PRY 5 BASIC SCIENCE & TECHNOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 BASIC SCIENCE & TECHNOLOGY LESSON NOTES.pdf',
    description: 'Advanced primary science covering ecosystems, rocks, magnetism, electricity, forces, sound, and technology systems.',
    isPublished: true,
  },
  {
    id: 'p5_digital_literacy',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Basic Digital Literacy',
    title: 'Primary 5 Basic Digital Literacy Lesson Notes',
    fileName: 'PRY 5 BASIC DIGITAL LITERACY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 BASIC DIGITAL LITERACY LESSON NOTES.pdf',
    description: 'Spreadsheet operations, presentation software, internet research, email etiquette, and introductory coding concepts.',
    isPublished: true,
  },
  {
    id: 'p5_mathematics',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Mathematics',
    title: 'Primary 5 Mathematics Comprehensive Lesson Notes',
    fileName: 'PRY 5 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 MATHEMATICS LESSON NOTES.pdf',
    description: 'Percentages, ratio and proportion, volume, capacity, speed, angles, statistics, and algebraic expressions.',
    isPublished: true,
  },
  {
    id: 'p5_english',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'English Language',
    title: 'Primary 5 English Language Comprehensive Lesson Notes',
    fileName: 'PRY 5 ENGLISH LANGUAGE LESSON NOTE.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 ENGLISH LANGUAGE LESSON NOTE.pdf',
    description: 'Formal and informal letter writing, argumentative essays, advanced grammar, idioms, and critical reading.',
    isPublished: true,
  },
  {
    id: 'p5_french',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'French Language',
    title: 'Primary 5 French Language Comprehensive Lesson Notes',
    fileName: 'PRY 5 FRENCH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 FRENCH LANGUAGE LESSON NOTES.pdf',
    description: 'Intermediate conversational French, time & calendar, shopping vocabulary, verb conjugations, and sentence construction.',
    isPublished: true,
  },
  {
    id: 'p5_history',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Nigerian History',
    title: 'Primary 5 Nigerian History Comprehensive Lesson Notes',
    fileName: 'PRY 5 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'Nigeria post-independence history, military eras, return to democracy, state creation history, and national symbols.',
    isPublished: true,
  },
  {
    id: 'p5_arts',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Cultural & Creative Arts',
    title: 'Primary 5 Cultural & Creative Arts Lesson Notes',
    fileName: 'PRY 5 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    description: 'Graphic design principles, choreography, music notation, drama directing, and traditional Nigerian crafts.',
    isPublished: true,
  },
  {
    id: 'p5_prevocational',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Pre-Vocational Studies',
    title: 'Primary 5 Pre-Vocational Studies Lesson Notes',
    fileName: 'PRY 5 PREVOCATIONAL STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 PREVOCATIONAL STUDIES LESSON NOTES.pdf',
    description: 'Soil fertility management, farm tools maintenance, poultry farming, food preservation, and home management.',
    isPublished: true,
  },
  {
    id: 'p5_social',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Social & Citizenship Studies',
    title: 'Primary 5 Social & Citizenship Studies Lesson Notes',
    fileName: 'PRY 5 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    description: 'Human rights, leadership qualities, conflict resolution, international organizations (ECOWAS, UN), and patriotism.',
    isPublished: true,
  },
  {
    id: 'p5_phe',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Physical & Health Education',
    title: 'Primary 5 Physical & Health Education Lesson Notes',
    fileName: 'PRY 5 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    description: 'Rhythmic activities, swimming safety, communicable disease prevention, mental health awareness, and sports officiation.',
    isPublished: true,
  },
  {
    id: 'p5_crs',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Christian Religious Studies',
    title: 'Primary 5 Christian Religious Studies Lesson Notes',
    fileName: 'PRY 5 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'Paul’s missionary journeys, early church history, fruits of the Holy Spirit, Christian living, and social justice.',
    isPublished: true,
  },
  {
    id: 'p5_irs',
    gradeCode: 'grade_5',
    gradeName: 'Primary 5 (Grade 5)',
    subjectName: 'Islamic Studies',
    title: 'Primary 5 Islamic Studies Lesson Notes',
    fileName: 'PRY 5 ISLAMIC STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_5/PRY 5 ISLAMIC STUDIES LESSON NOTES.pdf',
    description: 'Surah studies with Tajweed, Hadith analysis, Rightly Guided Caliphs, Hajj principles, and Islamic ethics.',
    isPublished: true,
  },
];

export const PRIMARY_6_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'p6_basic_science',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Basic Science & Technology',
    title: 'Primary 6 Basic Science & Technology Lesson Notes',
    fileName: 'PRIMARY 6 BASIC SCIENCE & TECHNOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 BASIC SCIENCE & TECHNOLOGY LESSON NOTES.pdf',
    description: 'National Common Entrance preparation for Science: Earth & space science, solar system, energy transformation, body systems, and simple automation.',
    isPublished: true,
  },
  {
    id: 'p6_digital_literacy',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Digital Literacy',
    title: 'Primary 6 Digital Literacy Lesson Notes',
    fileName: 'PRIMARY 6 DIGITAL LITERACY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 DIGITAL LITERACY LESSON NOTES.pdf',
    description: 'Advanced computer literacy, algorithms, block programming, internet security, multimedia editing, and tech ethics.',
    isPublished: true,
  },
  {
    id: 'p6_mathematics',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Mathematics',
    title: 'Primary 6 Mathematics Comprehensive Lesson Notes',
    fileName: 'PRIMARY 6 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 MATHEMATICS LESSON NOTES.pdf',
    description: 'National Common Entrance Math prep: Advanced word problems, compound interest, probability, algebra, 3D geometry, and quantitative reasoning.',
    isPublished: true,
  },
  {
    id: 'p6_english',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'English Language',
    title: 'Primary 6 English Language Comprehensive Lesson Notes',
    fileName: 'PRIMARY 6 ENGLISH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 ENGLISH LANGUAGE LESSON NOTES.pdf',
    description: 'National Common Entrance English prep: Essay composition, comprehension strategies, figure of speech, verbal reasoning, and advanced grammar.',
    isPublished: true,
  },
  {
    id: 'p6_french',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'French Language',
    title: 'Primary 6 French Language Comprehensive Lesson Notes',
    fileName: 'PRIMARY 6 FRENCH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 FRENCH LANGUAGE LESSON NOTES.pdf',
    description: 'Advanced primary French, essay writing in French, complex sentence structure, listening comprehension, and French culture.',
    isPublished: true,
  },
  {
    id: 'p6_history',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Nigerian History',
    title: 'Primary 6 Nigerian History Comprehensive Lesson Notes',
    fileName: 'PRIMARY 6 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'Comprehensive historical overview of Nigerian nationhood, founding fathers, constitutions, foreign relations, and modern history.',
    isPublished: true,
  },
  {
    id: 'p6_arts',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Cultural & Creative Arts',
    title: 'Primary 6 Cultural & Creative Arts Lesson Notes',
    fileName: 'PRIMARY 6 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 CULTURAL AND CREATIVE ARTS LESSON NOTES.pdf',
    description: 'Exhibition planning, art criticism, African musical heritage, stagecraft, set design, and creative entrepreneurship.',
    isPublished: true,
  },
  {
    id: 'p6_prevocational',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Pre-Vocational Studies',
    title: 'Primary 6 Pre-Vocational Studies Lesson Notes',
    fileName: 'PRIMARY 6 PREVOCATIONAL STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 PREVOCATIONAL STUDIES LESSON NOTES.pdf',
    description: 'Agricultural processing, agribusiness management, clothing construction, meal planning, and home budgeting.',
    isPublished: true,
  },
  {
    id: 'p6_social',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Social & Citizenship Studies',
    title: 'Primary 6 Social & Citizenship Studies Lesson Notes',
    fileName: 'PRIMARY 6 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    description: 'Global citizenship, human rights violations, anti-corruption agencies (EFCC, ICPC), national security, and civic participation.',
    isPublished: true,
  },
  {
    id: 'p6_phe',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Physical & Health Education',
    title: 'Primary 6 Physical & Health Education Lesson Notes',
    fileName: 'PRIMARY 6 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 PHYSICAL AND HEALTH EDUCATION LESSON NOTES.pdf',
    description: 'Tournament management, sports injuries & CPR, community health sanitation, substance abuse prevention, and physical fitness testing.',
    isPublished: true,
  },
  {
    id: 'p6_crs',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Christian Religious Studies',
    title: 'Primary 6 Christian Religious Studies Lesson Notes',
    fileName: 'PRIMARY 6 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'The Church and society, Christian leadership principles, love and harmony among religious groups, and prep for NCEE CRS.',
    isPublished: true,
  },
  {
    id: 'p6_irs',
    gradeCode: 'grade_6',
    gradeName: 'Primary 6 (Grade 6)',
    subjectName: 'Islamic Studies',
    title: 'Primary 6 Islamic Studies Lesson Notes',
    fileName: 'PRIMARY 6 ISLAMIC STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/primary_6/PRIMARY 6 ISLAMIC STUDIES LESSON NOTES.pdf',
    description: 'Exegesis (Tafseer) of selected Surahs, Hadith memorization, Islamic jurisprudence (Fiqh), and preparation for NCEE IRS.',
    isPublished: true,
  },
];

export const JSS_1_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'jss1_math',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Mathematics',
    title: 'JSS 1 Mathematics Comprehensive Lesson Notes',
    fileName: 'JSS 1 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS 1 MATHEMATICS LESSON NOTES.pdf',
    description: 'Whole numbers, prime factors, LCM/HCF, fractions, decimals, introductory algebra, plane shapes, and statistics.',
    isPublished: true,
  },
  {
    id: 'jss1_english',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'English Studies',
    title: 'JSS 1 English Studies Comprehensive Lesson Notes',
    fileName: 'JSS1 ENGLISH STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 ENGLISH STUDIES LESSON NOTES.pdf',
    description: 'Grammar fundamentals, parts of speech, continuous writing, literature in English, oral English, and reading comprehension.',
    isPublished: true,
  },
  {
    id: 'jss1_science',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Intermediate Science',
    title: 'JSS 1 Intermediate Science Lesson Notes',
    fileName: 'JSS1 INTERMEDIATE SCIENCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 INTERMEDIATE SCIENCE LESSON NOTES.pdf',
    description: 'Introduction to scientific methods, living vs non-living, matter, energy, human body, renewable resources, and forces.',
    isPublished: true,
  },
  {
    id: 'jss1_business',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Business Studies',
    title: 'JSS 1 Business Studies Lesson Notes',
    fileName: 'JSS1 BUSINESS STUDIES NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 BUSINESS STUDIES NOTES.pdf',
    description: 'Introduction to commerce, office practice, bookkeeping, secretarial duties, trade, and entrepreneurship basics.',
    isPublished: true,
  },
  {
    id: 'jss1_digital_tech',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Digital Technologies',
    title: 'JSS 1 Digital Technologies Lesson Notes',
    fileName: 'JSS1 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    description: 'Computer evolution, operating systems, word processing, internet security, information processing, and data representation.',
    isPublished: true,
  },
  {
    id: 'jss1_computer_repair',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Computer Hardware & Repairs',
    title: 'JSS 1 Computer Hardware and Repairs Lesson Notes',
    fileName: 'JSS1 COMPUTER HARDWARES AND REPAIRS LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 COMPUTER HARDWARES AND REPAIRS LESSON NOTES.pdf',
    description: 'Hardware disassembly, motherboard components, RAM/ROM diagnostics, power supply troubleshooting, and peripheral repair.',
    isPublished: true,
  },
  {
    id: 'jss1_solar',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Solar PV Installation',
    title: 'JSS 1 Solar Installation Vocational Lesson Notes',
    fileName: 'JSS1 SOLAR INSTALLATION LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 SOLAR INSTALLATION LESSON NOTES.pdf',
    description: 'Photovoltaic cells, solar panels, inverters, battery banks, charge controllers, wiring, and basic solar maintenance.',
    isPublished: true,
  },
  {
    id: 'jss1_french',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'French Language',
    title: 'JSS 1 French Language Comprehensive Lesson Notes',
    fileName: 'JSS1 FRENCH NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 FRENCH NOTES.pdf',
    description: 'Junior secondary French grammar, dialogue, family relationships, ordering food, telling time, and French culture.',
    isPublished: true,
  },
  {
    id: 'jss1_history',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Nigerian History',
    title: 'JSS 1 Nigerian History Comprehensive Lesson Notes',
    fileName: 'JSS1 NIGERIAN HISTORY NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 NIGERIAN HISTORY NOTES.pdf',
    description: 'Ancient centers of civilization (Nok, Ife, Benin, Igbo Ukwu), trans-Saharan trade, early kingdoms, and heritage preservation.',
    isPublished: true,
  },
  {
    id: 'jss1_arts',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Cultural & Creative Arts',
    title: 'JSS 1 Cultural & Creative Arts Lesson Notes',
    fileName: 'JSS1 CULTURAL AND CREATIVE ARTS NOTES1.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 CULTURAL AND CREATIVE ARTS NOTES1.pdf',
    description: 'Elements and principles of design, traditional music, dance drama, craft production, and Nigerian art history.',
    isPublished: true,
  },
  {
    id: 'jss1_social',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Social & Citizenship Studies',
    title: 'JSS 1 Social & Citizenship Studies Lesson Notes',
    fileName: 'JSS1 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    description: 'Family life education, social environment, citizenship rights and duties, national values, and crime prevention.',
    isPublished: true,
  },
  {
    id: 'jss1_phe',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Physical & Health Education',
    title: 'JSS 1 Physical & Health Education Lesson Notes',
    fileName: 'JSS1 PHYSICAL AND HEALTH EDUCATION NOTES1.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 PHYSICAL AND HEALTH EDUCATION NOTES1.pdf',
    description: 'Athletics, ball games, gymnastics, personal health, community sanitation, communicable diseases, and first aid.',
    isPublished: true,
  },
  {
    id: 'jss1_crs',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Christian Religious Studies',
    title: 'JSS 1 Christian Religious Studies Lesson Notes',
    fileName: 'JSS1 CHRISTIAN RELIGIOUS STUDIES NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 CHRISTIAN RELIGIOUS STUDIES NOTES.pdf',
    description: 'Sovereignty of God, creation story, call of Abraham, Moses, the Ten Commandments, and Christian moral living.',
    isPublished: true,
  },
  {
    id: 'jss1_irs',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Islamic Studies (IRS)',
    title: 'JSS 1 Islamic Religious Studies Lesson Notes',
    fileName: 'JSS 1 ISLAMIC RELIGIOUS STUDIES (IRS) LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS 1 ISLAMIC RELIGIOUS STUDIES (IRS) LESSON NOTES.pdf',
    description: 'Surah Al-Fatihah to Al-Fil, Hadith studies, Taharah (purification), Salah rules, and Sirah of Prophet Muhammad (PBUH).',
    isPublished: true,
  },
  {
    id: 'jss1_beauty',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Beauty & Cosmetology',
    title: 'JSS 1 Beauty & Cosmetology Vocational Lesson Notes',
    fileName: 'JSS 1 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS 1 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    description: 'Skin care, facial treatment, hair dressing, manicure & pedicure techniques, and beauty salon hygiene.',
    isPublished: true,
  },
  {
    id: 'jss1_fashion',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Fashion Design & Garment Making',
    title: 'JSS 1 Fashion Design & Garment Making Lesson Notes',
    fileName: 'JSS1 FASHION DESIGN & GARMENT MAKING LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS1 FASHION DESIGN & GARMENT MAKING LESSON NOTES.pdf',
    description: 'Body measurements, pattern drafting, sewing machine operation, garment assembly, and textile selection.',
    isPublished: true,
  },
  {
    id: 'jss1_horticulture',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Horticulture & Crop Production',
    title: 'JSS 1 Horticulture & Crop Production Lesson Notes',
    fileName: 'JSS 1 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS 1 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    description: 'Vegetable farming, ornamental plants, nursery management, soil preparation, irrigation, and crop protection.',
    isPublished: true,
  },
  {
    id: 'jss1_livestock',
    gradeCode: 'grade_7',
    gradeName: 'JSS 1 (Grade 7)',
    subjectName: 'Livestock Farming',
    title: 'JSS 1 Livestock Farming Vocational Lesson Notes',
    fileName: 'JSS 1 LIVESTOCK FARMING LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_1/JSS 1 LIVESTOCK FARMING LESSON NOTES.pdf',
    description: 'Poultry management, rabbit farming, fish farming basics, animal nutrition, housing, and disease control.',
    isPublished: true,
  },
];

export const JSS_2_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'jss2_math',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Mathematics',
    title: 'JSS 2 Mathematics Comprehensive Lesson Notes',
    fileName: 'JSS 2 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 MATHEMATICS LESSON NOTES.pdf',
    description: 'Direct & inverse proportion, linear equations, factorization, Pythagoras theorem, circles, surface area, and probability.',
    isPublished: true,
  },
  {
    id: 'jss2_english',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'English Studies',
    title: 'JSS 2 English Language Comprehensive Lesson Notes',
    fileName: 'JSS 2 ENGLISH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 ENGLISH LANGUAGE LESSON NOTES.pdf',
    description: 'Narrative vs argumentative essays, active & passive voice, stress patterns, summary writing, and literary analysis.',
    isPublished: true,
  },
  {
    id: 'jss2_science',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Intermediate Science',
    title: 'JSS 2 Intermediate Science Lesson Notes',
    fileName: 'JSS 2 INTERMEDIATE SCIENCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 INTERMEDIATE SCIENCE LESSON NOTES.pdf',
    description: 'Chemical compounds, work & energy, thermal physics, circulatory system, ecological habitats, and simple machines.',
    isPublished: true,
  },
  {
    id: 'jss2_business',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Business Studies',
    title: 'JSS 2 Business Studies Lesson Notes',
    fileName: 'JSS2 BUSINESS STUDIES NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS2 BUSINESS STUDIES NOTES.pdf',
    description: 'Cash book management, trial balance, consumer protection agencies, business ethics, insurance, and office equipment.',
    isPublished: true,
  },
  {
    id: 'jss2_digital_tech',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Digital Technologies',
    title: 'JSS 2 Digital Technologies Lesson Notes',
    fileName: 'JSS 2 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    description: 'DBMS fundamentals, SQL queries, HTML webpage creation, computer networks (LAN/WAN), and cyber safety.',
    isPublished: true,
  },
  {
    id: 'jss2_hardware_repair',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Computer Hardware & GSM Repairs',
    title: 'JSS 2 Computer Hardware and GSM Repairs Lesson Notes',
    fileName: 'JSS 2 COMPUTER HARDWARE AND GSM REPAIRS LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 COMPUTER HARDWARE AND GSM REPAIRS LESSON NOTES.pdf',
    description: 'GSM phone anatomy, soldering techniques, screen replacement, battery testing, software flashing, and multimeter usage.',
    isPublished: true,
  },
  {
    id: 'jss2_solar',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Solar PV Installation & Maintenance',
    title: 'JSS 2 Solar PV Installation & Maintenance Lesson Notes',
    fileName: 'JSS 2 SOLAR PHOTOVOLTAIC (PV) INSTALLATION AND MAINTENANCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 SOLAR PHOTOVOLTAIC (PV) INSTALLATION AND MAINTENANCE LESSON NOTES.pdf',
    description: 'System sizing calculations, roof mounting techniques, inverter setup, battery maintenance, and troubleshooting PV faults.',
    isPublished: true,
  },
  {
    id: 'jss2_french',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'French Language',
    title: 'JSS 2 French Language Comprehensive Lesson Notes',
    fileName: 'JSS 2 FRENCH NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 FRENCH NOTES.pdf',
    description: 'Past tense (Passé Composé), expressing opinions, travel vocabulary, letter writing in French, and francophone cultures.',
    isPublished: true,
  },
  {
    id: 'jss2_history',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Nigerian History',
    title: 'JSS 2 Nigerian History Comprehensive Lesson Notes',
    fileName: 'JSS 2 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'Inter-group relations in pre-colonial Nigeria, European contact, slave trade impact, missionary activities, and early resistance.',
    isPublished: true,
  },
  {
    id: 'jss2_arts',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Cultural & Creative Arts',
    title: 'JSS 2 Cultural & Creative Arts Lesson Notes',
    fileName: 'JSS2 CULTURAL & CREATIVE ARTS NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS2 CULTURAL & CREATIVE ARTS NOTES.pdf',
    description: 'Perspective drawing, batik production, musical scales, playwriting, costume design, and African art history.',
    isPublished: true,
  },
  {
    id: 'jss2_social',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Social & Citizenship Studies',
    title: 'JSS 2 Social & Citizenship Studies Lesson Notes',
    fileName: 'JSS 2 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    description: 'Value clarification, gender roles, road safety codes, anti-social behaviors, and democratic values.',
    isPublished: true,
  },
  {
    id: 'jss2_phe',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Physical & Health Education',
    title: 'JSS 2 Physical & Health Education Lesson Notes',
    fileName: 'JSS 2 PHYSICAL & HEALTH EDUCATION NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 PHYSICAL & HEALTH EDUCATION NOTES.pdf',
    description: 'Track and field officiating, posture defects, posture correction, environmental health, and emergency response.',
    isPublished: true,
  },
  {
    id: 'jss2_crs',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Christian Religious Studies',
    title: 'JSS 2 Christian Religious Studies Lesson Notes',
    fileName: 'JSS2 CHRISTIAN RELIGIOUS STUDIES NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS2 CHRISTIAN RELIGIOUS STUDIES NOTES.pdf',
    description: 'Birth and early life of Jesus, baptism, temptation, discipleship, Sermon on the Mount, and parables.',
    isPublished: true,
  },
  {
    id: 'jss2_irs',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Islamic Studies (IRS)',
    title: 'JSS 2 Islamic Religious Studies Lesson Notes',
    fileName: 'JSS 2 ISLAMIC RELIGIOUS STUDIES (IRS) LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 ISLAMIC RELIGIOUS STUDIES (IRS) LESSON NOTES.pdf',
    description: 'Surah Al-Humazah to Al-Qari\'ah, Hadith 5 to 10 of An-Nawawi, Sawm (Fasting) rules, Zakat, and Treaty of Hudaybiyyah.',
    isPublished: true,
  },
  {
    id: 'jss2_beauty',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Beauty & Cosmetology',
    title: 'JSS 2 Beauty & Cosmetology Vocational Lesson Notes',
    fileName: 'JSS 2 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    description: 'Cosmetic chemistry, skin types & analysis, professional makeup techniques, hair styling, and salon safety.',
    isPublished: true,
  },
  {
    id: 'jss2_fashion',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Fashion Design & Garment Making',
    title: 'JSS 2 Fashion Design & Garment Making Lesson Notes',
    fileName: 'JSS 2 FASHION DESIGN AND GARMENT MAKING LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 FASHION DESIGN AND GARMENT MAKING LESSON NOTES.pdf',
    description: 'Dart manipulation, collar drafting, sleeve construction, seam finishes, and fashion sketching.',
    isPublished: true,
  },
  {
    id: 'jss2_horticulture',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Horticulture & Crop Production',
    title: 'JSS 2 Horticulture & Crop Production Lesson Notes',
    fileName: 'JSS 2 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    description: 'Fruit crop production, pruning techniques, pest & disease control, post-harvest handling, and greenhouse farming.',
    isPublished: true,
  },
  {
    id: 'jss2_livestock',
    gradeCode: 'grade_8',
    gradeName: 'JSS 2 (Grade 8)',
    subjectName: 'Livestock Farming',
    title: 'JSS 2 Livestock Farming Vocational Lesson Notes',
    fileName: 'JSS 2 LIVESTOCK FARMING LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_2/JSS 2 LIVESTOCK FARMING LESSON NOTES.pdf',
    description: 'Goat and sheep rearing, piggery management, feed formulation, vaccination schedules, and farm record keeping.',
    isPublished: true,
  },
];

export const JSS_3_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'jss3_math',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Mathematics',
    title: 'JSS 3 Mathematics Comprehensive Lesson Notes (BECE Prep)',
    fileName: 'JSS 3 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 MATHEMATICS LESSON NOTES.pdf',
    description: 'BECE / Junior WAEC prep: Simultaneous equations, quadratic expressions, trigonometry, Mensuration, statistics, and matrices.',
    isPublished: true,
  },
  {
    id: 'jss3_english',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'English Studies',
    title: 'JSS 3 English Studies Comprehensive Lesson Notes (BECE Prep)',
    fileName: 'JSS3 ENGLISH STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS3 ENGLISH STUDIES LESSON NOTES.pdf',
    description: 'BECE English prep: Expository & formal letter writing, clause analysis, Figures of speech, set literature books, and oral phonetics.',
    isPublished: true,
  },
  {
    id: 'jss3_science',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Intermediate Science',
    title: 'JSS 3 Intermediate Science Lesson Notes (BECE Prep)',
    fileName: 'JSS 3 INTERMEDIATE SCIENCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 INTERMEDIATE SCIENCE LESSON NOTES.pdf',
    description: 'BECE Science prep: Atomic structure, periodic table, electric circuits, magnetism, genetics basics, space technology, and pollution.',
    isPublished: true,
  },
  {
    id: 'jss3_business',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Business Studies',
    title: 'JSS 3 Business Studies Lesson Notes (BECE Prep)',
    fileName: 'JSS 3 BUSINESS STUDIES NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 BUSINESS STUDIES NOTES.pdf',
    description: 'BECE Business Studies prep: Final accounts, balance sheet, trial balance corrections, office communication, and consumer rights.',
    isPublished: true,
  },
  {
    id: 'jss3_digital_tech',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Digital Technologies',
    title: 'JSS 3 Digital Technologies Lesson Notes',
    fileName: 'JSS 3 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    description: 'High-level programming logic (Python/JavaScript basics), database management systems, spreadsheet formulas, and digital ethics.',
    isPublished: true,
  },
  {
    id: 'jss3_hardware_repair',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Computer Hardware & GSM Repairs',
    title: 'JSS 3 Computer Hardware and GSM Repairs Lesson Notes',
    fileName: 'JSS 3 COMPUTER HARDWARE AND GSM REPAIRS LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 COMPUTER HARDWARE AND GSM REPAIRS LESSON NOTES.pdf',
    description: 'Advanced mobile phone flashing, IC chip replacement, diagnostic tools, PC assembly, and setting up a repair workshop.',
    isPublished: true,
  },
  {
    id: 'jss3_solar',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Solar PV Installation & Maintenance',
    title: 'JSS 3 Solar PV Installation & Maintenance Lesson Notes',
    fileName: 'JSS 3 SOLAR PHOTOVOLTAIC (PV) INSTALLATION AND MAINTENANCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 SOLAR PHOTOVOLTAIC (PV) INSTALLATION AND MAINTENANCE LESSON NOTES.pdf',
    description: 'Off-grid solar design, hybrid inverter commissioning, safety protocols, load auditing, and solar enterprise management.',
    isPublished: true,
  },
  {
    id: 'jss3_french',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'French Language',
    title: 'JSS 3 French Language Comprehensive Lesson Notes (BECE Prep)',
    fileName: 'JSS3 FRENCH NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS3 FRENCH NOTES.pdf',
    description: 'BECE French prep: Future tense (Futur Simple), subjunction, comprehensive reading, oral French examination prep, and letter writing.',
    isPublished: true,
  },
  {
    id: 'jss3_history',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Nigerian History',
    title: 'JSS 3 Nigerian History Comprehensive Lesson Notes (BECE Prep)',
    fileName: 'JSS 3 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'BECE History prep: Amalgamation of 1914, nationalist movements, independence in 1960, republic constitutions, and military rule.',
    isPublished: true,
  },
  {
    id: 'jss3_arts',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Cultural & Creative Arts',
    title: 'JSS 3 Cultural & Creative Arts Lesson Notes (BECE Prep)',
    fileName: 'JSS3 CULTURAL AND CREATIVE ARTS NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS3 CULTURAL AND CREATIVE ARTS NOTES.pdf',
    description: 'BECE CCA prep: Art gallery management, contemporary Nigerian artists, choreography, drama production, and musical composition.',
    isPublished: true,
  },
  {
    id: 'jss3_social',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Social & Citizenship Studies',
    title: 'JSS 3 Social & Citizenship Studies Lesson Notes (BECE Prep)',
    fileName: 'JSS 3 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 SOCIAL AND CITIZENSHIP STUDIES LESSON NOTES.pdf',
    description: 'BECE Social Studies prep: National economy, international organizations (ECOWAS, AU, UN), conflict resolution, and civic duties.',
    isPublished: true,
  },
  {
    id: 'jss3_phe',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Physical & Health Education',
    title: 'JSS 3 Physical & Health Education Lesson Notes (BECE Prep)',
    fileName: 'JSS3 PHYSICAL AND HEALTH EDUCATION NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS3 PHYSICAL AND HEALTH EDUCATION NOTES.pdf',
    description: 'BECE PHE prep: Kinesiology, exercise physiology, health agencies (WHO, NAFDAC), sports management, and recreation leadership.',
    isPublished: true,
  },
  {
    id: 'jss3_crs',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Christian Religious Studies',
    title: 'JSS 3 Christian Religious Studies Lesson Notes (BECE Prep)',
    fileName: 'JSS 3 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'BECE CRS prep: Passion, death, and resurrection of Jesus, coming of the Holy Spirit, Peter\'s speech, and early church growth.',
    isPublished: true,
  },
  {
    id: 'jss3_irs',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Islamic Studies',
    title: 'JSS 3 Islamic Religious Studies Lesson Notes (BECE Prep)',
    fileName: 'JSS 3 ISLAMIC RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 ISLAMIC RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'BECE IRS prep: Complete JSS Surah revision, Hadith application in daily life, Fiqh of inheritance (Mirath), and Islamic history.',
    isPublished: true,
  },
  {
    id: 'jss3_beauty',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Beauty & Cosmetology',
    title: 'JSS 3 Beauty & Cosmetology Vocational Lesson Notes',
    fileName: 'JSS 3 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    description: 'Advanced cosmetology, chemical hair relaxers, bridal makeup, nail art extensions, and salon management.',
    isPublished: true,
  },
  {
    id: 'jss3_fashion',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Fashion Design & Garment Making',
    title: 'JSS 3 Fashion Design & Garment Making Lesson Notes',
    fileName: 'JSS 3 FASHION DESIGN AND GARMENT MAKING LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 FASHION DESIGN AND GARMENT MAKING LESSON NOTES.pdf',
    description: 'Haute couture techniques, zipper insertion, lining attachment, fashion show presentation, and garment costing.',
    isPublished: true,
  },
  {
    id: 'jss3_horticulture',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Horticulture & Crop Production',
    title: 'JSS 3 Horticulture & Crop Production Lesson Notes',
    fileName: 'JSS 3 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    description: 'Hydroponics basics, commercial flower production, agricultural export standards, farm machinery maintenance, and agribusiness.',
    isPublished: true,
  },
  {
    id: 'jss3_livestock',
    gradeCode: 'grade_9',
    gradeName: 'JSS 3 (Grade 9)',
    subjectName: 'Livestock Farming',
    title: 'JSS 3 Livestock Farming Vocational Lesson Notes',
    fileName: 'JSS 3 LIVESTOCK FARMING LESSON NOTES.pdf',
    fileUrl: '/curriculum/jss_3/JSS 3 LIVESTOCK FARMING LESSON NOTES.pdf',
    description: 'Commercial poultry production, fish hatchery operation, animal processing, bio-security, and livestock marketing.',
    isPublished: true,
  },
];

export const SS_1_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'ss1_math',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Mathematics',
    title: 'SS 1 Mathematics Comprehensive Senior Lesson Notes',
    fileName: 'SS1 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 MATHEMATICS LESSON NOTES.pdf',
    description: 'Number bases, modular arithmetic, indices, logarithms, sets, quadratic equations, sequence & series (AP/GP), and mensuration.',
    isPublished: true,
  },
  {
    id: 'ss1_english',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'English Studies',
    title: 'SS 1 English Studies Comprehensive Senior Lesson Notes',
    fileName: 'SS1 ENGLISH STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 ENGLISH STUDIES LESSON NOTES.pdf',
    description: 'WAEC/NECO Senior English prep: Complex essay formats, comprehension techniques, summary skills, grammatical structures, and oral English phonology.',
    isPublished: true,
  },
  {
    id: 'ss1_physics',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Physics',
    title: 'SS 1 Physics Comprehensive Senior Lesson Notes',
    fileName: 'SS1 PHYSICS NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 PHYSICS NOTES.pdf',
    description: 'Physical quantities, kinematics, vectors, Newton’s laws of motion, work, energy & power, heat capacity, and wave properties.',
    isPublished: true,
  },
  {
    id: 'ss1_chemistry',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Chemistry',
    title: 'SS 1 Chemistry Comprehensive Senior Lesson Notes',
    fileName: 'SS1 CHEMISTRY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 CHEMISTRY LESSON NOTES.pdf',
    description: 'Atomic structure, chemical bonding, gas laws, mole concept, stoichiometry, acids, bases & salts, and carbon chemistry.',
    isPublished: true,
  },
  {
    id: 'ss1_biology',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Biology',
    title: 'SS 1 Biology Comprehensive Senior Lesson Notes',
    fileName: 'SS1 BIOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 BIOLOGY LESSON NOTES.pdf',
    description: 'Cell biology, organization of life, plant & animal nutrition, transport systems, respiration, and ecosystem dynamics.',
    isPublished: true,
  },
  {
    id: 'ss1_further_math',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Further Mathematics',
    title: 'SS 1 Further Mathematics Advanced Lesson Notes',
    fileName: 'SS1 FURTHER MATHEMATICS LESSON NOTES(1).pdf',
    fileUrl: '/curriculum/ss_1/SS1 FURTHER MATHEMATICS LESSON NOTES(1).pdf',
    description: 'Advanced algebra, surds, polynomials, partial fractions, binary operations, matrices, vectors, and introductory calculus.',
    isPublished: true,
  },
  {
    id: 'ss1_agric',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Agricultural Science',
    title: 'SS 1 Agricultural Science Senior Lesson Notes',
    fileName: 'SS1 AGRICULTURAL SCIENCE NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 AGRICULTURAL SCIENCE NOTES.pdf',
    description: 'Land tenure systems, farm mechanization, soil chemistry & physics, crop husbandry, and agricultural ecology.',
    isPublished: true,
  },
  {
    id: 'ss1_geography',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Geography',
    title: 'SS 1 Geography Senior Lesson Notes',
    fileName: 'SS1 GEOGRAPHY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 GEOGRAPHY LESSON NOTES.pdf',
    description: 'Earth’s crust & landforms, weather & climate, map reading & interpretation, rock types, and environmental conservation.',
    isPublished: true,
  },
  {
    id: 'ss1_economics',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Economics',
    title: 'SS 1 Economics Senior Lesson Notes',
    fileName: 'SS1 ECONOMICS NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 ECONOMICS NOTES.pdf',
    description: 'Demand & supply analysis, elasticity, production theory, business organizations, market structures, and financial institutions.',
    isPublished: true,
  },
  {
    id: 'ss1_government',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Government',
    title: 'SS 1 Government Senior Lesson Notes',
    fileName: 'SS1 GOVERNMENT LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 GOVERNMENT LESSON NOTES.pdf',
    description: 'Basic concepts of state & nation, organs of government, political ideologies (democracy, socialism), and constitutional developments.',
    isPublished: true,
  },
  {
    id: 'ss1_accounting',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Financial Accounting',
    title: 'SS 1 Financial Accounting Senior Lesson Notes',
    fileName: 'SS1 FINANCIAL ACCOUNTING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 FINANCIAL ACCOUNTING LESSON NOTES.pdf',
    description: 'Double entry bookkeeping, ledger postings, trial balance, bank reconciliation statements, and sole trader final accounts.',
    isPublished: true,
  },
  {
    id: 'ss1_commerce',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Commerce',
    title: 'SS 1 Commerce Senior Lesson Notes',
    fileName: 'SS1 COMMERCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 COMMERCE LESSON NOTES.pdf',
    description: 'Home & foreign trade, wholesale/retail trade, transport, warehousing, advertising, and commercial documents.',
    isPublished: true,
  },
  {
    id: 'ss1_marketing',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Marketing',
    title: 'SS 1 Marketing Senior Lesson Notes',
    fileName: 'SS1 MARKETING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 MARKETING LESSON NOTES.pdf',
    description: 'Marketing mix (4 Ps), consumer behavior, market segmentation, product branding, sales promotion, and e-marketing.',
    isPublished: true,
  },
  {
    id: 'ss1_literature',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Literature-in-English',
    title: 'SS 1 Literature-in-English Senior Lesson Notes',
    fileName: 'SS1 LITERATURE-IN-ENGLISH LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 LITERATURE-IN-ENGLISH LESSON NOTES.pdf',
    description: 'African & non-African prose, drama, poetry analysis, literary devices, characterization, and thematic themes.',
    isPublished: true,
  },
  {
    id: 'ss1_history',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Nigerian History',
    title: 'SS 1 Nigerian History Senior Lesson Notes',
    fileName: 'SS1 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'Colonial administration in Nigeria, Lugard’s indirect rule, resistance movements, economic exploitation, and constitutional conferences.',
    isPublished: true,
  },
  {
    id: 'ss1_crs',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Christian Religious Studies',
    title: 'SS 1 Christian Religious Studies Senior Lesson Notes',
    fileName: 'SS1 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'Supreme God in African traditional religion vs Christianity, call to service (Deborah, Gideon), wisdom of Solomon, and prophetic ministry.',
    isPublished: true,
  },
  {
    id: 'ss1_citizenship',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Citizenship & Heritage Studies',
    title: 'SS 1 Citizenship & Heritage Studies Lesson Notes',
    fileName: 'SS1 CITIZENSHIP AND HERITAGE STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 CITIZENSHIP AND HERITAGE STUDIES LESSON NOTES.pdf',
    description: 'Rule of law, human rights defense, national consciousness, cultural preservation, anti-corruption, and peacebuilding.',
    isPublished: true,
  },
  {
    id: 'ss1_digital_tech',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Digital Technologies',
    title: 'SS 1 Digital Technologies Senior Lesson Notes',
    fileName: 'SS1 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    description: 'High-level programming languages, algorithm flowcharts, web development (HTML/CSS), computer ethics, and network topologies.',
    isPublished: true,
  },
  {
    id: 'ss1_hardware_repair',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Computer Hardware & GSM Repairs',
    title: 'SS 1 Computer Hardware & GSM Repairs Vocational Notes',
    fileName: 'SS 1 COMPUTER HARDWARE AND GSM REPAIRS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS 1 COMPUTER HARDWARE AND GSM REPAIRS LESSON NOTES.pdf',
    description: 'Motherboard architecture, SMD component soldering, GSM network decoding, laptop screen replacement, and BIOS flashing.',
    isPublished: true,
  },
  {
    id: 'ss1_solar',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Solar Photovoltaic (PV) Installation',
    title: 'SS 1 Solar Photovoltaic Installation Vocational Notes',
    fileName: 'SS1 SOLAR PHOTOVOLTAIC INSTALLATION LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 SOLAR PHOTOVOLTAIC INSTALLATION LESSON NOTES.pdf',
    description: 'Solar irradiance science, PV array tilt angle optimization, MPPT vs PWM charge controllers, battery chemistry, and solar safety codes.',
    isPublished: true,
  },
  {
    id: 'ss1_technical_drawing',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Technical Drawing',
    title: 'SS 1 Technical Drawing Senior Lesson Notes',
    fileName: 'SS1 TECHNICAL DRAWING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 TECHNICAL DRAWING LESSON NOTES.pdf',
    description: 'Geometrical construction, isometric & orthographic projections, scale drawing, sectioning, and CAD fundamentals.',
    isPublished: true,
  },
  {
    id: 'ss1_visual_arts',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Visual Arts',
    title: 'SS 1 Visual Arts Senior Lesson Notes',
    fileName: 'SS1 VISUAL ARTS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 VISUAL ARTS LESSON NOTES.pdf',
    description: 'Two-dimensional & three-dimensional art, sculpture, textile printing (Batik/Tie-dye), ceramics, and art history of Nigeria.',
    isPublished: true,
  },
  {
    id: 'ss1_food_nutrition',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Food & Nutrition',
    title: 'SS 1 Food & Nutrition Senior Lesson Notes',
    fileName: 'SS1 FOOD AND NUTRITION LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 FOOD AND NUTRITION LESSON NOTES.pdf',
    description: 'Nutrient chemistry, digestion & metabolism, kitchen equipment safety, meal planning for different age groups, and food preservation.',
    isPublished: true,
  },
  {
    id: 'ss1_catering',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Catering & Craft Practice',
    title: 'SS 1 Catering & Craft Practice Senior Lesson Notes',
    fileName: 'SS1 CATERING AND CRAFT PRACTICE LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 CATERING AND CRAFT PRACTICE LESSON NOTES.pdf',
    description: 'Hospitality industry operations, menu planning, culinary methods (baking, roasting, poaching), food service, and sanitation.',
    isPublished: true,
  },
  {
    id: 'ss1_beauty',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Beauty & Cosmetology',
    title: 'SS 1 Beauty & Cosmetology Vocational Lesson Notes',
    fileName: 'SS1 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    description: 'Dermatology fundamentals, advanced facials, chemical hair treatments, nail technology, and salon enterprise management.',
    isPublished: true,
  },
  {
    id: 'ss1_fashion',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Fashion Design & Garment Making',
    title: 'SS 1 Fashion Design & Garment Making Senior Notes',
    fileName: 'SS 1 FASHION DESIGN AND GARMENT MAKING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS 1 FASHION DESIGN AND GARMENT MAKING LESSON NOTES.pdf',
    description: 'Advanced pattern drafting, garment fitting, industrial sewing machine operation, fashion illustration, and boutique management.',
    isPublished: true,
  },
  {
    id: 'ss1_horticulture',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Horticulture & Crop Production',
    title: 'SS 1 Horticulture & Crop Production Senior Notes',
    fileName: 'SS1 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    description: 'Landscape design, floriculture, commercial nursery production, plant propagation (grafting/budding), and greenhouse management.',
    isPublished: true,
  },
  {
    id: 'ss1_livestock',
    gradeCode: 'grade_10',
    gradeName: 'SS 1 (Grade 10)',
    subjectName: 'Livestock Farming',
    title: 'SS 1 Livestock Farming Vocational Senior Notes',
    fileName: 'SS1 LIVESTOCK FARMING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_1/SS1 LIVESTOCK FARMING LESSON NOTES.pdf',
    description: 'Commercial livestock breeding, aquaculture engineering, animal disease immunology, feed milling technology, and farm accounting.',
    isPublished: true,
  },
];

export const SS_2_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'ss2_math',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Mathematics',
    title: 'SS 2 Mathematics Senior Secondary Lesson Notes',
    fileName: 'SS2 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 MATHEMATICS LESSON NOTES.pdf',
    description: 'Logarithms & surds, linear inequalities, circle geometry, trigonometry (Sine/Cosine rules), bearings & distances, and probability.',
    isPublished: true,
  },
  {
    id: 'ss2_english',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'English Language',
    title: 'SS 2 English Language Senior Secondary Lesson Notes',
    fileName: 'SS2 ENGLISH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 ENGLISH LANGUAGE LESSON NOTES.pdf',
    description: 'Speech writing, argumentative essays, advanced comprehension strategies, grammatical concord, registers, and phonology.',
    isPublished: true,
  },
  {
    id: 'ss2_physics',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Physics',
    title: 'SS 2 Physics Senior Secondary Lesson Notes',
    fileName: 'SS2 PHYSICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 PHYSICS LESSON NOTES.pdf',
    description: 'Simple harmonic motion, optical instruments, wave motion & sound, electrostatics, current electricity, and electromagnetic induction.',
    isPublished: true,
  },
  {
    id: 'ss2_chemistry',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Chemistry',
    title: 'SS 2 Chemistry Senior Secondary Lesson Notes',
    fileName: 'SS2 CHEMISTRY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 CHEMISTRY LESSON NOTES.pdf',
    description: 'Periodic table trends, chemical energetic, reaction rates, chemical equilibrium, redox reactions, electrolysis, and hydrocarbons.',
    isPublished: true,
  },
  {
    id: 'ss2_biology',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Biology',
    title: 'SS 2 Biology Senior Secondary Lesson Notes',
    fileName: 'SS2 BIOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 BIOLOGY LESSON NOTES.pdf',
    description: 'Excretory systems, nervous coordination, sense organs, hormonal control, plant reproduction, and genetics fundamentals.',
    isPublished: true,
  },
  {
    id: 'ss2_further_math',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Further Mathematics',
    title: 'SS 2 Further Mathematics Senior Secondary Notes',
    fileName: 'SS2 FURTHER MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 FURTHER MATHEMATICS LESSON NOTES.pdf',
    description: 'Differential & integral calculus, coordinate geometry (conics), mechanics (statics & dynamics), probability distributions, and matrices.',
    isPublished: true,
  },
  {
    id: 'ss2_agric',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Agricultural Science',
    title: 'SS 2 Agricultural Science Senior Secondary Notes',
    fileName: 'SS2 AGRICULTURAL SCIENCE NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 AGRICULTURAL SCIENCE NOTES.pdf',
    description: 'Crop improvement, animal nutrition & digestive systems, pasture management, farm surveying, and agricultural extension.',
    isPublished: true,
  },
  {
    id: 'ss2_geography',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Geography',
    title: 'SS 2 Geography Senior Secondary Lesson Notes',
    fileName: 'SS2 GEOGRAPHY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 GEOGRAPHY LESSON NOTES.pdf',
    description: 'Climatic classifications, oceanography, GIS fundamentals, population geography, settlement patterns, and economic geography of Nigeria.',
    isPublished: true,
  },
  {
    id: 'ss2_economics',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Economics',
    title: 'SS 2 Economics Senior Secondary Lesson Notes',
    fileName: 'SS2 ECONOMICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 ECONOMICS LESSON NOTES.pdf',
    description: 'National income accounting, money & banking, inflation & deflation, public finance, taxation, and international trade.',
    isPublished: true,
  },
  {
    id: 'ss2_government',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Government',
    title: 'SS 2 Government Senior Secondary Lesson Notes',
    fileName: 'SS2 GOVERNMENT LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 GOVERNMENT LESSON NOTES.pdf',
    description: 'Pre-colonial political systems in Nigeria, colonial administration, nationalism, Nigerian federalism, and foreign policy.',
    isPublished: true,
  },
  {
    id: 'ss2_accounting',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Financial Accounting',
    title: 'SS 2 Financial Accounting Senior Secondary Notes',
    fileName: 'SS2 FINANCIAL ACCOUNTING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 FINANCIAL ACCOUNTING LESSON NOTES.pdf',
    description: 'Partnership accounts, manufacturing accounts, non-profit organization accounts, control accounts, and incomplete records.',
    isPublished: true,
  },
  {
    id: 'ss2_commerce',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Commerce',
    title: 'SS 2 Commerce Senior Secondary Lesson Notes',
    fileName: 'SS2 COMMERCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 COMMERCE LESSON NOTES.pdf',
    description: 'Capital structure, stock exchange operations, commercial law, contract law, agency, and business communication.',
    isPublished: true,
  },
  {
    id: 'ss2_marketing',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Marketing',
    title: 'SS 2 Marketing Senior Secondary Lesson Notes',
    fileName: 'SS2 MARKETING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 MARKETING LESSON NOTES.pdf',
    description: 'Market research methods, product life cycle, distribution channels, pricing strategies, international marketing, and customer service.',
    isPublished: true,
  },
  {
    id: 'ss2_literature',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Literature-in-English',
    title: 'SS 2 Literature-in-English Senior Secondary Notes',
    fileName: 'SS2 LITERATURE-IN-ENGLISH LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 LITERATURE-IN-ENGLISH LESSON NOTES.pdf',
    description: 'Detailed analysis of prescribed WAEC/NECO Literature texts, dramatic techniques, poetic forms, and unseen poetry/prose.',
    isPublished: true,
  },
  {
    id: 'ss2_history',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Nigerian History',
    title: 'SS 2 Nigerian History Senior Secondary Notes',
    fileName: 'SS2 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'Decolonization process in Nigeria, constitutional developments (1922-1960), First Republic politics, and the Nigerian Civil War.',
    isPublished: true,
  },
  {
    id: 'ss2_crs',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Christian Religious Studies',
    title: 'SS 2 Christian Religious Studies Senior Notes',
    fileName: 'SS2 CHRISTIAN RELIGIOUS STUDIES NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 CHRISTIAN RELIGIOUS STUDIES NOTES.pdf',
    description: 'Baptism and temptation of Jesus, miracles, parables of the Kingdom, the Transfiguration, and trial & crucifixion of Jesus.',
    isPublished: true,
  },
  {
    id: 'ss2_citizenship',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Citizenship & Heritage Studies',
    title: 'SS 2 Citizenship & Heritage Studies Notes',
    fileName: 'SS2 CITIZENSHIP AND HERITAGE STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 CITIZENSHIP AND HERITAGE STUDIES LESSON NOTES.pdf',
    description: 'Civil society organizations, electoral process, human trafficking prevention, drug law enforcement (NDLEA), and national security.',
    isPublished: true,
  },
  {
    id: 'ss2_digital_tech',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Digital Technologies',
    title: 'SS 2 Digital Technologies Senior Notes',
    fileName: 'SS2 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    description: 'Object-oriented programming concepts, database management (SQL joins), web application security, and network administration.',
    isPublished: true,
  },
  {
    id: 'ss2_hardware_repair',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Computer Hardware & GSM Repairs',
    title: 'SS 2 Computer Hardware & GSM Repairs Notes',
    fileName: 'SS2 COMPUTER HARDWARE AND GSM REPAIRS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 COMPUTER HARDWARE AND GSM REPAIRS LESSON NOTES.pdf',
    description: 'BGA chip reballing, logic board repair, GSM unlocked firmware installation, PC power supply repair, and diagnostic tools.',
    isPublished: true,
  },
  {
    id: 'ss2_solar',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Solar Photovoltaic (PV) Installation',
    title: 'SS 2 Solar Photovoltaic Installation Notes',
    fileName: 'SS2 SOLAR PHOTOVOLTAIC INSTALLATION LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 SOLAR PHOTOVOLTAIC INSTALLATION LESSON NOTES.pdf',
    description: 'Commercial solar engineering, grid-tied PV systems, net metering principles, lithium battery BMS, and solar farm maintenance.',
    isPublished: true,
  },
  {
    id: 'ss2_technical_drawing',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Technical Drawing',
    title: 'SS 2 Technical Drawing Senior Secondary Notes',
    fileName: 'SS2 TECHNICAL DRAWING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 TECHNICAL DRAWING LESSON NOTES.pdf',
    description: 'Auxiliary projections, developments of solids, intersection of surfaces, mechanical fasteners, and 2D/3D CAD modeling.',
    isPublished: true,
  },
  {
    id: 'ss2_visual_arts',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Visual Arts',
    title: 'SS 2 Visual Arts Senior Secondary Notes',
    fileName: 'SS2 VISUAL ARTS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 VISUAL ARTS LESSON NOTES.pdf',
    description: 'Graphic design principles, advertising art, photography, museum curation, western art history, and art entrepreneurship.',
    isPublished: true,
  },
  {
    id: 'ss2_food_nutrition',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Food & Nutrition',
    title: 'SS 2 Food & Nutrition Senior Secondary Notes',
    fileName: 'SS2 FOOD AND NUTRITION LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 FOOD AND NUTRITION LESSON NOTES.pdf',
    description: 'Experimental cookery, therapeutic diets, food additives, consumer food education, and large-scale catering management.',
    isPublished: true,
  },
  {
    id: 'ss2_catering',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Catering & Craft Practice',
    title: 'SS 2 Catering & Craft Practice Notes',
    fileName: 'SS2 CATERING AND CRAFT LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 CATERING AND CRAFT LESSON NOTES.pdf',
    description: 'Advanced culinary arts, international cuisine, beverage service, hotel front office operations, and banqueting.',
    isPublished: true,
  },
  {
    id: 'ss2_beauty',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Beauty & Cosmetology',
    title: 'SS 2 Beauty & Cosmetology Vocational Notes',
    fileName: 'SS2 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    description: 'Aesthetic therapy, body massage techniques, advanced hair coloring, salon management software, and spa therapy.',
    isPublished: true,
  },
  {
    id: 'ss2_fashion',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Fashion Design & Garment Making',
    title: 'SS 2 Fashion Design & Garment Making Notes',
    fileName: 'SS2 FASHION DESIGN AND GARMENT MAKING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 FASHION DESIGN AND GARMENT MAKING LESSON NOTES.pdf',
    description: 'Tailoring construction, suit drafting, evening gown design, computer-aided garment design (CAD), and fashion marketing.',
    isPublished: true,
  },
  {
    id: 'ss2_horticulture',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Horticulture & Crop Production',
    title: 'SS 2 Horticulture & Crop Production Notes',
    fileName: 'SS2 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    description: 'Commercial fruit orchards, tissue culture propagation, organic farming certification, agricultural exports, and farm mechanization.',
    isPublished: true,
  },
  {
    id: 'ss2_livestock',
    gradeCode: 'grade_11',
    gradeName: 'SS 2 (Grade 11)',
    subjectName: 'Livestock Farming',
    title: 'SS 2 Livestock Farming Vocational Notes',
    fileName: 'SS2 LIVESTOCK FARMING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_2/SS2 LIVESTOCK FARMING LESSON NOTES.pdf',
    description: 'Cattle ranching, dairy processing, commercial hatchery technology, animal epidemiology, and livestock business financing.',
    isPublished: true,
  },
];

export const SS_3_OFFICIAL_NOTES: OfficialCurriculumNote[] = [
  {
    id: 'ss3_math',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Mathematics',
    title: 'SS 3 Mathematics (WAEC / NECO / JAMB)',
    fileName: 'SS3 MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 MATHEMATICS LESSON NOTES.pdf',
    description: 'WAEC/NECO exit prep: Matrices & determinants, calculus applications, 3D geometry, statistics (variance/std dev), and probability.',
    isPublished: true,
  },
  {
    id: 'ss3_english',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'English Language',
    title: 'SS 3 English Language (WAEC / NECO / JAMB)',
    fileName: 'SS3 ENGLISH LANGUAGE LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 ENGLISH LANGUAGE LESSON NOTES.pdf',
    description: 'Senior exit exam mastery: Essay structure perfection, summary writing tricks, comprehension strategies, and oral English test of orals.',
    isPublished: true,
  },
  {
    id: 'ss3_physics',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Physics',
    title: 'SS 3 Physics (WAEC / NECO / JAMB)',
    fileName: 'SS3 PHYSICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 PHYSICS LESSON NOTES.pdf',
    description: 'Electromagnetism, AC circuits, atomic & nuclear physics, radioactivity, semiconductors, wave-particle duality, and energy quantization.',
    isPublished: true,
  },
  {
    id: 'ss3_chemistry',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Chemistry',
    title: 'SS 3 Chemistry (WAEC / NECO / JAMB)',
    fileName: 'SS3 CHEMISTRY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 CHEMISTRY LESSON NOTES.pdf',
    description: 'Volumetric & qualitative analysis, organic chemistry (polymers, alkanols, alkanoic acids), industrial chemistry, and nuclear chemistry.',
    isPublished: true,
  },
  {
    id: 'ss3_biology',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Biology',
    title: 'SS 3 Biology (WAEC / NECO / JAMB)',
    fileName: 'SS3 BIOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 BIOLOGY LESSON NOTES.pdf',
    description: 'Genetics & heredity, variation & evolution, ecological succession, conservation of natural resources, and biotechnology applications.',
    isPublished: true,
  },
  {
    id: 'ss3_further_math',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Further Mathematics',
    title: 'SS 3 Further Mathematics Exit Notes',
    fileName: 'SS3 FURTHER MATHEMATICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 FURTHER MATHEMATICS LESSON NOTES.pdf',
    description: 'Differential equations, vector calculus, dynamics (projectiles, impulse, momentum), numerical methods, and correlation/regression.',
    isPublished: true,
  },
  {
    id: 'ss3_agric',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Agricultural Science',
    title: 'SS 3 Agricultural Science Exit Notes',
    fileName: 'SS3 AGRICULTURAL SCIENCE NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 AGRICULTURAL SCIENCE NOTES.pdf',
    description: 'Agro-business management, agricultural financing & insurance, farm records, export crops, and biotechnology in farming.',
    isPublished: true,
  },
  {
    id: 'ss3_geography',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Geography',
    title: 'SS 3 Geography Senior Exit Notes',
    fileName: 'SS3 GEOGRAPHY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 GEOGRAPHY LESSON NOTES.pdf',
    description: 'Map reading & topographical analysis, regional geography of Africa & world, industrial location theories, and environmental hazards.',
    isPublished: true,
  },
  {
    id: 'ss3_economics',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Economics',
    title: 'SS 3 Economics (WAEC / NECO / JAMB)',
    fileName: 'SS3 ECONOMICS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 ECONOMICS LESSON NOTES.pdf',
    description: 'Economic development plans, international economic organizations (ECOWAS, OPEC, IMF), balance of payments, and economic growth.',
    isPublished: true,
  },
  {
    id: 'ss3_accounting',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Financial Accounting',
    title: 'SS 3 Financial Accounting Exit Notes',
    fileName: 'SS3 FINANCIAL ACCOUNTING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 FINANCIAL ACCOUNTING LESSON NOTES.pdf',
    description: 'Company accounts, issue of shares & debentures, departmental & branch accounts, auditing, and public sector accounting.',
    isPublished: true,
  },
  {
    id: 'ss3_commerce',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Commerce',
    title: 'SS 3 Commerce Senior Exit Notes',
    fileName: 'SS3 COMMERCE LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 COMMERCE LESSON NOTES.pdf',
    description: 'Business privatization, deregulation, globalization, consumer protection rights (CPC, NAFDAC), and electronic commerce.',
    isPublished: true,
  },
  {
    id: 'ss3_marketing',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Marketing',
    title: 'SS 3 Marketing Senior Exit Notes',
    fileName: 'SS3 MARKETING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 MARKETING LESSON NOTES.pdf',
    description: 'Strategic marketing management, digital marketing campaigns, sales force management, trade fairs, and export marketing.',
    isPublished: true,
  },
  {
    id: 'ss3_literature',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Literature-in-English',
    title: 'SS 3 Literature-in-English Exit Notes',
    fileName: 'SS3 LITERATURE-IN-ENGLISH LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 LITERATURE-IN-ENGLISH LESSON NOTES.pdf',
    description: 'Comprehensive WAEC/NECO set-book revision, comparative literary analysis, literary appreciation, and exam past paper strategies.',
    isPublished: true,
  },
  {
    id: 'ss3_history',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Nigerian History',
    title: 'SS 3 Nigerian History Exit Notes',
    fileName: 'SS3 NIGERIAN HISTORY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 NIGERIAN HISTORY LESSON NOTES.pdf',
    description: 'Post-civil war reconstruction, military regimes in Nigeria, Fourth Republic democracy, regional integration, and international relations.',
    isPublished: true,
  },
  {
    id: 'ss3_crs',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Christian Religious Studies',
    title: 'SS 3 Christian Religious Studies Exit Notes',
    fileName: 'SS3 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 CHRISTIAN RELIGIOUS STUDIES LESSON NOTES.pdf',
    description: 'The Resurrection and Ascension, the Early Church (Acts of the Apostles), Paul’s epistles on faith & salvation, and Christian living in society.',
    isPublished: true,
  },
  {
    id: 'ss3_citizenship',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Citizenship & Heritage Studies',
    title: 'SS 3 Citizenship & Heritage Studies Exit Notes',
    fileName: 'SS3 CITIZENSHIP AND HERITAGE STUDIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 CITIZENSHIP AND HERITAGE STUDIES LESSON NOTES.pdf',
    description: 'Constitutional democracy, public service integrity, anti-cybercrime laws, civic duties, and national development goals.',
    isPublished: true,
  },
  {
    id: 'ss3_digital_tech',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Digital Technologies',
    title: 'SS 3 Digital Technologies Exit Notes',
    fileName: 'SS3 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 DIGITAL TECHNOLOGIES LESSON NOTES.pdf',
    description: 'Cloud computing, Artificial Intelligence basics, cybersecurity engineering, mobile app development, and tech startup entrepreneurship.',
    isPublished: true,
  },
  {
    id: 'ss3_hardware_repair',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Computer Hardware & GSM Repairs',
    title: 'SS 3 Computer Hardware & GSM Repairs Exit Notes',
    fileName: 'SS3 COMPUTER HARDWARE AND GSM REPAIRS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 COMPUTER HARDWARE AND GSM REPAIRS LESSON NOTES.pdf',
    description: 'Advanced micro-soldering, smartphone motherboard repair, server rack maintenance, firmware recovery, and tech workshop setup.',
    isPublished: true,
  },
  {
    id: 'ss3_solar',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Solar Photovoltaic (PV) Installation',
    title: 'SS 3 Solar Photovoltaic Installation Exit Notes',
    fileName: 'SS3 SOLAR PHOTOVOLTAIC INSTALLATION LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 SOLAR PHOTOVOLTAIC INSTALLATION LESSON NOTES.pdf',
    description: 'Industrial solar system design, mini-grid installation, electrical load calculation, solar inverter repair, and clean energy business.',
    isPublished: true,
  },
  {
    id: 'ss3_technical_drawing',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Technical Drawing',
    title: 'SS 3 Technical Drawing Exit Notes',
    fileName: 'SS3 TECHNICAL DRAWING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 TECHNICAL DRAWING LESSON NOTES.pdf',
    description: 'Architectural floor plans, structural steel drawings, mechanical assembly drawings, building services drafting, and AutoCAD certification prep.',
    isPublished: true,
  },
  {
    id: 'ss3_visual_arts',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Visual Arts',
    title: 'SS 3 Visual Arts Exit Notes',
    fileName: 'SS3 VISUAL ARTS LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 VISUAL ARTS LESSON NOTES.pdf',
    description: 'Art exhibition organization, art studio practice, art criticism, digital illustration, and commercial branding portfolio.',
    isPublished: true,
  },
  {
    id: 'ss3_food_nutrition',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Food & Nutrition',
    title: 'SS 3 Food & Nutrition Exit Notes',
    fileName: 'SS3 FOOD AND NUTRITION LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 FOOD AND NUTRITION LESSON NOTES.pdf',
    description: 'Food technology & processing, quality control, food legislation, commercial confectionery, and restaurant management.',
    isPublished: true,
  },
  {
    id: 'ss3_catering',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Catering & Craft Practice',
    title: 'SS 3 Catering & Craft Practice Exit Notes',
    fileName: 'SS3 CATERING AND CRAFT PRACTICE LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 CATERING AND CRAFT PRACTICE LESSON NOTES.pdf',
    description: 'Event catering management, food cost accounting, kitchen layout design, gourmet food presentation, and hospitality entrepreneurship.',
    isPublished: true,
  },
  {
    id: 'ss3_beauty',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Beauty & Cosmetology',
    title: 'SS 3 Beauty & Cosmetology Exit Notes',
    fileName: 'SS3 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 BEAUTY AND COSMETOLOGY LESSON NOTES.pdf',
    description: 'Cosmetic formulation science, spa management, bridal makeup artistry, salon franchising, and regulatory compliance.',
    isPublished: true,
  },
  {
    id: 'ss3_fashion',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Fashion Design & Garment Making',
    title: 'SS 3 Fashion Design & Garment Making Exit Notes',
    fileName: 'SS3 FASHION DESIGN AND GARMENT MAKING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 FASHION DESIGN AND GARMENT MAKING LESSON NOTES.pdf',
    description: 'Fashion show collection production, haute couture techniques, garment quality assurance, textile exporting, and fashion brand building.',
    isPublished: true,
  },
  {
    id: 'ss3_horticulture',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Horticulture & Crop Production',
    title: 'SS 3 Horticulture & Crop Production Exit Notes',
    fileName: 'SS3 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 HORTICULTURE AND CROP PRODUCTION LESSON NOTES.pdf',
    description: 'Commercial hydroponics, vertical farming technology, urban landscaping contracts, seed processing, and agro-export business.',
    isPublished: true,
  },
  {
    id: 'ss3_livestock',
    gradeCode: 'grade_12',
    gradeName: 'SS 3 (Grade 12)',
    subjectName: 'Livestock Farming',
    title: 'SS 3 Livestock Farming Exit Notes',
    fileName: 'SS3 LIVESTOCK FARMING LESSON NOTES.pdf',
    fileUrl: '/curriculum/ss_3/SS3 LIVESTOCK FARMING LESSON NOTES.pdf',
    description: 'Industrial livestock processing, commercial feed mill operation, veterinary pharmacology, livestock insurance, and agro-exporting.',
    isPublished: true,
  },
];

export const OFFICIAL_CURRICULUM_DATABASE: Record<string, OfficialCurriculumNote[]> = {
  grade_1: PRIMARY_1_OFFICIAL_NOTES,
  grade_2: PRIMARY_2_OFFICIAL_NOTES,
  grade_3: PRIMARY_3_OFFICIAL_NOTES,
  grade_4: PRIMARY_4_OFFICIAL_NOTES,
  grade_5: PRIMARY_5_OFFICIAL_NOTES,
  grade_6: PRIMARY_6_OFFICIAL_NOTES,
  grade_7: JSS_1_OFFICIAL_NOTES,
  grade_8: JSS_2_OFFICIAL_NOTES,
  grade_9: JSS_3_OFFICIAL_NOTES,
  grade_10: SS_1_OFFICIAL_NOTES,
  grade_11: SS_2_OFFICIAL_NOTES,
  grade_12: SS_3_OFFICIAL_NOTES,
};

const basePlans: LessonPlan[] = [
  {
    id: 'ln-1',
    className: 'JSS3 Mathematics',
    topic: 'Linear Equations in One Variable',
    duration: '60 mins',
    lessonDate: '2026-04-15',
    objective: 'Students solve 10 mixed equation questions independently.',
    priorKnowledge: 'Basic operations and simple algebraic expressions.',
    keyVocabulary: 'variable, coefficient, equation, isolate',
    resources: 'Whiteboard, worksheet set A, mini quiz cards',
    differentiation: 'Tiered problems for support/core/challenge groups.',
    formativeAssessment: 'Cold-call checks + 5-item exit ticket.',
    homework: 'Worksheet page 12 questions 1-8.',
    safeguarding: 'Positive participation protocol and inclusive grouping.',
    reflection: 'Increase modelling time for substitution method.',
    status: 'Ready',
  },
  {
    id: 'ln-2',
    className: 'Grade 4 Basic Science',
    topic: 'States of Matter',
    duration: '45 mins',
    lessonDate: '2026-04-16',
    objective: 'Students identify and classify matter by properties.',
    priorKnowledge: 'Solid, liquid, gas examples from daily life.',
    keyVocabulary: 'evaporation, condensation, particles',
    resources: 'Water cup demo, ice, visual cards',
    differentiation: 'Sentence starters and challenge extension prompt.',
    formativeAssessment: 'Think-pair-share and observation checklist.',
    homework: 'Home observation chart for 3 state changes.',
    safeguarding: 'Safe handling of warm water and clear movement rules.',
    reflection: 'Add more examples from home context next lesson.',
    status: 'Draft',
  },
];

export default function TutorLessonNotesPage() {
  const searchParams = useSearchParams();
  const openFromQuery = searchParams.get('action') === 'new';

  const [plans, setPlans] = useState<LessonPlan[]>(basePlans);
  const [showForm, setShowForm] = useState<boolean>(openFromQuery);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [lessonDate, setLessonDate] = useState('');
  const [objective, setObjective] = useState('');
  const [priorKnowledge, setPriorKnowledge] = useState('');
  const [keyVocabulary, setKeyVocabulary] = useState('');
  const [resources, setResources] = useState('');
  const [differentiation, setDifferentiation] = useState('');
  const [formativeAssessment, setFormativeAssessment] = useState('');
  const [homework, setHomework] = useState('');
  const [safeguarding, setSafeguarding] = useState('');
  const [reflection, setReflection] = useState('');
  const [feedback, setFeedback] = useState('');
  const [explainerMode, setExplainerMode] = useState<'simple' | 'harder_examples' | 'checks_for_understanding' | 'revision_notes'>('simple');
  const [explainerPlanId, setExplainerPlanId] = useState<string | null>(basePlans[0]?.id ?? null);
  const [explainerResult, setExplainerResult] = useState<{
    title: string;
    explanation: string;
    examples: string[];
    checks: Array<{ question: string; answerHint: string }>;
    revisionNotes: string[];
    nextStep: string;
  } | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Load lesson plans from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('edvoura_tutor_lesson_plans');
      if (saved) {
        const parsed = JSON.parse(saved) as LessonPlan[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPlans(parsed);
        }
      }
    } catch { /* ignore parse errors */ }
  }, []);

  // Persist lesson plans to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('edvoura_tutor_lesson_plans', JSON.stringify(plans));
    } catch { /* ignore storage quota errors */ }
  }, [plans]);

  const stats = useMemo(() => {
    const draftCount = plans.filter((plan) => plan.status === 'Draft').length;
    const readyCount = plans.filter((plan) => plan.status === 'Ready').length;
    return {
      total: String(plans.length),
      ready: String(readyCount),
      draft: String(draftCount),
      packs: String(Math.max(8, plans.length + 4)),
    };
  }, [plans]);

  const createLessonPlan = (status: 'Ready' | 'Draft') => {
    const safeClass = className.trim();
    const safeTopic = topic.trim();
    const safeDuration = duration.trim();
    const safeDate = lessonDate.trim();
    const safeObjective = objective.trim();
    const safePriorKnowledge = priorKnowledge.trim();
    const safeVocabulary = keyVocabulary.trim();
    const safeResources = resources.trim();
    const safeDifferentiation = differentiation.trim();
    const safeAssessment = formativeAssessment.trim();
    const safeHomework = homework.trim();
    const safeSafeguarding = safeguarding.trim();
    const safeReflection = reflection.trim();

    if (
      !safeClass ||
      !safeTopic ||
      !safeDuration ||
      !safeDate ||
      !safeObjective ||
      !safePriorKnowledge ||
      !safeVocabulary ||
      !safeResources ||
      !safeDifferentiation ||
      !safeAssessment ||
      !safeHomework ||
      !safeSafeguarding ||
      !safeReflection
    ) {
      setFeedback('Complete all core lesson-note fields before saving.');
      return;
    }

    const newPlan: LessonPlan = {
      id: editingPlanId ?? `ln-${Date.now()}`,
      className: safeClass,
      topic: safeTopic,
      duration: safeDuration,
      lessonDate: safeDate,
      objective: safeObjective,
      priorKnowledge: safePriorKnowledge,
      keyVocabulary: safeVocabulary,
      resources: safeResources,
      differentiation: safeDifferentiation,
      formativeAssessment: safeAssessment,
      homework: safeHomework,
      safeguarding: safeSafeguarding,
      reflection: safeReflection,
      status,
    };

    if (editingPlanId) {
      setPlans((current) => current.map((item) => (item.id === editingPlanId ? newPlan : item)));
    } else {
      setPlans((current) => [newPlan, ...current]);
    }
    setFeedback(
      editingPlanId
        ? 'Lesson note updated successfully.'
        : status === 'Ready'
          ? 'Lesson note created successfully.'
          : 'Lesson note saved as draft.',
    );
    setClassName('');
    setTopic('');
    setDuration('');
    setLessonDate('');
    setObjective('');
    setPriorKnowledge('');
    setKeyVocabulary('');
    setResources('');
    setDifferentiation('');
    setFormativeAssessment('');
    setHomework('');
    setSafeguarding('');
    setReflection('');
    setEditingPlanId(null);
    setShowForm(false);
  };

  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('grade_12');
  const [publishedOfficialNoteIds, setPublishedOfficialNoteIds] = useState<string[]>([
    'p1_basic_science', 'p1_mathematics', 'p1_english', 'p1_history', 'p1_arts', 'p1_social', 'p1_phe', 'p1_crs', 'p1_irs',
    'p2_basic_science', 'p2_mathematics', 'p2_english', 'p2_history', 'p2_arts', 'p2_social', 'p2_phe', 'p2_crs', 'p2_irs',
    'p3_basic_science', 'p3_mathematics', 'p3_english', 'p3_history', 'p3_arts', 'p3_social', 'p3_phe', 'p3_crs', 'p3_irs',
    'p4_basic_science', 'p4_digital_literacy', 'p4_mathematics', 'p4_english', 'p4_french', 'p4_history', 'p4_arts', 'p4_prevocational', 'p4_social', 'p4_phe', 'p4_crs', 'p4_irs',
    'p5_basic_science', 'p5_digital_literacy', 'p5_mathematics', 'p5_english', 'p5_french', 'p5_history', 'p5_arts', 'p5_prevocational', 'p5_social', 'p5_phe', 'p5_crs', 'p5_irs',
    'p6_basic_science', 'p6_digital_literacy', 'p6_mathematics', 'p6_english', 'p6_french', 'p6_history', 'p6_arts', 'p6_prevocational', 'p6_social', 'p6_phe', 'p6_crs', 'p6_irs',
    'jss1_math', 'jss1_english', 'jss1_science', 'jss1_business', 'jss1_digital_tech', 'jss1_computer_repair', 'jss1_solar', 'jss1_french', 'jss1_history', 'jss1_arts', 'jss1_social', 'jss1_phe', 'jss1_crs', 'jss1_irs', 'jss1_beauty', 'jss1_fashion', 'jss1_horticulture', 'jss1_livestock',
    'jss2_math', 'jss2_english', 'jss2_science', 'jss2_business', 'jss2_digital_tech', 'jss2_hardware_repair', 'jss2_solar', 'jss2_french', 'jss2_history', 'jss2_arts', 'jss2_social', 'jss2_phe', 'jss2_crs', 'jss2_irs', 'jss2_beauty', 'jss2_fashion', 'jss2_horticulture', 'jss2_livestock',
    'jss3_math', 'jss3_english', 'jss3_science', 'jss3_business', 'jss3_digital_tech', 'jss3_hardware_repair', 'jss3_solar', 'jss3_french', 'jss3_history', 'jss3_arts', 'jss3_social', 'jss3_phe', 'jss3_crs', 'jss3_irs', 'jss3_beauty', 'jss3_fashion', 'jss3_horticulture', 'jss3_livestock',
    'ss1_math', 'ss1_english', 'ss1_physics', 'ss1_chemistry', 'ss1_biology', 'ss1_further_math', 'ss1_agric', 'ss1_geography', 'ss1_economics', 'ss1_government', 'ss1_accounting', 'ss1_commerce', 'ss1_marketing', 'ss1_literature', 'ss1_history', 'ss1_crs', 'ss1_citizenship', 'ss1_digital_tech', 'ss1_hardware_repair', 'ss1_solar', 'ss1_technical_drawing', 'ss1_visual_arts', 'ss1_food_nutrition', 'ss1_catering', 'ss1_beauty', 'ss1_fashion', 'ss1_horticulture', 'ss1_livestock',
    'ss2_math', 'ss2_english', 'ss2_physics', 'ss2_chemistry', 'ss2_biology', 'ss2_further_math', 'ss2_agric', 'ss2_geography', 'ss2_economics', 'ss2_government', 'ss2_accounting', 'ss2_commerce', 'ss2_marketing', 'ss2_literature', 'ss2_history', 'ss2_crs', 'ss2_citizenship', 'ss2_digital_tech', 'ss2_hardware_repair', 'ss2_solar', 'ss2_technical_drawing', 'ss2_visual_arts', 'ss2_food_nutrition', 'ss2_catering', 'ss2_beauty', 'ss2_fashion', 'ss2_horticulture', 'ss2_livestock',
    'ss3_math', 'ss3_english', 'ss3_physics', 'ss3_chemistry', 'ss3_biology', 'ss3_further_math', 'ss3_agric', 'ss3_geography', 'ss3_economics', 'ss3_accounting', 'ss3_commerce', 'ss3_marketing', 'ss3_literature', 'ss3_history', 'ss3_crs', 'ss3_citizenship', 'ss3_digital_tech', 'ss3_hardware_repair', 'ss3_solar', 'ss3_technical_drawing', 'ss3_visual_arts', 'ss3_food_nutrition', 'ss3_catering', 'ss3_beauty', 'ss3_fashion', 'ss3_horticulture', 'ss3_livestock',
  ]);

  const [tutorType, setTutorType] = useState<'class_teacher' | 'subject_teacher' | 'both' | 'all'>('all');
  const [tutorGrade, setTutorGrade] = useState<string>('grade_12');
  const [tutorSubjects, setTutorSubjects] = useState<string[]>([]);
  const [tutorSubjectsRaw, setTutorSubjectsRaw] = useState<string>('');

  // Fetch tutor authorization metadata from Supabase Auth
  useEffect(() => {
    const fetchTutorRoleMeta = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata) {
          const type = (user.user_metadata.tutor_type as 'class_teacher' | 'subject_teacher' | 'both') || 'all';
          const grade = (user.user_metadata.tutor_grade as string) || 'grade_12';
          const rawSubj = (user.user_metadata.tutor_subjects as string) || '';

          setTutorType(type);
          setTutorGrade(grade);
          setTutorSubjectsRaw(rawSubj);

          const parsedSubjects = rawSubj
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter((s) => s.length > 0);
          setTutorSubjects(parsedSubjects);

          if (type === 'class_teacher' || type === 'both') {
            setSelectedGradeFilter(grade);
          }
        }
      } catch (e) {
        console.error('Failed to load tutor metadata:', e);
      }
    };
    fetchTutorRoleMeta();
  }, []);

  // Load published official notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('edvoura_published_curriculum_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setPublishedOfficialNoteIds(parsed);
      }
    } catch (e) {}
  }, []);

  const toggleOfficialNotePublish = (noteId: string) => {
    setPublishedOfficialNoteIds((prev) => {
      const next = prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId];
      try {
        localStorage.setItem('edvoura_published_curriculum_notes', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const startEditPlan = (item: LessonPlan) => {
    setClassName(item.className);
    setTopic(item.topic);
    setDuration(item.duration);
    setLessonDate(item.lessonDate);
    setObjective(item.objective);
    setPriorKnowledge(item.priorKnowledge);
    setKeyVocabulary(item.keyVocabulary);
    setResources(item.resources);
    setDifferentiation(item.differentiation);
    setFormativeAssessment(item.formativeAssessment);
    setHomework(item.homework);
    setSafeguarding(item.safeguarding);
    setReflection(item.reflection);
    setEditingPlanId(item.id);
    setShowForm(true);
    setFeedback(`Editing lesson note: ${item.topic}`);
  };

  const deletePlan = (planId: string) => {
    setPlans((current) => current.filter((item) => item.id !== planId));
    if (editingPlanId === planId) {
      setEditingPlanId(null);
      setShowForm(false);
    }
    if (explainerPlanId === planId) {
      setExplainerPlanId(plans.find((item) => item.id !== planId)?.id ?? null);
      setExplainerResult(null);
    }
    setFeedback('Lesson note deleted.');
  };

  const selectedExplainerPlan =
    plans.find((item) => item.id === explainerPlanId) ?? plans[0] ?? null;

  const buildLessonNarrative = (plan: LessonPlan) =>
    [
      `Class: ${plan.className}`,
      `Topic: ${plan.topic}`,
      `Objective: ${plan.objective}`,
      `Prior knowledge: ${plan.priorKnowledge}`,
      `Key vocabulary: ${plan.keyVocabulary}`,
      `Resources: ${plan.resources}`,
      `Differentiation: ${plan.differentiation}`,
      `Formative assessment: ${plan.formativeAssessment}`,
      `Homework: ${plan.homework}`,
      `Teacher reflection: ${plan.reflection}`,
    ].join('\n');

  const runLessonExplainer = async () => {
    if (!selectedExplainerPlan) {
      setFeedback('Create a lesson note first before using the explainer.');
      return;
    }

    setIsExplaining(true);
    setExplainerResult(null);
    setFeedback('Edvoura AI is transforming this lesson note...');

    try {
      const response = await fetch('/api/ai/explain-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: explainerMode,
          topic: selectedExplainerPlan.topic,
          subject: selectedExplainerPlan.className,
          gradeLevel: selectedExplainerPlan.className,
          lessonText: buildLessonNarrative(selectedExplainerPlan),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback(data.detail || data.error || 'Unable to explain this lesson.');
        return;
      }

      setExplainerResult(data.explanation);
      setFeedback(`Lesson explainer ready for ${selectedExplainerPlan.topic}.`);
    } catch (error: unknown) {
      setFeedback(error instanceof Error ? error.message : 'Unable to explain this lesson.');
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1400px] space-y-6 sm:space-y-8 pb-20">
      <section className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        
        {/* Header */}
        <div className="p-5 sm:p-8 md:p-12 border-b-[3px] sm:border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 min-w-0">
            <div className="space-y-3 min-w-0 w-full">
              <span className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-[2px] sm:border-[3px] border-dark bg-white text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] font-black shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] break-words max-w-full text-center">
                TEACHING MANAGEMENT
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark break-words">
                Lesson Notes & Plans
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl break-words">
                Prepare lesson plans, objectives, delivery notes, and class activities in one unified place.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8 min-w-0">

          {feedback ? (
            <section className="rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-sm text-dark font-black shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] break-words">{feedback}</section>
          ) : null}

          <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-4 min-w-0">
            <Stat title="Plans This Week" value={stats.total} icon={ClipboardList} bgColor="bg-emerald-200" />
            <Stat title="Ready to Deliver" value={stats.ready} icon={CheckSquare} bgColor="bg-blue-200" />
            <Stat title="Draft Notes" value={stats.draft} icon={FilePenLine} bgColor="bg-amber-200" />
            <Stat title="Resource Packs" value={stats.packs} icon={BookOpen} bgColor="bg-rose-200" />
          </section>

          {/* ═══════════════════════ OFFICIAL PURCHASED CURRICULUM LESSON NOTES HUB ═══════════════════════ */}
          <section className="border-[3px] sm:border-[4px] border-dark rounded-[24px] bg-yellow/10 p-6 sm:p-8 shadow-[6px_6px_0px_#060E1C] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[3px] border-dark/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow border-[2px] border-dark rounded-lg text-[10px] font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C] mb-2">
                  📚 Official Purchased Curriculum
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                  {selectedGradeFilter === 'grade_12' ? 'SS 3 (Grade 12)' : selectedGradeFilter === 'grade_11' ? 'SS 2 (Grade 11)' : selectedGradeFilter === 'grade_10' ? 'SS 1 (Grade 10)' : selectedGradeFilter === 'grade_9' ? 'JSS 3 (Grade 9)' : selectedGradeFilter === 'grade_8' ? 'JSS 2 (Grade 8)' : selectedGradeFilter === 'grade_7' ? 'JSS 1 (Grade 7)' : selectedGradeFilter === 'grade_6' ? 'Primary 6 (Grade 6)' : selectedGradeFilter === 'grade_5' ? 'Primary 5 (Grade 5)' : selectedGradeFilter === 'grade_4' ? 'Primary 4 (Grade 4)' : selectedGradeFilter === 'grade_3' ? 'Primary 3 (Grade 3)' : selectedGradeFilter === 'grade_2' ? 'Primary 2 (Grade 2)' : 'Primary 1 (Grade 1)'} Master Lesson Notes
                </h2>
                <p className="text-xs sm:text-sm font-bold text-dark/70">
                  Published notes are automatically available to students on their dashboard & class library.
                </p>
              </div>

              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                disabled={tutorType === 'class_teacher'}
                className={`px-4 py-2.5 rounded-xl border-[3px] border-dark bg-white font-black text-xs uppercase shadow-[3px_3px_0px_#060E1C] outline-none ${
                  tutorType === 'class_teacher' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <option value="grade_1">Primary 1 (Grade 1) - 9 Subjects</option>
                <option value="grade_2">Primary 2 (Grade 2) - 9 Subjects</option>
                <option value="grade_3">Primary 3 (Grade 3) - 9 Subjects</option>
                <option value="grade_4">Primary 4 (Grade 4) - 12 Subjects</option>
                <option value="grade_5">Primary 5 (Grade 5) - 12 Subjects</option>
                <option value="grade_6">Primary 6 (Grade 6) - 12 Subjects</option>
                <option value="grade_7">JSS 1 (Grade 7) - 18 Subjects</option>
                <option value="grade_8">JSS 2 (Grade 8) - 18 Subjects</option>
                <option value="grade_9">JSS 3 (Grade 9) - 18 Subjects</option>
                <option value="grade_10">SS 1 (Grade 10) - 28 Subjects</option>
                <option value="grade_11">SS 2 (Grade 11) - 28 Subjects</option>
                <option value="grade_12">SS 3 (Grade 12) - 27 Subjects</option>
              </select>
            </div>

            {/* Intellectual Authorization Banner */}
            {tutorType !== 'all' && (
              <div className="p-4 rounded-xl border-[3px] border-dark bg-white shadow-[3px_3px_0px_#060E1C] flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-yellow border-[2px] border-dark shrink-0">
                  <Lock className="w-4 h-4 text-dark" />
                </div>
                <div className="text-xs font-bold text-dark">
                  <span className="font-black uppercase tracking-wider text-[10px] text-dark/70 block">🔒 Intellectual Access Filter Active</span>
                  {tutorType === 'class_teacher' && `Assigned Class Teacher (${selectedGradeFilter.replace('grade_', 'Grade ')}). You have full access to all subjects in your class.`}
                  {tutorType === 'subject_teacher' && `Assigned Subject Teacher (${tutorSubjectsRaw || 'Assigned Subjects'}). Showing only authorized subject notes.`}
                  {tutorType === 'both' && `Class & Subject Teacher. Authorized for Class (${tutorGrade.replace('grade_', 'Grade ')}) and Subjects (${tutorSubjectsRaw}).`}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {((OFFICIAL_CURRICULUM_DATABASE[selectedGradeFilter] ?? PRIMARY_1_OFFICIAL_NOTES).filter((note) => {
                if (tutorType === 'all') return true;
                const isAssignedGrade = selectedGradeFilter === tutorGrade;
                const noteSubj = note.subjectName.toLowerCase();
                const isAssignedSubject =
                  tutorSubjects.length === 0 ||
                  tutorSubjects.some((ts) => noteSubj.includes(ts) || ts.includes(noteSubj));

                if (tutorType === 'class_teacher') return isAssignedGrade;
                if (tutorType === 'subject_teacher') return isAssignedSubject;
                if (tutorType === 'both') return isAssignedGrade || isAssignedSubject;
                return true;
              })).map((note) => {
                const isPub = publishedOfficialNoteIds.includes(note.id);
                return (
                  <div
                    key={note.id}
                    className="border-[3px] border-dark rounded-[20px] bg-white p-5 shadow-[4px_4px_0px_#060E1C] flex flex-col justify-between hover:translate-y-[-2px] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-indigo-100 border-[2px] border-dark rounded-md text-[10px] font-black uppercase text-indigo-900 shadow-[2px_2px_0px_#060E1C]">
                          {note.subjectName}
                        </span>
                        <span className={`px-2 py-0.5 border-[2px] border-dark rounded-md text-[9px] font-black uppercase tracking-wider ${isPub ? 'bg-emerald-300 text-dark' : 'bg-slate-200 text-dark/60'}`}>
                          {isPub ? 'Live for Students' : 'Draft / Locked'}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-dark mb-2 leading-snug tracking-tight break-words">{note.title}</h3>
                      <p className="text-xs font-bold text-dark/60 mb-4 line-clamp-3">{note.description}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t-[2px] border-dark/10">
                      <button
                        onClick={() => {
                          setActivePdfUrl(note.fileUrl);
                          setActivePdfTitle(note.title);
                        }}
                        className="w-full py-2.5 bg-yellow text-dark border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                      >
                        👁️ Preview PDF Note
                      </button>

                      <button
                        onClick={() => toggleOfficialNotePublish(note.id)}
                        className={`w-full py-2 border-[2px] border-dark rounded-xl text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all ${
                          isPub
                            ? 'bg-emerald-400 text-dark hover:bg-emerald-500'
                            : 'bg-white text-dark hover:bg-slate-100'
                        }`}
                      >
                        {isPub ? `✅ Published to ${note.gradeName.split(' ')[0]}` : `🚀 Publish to ${note.gradeName.split(' ')[0]}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-12 min-w-0">
            
            <div className="space-y-6 xl:col-span-8 min-w-0">
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden min-w-0">
                <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-off-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Current Lesson Plans</h2>
                  <Button className="w-full sm:w-auto bg-dark text-white border-[2px] sm:border-[3px] border-dark font-black rounded-xl shadow-[2px_2px_0px_#F5C518] sm:shadow-[3px_3px_0px_#F5C518] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-xs px-4 py-3 flex justify-center" onClick={() => setShowForm((v) => !v)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {showForm ? 'Close Form' : 'New Lesson Note'}
                  </Button>
                </div>
                
                <div className="p-5 sm:p-6 space-y-6 min-w-0">
                  {showForm ? (
                    <div className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-blue-50 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-dark tracking-tight break-words">
                        {editingPlanId ? 'Edit Lesson Note' : 'Create Lesson Note'}
                      </h3>
                      <div className="mt-4 sm:mt-6 space-y-4 min-w-0">
                        <input
                          value={className}
                          onChange={(event) => setClassName(event.target.value)}
                          placeholder="Class name (e.g., JSS3 Mathematics)"
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <input
                          value={topic}
                          onChange={(event) => setTopic(event.target.value)}
                          placeholder="Topic"
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <input
                            value={lessonDate}
                            onChange={(event) => setLessonDate(event.target.value)}
                            type="date"
                            className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                          />
                          <input
                            value={duration}
                            onChange={(event) => setDuration(event.target.value)}
                            placeholder="Duration (e.g., 60 mins)"
                            className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                          />
                        </div>
                        <textarea
                          value={objective}
                          onChange={(event) => setObjective(event.target.value)}
                          placeholder="Learning objective(s)"
                          rows={3}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={priorKnowledge}
                          onChange={(event) => setPriorKnowledge(event.target.value)}
                          placeholder="Prior knowledge/bridge from last lesson"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <input
                          value={keyVocabulary}
                          onChange={(event) => setKeyVocabulary(event.target.value)}
                          placeholder="Key vocabulary"
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={resources}
                          onChange={(event) => setResources(event.target.value)}
                          placeholder="Teaching resources/materials"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={differentiation}
                          onChange={(event) => setDifferentiation(event.target.value)}
                          placeholder="Differentiation and SEND/ELL support"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={formativeAssessment}
                          onChange={(event) => setFormativeAssessment(event.target.value)}
                          placeholder="Formative assessment and checks for understanding"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={homework}
                          onChange={(event) => setHomework(event.target.value)}
                          placeholder="Homework / independent practice"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={safeguarding}
                          onChange={(event) => setSafeguarding(event.target.value)}
                          placeholder="Safeguarding and classroom management notes"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <textarea
                          value={reflection}
                          onChange={(event) => setReflection(event.target.value)}
                          placeholder="Teacher reflection / next-step adjustment"
                          rows={2}
                          className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4 border-t-[3px] border-dark/10 min-w-0">
                          <Button className="w-full sm:w-auto bg-emerald-400 border-[2px] sm:border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto text-xs sm:text-sm" onClick={() => createLessonPlan('Ready')}>
                            {editingPlanId ? 'Update as Ready' : 'Save as Ready'}
                          </Button>
                          <Button className="w-full sm:w-auto bg-white border-[2px] sm:border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto text-xs sm:text-sm" onClick={() => createLessonPlan('Draft')}>
                            {editingPlanId ? 'Update as Draft' : 'Save as Draft'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {plans.map((item) => (
                    <div key={item.id} className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-off-white p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                      <div className="mb-4 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.12em] text-dark bg-white px-3 py-1.5 sm:py-1 rounded-md border-[2px] border-dark break-words max-w-full">
                          {item.className} | {item.lessonDate} | {item.duration}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                          <Button className="flex-1 sm:flex-none h-10 sm:h-8 border-[2px] border-dark bg-white text-dark font-black text-xs hover:bg-slate-50 shadow-[2px_2px_0px_#060E1C] transition-all active:translate-y-[1px] active:translate-x-[1px] active:shadow-none" onClick={() => startEditPlan(item)}>
                            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button className="flex-1 sm:flex-none h-10 sm:h-8 border-[2px] border-dark bg-rose-100 text-rose-700 font-black text-xs hover:bg-rose-200 shadow-[2px_2px_0px_#060E1C] transition-all active:translate-y-[1px] active:translate-x-[1px] active:shadow-none" onClick={() => deletePlan(item.id)}>
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-xl sm:text-2xl font-black text-dark tracking-tight break-words">{item.topic}</p>
                      <p className="mt-2 text-xs sm:text-sm font-bold text-dark/70 break-words">{item.objective}</p>
                      <div className="mt-4 space-y-2 border-t-[2px] border-dark/10 pt-4 min-w-0">
                        <p className="text-xs text-dark/70 font-semibold"><strong className="text-dark font-black uppercase tracking-widest">Assessment:</strong> {item.formativeAssessment}</p>
                        <p className="text-xs text-dark/70 font-semibold"><strong className="text-dark font-black uppercase tracking-widest">Differentiation:</strong> {item.differentiation}</p>
                        <p className="text-xs text-dark/70 font-semibold"><strong className="text-dark font-black uppercase tracking-widest">Safeguarding:</strong> {item.safeguarding}</p>
                      </div>
                      <p className={`mt-4 inline-flex px-3 py-1 text-xs font-black uppercase tracking-widest border-[2px] border-dark rounded-lg ${item.status === 'Ready' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                        Status: {item.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 xl:col-span-4 min-w-0">
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark mb-4 break-words">Plan Checklist</h3>
                <div className="space-y-3 text-xs sm:text-sm font-semibold text-dark/80 min-w-0">
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Learning objective defined</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Starter activity prepared</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Practice questions prepared</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Exit ticket drafted</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Differentiation strategy included</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Safeguarding protocol set</div>
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 shadow-[2px_2px_0px_#060E1C]">Homework and reflection</div>
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark mb-4 flex items-center gap-2 break-words">
                  <Target className="h-5 w-5 text-dark shrink-0" />
                  Veteran Standard
                </h3>
                <div className="space-y-3 text-xs sm:text-sm font-semibold text-dark/80 min-w-0">
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Objective must be measurable and observable.</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">At least two formative checks during delivery.</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Plan remediation for struggling learners.</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">End lesson with reflection and next-step plan.</div>
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-yellow/20 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] space-y-4 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark flex items-center gap-2 break-words">
                  <Sparkles className="h-5 w-5 text-dark shrink-0" />
                  Lesson Explainer
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-dark/70 break-words">
                  Rework any lesson note into a simpler explanation, harder examples, quick checks, or revision notes.
                </p>
                <select
                  value={explainerPlanId ?? ''}
                  onChange={(event) => {
                    setExplainerPlanId(event.target.value);
                    setExplainerResult(null);
                  }}
                  className="w-full rounded-xl border-[2px] sm:border-[3px] border-dark bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.className} - {plan.topic}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'simple', label: 'Explain Simply' },
                    { value: 'harder_examples', label: 'Harder Examples' },
                    { value: 'checks_for_understanding', label: '5 Checks' },
                    { value: 'revision_notes', label: 'Revision Notes' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setExplainerMode(item.value as typeof explainerMode)}
                      className={`rounded-xl border-[2px] sm:border-[3px] px-2 sm:px-3 py-2 sm:py-3 text-left text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all min-w-0 break-words ${
                        explainerMode === item.value
                          ? 'border-dark bg-dark text-white shadow-[2px_2px_0px_#F5C518] sm:shadow-[3px_3px_0px_#F5C518]'
                          : 'border-dark bg-white text-dark shadow-[2px_2px_0px_#060E1C] sm:shadow-[3px_3px_0px_#060E1C]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <Button
                  className="w-full bg-yellow border-[2px] sm:border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] h-auto py-3 sm:py-4 text-xs sm:text-sm break-words whitespace-normal"
                  disabled={!selectedExplainerPlan || isExplaining}
                  onClick={() => void runLessonExplainer()}
                >
                  {isExplaining ? 'Explaining...' : 'Run Edvoura AI Explainer'}
                </Button>

                <div className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-white p-4 shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-dark/50 break-words">
                    Explainer Output
                  </p>
                  {explainerResult ? (
                    <div className="mt-4 space-y-3 text-xs sm:text-sm font-semibold text-dark/80 min-w-0">
                      <p className="text-base sm:text-lg font-black text-dark break-words">{explainerResult.title}</p>
                      <p className="break-words">{explainerResult.explanation}</p>
                      {explainerResult.examples.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">Examples</p>
                          {explainerResult.examples.map((item) => (
                            <div key={item} className="rounded-xl border-[2px] border-dark bg-off-white p-3">
                              {item}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {explainerResult.checks.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">Checks for Understanding</p>
                          {explainerResult.checks.map((item) => (
                            <div key={item.question} className="rounded-xl border-[2px] border-dark bg-off-white p-3">
                              <p className="font-black text-dark">{item.question}</p>
                              <p className="mt-1 text-xs font-semibold text-dark/70">Hint: {item.answerHint}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {explainerResult.revisionNotes.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">Revision Notes</p>
                          {explainerResult.revisionNotes.map((item) => (
                            <div key={item} className="rounded-xl border-[2px] border-dark bg-off-white p-3">
                              {item}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="rounded-xl border-[2px] border-dark bg-yellow/20 p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">Next Step</p>
                        <p className="mt-1 font-black text-dark">{explainerResult.nextStep}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm font-semibold text-dark/60">
                      Select a lesson note and let Edvoura AI reframe it for delivery or revision.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-rose-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark mb-4 flex items-center gap-2 break-words">
                  <ShieldCheck className="h-5 w-5 text-dark shrink-0" />
                  Lesson Safety
                </h3>
                <div className="space-y-3 text-xs sm:text-sm font-semibold text-dark/80 min-w-0">
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Safe activity flow and supervision points</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Respectful classroom language standards</div>
                  <div className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">Sensitive learner support notes</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
      <PDFViewerModal
        isOpen={activePdfUrl !== null}
        onClose={() => {
          setActivePdfUrl(null);
          setActivePdfTitle('');
        }}
        pdfUrl={activePdfUrl}
        title={activePdfTitle}
      />
    </div>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
  bgColor = "bg-white"
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor?: string;
}) {
  return (
    <div className={`border-[3px] border-dark rounded-[20px] sm:rounded-2xl ${bgColor} p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0`}>
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-dark/70 break-words">{title}</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-black text-dark">{value}</p>
        </div>
        <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl border-[3px] border-dark bg-white flex items-center justify-center shadow-[2px_2px_0px_#060E1C]">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-dark" />
        </div>
      </div>
    </div>
  );
}
