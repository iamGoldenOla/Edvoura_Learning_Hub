import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { Target, Heart, Globe, Shield, Users, BookOpen, Award, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Hero */}
      <section 
        className="relative overflow-hidden border-b-8 border-navy z-10 bg-cover bg-center pb-16 pt-[104px] sm:pb-20 sm:pt-[120px] md:pb-28 md:pt-[150px]"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-yellow/90 backdrop-blur-sm" />
        
        <div className="marketing-container relative z-10 py-6 text-center md:py-10">
          <div className="inline-block bg-white border-4 border-navy text-navy font-heading font-black px-5 py-2 rounded-xl mb-8 shadow-[4px_4px_0px_#0A1628] rotate-2 transition-transform hover:rotate-0">
            OUR STORY
          </div>
          <h1 className="font-heading font-black text-navy max-w-4xl mx-auto leading-[1.1] mb-8 drop-shadow-[4px_4px_0px_#FFFFFF]" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
            Building the Future of Education in Nigeria
          </h1>
          <p className="text-navy text-xl max-w-3xl mx-auto font-bold bg-white/60 backdrop-blur-md p-6 rounded-2xl border-4 border-navy shadow-[6px_6px_0px_#0A1628] transform -rotate-1">
            Edvoura was founded with a single belief: every Nigerian child deserves access to world-class tutoring — regardless of location, income, or background.
          </p>
        </div>

        {/* Hero Image */}
        <div className="marketing-container relative z-10 mt-10 max-w-5xl perspective-[2000px]">
          <div className="relative rounded-[2rem] overflow-hidden border-8 border-navy shadow-[20px_20px_0px_#0A1628] transform rotate-x-[5deg] rotate-y-[-5deg] hover:rotate-x-0 hover:rotate-y-0 transition-all duration-700 bg-white">
            <Image
              src="/images/hero_student.png"
              alt="Student using Edvoura"
              width={1200}
              height={600}
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-24 md:py-32 relative border-b-8 border-navy">
        <div className="marketing-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            <div className="bg-white border-4 border-navy shadow-[12px_12px_0px_#0A1628] rounded-[2rem] p-10 md:p-14 hover:-translate-y-2 hover:shadow-[8px_8px_0px_#0A1628] transition-all duration-300 transform -rotate-1">
              <div className="w-20 h-20 bg-yellow border-4 border-navy rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_0px_#0A1628] rotate-3">
                <Target className="w-10 h-10 text-navy" />
              </div>
              <h2 className="font-heading font-black text-navy text-4xl mb-6">Our Mission</h2>
              <p className="text-navy text-lg leading-relaxed font-bold">
                To democratise quality education across Nigeria by connecting K-12 students with expert, vetted tutors through an interactive, technology-driven learning platform that empowers students, supports parents, and enables educators.
              </p>
            </div>
            
            <div className="bg-navy border-4 border-navy shadow-[12px_12px_0px_#F5C518] rounded-[2rem] p-10 md:p-14 hover:-translate-y-2 hover:shadow-[8px_8px_0px_#F5C518] transition-all duration-300 transform rotate-1">
              <div className="w-20 h-20 bg-white border-4 border-navy rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_0px_#0A1628] -rotate-3">
                <Globe className="w-10 h-10 text-navy" />
              </div>
              <h2 className="font-heading font-black text-white text-4xl mb-6 drop-shadow-[2px_2px_0px_#0A1628]">Our Vision</h2>
              <p className="text-white text-lg leading-relaxed font-bold">
                To become Africa&apos;s most trusted K-12 online learning platform — where every child has a personal learning path, every parent has full visibility, and every tutor has the tools to change lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-off-white py-24 md:py-32 relative border-b-8 border-navy">
        <div className="marketing-container relative">
          <div className="text-center mb-20 bg-info border-4 border-navy p-8 rounded-[2rem] shadow-[10px_10px_0px_#0A1628] inline-block mx-auto transform -rotate-2">
            <h2 className="font-heading font-black text-white" style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)' }}>
              What Drives Us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: 'Student First', desc: 'Every decision we make begins and ends with the learner\'s success.', color: 'bg-error' },
              { icon: Shield, title: 'Trust & Safety', desc: 'Vetted tutors, secure sessions, and full transparency for parents.', color: 'bg-success' },
              { icon: Award, title: 'Excellence', desc: 'We hold ourselves to the same standard we expect of our students.', color: 'bg-yellow' },
              { icon: Users, title: 'Community', desc: 'Learning is social. We build connections, not just content.', color: 'bg-info' },
            ].map((v, i) => (
              <div key={v.title} className="bg-white border-4 border-navy rounded-[2rem] p-8 text-center hover:-translate-y-2 hover:shadow-[6px_6px_0px_#0A1628] shadow-[10px_10px_0px_#0A1628] transition-all duration-300">
                <div className={`w-20 h-20 ${v.color} border-4 border-navy rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#0A1628] ${i % 2 === 0 ? 'rotate-6' : '-rotate-6'}`}>
                  <v.icon className={`w-10 h-10 ${v.color === 'bg-yellow' ? 'text-navy' : 'text-white'}`} />
                </div>
                <h3 className="font-heading font-black text-navy text-2xl mb-4">{v.title}</h3>
                <p className="text-navy font-bold text-base leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-24 md:py-32 border-b-8 border-navy">
        <div className="marketing-container">
          <div className="text-center mb-20">
            <h2 className="font-heading font-black text-navy" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              The Team Behind Edvoura
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            {[
              { name: 'Akinola Olujobi', role: 'Founder & CEO', initial: 'A', color: 'bg-navy', tilt: 'rotate-3' },
              { name: 'Dr. Folashade Oni', role: 'Head of Curriculum', initial: 'F', color: 'bg-yellow', tilt: '-rotate-2' },
              { name: 'Emeka Nwosu', role: 'CTO', initial: 'E', color: 'bg-info', tilt: 'rotate-6' },
            ].map((member) => (
              <div key={member.name} className="text-center group">
                <div className={`w-40 h-40 ${member.color} border-4 border-navy rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-white text-6xl font-heading font-black group-hover:scale-105 shadow-[10px_10px_0px_#0A1628] transition-all duration-300 ${member.tilt} group-hover:rotate-0`}>
                  <span className={member.color === 'bg-yellow' ? 'text-navy' : 'text-white'}>{member.initial}</span>
                </div>
                <h3 className="font-heading font-black text-navy text-3xl mb-1">{member.name}</h3>
                <p className="text-navy font-bold text-lg">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brutalist CTA */}
      <section className="bg-success relative py-24 md:py-32 overflow-hidden border-b-8 border-navy z-10">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:150px_150px]" />
        <div className="marketing-container relative z-10 max-w-4xl text-center">
          <h2 className="font-heading font-black text-white text-5xl md:text-7xl mb-8 tracking-tight drop-shadow-[6px_6px_0px_#0A1628] transform rotate-[-2deg]">
            WANT TO JOIN THE TEAM?
          </h2>
          <Link
            href="/careers"
            className="inline-flex items-center justify-center gap-2 bg-yellow text-navy font-heading font-black px-12 py-6 rounded-2xl border-4 border-navy shadow-[12px_12px_0px_#0A1628] hover:translate-x-2 hover:translate-y-2 hover:shadow-[4px_4px_0px_#0A1628] active:translate-x-3 active:translate-y-3 active:shadow-none transition-all text-2xl transform rotate-2 w-full sm:w-auto"
          >
            VIEW OPENINGS <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
