'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { type FormState } from '../login/actions'

export async function signup(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dash')
}
