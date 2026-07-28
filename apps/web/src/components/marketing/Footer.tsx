import React from 'react';
import Link from 'next/link';

import { siteContact } from '@/lib/site';

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
      <div className="marketing-container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-8">
          <div className="lg:pr-8 lg:-ml-6 xl:-ml-8">
            <Link href="/" className="group mb-6 flex items-center gap-3 perspective-[1000px]">
              <div className="kinetic-logo relative h-10 w-10 flex-shrink-0">
                <div className="absolute inset-0 rotate-12 rounded-xl bg-yellow shadow-xl transition-transform duration-500 group-hover:rotate-[30deg]" />
                <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-yellow bg-navy transition-transform duration-500 group-hover:rotate-0 -rotate-6">
                  <span className="font-heading text-xl font-black text-yellow">E</span>
                </div>
              </div>

              <div className="flex flex-col -space-y-1.5 pt-1">
                <span className="premium-shimmer-text font-heading text-xl font-black uppercase leading-none tracking-tighter text-white md:text-2xl">
                  EDVOURA
                </span>
                <span className="mt-1 font-heading text-[9px] font-black uppercase leading-none tracking-[0.2em] text-white md:text-[10px]">
                  LEARNING <span className="text-yellow">HUB</span>
                  <span className="text-yellow">.</span>
                </span>
              </div>
            </Link>

            <div className="group relative mb-6 overflow-hidden py-1 pl-4">
              <div className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-gradient-to-b from-yellow via-white to-yellow" />
              <p className="font-heading text-sm font-black italic leading-tight tracking-wide text-white">
                &ldquo;Where Learners&apos; Dreams
                <br />
                Come True&rdquo;
              </p>
            </div>

            <p className="max-w-[240px] text-[12px] font-medium leading-relaxed text-grey opacity-50">
              A premium global learning ecosystem empowering the next generation of leaders.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-grey">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-grey-light/70 transition-colors duration-200 hover:text-yellow">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-grey">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-grey-light/70 transition-colors duration-200 hover:text-yellow">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-grey">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-grey-light/70 transition-colors duration-200 hover:text-yellow">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-grey">Contact</h4>
            <ul className="space-y-3 text-sm text-grey-light/70 font-semibold">
              <li className="hover:text-yellow transition-colors duration-200 break-all">
                <a href={`mailto:${siteContact.email.info}`}>{siteContact.email.info}</a>
              </li>
              <li className="hover:text-yellow transition-colors duration-200">
                <a href={`tel:${siteContact.phone.support}`}>{siteContact.phone.support}</a>
              </li>
              <li className="leading-relaxed">{siteContact.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-navy-light/30 pt-8 md:flex-row">
          <p className="text-xs text-grey">© {new Date().getFullYear()} Edvoura Learning Hub. All rights reserved.</p>
          <p className="text-xs text-grey">{siteContact.domain}</p>
        </div>
      </div>
    </footer>
  );
}
