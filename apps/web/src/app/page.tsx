import Link from 'next/link';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import {
  Video, Brain, ClipboardList, Users, Star, ArrowRight, Play,
  CheckCircle2, UserPlus, Search, BookOpen, ChevronRight,
  Calculator, Microscope, BookOpenText, Globe, Monitor, Palette, Languages, Ruler
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-navy pt-[72px] overflow-hidden">
        <div className="hero-grid-overlay absolute inset-0 pointer-events-none" />
        {/* Yellow glow */}
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-yellow/12 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-yellow/10 border border-yellow/20 text-yellow text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
                <Star className="w-3.5 h-3.5 fill-yellow" />
                Nigeria&apos;s Premier Online Tutoring Hub
              </div>

              <h1 className="font-heading font-extrabold text-white leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
                Unlock Your Child&apos;s{' '}
                <span className="yellow-underline">Full Potential</span>
                {' '}— Online
              </h1>

              <p className="mt-6 text-grey text-base md:text-lg leading-relaxed max-w-xl">
                Expert tutors. Live sessions via Google Meet. Interactive learning tools. Edvoura connects K-12 students with qualified teachers — anywhere, anytime.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-yellow hover:bg-yellow-light text-navy font-heading font-bold px-8 py-3.5 rounded-xl transition-colors text-base"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 border border-navy-light text-white hover:border-yellow/40 hover:text-yellow font-medium px-8 py-3.5 rounded-xl transition-colors text-base">
                  <Play className="w-4 h-4 fill-current" /> Watch Demo
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-navy-light/40">
                {[
                  { value: '500+', label: 'Students' },
                  { value: '50+', label: 'Expert Tutors' },
                  { value: '20+', label: 'Subjects' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl md:text-3xl font-heading font-extrabold text-yellow">{stat.value}</p>
                    <p className="text-xs uppercase tracking-widest text-grey font-semibold mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column — Floating UI Card */}
            <div className="hidden lg:block relative">
              {/* Main Card */}
              <div className="bg-navy-mid border border-navy-light rounded-2xl p-6 shadow-2xl relative z-10">
                <div className="h-1 w-full bg-yellow rounded-full mb-6" />
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-navy-light rounded-full flex items-center justify-center text-yellow">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-heading font-bold">Dr. Adebayo Okonkwo</p>
                    <p className="text-grey text-sm">Senior Mathematics Tutor</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 bg-success/15 text-success text-xs font-bold px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-success rounded-full animate-pulse-live" />
                    LIVE
                  </div>
                </div>

                <div className="bg-yellow/10 text-yellow text-xs font-semibold px-3 py-1 rounded-full inline-flex mb-4">
                  Mathematics • Grade 7
                </div>

                <p className="text-white font-heading font-bold text-lg mb-4">Introduction to Algebraic Expressions</p>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-grey font-medium">Session Progress</span>
                    <span className="text-yellow font-bold">65%</span>
                  </div>
                  <div className="w-full h-2 bg-navy-light rounded-full overflow-hidden">
                    <div className="h-full bg-yellow rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                {/* Student Avatars */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'].map((bg, i) => (
                      <div key={i} className={`w-7 h-7 ${bg} rounded-full border-2 border-navy-mid text-white text-[10px] font-bold flex items-center justify-center`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-grey">12 students joined</p>
                </div>
              </div>

              {/* Floating Card 1 — Top Right */}
              <div className="absolute -top-4 -right-4 bg-navy-mid border border-navy-light rounded-xl p-4 shadow-xl animate-float z-20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-yellow/15 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow fill-yellow" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Top Performer</p>
                    <p className="text-grey text-xs">Award unlocked!</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 — Bottom Left */}
              <div className="absolute -bottom-4 -left-6 bg-navy-mid border border-navy-light rounded-xl p-4 shadow-xl animate-float-delayed z-20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-info/15 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-info" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Next Session</p>
                    <p className="text-grey text-xs">Today, 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-off-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">How It Works</p>
            <h2 className="font-heading font-extrabold text-navy" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Start Learning in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: UserPlus,
                title: 'Create Your Account',
                desc: 'Sign up as a student, parent, or tutor in under 2 minutes. It\'s completely free to get started.',
              },
              {
                step: '02',
                icon: Search,
                title: 'Match With a Tutor',
                desc: 'We connect you with a qualified, vetted tutor that fits your child\'s learning goals and schedule.',
              },
              {
                step: '03',
                icon: BookOpen,
                title: 'Start Learning',
                desc: 'Join live sessions via Google Meet, complete assignments, take quizzes, and track progress in real time.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white border border-grey-light rounded-2xl p-8 group hover:border-yellow hover:shadow-lg transition-all duration-300"
              >
                <span className="absolute top-6 right-6 text-6xl font-heading font-extrabold text-navy/[0.06] leading-none select-none">{item.step}</span>
                <div className="w-14 h-14 bg-navy rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow transition-colors duration-300">
                  <item.icon className="w-6 h-6 text-white group-hover:text-navy transition-colors duration-300" />
                </div>
                <h3 className="font-heading font-bold text-navy text-lg mb-3">{item.title}</h3>
                <p className="text-grey text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="bg-navy py-20 md:py-28 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">Platform Features</p>
            <h2 className="font-heading font-extrabold text-white" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Everything Your Child Needs to Excel
            </h2>
            <p className="mt-4 text-grey max-w-2xl mx-auto text-sm md:text-base">
              A unified ecosystem designed for students, parents, and tutors — with tools that make learning efficient, engaging, and measurable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Video, title: 'Live Sessions via Google Meet', desc: 'Real-time, face-to-face instruction with screen sharing, breakout rooms, and session recording.', tag: 'Real-time' },
              { icon: Brain, title: 'Interactive Quizzes & Games', desc: 'Subject-specific quizzes, drag-and-drop games, and timed mock exams that make learning stick.', tag: 'Engagement' },
              { icon: ClipboardList, title: 'Assignments & Grading', desc: 'Tutors create, distribute, and grade assignments. Students submit work. Parents track progress.', tag: 'Workflow' },
              { icon: Users, title: 'Parent Dashboard', desc: 'Real-time visibility into your child\'s attendance, scores, session schedule, and tutor communications.', tag: 'Transparency' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-navy-mid border border-navy-light rounded-2xl p-8 group hover:border-t-yellow hover:border-t-2 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-yellow/10 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-yellow" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-dim bg-yellow/10 px-3 py-1 rounded-full">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-white text-lg mb-3">{feature.title}</h3>
                <p className="text-grey text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUBJECTS ===== */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">Subjects</p>
            <h2 className="font-heading font-extrabold text-navy" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Comprehensive K-12 Curriculum Coverage
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Calculator, name: 'Mathematics', tutors: '14 Tutors' },
              { icon: Microscope, name: 'Sciences', tutors: '12 Tutors' },
              { icon: BookOpenText, name: 'English', tutors: '10 Tutors' },
              { icon: Globe, name: 'Social Studies', tutors: '8 Tutors' },
              { icon: Monitor, name: 'Computer Science', tutors: '6 Tutors' },
              { icon: Palette, name: 'Creative Arts', tutors: '5 Tutors' },
              { icon: Languages, name: 'Languages', tutors: '7 Tutors' },
              { icon: Ruler, name: 'Further Maths', tutors: '4 Tutors' },
            ].map((subject) => (
              <div
                key={subject.name}
                className="bg-off-white border border-grey-light rounded-2xl p-6 text-center group hover:border-yellow hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 mx-auto bg-white border border-grey-light rounded-xl flex items-center justify-center mb-4 group-hover:border-yellow group-hover:bg-yellow/5 transition-all">
                  <subject.icon className="w-7 h-7 text-navy group-hover:text-yellow transition-colors" />
                </div>
                <h3 className="font-heading font-bold text-navy text-sm mb-1">{subject.name}</h3>
                <p className="text-xs text-grey">{subject.tutors}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-navy py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">Testimonials</p>
            <h2 className="font-heading font-extrabold text-white" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Trusted by Families Across Nigeria
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: 'My son went from struggling with fractions to topping his class in Mathematics. The tutors are incredibly patient and the live sessions feel like private school quality.',
                name: 'Mrs. Folashade Adeyemi',
                role: 'Parent of JSS3 Student',
                color: 'bg-blue-500',
              },
              {
                quote: 'I love the quizzes and the streaks system. It makes me want to study every day. My WAEC preparation feels so much less scary now that I can see my progress.',
                name: 'Chukwuemeka Obi',
                role: 'SS2 Student',
                color: 'bg-green-500',
              },
              {
                quote: 'As a tutor, the platform handles all the admin work — scheduling, grading, payments. I can focus entirely on teaching, which is what I love to do.',
                name: 'Dr. Amina Ibrahim',
                role: 'Mathematics & Physics Tutor',
                color: 'bg-purple-500',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-navy-mid border border-navy-light rounded-2xl p-8">
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-yellow fill-yellow" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed italic mb-8">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{testimonial.name}</p>
                    <p className="text-grey text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">Pricing</p>
            <h2 className="font-heading font-extrabold text-navy" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Plans That Grow With Your Child
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {[
              {
                name: 'Starter',
                price: '₦15,000',
                period: '/month',
                desc: 'Perfect for trying out live tutoring.',
                features: ['4 live sessions/month', '1 subject', 'Basic progress reports', 'Email support'],
                cta: 'Get Started',
                popular: false,
              },
              {
                name: 'Growth',
                price: '₦35,000',
                period: '/month',
                desc: 'Most popular for serious learners.',
                features: ['12 live sessions/month', '3 subjects', 'Full progress analytics', 'Quiz & assignment access', 'Priority support', 'Session recordings'],
                cta: 'Get Started',
                popular: true,
              },
              {
                name: 'Premium',
                price: '₦65,000',
                period: '/month',
                desc: 'The complete Edvoura experience.',
                features: ['Unlimited sessions', 'All subjects', 'Exam prep (WAEC/JAMB)', 'Dedicated tutor', 'Parent dashboard', '24/7 priority support', 'Certificates'],
                cta: 'Get Started',
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border relative ${
                  plan.popular
                    ? 'bg-navy text-white border-yellow scale-[1.03] shadow-xl'
                    : 'bg-white border-grey-light'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow text-navy text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-navy" /> Most Popular
                  </div>
                )}
                <h3 className={`font-heading font-bold text-lg mb-2 ${plan.popular ? 'text-white' : 'text-navy'}`}>{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-grey' : 'text-grey'}`}>{plan.desc}</p>
                <div className="mb-8">
                  <span className={`text-4xl font-heading font-extrabold ${plan.popular ? 'text-yellow' : 'text-navy'}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? 'text-grey' : 'text-grey'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-yellow' : 'text-success'}`} />
                      <span className={plan.popular ? 'text-white/80' : 'text-grey'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center font-heading font-bold py-3 rounded-xl transition-colors text-sm ${
                    plan.popular
                      ? 'bg-yellow text-navy hover:bg-yellow-light'
                      : 'border border-grey-light text-navy hover:border-yellow hover:text-yellow'
                  }`}
                >
                  {plan.cta} <ChevronRight className="w-4 h-4 inline" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="bg-yellow py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-heading font-extrabold text-navy" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
            Ready to Transform Your Child&apos;s Education?
          </h2>
          <p className="mt-4 text-navy/70 text-base">
            Join hundreds of Nigerian families who are already seeing real results with Edvoura.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 mt-8 bg-navy hover:bg-dark text-white font-heading font-bold px-10 py-4 rounded-xl transition-colors text-base"
          >
            Start Learning Today <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
