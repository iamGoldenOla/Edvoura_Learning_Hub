import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import CrystalMirrorHero from '@/components/marketing/CrystalMirrorHero';
import Link from 'next/link';
import Image from 'next/image';
import {
  Video, Brain, ClipboardList, Users, BarChart, BookOpen, BookOpenText, Shield, Headphones,
  ArrowRight, CheckCircle2, Monitor, Star
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'K-12 Online Tutoring Services & Exam Preparation',
  description:
    'Comprehensive tutoring services for primary and secondary students: live 1-on-1 sessions, WAEC/JAMB exam prep, interactive whiteboard classrooms, and open storybooks.',
  openGraph: {
    title: 'K-12 Online Tutoring Services & Exam Preparation | Edvoura Learning Hub',
    description:
      'Live 1-on-1 tutoring, WAEC/JAMB exam prep, interactive whiteboard classrooms, and open storybooks for Grades 1–12.',
  },
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Crystal Mirror Hero Section (Experiment) */}
      <CrystalMirrorHero />

      {/* Core Services */}
      <section className="bg-white py-24 md:py-32 border-b-8 border-navy">
        <div className="marketing-container">
          <div className="text-center mb-24">
            <div className="inline-block max-w-full bg-info border-4 border-navy text-white font-heading font-black px-4 sm:px-8 py-3 rounded-2xl mb-8 shadow-[6px_6px_0px_#0A1628] transform -rotate-1">
              <h2 className="text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight break-words">Core Offerings</h2>
            </div>
          </div>

          <div className="space-y-20">
            {[
              {
                icon: Video, title: 'Live 1-on-1 & Group Tutoring', tag: 'Flagship',
                desc: 'Real-time tutoring sessions delivered via Google Meet. Students connect with qualified tutors for personalised instruction, screen sharing, interactive whiteboards, and recorded sessions they can revisit anytime.',
                features: ['Face-to-face video sessions', 'Screen sharing & whiteboard', 'Session recordings for review', 'Flexible scheduling'],
                image: '/images/tutor_session.png',
                color: 'bg-yellow'
              },
              {
                icon: Brain, title: 'Interactive Learning Tools', tag: 'Engagement',
                desc: 'Keep students engaged with gamified quizzes, drag-and-drop activities, flashcards, and subject-specific learning games — all designed to make concepts stick through active participation.',
                features: ['Subject-specific quizzes', 'Drag-and-drop games', 'Flashcard decks', 'Streak & reward systems'],
                image: '/images/hero_student.png',
                color: 'bg-success'
              },
            ].map((service, i) => (
              <div key={service.title} className={`bg-off-white border-4 border-navy shadow-[15px_15px_0px_#0A1628] rounded-[2.5rem] p-8 md:p-14 flex flex-col lg:flex-row gap-12 items-center hover:-translate-y-2 transition-all duration-300 ${i % 2 === 1 ? 'lg:flex-row-reverse transform rotate-1' : 'transform -rotate-1'}`}>
                <div className="lg:w-1/2">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-20 h-20 ${service.color} border-4 border-navy rounded-[1.5rem] flex items-center justify-center shadow-[6px_6px_0px_#0A1628] transform rotate-[-5deg]`}>
                      <service.icon className="w-10 h-10 text-navy" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-navy bg-white border-4 border-navy px-4 py-2 rounded-xl shadow-[4px_4px_0px_#0A1628] rotate-2">{service.tag}</span>
                  </div>
                  <h3 className="font-heading font-black text-navy text-3xl sm:text-4xl mb-6 break-words">{service.title}</h3>
                  <p className="text-navy font-bold text-base sm:text-xl leading-relaxed mb-8">{service.desc}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 sm:gap-4 text-base sm:text-lg font-bold text-navy">
                        <div className="w-8 h-8 rounded-lg bg-white border-2 border-navy flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#0A1628] mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:w-1/2 w-full relative perspective-[1500px]">
                  <div className="relative rounded-[2rem] overflow-hidden shadow-[12px_12px_0px_#0A1628] border-8 border-navy bg-navy transform rotate-y-[5deg] group-hover:rotate-y-0 transition-transform duration-500">
                    <Image src={service.image} alt={service.title} width={800} height={600} className="w-full h-auto object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grid of smaller services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
             {[
              {
                icon: ClipboardList, title: 'Assignments',
                desc: 'Tutors create and distribute assignments. Students submit work digitally. Parents see everything.',
                color: 'bg-error'
              },
              {
                icon: BookOpenText, title: 'Exam Preparation',
                desc: 'Dedicated exam prep modules with 15+ years of past questions and timed mock CBTs.',
                color: 'bg-info'
              },
              {
                icon: Users, title: 'Parent Portal',
                desc: 'Real-time visibility into your child\'s sessions, attendance, scores, and tutor communications.',
                color: 'bg-yellow'
              },
              {
                icon: BarChart, title: 'Performance Analytics',
                desc: 'Track score trends, identify weak areas, and monitor attendance patterns over time.',
                color: 'bg-success'
              },
            ].map((service, i) => (
              <div key={service.title} className={`bg-white border-4 border-navy shadow-[10px_10px_0px_#0A1628] rounded-[2rem] p-8 hover:-translate-y-2 hover:shadow-[6px_6px_0px_#0A1628] transition-all duration-300 ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                <div className={`w-16 h-16 ${service.color} border-4 border-navy rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#0A1628] -rotate-3`}>
                  <service.icon className={`w-8 h-8 ${service.color === 'bg-yellow' ? 'text-navy' : 'text-white'}`} />
                </div>
                <h3 className="font-heading font-black text-navy text-xl sm:text-2xl mb-4 break-words">{service.title}</h3>
                <p className="text-navy font-bold text-base sm:text-lg leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Segmentation */}
      <section className="bg-navy py-24 md:py-32 relative border-b-8 border-navy">
        <div className="marketing-container">
          <div className="text-center mb-20">
            <h2 className="font-heading font-black text-white text-3xl sm:text-5xl md:text-6xl mb-6 drop-shadow-[3px_3px_0px_#F5C518] sm:drop-shadow-[4px_4px_0px_#F5C518] transform rotate-[-1deg] break-words">
              Three Roles. One Platform.
            </h2>
            <p className="bg-white/10 backdrop-blur-md border-4 border-white inline-block text-white font-bold text-base sm:text-xl px-4 sm:px-6 py-3 rounded-xl shadow-[4px_4px_0px_#F5C518] sm:shadow-[6px_6px_0px_#F5C518] transform rotate-1">
              Customized environments for everyone involved.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, role: 'Students', desc: 'Live sessions, gamified quizzes, assignments, exam prep - everything you need to succeed.', color: 'bg-info' },
              { icon: Shield, role: 'Parents', desc: 'Full visibility. Monitor sessions, track progress, and communicate seamlessly.', color: 'bg-success' },
              { icon: Monitor, role: 'Tutors', desc: 'Create content, manage your roster, track earnings, and grow your career.', color: 'bg-yellow' },
            ].map((item, i) => (
              <div key={item.role} className={`bg-off-white border-4 border-navy shadow-[10px_10px_0px_#F5C518] rounded-[2rem] p-10 text-center hover:-translate-y-2 hover:bg-white transition-all duration-300 ${i === 1 ? '-translate-y-4' : ''}`}>
                <div className={`w-24 h-24 ${item.color} border-4 border-navy rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_#0A1628] rotate-6`}>
                  <item.icon className={`w-10 h-10 ${item.color === 'bg-yellow' ? 'text-navy' : 'text-white'}`} />
                </div>
                <h3 className="font-heading font-black text-navy text-2xl sm:text-3xl mb-4">{item.role}</h3>
                <p className="text-navy font-bold text-base sm:text-lg leading-relaxed mb-8">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solid Brutalist CTA */}
      <section className="bg-error relative py-24 md:py-32 border-b-8 border-navy z-10">
         <div className="absolute w-full h-[200%] top-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="marketing-container relative z-10 max-w-4xl text-center">
          <h2 className="font-heading font-black text-white text-3xl sm:text-5xl md:text-7xl mb-12 tracking-tight drop-shadow-[4px_4px_0px_#0A1628] sm:drop-shadow-[6px_6px_0px_#0A1628] transform rotate-2 break-words">
            EXPERIENCE THE DIFFERENCE
          </h2>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-3 bg-yellow text-navy font-heading font-black px-6 sm:px-12 py-4 sm:py-6 rounded-2xl border-4 border-navy shadow-[8px_8px_0px_#0A1628] sm:shadow-[12px_12px_0px_#0A1628] hover:translate-x-2 hover:translate-y-2 hover:shadow-[4px_4px_0px_#0A1628] active:translate-x-3 active:translate-y-3 active:shadow-none transition-all text-base sm:text-2xl transform -rotate-1 w-full sm:w-auto"
          >
            START LEARNING TODAY <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
