import { NextResponse } from 'next/server';
import { extractFolderId, getPhotosPageFromGDrive } from '@/lib/gdrive';

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const folderId = extractFolderId(params.get('folderId'));
  if (!folderId) {
    return NextResponse.json({ error: 'Folder ID tidak valid.' }, { status: 400 });
  }

  const pageSize = Math.min(20, Math.max(1, Number(params.get('pageSize')) || 20));
  const pageToken = params.get('pageToken') || undefined;
  const result = await getPhotosPageFromGDrive(folderId, { pageSize, pageToken, imageSize: 500 });

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
