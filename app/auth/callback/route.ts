// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  const supabase = await createClient()

  // exchange code → session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(new URL('/login?error=callback', request.url))
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // สร้าง profile ถ้ายังไม่มี
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    await supabase.from('profiles').insert({
      user_id: user.id,
      username: user.email?.split('@')[0] ?? `user_${user.id.slice(0, 8)}`,
    })
  }

  if (next) {
    return NextResponse.redirect(new URL(next, request.url))
  }

  const destination = profile?.username
    ? `/profile/${profile.username}`
    : '/profile/edit'

  return NextResponse.redirect(new URL(destination, request.url))
}