import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPhotosFromGDrive, extractFolderId } from '@/lib/gdrive';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const folderId = extractFolderId(new URL(request.url).searchParams.get('folderId'));
    if (!folderId) return NextResponse.json({ error: 'Link atau ID folder Google Drive tidak valid.' }, { status: 400 });

    const photos = await getPhotosFromGDrive(folderId);
    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Portfolio photo fetch failed:', error);
    return NextResponse.json({ error: 'Gagal mengambil foto dari Google Drive.' }, { status: 500 });
  }
}
