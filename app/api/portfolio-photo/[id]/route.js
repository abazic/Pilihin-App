import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getImageDimensions(buffer, contentType) {
  if (contentType.includes('png') && buffer.length >= 24) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }

  return { width: 1200, height: 800 };
}

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(id || '')) {
    return new NextResponse('ID foto tidak valid.', { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    return new NextResponse('Konfigurasi Google Drive belum tersedia.', { status: 503 });
  }

  try {
    const metadataUrl = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`);
    metadataUrl.searchParams.set('fields', 'thumbnailLink');
    metadataUrl.searchParams.set('key', apiKey);

    const metadataResponse = await fetch(metadataUrl, { next: { revalidate: 3600 } });
    if (!metadataResponse.ok) {
      return new NextResponse('Foto tidak tersedia.', { status: metadataResponse.status === 404 ? 404 : 502 });
    }

    const metadata = await metadataResponse.json();
    if (!metadata.thumbnailLink) {
      return new NextResponse('Preview foto tidak tersedia.', { status: 404 });
    }

    const thumbnailUrl = metadata.thumbnailLink.replace(/=s\d+/, '=s1600');
    const imageResponse = await fetch(thumbnailUrl, { next: { revalidate: 3600 } });
    if (!imageResponse.ok) {
      return new NextResponse('Gagal mengambil preview foto.', { status: 502 });
    }

    const contentType = (imageResponse.headers.get('content-type') || 'image/jpeg').split(';')[0].trim().toLowerCase();
    if (!/^image\/(jpeg|jpg|png|webp)$/.test(contentType)) {
      return new NextResponse('Format foto tidak didukung.', { status: 415 });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const { width, height } = getImageDimensions(imageBuffer, contentType);
    const safeWidth = Math.max(1, Math.min(width, 10000));
    const safeHeight = Math.max(1, Math.min(height, 10000));
    const imageData = `data:${contentType};base64,${imageBuffer.toString('base64')}`;

    // The public response displays a repeating watermark over the preview. This deters casual reuse but is not DRM.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">
      <image x="0" y="0" width="${safeWidth}" height="${safeHeight}" preserveAspectRatio="none" xlink:href="${imageData}"/>
      <defs><pattern id="wm" width="420" height="220" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
        <text x="0" y="110" font-family="Arial, sans-serif" font-size="30" font-weight="600" letter-spacing="5" fill="#ffffff" fill-opacity="0.25" stroke="#222222" stroke-opacity="0.12" stroke-width="1">PILIHIN FOTOMU</text>
      </pattern></defs>
      <rect width="100%" height="100%" fill="url(#wm)"/>
    </svg>`;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Portfolio watermark generation failed:', error);
    return new NextResponse('Gagal memproses foto portofolio.', { status: 500 });
  }
}
