'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getPhotosFromGDrive } from '@/lib/gdrive';
import { 
  Search, 
  Check, 
  X, 
  Camera, 
  CheckCircle, 
  Send, 
  Maximize2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export default function GalleryClient() {
  const { slug } = useParams();
  const [gallery, setGallery] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk Fitur Perbesar / Modal Preview Foto
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Nomor WhatsApp Admin Studio
  const ADMIN_PHONE_NUMBER = '6281234567890';

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

  // Format Tanggal Indonesia
  const formatDateString = (dateStr) => {
    if (!dateStr) return 'Tidak Dibatasi';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Fungsi Pilih / Batal Pilih Foto dengan Proteksi Max Photos
  const toggleSelectPhoto = (photoData) => {
    const isAlreadySelected = selectedPhotos.some((p) => p.name === photoData.name);
    
    if (isAlreadySelected) {
      setSelectedPhotos(selectedPhotos.filter((p) => p.name !== photoData.name));
    } else {
      // Cek apakah ada batasan maksimal foto
      if (gallery?.max_photos && selectedPhotos.length >= Number(gallery.max_photos)) {
        alert(`Batas maksimal pemilihan foto adalah ${gallery.max_photos} foto.`);
        return;
      }
      setSelectedPhotos([...selectedPhotos, { name: photoData.name, url: photoData.url }]);
    }
  };

  const removeSelectedPhoto = (photoName) => {
    setSelectedPhotos(selectedPhotos.filter((p) => p.name !== photoName));
  };

  // Kirim ke WhatsApp
  const handleSendToWhatsApp = async () => {
    if (selectedPhotos.length === 0) {
      alert('Pilih minimal 1 foto terlebih dahulu!');
      return;
    }

    setSaving(true);

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

    const photoListText = selectedPhotos
      .map((p, index) => `${index + 1}. ${p.name}`)
      .join('\n');

    const message = 
`Halo Admin, saya telah selesai memilih foto.

*Detail Klien:* ${gallery?.client_name || 'Klien'}
*Total Foto Terpilih:* ${selectedPhotos.length} Foto ${gallery?.max_photos ? `(Maks. ${gallery.max_photos})` : ''}

*Daftar Nama Foto:*
${photoListText}

Mohon diproses untuk tahap selanjutnya. Terima kasih!`;

    const waUrl = `https://wa.me/${ADMIN_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const filteredPhotos = photos.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <p className="text-gray-500 animate-pulse font-medium">Memuat galeri...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-gray-800 pb-12">
      {/* Header Utama Minimalis */}
      <header className="bg-white border-b border-gray-200 px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-2xl font-bold tracking-tight text-gray-900">Nyala Karya</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold border-l border-gray-300 pl-2 ml-2">Photo & Video</span>
        </div>

        {gallery?.client_name && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Klien</p>
            <p className="text-sm font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-none">{gallery.client_name}</p>
          </div>
        )}
      </header>

      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-8">
        {/* Banner Judul (Keterangan 'di panel samping' sudah dihapus) */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Galeri Foto</p>
          <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-2">Pilih Foto Favoritmu</h1>
          <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
            Klik foto untuk menandai foto yang kamu pilih. Setelah selesai, konfirmasi pilihanmu melalui tombol WhatsApp.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* AREA FOTO & PENCARIAN */}
          <div className="flex-1">
            {/* Tool Bar: Cari Foto */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="text-sm text-gray-500">
                Menampilkan <span className="font-semibold text-gray-800">{filteredPhotos.length}</span> dari {photos.length} foto
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama / nomor foto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                />
              </div>
            </div>

            {/* Grid Foto */}
            {filteredPhotos.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-400">
                Foto tidak ditemukan.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => {
                  const isSelected = selectedPhotos.some((p) => p.name === photo.name);

                  return (
                    <div
                      key={photo.id || photo.name}
                      onClick={() => toggleSelectPhoto(photo)}
                      className={`relative group cursor-pointer aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-80" />

                      {/* Checkbox Indikator (Pilih Foto) */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-black/30 border-white/70 group-hover:border-white'
                        }`}>
                          {isSelected && <Check size={14} className="text-white stroke-[3]" />}
                        </div>
                      </div>

                      {/* Tombol Perbesar Foto / Preview Modal */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewPhoto(photo);
                        }}
                        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-md bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        title="Perbesar foto"
                      >
                        <Maximize2 size={13} />
                      </button>

                      {/* Nama File Foto */}
                      <div className="absolute bottom-3 left-3 right-3 truncate">
                        <p className="text-white text-xs font-medium tracking-wide drop-shadow-md truncate">
                          {photo.name.replace(/\.[^/.]+$/, '')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SIDEBAR RINGKASAN & WHATSAPP */}
          <aside className="w-full lg:w-[340px] shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:sticky lg:top-24 space-y-6">
              
              {/* Header Sidebar */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Ringkasan Pilihan</h3>
                <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-medium rounded-full">
                  {selectedPhotos.length} {gallery?.max_photos ? `/ ${gallery.max_photos}` : ''} Terpilih
                </span>
              </div>

              {/* Detail Jumlah & Masa Berlaku Link */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Camera size={16} className="text-gray-400" /> Total Foto Galeri</div>
                  <span className="font-medium text-gray-900">{photos.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><CheckCircle size={16} className="text-gray-400" /> Foto Dipilih</div>
                  <span className="font-medium text-gray-900">{selectedPhotos.length} Foto</span>
                </div>

                {/* Info Maksimal Foto dari Input Home/Edit Klien */}
                {gallery?.max_photos && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><AlertCircle size={16} className="text-gray-400" /> Maks. Foto Dipilih</div>
                    <span className="font-medium text-gray-900">{gallery.max_photos} Foto</span>
                  </div>
                )}

                {/* Info Masa Berlaku Link dari Input Home/Edit Klien */}
                {gallery?.expire_date && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                      <Clock size={14} /> Batas Terakhir Memilih
                    </div>
                    <span className="font-semibold text-gray-800">{formatDateString(gallery.expire_date)}</span>
                  </div>
                )}
              </div>

              {/* Daftar Foto yang Dipilih */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Daftar Foto Dipilih</p>
                <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {selectedPhotos.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      Belum ada foto yang dipilih.
                    </div>
                  ) : (
                    selectedPhotos.map((photo) => (
                      <div key={photo.name} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <img src={photo.url} alt={photo.name} className="w-9 h-9 rounded object-cover shrink-0" />
                        <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                          {photo.name.replace(/\.[^/.]+$/, '')}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedPhoto(photo.name);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          title="Hapus foto"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tombol Kirim WhatsApp */}
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                disabled={saving || selectedPhotos.length === 0}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Send size={16} />
                {saving ? 'Menyimpan...' : 'Kirim Pilihan ke WhatsApp'}
              </button>

            </div>
          </aside>
        </div>
      </main>

      {/* MODAL PERBESAR FOTO (LIGHTBOX PREVIEW) */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-stone-800">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 bg-stone-950/80 border-b border-stone-800 text-white">
              <p className="text-sm font-medium truncate pr-4">{previewPhoto.name}</p>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Gambar Modal */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/60 p-4 min-h-[300px]">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.name}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Footer Modal Action */}
            <div className="p-4 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between">
              <p className="text-xs text-stone-400">Tekan tombol untuk menambah/menghapus foto ini</p>
              <button
                type="button"
                onClick={() => {
                  toggleSelectPhoto(previewPhoto);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  selectedPhotos.some((p) => p.name === previewPhoto.name)
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {selectedPhotos.some((p) => p.name === previewPhoto.name) ? (
                  <>
                    <X size={14} /> Batalkan Pilihan
                  </>
                ) : (
                  <>
                    <Check size={14} /> Pilih Foto Ini
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
