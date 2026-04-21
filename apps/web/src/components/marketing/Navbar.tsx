'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

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
          scrolled ? 'bg-dark/98 border-b border-yellow/10 shadow-lg' : 'bg-navy/95 backdrop-blur-xl'
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 md:px-6 xl:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3 group perspective-[1000px]">
            <div className="kinetic-logo relative h-10 w-10 flex-shrink-0 xl:h-11 xl:w-11">
              <div className="absolute inset-0 rotate-12 rounded-xl bg-yellow shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:rotate-[30deg]" />
              <div className="absolute inset-0 -rotate-6 rounded-xl border-2 border-yellow bg-navy shadow-xl transition-transform duration-500 group-hover:rotate-0 flex items-center justify-center">
                <span className="font-heading text-xl font-black text-yellow xl:text-2xl">E</span>
              </div>
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-navy bg-success shadow-lg animate-pulse" />
            </div>

            <div className="flex min-w-0 flex-col -space-y-1 pt-1">
              <div className="flex items-center gap-2">
                <span className="premium-shimmer-text font-heading text-[2rem] font-black leading-none tracking-[-0.06em] uppercase text-white xl:text-[2.35rem]">
                  EDVOURA
                </span>
                <div className="hidden h-[2px] w-6 bg-yellow/50 lg:block xl:w-8" />
              </div>
              <div className="flex items-center gap-2 xl:gap-3">
                <span className="mt-1 font-heading text-[9px] font-black leading-none tracking-[0.24em] uppercase text-white shadow-sm xl:text-[10px]">
                  LEARNING <span className="text-yellow">HUB</span>
                  <span className="text-yellow">.</span>
                </span>
                <div className="luxury-badge hidden overflow-hidden whitespace-nowrap rounded-full border border-navy/20 bg-yellow px-2.5 py-1 2xl:block">
                  <span className="text-[8px] font-black leading-none tracking-[0.1em] text-navy uppercase">
                    Where Learners&apos; Dreams Come True
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
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
                      onClick={() => setSignInOpen(!signInOpen)}
                      className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-2 text-[10px] font-black uppercase tracking-widest transition-all xl:px-3 ${
                        signInOpen
                          ? 'bg-white/5 border-yellow text-yellow'
                          : 'bg-transparent border-transparent text-white hover:text-yellow'
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
                        <div className="fixed inset-0 z-10" onClick={() => setSignInOpen(false)} />
                        <div className="reveal-luxury absolute right-0 top-full z-20 mt-3 w-64 rounded-2xl border-2 border-white/10 bg-navy p-3 shadow-[12px_12px_0px_#000] animate-in fade-in slide-in-from-top-2 duration-200">
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
                    className="whitespace-nowrap rounded-lg bg-yellow px-4 py-2.5 text-[10px] font-heading font-black uppercase tracking-[0.16em] text-navy transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:bg-yellow-light hover:shadow-none active:scale-95 xl:px-5 xl:py-3 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="text-white transition-colors hover:text-yellow lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 right-6 text-white transition-colors hover:text-yellow"
            aria-label="Close menu"
          >
            <X className="h-7 w-7" />
          </button>

          <div className="flex flex-col items-center gap-6">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="animate-fade-up font-heading text-2xl font-bold text-white transition-colors hover:text-yellow"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-8 flex w-full max-w-xs flex-col items-center gap-4 border-t border-navy-light pt-8">
              {!user ? (
                <>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-grey opacity-50">Portal Selection</p>
                  <div className="grid w-full grid-cols-1 gap-2">
                    {[
                      { label: 'Student Portal', role: 'student', icon: '🎓' },
                      { label: 'Tutor Portal', role: 'tutor', icon: '👨‍🏫' },
                      { label: 'Parent Portal', role: 'parent', icon: '👪' },
                    ].map((item) => (
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
                    className="mt-4 w-full rounded-xl bg-yellow px-8 py-4 text-center font-heading font-black uppercase tracking-widest text-navy transition-all hover:bg-yellow-light shadow-[4px_4px_0px_#000]"
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
                  className="w-full rounded-xl border-2 border-white/10 bg-white/5 px-8 py-4 text-center font-heading font-black uppercase tracking-widest text-white transition-colors hover:border-yellow hover:text-yellow"
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
