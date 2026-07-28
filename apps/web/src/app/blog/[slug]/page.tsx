import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { ArrowLeft, Clock, User, Share2 } from 'lucide-react';
import BlogSidebar from '@/components/marketing/BlogSidebar';

// TODO: Replace with Supabase query → blog_posts WHERE slug = params.slug
const mockPost = {
  title: 'How Online Tutoring Is Transforming Nigerian Education',
  category: 'Education',
  date: 'October 8, 2026',
  readTime: '5 min read',
  author: 'Edvoura Editorial',
  content: `
    The landscape of education in Nigeria is undergoing a seismic shift. With over 70% of Nigerian households now having access to mobile internet, the barriers that once made quality tutoring a privilege of the urban elite are rapidly dissolving.

    ## The Challenge

    For decades, Nigerian families outside major cities faced a persistent challenge: access to quality teachers. Rural and semi-urban areas often lack qualified subject specialists, particularly in STEM subjects. Even in cities like Lagos and Abuja, the cost of hiring private "lesson teachers" can run into hundreds of thousands of naira per term.

    ## The Digital Bridge

    Online tutoring platforms like Edvoura are changing this equation entirely. By connecting students with vetted, qualified tutors via Google Meet, we eliminate geography from the equation. A student in Sokoto can learn advanced Mathematics from a PhD holder in Lagos — in real-time, with screen sharing, whiteboards, and interactive tools.

    ## What the Data Shows

    Our internal data reveals compelling trends:

    - Students who attend 3+ sessions per week show a 34% improvement in test scores within 2 months
    - 89% of parents report increased confidence in their child's academic abilities
    - Tutor retention rate stands at 94%, indicating high satisfaction on both sides of the platform
    - Average session rating is 4.8 out of 5 stars

    ## The Edvoura Approach

    What sets Edvoura apart from generic video calling is our purpose-built learning ecosystem. Every session exists within a context of assignments, quizzes, progress tracking, and parent visibility. It's not just a call — it's a structured learning experience.

    ## Looking Ahead

    As internet access continues to expand across Nigeria, and as families become more comfortable with digital learning tools, we expect online tutoring to become the default mode of supplementary education within the next 3-5 years. Edvoura is building the infrastructure to support that future — today.

    The question is no longer whether online tutoring works. It's whether we can scale it fast enough to meet the demand.
  `,
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // TODO: Fetch post by slug from Supabase
  const post = mockPost;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <article className="bg-white pt-[72px]">
        {/* Header */}
        <div className="bg-navy">
          <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-20">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs text-grey hover:text-yellow font-medium mb-8 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
            </Link>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-yellow-dim bg-yellow/10 px-3 py-1 rounded-full w-fit mb-5">{post.category}</span>
            <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl leading-tight mb-6">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-5 text-sm text-grey">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author}</span>
              <span>{post.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.readTime}</span>
            </div>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="marketing-container py-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Left Content Column */}
            <div className="flex-1 w-full min-w-0 max-w-3xl mx-auto lg:mx-0">
              <div className="prose prose-slate max-w-none text-grey leading-relaxed text-[15px]">
                {post.content.split('\n\n').map((paragraph, i) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;
                  if (trimmed.startsWith('## ')) {
                    return <h2 key={i} className="font-heading font-extrabold text-navy text-2xl mt-12 mb-4">{trimmed.replace('## ', '')}</h2>;
                  }
                  if (trimmed.startsWith('- ')) {
                    const items = trimmed.split('\n').filter(l => l.trim().startsWith('- '));
                    return (
                      <ul key={i} className="my-6 space-y-2">
                        {items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-grey text-sm">
                            <span className="text-yellow mt-1">•</span>
                            {item.replace('- ', '').trim()}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i} className="mb-5">{trimmed}</p>;
                })}
              </div>

              {/* Share */}
              <div className="mt-16 pt-8 border-t border-grey-light flex items-center justify-between">
                <Link href="/blog" className="text-sm text-grey hover:text-navy font-medium transition-colors inline-flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> More Articles
                </Link>
                <button className="flex items-center gap-2 text-sm text-grey hover:text-yellow font-medium transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            {/* Right Sidebar Column */}
            <BlogSidebar />
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
