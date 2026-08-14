'use server'

import { redirect } from 'next/navigation'
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/utils/supabase/server'

export type FormState = { error: string } | null

function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !url) return null
  return createAdminSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function adminSignIn(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  let { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error && error.message.toLowerCase().includes('email not confirmed')) {
    const adminClient = getAdminClient()
    if (adminClient) {
      const { data: usersData } = await adminClient.auth.admin.listUsers()
      const targetUser = usersData?.users?.find((u) => u.email?.toLowerCase() === email)
      if (targetUser) {
        await adminClient.auth.admin.updateUserById(targetUser.id, { email_confirm: true })
        const retry = await supabase.auth.signInWithPassword({ email, password })
        error = retry.error
      }
    }
  }

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        error: 'Email confirmation is pending in Supabase. Please turn OFF "Confirm email" in Supabase Dashboard (Authentication -> Sign In / Providers -> Email) to sign in immediately.',
      }
    }
    return { error: error.message }
  }

  redirect('/addy')
}

export async function adminSignUp(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  const fullName = ((formData.get('fullName') as string | null) ?? '').trim()
  const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()
  const password = formData.get('password') as string

  if (!fullName || !email || !password) {
    return { error: 'Full name, email and password are required' }
  }

  const adminClient = getAdminClient()

  if (adminClient) {
    const { data: adminUserData, error: adminCreateErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'admin',
      },
    })

    if (!adminCreateErr && adminUserData?.user) {
      const userId = adminUserData.user.id
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' })
      await supabase.from('admin_profiles').insert({ user_id: userId, full_name: fullName, access_level: 'super_admin' })

      const signInRes = await supabase.auth.signInWithPassword({ email, password })
      if (!signInRes.error) {
        redirect('/addy')
      }
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edvouralearninghub.com'
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/addy`,
      data: {
        full_name: fullName,
        role: 'admin',
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('error sending confirmation email') || error.message.toLowerCase().includes('confirmation email')) {
      const signInRes = await supabase.auth.signInWithPassword({ email, password })
      if (!signInRes.error) {
        redirect('/addy')
      }
      return {
        error: 'Email confirmation is active in your Supabase Auth project. Please go to Supabase Dashboard -> Authentication -> Sign In / Providers -> Email -> Toggle OFF "Confirm email" to complete registration instantly.',
      }
    }
    return { error: error.message }
  }

  if (data.user) {
    await supabase.from('user_roles').insert({ user_id: data.user.id, role: 'admin' })
    await supabase.from('admin_profiles').insert({ user_id: data.user.id, full_name: fullName, access_level: 'super_admin' })

    const signInRes = await supabase.auth.signInWithPassword({ email, password })
    if (!signInRes.error) {
      redirect('/addy')
    }
  }

  redirect('/addy')
}

