import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import {
  Video, Brain, ClipboardList, Users, Star, ArrowRight, Play,
  CheckCircle2, UserPlus, Search, BookOpen, Shield,
  Gamepad2, Sparkles, Sprout, Hammer, Trophy, LayoutDashboard, Clock, Globe
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* ===== HERO SECTION (PARALLAX + 3D NEO-BRUTALIST) ===== */}
      <section 
        className="relative overflow-hidden border-b-8 border-navy bg-cover bg-center pb-16 pt-[104px] sm:pb-20 sm:pt-[120px] md:pb-28 md:pt-[150px] z-10"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1427504494785-3a9a2753cd0e?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-yellow/90 backdrop-blur-sm" />
        
        <div className="marketing-container-wide relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            
            {/* Left Column — Copy */}
            <div className="relative max-w-2xl min-w-0">
              <div className="marketing-eyebrow mb-6 rotate-[-2deg] transition-transform hover:rotate-0">
                <Star className="w-5 h-5 fill-navy" />
                Premium K-12 Global Learning
              </div>

              <h1 className="marketing-display max-w-full break-words font-heading font-black tracking-tight text-navy drop-shadow-[3px_3px_0px_#FFFFFF] sm:drop-shadow-[4px_4px_0px_#FFFFFF]">
                Unlock Your
                <br />
                Child&apos;s{' '}
                <span className="relative mt-2 block max-w-full sm:inline-block">
                  <span className="relative z-10 inline-block max-w-full -rotate-1 border-4 border-white bg-navy px-2 py-0.5 text-white shadow-[4px_4px_0px_rgba(255,255,255,0.4)] sm:rotate-2 sm:shadow-[6px_6px_0px_rgba(255,255,255,0.4)]">Potential</span>
                </span>
              </h1>

              <p className="marketing-kicker mt-8 max-w-xl bg-white/80">
                Expert tutors from around the world. Private 1-on-1 sessions. Highly interactive 3D learning tools. The gamified platform built for international academic excellence.
              </p>

              {/* Neo-brutalist CTAs */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border-4 border-navy bg-success px-6 py-4 text-lg font-heading font-black text-white shadow-[8px_8px_0px_#0A1628] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#0A1628] active:translate-x-2 active:translate-y-2 active:shadow-none sm:px-8 sm:py-5 sm:text-xl"
                >
                  Start Free Trial <ArrowRight className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-4 border-navy bg-white px-6 py-4 text-lg font-heading font-black text-navy shadow-[8px_8px_0px_#0A1628] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#0A1628] active:translate-x-2 active:translate-y-2 active:shadow-none sm:px-8 sm:py-5 sm:text-xl"
                >
                  <Play className="w-6 h-6 fill-navy" /> Watch Demo
                </button>
              </div>
            </div>

            {/* Right Column — 3D Image composition */}
            <div className="order-first relative z-10 w-full min-w-0 lg:order-none lg:h-[600px] lg:perspective-[1500px]">
              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-navy bg-white shadow-[10px_10px_0px_#0A1628] lg:hidden">
                <Image
                  src="/images/hero_student.png"
                  alt="Student learning online"
                  width={900}
                  height={720}
                  className="h-auto w-full object-cover object-center"
                  priority
                />
              </div>

              {/* 3D Tilted Card */}
              <div className="absolute inset-0 hidden overflow-hidden rounded-[2rem] border-8 border-navy bg-white shadow-[20px_20px_0px_#0A1628] transition-all duration-700 ease-out z-10 lg:block lg:rotate-x-[5deg] lg:rotate-y-[-15deg] lg:rotate-z-[2deg] lg:hover:translate-x-2 lg:hover:translate-y-2 lg:hover:rotate-x-0 lg:hover:rotate-y-0 lg:hover:rotate-z-0 lg:hover:shadow-[10px_10px_0px_#0A1628]">
                <Image
                  src="/images/hero_student.png"
                  alt="Student learning online"
                  fill
                  className="object-cover object-[center_30%]"
                  priority
                />
              </div>

              {/* Overlapping Info Card */}
              <div className="mt-4 rounded-2xl border-4 border-navy bg-white p-4 shadow-[8px_8px_0px_#0A1628] z-30 lg:absolute lg:bottom-10 lg:-left-10 lg:mt-0 lg:-rotate-3 lg:transition-transform lg:hover:rotate-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-navy flex-shrink-0 bg-yellow flex items-center justify-center">
                    <Image src="/images/tutor_session.png" alt="Tutor" width={64} height={64} className="object-cover h-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-navy font-heading font-black text-xl">Dr. Adebayo O.</p>
                      <span className="bg-success text-white border-2 border-navy font-bold px-2 py-0.5 rounded shadow-[2px_2px_0px_#0A1628]">
                        LIVE
                      </span>
                    </div>
                    <p className="text-grey font-bold">International Faculty</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== EXPLORER BAND (GRADES 1-3) ===== */}
      <section className="bg-info py-24 relative overflow-hidden border-b-8 border-navy">
        <div className="marketing-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image Box */}
            <div className="relative group perspective-[2000px]">
              <div className="relative bg-white border-8 border-navy rounded-[3rem] shadow-[15px_15px_0px_#0A1628] overflow-hidden transform rotate-y-12 rotate-z-[-3deg] group-hover:rotate-y-0 group-hover:rotate-z-0 group-hover:translate-x-2 group-hover:translate-y-2 group-hover:shadow-[5px_5px_0px_#0A1628] transition-all duration-500 z-20">
                <Image 
                  src="/images/teddy.png" 
                  alt="Child friendly learning on Edvoura" 
                  width={800} 
                  height={800} 
                  className="w-full h-auto object-cover"
                />
              </div>
              
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow border-4 border-navy rounded-3xl flex items-center justify-center rotate-12 shadow-[6px_6px_0px_#0A1628] z-30 animate-[bounce_3s_infinite]">
                <Star className="w-12 h-12 text-navy fill-navy" />
              </div>
            </div>

            {/* Text Box */}
            <div className="lg:pl-8">
              <div className="inline-block bg-white border-4 border-navy text-navy font-black px-5 py-2 rounded-xl mb-8 shadow-[4px_4px_0px_#0A1628] rotate-2">
                GRADES 1—3
              </div>
              <h2 className="font-heading font-black text-white text-5xl md:text-6xl mb-8 leading-[1.1] drop-shadow-[4px_4px_0px_#0A1628]">
                Learning that feels like Playtime.
              </h2>
              <div className="bg-white border-4 border-navy rounded-2xl p-6 shadow-[8px_8px_0px_#0A1628] mb-10 transform -rotate-1">
                <p className="text-navy text-xl font-bold leading-relaxed">
                  For our youngest learners (The Explorer Band), we replace rigid tables with vibrant sticker books, engaging subject games, and visual reward gardens.
                </p>
              </div>
              
              <ul className="space-y-4 mb-10 bg-navy text-white border-4 border-navy rounded-2xl p-6 shadow-[8px_8px_0px_#0A1628] transform rotate-1">
                {[
                  'Earn digital stickers and animated badges',
                  'Interactive story-based lesson formats',
                  'Safe, friendly, and visually stunning dashboards'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-success border-2 border-navy flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#FFFFFF]">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-yellow text-navy font-heading font-black px-8 py-5 rounded-xl border-4 border-navy shadow-[8px_8px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#0A1628] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all text-xl w-full sm:w-auto">
                Discover The Explorer <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BUILDER BAND (GRADES 4-6) - NEW SECTION ===== */}
      <section className="bg-success py-24 relative overflow-hidden border-b-8 border-navy">
        <div className="marketing-container">
          <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
            {/* Image Box */}
            <div className="relative group perspective-[2000px] flex-1">
              <div className="relative bg-white border-8 border-navy rounded-[3rem] shadow-[15px_15px_0px_#0A1628] overflow-hidden transform -rotate-y-12 rotate-z-[3deg] group-hover:rotate-y-0 group-hover:rotate-z-0 transition-all duration-500 z-20">
                <Image 
                  src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2070&auto=format&fit=crop" 
                  alt="Students in the Builder Band" 
                  width={800} 
                  height={800} 
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-4 w-24 h-24 bg-navy border-4 border-white rounded-3xl flex items-center justify-center -rotate-6 shadow-[6px_6px_0px_#F5C518] z-30">
                <Hammer className="w-12 h-12 text-yellow" />
              </div>
            </div>

            {/* Text Box */}
            <div className="flex-1 lg:pr-8">
              <div className="inline-block bg-white border-4 border-navy text-navy font-black px-5 py-2 rounded-xl mb-8 shadow-[4px_4px_0px_#0A1628] -rotate-2">
                GRADES 4—6
              </div>
              <h2 className="font-heading font-black text-white text-5xl md:text-6xl mb-8 leading-[1.1] drop-shadow-[4px_4px_0px_#0A1628]">
                Building Mastery & Confidence.
              </h2>
              <div className="bg-white border-4 border-navy rounded-2xl p-6 shadow-[8px_8px_0px_#0A1628] mb-10 transform rotate-1">
                <p className="text-navy text-xl font-bold leading-relaxed">
                   For our intermediate learners (The Builder Band), we shift focus to structured subjects, badge walls, and competitive progress tracks that reward consistency and academic growth.
                </p>
              </div>
              
              <ul className="space-y-4 mb-10 bg-navy text-white border-4 border-navy rounded-2xl p-6 shadow-[8px_8px_0px_#F5C518] transform -rotate-1">
                {[
                  'Subject-level Badge Walls & Milestones',
                  'Structured Homework & Quiz Hubs',
                  'Consistency Streaks & Peer Leaderboards'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-yellow border-2 border-navy flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#0A1628] mt-0.5">
                      <Trophy className="w-5 h-5 text-navy" />
                    </div>
                    <span className="font-bold text-lg">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-navy text-white font-heading font-black px-8 py-5 rounded-xl border-4 border-white shadow-[8px_8px_0px_#F5C518] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#F5C518] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all text-xl w-full sm:w-auto">
                Discover The Builder <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ACHIEVER BAND (GRADES 7-12) ===== */}
      <section className="bg-navy py-32 border-b-8 border-navy relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
        <div className="marketing-container-wide relative z-10 pb-20 text-center">
          <div className="inline-block bg-white border-4 border-navy text-navy font-black px-5 py-2 rounded-xl mb-8 shadow-[4px_4px_0px_#F5C518] rotate-2">
            GRADES 7—12
          </div>
          <h2 className="font-heading font-black text-white text-5xl md:text-7xl mb-6 drop-shadow-[4px_4px_0px_#060E1C]">The Achiever View</h2>
          <p className="bg-white text-navy font-bold text-xl px-6 py-4 rounded-xl border-4 border-navy shadow-[6px_6px_0px_#F5C518] max-w-2xl mx-auto transform -rotate-1">
            A high-performance command center for SAT, WAEC, NECO, and JAMB prep across the globe.
          </p>
        </div>

        <div className="marketing-container relative z-10 perspective-[2000px]">
          <div className="relative bg-navy border-8 border-white rounded-[2rem] shadow-[20px_20px_0px_#F5C518] overflow-hidden transform rotate-x-[12deg] rotate-y-[-5deg] hover:rotate-x-0 hover:rotate-y-0 transition-transform duration-700 mx-auto group">
            <Image 
              src="/images/learning_dashboard_ui.png" 
              alt="Edvoura Dashboard UI" 
              width={1600} 
              height={900} 
              className="w-full h-auto brightness-110 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ===== WHAT OUR CLIENTS SAY (REAMPED GLOBAL) ===== */}
      <section className="py-32 bg-white border-b-8 border-navy relative overflow-hidden">
         <div className="absolute -top-20 -left-20 w-64 h-64 bg-info/5 rounded-full blur-3xl" />
         <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-yellow/5 rounded-full blur-3xl" />
         
         <div className="marketing-container relative z-10">
            <div className="text-center mb-24">
               <h2 className="font-heading font-black text-navy text-5xl md:text-7xl mb-6">Global Stories</h2>
               <p className="text-navy text-xl font-bold max-w-2xl mx-auto">See how students from around the world are excelling with Edvoura.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {[
                 {
                   quote: "Edvoura matched me with a specialist for my AP Calculus prep. The sessions are world-class, and the dashboard tools are better than anything I've seen in Canada.",
                   name: "Sarah Jenkins",
                   role: "High School Senior, Toronto",
                   location: "Canada",
                   img: "/images/client_canada.png",
                   color: "bg-error"
                 },
                 {
                   quote: "My daughter loves the Explorer Band. The stickers and games keep her engaged for hours while she masters Mandarin and English simultaneously.",
                   name: "Wei Zhang",
                   role: "Parent of Grade 2 Student",
                   location: "China",
                   img: "/images/client_china.png",
                   color: "bg-success"
                 },
                 {
                   quote: "We use the platform for weekend intensive sessions. The quality of tutors available at any time is incredible. High-performance learning at its best.",
                   name: "David Miller",
                   role: "Parent of 8th Grader",
                   location: "USA",
                   img: "/images/client_usa.png",
                   color: "bg-info"
                 }
               ].map((client, i) => (
                 <div key={client.name} className={`bg-white border-4 border-navy rounded-[2.5rem] p-10 shadow-[10px_10px_0px_#0A1628] hover:-translate-y-2 transition-all duration-300 relative ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                    <div className="absolute -top-8 -left-2 text-9xl text-navy opacity-5 font-serif select-none pointer-events-none">&ldquo;</div>
                    <div className="relative z-10">
                       <div className="flex gap-1 mb-8">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-yellow text-navy border-2 border-navy rounded-sm" />)}
                       </div>
                       <p className="text-navy text-lg font-bold italic mb-10 leading-relaxed">&ldquo;{client.quote}&rdquo;</p>
                       <div className="flex items-center gap-4 border-t-4 border-navy/10 pt-8">
                          <div className="w-16 h-16 rounded-2xl border-4 border-navy overflow-hidden bg-white shadow-[4px_4px_0px_#0A1628]">
                             <Image src={client.img} alt={client.name} width={64} height={64} className="object-cover h-full" />
                          </div>
                          <div>
                             <p className="font-heading font-black text-navy text-xl">{client.name}</p>
                             <p className="text-navy text-sm font-bold opacity-70">{client.role}</p>
                             <div className="flex items-center gap-1.5 mt-1">
                                <Globe className="w-3.5 h-3.5 text-navy opacity-50" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-navy bg-navy/5 px-2 py-0.5 rounded">{client.location}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ===== FEATURED BLOG (NEO-BRUTALIST) ===== */}
      <section className="bg-yellow py-32 border-b-8 border-navy relative overflow-hidden">
         <div className="marketing-container relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
               <div className="text-left">
                  <h2 className="font-heading font-black text-navy text-5xl md:text-7xl mb-6">Latest Insights</h2>
                  <p className="text-navy text-xl font-bold max-w-xl">Deep dives into the science of learning and the future of global education.</p>
               </div>
               <Link href="/blog" className="bg-white border-4 border-navy text-navy font-heading font-black px-8 py-4 rounded-xl shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#0A1628] transition-all inline-flex items-center gap-2">
                 Visit Blog <ArrowRight className="w-5 h-5" />
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {[
                 {
                   title: "How Online Tutoring is Transforming Education",
                   excerpt: "From remote villages to busy metropolises, digital education is the new frontier of equality.",
                   img: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop",
                   date: "Oct 10, 2026"
                 },
                 {
                   title: "The Neuro-Psychology of Learning Streaks",
                   excerpt: "Why the human brain craves gamified progress and how we're using it to boost retention by 40%.",
                   img: "https://images.unsplash.com/photo-1510172951991-856a654063f9?q=80&w=1974&auto=format&fit=crop",
                   date: "Oct 08, 2026"
                 }
               ].map((post, i) => (
                 <div key={post.title} className="group cursor-pointer">
                    <div className="relative aspect-[16/9] border-8 border-navy rounded-[2.5rem] overflow-hidden shadow-[15px_15px_0px_#0A1628] mb-8 bg-white transition-transform group-hover:-translate-y-2">
                       <Image src={post.img} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="inline-block bg-white border-4 border-navy text-navy text-xs font-black px-4 py-1.5 rounded-lg mb-4 shadow-[4px_4px_0px_#0A1628]">
                       {post.date}
                    </div>
                    <h3 className="font-heading font-black text-navy text-3xl group-hover:text-white transition-colors tracking-tight mb-4">{post.title}</h3>
                    <p className="text-navy font-bold text-lg mb-6 line-clamp-2 md:opacity-80 group-hover:opacity-100 transition-opacity">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-navy font-black text-lg underline decoration-4 underline-offset-8">
                       Read Article <ArrowRight className="w-5 h-5 group-hover:translate-x-4 transition-transform" />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ===== SOLID BRUTALIST CTA BANNER ===== */}
      <section className="bg-error relative py-24 md:py-32 overflow-hidden border-b-8 border-navy z-10">
        <div className="marketing-container relative z-10 max-w-4xl text-center">
          <h2 className="font-heading font-black text-white text-5xl md:text-7xl mb-8 tracking-tight drop-shadow-[6px_6px_0px_#0A1628] transform rotate-[-2deg]">
            READY TO JOIN THE ELITE?
          </h2>
          <Link
            href="/signup"
            className="inline-block bg-yellow text-navy font-heading font-black px-16 py-6 rounded-2xl border-4 border-navy shadow-[12px_12px_0px_#0A1628] hover:translate-x-2 hover:translate-y-2 hover:shadow-[4px_4px_0px_#0A1628] active:translate-x-3 active:translate-y-3 active:shadow-none transition-all text-2xl transform rotate-2 w-full sm:w-auto"
          >
            JOIN EDVOURA NOW
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
