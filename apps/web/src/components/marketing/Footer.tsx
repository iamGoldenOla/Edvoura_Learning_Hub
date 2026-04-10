import React from 'react';
import Link from 'next/link';

const platformLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
];

const companyLinks = [
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
];

const supportLinks = [
  { label: 'Help Centre', href: '/help' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Student Guide', href: '/guide/student' },
  { label: 'Parent Guide', href: '/guide/parent' },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand & Luxury Slogan Cluster */}
          <div className="lg:col-span-1 pr-8">
            <Link href="/" className="flex items-center gap-3 group perspective-[1000px] mb-6">
              {/* Kinetic Badge (Scaled Down) */}
              <div className="relative w-10 h-10 flex-shrink-0 kinetic-logo">
                <div className="absolute inset-0 bg-yellow rounded-xl rotate-12 group-hover:rotate-[30deg] transition-transform duration-500 shadow-xl" />
                <div className="absolute inset-0 bg-navy border-2 border-yellow rounded-xl flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  <span className="text-yellow font-heading font-black text-xl">E</span>
                </div>
              </div>

              <div className="flex flex-col -space-y-1.5 pt-1">
                <span className="premium-shimmer-text font-heading font-black text-xl md:text-2xl tracking-tighter uppercase leading-none text-white">
                  EDVOURA
                </span>
                <span className="text-white font-heading font-black text-[9px] md:text-[10px] tracking-[0.2em] uppercase leading-none mt-1">
                  LEARNING <span className="text-yellow">HUB</span><span className="text-yellow">.</span>
                </span>
              </div>
            </Link>

            <div className="relative pl-4 mb-6 group overflow-hidden py-1">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow via-white to-yellow rounded-full" />
              <p className="text-white font-heading font-black italic text-sm tracking-wide leading-tight">
                &ldquo;Where Learners&apos; Dreams 
                <br />
                Come True&rdquo;
              </p>
            </div>
            
            <p className="text-grey text-[12px] leading-relaxed max-w-[200px] font-medium opacity-50">
              A premium global learning ecosystem empowering the next generation of leaders.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-grey mb-5">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-grey-light/70 hover:text-yellow transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-grey mb-5">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-grey-light/70 hover:text-yellow transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-grey mb-5">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-grey-light/70 hover:text-yellow transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-navy-light/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-grey">
            © {new Date().getFullYear()} Edvoura Learning Hub. All rights reserved.
          </p>
          <p className="text-xs text-grey">
            edvouralearninghub.com
          </p>
        </div>
      </div>
    </footer>
  );
}
