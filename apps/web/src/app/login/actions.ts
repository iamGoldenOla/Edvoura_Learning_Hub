'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export type FormState = { error: string } | null;

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()
    const password = formData.get('password') as string
    const next = formData.get('next') as string | null

    if (!email || !password) {
      return { error: 'Email and password are required' }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/', 'layout')

    if (next && next.startsWith('/')) {
      redirect(next)
    }

    redirect('/dash')
  } catch (err: any) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('Login action error:', err)
    return {
      error: err?.message || 'Authentication service is currently unavailable. Please verify your Supabase environment variables on Vercel.',
    }
  }
}
