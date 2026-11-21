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
  addons: [{ name: 'Extra 60 menit', price: '+Rp 100K' }, { name: 'Extra lokasi', price: '+Rp 100K' }, { name: 'Extra 10 foto edited', price: '+Rp 50K' }, { name: 'Same Day Edit', price: '+Rp 300K' }, { name: 'Family >5 orang', price: '+Rp 50K/orang' }],
  video: { name: 'Shoot & Edit', price: 'Rp 600K', duration: '', description: 'Video dokumentasi graduation' },
  whatsappMessage: 'Halo kak, bisa booking foto graduation?',
  services: [
    { id: 'photo-packages', title: 'Photo Packages', description: 'Pilihan paket fotografi yang tersedia.', showInService: true, items: [
      { name: 'Solo Graduate', price: 'Rp 250K', detail: '1 Graduate', duration: '1 jam', locations: '1 lokasi', photos: '20 foto edited', extras: 'Unlimited shots' },
      { name: 'Duo Graduate', price: 'Rp 400K', detail: '2 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '30 foto edited', extras: 'Unlimited shots' },
      { name: 'Group Session', price: 'Rp 700K', detail: '3–5 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '60 foto edited', extras: 'Unlimited shots' },
      { name: 'Large Group', price: 'Rp 900K', detail: '6–10 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '100 foto edited', extras: 'Unlimited shots' },
      { name: 'Extended Group', price: 'Rp 100K/person', detail: '>10 Graduates', duration: '3–4 jam', locations: '1 lokasi', photos: '100 foto edited', extras: 'Unlimited shots' },
    ] },
    { id: 'video', title: 'Video Package', description: 'Layanan dokumentasi video.', showInService: true, items: [{ name: 'Shoot & Edit', price: 'Rp 600K', detail: 'Video dokumentasi graduation' }] },
    { id: 'addons', title: 'Add-ons', description: 'Layanan tambahan untuk melengkapi sesi foto.', showInService: true, items: [
      { name: 'Extra 60 menit', price: '+Rp 100K' }, { name: 'Extra lokasi', price: '+Rp 100K' }, { name: 'Extra 10 foto edited', price: '+Rp 50K' }, { name: 'Same Day Edit', price: '+Rp 300K' }, { name: 'Family >5 orang', price: '+Rp 50K/orang' },
    ] },
  ],};

function normalizePricelist(value) {
  let parsed = {};
  try { parsed = typeof value === 'string' ? JSON.parse(value) : (value || {}); } catch {}
  const oldServices = Array.isArray(parsed.services) ? parsed.services : [];
  const alreadyNested = oldServices.some(s => Array.isArray(s?.photoPackages) || Array.isArray(s?.videoPackages));
  let services = oldServices;
  if (!alreadyNested) {
    const label = s => String((s && s.id) || '') + ' ' + String((s && s.title) || '');
    const oldPhoto = oldServices.find(s => /photo|package/i.test(label(s)) && !/video/i.test(label(s)));
    const oldVideo = oldServices.find(s => /video/i.test(label(s)));
    const oldAddons = oldServices.find(s => /addon/i.test(label(s)));
    services = [{
      id: 'graduation', title: 'Graduation Photography',
      description: 'Sesi foto dan video untuk merayakan kelulusan.', showInService: true,
      photoPackages: (oldPhoto && oldPhoto.items) || parsed.packages || [{"name":"Solo Graduate","price":"Rp 250K","detail":"1 Graduate","duration":"1 jam","locations":"1 lokasi","photos":"20 foto edited","extras":"Unlimited shots"},{"name":"Duo Graduate","price":"Rp 400K","detail":"2 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"30 foto edited","extras":"Unlimited shots"},{"name":"Group Session","price":"Rp 700K","detail":"3–5 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"60 foto edited","extras":"Unlimited shots"},{"name":"Large Group","price":"Rp 900K","detail":"6–10 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"100 foto edited","extras":"Unlimited shots"},{"name":"Extended Group","price":"Rp 100K/person","detail":">10 Graduates","duration":"3–4 jam","locations":"1 lokasi","photos":"100 foto edited","extras":"Unlimited shots"}],
      videoPackages: (oldVideo && oldVideo.items) || (parsed.video && parsed.video.name ? [{name:parsed.video.name,price:parsed.video.price,detail:parsed.video.description,duration:parsed.video.duration}] : [{"name":"Shoot & Edit","price":"Rp 600K","detail":"Video dokumentasi graduation"}]),
      addons: (oldAddons && oldAddons.items) || parsed.addons || [{"name":"Extra 60 menit","price":"+Rp 100K"},{"name":"Extra lokasi","price":"+Rp 100K"},{"name":"Extra 10 foto edited","price":"+Rp 50K"},{"name":"Same Day Edit","price":"+Rp 300K"},{"name":"Family >5 orang","price":"+Rp 50K/orang"}]
    },
    { id: 'wedding-events', title: 'Wedding & Events', description: 'Dokumentasi foto dan video untuk pernikahan serta berbagai acara.', showInService: true, photoPackages: [], videoPackages: [], addons: [] },
    { id: 'personal-projects', title: 'Personal Projects', description: 'Sesi fotografi dan videografi untuk kebutuhan personal maupun kreatif.', showInService: true, photoPackages: [], videoPackages: [], addons: [] }
  ];
  }
  return { ...parsed, services: services.map((service, index) => ({
    id: String((service && service.id) || 'service-' + index),
    title: String((service && service.title) || 'Service ' + (index + 1)),
    description: String((service && service.description) || ''),
    showInService: !service || service.showInService !== false,
    photoPackages: Array.isArray(service && service.photoPackages) ? service.photoPackages : (Array.isArray(service && service.items) ? service.items : []),
    videoPackages: Array.isArray(service && service.videoPackages) ? service.videoPackages : [],
    addons: Array.isArray(service && service.addons) ? service.addons : []
  })) };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
    if (error) return NextResponse.json({ error: 'Gagal membaca pricelist.' }, { status: 500 });
    return NextResponse.json({ pricelist: normalizePricelist(data?.value) });
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
    if (!body.pricelist || !Array.isArray(body.pricelist.services)) {
      return NextResponse.json({ error: 'Format pricelist tidak valid.' }, { status: 400 });
    }
    const normalized = normalizePricelist(body.pricelist);
    const value = JSON.stringify(normalized);
    const { data: existing, error: readError } = await supabase.from('settings').select('key').eq('key', SETTINGS_KEY).maybeSingle();
    if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });
    const result = existing
      ? await supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', SETTINGS_KEY)
      : await supabase.from('settings').insert({ key: SETTINGS_KEY, value, updated_at: new Date().toISOString() });
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ success: true, pricelist: normalized });
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan pricelist.' }, { status: 500 });
  }
}
