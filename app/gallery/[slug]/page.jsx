'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getPhotosFromGDrive } from '@/lib/gdrive';
import { Search, HelpCircle, User, Check, X, Camera, CheckCircle, Clock, Send } from 'lucide-react';

export default function ClientGalleryPage() {
  const { slug } = useParams();
  const [gallery, setGallery] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Masukkan nomor WhatsApp Admin di sini (Gunakan kode negara 62)
  const ADMIN_PHONE_NUMBER = '6281234567890'; 

  const filters = [
    { name: 'Semua', count: photos.length, active: true },
    { name: 'Sendiri', count: 32, active: false },
    { name: 'Bersama', count: 68, active: false },
    { name: 'Detail', count: 20, active: false },
  ];

  useEffect(() => {
    async function loadGalleryData() {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        alert('Galeri tidak ditemukan!');
        setLoading(false);
        return;
      }

      setGallery(data);

      const gdrivePhotos = await getPhotosFromGDrive(data.folder_id);
      setPhotos(gdrivePhotos);

      // Restore foto yang sebelumnya pernah dipilih dari database jika ada
      if (data.selected_photos && data.selected_photos.length > 0) {
        const restored = gdrivePhotos.filter((p) =>
          data.selected_photos.includes(p.name)
        );
        setSelectedPhotos(restored.map((p) => ({ name: p.name, url: p.url })));
      }

      setLoading(false);
    }

    if (slug) loadGalleryData();
  }, [slug]);

  const toggleSelectPhoto = (photoData) => {
    const isAlreadySelected = selectedPhotos.some((p) => p.name === photoData.name);
    if (isAlreadySelected) {
      setSelectedPhotos(selectedPhotos.filter((p) => p.name !== photoData.name));
    } else {
      setSelectedPhotos([...selectedPhotos, { name: photoData.name, url: photoData.url }]);
    }
  };

  const removeSelectedPhoto = (photoName) => {
    setSelectedPhotos(selectedPhotos.filter((p) => p.name !== photoName));
  };

  // Fungsi Kirim Pilihan Langsung ke WhatsApp Admin
  const handleSendToWhatsApp = async () => {
    if (selectedPhotos.length === 0) {
      alert('Pilih minimal 1 foto terlebih dahulu!');
      return;
    }

    setSaving(true);

    // 1. Simpan ke database Supabase terlebih dahulu
    const namesToSave = selectedPhotos.map((p) => p.name);
    const { error } = await supabase
      .from('galleries')
      .update({ selected_photos: namesToSave })
      .eq('slug', slug);

    setSaving(false);

    if (error) {
      alert('Gagal menyimpan pilihan: ' + error.message);
      return;
    }

    // 2. Buat teks WhatsApp
    const photoListText = selectedPhotos
      .map((p, index) => `${index + 1}. ${p.name}`)
      .join('\n');

    const message = 
`Halo Admin, saya telah selesai memilih foto.

*Detail Klien:* ${gallery?.client_name || 'Klien'}
*Total Foto Terpilih:* ${selectedPhotos.length} Foto

*Daftar Nama Foto:*
${photoListText}

Mohon diproses untuk tahap selanjutnya. Terima kasih!`;

    // 3. Buka WhatsApp
    const waUrl = `https://wa.me/${ADMIN_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const filteredPhotos = photos.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <p className="text-gray-500 animate-pulse">Memuat galeri...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-gray-800 pb-12">
      {/* 1. Header Utama */}
      <header className="bg-[#f7f7f7] border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-2xl font-bold tracking-tight">Nyala Karya</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold border-l border-gray-300 pl-2 ml-2">Photo & Video</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 font-medium text-gray-900">
            <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
            Pilih Foto
          </div>
          <span className="text-gray-300 text-xs">▶</span>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="bg-gray-200 text-gray-500 w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
            Kirim WhatsApp
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <button className="flex items-center gap-1 hover:text-gray-900">
            <HelpCircle size={16} /> Bantuan
          </button>
          <button className="hover:text-gray-900">
            <User size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 mt-10">
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">Galeri Foto</p>
          <h1 className="text-4xl font-serif text-gray-900 mb-2">Pilih Foto Favoritmu</h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed">
            Tandai foto yang ingin kamu pilih. Setelah selesai, klik tombol **Kirim ke WhatsApp** di panel sebelah kanan.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* BAGIAN KIRI: Grid Foto */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.name}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filter.active
                        ? 'bg-gray-800 text-white'
                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.name}{' '}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${filter.active ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nomor foto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => {
                const isSelected = selectedPhotos.some((p) => p.name === photo.name);

                return (
                  <div
                    key={photo.id}
                    onClick={() => toggleSelectPhoto(photo)}
                    className="relative group cursor-pointer aspect-square rounded-xl overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
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
          </div>

          {/* BAGIAN KANAN: Sidebar & Tombol Kirim WhatsApp */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="bg-transparent lg:bg-[#f7f7f7] lg:sticky lg:top-24 rounded-2xl flex flex-col gap-6">
              
              {/* Box Foto Terpilih */}
              <div className="bg-[#f0f0f0] p-5 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Foto Terpilih</h3>
                  <span className="text-xs text-gray-500">{selectedPhotos.length} foto</span>
                </div>

                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedPhotos.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">Belum ada foto yang dipilih.</p>
                  ) : (
                    selectedPhotos.map((photo) => (
                      <div key={photo.name} className="flex items-center gap-3">
                        <img src={photo.url} alt={photo.name} className="w-10 h-10 rounded-md object-cover" />
                        <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                          {photo.name.replace(/\.[^/.]+$/, '')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedPhoto(photo.name);
                          }}
                          className="text-gray-400 hover:text-gray-700 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Info & Tombol WhatsApp */}
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-4">Ringkasan</h3>

                <div className="flex flex-col gap-3 mb-6 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Camera size={16} className="text-gray-400" /> Total Foto</div>
                    <span className="font-medium text-gray-900">{photos.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><CheckCircle size={16} className="text-gray-400" /> Terpilih</div>
                    <span className="font-medium text-gray-900">{selectedPhotos.length}</span>
                  </div>
                </div>

                {/* Tombol Kirim WhatsApp */}
                <button
                  onClick={handleSendToWhatsApp}
                  disabled={saving || selectedPhotos.length === 0}
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Send size={16} />
                  {saving ? 'Menyimpan...' : 'Kirim Pilihan ke WhatsApp'}
                </button>
              </div>

            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
