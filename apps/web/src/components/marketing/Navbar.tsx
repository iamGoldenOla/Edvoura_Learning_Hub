'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';

import { createClient } from '@/utils/supabase/client';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

const portalLinks = [
  { label: 'Student Portal', role: 'student', icon: 'S', desc: 'Learning and dashboard' },
  { label: 'Tutor Portal', role: 'tutor', icon: 'T', desc: 'Teaching and schedule' },
  { label: 'Parent Portal', role: 'parent', icon: 'P', desc: 'Monitoring and growth' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setSignInOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.dataset.mobileMenu = mobileOpen ? 'open' : 'closed';
    return () => {
      delete document.body.dataset.mobileMenu;
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b border-yellow/10 bg-dark/98 shadow-lg' : 'bg-navy/95 backdrop-blur-xl'
        }`}
      >
        <div className="marketing-container flex h-16 items-center justify-between gap-3 sm:h-[72px]">
          <Link
            href="/"
            className="group flex min-w-0 max-w-[calc(100%-4.5rem)] items-center gap-2.5 perspective-[1000px] sm:gap-3"
          >
            <div className="kinetic-logo relative h-9 w-9 flex-shrink-0 sm:h-10 sm:w-10 xl:h-11 xl:w-11">
              <div className="absolute inset-0 rotate-12 rounded-xl bg-yellow shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:rotate-[30deg]" />
              <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-yellow bg-navy shadow-xl transition-transform duration-500 group-hover:rotate-0 -rotate-6">
                <span className="font-heading text-lg font-black text-yellow sm:text-xl xl:text-2xl">E</span>
              </div>
              <div className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-navy bg-success shadow-lg" />
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex min-w-0 items-center gap-2">
                <span className="premium-shimmer-text truncate font-heading text-[1.45rem] font-black leading-none tracking-[-0.06em] uppercase text-white sm:text-[1.75rem] lg:text-[1.95rem] xl:text-[2.2rem]">
                  EDVOURA
                </span>
                <div className="hidden h-[2px] w-6 bg-yellow/50 lg:block xl:w-8" />
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2 xl:gap-3">
                <span className="mt-0.5 font-heading text-[8px] font-black leading-none tracking-[0.18em] uppercase text-white shadow-sm sm:text-[9px] xl:text-[10px]">
                  LEARNING <span className="text-yellow">HUB</span>
                  <span className="text-yellow">.</span>
                </span>
                <span className="hidden text-[8px] font-black uppercase tracking-[0.08em] text-yellow/90 sm:block lg:hidden">
                  Where learners&apos; dreams come true
                </span>
                <div className="luxury-badge hidden overflow-hidden whitespace-nowrap rounded-full border border-navy/20 bg-yellow px-2.5 py-1 xl:block">
                  <span className="text-[8px] font-black uppercase leading-none tracking-[0.1em] text-navy">
                    Where Learners&apos; Dreams Come True
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex xl:gap-8">
            <div className="flex items-center gap-4 xl:gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 transition-colors duration-200 hover:text-yellow xl:text-xs"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="relative flex shrink-0 items-center gap-3 border-l border-white/10 pl-4 xl:gap-4 xl:pl-6">
              {user ? (
                <>
                  <Link
                    href="/dash"
                    className="whitespace-nowrap px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:text-yellow"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-lg border-2 border-white/20 px-4 py-2 text-[10px] font-heading font-black uppercase tracking-widest text-white transition-all hover:border-yellow hover:text-yellow"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 xl:gap-4">
                  <div className="group relative">
                    <button
                      type="button"
                      onClick={() => setSignInOpen((open) => !open)}
                      className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-2 text-[10px] font-black uppercase tracking-widest transition-all xl:px-3 ${
                        signInOpen
                          ? 'border-yellow bg-white/5 text-yellow'
                          : 'border-transparent bg-transparent text-white hover:text-yellow'
                      }`}
                    >
                      Sign In
                      <svg
                        className={`h-3 w-3 transition-transform duration-300 ${signInOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {signInOpen && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10"
                          onClick={() => setSignInOpen(false)}
                          aria-label="Close sign in menu"
                        />
                        <div className="reveal-luxury absolute right-0 top-full z-20 mt-3 w-64 animate-in rounded-2xl border-2 border-white/10 bg-navy p-3 shadow-[12px_12px_0px_#000] duration-200 fade-in slide-in-from-top-2">
                          <div className="flex flex-col gap-1">
                            {portalLinks.map((item) => (
                              <Link
                                key={item.role}
                                href={`/login?role=${item.role}`}
                                onClick={() => setSignInOpen(false)}
                                className="group/item flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-white/5"
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-lg transition-all duration-300 group-hover/item:scale-110 group-hover/item:bg-yellow group-hover/item:text-navy">
                                  {item.icon}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black uppercase tracking-widest text-white transition-colors group-hover/item:text-yellow">
                                    {item.label}
                                  </span>
                                  <span className="text-[9px] font-bold uppercase tracking-tighter text-grey opacity-50">
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
                    className="whitespace-nowrap rounded-lg bg-yellow px-4 py-2.5 text-[10px] font-heading font-black uppercase tracking-[0.16em] text-navy shadow-[4px_4px_0px_rgba(0,0,0,0.5)] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:bg-yellow-light hover:shadow-none active:scale-95 xl:px-5 xl:py-3"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white/10 bg-white/5 text-white transition-colors hover:border-yellow hover:text-yellow lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-navy/75 backdrop-blur-md">
          <button type="button" className="absolute inset-0" onClick={() => setMobileOpen(false)} aria-label="Close menu overlay" />
          <div
            id="mobile-nav-panel"
            className="absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col border-l-4 border-navy bg-dark px-5 pb-8 pt-5 shadow-[-12px_0_0_#F5C518]"
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-heading text-xl font-black uppercase tracking-tight text-white">Menu</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-yellow/90">
                  Explore Edvoura
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white/10 bg-white/5 text-white transition-colors hover:border-yellow hover:text-yellow"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6 rounded-2xl border-2 border-white/10 bg-navy px-4 py-3">
              <p className="font-heading text-lg font-black uppercase text-white">Edvoura Learning Hub</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-yellow">
                Where learners&apos; dreams come true
              </p>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pr-1">
              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="animate-fade-up rounded-2xl border-2 border-white/10 bg-white/5 px-4 py-4 font-heading text-lg font-bold text-white transition-colors hover:border-yellow hover:text-yellow"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8">
                {!user ? (
                  <>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-grey opacity-80">Portal Selection</p>
                    <div className="grid grid-cols-1 gap-2">
                      {portalLinks.map((item) => (
                        <Link
                          key={item.role}
                          href={`/login?role=${item.role}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-yellow"
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-xs font-black uppercase tracking-widest text-white">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="mt-2 w-full rounded-xl bg-yellow px-8 py-4 text-center font-heading font-black uppercase tracking-widest text-navy shadow-[4px_4px_0px_#000] transition-all hover:bg-yellow-light"
                    >
                      Get Started →
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dash"
                      onClick={() => setMobileOpen(false)}
                      className="w-full rounded-xl bg-yellow px-8 py-4 text-center font-heading font-black uppercase tracking-widest text-navy shadow-[4px_4px_0px_#000] transition-all hover:bg-yellow-light"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        void handleSignOut();
                        setMobileOpen(false);
                      }}
                      className="w-full rounded-xl border-2 border-white/10 bg-white/5 px-8 py-4 text-center font-heading font-black uppercase tracking-widest text-white transition-colors hover:border-yellow hover:text-yellow"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
