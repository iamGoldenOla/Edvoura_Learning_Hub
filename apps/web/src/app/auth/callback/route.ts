import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dash'
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const safeNext = next.startsWith('/') ? next : '/dash'

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'email' | 'recovery',
    })

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  // fallback for implicit flow or errors
  return NextResponse.redirect(`${origin}/login?error=Could+not+verify+email.+Please+try+again.`)
}
