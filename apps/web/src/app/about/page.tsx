import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { Target, Heart, Globe, Shield, Users, BookOpen, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy pt-[72px] relative overflow-hidden">
        <div className="hero-grid-overlay absolute inset-0 pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-[400px] h-[400px] bg-yellow/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-4">About Us</p>
          <h1 className="font-heading font-extrabold text-white max-w-3xl mx-auto leading-tight" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}>
            Building the Future of Education in Nigeria
          </h1>
          <p className="mt-6 text-grey text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Edvoura was founded with a single belief: every Nigerian child deserves access to world-class tutoring — regardless of location, income, or background.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-off-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-grey-light rounded-2xl p-10">
              <div className="w-14 h-14 bg-yellow/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-yellow" />
              </div>
              <h2 className="font-heading font-extrabold text-navy text-2xl mb-4">Our Mission</h2>
              <p className="text-grey text-sm leading-relaxed">
                To democratise quality education across Nigeria by connecting K-12 students with expert, vetted tutors through an interactive, technology-driven learning platform that empowers students, supports parents, and enables educators.
              </p>
            </div>
            <div className="bg-white border border-grey-light rounded-2xl p-10">
              <div className="w-14 h-14 bg-yellow/10 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-yellow" />
              </div>
              <h2 className="font-heading font-extrabold text-navy text-2xl mb-4">Our Vision</h2>
              <p className="text-grey text-sm leading-relaxed">
                To become Africa&apos;s most trusted K-12 online learning platform — where every child has a personal learning path, every parent has full visibility, and every tutor has the tools to change lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-navy py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">Our Values</p>
            <h2 className="font-heading font-extrabold text-white" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              What Drives Everything We Do
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: 'Student First', desc: 'Every decision we make begins and ends with the learner\'s success.' },
              { icon: Shield, title: 'Trust & Safety', desc: 'Vetted tutors, secure sessions, and full transparency for parents.' },
              { icon: Award, title: 'Excellence', desc: 'We hold ourselves to the same standard we expect of our students.' },
              { icon: Users, title: 'Community', desc: 'Learning is social. We build connections, not just content.' },
            ].map((v) => (
              <div key={v.title} className="bg-navy-mid border border-navy-light rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-yellow/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-6 h-6 text-yellow" />
                </div>
                <h3 className="font-heading font-bold text-white text-base mb-3">{v.title}</h3>
                <p className="text-grey text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-yellow py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Active Students' },
              { value: '50+', label: 'Expert Tutors' },
              { value: '20+', label: 'Subjects Covered' },
              { value: '10,000+', label: 'Sessions Delivered' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-heading font-extrabold text-navy">{s.value}</p>
                <p className="text-sm text-navy/70 font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">Leadership</p>
            <h2 className="font-heading font-extrabold text-navy" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Meet the Team Behind Edvoura
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* TODO: Replace with Supabase query → team_members */}
            {[
              { name: 'Akinola Olujobi', role: 'Founder & CEO', initial: 'A', color: 'bg-blue-500' },
              { name: 'Dr. Folashade Oni', role: 'Head of Curriculum', initial: 'F', color: 'bg-purple-500' },
              { name: 'Emeka Nwosu', role: 'CTO', initial: 'E', color: 'bg-green-500' },
            ].map((member) => (
              <div key={member.name} className="text-center group">
                <div className={`w-24 h-24 ${member.color} rounded-full flex items-center justify-center mx-auto mb-5 text-white text-3xl font-heading font-extrabold group-hover:scale-105 transition-transform`}>
                  {member.initial}
                </div>
                <h3 className="font-heading font-bold text-navy text-lg">{member.name}</h3>
                <p className="text-grey text-sm mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-heading font-extrabold text-white text-2xl md:text-3xl mb-4">
            Want to Be Part of the Story?
          </h2>
          <p className="text-grey text-sm mb-8">We&apos;re always looking for passionate educators and builders to join our team.</p>
          <Link href="/careers" className="inline-flex items-center gap-2 bg-yellow hover:bg-yellow-light text-navy font-heading font-bold px-8 py-3.5 rounded-xl transition-colors">
            View Open Positions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
