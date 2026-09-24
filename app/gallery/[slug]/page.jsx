'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getPhotosFromGDrive } from '@/lib/gdrive';
import { Check, Heart } from 'lucide-react';

export default function ClientGalleryPage() {
  const { slug } = useParams();
  const [gallery, setGallery] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadGalleryData() {
      // 1. Ambil data galeri dari Supabase
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
      setSelectedPhotos(data.selected_photos || []);

      // 2. Ambil foto-foto dari Google Drive
      const gdrivePhotos = await getPhotosFromGDrive(data.folder_id);
      setPhotos(gdrivePhotos);
      setLoading(false);
    }

    if (slug) loadGalleryData();
  }, [slug]);

  // Toggle Pilih / Batal Pilih Foto
  const toggleSelectPhoto = (photoName) => {
    if (selectedPhotos.includes(photoName)) {
      setSelectedPhotos(selectedPhotos.filter((name) => name !== photoName));
    } else {
      setSelectedPhotos([...selectedPhotos, photoName]);
    }
  };

  // Simpan Pilihan Klien ke Database
  const handleSaveSelection = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('galleries')
      .update({ selected_photos: selectedPhotos })
      .eq('slug', slug);

    setSaving(false);
    if (error) {
      alert('Gagal menyimpan pilihan: ' + error.message);
    } else {
      alert(`Berhasil menyimpan ${selectedPhotos.length} foto pilihan Anda!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Memuat foto dari Google Drive...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{gallery.client_name}</h1>
          <p className="text-xs text-gray-500">
            Terpilih: <span className="font-bold text-blue-600">{selectedPhotos.length}</span> Foto
          </p>
        </div>
        <button
          onClick={handleSaveSelection}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
        >
          {saving ? 'Menyimpan...' : 'Kirim Pilihan'}
        </button>
      </header>

      {/* Grid Foto */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo) => {
          const isSelected = selectedPhotos.includes(photo.name);
          return (
            <div
              key={photo.id}
              onClick={() => toggleSelectPhoto(photo.name)}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent'
              }`}
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
              />

              {/* Overlay Checkmark / Heart */}
              <div
                className={`absolute inset-0 bg-black/30 flex items-center justify-center transition ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-700'
                  }`}
                >
                  {isSelected ? <Check size={20} /> : <Heart size={20} />}
                </div>
              </div>

              {/* Nama File */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-[10px] text-white truncate">{photo.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
