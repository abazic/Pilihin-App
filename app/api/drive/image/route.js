// app/api/drive/image/route.js
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')

  if (!fileId) {
    return new NextResponse('File ID dibutuhkan', { status: 400 })
  }

  try {
    // Mengambil gambar langsung menggunakan Google Drive Direct Thumbnail CDN
    const driveUrl = `https://lh3.googleusercontent.com/d/${fileId}`
    const response = await fetch(driveUrl)

    if (!response.ok) {
      return new NextResponse('Gagal mengambil gambar', { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        // Cache gambar di browser selama 1 hari agar cepat dan tidak boros bandwidth
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
