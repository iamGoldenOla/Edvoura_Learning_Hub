'use client'

import { useActionState } from 'react'
import { signup } from './actions'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-edvoura-navy mb-6 text-center">Join Edvoura</h1>
        
        {state?.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input name="email" type="email" required className="mt-1 block w-full rounded border-slate-300 shadow-sm p-2 bg-slate-50 text-slate-900 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input name="password" type="password" minLength={6} required className="mt-1 block w-full rounded border-slate-300 shadow-sm p-2 bg-slate-50 text-slate-900 border" />
          </div>
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-edvoura-gold text-edvoura-navy-dark p-2 rounded hover:bg-edvoura-gold-light font-bold transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isPending ? 'Joining...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <a href="/login" className="text-edvoura-navy hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}
