'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { extractFolderId } from '@/lib/gdrive';

export default function AdminPage() {
  const [clientName, setClientName] = useState('');
  const [gdriveUrl, setGdriveUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGallery = async (e) => {
    e.preventDefault();
    setLoading(true);

    const folderId = extractFolderId(gdriveUrl);
    // Buat slug dari nama klien (contoh: "Budi & Ani" -> "budi-and-ani-1234")
    const slug = `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase.from('galleries').insert([
      {
        client_name: clientName,
        folder_id: folderId,
        slug: slug,
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Gagal membuat galeri: ' + error.message);
    } else {
      const shareUrl = `${window.location.origin}/gallery/${slug}`;
      setGeneratedLink(shareUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Buat Galeri Foto Baru</h1>
        <form onSubmit={handleCreateGallery} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Klien / Event</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Contoh: Budi & Sinta Wedding"
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Link Folder Google Drive</label>
            <input
              type="url"
              required
              value={gdriveUrl}
              onChange={(e) => setGdriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? 'Memproses...' : 'Buat Galeri'}
          </button>
        </form>

        {generatedLink && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">Galeri Berhasil Dibuat!</p>
            <p className="text-xs text-gray-600 mt-1">Kirimkan link ini ke klien:</p>
            <input
              type="text"
              readOnly
              value={generatedLink}
              className="mt-2 w-full p-2 text-xs bg-white border border-gray-300 rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
