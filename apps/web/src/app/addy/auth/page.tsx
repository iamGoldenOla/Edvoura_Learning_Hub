'use client';

import { useActionState, useState } from 'react';

import { adminSignIn, adminSignUp, type FormState } from './actions';

export default function AdminAuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [emailVal, setEmailVal] = useState('');
  const [passVal, setPassVal] = useState('');
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Secure Access</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin Portal</h1>
        <p className="mt-1 text-sm text-slate-600">Use this page for operations admin access.</p>

        {/* 1-Click Preset Button */}
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-300 rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-900 mb-1.5">⚡ 1-Click Default Admin Credentials</p>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setEmailVal('admin@edvoura.com');
              setPassVal('Admin123!');
            }}
            className="w-full py-2 px-3 bg-yellow border-[2px] border-dark rounded-lg text-xs font-black text-dark hover:bg-yellow-light transition-all shadow-[2px_2px_0px_#060E1C] text-left"
          >
            🛡️ Fill Default Admin (`admin@edvoura.com` / `Admin123!`)
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-lg border border-slate-200 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`rounded-md px-3 py-2 font-semibold ${mode === 'signin' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-md px-3 py-2 font-semibold ${mode === 'signup' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Sign Up
          </button>
        </div>

        {state?.error ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 space-y-1">
            {state.error}
          </div>
        ) : null}

        <form action={mode === 'signin' ? signInAction : signUpAction} className="mt-4 space-y-4">
          {mode === 'signup' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
              <input
                name="fullName"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              value={passVal}
              onChange={(e) => setPassVal(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" 
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? 'Please wait...' : mode === 'signin' ? 'Sign In to /addy' : 'Create Admin Account'}
          </button>
        </form>

      </div>
    </div>
  );
}
