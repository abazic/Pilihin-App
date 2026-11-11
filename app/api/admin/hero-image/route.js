import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SETTINGS_KEY = 'homepage_hero_image';

async function requireAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Silakan login kembali.' }, { status: 401 }) };
  const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (error || profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const auth = await requireAdmin(supabase);
    if (auth.error) return auth.error;
    const { data, error } = await supabase.from('settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ url: data?.value || '' });
  } catch (error) {
    console.error('Hero image settings read failed:', error);
    return NextResponse.json({ error: 'Gagal membaca pengaturan foto utama.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const auth = await requireAdmin(supabase);
    if (auth.error) return auth.error;

    const body = await request.json();
    const url = String(body.url || '').trim();
    let parsed;
    try { parsed = new URL(url); } catch { parsed = null; }
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'URL gambar harus menggunakan http atau https.' }, { status: 400 });
    }

    const { data: existing, error: readError } = await supabase.from('settings').select('key').eq('key', SETTINGS_KEY).maybeSingle();
    if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

    const writeResult = existing
      ? await supabase.from('settings').update({ value: url, updated_at: new Date().toISOString() }).eq('key', SETTINGS_KEY)
      : await supabase.from('settings').insert({ key: SETTINGS_KEY, value: url, updated_at: new Date().toISOString() });
    if (writeResult.error) {
      console.error('Hero image settings write failed:', writeResult.error);
      return NextResponse.json({ error: 'Supabase menolak penyimpanan: ' + writeResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Hero image settings write failed:', error);
    return NextResponse.json({ error: 'Gagal menyimpan foto utama.' }, { status: 500 });
  }
}
