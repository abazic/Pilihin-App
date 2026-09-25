'use client';
import { useState } from 'react';

export default function GalleryClient({ galleryData, initialPhotos }) {
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const saveSelection = async (slug, selectedPhotos) => {
  try {
    const response = await fetch('/api/gallery/selection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, selectedPhotos }),
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
  }
};
  const togglePhoto = (name) =>
    setSelectedPhotos((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {initialPhotos?.map((p) => (
          <button key={p.id} onClick={() => togglePhoto(p.name)}>
            <img src={p.url} alt={p.name} />
          </button>
        ))}
      </div>
      <button onClick={() => saveSelection(galleryData?.slug, selectedPhotos)}>
        Simpan Pilihan
      </button>
    </div>
  );
}
