'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/games/GameLayout';
import { useBand } from '@/components/dashboards/BandContext';
import { Award, PhoneCall, Users, RefreshCw, Check, BookOpen, Share2, DollarSign, LogOut, Clock, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

const ACCENT_COLOR = '#8b5cf6'; // Electric Purple Studio Accent

/* ═══════════════════════ AUTHENTIC TV STUDIO MP3 AUDIO ENGINE ═══════════════════════ */
const MILLIONAIRE_AUDIO_PATHS = {
  opening: '/sounds/millionaire/who_wants_to_be_a_millionaire_opening_sound.mp3',
  lets_play: '/sounds/millionaire/who_wants_to_be_millionaire_lets_play.mp3',
  light_to_center: '/sounds/millionaire/who_wants_to_be_a_millionaire_light_to_center.mp3',
  fastest_finger: '/sounds/millionaire/who_wants_to_be_a_millionaire_fastest_finger.mp3',
  win: '/sounds/millionaire/who_wants_to_be_a_millionaire_win_sound.mp3',
  lose: '/sounds/millionaire/who_wants_to_be_a_millionaire_lose_sound.mp3',
};

const mp3AudioCache: Record<string, HTMLAudioElement> = {};

const SOUND_TIMEOUTS: Record<string, number> = {
  opening: 6500,
  lets_play: 5500,
  light_to_center: 4800,
  win: 4000,
  lose: 4000,
  fastest_finger: 3500,
};

function playMillionaireMP3(
  soundType: keyof typeof MILLIONAIRE_AUDIO_PATHS,
  isMuted: boolean = false,
  onEnded?: () => void
) {
  if (isMuted || typeof window === 'undefined') {
    if (onEnded) onEnded();
    return;
  }
  try {
    const src = MILLIONAIRE_AUDIO_PATHS[soundType];
    if (!src) {
      if (onEnded) onEnded();
      return;
    }

    // Stop all currently playing audio tracks and cancel any ongoing speech so sounds don't collide
    Object.values(mp3AudioCache).forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.onended = null;
      } catch (e) {}
    });

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    if (!mp3AudioCache[soundType]) {
      mp3AudioCache[soundType] = new Audio(src);
    }

    const audio = mp3AudioCache[soundType];
    audio.currentTime = 0;

    let hasEnded = false;
    const triggerEnded = () => {
      if (!hasEnded) {
        hasEnded = true;
        audio.onended = null;
        if (onEnded) onEnded();
      }
    };

    if (onEnded) {
      audio.onended = triggerEnded;
      // Fallback timer only if audio.onended doesn't fire naturally
      const durationMs = SOUND_TIMEOUTS[soundType] || 4500;
      setTimeout(() => {
        if (!hasEnded) {
          triggerEnded();
        }
      }, durationMs);
    }

    audio.play().catch(() => {
      playMillionaireSFX(soundType === 'win' ? 'win' : soundType === 'lose' ? 'lose' : soundType === 'light_to_center' ? 'lights_down' : 'stinger');
      if (onEnded) onEnded();
    });
  } catch (e) {
    if (onEnded) onEnded();
  }
}

let audioCtxInstance: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtxInstance) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxInstance = new AudioCtx();
    }
    if (audioCtxInstance && audioCtxInstance.state === 'suspended') {
      audioCtxInstance.resume();
    }
    return audioCtxInstance;
  } catch (e) {
    return null;
  }
}

function cleanTextForSpeech(text: string): string {
  let cleaned = text;

  // Specific Naira prize values for natural, human speech
  cleaned = cleaned.replace(/₦\s*1[,.]?000[,.]?000/g, "one million naira");
  cleaned = cleaned.replace(/₦\s*500[,.]?000/g, "five hundred thousand naira");
  cleaned = cleaned.replace(/₦\s*250[,.]?000/g, "two hundred and fifty thousand naira");
  cleaned = cleaned.replace(/₦\s*125[,.]?000/g, "one hundred and twenty five thousand naira");
  cleaned = cleaned.replace(/₦\s*64[,.]?000/g, "sixty four thousand naira");
  cleaned = cleaned.replace(/₦\s*32[,.]?000/g, "thirty two thousand naira");
  cleaned = cleaned.replace(/₦\s*16[,.]?000/g, "sixteen thousand naira");
  cleaned = cleaned.replace(/₦\s*8[,.]?000/g, "eight thousand naira");
  cleaned = cleaned.replace(/₦\s*4[,.]?000/g, "four thousand naira");
  cleaned = cleaned.replace(/₦\s*2[,.]?000/g, "two thousand naira");
  cleaned = cleaned.replace(/₦\s*1[,.]?000/g, "one thousand naira");
  cleaned = cleaned.replace(/₦\s*500/g, "five hundred naira");
  cleaned = cleaned.replace(/₦\s*300/g, "three hundred naira");
  cleaned = cleaned.replace(/₦\s*200/g, "two hundred naira");
  cleaned = cleaned.replace(/₦\s*100/g, "one hundred naira");

  // Fallback for any unmapped ₦ amounts
  cleaned = cleaned.replace(/₦\s*(\d[\d,.]*)/g, "$1 naira");

  // Remove awkward ISO codes or pluralizations
  cleaned = cleaned.replace(/nigeria\s+nairas?\b/gi, "naira");
  cleaned = cleaned.replace(/nigerian?\s+nairas?\b/gi, "naira");
  cleaned = cleaned.replace(/\bnairas\b/gi, "naira");
  cleaned = cleaned.replace(/\bNGN\b/g, "naira");

  // Other global currencies
  cleaned = cleaned.replace(/\$\s*(\d[\d,.]*)/g, "$1 dollars");
  cleaned = cleaned.replace(/£\s*(\d[\d,.]*)/g, "$1 pounds");
  cleaned = cleaned.replace(/€\s*(\d[\d,.]*)/g, "$1 euros");
  cleaned = cleaned.replace(/GH₵\s*(\d[\d,.]*)/g, "$1 cedi");
  cleaned = cleaned.replace(/R\s*(\d[\d,.]*)/g, "$1 rand");

  return cleaned;
}

function speakVoice(text: string, isMuted: boolean = false, onComplete?: () => void) {
  if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onComplete) onComplete();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const spokenText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    let hasCompleted = false;
    const triggerComplete = () => {
      if (!hasCompleted) {
        hasCompleted = true;
        if (onComplete) onComplete();
      }
    };

    if (onComplete) {
      utterance.onend = triggerComplete;
      utterance.onerror = triggerComplete;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    if (onComplete) onComplete();
  }
}

