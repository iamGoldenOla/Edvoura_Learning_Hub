'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPending(true);

    const supabase = createClient();
    const redirectTo = new URL('/auth/callback', window.location.origin);
    redirectTo.searchParams.set('next', '/reset-password');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectTo.toString(),
    });

    if (resetError) {
      setError(resetError.message);
      setIsPending(false);
      return;
    }

    setSuccess('If that email exists, a password reset link has been sent.');
    setIsPending(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Account Recovery</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Forgot your password?</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your email address and we&apos;ll send you a password reset link.
        </p>

        {error ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? 'Sending reset link...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-slate-900 hover:underline">
            Return to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
