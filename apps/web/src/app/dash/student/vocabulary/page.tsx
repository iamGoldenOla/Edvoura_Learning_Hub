import { Metadata } from 'next';
import { VocabularyAtlasExplorer } from '@/components/curriculum/VocabularyAtlasExplorer';
import {
  getVocabularyWords,
  getAllVocabularyTopics,
  CEFR_LEVELS,
  getDailyWord,
} from '@/lib/curriculum/vocabulary/vocabularyEngine';
import { Sparkles, ArrowLeft, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Visual Vocabulary Atlas | Student Hub',
  description: 'Explore 7,298 illustrated vocabulary words with UK/US audio and definitions.',
};

export default function StudentVocabularyPage() {
  const initialData = getVocabularyWords({ page: 1, limit: 24 });
  const topics = getAllVocabularyTopics();
  const dailyWord = getDailyWord();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-navy border-4 border-dark rounded-[28px] p-6 sm:p-8 text-white shadow-[8px_8px_0px_#060E1C] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Link
              href="/dash/student"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow hover:underline mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Student Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow rounded-xl border-2 border-dark flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#FFFFFF]">
                <Sparkles className="w-5 h-5 text-dark" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
                  Visual Vocabulary &amp; Audio Atlas
                </h1>
                <p className="text-xs sm:text-sm font-bold text-white/70">
                  7,298 words with vivid picture flashcards, native British and American pronunciation, and example sentences.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dash/student/spelling-bee"
            className="bg-yellow text-dark border-3 border-dark font-heading font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider shadow-[3px_3px_0px_#FFFFFF] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 shrink-0"
          >
            <Gamepad2 className="w-4 h-4" /> Play Spelling Bee
          </Link>
        </div>
      </div>

      {/* Explorer Component */}
      <div className="bg-white border-4 border-dark rounded-[28px] p-6 sm:p-8 shadow-[8px_8px_0px_#060E1C]">
        <VocabularyAtlasExplorer
          initialWords={initialData.words}
          totalWords={initialData.total}
          topics={topics}
          levels={CEFR_LEVELS}
          dailyWord={dailyWord}
        />
      </div>
    </div>
  );
}
