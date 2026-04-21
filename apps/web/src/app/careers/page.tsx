import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { ArrowRight, MapPin, Briefcase, Clock, FileText, CheckCircle2, Star, UserCheck, ShieldCheck, PenTool, Sparkles, Send, Upload } from 'lucide-react';
import Image from 'next/image';
import { siteContact } from '@/lib/site';

// TODO: Replace with Supabase query → job_listings
const openPositions = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote Global',
    type: 'Full-time',
    salary: '$80k - $120k',
    desc: 'Build and scale the Edvoura student and tutor dashboards using Next.js, Tailwind, and Supabase.',
    color: 'bg-info',
    tilt: 'rotate-1'
  },
  {
    title: 'Senior Mathematics Tutor',
    department: 'Education',
    location: 'Remote',
    type: 'Part-time',
    salary: '$30 - $45 /hr',
    desc: 'Deliver live high-impact tutoring for SAT, AP, and WAEC students. Help them ace their dream schools.',
    color: 'bg-yellow',
    tilt: '-rotate-1'
  },
  {
    title: 'Full-Stack Developer (Go/Node)',
    department: 'Engineering',
    location: 'Remote Global',
    type: 'Full-time',
    salary: '$90k - $130k',
    desc: 'Design robust real-time communication protocols for our live session infrastructure.',
    color: 'bg-success',
    tilt: 'rotate-2'
  },
  {
    title: 'Curriculum Architect',
    department: 'Content',
    location: 'Remote',
    type: 'Contract',
    salary: 'Negotiable',
    desc: 'Standardize learning materials across international standards (UK, US, NI).',
    color: 'bg-error',
    tilt: '-rotate-2'
  },
];

