'use client';

import { useActionState, useState } from 'react';
import { adminSignIn, adminSignUp, type FormState } from '@/app/addy/auth/actions';
import { UniqueCodeVerificationGate } from '@/components/ui/UniqueCodeVerificationGate';
import { Shield, Lock, ArrowRight, Sparkles, KeyRound } from 'lucide-react';

export default function EddyAuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [emailVal, setEmailVal] = useState('');
  const [passVal, setPassVal] = useState('');
  const [uniqueCodeVal, setUniqueCodeVal] = useState('');
  const [signInState, signInAction, signInPending] = useActionState<FormState, FormData>(
    adminSignIn,
    null,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState<FormState, FormData>(
    adminSignUp,
    null,
  );

  const pending = mode === 'signin' ? signInPending : signUpPending;
  const state = mode === 'signin' ? signInState : signUpState;

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand p-6 selection:bg-yellow">
      {signUpState?.pendingVerification && signUpState.uniqueCode ? (
        <UniqueCodeVerificationGate
          fullName={signUpState.fullName || 'Admin User'}
          email={signUpState.email || ''}
          role="admin"
          uniqueCode={signUpState.uniqueCode}
          onVerified={() => {
            window.location.href = '/eddy';
          }}
        />
      ) : null}

      <div className="w-full max-w-md rounded-[28px] border-[4px] border-dark bg-white p-8 shadow-[10px_10px_0px_#060E1C]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-yellow rounded-xl border-[2px] border-dark shadow-[2px_2px_0px_#000]">
            <Shield className="h-5 w-5 text-dark" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-dark/70">
            CONFIDENTIAL GATEWAY
          </span>
        </div>

        <h1 className="text-3xl font-black text-dark tracking-tight uppercase">
          Eddy Command Portal
        </h1>
        <p className="mt-1 text-xs font-bold text-dark/60">
          Executive access for Edvoura platform operations, client leads, and moderation.
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-2xl border-[3px] border-dark bg-slate-100 p-1 text-xs font-black uppercase">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`rounded-xl px-3 py-2.5 transition-all ${
              mode === 'signin' ? 'bg-black text-yellow shadow-[2px_2px_0px_#000]' : 'text-dark/70'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-xl px-3 py-2.5 transition-all ${
              mode === 'signup' ? 'bg-black text-yellow shadow-[2px_2px_0px_#000]' : 'text-dark/70'
            }`}
          >
            Register
          </button>
        </div>

        {state?.error ? (
          <div className="mt-4 rounded-xl border-[2px] border-dark bg-rose-100 p-3 text-xs font-bold text-rose-800">
            {state.error}
          </div>
        ) : null}

        <form action={mode === 'signin' ? signInAction : signUpAction} className="mt-6 space-y-4">
          {mode === 'signup' ? (
            <div>
              <label className="block text-xs font-black uppercase text-dark">Full Name</label>
              <input
                name="fullName"
                type="text"
                required
                placeholder="Akinola Olujobi"
                className="mt-1.5 w-full rounded-xl border-[2px] border-dark px-4 py-3 text-xs font-bold text-dark focus:outline-none shadow-[2px_2px_0px_#000]"
              />
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-black uppercase text-dark">Admin Email</label>
            <input
              name="email"
              type="email"
              required
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              placeholder="akinolaolujobi@gmail.com"
              className="mt-1.5 w-full rounded-xl border-[2px] border-dark px-4 py-3 text-xs font-bold text-dark focus:outline-none shadow-[2px_2px_0px_#000]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-dark">Security Password</label>
            <input
              name="password"
              type="password"
              required
              value={passVal}
              onChange={(e) => setPassVal(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1.5 w-full rounded-xl border-[2px] border-dark px-4 py-3 text-xs font-bold text-dark focus:outline-none shadow-[2px_2px_0px_#000]"
            />
          </div>

          {/* Unique Security Pass Code Field */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase text-dark flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-yellow-600" /> Unique Security Pass Code
              </label>
              <span className="text-[10px] font-bold text-dark/50">Required</span>
            </div>
            <input
              name="uniqueCode"
              type="text"
              required
              value={uniqueCodeVal}
              onChange={(e) => setUniqueCodeVal(e.target.value.toUpperCase())}
              placeholder="ADM-ADMIN-20260814-1234 or your assigned code"
              className="mt-1.5 w-full rounded-xl border-[2px] border-dark px-4 py-3 text-xs font-mono font-bold text-dark uppercase focus:outline-none shadow-[2px_2px_0px_#000] bg-yellow-50/50"
            />
            <p className="mt-1 text-[10px] font-bold text-dark/60">
              {mode === 'signin'
                ? 'Enter your assigned security pass code (e.g. ADM-...). If logging in for the first time, any code entered will be bound.'
                : 'Leave blank to generate automatically on registration.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-4 w-full rounded-xl border-[3px] border-dark bg-yellow py-3.5 text-xs font-black uppercase text-dark shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? 'Authorizing...' : mode === 'signin' ? 'Enter Eddy Portal' : 'Create Admin Key'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
