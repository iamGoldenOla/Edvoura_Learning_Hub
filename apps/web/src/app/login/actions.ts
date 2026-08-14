'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export type FormState = {
  error?: string;
  pendingVerification?: boolean;
  fullName?: string;
  email?: string;
  role?: string;
  uniqueCode?: string;
  redirectTo?: string;
} | null;

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()
    const password = formData.get('password') as string
    const uniqueCodeInput = ((formData.get('uniqueCode') as string | null) ?? '').trim().toUpperCase()
    const next = formData.get('next') as string | null

    if (!email || !password) {
      return { error: 'Email and password are required' }
    }

    if (!uniqueCodeInput) {
      return { error: 'Unique Security Pass Code is required to sign in. (e.g. EDV-JOHN-20260814-1234 or PAR-MARY-20260814-5678)' }
    }

    let { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error && (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('user not found'))) {
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
              unique_code: uniqueCodeInput,
            }
          }
        });

        if (!signUpRes.error && signUpRes.data.user) {
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

          const retry = await supabase.auth.signInWithPassword({ email, password });
          error = retry.error;
        }
      }
    }

    if (error) {
      return { error: error.message }
    }

    // Mandatory Security Verification Gate
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const assignedCode = (user.user_metadata?.unique_code as string | undefined || '').trim().toUpperCase();
      if (assignedCode && assignedCode !== uniqueCodeInput) {
        await supabase.auth.signOut();
        return { error: 'Invalid Unique Security Pass Code. Authentication failed. Please provide your exact assigned Security Pass Code.' };
      }

      if (!assignedCode) {
        await supabase.auth.updateUser({
          data: { ...user.user_metadata, unique_code: uniqueCodeInput }
        });
      }
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
      error: err?.message || 'Authentication service is currently unavailable.',
    }
  }
}
