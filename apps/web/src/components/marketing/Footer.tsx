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
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-yellow rounded-lg flex items-center justify-center">
                <span className="text-navy font-heading font-extrabold text-lg leading-none">E</span>
              </div>
              <span className="text-white font-heading font-extrabold text-xl tracking-tight">
                Edvoura<span className="text-yellow">.</span>
              </span>
            </Link>
            <p className="text-grey text-sm leading-relaxed max-w-xs">
              Nigeria's premier K-12 online tutoring platform. Connecting students with expert tutors for live, interactive learning sessions.
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
