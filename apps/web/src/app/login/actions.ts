'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export type FormState = { error: string } | null;

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()
  const password = formData.get('password') as string
  const next = formData.get('next') as string | null

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  let error: { message: string } | null = null
  try {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    error = result.error
  } catch {
    return {
      error:
        'Authentication service is currently unavailable. Start local Supabase and try again.',
    }
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')

  if (next && next.startsWith('/')) {
    redirect(next)
  }

  redirect('/dash')
}
