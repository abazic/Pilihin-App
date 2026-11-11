import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Silakan login kembali.' }, { status: 401 }) };
  const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (error || profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 }) };
  }
  return { user };
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const auth = await requireAdmin(supabase);
    if (auth.error) return auth.error;

    const body = await request.json();
    const whatsapp = String(body.whatsapp || '').replace(/\D/g, '');
    if (!whatsapp) {
      return NextResponse.json({ error: 'Nomor WhatsApp wajib diisi dengan kode negara.' }, { status: 400 });
    }
    if (!Array.isArray(body.socialLinks)) {
      return NextResponse.json({ error: 'Format social media tidak valid.' }, { status: 400 });
    }

    const socialLinks = body.socialLinks
      .map(item => ({
        platform: String(item.platform || '').trim(),
        url: String(item.url || '').trim(),
      }))
      .filter(item => item.platform && /^https?:\/\//i.test(item.url));

    const now = new Date().toISOString();
    const entries = [
      { key: 'whatsapp_number', value: whatsapp, updated_at: now },
      { key: 'social_media_links', value: JSON.stringify(socialLinks), updated_at: now },
    ];

    for (const entry of entries) {
      const { data: existing, error: readError } = await supabase
        .from('settings')
        .select('id')
        .eq('key', entry.key)
        .limit(1)
        .maybeSingle();
      if (readError) {
        console.error('Contact settings read failed:', readError);
        return NextResponse.json({ error: 'Gagal membaca pengaturan: ' + readError.message }, { status: 500 });
      }

      const result = existing
        ? await supabase.from('settings').update({ value: entry.value, updated_at: now }).eq('key', entry.key)
        : await supabase.from('settings').insert(entry);
      if (result.error) {
        console.error('Contact settings write failed:', result.error);
        return NextResponse.json({ error: 'Supabase menolak penyimpanan: ' + result.error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, whatsapp, socialLinks });
  } catch (error) {
    console.error('Contact settings save failed:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server saat menyimpan contact.' }, { status: 500 });
  }
}
