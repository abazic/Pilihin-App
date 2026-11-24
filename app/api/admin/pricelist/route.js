import { NextResponse } from 'next/server';
import { getGoogleSheetsPricelist } from '@/lib/google-sheets-pricelist';

export async function GET() {
  try {
    const source = await getGoogleSheetsPricelist();
    return NextResponse.json({
      pricelist: {
        title: 'Pricelist',
        subtitle: 'Harga dan layanan diperbarui melalui Google Sheets.',
        services: source.services,
        updatedAt: source.updatedAt,
      },
      source: 'google-sheets',
      readOnly: true,
    });
  } catch (error) {
    console.error('Gagal membaca Google Sheets pricelist:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal membaca pricelist dari Google Sheets.' },
      { status: 502 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Pricelist bersifat read-only. Ubah data langsung melalui Google Sheets.' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}
