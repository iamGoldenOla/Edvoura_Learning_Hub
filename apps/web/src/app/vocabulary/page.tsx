import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { VocabularyAtlasExplorer } from '@/components/curriculum/VocabularyAtlasExplorer';
import {
  getVocabularyWords,
  getAllVocabularyTopics,
  CEFR_LEVELS,
  getDailyWord,
} from '@/lib/curriculum/vocabulary/vocabularyEngine';
import { BookOpen, Sparkles, Volume2, Award } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Visual IELTS & Cambridge English Vocabulary Atlas | Edvoura Learning Hub',
  description:
    'Master 7,298 illustrated English vocabulary words with native UK and US pronunciation audio, CEFR levels A1 to C2, and real-world IELTS example sentences.',
  openGraph: {
    title: 'Edvoura Visual Vocabulary Atlas (7,298 Words)',
    description:
      'Connect words with vivid illustrations, native British & American speech, and spaced repetition review.',
  },
};

export default function VocabularyPage() {
  const initialData = getVocabularyWords({ page: 1, limit: 24 });
  const topics = getAllVocabularyTopics();
  const dailyWord = getDailyWord();

  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-8 border-navy bg-navy pb-16 pt-[104px] sm:pb-20 sm:pt-[120px] md:pb-24 md:pt-[140px] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#F5C518_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="marketing-container relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-yellow border-3 sm:border-4 border-white text-navy font-heading font-black px-4 sm:px-6 py-2 rounded-xl mb-6 shadow-[4px_4px_0px_#FFFFFF] rotate-[-1deg]">
            <Sparkles className="w-5 h-5 text-navy" /> VISUAL VOCABULARY ATLAS &amp; AUDIO HUB
          </div>

          <h1
            className="font-heading font-black text-white leading-[1.1] mb-6 drop-shadow-[4px_4px_0px_#060E1C] break-words"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
          >
            Learn English Words Through Pictures &amp; Native Audio
          </h1>

          <p className="text-white/80 text-base sm:text-xl max-w-3xl mx-auto font-bold mb-10 leading-relaxed">
            Memorizing dry word lists is history. Explore{' '}
            <strong className="text-yellow">7,298 illustrated vocabulary words</strong> with authentic{' '}
            <strong className="text-yellow">British (UK) and American (US) audio</strong>, CEFR A1–C2 levels, and IELTS context sentences.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 bg-white/10 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
              <span className="block text-2xl sm:text-3xl font-black text-yellow font-heading">7,298</span>
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Illustrated Words</span>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400 font-heading">Dual Audio</span>
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">UK &amp; US Accents</span>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
              <span className="block text-2xl sm:text-3xl font-black text-sky-400 font-heading">19 Topics</span>
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">IELTS &amp; Cambridge</span>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
              <span className="block text-2xl sm:text-3xl font-black text-pink-400 font-heading">A1 to C2</span>
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">CEFR Framework</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Explorer Section */}
      <section className="py-12 sm:py-16 md:py-20 border-b-8 border-navy flex-1">
        <div className="marketing-container max-w-7xl mx-auto px-4 sm:px-6">
          <VocabularyAtlasExplorer
            initialWords={initialData.words}
            totalWords={initialData.total}
            topics={topics}
            levels={CEFR_LEVELS}
            dailyWord={dailyWord}
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-yellow py-16 md:py-20 border-b-8 border-navy">
        <div className="marketing-container max-w-4xl mx-auto text-center px-4">
          <h2 className="font-heading font-black text-navy text-3xl sm:text-5xl mb-6">
            Master English with a 1-on-1 Certified Tutor
          </h2>
          <p className="text-navy/80 text-base sm:text-lg font-bold mb-8 max-w-2xl mx-auto">
            From 11+ English grammar and Cambridge IGCSE to IELTS band 8+ preparation, our international tutors customize lessons to your child&apos;s pace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-navy text-white font-heading font-black px-8 py-4 rounded-xl border-3 border-navy shadow-[4px_4px_0px_#FFFFFF] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-lg"
            >
              Book a Free Trial Session
            </Link>
            <Link
              href="/pricing"
              className="bg-white text-navy font-heading font-black px-8 py-4 rounded-xl border-3 border-navy shadow-[4px_4px_0px_#060E1C] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-lg"
            >
              Explore Plans ($20/session)
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