function playMillionaireSFX(type: 'lock' | 'win' | 'lose' | 'lifeline' | 'stinger' | 'walkaway' | 'tick' | 'lights_down' | 'heartbeat' | 'suspense_pad') {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    if (type === 'lights_down') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.7);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.7);
    } else if (type === 'suspense_pad') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(116, now + 1.8);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 1.8);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 1.8);
    } else if (type === 'heartbeat') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'lock') {
      // Sophisticated Studio Option Lock Sound: Warm Dual Sine Sub-Tone + Resonant Chime (No harsh sawtooth!)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(90, now);
      subOsc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      subOsc.connect(subGain); subGain.connect(ctx.destination);
      subOsc.start(now); subOsc.stop(now + 0.25);

      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(523.25, now);
      chimeGain.gain.setValueAtTime(0.2, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      chimeOsc.connect(chimeGain); chimeGain.connect(ctx.destination);
      chimeOsc.start(now); chimeOsc.stop(now + 0.2);
    } else if (type === 'stinger') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.35, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } else if (type === 'lose') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(65, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.45, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'lifeline') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'walkaway') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } else if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.04);
    }
  } catch (e) {}
}

import { getUniqueDynamicQuestion } from '@/lib/games/dynamicQuestionEngine';

/* ═══════════════════════ DYNAMIC MILLIONAIRE QUESTION ENGINE ═══════════════════════ */
function generateDynamicMillionaireQuestion(
  lvl: number,
  usedQuestions: string[] = [],
  gradeBand?: '1-3' | '4-6' | '7-12'
): MillionaireQuestion {
  const generated = getUniqueDynamicQuestion(lvl, usedQuestions, gradeBand);
  return {
    q: generated.q,
    options: generated.options,
    a: generated.a,
    category: generated.category,
    level: lvl
  };
}

/* ═══════════════════════ GLOBAL CURRENCY & MONEY LADDERS ═══════════════════════ */
export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'ZAR' | 'GHS';

export const CURRENCY_MAP: Record<CurrencyCode, { symbol: string; label: string; flag: string; ladder: string[] }> = {
  NGN: {
    symbol: '₦', label: 'Naira (NGN)', flag: '🇳🇬',
    ladder: ['₦100', '₦200', '₦300', '₦500', '₦1,000', '₦2,000', '₦4,000', '₦8,000', '₦16,000', '₦32,000', '₦64,000', '₦125,000', '₦250,000', '₦500,000', '₦1,000,000']
  },
  USD: {
    symbol: '$', label: 'US Dollar ($)', flag: '🇺🇸',
    ladder: ['$100', '$200', '$300', '$500', '$1,000', '$2,000', '$4,000', '$8,000', '$16,000', '$32,000', '$64,000', '$125,000', '$250,000', '$500,000', '$1,000,000']
  },
  GBP: {
    symbol: '£', label: 'Pound (£)', flag: '🇬🇧',
    ladder: ['£100', '£200', '£300', '£500', '£1,000', '£2,000', '£4,000', '£8,000', '£16,000', '£32,000', '£64,000', '£125,000', '£250,000', '£500,000', '£1,000,000']
  },
  EUR: {
    symbol: '€', label: 'Euro (€)', flag: '🇪🇺',
    ladder: ['€100', '€200', '€300', '€500', '€1,000', '€2,000', '€4,000', '€8,000', '€16,000', '€32,000', '€64,000', '€125,000', '€250,000', '€500,000', '€1,000,000']
  },
  ZAR: {
    symbol: 'R', label: 'Rand (ZAR)', flag: '🇿🇦',
    ladder: ['R1,000', 'R2,000', 'R3,000', 'R5,000', 'R10,000', 'R20,000', 'R40,000', 'R80,000', 'R160,000', 'R320,000', 'R640,000', 'R1,250,000', 'R2,500,000', 'R5,000,000', 'R10,000,000']
  },
  GHS: {
    symbol: 'GH₵', label: 'Cedi (GHS)', flag: '🇬🇭',
    ladder: ['GH₵100', 'GH₵200', 'GH₵300', 'GH₵500', 'GH₵1,000', 'GH₵2,000', 'GH₵4,000', 'GH₵8,000', 'GH₵16,000', 'GH₵32,000', 'GH₵64,000', 'GH₵125,000', 'GH₵250,000', 'GH₵500,000', 'GH₵1,000,000']
  }
};

/* ═══════════════════════ DIVERSE MILLIONAIRE QUESTION BANK ═══════════════════════ */
export interface MillionaireQuestion {
  q: string;
  options: [string, string, string, string];
  a: number; // 0..3
  category: string;
  level: number; // 1..15
}

