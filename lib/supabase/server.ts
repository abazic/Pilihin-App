// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Error ini wajar terjadi jika 'set' dipanggil dari dalam Server Component.
            // Server Component di Next.js hanya bisa membaca (get) cookies, tidak bisa menulis (set).
            // Penulisan cookie biasanya ditangani oleh Middleware atau Server Actions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Sama seperti 'set', 'remove' juga akan memunculkan error 
            // jika dipanggil langsung dari Server Component.
          }
        },
      },
    }
  )
}
