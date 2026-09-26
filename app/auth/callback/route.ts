import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSafeNextPath(next: string | null) {
  if (!next) return '/admin';
  if (!next.startsWith('/') || next.startsWith('//')) {
    return '/admin';
  }
  return next;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = getSafeNextPath(url.searchParams.get('next'));

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // ✅ FIX: Handle PKCE flow (no code param, session dari cookies Supabase)
  if (code) {
    // Explicit code parameter (legacy flow)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error.message);
      return NextResponse.redirect(
        new URL('/login?error=Invalid_atau_link_kedaluwarsa', url.origin)
      );
    }
  } else {
    // ✅ PKCE flow: Session sudah di-set dari Supabase cookies
    // Cek apakah session valid
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('No session after redirect:', sessionError?.message);
      return NextResponse.redirect(
        new URL('/login?error=Invalid_atau_link_kedaluwarsa', url.origin)
      );
    }

    // ✅ Session valid, lanjut ke next page
  }

  // Recovery flow perlu memberi tahu /reset-password
  // bahwa session ini berasal dari password recovery.
  if (next === '/reset-password') {
    return NextResponse.redirect(
      new URL('/reset-password?type=recovery', url.origin)
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
