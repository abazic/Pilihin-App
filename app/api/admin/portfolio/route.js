import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractFolderId } from '@/lib/gdrive';

const SETTINGS_KEY = 'portfolio_categories';

async function requireAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Silakan login kembali.' }, { status: 401 }) };
  const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (error || profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 }) };
  }
  return { user };
}

function parseCategories(value) {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const auth = await requireAdmin(supabase);
    if (auth.error) return auth.error;
    const { data, error } = await supabase.from('settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ categories: parseCategories(data?.value) });
  } catch (error) {
    console.error('Portfolio settings read failed:', error);
    return NextResponse.json({ error: 'Gagal membaca pengaturan portofolio.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const auth = await requireAdmin(supabase);
    if (auth.error) return auth.error;

    const body = await request.json();
    if (!Array.isArray(body.categories)) {
      return NextResponse.json({ error: 'Format kategori portofolio tidak valid.' }, { status: 400 });
    }

    const seen = new Set();
    const categories = body.categories.map((item) => {
      const title = String(item.title || '').trim();
      const folderId = extractFolderId(String(item.folderId || ''));
      const slug = String(item.slug || title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).trim();
      if (!title || !folderId || !slug) throw new Error('Setiap kategori wajib memiliki judul dan link folder Google Drive yang valid.');
      if (seen.has(slug)) throw new Error('Judul kategori menghasilkan slug yang sama. Gunakan judul yang berbeda.');
      seen.add(slug);
      return { title, folderId, slug };
    });

    const value = JSON.stringify(categories);
    const { data: existing, error: readError } = await supabase.from('settings').select('key').eq('key', SETTINGS_KEY).maybeSingle();
    if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

    let writeResult;
    if (existing) {
      writeResult = await supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', SETTINGS_KEY);
    } else {
      writeResult = await supabase.from('settings').insert({ key: SETTINGS_KEY, value, updated_at: new Date().toISOString() });
    }
    if (writeResult.error) {
      console.error('Portfolio settings write failed:', writeResult.error);
      return NextResponse.json({ error: 'Supabase menolak penyimpanan: ' + writeResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menyimpan portofolio.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
