// Gallery/[slug]/GalleryClient.jsx
'use client';

import { useState } from 'react';
import { Search, HelpCircle, User, Check, Camera, CheckCircle, Send } from 'lucide-react';

export default function GalleryClient({ galleryData, initialPhotos }) {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const maxPhotos = galleryData?.max_photos ?? initialPhotos.length;
  const isLimitReached = selectedPhotos.length >= maxPhotos;

  const toggleSelectPhoto = (photo) => {
    setSelectedPhotos((prev) => {
      const already = prev.some((p) => p.name === photo.name);
      if (already) return prev.filter((p) => p.name !== photo.name);
      if (prev.length >= maxPhotos) return prev;
      return [...prev, { name: photo.name, url: photo.url }];
    });
  };

  const handleSendToWhatsApp = async () => {
    if (selectedPhotos.length === 0) return;
    setSaving(true);

    try {
      const namesToSave = selectedPhotos.map((p) => p.name);
      const response = await fetch('/api/gallery/selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: galleryData?.slug, selectedPhotos: namesToSave }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(`Gagal menyimpan pilihan: ${data.error}`);
        return;
      }

      const photoListText = selectedPhotos
        .map((p, i) => `${i + 1}. ${p.name}`)
        .join('\n');

      const message =
`Halo Admin, saya telah selesai memilih foto.

*Detail Klien:* ${galleryData?.client_name || 'Klien'}
*Total Foto Terpilih:* ${selectedPhotos.length} Foto

*Daftar Nama Foto:*
${photoListText}

Mohon diproses untuk tahap selanjutnya. Terima kasih!`;

      if (galleryData?.admin_whatsapp) {
        const waUrl = `https://wa.me/${galleryData.admin_whatsapp}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      }
    } catch (error) {
      console.error('Error saving selection:', error);
      alert('Terjadi kesalahan jaringan, coba lagi nanti.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPhotos = initialPhotos.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-gray-800 pb-28">
      {/* Header */}
      <header className="bg-[#f7f7f7] border-b border-gray-200 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-2xl font-bold tracking-tight">Pilihin Fotomu</span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-gray-400 font-semibold border-l border-gray-300 pl-2 ml-2">
            by Abazic
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-600">
          <button className="hidden sm:flex items-center gap-1 hover:text-gray-900">
            <HelpCircle size={16} /> Bantuan
          </button>
          <button className="hover:text-gray-900">
            <User size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-8 mt-8">
        {/* Intro */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
            {galleryData?.client_name ?? 'Galeri Foto'}
          </p>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Pilih Foto Favoritmu</h1>
          <p className="text-gray-500 leading-relaxed text-sm">
            Tandai foto yang ingin kamu pilih, maksimal <strong>{maxPhotos}</strong> foto. Setelah selesai, klik tombol kirim di bawah.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full mb-6">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama foto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Grid Foto */}
        {filteredPhotos.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">
            {initialPhotos.length === 0 ? 'Belum ada foto di galeri ini.' : 'Tidak ada foto yang cocok dengan pencarian.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => {
              const isSelected = selectedPhotos.some((p) => p.name === photo.name);
              const isDisabled = !isSelected && isLimitReached;

              return (
                <div
                  key={photo.id}
                  onClick={() => !isDisabled && toggleSelectPhoto(photo)}
                  className={`relative group aspect-square rounded-xl overflow-hidden ${
                    isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />

                  <div className="absolute top-3 left-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-white/70 group-hover:border-white'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <p className="text-white text-xs font-medium tracking-wide">
                      {photo.name.replace(/\.[^/.]+$/, '')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Camera size={16} className="text-gray-400" />
              {initialPhotos.length} foto
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={16} className="text-gray-400" />
              <span className="font-medium text-gray-900">{selectedPhotos.length}</span> / {maxPhotos} dipilih
            </div>
          </div>

          <button
            onClick={handleSendToWhatsApp}
            disabled={saving || selectedPhotos.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send size={16} />
            {saving ? 'Menyimpan...' : 'Kirim ke WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
}
