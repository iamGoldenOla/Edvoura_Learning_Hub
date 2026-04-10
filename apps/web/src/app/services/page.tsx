import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import {
  Video, Brain, ClipboardList, Users, BarChart, BookOpen, Shield, Headphones,
  ArrowRight, CheckCircle2, Monitor, Star
} from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy pt-[72px] relative overflow-hidden">
        <div className="hero-grid-overlay absolute inset-0 pointer-events-none" />
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-yellow/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-4">Our Services</p>
          <h1 className="font-heading font-extrabold text-white max-w-3xl mx-auto leading-tight" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}>
            A Complete Learning Ecosystem for Every Stakeholder
          </h1>
          <p className="mt-6 text-grey text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            From live tutoring to exam preparation, Edvoura brings everything under one roof — designed for students, parents, and educators.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 mt-10 bg-yellow hover:bg-yellow-light text-navy font-heading font-bold px-8 py-3.5 rounded-xl transition-colors">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Core Services */}
      <section className="bg-off-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">Core Services</p>
            <h2 className="font-heading font-extrabold text-navy" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              What We Offer
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                icon: Video, title: 'Live 1-on-1 & Group Tutoring', tag: 'Flagship',
                desc: 'Real-time tutoring sessions delivered via Google Meet. Students connect with qualified tutors for personalised instruction, screen sharing, interactive whiteboards, and recorded sessions they can revisit anytime.',
                features: ['Face-to-face video sessions', 'Screen sharing & whiteboard', 'Session recordings for review', 'Flexible scheduling'],
              },
              {
                icon: Brain, title: 'Interactive Learning Tools', tag: 'Engagement',
                desc: 'Keep students engaged with gamified quizzes, drag-and-drop activities, flashcards, and subject-specific learning games — all designed to make concepts stick through active participation.',
                features: ['Subject-specific quizzes', 'Drag-and-drop games', 'Flashcard decks', 'Streak & reward systems'],
              },
              {
                icon: ClipboardList, title: 'Assignment & Grading System', tag: 'Workflow',
                desc: 'Tutors create and distribute assignments with deadlines. Students submit work digitally. Tutors grade with feedback. Parents see everything — zero papers lost, zero excuses.',
                features: ['Digital submission', 'Tutor feedback & grading', 'Deadline tracking', 'Parent visibility'],
              },
              {
                icon: BookOpen, title: 'Exam Preparation (WAEC, JAMB, NECO)', tag: 'Results',
                desc: 'Dedicated exam prep modules with 15+ years of past questions, timed mock CBTs under real conditions, and AI-powered readiness predictions across all subjects.',
                features: ['15+ years past questions', 'Simulated CBT environment', 'Performance analytics', 'Subject-by-subject readiness'],
              },
              {
                icon: Users, title: 'Parent Dashboard & Monitoring', tag: 'Transparency',
                desc: 'Parents get real-time visibility into their child\'s sessions, attendance, scores, and tutor communications — all from a single, clean dashboard.',
                features: ['Live session monitoring', 'Attendance tracking', 'Score reports', 'Direct tutor messaging'],
              },
              {
                icon: BarChart, title: 'Performance Analytics', tag: 'Insight',
                desc: 'Comprehensive analytics for students, parents, and tutors. Track score trends, identify weak areas, monitor attendance patterns, and measure growth over time.',
                features: ['Score trend charts', 'Subject comparison', 'Weak area identification', 'Downloadable reports'],
              },
            ].map((service, i) => (
              <div key={service.title} className={`bg-white border border-grey-light rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="md:w-2/3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-yellow" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-dim bg-yellow/10 px-3 py-1 rounded-full">{service.tag}</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-navy text-xl mb-3">{service.title}</h3>
                  <p className="text-grey text-sm leading-relaxed mb-6">{service.desc}</p>
                  <ul className="grid grid-cols-2 gap-3">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-navy">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:w-1/3 bg-off-white border border-grey-light rounded-2xl h-48 md:h-full min-h-[200px] flex items-center justify-center">
                  <service.icon className="w-16 h-16 text-grey-light" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-navy py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">Built For</p>
            <h2 className="font-heading font-extrabold text-white" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Three Roles. One Platform.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, role: 'Students', desc: 'Live sessions, quizzes, games, assignments, exam prep — everything you need to succeed, in one place.', color: 'bg-blue-500' },
              { icon: Users, role: 'Parents', desc: 'Full visibility into your child\'s learning. Monitor sessions, track progress, communicate with tutors.', color: 'bg-green-500' },
              { icon: Monitor, role: 'Tutors', desc: 'Create content, manage students, track earnings, and grow your teaching career — all from your dashboard.', color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.role} className="bg-navy-mid border border-navy-light rounded-2xl p-8 text-center group hover:border-yellow transition-all duration-300">
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading font-bold text-white text-lg mb-3">{item.role}</h3>
                <p className="text-grey text-sm leading-relaxed mb-6">{item.desc}</p>
                <Link href="/signup" className="text-yellow text-sm font-semibold hover:text-yellow-light transition-colors inline-flex items-center gap-1">
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-yellow py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-heading font-extrabold text-navy text-2xl md:text-3xl mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-navy/70 text-sm mb-8">Join hundreds of Nigerian families already thriving on Edvoura.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-navy hover:bg-dark text-white font-heading font-bold px-10 py-4 rounded-xl transition-colors">
            Start Learning Today <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
