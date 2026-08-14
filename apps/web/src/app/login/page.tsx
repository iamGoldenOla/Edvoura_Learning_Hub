'use client';

import { Suspense, useActionState, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, BookOpen, Users, Video } from 'lucide-react';
import { login } from './actions';
import { createClient } from '@/utils/supabase/client';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '';
  const signupState = searchParams.get('signup');
  const oauthError = searchParams.get('error');
  const [state, formAction, isPending] = useActionState(login, null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [emailVal, setEmailVal] = useState('');
  const [passVal, setPassVal] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setIsGooglePending(true);

    const supabase = createClient();
    const redirectTo = new URL('/auth/callback', window.location.origin);

    if (next.startsWith('/')) {
      redirectTo.searchParams.set('next', next);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo.toString(),
      },
    });

    if (error) {
      setGoogleError(error.message);
      setIsGooglePending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-navy relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="hero-grid-overlay absolute inset-0 pointer-events-none" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-yellow/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center">
              <span className="text-navy font-heading font-extrabold text-xl leading-none">E</span>
            </div>
            <span className="text-white font-heading font-extrabold text-2xl tracking-tight">
              Edvoura<span className="text-yellow">.</span>
            </span>
          </Link>

          <p className="text-yellow font-heading font-bold text-lg mb-10">Learn. Grow. Excel.</p>

          <div className="space-y-4 text-left mb-12">
            {[
              { icon: Users, text: '500+ students already learning' },
              { icon: CheckCircle2, text: 'Expert tutors, vetted and qualified' },
              { icon: Video, text: 'Live sessions via Google Meet' },
            ].map((point) => (
              <div key={point.text} className="flex items-center gap-3">
                <point.icon className="w-5 h-5 text-yellow shrink-0" />
                <span className="text-white/80 text-sm">{point.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-navy-mid border border-navy-light rounded-2xl p-5 text-left animate-float shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-navy-light rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-yellow" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Live Mathematics Session</p>
                <p className="text-grey text-xs">Dr. Adebayo • Grade 7</p>
              </div>
              <div className="ml-auto flex items-center gap-1 bg-success/15 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse-live" />
                LIVE
              </div>
            </div>
            <div className="w-full h-1.5 bg-navy-light rounded-full overflow-hidden">
              <div className="h-full bg-yellow rounded-full w-[72%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 bg-yellow rounded-lg flex items-center justify-center">
              <span className="text-navy font-heading font-extrabold text-lg leading-none">E</span>
            </div>
            <span className="text-navy font-heading font-extrabold text-xl tracking-tight">
              Edvoura<span className="text-yellow">.</span>
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-navy text-3xl mb-2">Welcome back</h1>
          <p className="text-grey text-sm mb-8">Sign in to continue your learning journey.</p>

          {state?.error ? (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl space-y-1">
              <div>{state.error}</div>
            </div>
          ) : null}

          {oauthError ? (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
              {oauthError}
            </div>
          ) : null}

          <form action={formAction} className="space-y-5">
            <input type="hidden" name="next" value={next} />
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Email address</label>
              <input
                name="email"
                type="email"
                required
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                value={passVal}
                onChange={(e) => setPassVal(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey"
              />
              <div className="mt-2 flex justify-end">
                <Link href="/forgot-password" className="text-xs font-semibold text-yellow hover:text-yellow-dim transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-yellow hover:bg-yellow-light text-navy font-heading font-bold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {googleError ? (
            <div className="mt-5 rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error">
              {googleError}
            </div>
          ) : null}

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-grey-light" />
            <span className="text-xs text-grey font-medium">or</span>
            <div className="flex-1 h-px bg-grey-light" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGooglePending}
            className="w-full border border-grey-light hover:border-navy-light text-navy font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isGooglePending ? 'Redirecting to Google...' : 'Continue with Google'}
          </button>

          <p className="mt-8 text-center text-sm text-grey">
            Don&apos;t have an account?{' '}
            <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} className="text-yellow font-semibold hover:text-yellow-dim transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginPageContent />
    </Suspense>
  );
}
