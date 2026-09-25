import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Param 'next' akan berisi '/reset-password' seperti yang kita set di redirectTo
  const next = searchParams.get('next') ?? '/admin'; 

  if (code) {
    const cookieStore = cookies();
    
    // Inisialisasi Supabase Server Client
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

    // Tukar kode dengan session pemulihan
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Jika berhasil, redirect ke /reset-password
      // User sudah memiliki session saat masuk ke halaman ini
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Jika kode invalid, tidak ada, atau kedaluwarsa, kembalikan ke login dengan pesan error
  return NextResponse.redirect(`${origin}/login?error=Invalid_atau_link_kedaluwarsa`);
}
