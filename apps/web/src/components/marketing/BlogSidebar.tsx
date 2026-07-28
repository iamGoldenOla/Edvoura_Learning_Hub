import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react';

const categories = [
  { name: 'Education', count: 12, href: '#' },
  { name: 'Exam Prep', count: 8, href: '#' },
  { name: 'Student Tips', count: 5, href: '#' },
  { name: 'Psychology', count: 3, href: '#' },
];

const recentPosts = [
  {
    title: 'How Online Tutoring Is Transforming Global Education',
    slug: 'how-online-tutoring-is-transforming-nigerian-education',
    date: 'Oct 08, 2026',
  },
  {
    title: 'Preparing Your Child for Exams: A Parent\'s Guide',
    slug: 'preparing-your-child-for-waec-2027',
    date: 'Oct 02, 2026',
  },
  {
    title: '5 Study Habits of Top-Performing Students',
    slug: '5-study-habits-of-top-performing-students',
    date: 'Sep 28, 2026',
  },
];

export default function BlogSidebar() {
  return (
    <aside className="space-y-10 w-full lg:w-[320px] xl:w-[350px] shrink-0 lg:sticky lg:top-24">
      {/* Categories Widget */}
      <div className="bg-white border-4 border-navy rounded-[2rem] p-6 sm:p-8 shadow-[8px_8px_0px_#0A1628]">
        <h3 className="font-heading font-black text-navy text-xl sm:text-2xl mb-6 flex items-center gap-2 pb-3 border-b-4 border-navy uppercase tracking-tight">
          Categories
        </h3>
        <ul className="space-y-4">
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link
                href={cat.href}
                className="flex items-center justify-between font-bold text-navy hover:text-info transition-colors group text-sm sm:text-base"
              >
                <span className="underline decoration-2 underline-offset-4 decoration-transparent group-hover:decoration-info transition-all">
                  {cat.name}
                </span>
                <span className="bg-off-white border-2 border-navy px-2.5 py-0.5 rounded-lg text-xs shadow-[2px_2px_0px_#0A1628] group-hover:bg-yellow transition-colors font-black">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Posts Widget */}
      <div className="bg-white border-4 border-navy rounded-[2rem] p-6 sm:p-8 shadow-[8px_8px_0px_#0A1628]">
        <h3 className="font-heading font-black text-navy text-xl sm:text-2xl mb-6 flex items-center gap-2 pb-3 border-b-4 border-navy uppercase tracking-tight">
          Recent Posts
        </h3>
        <div className="space-y-5">
          {recentPosts.map((post) => (
            <div key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <span className="block text-xs font-black text-navy/40 uppercase mb-1">{post.date}</span>
                <h4 className="font-heading font-black text-navy text-sm group-hover:text-info transition-colors leading-snug line-clamp-2">
                  {post.title}
                </h4>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Adverts Widget */}
      <div className="space-y-8">
        <h3 className="font-heading font-black text-navy text-lg uppercase tracking-wider text-center lg:text-left">
          Sponsored Ads
        </h3>

        {/* Ad 1: Edvoura Flyer */}
        <div className="bg-white border-4 border-navy rounded-[2rem] p-4 shadow-[8px_8px_0px_#F5C518] hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-4 right-4 z-10 bg-yellow border-2 border-navy text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-[1px_1px_0px_#0A1628]">
            Ad
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-navy mb-4 bg-off-white">
            <Image src="/images/flyer.jpg" alt="Edvoura Flyer" fill className="object-cover" />
          </div>
          <Link
            href="/signup"
            className="flex w-full items-center justify-center gap-1.5 bg-navy text-white border-2 border-navy font-heading text-xs font-black py-2.5 rounded-lg shadow-[3px_3px_0px_#F5C518] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#F5C518] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider"
          >
            Join Edvoura Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Ad 2: MC Card for Akinola Olujobi */}
        <div className="bg-white border-4 border-navy rounded-[2rem] p-4 shadow-[8px_8px_0px_#0A1628] hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-4 right-4 z-10 bg-yellow border-2 border-navy text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-[1px_1px_0px_#0A1628]">
            Ad
          </div>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border-2 border-navy mb-4 bg-off-white">
            <Image src="/images/mc_card.jpg" alt="Akinola Olujobi MC Card" fill className="object-cover" />
          </div>
          <a
            href="mailto:connect@akinolaolujobi.com"
            className="flex w-full items-center justify-center gap-1.5 bg-yellow text-navy border-2 border-navy font-heading text-xs font-black py-2.5 rounded-lg shadow-[3px_3px_0px_#0A1628] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1628] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider"
          >
            Hire Event Host <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Ad 3: TrendTactics Digital Flyer */}
        <div className="bg-white border-4 border-navy rounded-[2rem] p-4 shadow-[8px_8px_0px_#0A1628] hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-4 right-4 z-10 bg-yellow border-2 border-navy text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-[1px_1px_0px_#0A1628]">
            Ad
          </div>
          <div className="relative aspect-[1/1] w-full overflow-hidden rounded-xl border-2 border-navy mb-4 bg-off-white">
            <Image src="/images/trendtactics.jpg" alt="TrendTactics Digital Flyer" fill className="object-cover" />
          </div>
          <a
            href="https://wa.me/2349068133874"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-1.5 bg-success text-white border-2 border-navy font-heading text-xs font-black py-2.5 rounded-lg shadow-[3px_3px_0px_#0A1628] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1628] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider"
          >
            Get a Website <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
}