const processSteps = [
  { icon: FileText, title: 'Submit CV', desc: 'Apply with your credentials and past teaching experience.' },
  { icon: PenTool, title: 'Academic Test', desc: 'Pass our subject-matter expertise verification test.' },
  { icon: UserCheck, title: 'Demo Session', desc: 'Show us your teaching style in a live 15-min mock class.' },
  { icon: ShieldCheck, title: 'Onboarding', desc: 'Get verified and start matching with global learners.' },
];

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Hero (Parallax) */}
      <section 
        className="relative pt-[140px] pb-32 md:pt-[180px] md:pb-40 overflow-hidden bg-fixed bg-cover bg-center border-b-8 border-navy z-10"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1510172951991-856a654063f9?q=80&w=1974&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-navy/85 backdrop-blur-sm" />
        
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 text-center pt-10 z-10">
          <div className="inline-block bg-white border-4 border-navy text-navy font-heading font-black px-6 py-2 rounded-xl mb-8 shadow-[4px_4px_0px_#0A1628] rotate-2 transition-transform hover:rotate-0">
             JOIN THE HUB
          </div>
          <h1 className="font-heading font-black text-white max-w-4xl mx-auto leading-[1.1] mb-8 drop-shadow-[4px_4px_0px_#0A1628]" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
            Empowering the World&apos;s Best Educators
          </h1>
          <p className="text-navy text-xl max-w-2xl mx-auto font-bold bg-yellow p-6 rounded-2xl border-4 border-navy shadow-[8px_8px_0px_#0A1628] transform -rotate-1">
             Help us build the future of education. We&apos;re looking for builders, dreamers, and elite tutors who want to change lives.
          </p>
        </div>
      </section>

      {/* Become a Tutor Process */}
      <section className="bg-white py-24 md:py-32 border-b-8 border-navy relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
           <div className="text-center mb-24">
              <h2 className="font-heading font-black text-navy text-5xl md:text-6xl mb-6">Become a Vetted Tutor</h2>
              <p className="text-navy text-xl font-bold opacity-70">Our rigorous 4-step process ensures only the top 3% of educators join our hub.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, i) => (
                <div key={step.title} className="bg-white border-4 border-navy rounded-[2rem] p-10 shadow-[10px_10px_0px_#0A1628] hover:-translate-y-2 transition-all relative group">
                   <div className="w-20 h-20 bg-navy rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_0px_#F5C518] group-hover:rotate-6 transition-transform">
                      <step.icon className="w-10 h-10 text-white" />
                   </div>
                   <div className="absolute top-8 right-8 text-6xl font-black text-navy/5">{i+1}</div>
                   <h3 className="font-heading font-black text-navy text-2xl mb-4">{step.title}</h3>
                   <p className="text-navy font-bold leading-relaxed">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Tutor Application Form (Brutalist) */}
      <section className="bg-navy py-24 md:py-32 border-b-8 border-navy relative overflow-hidden">
         <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
         <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
                <div className="inline-block bg-success border-4 border-white text-white font-black px-5 py-2 rounded-xl mb-8 shadow-[4px_4px_0px_rgba(255,255,255,0.3)] rotate-[-2deg]">
                   APPLICATION HUB
                </div>
                <h2 className="font-heading font-black text-white text-5xl md:text-7xl mb-10 drop-shadow-[4px_4px_0px_#060E1C]">Apply as a Global Tutor</h2>
                <div className="space-y-6">
                   {[
                     'Global 1-on-1 tutoring opportunities',
                     'Set your own schedule and rates',
                     'Access to premium 3D teaching tools',
                     'Professional development & certifications'
                   ].map(text => (
                     <div key={text} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white border-2 border-navy flex items-center justify-center shadow-[2px_2px_0px_#0A1628]">
                           <Sparkles className="w-5 h-5 text-success" />
                        </div>
                        <span className="text-white text-xl font-bold">{text}</span>
                     </div>
                   ))}
                </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
               <div className="bg-white border-8 border-navy rounded-[3rem] p-10 shadow-[20px_20px_0px_#F5C518] transform rotate-1">
                  <form className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <label className="block text-sm font-black text-navy uppercase mb-3">Full Name</label>
                           <input type="text" placeholder="Dr. Sarah Jenkins" className="w-full bg-off-white border-4 border-navy rounded-xl px-6 py-4 font-bold px-4 focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all" />
                        </div>
                        <div>
                           <label className="block text-sm font-black text-navy uppercase mb-3">Email Address</label>
                           <input type="email" placeholder={siteContact.email.careers} className="w-full bg-off-white border-4 border-navy rounded-xl px-6 py-4 font-bold px-4 focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-black text-navy uppercase mb-3">Primary Subject</label>
                        <select className="w-full bg-off-white border-4 border-navy rounded-xl px-6 py-4 font-bold px-4 focus:outline-none">
                           <option>Mathematics (Advanced)</option>
                           <option>Physics / Chemistry</option>
                           <option>English Literature</option>
                           <option>STEM / Robotics</option>
                           <option>Foreign Languages</option>
                        </select>
                     </div>
                     <div className="relative">
                        <label className="block text-sm font-black text-navy uppercase mb-3">Upload CV / Portfolio (PDF)</label>
                        <div className="w-full bg-off-white border-4 border-navy border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-yellow/10 transition-colors group">
                           <Upload className="w-10 h-10 text-navy/40 group-hover:text-navy transition-colors animate-bounce" />
                           <p className="text-navy font-black text-sm uppercase tracking-widest">Click to upload your CV</p>
                        </div>
                     </div>
                     <button type="submit" className="w-full bg-navy text-white font-heading font-black py-6 rounded-2xl border-4 border-navy shadow-[8px_8px_0px_#F5C518] hover:translate-x-2 hover:translate-y-2 hover:shadow-[4px_4px_0px_#F5C518] transition-all text-xl uppercase tracking-widest">
                        Submit Application
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </section>

      {/* Open Positions Grid */}
      <section className="bg-off-white py-24 md:py-32 border-b-8 border-navy">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-24">
            <div className="inline-block bg-navy border-4 border-navy text-white font-heading font-black px-8 py-3 rounded-2xl mb-8 shadow-[6px_6px_0px_#F5C518] transform -rotate-1">
               <h2 className="text-4xl md:text-5xl uppercase tracking-tight">Open Internal Roles</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {openPositions.map((job) => (
              <div key={job.title} className={`bg-white border-4 border-navy rounded-[2.5rem] p-10 shadow-[12px_12px_0px_#0A1628] hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden ${job.tilt}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${job.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <span className={`text-[10px] font-black uppercase tracking-widest text-navy bg-white border-2 border-navy px-3 py-1 rounded-lg shadow-[2px_2px_0px_#0A1628]`}>
                      {job.department}
                    </span>
                    <span className="text-sm font-black text-success">{job.salary}</span>
                  </div>
                  
                  <h3 className="font-heading font-black text-navy text-3xl mb-4 group-hover:text-info transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-navy font-bold text-lg mb-8 opacity-80">{job.desc}</p>
                  
                  <div className="flex flex-wrap items-center gap-6 mb-10 pt-6 border-t-2 border-dashed border-navy/10">
                    <span className="flex items-center gap-2 text-sm font-black text-navy/60"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-2 text-sm font-black text-navy/60"><Briefcase className="w-4 h-4" /> {job.type}</span>
                  </div>

                  <button className="w-full bg-navy text-white border-4 border-navy font-heading font-black py-4 rounded-xl shadow-[6px_6px_0px_#0A1628] group-hover:bg-info transition-colors flex items-center justify-center gap-2">
                    APPLY NOW <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-20 p-10 bg-white border-4 border-navy rounded-[2rem] shadow-[10px_10px_0px_#0A1628]">
             <p className="text-navy text-xl font-bold mb-6">Don&apos;t see your role? Reach out to our talent acquisition team.</p>
             <Link href="/contact" className="text-navy font-black text-lg underline decoration-4 underline-offset-8 decoration-yellow hover:text-info transition-colors">
               {siteContact.email.careers}
             </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