const QUESTION_BANK: MillionaireQuestion[] = [
  // LEVEL 1 - EASY
  { level: 1, category: 'Sports', q: 'How many players are on a standard football (soccer) team on the pitch?', options: ['9', '10', '11', '12'], a: 2 },
  { level: 1, category: 'Music', q: 'Which musical instrument has 88 black and white keys?', options: ['Guitar', 'Violin', 'Piano', 'Flute'], a: 2 },
  { level: 1, category: 'Technology', q: 'What does "WWW" stand for in a website address?', options: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'], a: 0 },
  
  // LEVEL 2 - EASY
  { level: 2, category: 'History', q: 'In which year did Nigeria gain independence from British rule?', options: ['1957', '1960', '1963', '1970'], a: 1 },
  { level: 2, category: 'Movies', q: 'Which superhero is also known as the "Caped Crusader"?', options: ['Superman', 'Batman', 'Spider-Man', 'Iron Man'], a: 1 },
  { level: 2, category: 'Current Affairs', q: 'What is the capital city of Nigeria?', options: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt'], a: 1 },

  // LEVEL 3 - EASY
  { level: 3, category: 'Crypto & Tech', q: 'Who is the anonymous creator of Bitcoin?', options: ['Satoshi Nakamoto', 'Vitalik Buterin', 'Elon Musk', 'Mark Zuckerberg'], a: 0 },
  { level: 3, category: 'Art', q: 'Who painted the famous masterpiece "Mona Lisa"?', options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet'], a: 1 },
  { level: 3, category: 'Education', q: 'Which gas do green plants absorb during photosynthesis?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Helium'], a: 1 },

  // LEVEL 4 - EASY/MEDIUM
  { level: 4, category: 'Politics', q: 'How many states are in the Federal Republic of Nigeria?', options: ['30', '32', '36', '40'], a: 2 },
  { level: 4, category: 'Sports', q: 'Which country hosted the 2022 FIFA World Cup?', options: ['Brazil', 'Qatar', 'France', 'Russia'], a: 1 },
  { level: 4, category: 'Music', q: 'Who is widely celebrated as the King of Pop?', options: ['Elvis Presley', 'Michael Jackson', 'Prince', 'Stevie Wonder'], a: 1 },

  // LEVEL 5 - SAFE HAVEN 1
  { level: 5, category: 'Science', q: 'What is the chemical symbol for Gold on the periodic table?', options: ['Ag', 'Au', 'Fe', 'Cu'], a: 1 },
  { level: 5, category: 'Literature', q: 'Who wrote the famous Nigerian novel "Things Fall Apart"?', options: ['Wole Soyinka', 'Chinua Achebe', 'Chimamanda Adichie', 'Ben Okri'], a: 1 },
  { level: 5, category: 'Technology', q: 'Which company developed the Android mobile operating system?', options: ['Apple', 'Microsoft', 'Google', 'Nokia'], a: 2 },

  // LEVEL 6 - MEDIUM
  { level: 6, category: 'Crypto', q: 'What is the underlying decentralized digital ledger system used by cryptocurrencies?', options: ['CloudDB', 'Blockchain', 'Datagrid', 'Mainframe'], a: 1 },
  { level: 6, category: 'History', q: 'Which ancient African empire was ruled by Mansa Musa, the richest man in history?', options: ['Mali Empire', 'Songhai Empire', 'Ghana Empire', 'Zulu Empire'], a: 0 },
  { level: 6, category: 'Art', q: 'Where is the famous Louvre Museum located?', options: ['London', 'Paris', 'Rome', 'New York'], a: 1 },

  // LEVEL 7 - MEDIUM
  { level: 7, category: 'Movies', q: 'Which film won 11 Oscars and features Jack and Rose on a doomed ship?', options: ['Avatar', 'Titanic', 'Gladiator', 'Inception'], a: 1 },
  { level: 7, category: 'Politics', q: 'What is the headquarters location of the United Nations (UN)?', options: ['Geneva', 'New York City', 'London', 'Brussels'], a: 1 },
  { level: 7, category: 'Sports', q: 'How many grand slam tennis titles are played annually in professional tennis?', options: ['3', '4', '5', '6'], a: 1 },

  // LEVEL 8 - MEDIUM
  { level: 8, category: 'Science', q: 'What is the speed of light in a vacuum approximately?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'], a: 0 },
  { level: 8, category: 'Music', q: 'Which Nigerian Afrobeat legend created the genre "Afrobeat" and opened the Shrine in Lagos?', options: ['Fela Kuti', 'King Sunny Ade', 'Ebenezer Obey', 'Majek Fashek'], a: 0 },
  { level: 8, category: 'Technology', q: 'What does CPU stand for in computer hardware?', options: ['Central Processing Unit', 'Central Power Unit', 'Control Processing Unit', 'Computer Core Unit'], a: 0 },

  // LEVEL 9 - MEDIUM/HARD
  { level: 9, category: 'History', q: 'Which Nigerian currency note features the portrait of Alvan Ikoku?', options: ['₦10', '₦50', '₦100', '₦200'], a: 0 },
  { level: 9, category: 'Education', q: 'What is the derivative of x² with respect to x in Calculus?', options: ['x', '2x', 'x³', '2'], a: 1 },
  { level: 9, category: 'Crypto', q: 'What smart contract blockchain platform was created by Vitalik Buterin in 2015?', options: ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'], a: 1 },

  // LEVEL 10 - SAFE HAVEN 2
  { level: 10, category: 'Current Affairs', q: 'Which is the longest river in Africa?', options: ['Amazon River', 'Nile River', 'Niger River', 'Congo River'], a: 1 },
  { level: 10, category: 'Literature', q: 'Who was the first African to win the Nobel Prize in Literature in 1986?', options: ['Chinua Achebe', 'Wole Soyinka', 'Nadine Gordimer', 'Ngũgĩ wa Thiong’o'], a: 1 },
  { level: 10, category: 'Art', q: 'The ancient Bronze artifacts depicting royal court art originated from which Nigerian kingdom?', options: ['Oyo Kingdom', 'Benin Kingdom', 'Kano Kingdom', 'Ife Kingdom'], a: 1 },

  // LEVEL 11 - HARD
  { level: 11, category: 'Science', q: 'Which organelle is known as the "powerhouse of the cell" for producing ATP energy?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'], a: 2 },
  { level: 11, category: 'Politics', q: 'Who was Nigeria’s first and only Prime Minister during the First Republic?', options: ['Nnamdi Azikiwe', 'Obafemi Awolowo', 'Abubakar Tafawa Balewa', 'Ahmadu Bello'], a: 2 },
  { level: 11, category: 'Technology', q: 'In Artificial Intelligence, what does the "P" stand for in GPT (e.g. ChatGPT)?', options: ['Processing', 'Pre-trained', 'Predictive', 'Programmed'], a: 1 },

  // LEVEL 12 - HARD
  { level: 12, category: 'Sports', q: 'Who holds the official world record for the 100m sprint at 9.58 seconds?', options: ['Tyson Gay', 'Usain Bolt', 'Yohan Blake', 'Asafa Powell'], a: 1 },
  { level: 12, category: 'Movies', q: 'Which highest-grossing film of all time was directed by James Cameron and set on Pandora?', options: ['Avengers: Endgame', 'Avatar', 'Titanic', 'Star Wars'], a: 1 },
  { level: 12, category: 'History', q: 'Which Treaty signed in 1919 officially ended World War I?', options: ['Treaty of Versailles', 'Treaty of Paris', 'Treaty of Rome', 'Treaty of Vienna'], a: 0 },

  // LEVEL 13 - HARD
  { level: 13, category: 'Crypto', q: 'What total maximum supply cap of Bitcoins will ever exist in protocol rules?', options: ['18 Million', '21 Million', '50 Million', '100 Million'], a: 1 },
  { level: 13, category: 'Science', q: 'What is the name of the nearest star system to our Solar System at 4.24 light-years away?', options: ['Sirius', 'Alpha Centauri / Proxima', 'Betelgeuse', 'Andromeda'], a: 1 },
  { level: 13, category: 'Music', q: 'Which Nigerian musical artist won a Grammy Award for Best Global Music Album for "Twice as Tall"?', options: ['Wizkid', 'Burna Boy', 'Davido', 'Tiwa Savage'], a: 1 },

  // LEVEL 14 - EXPERT
  { level: 14, category: 'Education & Physics', q: 'Which fundamental physical law states that Energy cannot be created or destroyed, only transformed?', options: ['First Law of Thermodynamics', 'Second Law of Motion', 'Boyle’s Law', 'Hooke’s Law'], a: 0 },
  { level: 14, category: 'Art & History', q: 'The famous terracotta sculptures dating back to 1500 BC were discovered in which Nigerian culture site?', options: ['Nok Culture', 'Igbo-Ukwu Culture', 'Ife Culture', 'Tada Culture'], a: 0 },
  { level: 14, category: 'Technology', q: 'Who authored the seminal 1948 paper "A Mathematical Theory of Communication" laying information theory foundations?', options: ['Alan Turing', 'Claude Shannon', 'John von Neumann', 'Ada Lovelace'], a: 1 },

  // LEVEL 15 - 1,000,000 GRAND PRIZE QUESTION!
  { level: 15, category: 'Grand Master', q: 'Which element on the periodic table has the highest electrical conductivity of all metals at room temperature?', options: ['Gold (Au)', 'Silver (Ag)', 'Copper (Cu)', 'Platinum (Pt)'], a: 1 },
  { level: 15, category: 'Grand Master', q: 'In 1914, Lord Frederick Lugard amalgamated which two British protectorates to form modern Nigeria?', options: ['Northern & Southern Protectorates', 'Eastern & Western Protectorates', 'Lagos & Niger Protectorates', 'Benin & Sokoto Protectorates'], a: 0 },
  { level: 15, category: 'Grand Master', q: 'What is the name of the hypothetical boundary surrounding a black hole beyond which nothing can escape?', options: ['Event Horizon', 'Singularity Point', 'Photon Sphere', 'Accretion Disk'], a: 0 }
];

export default function MillionaireGame() {
  const { band } = useBand();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('NGN');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [scorePrize, setScorePrize] = useState('0');
  const [activeQ, setActiveQ] = useState<MillionaireQuestion | null>(null);
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMillionaire, setIsMillionaire] = useState(false);
  const [isWalkedAway, setIsWalkedAway] = useState(false);

  // Authentic Studio Lights Blackout State
  const [isLightsDimmed, setIsLightsDimmed] = useState(false);

  // Question Deduplication Tracking using useRef to prevent re-render flickering
  const usedQuestionsRef = useRef<string[]>([]);

  // 30-Second High-Stakes Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // 4 Famous Lifelines State
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    phoneAFriend: true,
    askAudience: true,
    switchQuestion: true,
  });

  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [activeModal, setActiveModal] = useState<'friend' | 'audience' | 'rules' | null>(null);
  const [friendAdvice, setFriendAdvice] = useState('');
  const [audiencePoll, setAudiencePoll] = useState<number[]>([25, 25, 25, 25]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [cameraAnglePreset, setCameraAnglePreset] = useState<'iso' | 'host' | 'contestant' | 'overhead'>('iso');
  const [copiedLink, setCopiedLink] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const activeLadder = CURRENCY_MAP[selectedCurrency].ladder;

  // Load question for current level (100% NON-REPETITIVE & GRADE BAND ADAPTIVE)
  const loadQuestionForLevel = useCallback((lvl: number, currency: CurrencyCode) => {
    const ladder = CURRENCY_MAP[currency].ladder;
    const bandLevel = band === '1-3' ? Math.min(lvl, 5) : band === '4-6' ? Math.min(lvl, 10) : lvl;

    const q = generateDynamicMillionaireQuestion(bandLevel, usedQuestionsRef.current, band);

    usedQuestionsRef.current.push(q.q);
    setActiveQ(q);
    setSelectedOption(null);
    setIsLocked(false);
    setShowAnswerResult(false);
    setIsLightsDimmed(false);
    setDisabledOptions([]);
    setTimeLeft(30);
    setIsTimerActive(true);

    const prizeStr = ladder[lvl - 1];
    // PLAY MP3 INTRO MUSIC FIRST, THEN READ QUESTION WHEN MUSIC FINISHES
    playMillionaireMP3('lets_play', isMutedRef.current, () => {
      speakVoice(`Question for ${prizeStr}. ${q.q}`, isMutedRef.current);
    });
  }, [band]);

  // Initialize Game
  const initGame = useCallback(() => {
    setCurrentLevel(1);
    setScorePrize('0');
    setIsGameOver(false);
    setIsMillionaire(false);
    setIsWalkedAway(false);
    setIsLightsDimmed(false);
    usedQuestionsRef.current = [];
    setLifelines({
      fiftyFifty: true,
      phoneAFriend: true,
      askAudience: true,
      switchQuestion: true,
    });
    setActiveModal(null);
    playMillionaireMP3('opening', isMutedRef.current, () => {
      loadQuestionForLevel(1, selectedCurrency);
    });
  }, [loadQuestionForLevel, selectedCurrency]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // 30s High-Stakes Countdown Timer Effect
  useEffect(() => {
    if (!isTimerActive || isLocked || isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          playMillionaireMP3('lose', isMutedRef.current, () => {
            speakVoice("Time's up! You ran out of time.", isMutedRef.current);
          });
          setIsGameOver(true);
          return 0;
        }
        if (prev <= 6) playMillionaireSFX('tick');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerActive, isLocked, isGameOver]);

  // Handle Option Selection
  const handleSelectOption = (idx: number) => {
    if (isLocked || isGameOver || disabledOptions.includes(idx)) return;
    setSelectedOption(idx);
    playMillionaireSFX('lock');
  };

  // Lock Answer & Submit (WITH AUTHENTIC TV STUDIO LIGHTS-OFF SUSPENSE EFFECT)
  const handleLockAnswer = () => {
    if (selectedOption === null || !activeQ || isLocked) return;
    setIsLocked(true);
    setIsTimerActive(false);
    setIsLightsDimmed(true); // Studio Lights Blackout / Suspense Mode!

    // PLAY AUTHENTIC LIGHT TO CENTER MP3 TRACK FULLY BEFORE REVEALING ANSWER RESULT
    playMillionaireMP3('light_to_center', isMutedRef.current, () => {
      setIsLightsDimmed(false);
      setShowAnswerResult(true);
      const isCorrect = selectedOption === activeQ.a;

      if (isCorrect) {
        const currentPrize = activeLadder[currentLevel - 1];
        setScorePrize(currentPrize);

        playMillionaireMP3('win', isMutedRef.current, () => {
          if (currentLevel === 15) {
            setIsMillionaire(true);
            setIsGameOver(true);
            speakVoice(`CONGRATULATIONS! YOU ARE AN EDVOURA MILLIONAIRE! YOU WON ${currentPrize}!`, isMutedRef.current);
          } else {
            speakVoice(`Correct! You have won ${currentPrize}! Next level unlocked.`, isMutedRef.current, () => {
              setCurrentLevel(l => l + 1);
              loadQuestionForLevel(currentLevel + 1, selectedCurrency);
            });
          }
        });
      } else {
        // Calculate safe haven payout
        let safePayout = '0';
        if (currentLevel > 10) safePayout = activeLadder[9]; // Level 10 Safe Haven
        else if (currentLevel > 5) safePayout = activeLadder[4]; // Level 5 Safe Haven

        setScorePrize(safePayout);
        setIsGameOver(true);
        playMillionaireMP3('lose', isMutedRef.current, () => {
          speakVoice(`Wrong answer! The correct option was ${activeQ.options[activeQ.a]}. You walk away with ${safePayout}.`, isMutedRef.current);
        });
      }
    });
  };

  // Walk Away / Cash Out Feature
  const handleWalkAway = () => {
    if (isLocked || isGameOver || currentLevel <= 1) return;
    playMillionaireSFX('walkaway');
    setIsTimerActive(false);
    const cashOutPrize = activeLadder[currentLevel - 2];
    setScorePrize(cashOutPrize);
    setIsWalkedAway(true);
    setIsGameOver(true);
    speakVoice(`Smart choice! You decided to cash out and walk away with ${cashOutPrize}!`, isMutedRef.current);
  };

  /* ═══════════════════════ LIFELINE IMPLEMENTATIONS ═══════════════════════ */
  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || !activeQ || isLocked) return;
    playMillionaireMP3('fastest_finger', isMutedRef.current);
    
    // Find 2 wrong options to disable
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== activeQ.a);
    const shuffled = wrongIndices.sort(() => Math.random() - 0.5);
    const toDisable = [shuffled[0], shuffled[1]];

    setDisabledOptions(toDisable);
    setLifelines(prev => ({ ...prev, fiftyFifty: false }));
    speakVoice("50:50 Lifeline activated! Computer has eliminated two wrong answers.", isMutedRef.current);
  };

  const usePhoneAFriend = () => {
    if (!lifelines.phoneAFriend || !activeQ || isLocked) return;
    playMillionaireMP3('fastest_finger', isMutedRef.current);

    // Simulate AI Mentor response with 85% accuracy
    const isMentorSmart = Math.random() < 0.85;
    const recommendedIdx = isMentorSmart ? activeQ.a : (activeQ.a + 1) % 4;
    const optionText = activeQ.options[recommendedIdx];
    const confidence = isMentorSmart ? 90 : 60;

    setFriendAdvice(`"Hello Scholar! I am ${confidence}% confident that the correct answer is Option ${String.fromCharCode(65 + recommendedIdx)}: ${optionText}."`);
    setActiveModal('friend');
    setLifelines(prev => ({ ...prev, phoneAFriend: false }));
    speakVoice(`Calling your mentor... Mentor suggests Option ${String.fromCharCode(65 + recommendedIdx)}`, isMutedRef.current);
  };

  const useAskAudience = () => {
    if (!lifelines.askAudience || !activeQ || isLocked) return;
    playMillionaireMP3('fastest_finger', isMutedRef.current);

    // Generate audience voting percentages heavily weighted to correct answer
    const poll = [0, 0, 0, 0];
    const correctShare = Math.floor(Math.random() * 25) + 55; // 55% to 80%
    poll[activeQ.a] = correctShare;

    let remaining = 100 - correctShare;
    [0, 1, 2, 3].filter(i => i !== activeQ.a).forEach((idx, i, arr) => {
      if (i === arr.length - 1) {
        poll[idx] = remaining;
      } else {
        const share = Math.floor(Math.random() * (remaining / 2));
        poll[idx] = share;
        remaining -= share;
      }
    });

    setAudiencePoll(poll);
    setActiveModal('audience');
    setLifelines(prev => ({ ...prev, askAudience: false }));
    speakVoice("Audience poll complete! Check the studio voting breakdown.", isMutedRef.current);
  };

  const useSwitchQuestion = () => {
    if (!lifelines.switchQuestion || !activeQ || isLocked) return;
    playMillionaireMP3('fastest_finger', isMutedRef.current);

    setLifelines(prev => ({ ...prev, switchQuestion: false }));
    loadQuestionForLevel(currentLevel, selectedCurrency);
    speakVoice("Switch Question Lifeline used! Fresh question loaded.", isMutedRef.current);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    playMillionaireMP3('fastest_finger', isMutedRef.current);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      playMillionaireMP3('opening', false);
    }
  };

  return (
    <GameLayout
      title="Who Wants to Be a Millionaire (3D Global)"
      icon={<Award style={{ width: '24px', height: '24px' }} />}
      accentColor={ACCENT_COLOR}
      fullscreen={true}
    >
      <div className="mill-main-layout" style={{
        display: 'flex', alignItems: 'stretch', height: '100%',
        overflow: 'hidden', padding: '6px', gap: '10px', boxSizing: 'border-box'
      }}>
        <style jsx global>{`
          @media (max-width: 768px) {
            .mill-main-layout {
              flex-direction: column !important;
              align-items: center !important;
              overflow-y: auto !important;
              padding: 4px !important;
              gap: 8px !important;
            }
            .mill-side-panel {
              width: 100% !important;
              flex: none !important;
            }
          }
        `}</style>
        
        {/* ─── LEFT SIDEBAR: CURRENCY SELECTOR, 4 LIFELINES & SCOREBOARD ─── */}
        <div className="mill-side-panel" style={{
          flex: '0 0 220px', width: '220px', display: 'flex', flexDirection: 'column', gap: '8px',
          overflow: 'hidden'
        }}>
          {/* Currency Switcher & Audio Toggle */}
          <div style={{ background: '#111827', border: '2.5px solid #000', borderRadius: '12px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '10px', fontWeight: 950, color: '#fbbf24', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign size={12} /> Global Currency
            </div>
            <select
              value={selectedCurrency}
              onChange={e => setSelectedCurrency(e.target.value as CurrencyCode)}
              style={{
                width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #000',
                background: '#1e293b', color: '#ffffff', fontSize: '11px', fontWeight: 900, cursor: 'pointer', outline: 'none'
              }}
            >
              {Object.entries(CURRENCY_MAP).map(([code, config]) => (
                <option key={code} value={code}>
                  {config.flag} {config.label}
                </option>
              ))}
            </select>

            <button
              onClick={toggleSound}
              style={{
                padding: '6px', borderRadius: '6px', border: '1.5px solid #000',
                background: isMuted ? '#ef4444' : '#22c55e', color: '#ffffff',
                fontSize: '10px', fontWeight: 950, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              {isMuted ? 'Studio Sound Muted' : 'TV Studio Audio On'}
            </button>
          </div>

          {/* Lifelines Box */}
          <div style={{ background: '#111827', border: '2.5px solid #000', borderRadius: '12px', padding: '8px 10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 950, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '8px' }}>
              💡 4 Famous Lifelines
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={useFiftyFifty}
                disabled={!lifelines.fiftyFifty || isLocked}
                style={{
                  padding: '8px', borderRadius: '8px', border: '1.5px solid #000',
                  background: lifelines.fiftyFifty ? '#8b5cf6' : '#334155', color: '#fff',
                  fontSize: '11px', fontWeight: 950, cursor: lifelines.fiftyFifty ? 'pointer' : 'default',
                  opacity: lifelines.fiftyFifty ? 1 : 0.4
                }}
              >
                50 : 50
              </button>

              <button
                onClick={usePhoneAFriend}
                disabled={!lifelines.phoneAFriend || isLocked}
                style={{
                  padding: '8px', borderRadius: '8px', border: '1.5px solid #000',
                  background: lifelines.phoneAFriend ? '#22c55e' : '#334155', color: '#fff',
                  fontSize: '10px', fontWeight: 950, cursor: lifelines.phoneAFriend ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px',
                  opacity: lifelines.phoneAFriend ? 1 : 0.4
                }}
              >
                <PhoneCall size={12} /> Friend
              </button>

              <button
                onClick={useAskAudience}
                disabled={!lifelines.askAudience || isLocked}
                style={{
                  padding: '8px', borderRadius: '8px', border: '1.5px solid #000',
                  background: lifelines.askAudience ? '#38bdf8' : '#334155', color: '#000',
                  fontSize: '10px', fontWeight: 950, cursor: lifelines.askAudience ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px',
                  opacity: lifelines.askAudience ? 1 : 0.4
                }}
              >
                <Users size={12} /> Audience
              </button>

              <button
                onClick={useSwitchQuestion}
                disabled={!lifelines.switchQuestion || isLocked}
                style={{
                  padding: '8px', borderRadius: '8px', border: '1.5px solid #000',
                  background: lifelines.switchQuestion ? '#f59e0b' : '#334155', color: '#000',
                  fontSize: '10px', fontWeight: 950, cursor: lifelines.switchQuestion ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px',
                  opacity: lifelines.switchQuestion ? 1 : 0.4
                }}
              >
                <RefreshCw size={12} /> Switch
              </button>
            </div>
          </div>

          {/* Money Ladder Standings */}
          <div style={{
            background: '#111827', border: '2.5px solid #000', borderRadius: '12px',
            padding: '8px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '3px'
          }}>
            {activeLadder.map((prizeStr, idx) => {
              const levelNum = idx + 1;
              const isCurrent = levelNum === currentLevel;
              const isPassed = levelNum < currentLevel;
              const isSafe = levelNum === 5 || levelNum === 10 || levelNum === 15;

              return (
                <div
                  key={levelNum}
                  style={{
                    padding: '3px 8px', borderRadius: '6px',
                    background: isCurrent ? '#fbbf24' : isPassed ? '#1e293b' : 'transparent',
                    color: isCurrent ? '#000' : isSafe ? '#22c55e' : isPassed ? '#94a3b8' : '#ffffff',
                    border: isCurrent ? '1.5px solid #000' : 'none',
                    fontWeight: isCurrent || isSafe ? 950 : 800,
                    fontSize: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <span>Level {levelNum}</span>
                  <span>{prizeStr} {isSafe && '⭐'}</span>
                </div>
              );
            })}
          </div>

          {/* Bottom Controls (Walk Away, Share, Rules) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {currentLevel > 1 && !isGameOver && (
              <button
                onClick={handleWalkAway}
                style={{
                  padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #000',
                  background: '#ef4444', color: '#fff', fontWeight: 950, fontSize: '10px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
              >
                <LogOut size={12} /> Walk Away ({activeLadder[currentLevel - 2]})
              </button>
            )}

            <button
              onClick={copyInviteLink}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #000',
                background: copiedLink ? '#22c55e' : '#fbbf24', color: '#000',
                fontWeight: 950, fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              {copiedLink ? <Check size={12} /> : <Share2 size={12} />}
              {copiedLink ? 'Link Copied!' : 'Share Challenge'}
            </button>

            <button
              onClick={() => setActiveModal('rules')}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #000',
                background: '#38bdf8', color: '#000', fontWeight: 950, fontSize: '10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              <BookOpen size={12} /> Rules &amp; Guide
            </button>
          </div>
        </div>

        {/* ─── CENTER AREA: 3D ISOMETRIC TV GAME SHOW STUDIO ─── */}
        <div style={{
          flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
        }}>
          
          {/* Top Bar: Sophisticated 3D Studio Camera Suite & Timer */}
          <div style={{
            display: 'flex', gap: '12px', alignItems: 'center', background: '#111827',
            padding: '6px 16px', borderRadius: '12px', border: '2px solid #1e293b',
            marginBottom: '6px', zIndex: 10, flexWrap: 'wrap', justifyContent: 'between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 950, color: '#fbbf24' }}>📹 3D Studio Camera Angle:</span>
              <button
                onClick={() => { setCameraAnglePreset('iso'); setRotationAngle(0); }}
                style={{
                  padding: '3px 8px', borderRadius: '6px', border: '1.5px solid #000',
                  background: cameraAnglePreset === 'iso' ? '#8b5cf6' : '#1e293b',
                  color: '#ffffff', fontSize: '10px', fontWeight: 900, cursor: 'pointer'
                }}
              >
                🎬 Full Stage (Wide)
              </button>
              <button
                onClick={() => { setCameraAnglePreset('host'); setRotationAngle(-25); }}
                style={{
                  padding: '3px 8px', borderRadius: '6px', border: '1.5px solid #000',
                  background: cameraAnglePreset === 'host' ? '#8b5cf6' : '#1e293b',
                  color: '#ffffff', fontSize: '10px', fontWeight: 900, cursor: 'pointer'
                }}
              >
                🎙️ Host Desk
              </button>
              <button
                onClick={() => { setCameraAnglePreset('contestant'); setRotationAngle(25); }}
                style={{
                  padding: '3px 8px', borderRadius: '6px', border: '1.5px solid #000',
                  background: cameraAnglePreset === 'contestant' ? '#8b5cf6' : '#1e293b',
                  color: '#ffffff', fontSize: '10px', fontWeight: 900, cursor: 'pointer'
                }}
              >
                🎓 Contestant Laptop
              </button>
              <button
                onClick={() => { setCameraAnglePreset('overhead'); setRotationAngle(0); }}
                style={{
                  padding: '3px 8px', borderRadius: '6px', border: '1.5px solid #000',
                  background: cameraAnglePreset === 'overhead' ? '#8b5cf6' : '#1e293b',
                  color: '#ffffff', fontSize: '10px', fontWeight: 900, cursor: 'pointer'
                }}
              >
                ⚡ Overhead Suspense
              </button>

              <input
                type="range"
                min="-45"
                max="45"
                value={rotationAngle}
                onChange={e => setRotationAngle(Number(e.target.value))}
                style={{ width: '80px', cursor: 'pointer', accentColor: ACCENT_COLOR }}
                title="Pan Studio Camera Angle"
              />
            </div>

            {/* 30s High-Stakes Timer Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: timeLeft <= 10 ? '#ef4444' : '#1e293b',
              color: '#fff', padding: '3px 10px', borderRadius: '8px', border: '1.5px solid #000',
              fontWeight: 950, fontSize: '11px', fontFamily: 'monospace'
            }}>
              <Clock size={12} /> {timeLeft}s
            </div>
          </div>

          {/* 3D TV Studio Stage Viewport */}
          <div style={{
            width: '100%', height: 'calc(100% - 46px)',
            background: isLightsDimmed
              ? '#02040a'
              : 'url("/images/millionaire/millionaire_tv_studio_real.jpg") center/cover no-repeat #090d16',
            border: isLightsDimmed ? '3.5px solid #8b5cf6' : '3px solid #000',
            boxShadow: isLightsDimmed ? 'inset 0 0 120px rgba(139, 92, 246, 0.7)' : 'inset 0 0 60px rgba(0,0,0,0.9)',
            borderRadius: '16px', overflow: 'hidden', position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', boxSizing: 'border-box', perspective: '1200px',
            transition: 'all 0.5s ease'
          }}>

            {/* Ambient Studio Blackout Overlay during answer lock */}
            <div style={{
              position: 'absolute', inset: 0,
              background: isLightsDimmed
                ? 'radial-gradient(circle at center, rgba(11, 15, 25, 0.3) 0%, rgba(2, 4, 10, 0.95) 85%)'
                : 'radial-gradient(circle at center, transparent 40%, rgba(9, 13, 22, 0.6) 100%)',
              pointerEvents: 'none', transition: 'all 0.5s ease'
            }} />

            {/* 💡 Authentic Overhead Spotlights Beam */}
            <div style={{
              position: 'absolute', top: 0, left: '15%', width: '120px', height: '100%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(56,189,248,0.08) 60%, transparent 100%)',
              clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0% 100%)', pointerEvents: 'none', zIndex: 3
            }} />
            <div style={{
              position: 'absolute', top: 0, right: '15%', width: '120px', height: '100%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(139,92,246,0.08) 60%, transparent 100%)',
              clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0% 100%)', pointerEvents: 'none', zIndex: 3
            }} />
            
            {/* 3D Authentic TV Studio Hot Seats Environment */}
            <div style={{
              width: '100%', height: '62%', position: 'relative',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              transformStyle: 'preserve-3d',
              transform: cameraAnglePreset === 'overhead'
                ? 'rotateX(50deg) scale(0.95)'
                : cameraAnglePreset === 'host'
                ? 'rotateX(12deg) rotateY(-24deg) scale(1.15) translateX(60px)'
                : cameraAnglePreset === 'contestant'
                ? 'rotateX(12deg) rotateY(24deg) scale(1.15) translateX(-60px)'
                : `rotateX(14deg) rotateY(${rotationAngle}deg)`,
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 5
            }}>
              
              {/* 🎓 CONTESTANT HOT SEAT (Left Stool & Seated Profile Avatar) */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                position: 'absolute', left: '12%', bottom: '15px', zIndex: 10
              }}>
                <div style={{
                  position: 'relative', width: '130px', height: '170px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {/* Seated Contestant Avatar Image */}
                  <img
                    src="/images/millionaire/millionaire_contestant_profile.jpg"
                    alt="3D Contestant Seated Profile"
                    style={{
                      width: '100%', height: '100%', objectFit: 'contain',
                      filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.8))'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/millionaire/millionaire_3d_contestant.jpg';
                    }}
                  />
                </div>
                {/* Badge Label */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.9)', border: '1.5px solid #38bdf8', borderRadius: '8px',
                  padding: '3px 10px', fontSize: '10px', fontWeight: 950, color: '#38bdf8',
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)', marginTop: '-8px'
                }}>
                  🎓 Contestant Hot Seat
                </div>
              </div>

              {/* ⚡ CENTER V-SHAPED BLUE NEON TERMINAL PODIUM */}
              <div style={{
                position: 'relative', width: '240px', height: '160px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                zIndex: 8, transform: 'translateZ(20px)'
              }}>
                {/* Blue Neon V-Shape Arc Base */}
                <div style={{
                  position: 'absolute', bottom: 0, width: '220px', height: '100px',
                  borderBottom: '6px solid #38bdf8', borderLeft: '4px solid #38bdf8', borderRight: '4px solid #38bdf8',
                  borderRadius: '0 0 50px 50px',
                  boxShadow: '0 0 25px #38bdf8, inset 0 0 15px #38bdf8',
                  background: 'linear-gradient(180deg, transparent 0%, rgba(56, 189, 248, 0.15) 100%)'
                }} />

                {/* Central Monitor Screen (Current Prize Display) */}
                <div style={{
                  background: 'linear-gradient(180deg, #1e1b4b 0%, #090d16 100%)',
                  padding: '10px 20px', borderRadius: '14px', border: '2.5px solid #fbbf24',
                  boxShadow: '0 0 30px rgba(251, 191, 36, 0.6), inset 0 0 12px rgba(251, 191, 36, 0.3)',
                  textAlign: 'center', zIndex: 12, marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 950, color: '#fbbf24', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    CURRENT PRIZE
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 950, color: '#ffffff', textShadow: '0 0 12px rgba(255,255,255,0.9)' }}>
                    {activeLadder[currentLevel - 1]}
                  </div>
                </div>
              </div>

              {/* 🎙️ AI TV HOST HOT SEAT (Right Stool & Seated Profile Avatar) */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                position: 'absolute', right: '12%', bottom: '15px', zIndex: 10
              }}>
                <div style={{
                  position: 'relative', width: '130px', height: '170px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {/* Seated Host Avatar Image */}
                  <img
                    src="/images/millionaire/millionaire_host_profile.jpg"
                    alt="3D Host Seated Profile"
                    style={{
                      width: '100%', height: '100%', objectFit: 'contain',
                      filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.8))'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/millionaire/millionaire_3d_host.jpg';
                    }}
                  />
                </div>
                {/* Badge Label */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.9)', border: '1.5px solid #fbbf24', borderRadius: '8px',
                  padding: '3px 10px', fontSize: '10px', fontWeight: 950, color: '#fbbf24',
                  boxShadow: '0 0 12px rgba(251, 191, 36, 0.5)', marginTop: '-8px'
                }}>
                  🎙️ AI TV Host
                </div>
              </div>

            </div>

            {/* 3D Question Card & 4 Option Hexagon Buttons */}
            {activeQ && (
              <div style={{ width: '100%', maxWidth: '640px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Category Badge & Question Header */}
                <div style={{
                  background: '#111827', border: '2.5px solid #8b5cf6', borderRadius: '14px',
                  padding: '12px 16px', boxShadow: '4px 4px 0 #000', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 950, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '4px' }}>
                    📌 Category: {activeQ.category} (Level {activeQ.level}/15)
                  </div>
                  <h2 style={{ fontSize: '15px', fontWeight: 950, color: '#ffffff', margin: 0, lineHeight: 1.4 }}>
                    {activeQ.q}
                  </h2>
                </div>

                {/* 4 Option Buttons Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {activeQ.options.map((optionText, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = selectedOption === idx;
                    const isDisabled = disabledOptions.includes(idx);
                    const isCorrectAnswer = activeQ.a === idx;

                    let bg = '#111827';
                    let borderColor = '#1e293b';
                    let textColor = '#ffffff';

                    if (isDisabled) {
                      bg = '#0f172a';
                      borderColor = '#1e293b';
                      textColor = '#475569';
                    } else if (showAnswerResult) {
                      if (isCorrectAnswer) {
                        bg = '#22c55e';
                        borderColor = '#000000';
                        textColor = '#ffffff';
                      } else if (isSelected) {
                        bg = '#ef4444';
                        borderColor = '#000000';
                        textColor = '#ffffff';
                      }
                    } else if (isSelected) {
                      bg = '#f59e0b';
                      borderColor = '#000000';
                      textColor = '#000000';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isLocked || isDisabled}
                        style={{
                          padding: '10px 14px', borderRadius: '12px',
                          border: `2px solid ${borderColor}`,
                          background: bg, color: textColor,
                          fontSize: '12px', fontWeight: 950,
                          cursor: isLocked || isDisabled ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          boxShadow: isSelected ? '4px 4px 0 #000' : 'none',
                          opacity: isDisabled ? 0.25 : 1,
                          transition: 'all 0.15s ease', textAlign: 'left'
                        }}
                      >
                        <span style={{ color: '#fbbf24', fontWeight: 950 }}>{letter}:</span>
                        <span>{isDisabled ? '—' : optionText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Lock Final Answer Button */}
                {!isGameOver && (
                  <button
                    onClick={handleLockAnswer}
                    disabled={selectedOption === null || isLocked}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '2px solid #000',
                      background: selectedOption !== null && !isLocked ? '#fbbf24' : '#334155',
                      color: selectedOption !== null && !isLocked ? '#000' : '#94a3b8',
                      fontWeight: 950, fontSize: '13px', cursor: selectedOption !== null && !isLocked ? 'pointer' : 'default',
                      boxShadow: selectedOption !== null && !isLocked ? '4px 4px 0 #000' : 'none'
                    }}
                  >
                    {isLocked ? '🔒 Final Answer Locked! Checking...' : '🔒 Lock Final Answer'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Game Over / Winner / Walked Away Overlay */}
          {isGameOver && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '24px', zIndex: 50, color: '#fff', textAlign: 'center'
            }}>
              <Award size={64} color={isMillionaire ? '#fbbf24' : isWalkedAway ? '#38bdf8' : '#ef4444'} />
              <h2 style={{ fontSize: '28px', fontWeight: 950, color: isMillionaire ? '#fbbf24' : isWalkedAway ? '#38bdf8' : '#ef4444', margin: '12px 0 6px 0' }}>
                {isMillionaire ? '🎉 CONGRATULATIONS MILLIONAIRE! 🎉' : isWalkedAway ? '🛡️ CASHED OUT & WALKED AWAY!' : 'GAME OVER!'}
              </h2>
              <p style={{ fontSize: '15px', color: '#e2e8f0', margin: '0 0 20px 0', fontWeight: 800 }}>
                You walk away with: <span style={{ color: '#22c55e', fontSize: '20px', fontWeight: 950 }}>{scorePrize}</span>
              </p>
              <button
                onClick={initGame}
                style={{ padding: '12px 28px', background: ACCENT_COLOR, color: '#fff', border: '2.5px solid #000', borderRadius: '12px', fontWeight: 950, fontSize: '14px', cursor: 'pointer', boxShadow: '4px 4px 0 #000' }}
              >
                Play Again 🚀
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL OVERLAYS FOR LIFELINES & RULES ─── */}
      {activeModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 100
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', border: '3.5px solid #000',
            padding: '24px', width: '400px', color: '#000', boxShadow: '8px 8px 0 #000'
          }}>
            {activeModal === 'friend' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 950, color: '#22c55e', margin: '0 0 12px 0' }}>
                  📞 Phone-a-Friend Mentor
                </h3>
                <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#334155', fontWeight: 700 }}>
                  {friendAdvice}
                </p>
              </div>
            )}

            {activeModal === 'audience' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 950, color: '#38bdf8', margin: '0 0 12px 0' }}>
                  👥 Ask the Audience Poll Results
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 950, width: '20px' }}>{letter}:</span>
                      <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '6px', height: '16px', overflow: 'hidden' }}>
                        <div style={{ width: `${audiencePoll[idx]}%`, background: '#8b5cf6', height: '100%' }} />
                      </div>
                      <span style={{ fontWeight: 900, fontSize: '12px', width: '35px' }}>{audiencePoll[idx]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'rules' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 950, color: '#8b5cf6', margin: '0 0 12px 0' }}>
                  📜 Game Rules & Lifelines Guide
                </h3>
                <ul style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', paddingLeft: '18px', margin: 0, fontWeight: 700 }}>
                  <li>Answer 15 questions correctly to win 1,000,000 in your chosen currency!</li>
                  <li>Level 5 and Level 10 are Safe Havens.</li>
                  <li>Use 50:50, Phone-a-Friend, Ask the Audience, or Switch Question when stuck!</li>
                  <li>Use the 🛡️ Walk Away button to cash out your earnings at any time!</li>
                </ul>
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              style={{
                marginTop: '16px', width: '100%', padding: '10px', borderRadius: '10px',
                border: '2px solid #000', background: '#fbbf24', color: '#000',
                fontWeight: 950, fontSize: '13px', cursor: 'pointer', boxShadow: '3px 3px 0 #000'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
