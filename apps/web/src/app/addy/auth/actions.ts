'use server'

import { redirect } from 'next/navigation'
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/utils/supabase/server'

export type FormState = {
  error?: string
  pendingVerification?: boolean
  fullName?: string
  email?: string
  role?: string
  uniqueCode?: string
} | null

function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !url) return null
  return createAdminSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function generateGuaranteedUniqueCode(fullName: string, role = 'student'): string {
  const prefix = role === 'admin' ? 'ADM' : role === 'parent' ? 'PAR' : role === 'tutor' ? 'TUT' : 'EDV';
  const namePart = (fullName || 'USER')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 5) || 'EXPLORER';
  
  const dateObj = new Date();
  const datePart = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
  const randEntropy = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}-${namePart}-${datePart}-${randEntropy}`;
}

export async function adminSignIn(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()
  const password = formData.get('password') as string
  const uniqueCodeInput = ((formData.get('uniqueCode') as string | null) ?? '').trim().toUpperCase()

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (!uniqueCodeInput) {
    return { error: 'Admin Unique Access Pass Code is required to sign in. (e.g. ADM-ADMIN-20260814-1234)' }
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
    return { error: error.message }
  }

  // Security Gate Verification
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const assignedCode = (user.user_metadata?.unique_code as string | undefined || '').trim().toUpperCase();
    if (assignedCode && assignedCode !== uniqueCodeInput) {
      await supabase.auth.signOut()
      return { error: 'Invalid Admin Unique Access Pass Code. Authentication rejected.' }
    }

    if (!assignedCode) {
      await supabase.auth.updateUser({
        data: { ...user.user_metadata, unique_code: uniqueCodeInput }
      })
    }
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

  const uniqueCode = generateGuaranteedUniqueCode(fullName, 'admin')
  const adminClient = getAdminClient()

  if (adminClient) {
    const { data: adminUserData, error: adminCreateErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'admin',
        unique_code: uniqueCode,
      },
    })

    if (!adminCreateErr && adminUserData?.user) {
      const userId = adminUserData.user.id
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' })
      await supabase.from('admin_profiles').insert({ user_id: userId, full_name: fullName, access_level: 'super_admin' })

      await supabase.auth.signInWithPassword({ email, password })
      return {
        pendingVerification: true,
        fullName,
        email,
        role: 'admin',
        uniqueCode,
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
        unique_code: uniqueCode,
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('error sending confirmation email') || error.message.toLowerCase().includes('confirmation email')) {
      const signInRes = await supabase.auth.signInWithPassword({ email, password })
      if (!signInRes.error) {
        return {
          pendingVerification: true,
          fullName,
          email,
          role: 'admin',
          uniqueCode,
        }
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

    await supabase.auth.signInWithPassword({ email, password })
    return {
      pendingVerification: true,
      fullName,
      email,
      role: 'admin',
      uniqueCode,
    }
  }

  return {
    pendingVerification: true,
    fullName,
    email,
    role: 'admin',
    uniqueCode,
  }
}

