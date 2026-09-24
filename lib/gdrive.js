// lib/gdrive.js

/**
 * Mengekstrak dan memvalidasi Folder ID dari URL atau String ID Google Drive
 */
export function extractFolderId(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Pattern 1: URL format /folders/FOLDER_ID
  const matchFolder = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolder) return matchFolder[1];

  // Pattern 2: URL format ?id=FOLDER_ID
  const matchId = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (matchId) return matchId[1];

  // Pattern 3: Memastikan string mentah hanya berisi karakter ID khas Google Drive
  const isValidId = /^[a-zA-Z0-9_-]+$/.test(trimmed);
  return isValidId ? trimmed : null;
}

/**
 * Mengambil daftar foto dari Google Drive (HANYA BERJALAN DI SERVER-SIDE)
 */
export async function getPhotosFromGDrive(folderId) {
  // Mengambil API Key dari server environment (Private)
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  if (!apiKey) {
    console.error('Error: GOOGLE_DRIVE_API_KEY tidak ditemukan di environment variable server.');
    return [];
  }

  // Sanitasi folderId untuk mencegah Query Injection
  const cleanFolderId = extractFolderId(folderId);
  if (!cleanFolderId) {
    console.error('Error: Folder ID Google Drive tidak valid.');
    return [];
  }

  try {
    const query = `'${cleanFolderId}' in parents and mimeType contains 'image/' and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&fields=files(id, name, thumbnailLink)&pageSize=1000&key=${apiKey}`;

    // Memanfaatkan Fetch Caching bawaan Next.js (revalidate per 1 jam)
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`Google Drive API Error [${response.status}]:`, response.statusText);
      return [];
    }

    const data = await response.json();
    if (!data.files) return [];

    return data.files.map((file) => ({
      id: file.id,
      name: file.name,
      // Mengubah resolusi thumbnail kecil menjadi gambar HQ (=s1000)
      url: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s1000') : '',
    }));
  } catch (error) {
    console.error('Gagal mengambil foto dari Google Drive:', error);
    return [];
  }
}
