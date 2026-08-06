'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, CheckSquare, ClipboardList, FilePenLine, Pencil, PlusCircle, ShieldCheck, Sparkles, Target, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

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

export const OFFICIAL_CURRICULUM_DATABASE: Record<string, OfficialCurriculumNote[]> = {
  grade_1: PRIMARY_1_OFFICIAL_NOTES,
  grade_2: PRIMARY_2_OFFICIAL_NOTES,
  grade_3: PRIMARY_3_OFFICIAL_NOTES,
  grade_4: PRIMARY_4_OFFICIAL_NOTES,
  grade_5: PRIMARY_5_OFFICIAL_NOTES,
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
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('grade_5');
  const [publishedOfficialNoteIds, setPublishedOfficialNoteIds] = useState<string[]>([
    'p1_basic_science', 'p1_mathematics', 'p1_english', 'p1_history', 'p1_arts', 'p1_social', 'p1_phe', 'p1_crs', 'p1_irs',
    'p2_basic_science', 'p2_mathematics', 'p2_english', 'p2_history', 'p2_arts', 'p2_social', 'p2_phe', 'p2_crs', 'p2_irs',
    'p3_basic_science', 'p3_mathematics', 'p3_english', 'p3_history', 'p3_arts', 'p3_social', 'p3_phe', 'p3_crs', 'p3_irs',
    'p4_basic_science', 'p4_digital_literacy', 'p4_mathematics', 'p4_english', 'p4_french', 'p4_history', 'p4_arts', 'p4_prevocational', 'p4_social', 'p4_phe', 'p4_crs', 'p4_irs',
    'p5_basic_science', 'p5_digital_literacy', 'p5_mathematics', 'p5_english', 'p5_french', 'p5_history', 'p5_arts', 'p5_prevocational', 'p5_social', 'p5_phe', 'p5_crs', 'p5_irs',
  ]);

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
                  {selectedGradeFilter === 'grade_5' ? 'Primary 5 (Grade 5)' : selectedGradeFilter === 'grade_4' ? 'Primary 4 (Grade 4)' : selectedGradeFilter === 'grade_3' ? 'Primary 3 (Grade 3)' : selectedGradeFilter === 'grade_2' ? 'Primary 2 (Grade 2)' : 'Primary 1 (Grade 1)'} Master Lesson Notes
                </h2>
                <p className="text-xs sm:text-sm font-bold text-dark/70">
                  Published notes are automatically available to students on their dashboard & class library.
                </p>
              </div>

              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-[3px] border-dark bg-white font-black text-xs uppercase shadow-[3px_3px_0px_#060E1C] outline-none cursor-pointer"
              >
                <option value="grade_1">Primary 1 (Grade 1) - 9 Subjects</option>
                <option value="grade_2">Primary 2 (Grade 2) - 9 Subjects</option>
                <option value="grade_3">Primary 3 (Grade 3) - 9 Subjects</option>
                <option value="grade_4">Primary 4 (Grade 4) - 12 Subjects</option>
                <option value="grade_5">Primary 5 (Grade 5) - 12 Subjects</option>
                <option value="grade_7" disabled>JSS 1 (Grade 7) - Pending</option>
                <option value="grade_12" disabled>SS 3 (Grade 12) - Pending</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {(OFFICIAL_CURRICULUM_DATABASE[selectedGradeFilter] ?? PRIMARY_1_OFFICIAL_NOTES).map((note) => {
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
                      <h3 className="text-base font-black text-dark mb-2 leading-tight">{note.title}</h3>
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
