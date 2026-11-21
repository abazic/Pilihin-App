import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SETTINGS_KEY = 'pricelist_content';

const DEFAULT_PRICELIST = {
  title: 'Graduation Photoshoot 2026',
  subtitle: 'Rayakan perjalanan panjangmu lewat foto yang layak untuk dikenang.',
  packages: [
    { name: 'Solo Graduate', price: 'Rp 250K', detail: '1 Graduate', duration: '1 jam', locations: '1 lokasi', photos: '20 foto edited', extras: 'Unlimited shots' },
    { name: 'Duo Graduate', price: 'Rp 400K', detail: '2 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '30 foto edited', extras: 'Unlimited shots' },
    { name: 'Group Session', price: 'Rp 700K', detail: '3–5 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '60 foto edited', extras: 'Unlimited shots' },
    { name: 'Large Group', price: 'Rp 900K', detail: '6–10 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '100 foto edited', extras: 'Unlimited shots' },
    { name: 'Extended Group', price: 'Rp 100K/person', detail: '>10 Graduates', duration: '3–4 jam', locations: '1 lokasi', photos: '100 foto edited', extras: 'Unlimited shots' },
  ],
  addons: [
    { name: 'Extra 60 menit', price: '+Rp 100K' },
    { name: 'Extra lokasi', price: '+Rp 100K' },
    { name: 'Extra 10 foto edited', price: '+Rp 50K' },
    { name: 'Same Day Edit', price: '+Rp 300K' },
    { name: 'Family >5 orang', price: '+Rp 50K/orang' },
  ],
  video: { name: 'Shoot & Edit', price: 'Rp 600K', duration: '', description: 'Video dokumentasi graduation' },
  whatsappMessage: 'Halo kak, bisa booking foto graduation?',
  serviceSections: {
    packages: { title: 'Photo Packages', description: 'Pilihan paket fotografi yang tersedia.', showInService: true },
    video: { title: 'Video Package', description: 'Layanan dokumentasi video.', showInService: true },
    addons: { title: 'Add-ons', description: 'Layanan tambahan untuk melengkapi sesi foto.', showInService: true },
  },
};

function parseValue(value) {
  if (!value) return DEFAULT_PRICELIST;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return { ...DEFAULT_PRICELIST, ...parsed, serviceSections: { ...DEFAULT_PRICELIST.serviceSections, ...(parsed.serviceSections || {}) } };
  } catch {
    return DEFAULT_PRICELIST;
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
    if (error) return NextResponse.json({ error: 'Gagal membaca pricelist.' }, { status: 500 });
    return NextResponse.json({ pricelist: parseValue(data?.value) });
  } catch {
    return NextResponse.json({ error: 'Gagal membaca pricelist.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Silakan login kembali.' }, { status: 401 });
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profileError || profile?.role !== 'admin') return NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 });

    const body = await request.json();
    if (!body.pricelist || !Array.isArray(body.pricelist.packages) || !Array.isArray(body.pricelist.addons)) {
      return NextResponse.json({ error: 'Format pricelist tidak valid.' }, { status: 400 });
    }
    const value = JSON.stringify(body.pricelist);
    const { data: existing, error: readError } = await supabase.from('settings').select('key').eq('key', SETTINGS_KEY).maybeSingle();
    if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });
    const result = existing
      ? await supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', SETTINGS_KEY)
      : await supabase.from('settings').insert({ key: SETTINGS_KEY, value, updated_at: new Date().toISOString() });
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ success: true, pricelist: body.pricelist });
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan pricelist.' }, { status: 500 });
  }
}
