'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-dark/98 border-b border-yellow/10 shadow-lg'
            : 'bg-navy/95 backdrop-blur-xl'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-yellow rounded-lg flex items-center justify-center">
              <span className="text-navy font-heading font-extrabold text-lg leading-none">E</span>
            </div>
            <span className="text-white font-heading font-extrabold text-xl tracking-tight">
              Edvoura<span className="text-yellow">.</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-grey hover:text-yellow transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-white hover:text-yellow transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-heading font-bold text-navy bg-yellow hover:bg-yellow-light px-5 py-2.5 rounded-lg transition-colors duration-200"
            >
              Get Started →
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-white hover:text-yellow transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-navy flex flex-col items-center justify-center">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-yellow transition-colors"
            aria-label="Close menu"
          >
            <X className="w-7 h-7" />
          </button>

          <div className="flex flex-col items-center gap-6">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-heading font-bold text-white hover:text-yellow transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-navy-light w-48">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-grey hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="bg-yellow text-navy font-heading font-bold px-8 py-3 rounded-lg text-center w-full hover:bg-yellow-light transition-colors"
              >
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
