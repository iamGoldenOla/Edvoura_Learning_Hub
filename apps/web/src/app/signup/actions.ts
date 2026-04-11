'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { type FormState } from '../login/actions'

export async function signup(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string
  const learnerBand = formData.get('learnerBand') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (!role) {
    return { error: 'Please select a role' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        learner_band: learnerBand || null,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dash')
}
