// lib/gdrive.js

/**
 * Extract and validate a Google Drive folder ID from a URL or raw ID.
 */
export function extractFolderId(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  const matchFolder = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolder) return matchFolder[1];

  const matchId = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (matchId) return matchId[1];

  return /^[a-zA-Z0-9_-]+$/.test(trimmed) ? trimmed : null;
}

function toPhoto(file) {
  const source = file.thumbnailLink || '';
  const sizedUrl = (size) => source
    ? (source.match(/=s\d+/) ? source.replace(/=s\d+/, `=s${size}`) : `${source}=s${size}`)
    : '';

  return {
    id: file.id,
    name: file.name,
    url: sizedUrl(500),
    fullUrl: sizedUrl(1080),
    width: file.imageMediaMetadata?.width || null,
    height: file.imageMediaMetadata?.height || null,
  };
}

/**
 * Fetch a single page of images from Drive. The API key remains server-side.
 */
export async function getPhotosPageFromGDrive(folderId, { pageSize = 20, pageToken, imageSize = 500 } = {}) {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    console.error('Google Drive API key is missing.');
    return { photos: [], nextPageToken: null };
  }

  const cleanFolderId = extractFolderId(folderId);
  if (!cleanFolderId) return { photos: [], nextPageToken: null };

  const safePageSize = Math.min(1000, Math.max(1, Number(pageSize) || 20));
  try {
    const query = `'${cleanFolderId}' in parents and mimeType contains 'image/' and trashed = false`;
    const params = new URLSearchParams({
      q: query,
      fields: 'nextPageToken,files(id,name,thumbnailLink,imageMediaMetadata(width,height))',
      pageSize: String(safePageSize),
      key: apiKey,
      orderBy: 'name',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`Google Drive API Error [${response.status}]:`, response.statusText);
      return { photos: [], nextPageToken: null };
    }

    const data = await response.json();
    const photos = (data.files || []).map((file) => {
      const photo = toPhoto(file);
      if (!photo.url) return photo;
      const resize = (url, size) => url.replace(/=s\d+/, `=s${size}`);
      return { ...photo, url: resize(photo.url, imageSize) };
    });

    return { photos, nextPageToken: data.nextPageToken || null };
  } catch (error) {
    console.error('Failed to fetch Google Drive photos:', error);
    return { photos: [], nextPageToken: null };
  }
}

/**
 * True only when the photo is taller than wide as displayed.
 * Square photos and files without dimension metadata are rejected.
 */
export function isPortrait(metadata) {
  const { width, height, rotation = 0 } = metadata || {};
  if (!width || !height) return false;
  // `rotation` counts clockwise quarter turns: an odd value swaps the sides.
  return rotation % 2 === 1 ? width > height : height > width;
}

/**
 * Collect up to `limit` portrait photos from a folder (used by the homepage hero).
 * Scans at most `maxPages` pages of 100 files, ordered by name.
 */
export async function getPortraitPhotosFromGDrive(folderId, { limit = 5, imageSize = 1600, maxPages = 3 } = {}) {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
  const cleanFolderId = extractFolderId(folderId);
  if (!apiKey || !cleanFolderId) return [];

  const photos = [];
  let pageToken;
  try {
    for (let page = 0; page < maxPages; page++) {
      const params = new URLSearchParams({
        q: `'${cleanFolderId}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: 'nextPageToken,files(id,name,thumbnailLink,imageMediaMetadata(width,height,rotation))',
        pageSize: '100',
        key: apiKey,
        orderBy: 'name',
      });
      if (pageToken) params.set('pageToken', pageToken);

      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
        next: { revalidate: 3600 },
      });
      if (!response.ok) {
        console.error(`Google Drive API Error [${response.status}]:`, response.statusText);
        break;
      }

      const data = await response.json();
      for (const file of data.files || []) {
        if (!file.thumbnailLink || !isPortrait(file.imageMediaMetadata)) continue;
        const photo = toPhoto(file);
        photos.push({ ...photo, url: photo.url.replace(/=s\d+/, `=s${imageSize}`) });
        if (photos.length >= limit) return photos;
      }

      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }
  } catch (error) {
    console.error('Failed to fetch Google Drive portrait photos:', error);
  }
  return photos;
}

/**
 * Backwards-compatible helper for existing client galleries and admin tools.
 */
export async function getPhotosFromGDrive(folderId) {
  const { photos } = await getPhotosPageFromGDrive(folderId, { pageSize: 1000, imageSize: 500 });
  return photos.map(({ fullUrl, ...photo }) => photo);
}
