// Fungsi untuk mengekstrak Folder ID dari Link Google Drive
export function extractFolderId(url) {
  const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const matchId = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (matchId) return matchId[1];
  return url; // Jika user langsung memasukkan ID saja
}

// Fungsi untuk mengambil daftar foto dari Folder Google Drive
export async function getPhotosFromGDrive(folderId) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
  const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id, name, thumbnailLink)&pageSize=1000&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.files) return [];

  // Trik mengubah thumbnailLink menjadi gambar High Quality (=s1000)
  return data.files.map((file) => ({
    id: file.id,
    name: file.name,
    // Mengubah resolusi thumbnail kecil menjadi foto kualitas tinggi
    url: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s1000') : '',
  }));
}
