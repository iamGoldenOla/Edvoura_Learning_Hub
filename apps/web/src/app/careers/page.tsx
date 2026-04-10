import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { ArrowRight, MapPin, Briefcase, Clock } from 'lucide-react';

// TODO: Replace with Supabase query → job_listings
const openPositions = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (Nigeria)',
    type: 'Full-time',
    desc: 'Build and scale the Edvoura student and tutor dashboards using Next.js, Tailwind, and Framer Motion.',
  },
  {
    title: 'Mathematics Tutor (WAEC/JAMB)',
    department: 'Education',
    location: 'Remote',
    type: 'Part-time',
    desc: 'Deliver live tutoring sessions to Grade 7-12 students preparing for national examinations.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (Nigeria)',
    type: 'Full-time',
    desc: 'Design intuitive, accessible interfaces for our multi-role K-12 learning platform.',
  },
  {
    title: 'Customer Success Manager',
    department: 'Operations',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    desc: 'Onboard parents and students, manage tutor relationships, and ensure platform satisfaction.',
  },
  {
    title: 'Content Creator (Education)',
    department: 'Content',
    location: 'Remote',
    type: 'Contract',
    desc: 'Create engaging, curriculum-aligned learning materials, quizzes, and educational content.',
  },
];

const perks = [
  'Remote-first culture',
  'Competitive salary in NGN',
  'Learning & development budget',
  'Flexible working hours',
  'Health insurance',
  'Equipment stipend',
  'Impact-driven mission',
  'Small, high-calibre team',
];

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy pt-[72px] relative overflow-hidden">
        <div className="hero-grid-overlay absolute inset-0 pointer-events-none" />
        <div className="absolute bottom-0 right-20 w-[400px] h-[400px] bg-yellow/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-4">Careers</p>
          <h1 className="font-heading font-extrabold text-white max-w-3xl mx-auto leading-tight" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}>
            Help Us Build the Future of Education
          </h1>
          <p className="mt-6 text-grey text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Join a mission-driven team that&apos;s making quality education accessible to every Nigerian child. We&apos;re looking for builders, educators, and dreamers.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-yellow py-12">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {perks.map((perk) => (
              <span key={perk} className="bg-navy/10 text-navy text-xs font-semibold px-4 py-2 rounded-full">
                {perk}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="bg-off-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">Open Positions</p>
            <h2 className="font-heading font-extrabold text-navy" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Current Openings
            </h2>
          </div>

          <div className="space-y-4">
            {openPositions.map((job) => (
              <div key={job.title} className="bg-white border border-grey-light rounded-2xl p-6 md:p-8 group hover:border-yellow hover:shadow-md transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-dim bg-yellow/10 px-3 py-1 rounded-full">{job.department}</span>
                    </div>
                    <h3 className="font-heading font-bold text-navy text-lg mb-2">{job.title}</h3>
                    <p className="text-grey text-sm mb-3">{job.desc}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-grey font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.type}</span>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="shrink-0 inline-flex items-center gap-2 bg-navy hover:bg-dark text-white font-heading font-bold px-6 py-3 rounded-xl transition-colors text-sm"
                  >
                    Apply <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-grey text-sm mb-4">Don&apos;t see your role? We&apos;re always open to hearing from exceptional people.</p>
            <Link href="/contact" className="text-yellow font-semibold text-sm hover:text-yellow-dim transition-colors inline-flex items-center gap-1">
              Send us your CV <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
