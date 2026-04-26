import Link from 'next/link';

import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';

type InfoPageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function InfoPageShell({
  eyebrow,
  title,
  intro,
  sections,
  ctaLabel = 'Contact Support',
  ctaHref = '/contact',
}: InfoPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-off-white font-body selection:bg-yellow selection:text-navy">
      <Navbar />

      <section className="relative overflow-hidden border-b-8 border-navy bg-navy pb-14 pt-[108px] sm:pt-[128px] md:pb-20 md:pt-[152px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,24,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_32%)]" />
        <div className="marketing-container relative z-10 text-center">
          <div className="marketing-eyebrow bg-yellow">{eyebrow}</div>
          <h1 className="marketing-display mx-auto mt-6 max-w-4xl font-heading font-black text-white">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl rounded-3xl border-4 border-white/20 bg-white/10 p-5 text-base font-bold leading-relaxed text-white shadow-[6px_6px_0px_#0A1628] backdrop-blur-md sm:text-lg md:text-xl">
            {intro}
          </p>
        </div>
      </section>

      <section className="border-b-8 border-navy bg-white py-14 sm:py-16 md:py-24">
        <div className="marketing-container">
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((section, index) => (
              <article
                key={section.title}
                className={`rounded-[2rem] border-4 border-navy p-6 shadow-[10px_10px_0px_#0A1628] sm:p-8 ${
                  index % 2 === 0 ? 'bg-off-white' : 'bg-yellow/15'
                }`}
              >
                <h2 className="font-heading text-2xl font-black text-navy sm:text-3xl">{section.title}</h2>
                <div className="mt-5 space-y-4 text-sm font-bold leading-relaxed text-navy sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border-4 border-navy bg-navy p-8 text-center text-white shadow-[12px_12px_0px_#F5C518] sm:p-10">
            <p className="text-lg font-bold sm:text-xl">Need help with something more specific?</p>
            <Link
              href={ctaHref}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border-4 border-navy bg-yellow px-8 py-4 font-heading text-lg font-black uppercase tracking-[0.14em] text-navy shadow-[6px_6px_0px_#0A1628] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_#0A1628] sm:w-auto"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
