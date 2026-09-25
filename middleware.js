import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function proxy(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { 
          return request.cookies.getAll() 
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isKlienRoute = pathname.startsWith('/klien')

  // 1. AUTHENTICATION: Jika belum login dan mencoba akses rute terproteksi
  if (!user && (isAdminRoute || isKlienRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. AUTHORIZATION: Jika user sudah login dan mencoba akses rute /admin
  if (user && isAdminRoute) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Jika terjadi error, tidak ada data profile, atau role bukan 'admin'
    if (error || profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/klien/:path*'],
}
