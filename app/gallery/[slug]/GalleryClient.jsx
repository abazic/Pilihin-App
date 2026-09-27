// Gallery/[slug]/GalleryClient.jsx
'use client';

import { useState } from 'react';
import { Check, MessageCircle, Loader2 } from 'lucide-react';

export default function GalleryClient({ galleryData, initialPhotos }) {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [saving, setSaving] = useState(false);

  const maxPhotos = galleryData?.max_photos ?? initialPhotos.length;
  const isLimitReached = selectedPhotos.length >= maxPhotos;

  const togglePhoto = (name) => {
    setSelectedPhotos((prev) => {
      if (prev.includes(name)) {
        return prev.filter((p) => p !== name);
      }
      if (prev.length >= maxPhotos) {
        return prev; // sudah mencapai batas, abaikan klik
      }
      return [...prev, name];
    });
  };

  const saveSelection = async () => {
    if (selectedPhotos.length === 0) return;

    setSaving(true);
    try {
      const response = await fetch('/api/gallery/selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: galleryData?.slug, selectedPhotos }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(`Gagal: ${data.error}`);
        return;
      }
      alert('Berhasil: ' + data.message);
    } catch (error) {
      console.error('Error saving selection:', error);
      alert('Terjadi kesalahan jaringan, coba lagi nanti.');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = galleryData?.event_date
    ? new Date(galleryData.event_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col gap-1">
          <h1 className="text-xl font-medium text-gray-900">
            {galleryData?.client_name ?? 'Galeri Foto'}
          </h1>
          {formattedDate && (
            <p className="text-sm text-gray-500">{formattedDate}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Pilih foto favoritmu, maksimal {maxPhotos} foto.
          </p>
        </div>
      </div>

      {/* Grid Foto */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {initialPhotos?.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">
            Belum ada foto di galeri ini.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {initialPhotos?.map((p) => {
              const isSelected = selectedPhotos.includes(p.name);
              const isDisabled = !isSelected && isLimitReached;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePhoto(p.name)}
                  disabled={isDisabled}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    isSelected
                      ? 'border-[#2a2a2a] ring-2 ring-offset-2 ring-[#2a2a2a]'
                      : 'border-transparent'
                  } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'}`}
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-6 h-6 bg-[#2a2a2a] rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Bar: Counter + Simpan + WhatsApp */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {selectedPhotos.length}
            </span>{' '}
            / {maxPhotos} dipilih
          </div>

          <div className="flex items-center gap-2">
                        {galleryData?.admin_whatsapp && (
              
                href={`https://wa.me/${galleryData.admin_whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">Hubungi Admin</span>
              </a>
            )}

            <button
              onClick={saveSelection}
              disabled={selectedPhotos.length === 0 || saving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2a2a2a] hover:bg-black text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Simpan Pilihan'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
