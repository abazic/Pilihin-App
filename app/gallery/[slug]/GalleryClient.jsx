'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Hanya untuk fitur UPDATE (Save) ke DB
import { 
  Search, Check, X, Camera, CheckCircle, Send, Maximize2, Clock, AlertCircle 
} from 'lucide-react';

// Terima props dari page.jsx
export default function GalleryClient({ galleryData, initialPhotos }) {
  // Kita jadikan props sebagai referensi langsung, tidak perlu dimasukkan ke useEffect
  const [gallery] = useState(galleryData);
  const [photos] = useState(initialPhotos);
  
  // Setup foto yang sudah dipilih sebelumnya (menggunakan selected_photos sesuai skema)
  const [selectedPhotos, setSelectedPhotos] = useState(() => {
    if (gallery?.selected_photos && gallery.selected_photos.length > 0) {
      const restored = initialPhotos.filter((p) =>
        gallery.selected_photos.includes(p.name)
      );
      return restored.map((p) => ({ id: p.id, name: p.name, url: p.url }));
    }
    return [];
  });

  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const DEFAULT_ADMIN_PHONE = '6281234567890';

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

  const formatWhatsAppNumber = (phone) => {
    if (!phone) return DEFAULT_ADMIN_PHONE;
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
    return cleaned || DEFAULT_ADMIN_PHONE;
  };

  // Proteksi Max Photos menggunakan skema max_photos
  const toggleSelectPhoto = (photoData) => {
    const isAlreadySelected = selectedPhotos.some((p) => p.name === photoData.name);
    
    if (isAlreadySelected) {
      setSelectedPhotos(selectedPhotos.filter((p) => p.name !== photoData.name));
    } else {
      if (gallery?.max_photos && selectedPhotos.length >= Number(gallery.max_photos)) {
        alert(`Batas maksimal pemilihan foto adalah ${gallery.max_photos} foto.`);
        return;
      }
      setSelectedPhotos([...selectedPhotos, { id: photoData.id, name: photoData.name, url: photoData.url }]);
    }
  };

  const removeSelectedPhoto = (photoName) => {
    setSelectedPhotos(selectedPhotos.filter((p) => p.name !== photoName));
  };

  // Menyimpan Pilihan
  const handleSendToWhatsApp = async () => {
    if (selectedPhotos.length === 0) {
      alert('Pilih minimal 1 foto terlebih dahulu!');
      return;
    }

    setSaving(true);
    const namesToSave = selectedPhotos.map((p) => p.name);
    
    // Update ke skema kolom selected_photos
    const { error } = await supabase
      .from('clients') // Sesuaikan nama tabel
      .update({ selected_photos: namesToSave })
      .eq('slug', gallery.slug); // Sesuaikan pencarian berdasarkan slug

    setSaving(false);

    if (error) {
      alert('Gagal menyimpan pilihan: ' + error.message);
      return;
    }

    const photoListText = selectedPhotos
      .map((p, index) => `${index + 1}. ${p.name}`)
      .join('\n');

    // Pesan WhatsApp menggunakan client_name
    const message = 
`Halo Admin, saya telah selesai memilih foto.

*Detail Klien:* ${gallery?.client_name || 'Klien'}
*Total Foto Terpilih:* ${selectedPhotos.length} Foto ${gallery?.max_photos ? `(Maks. ${gallery.max_photos})` : ''}

*Daftar Nama Foto:*
${photoListText}

Mohon diproses untuk tahap selanjutnya. Terima kasih!`;

    // Gunakan admin_whatsapp
    const rawAdminPhone = gallery?.admin_whatsapp || DEFAULT_ADMIN_PHONE;
    const cleanPhone = formatWhatsAppNumber(rawAdminPhone);

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const filteredPhotos = photos.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Bagian return HTML di bawahnya tetap sama, 
  // pastikan semua panggilan variabel menggunakan format yang baru 
  // contoh: gallery.client_name, gallery.expire_date, gallery.max_photos.
  
  return (
    // UI yang sama persis seperti sebelumnya...
    <div>...</div>
  )
}
