import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

// TODO: Replace with Supabase query → blog_posts
const blogPosts = [
  {
    slug: 'how-online-tutoring-is-transforming-nigerian-education',
    title: 'How Online Tutoring Is Transforming Nigerian Education',
    excerpt: 'From Lagos to Kano, online tutoring is breaking geographical barriers and giving every child access to quality education. Here\'s what the data shows.',
    category: 'Education',
    date: 'Oct 08, 2026',
    readTime: '5 min read',
    color: 'bg-blue-500',
  },
  {
    slug: 'preparing-your-child-for-waec-2027',
    title: 'Preparing Your Child for WAEC 2027: A Parent\'s Guide',
    excerpt: 'WAEC preparation doesn\'t start in SS3 — it starts now. Here\'s a month-by-month breakdown of how to set your child up for success.',
    category: 'Exam Prep',
    date: 'Oct 02, 2026',
    readTime: '8 min read',
    color: 'bg-purple-500',
  },
  {
    slug: '5-study-habits-of-top-performing-students',
    title: '5 Study Habits of Top-Performing Students',
    excerpt: 'We surveyed our highest-scoring students to understand what separates them from the pack. Spoiler: it\'s not about studying more hours.',
    category: 'Student Tips',
    date: 'Sep 28, 2026',
    readTime: '4 min read',
    color: 'bg-green-500',
  },
  {
    slug: 'why-nigerian-parents-are-choosing-edvoura',
    title: 'Why Nigerian Parents Are Choosing Edvoura Over Traditional Lesson Teachers',
    excerpt: 'The shift from in-home lesson teachers to structured online tutoring is accelerating. Parents share their reasons for making the switch.',
    category: 'Platform',
    date: 'Sep 20, 2026',
    readTime: '6 min read',
    color: 'bg-yellow-dim',
  },
  {
    slug: 'the-science-of-gamified-learning',
    title: 'The Science Behind Gamified Learning: Why It Works',
    excerpt: 'Badges, streaks, and leaderboards aren\'t just gimmicks — they\'re backed by decades of behavioural psychology research.',
    category: 'Education',
    date: 'Sep 14, 2026',
    readTime: '7 min read',
    color: 'bg-blue-500',
  },
  {
    slug: 'how-to-become-an-edvoura-tutor',
    title: 'How to Become an Edvoura Tutor: Requirements & Process',
    excerpt: 'Interested in teaching on Edvoura? Here\'s everything you need to know about our application process, requirements, and what to expect.',
    category: 'Tutors',
    date: 'Sep 08, 2026',
    readTime: '5 min read',
    color: 'bg-purple-500',
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy pt-[72px] relative overflow-hidden">
        <div className="hero-grid-overlay absolute inset-0 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-4">Blog</p>
          <h1 className="font-heading font-extrabold text-white max-w-3xl mx-auto leading-tight" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}>
            Insights, Tips & Updates
          </h1>
          <p className="mt-6 text-grey text-base max-w-xl mx-auto">
            Practical advice for students, parents, and educators — straight from the Edvoura team.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="bg-off-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white border border-grey-light rounded-2xl overflow-hidden group hover:border-yellow hover:shadow-md transition-all duration-300"
              >
                {/* Colour bar header */}
                <div className={`h-2 ${post.color}`} />
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-dim bg-yellow/10 px-3 py-1 rounded-full">{post.category}</span>
                    <span className="flex items-center gap-1 text-[10px] text-grey font-medium">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-navy text-lg leading-snug mb-3 group-hover:text-yellow transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-grey text-sm leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-grey font-medium">{post.date}</span>
                    <span className="text-yellow text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
