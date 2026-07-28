import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { ArrowRight, Clock, Star, BookOpen, Search } from 'lucide-react';
import Image from 'next/image';
import BlogSidebar from '@/components/marketing/BlogSidebar';

// TODO: Replace with Supabase query → blog_posts
const blogPosts = [
  {
    slug: 'how-online-tutoring-is-transforming-nigerian-education',
    title: 'How Online Tutoring Is Transforming Global Education',
    excerpt: 'From Lagos to Toronto, online tutoring is breaking geographical barriers and giving every child access to quality education. Here\'s what the data shows.',
    category: 'Education',
    date: 'Oct 08, 2026',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    color: 'bg-info',
    tilt: 'rotate-1'
  },
  {
    slug: 'preparing-your-child-for-waec-2027',
    title: 'Preparing Your Child for Exams: A Parent\'s Guide',
    excerpt: 'Exam preparation doesn\'t start in the final month — it starts now. Here\'s a month-by-month breakdown of how to set your child up for success.',
    category: 'Exam Prep',
    date: 'Oct 02, 2026',
    readTime: '8 min read',
    img: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2070&auto=format&fit=crop',
    color: 'bg-error',
    tilt: '-rotate-1'
  },
  {
    slug: '5-study-habits-of-top-performing-students',
    title: '5 Study Habits of Top-Performing Students',
    excerpt: 'We surveyed our highest-scoring students to understand what separates them from the pack. Spoiler: it\'s not about studying more hours.',
    category: 'Student Tips',
    date: 'Sep 28, 2026',
    readTime: '4 min read',
    img: 'https://images.unsplash.com/photo-1510172951991-856a654063f9?q=80&w=1974&auto=format&fit=crop',
    color: 'bg-success',
    tilt: 'rotate-2'
  },
  {
    slug: 'the-science-of-gamified-learning',
    title: 'The Science Behind Gamified Learning',
    excerpt: 'Badges, streaks, and leaderboards aren\'t just gimmicks — they\'re backed by decades of behavioural psychology research.',
    category: 'Psychology',
    date: 'Sep 14, 2026',
    readTime: '7 min read',
    img: 'https://images.unsplash.com/photo-1497633762265-9a177c809dd3?q=80&w=2070&auto=format&fit=crop',
    color: 'bg-yellow',
    tilt: '-rotate-2'
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Hero (Parallax) */}
      <section 
        className="relative overflow-hidden border-b-8 border-navy bg-cover bg-center pb-16 pt-[104px] sm:pb-20 sm:pt-[120px] md:pb-28 md:pt-[150px] z-10"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497633762265-9a177c809dd3?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-navy/85 backdrop-blur-sm" />
        
        <div className="marketing-container relative z-10 pt-6 text-center w-full min-w-0">
          <div className="inline-block bg-yellow border-4 border-navy text-navy font-heading font-black px-4 sm:px-6 py-2 rounded-xl mb-8 shadow-[4px_4px_0px_#0A1628] rotate-[-2deg] transition-transform hover:rotate-0 max-w-full break-words">
            INSIGHTS & UPDATES
          </div>
          <h1 className="font-heading font-black text-white max-w-4xl mx-auto leading-[1.1] mb-8 drop-shadow-[4px_4px_0px_#0A1628] break-words" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            The Science of Global Learning
          </h1>
          <p className="text-white text-base sm:text-xl max-w-2xl mx-auto font-bold bg-navy/50 backdrop-blur-md p-4 sm:p-6 rounded-2xl border-4 border-white shadow-[6px_6px_0px_#F5C518] transform rotate-1 max-w-full break-words">
            Practical advice for students, parents, and educators — straight from the Edvoura academic board.
          </p>
          
          <div className="mt-12 flex justify-center max-w-md mx-auto relative group px-2 sm:px-0 w-full">
             <input 
               type="text" 
               placeholder="Search articles..." 
               className="w-full bg-white border-4 border-navy rounded-2xl px-12 py-4 font-bold shadow-[8px_8px_0px_#0A1628] focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all"
             />
             <Search className="absolute left-6 sm:left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-navy" />
          </div>
        </div>
      </section>

      {/* Featured Grid with Sidebar */}
      <section className="bg-white py-24 md:py-32 border-b-8 border-navy relative">
        <div className="marketing-container">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Left Content Column */}
            <div className="flex-1 w-full min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {blogPosts.map((post, i) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className={`group relative flex flex-col bg-white border-4 border-navy rounded-[2.5rem] p-8 shadow-[12px_12px_0px_#0A1628] hover:-translate-y-2 hover:shadow-[15px_15px_0px_#0A1628] transition-all duration-300 ${post.tilt}`}
                  >
                    <div className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-navy mb-8 bg-navy shrink-0">
                       <Image src={post.img} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                       <div className="absolute top-4 left-4 bg-white border-2 border-navy px-3 py-1 rounded-lg text-xs font-black shadow-[2px_2px_0px_#0A1628]">
                          {post.category}
                       </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-4 text-xs font-black uppercase tracking-widest text-navy/60">
                         <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                         <span>{post.date}</span>
                      </div>
                      <h2 className="font-heading font-black text-navy text-xl sm:text-2xl mb-4 group-hover:text-info transition-colors leading-tight">
                         {post.title}
                      </h2>
                      <p className="text-navy font-bold text-sm sm:text-base mb-8 line-clamp-3 opacity-80">{post.excerpt}</p>
                      
                      <div className="mt-auto flex items-center justify-between border-t-2 border-navy/10 pt-6">
                         <div className="flex items-center gap-2 text-navy font-black underline decoration-4 underline-offset-4">
                            Read Now 
                         </div>
                         <div className="w-10 h-10 rounded-full border-4 border-navy flex items-center justify-center group-hover:bg-yellow group-hover:rotate-45 transition-all">
                            <ArrowRight className="w-5 h-5 text-navy" />
                         </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-20 flex justify-center">
                 <button className="bg-navy text-white border-4 border-navy font-heading font-black px-12 py-5 rounded-2xl shadow-[10px_10px_0px_#F5C518] hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0px_#F5C518] transition-all text-xl">
                    Load More Articles
                 </button>
              </div>
            </div>

            {/* Right Sidebar Column */}
            <BlogSidebar />
          </div>
        </div>
      </section>

      {/* Newsletter (Brutalist) */}
      <section className="bg-error py-24 border-b-8 border-navy relative overflow-hidden">
        <div className="marketing-container relative z-10 max-w-4xl text-center">
           <h2 className="font-heading font-black text-white text-4xl md:text-6xl mb-8 drop-shadow-[4px_4px_0px_#0A1628]">Stay in the Loop</h2>
           <p className="text-white text-xl font-bold mb-10">Get the latest academic insights and platform updates delivered to your inbox.</p>
           <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-center">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white border-4 border-navy rounded-xl px-6 py-4 font-bold text-navy shadow-[6px_6px_0px_#0A1628] focus:outline-none"
              />
              <button className="bg-yellow text-navy border-4 border-navy font-heading font-black px-10 py-4 rounded-xl shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#0A1628] transition-all">
                 Subscribe
              </button>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
