const PRICELIST_API_URL = 'https://script.google.com/macros/s/AKfycbxwoJHhJIOuBbRRtWXRAC86Gj8qyS6QQQ_XIrzNWWUDi-zkeViOFPFX03rUtKbx77PsZQ/exec';

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
      headerImageUrl: String(service.headerImageUrl || ''),
      photoPackages: Array.isArray(service.photoPackages) ? service.photoPackages : [],
      videoPackages: Array.isArray(service.videoPackages) ? service.videoPackages : [],
      addons: Array.isArray(service.addons) ? service.addons : [],
    })),
  };
}
