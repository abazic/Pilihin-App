import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncBookingsToGoogleSheets } from '@/lib/google-sheets';
async function adminClient() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return {supabase,user:null};
  const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();
  return {supabase,user:profile?.role==='admin'?user:null};
}
export async function GET(){
  const {supabase,user}=await adminClient();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {data,error}=await supabase.from('booking_requests').select('*').order('created_at',{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({bookings:data||[]});
}
export async function POST(){
  const {supabase,user}=await adminClient();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {data,error}=await supabase.from('booking_requests').select('*').order('created_at',{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  try {
    const result=await syncBookingsToGoogleSheets((data||[]).map((booking:any)=>({
      booking_code:booking.booking_code, created_at:booking.created_at,
      customer_name:booking.customer_name, whatsapp:booking.whatsapp,
      session_date:booking.session_date, session_time:booking.session_time,
      package_name:booking.package_name, participants:booking.participants,
      locations:booking.locations, addons:booking.addons, moodboard_links:(booking.notes||'').match(/https?:\/\/[^\\s]+/g)||[], notes:booking.notes,
      total_price:booking.total_price, status:booking.status, admin_notes:booking.admin_notes
    })));
    if(!result.configured) return NextResponse.json({error:'Google Sheets belum dikonfigurasi. Atur GOOGLE_SHEETS_WEBHOOK_URL dan GOOGLE_SHEETS_SYNC_TOKEN di Vercel.'},{status:503});
    return NextResponse.json({success:true,synced:(data||[]).length});
  } catch(error) {
    return NextResponse.json({error:error instanceof Error?error.message:'Google Sheets sync gagal.'},{status:502});
  }
}
export async function PATCH(request:Request){
  const {supabase,user}=await adminClient();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json();
  const id=String(body.id||'');
  const status=String(body.status||'');
  const adminNotes=String(body.admin_notes||'').slice(0,1000);
  if(!id || !['pending','confirmed','rejected','completed'].includes(status)) return NextResponse.json({error:'Data tidak valid.'},{status:400});
  const {error}=await supabase.from('booking_requests').update({status,admin_notes:adminNotes,updated_at:new Date().toISOString()}).eq('id',id);
  if(error) return NextResponse.json({error:error.message},{status:500});
  const {data:updated}=await supabase.from('booking_requests').select('*').eq('id',id).maybeSingle();
  if(updated) {
    try {
      await syncBookingsToGoogleSheets([{
        booking_code:updated.booking_code, created_at:updated.created_at,
        customer_name:updated.customer_name, whatsapp:updated.whatsapp,
        session_date:updated.session_date, session_time:updated.session_time,
        package_name:updated.package_name, participants:updated.participants,
        locations:updated.locations, addons:updated.addons, moodboard_links:(updated.notes||'').match(/https?:\/\/[^\\s]+/g)||[], notes:updated.notes,
        total_price:updated.total_price, status:updated.status, admin_notes:updated.admin_notes
      }]);
    } catch(syncError) { console.error('Google Sheets status sync failed',syncError); }
  }
  return NextResponse.json({success:true});
}

export async function DELETE(request:Request){
  const {supabase,user}=await adminClient();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  let body:any;
  try { body=await request.json(); } catch { return NextResponse.json({error:'Request tidak valid.'},{status:400}); }
  const id=String(body.id||'');
  if(!id) return NextResponse.json({error:'ID booking wajib diisi.'},{status:400});
  const {error}=await supabase.from('booking_requests').delete().eq('id',id);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({success:true});
}
