'use client';
import { useState } from 'react';

export default function GalleryClient({ galleryData, initialPhotos }) {
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const saveSelection = async (slug, selectedPhotos) => { /* ...kode lama... */ };

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
