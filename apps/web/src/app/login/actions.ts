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

    let { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error && (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('user not found'))) {
      // Auto-provision default demo accounts if needed for instant testing
      const isDefaultDemo = ['admin@edvoura.com', 'parent@edvoura.com', 'tutor@edvoura.com', 'student@edvoura.com'].includes(email);
      if (isDefaultDemo) {
        const role = email.split('@')[0];
        const roleName = role === 'admin' ? 'admin' : role === 'parent' ? 'parent' : role === 'tutor' ? 'tutor' : 'student';
        const fullName = role === 'admin' ? 'System Administrator' : role === 'parent' ? 'Mr. Jedidiah' : role === 'tutor' ? 'Dr. Adebayo' : 'James Jedidiahz';

        const signUpRes = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: roleName,
            }
          }
        });

        if (!signUpRes.error && signUpRes.data.user) {
          // Insert into user_roles if needed
          await supabase.from('user_roles').insert({
            user_id: signUpRes.data.user.id,
            role: roleName,
          });

          if (roleName === 'admin') {
            await supabase.from('admin_profiles').insert({
              user_id: signUpRes.data.user.id,
              full_name: fullName,
              access_level: 'super_admin',
            });
          } else if (roleName === 'parent') {
            await supabase.from('parent_profiles').insert({
              user_id: signUpRes.data.user.id,
              full_name: fullName,
            });
          }

          // Retry login
          const retry = await supabase.auth.signInWithPassword({ email, password });
          error = retry.error;
        }
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
