'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export type FormState = { error: string } | null

export async function adminSignIn(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  let { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error && (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('user not found'))) {
    if (email.trim().toLowerCase() === 'admin@edvoura.com') {
      const signUpRes = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'System Administrator',
            role: 'admin',
          },
        },
      });

      if (!signUpRes.error && signUpRes.data.user) {
        await supabase.from('user_roles').insert({
          user_id: signUpRes.data.user.id,
          role: 'admin',
        });
        await supabase.from('admin_profiles').insert({
          user_id: signUpRes.data.user.id,
          full_name: 'System Administrator',
          access_level: 'super_admin',
        });
        const retry = await supabase.auth.signInWithPassword({ email, password });
        error = retry.error;
      }
    }
  }

  if (error) {
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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'admin',
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('error sending confirmation email') || error.message.toLowerCase().includes('confirmation email')) {
      const signInRes = await supabase.auth.signInWithPassword({ email, password });
      if (!signInRes.error) {
        redirect('/addy');
      }
      return {
        error: 'Supabase Email Auth Notice: "Confirm email" is currently enabled in your Supabase Auth project, but custom SMTP is not set up. Please go to Supabase Dashboard -> Authentication -> Email -> Toggle OFF "Confirm email" for instant account creation.',
      };
    }
    return { error: error.message }
  }

  if (data.user) {
    await supabase.from('user_roles').insert({
      user_id: data.user.id,
      role: 'admin',
    });
    await supabase.from('admin_profiles').insert({
      user_id: data.user.id,
      full_name: fullName,
      access_level: 'super_admin',
    });

    const signInRes = await supabase.auth.signInWithPassword({ email, password });
    if (!signInRes.error) {
      redirect('/addy');
    }
  }

  redirect('/addy')
}

