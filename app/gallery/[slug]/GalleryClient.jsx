// Gallery/[slug]/GalleryClient.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, HelpCircle, User, Check, Camera, CheckCircle,
  Send, Maximize2, X, ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function GalleryClient({ galleryData, initialPhotos }) {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewIndex, setPreviewIndex] = useState(null); // index di filteredPhotos

  const maxPhotos = galleryData?.max_photos ?? initialPhotos.length;
  const isLimitReached = selectedPhotos.length >= maxPhotos;

  const filteredPhotos = initialPhotos.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectPhoto = (photo) => {
    setSelectedPhotos((prev) => {
      const already = prev.some((p) => p.name === photo.name);
      if (already) return prev.filter((p) => p.name !== photo.name);
      if (prev.length >= maxPhotos) return prev;
      return [...prev, { name: photo.name, url: photo.url }];
    });
  };

  const closePreview = useCallback(() => setPreviewIndex(null), []);
  const showPrev = useCallback(
    () => setPreviewIndex((i) => (i > 0 ? i - 1 : i)),
    []
  );
  const showNext = useCallback(
    () => setPreviewIndex((i) => (i < filteredPhotos.length - 1 ? i + 1 : i)),
    [filteredPhotos.length]
  );

  // Navigasi keyboard saat lightbox terbuka
  useEffect(() => {
    if (previewIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closePreview();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewIndex, closePreview, showPrev, showNext]);

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

  const previewPhoto = previewIndex !== null ? filteredPhotos[previewIndex] : null;
  const isPreviewSelected =
    previewPhoto && selectedPhotos.some((p) => p.name === previewPhoto.name);

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-gray-800 pb-28">
      {/* Header */}
      <header className="bg-[#f7f7f7] border-b border-gray-200 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-2xl font-bold tracking-tight">Nyala Karya</span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-gray-400 font-semibold border-l border-gray-300 pl-2 ml-2">
            Photo & Video
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
            Tandai foto yang ingin kamu pilih, maksimal <strong>{maxPhotos}</strong> foto.
            Klik ikon perbesar untuk melihat foto lebih detail.
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
            {initialPhotos.length === 0 ? 'Belum ada foto di galeri ini.' : 'Tidak ada foto yang cocok dengan
