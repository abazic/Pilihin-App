import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
  return NextResponse.json({success:true});
}
