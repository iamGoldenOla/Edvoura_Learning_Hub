'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSignInOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setSignInOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

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
          <Link href="/" className="flex items-center gap-4 group perspective-[1000px]">
            {/* The Animated Badge Icon */}
            <div className="relative w-12 h-12 flex-shrink-0 kinetic-logo">
              <div className="absolute inset-0 bg-yellow rounded-xl rotate-12 group-hover:rotate-[30deg] transition-transform duration-500 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]" />
              <div className="absolute inset-0 bg-navy border-2 border-yellow rounded-xl flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-xl">
                <span className="text-yellow font-heading font-black text-2xl">E</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success border-2 border-navy rounded-full animate-pulse shadow-lg" />
            </div>

            {/* The Brand & Slogan Cluster */}
            <div className="flex flex-col -space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <span className="premium-shimmer-text font-heading font-black text-3xl md:text-4xl tracking-tighter uppercase leading-none text-white">
                  EDVOURA
                </span>
                <div className="hidden sm:block h-[2px] w-8 bg-yellow/50 mt-1" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-heading font-black text-[10px] md:text-[11px] tracking-[0.3em] uppercase leading-none mt-1 shadow-sm">
                  LEARNING <span className="text-yellow">HUB</span><span className="text-yellow">.</span>
                </span>
                {/* Floating Slogan Badge */}
                <div className="luxury-badge px-3 py-1 rounded-full overflow-hidden whitespace-nowrap bg-yellow border border-navy/20">
                   <span className="text-[8px] font-black uppercase tracking-[0.1em] text-navy leading-none">
                     Where Learners&apos; Dreams Come True
                   </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Right Cluster (Nav + CTAs) */}
          <div className="hidden xl:flex items-center gap-10">
            {/* Nav Links */}
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-yellow transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-4 border-l border-white/10 pl-6 shrink-0 relative">
              {user ? (
                <>
                  <Link
                    href="/dash"
                    className="text-[10px] font-black uppercase tracking-widest text-white hover:text-yellow transition-colors px-3 py-2 whitespace-nowrap"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-[10px] font-heading font-black text-white border-2 border-white/20 hover:border-yellow hover:text-yellow px-4 py-2.5 rounded-lg transition-all uppercase tracking-widest whitespace-nowrap"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Premium Sign In Dropdown */}
                  <div className="relative group">
                    <button
                      onClick={() => setSignInOpen(!signInOpen)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-2 whitespace-nowrap rounded-lg border-2 ${
                        signInOpen ? 'bg-white/5 border-yellow text-yellow' : 'bg-transparent border-transparent text-white hover:text-yellow'
                      }`}
                    >
                      Sign In
                      <svg
                        className={`w-3 h-3 transition-transform duration-300 ${signInOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {signInOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setSignInOpen(false)}
                        />
                        <div className="absolute top-full right-0 mt-3 w-64 bg-navy border-2 border-white/10 rounded-2xl p-3 shadow-[12px_12px_0px_#000] z-20 reveal-luxury animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex flex-col gap-1">
                            {[
                              { label: 'Student Portal', role: 'student', icon: '🎓', desc: 'Learning & Dashboard' },
                              { label: 'Tutor Portal', role: 'tutor', icon: '👨‍🏫', desc: 'Teaching & Schedule' },
                              { label: 'Parent Portal', role: 'parent', icon: '👪', desc: 'Monitoring & Growth' },
                            ].map((item) => (
                              <Link
                                key={item.role}
                                href={`/login?role=${item.role}`}
                                onClick={() => setSignInOpen(false)}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group/item"
                              >
                                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-lg group-hover/item:bg-yellow group-hover/item:text-navy group-hover/item:scale-110 transition-all duration-300">
                                  {item.icon}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black uppercase tracking-widest text-white group-hover/item:text-yellow transition-colors">
                                    {item.label}
                                  </span>
                                  <span className="text-[9px] font-bold text-grey opacity-50 uppercase tracking-tighter">
                                    {item.desc}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <Link
                    href="/signup"
                    className="text-[10px] font-heading font-black text-navy bg-yellow hover:bg-yellow-light px-5 py-3 rounded-lg transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 duration-200 uppercase tracking-widest whitespace-nowrap"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
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

            <div className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-navy-light w-full max-w-xs">
              {!user ? (
                <>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-grey opacity-50 mb-2">Portal Selection</p>
                  <div className="grid grid-cols-1 gap-2 w-full">
                    {[
                      { label: 'Student Portal', role: 'student', icon: '🎓' },
                      { label: 'Tutor Portal', role: 'tutor', icon: '👨‍🏫' },
                      { label: 'Parent Portal', role: 'parent', icon: '👪' },
                    ].map((item) => (
                      <Link
                        key={item.role}
                        href={`/login?role=${item.role}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-yellow transition-all"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-xs font-black uppercase tracking-widest text-white">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="bg-yellow text-navy font-heading font-black px-8 py-4 rounded-xl text-center w-full hover:bg-yellow-light transition-all shadow-[4px_4px_0px_#000] mt-4 uppercase tracking-widest"
                  >
                    Get Started →
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="bg-white/5 border-2 border-white/10 text-white font-heading font-black px-8 py-4 rounded-xl text-center w-full hover:border-yellow hover:text-yellow transition-colors uppercase tracking-widest"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
