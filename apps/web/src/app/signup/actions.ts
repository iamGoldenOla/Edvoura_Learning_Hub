'use server'

import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { type FormState } from '../login/actions'

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

export async function signup(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string
    const learnerBand = formData.get('learnerBand') as string
    const selectedGrade = formData.get('selectedGrade') as string
    const childrenCount = formData.get('childrenCount') as string
    const childName = formData.get('childName') as string
    const childGrade = formData.get('childGrade') as string
    const parentChildrenJson = formData.get('parentChildrenJson') as string
    const parentExistingChildEmailsJson = formData.get('parentExistingChildEmailsJson') as string
    const tutorType = formData.get('tutorType') as string | null
    const tutorGrade = formData.get('tutorGrade') as string | null
    const tutorSubjects = formData.get('tutorSubjects') as string | null
    const redirectTo = formData.get('redirectTo') as string | null

    if (!email || !password) {
      return { error: 'Email and password are required' }
    }

    if (!role) {
      return { error: 'Please select a role' }
    }

    const parsedGrade = Number.parseInt(selectedGrade, 10)
    const gradeLevelCode =
      Number.isFinite(parsedGrade) && parsedGrade >= 1 && parsedGrade <= 12
        ? `grade_${parsedGrade}`
        : null

    const inferredLearnerBand =
      parsedGrade >= 1 && parsedGrade <= 3
        ? '1-3'
        : parsedGrade >= 4 && parsedGrade <= 6
          ? '4-6'
          : parsedGrade >= 7 && parsedGrade <= 12
            ? '7-12'
            : learnerBand || null

    const parsedChildGrade = Number.parseInt(childGrade, 10)
    const childGradeLevelCode =
      Number.isFinite(parsedChildGrade) && parsedChildGrade >= 1 && parsedChildGrade <= 12
        ? `grade_${parsedChildGrade}`
        : null
    const childGradeBand =
      parsedChildGrade >= 1 && parsedChildGrade <= 3
        ? '1-3'
        : parsedChildGrade >= 4 && parsedChildGrade <= 6
          ? '4-6'
          : parsedChildGrade >= 7 && parsedChildGrade <= 12
            ? '7-12'
            : null

    let parentChildren: Array<{ fullName: string; grade: number | null; email: string | null }> = []
    if (parentChildrenJson) {
      try {
        const parsed = JSON.parse(parentChildrenJson)
        if (Array.isArray(parsed)) {
          parentChildren = parsed
            .slice(0, 4)
            .map((entry) => {
              const fullName = typeof entry?.fullName === 'string' ? entry.fullName.trim() : ''
              const numericGrade = Number.parseInt(typeof entry?.grade === 'string' ? entry.grade : '', 10)
              const emailValue = typeof entry?.email === 'string' ? entry.email.trim().toLowerCase() : ''
              return {
                fullName,
                grade: Number.isFinite(numericGrade) && numericGrade >= 1 && numericGrade <= 12 ? numericGrade : null,
                email: emailValue || null,
              }
            })
            .filter((entry) => entry.fullName.length > 0 || entry.email)
        }
      } catch {
        parentChildren = []
      }
    }

    let parentExistingChildEmails: string[] = []
    if (parentExistingChildEmailsJson) {
      try {
        const parsed = JSON.parse(parentExistingChildEmailsJson)
        if (Array.isArray(parsed)) {
          parentExistingChildEmails = parsed
            .map((value) => (typeof value === 'string' ? value.trim().toLowerCase() : ''))
            .filter((value) => value.length > 0)
            .slice(0, 4)
        }
      } catch {
        parentExistingChildEmails = []
      }
    }

    const uniqueCode = generateGuaranteedUniqueCode(fullName, role)
    const userMetadata = {
      full_name: fullName,
      role: role,
      unique_code: uniqueCode,
      learner_band: inferredLearnerBand,
      selected_grade: Number.isFinite(parsedGrade) ? parsedGrade : null,
      grade_level_code: gradeLevelCode,
      parent_children_count: role === 'parent' ? childrenCount || null : null,
      parent_child_name: role === 'parent' ? childName || null : null,
      parent_child_grade: role === 'parent' && Number.isFinite(parsedChildGrade) ? parsedChildGrade : null,
      parent_child_grade_level_code: role === 'parent' ? childGradeLevelCode : null,
      parent_child_grade_band: role === 'parent' ? childGradeBand : null,
      parent_children: role === 'parent' ? parentChildren : null,
      parent_existing_child_emails: role === 'parent' ? parentExistingChildEmails : null,
      tutor_type: role === 'tutor' ? tutorType || 'class_teacher' : null,
      tutor_grade: role === 'tutor' ? tutorGrade || 'grade_1' : null,
      tutor_subjects: role === 'tutor' ? tutorSubjects || 'Mathematics' : null,
    }

    const targetRedirect = redirectTo && redirectTo.startsWith('/') 
      ? redirectTo 
      : (role === 'parent' ? '/dash/parent' : role === 'tutor' ? '/dash/tutor' : '/dash/student')

    const adminClient = getAdminClient()
    if (adminClient) {
      const { data: adminUserData, error: adminCreateErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userMetadata,
      })

      if (!adminCreateErr && adminUserData?.user) {
        await supabase.auth.signInWithPassword({ email, password })
        return {
          pendingVerification: true,
          fullName,
          email,
          role,
          uniqueCode,
          redirectTo: targetRedirect,
        }
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
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
            role,
            uniqueCode,
            redirectTo: targetRedirect,
          }
        }
      }
      return { error: error.message }
    }

    await supabase.auth.signInWithPassword({ email, password })

    return {
      pendingVerification: true,
      fullName,
      email,
      role,
      uniqueCode,
      redirectTo: targetRedirect,
    }
  } catch (err: any) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('Signup action error:', err)
    return {
      error: err?.message || 'Authentication service is currently unavailable. Please verify your Supabase environment variables on Vercel.',
    }
  }
}
