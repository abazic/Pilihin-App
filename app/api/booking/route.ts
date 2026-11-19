import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';

const PACKAGES: Record<string, {name:string; price:number}> = {
  solo: {name:'Solo Graduate',price:250000}, duo:{name:'Duo Graduate',price:400000},
  group: {name:'Group Session (3–5 orang)',price:700000}, large:{name:'Large Group (6–10 orang)',price:900000},
  extended:{name:'Extended Group (>10 orang)',price:100000}, video:{name:'Video Package',price:600000},
};
const ADDONS: Record<string,{name:string;price:number}> = {
  extra_hour:{name:'Extra 60 menit',price:100000}, extra_location:{name:'Extra lokasi',price:100000},
  extra_photos:{name:'Extra 10 foto',price:50000}, same_day:{name:'Same Day Edit',price:300000},
};
const digits = (v:string) => v.replace(/\D/g,'');
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name||'').trim();
    const rawWhatsapp = digits(String(body.whatsapp||''));
    const whatsapp = rawWhatsapp.startsWith('0') ? '62'+rawWhatsapp.slice(1) : rawWhatsapp.startsWith('8') ? '62'+rawWhatsapp : rawWhatsapp;
    const date = String(body.date||'');
    const time = String(body.time||'');
    const locations = Array.isArray(body.locations) ? body.locations.map((x:string)=>String(x).trim()).filter(Boolean).slice(0,5) : [];
    const packageKey = String(body.package||'');
    const requestedParticipantsRaw = Number(body.participants||11);
    const requestedParticipants = Number.isFinite(requestedParticipantsRaw) ? Math.max(11,Math.min(100,Math.floor(requestedParticipantsRaw))) : 11;
    const participants = packageKey==='extended' ? requestedParticipants : packageKey==='duo' ? 2 : packageKey==='group' ? 3 : packageKey==='large' ? 6 : 1;
    const notes = String(body.notes||'').trim().slice(0,1000);
    const addonKeys: string[] = Array.isArray(body.addons) ? Array.from(new Set((body.addons as unknown[]).filter((x): x is string => typeof x === 'string' && Object.prototype.hasOwnProperty.call(ADDONS, x)))) : [];
    if(name.length<2 || whatsapp.length<8 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || locations.length===0 || !PACKAGES[packageKey]) return NextResponse.json({error:'Periksa kembali data nama, WhatsApp, jadwal, lokasi, dan paket.'},{status:400});
    const selected = PACKAGES[packageKey];
    const base = packageKey==='extended' ? selected.price*participants : selected.price;
    const addonsPrice = addonKeys.reduce((sum:number,key:string)=>sum+ADDONS[key].price,0);
    const total = base+addonsPrice;
    const bookingCode = 'PF-'+Date.now().toString().slice(-8);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAdminKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseAdminKey) return NextResponse.json({error:'Booking API belum dikonfigurasi. Admin perlu mengatur NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY (atau SUPABASE_SERVICE_ROLE_KEY lama) di environment deployment.'},{status:503});
    const supabase = createSupabaseClient(supabaseUrl, supabaseAdminKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const {error} = await supabase.from('booking_requests').insert({
      booking_code:bookingCode,customer_name:name,whatsapp,session_date:date,session_time:time,
      locations,package_key:packageKey,package_name:selected.name,participants,addons:addonKeys.map((key:string)=>({...ADDONS[key],key})),
      base_price:base,addons_price:addonsPrice,total_price:total,notes,status:'pending'
    });
    if(error) { console.error('Booking insert failed',error); return NextResponse.json({error:'Booking belum dapat disimpan. Coba lagi beberapa saat.'},{status:500}); }
    const {data:waSetting}=await supabase.from('settings').select('value').eq('key','whatsapp_number').maybeSingle();
    const wa=digits(String(waSetting?.value||DEFAULT_WHATSAPP_NUMBER));
    const fmt=(n:number)=>'Rp '+n.toLocaleString('id-ID');
    const message=[`BOOKING REQUEST · ${bookingCode}`,`Nama: ${name}`,`WhatsApp: ${whatsapp}`,`Tanggal: ${date}`,`Jam: ${time}`,`Lokasi: ${locations.join(' | ')}`,`Paket: ${selected.name}`,`Peserta: ${participants}`,`Add-on: ${addonKeys.map((k:string)=>ADDONS[k].name).join(', ')||'-'}`,`Total: ${fmt(total)}`,`Catatan: ${notes||'-'}`,`Status: Menunggu konfirmasi admin`].join('\n');
    return NextResponse.json({bookingCode,total,whatsappUrl:`https://wa.me/${wa}?text=${encodeURIComponent(message)}`});
  } catch { return NextResponse.json({error:'Permintaan tidak valid.'},{status:400}); }
}
