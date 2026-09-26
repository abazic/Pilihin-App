import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/admin';

  // FIX LOGIKA: Jika arah redirect adalah ke halaman reset-password, 
  // tambahkan parameter type=recovery agar app/reset-password/page.tsx 
  // tidak melempar user ke /pengaturan.
  if (next.startsWith('/reset-password') && !next.includes('type=recovery')) {
    next = next.includes('?') ? `${next}&type=recovery` : `${next}?type=recovery`;
  }

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Jika berhasil, redirect ke path yang sudah diperbaiki
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Jika kode invalid, tidak ada, atau kedaluwarsa
  return NextResponse.redirect(
    `${origin}/login?error=Invalid_atau_link_kedaluwarsa`
  );
}
