'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export type FormState = { error: string } | null

export async function superAdminSignIn(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.message }
  }

  redirect('/me')
}

export async function superAdminSignUp(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!fullName || !email || !password) {
    return { error: 'Full name, email and password are required' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'super_admin',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/me')
}

