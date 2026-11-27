const PRICELIST_API_URL = 'https://script.google.com/macros/s/AKfycbxwoJHhJIOuBbRRtWXRAC86Gj8qyS6QQQ_XIrzNWWUDi-zkeViOFPFX03rUtKbx77PsZQ/exec';

// A Drive share link opens a viewer page, not an image file, so <img> cannot show it.
export function toImageUrl(value) {
  const raw = String(value || '').trim();
  try {
    const url = new URL(raw);
    if (!['drive.google.com', 'docs.google.com'].includes(url.hostname)) return raw;
    const id = url.pathname.match(/\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/)?.[1]
      || url.searchParams.get('id');
    return id && /^[a-zA-Z0-9_-]+$/.test(id) ? `https://lh3.googleusercontent.com/d/${id}=w1600` : raw;
  } catch {
    return raw;
  }
}

export async function getGoogleSheetsPricelist() {
  const response = await fetch(PRICELIST_API_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Google Sheets Pricelist API tidak dapat diakses.');

  const payload = await response.json();
  if (!payload?.success || !Array.isArray(payload.services)) {
    throw new Error(payload?.error || 'Format data pricelist dari Google Sheets tidak valid.');
  }

  return {
    updatedAt: payload.updatedAt || null,
    services: payload.services.map((service, index) => ({
      id: String(service.id || `service-${index + 1}`),
      title: String(service.title || `Service ${index + 1}`),
      description: String(service.description || ''),
      showInService: service.showInService !== false,
      headerImageUrl: toImageUrl(service.headerImageUrl),
      photoPackages: Array.isArray(service.photoPackages) ? service.photoPackages : [],
      videoPackages: Array.isArray(service.videoPackages) ? service.videoPackages : [],
      addons: Array.isArray(service.addons) ? service.addons : [],
    })),
  };
}
