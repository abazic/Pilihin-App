'use client';

import React, { useState } from 'react';
import { ArrowLeft, Copy, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditClientPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    name: 'Ahmad Rizki & Keluarga',
    eventDate: '2025-08-12',
    driveUrl: 'https://drive.google.com/drive/folders/1aBcD...xyz',
    maxSelect: 20,
    expireDate: '2025-08-31',
    notes: 'Mohon pilih foto terbaik dan hindari foto blur.',
    slug: 'ahmad-rizki-keluarga-2025'
  });

  const [copied, setCopied] = useState(false);
  const clientGalleryUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/${formData.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(clientGalleryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 bg-[#F8F7F5] min-h-screen text-[#2D2D2D] font-sans">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-black mb-6">
        <ArrowLeft size={14} /> Kembali ke Daftar Klien
      </Link>

      <h1 className="text-3xl font-serif font-semibold mb-1">Edit Klien</h1>
      <p className="text-gray-500 text-sm mb-8">Atur informasi klien dan pengaturan galeri mereka.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <section>
            <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span> Informasi Klien
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Klien *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Acara</label>
                <input 
                  type="date" 
                  value={formData.eventDate}
                  onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-black"
                />
              </div>
            </div>
          </section>

          <section className="pt-4 border-t">
            <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span> Pengaturan Galeri
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link Google Drive / Cloud Storage *</label>
                <input 
                  type="url" 
                  value={formData.driveUrl}
                  onChange={e => setFormData({ ...formData, driveUrl: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Maksimum Foto yang Bisa Dipilih</label>
                  <input 
                    type="number" 
                    value={formData.maxSelect}
                    onChange={e => setFormData({ ...formData, maxSelect: Number(e.target.value) })}
                    className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-black"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Jumlah maksimal foto yang dapat dipilih oleh klien.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Masa Berlaku Link</label>
                  <input 
                    type="date" 
                    value={formData.expireDate}
                    onChange={e => setFormData({ ...formData, expireDate: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-black"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Setelah tanggal ini, link tidak dapat diakses.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pt-4 border-t">
            <label className="block text-xs font-medium text-gray-600 mb-1">Catatan (Opsional)</label>
            <textarea 
              rows={3} 
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-black"
            />
          </section>

          <div className="flex justify-between items-center pt-4 border-t">
            <button className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-medium hover:bg-red-50 flex items-center gap-1.5">
              <Trash2 size={14} /> Hapus Klien
            </button>
            <div className="flex gap-2">
              <button className="px-5 py-2 border rounded-xl text-xs font-medium hover:bg-gray-50">Batal</button>
              <button className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-medium hover:bg-neutral-800">Simpan Perubahan</button>
            </div>
          </div>
        </div>

        {/* Right Summary & Link Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm">Ringkasan Pengaturan</h3>
            <div className="text-xs space-y-2 text-gray-600">
              <div className="flex justify-between"><span>Nama Klien:</span><span className="font-medium text-black">{formData.name}</span></div>
              <div className="flex justify-between"><span>Tanggal Acara:</span><span className="font-medium text-black">{formData.eventDate}</span></div>
              <div className="flex justify-between"><span>Maks. Foto Dipilih:</span><span className="font-medium text-black">{formData.maxSelect} foto</span></div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs font-medium text-gray-700 mb-2">Link Galeri Aktif</p>
              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border text-xs">
                <input type="text" readOnly value={clientGalleryUrl} className="bg-transparent flex-1 outline-none text-gray-500 overflow-hidden text-ellipsis" />
                <button onClick={handleCopyLink} className="p-1.5 hover:bg-gray-200 rounded-lg transition" title="Copy Link">
                  <Copy size={14} />
                </button>
              </div>
              {copied && <p className="text-[10px] text-emerald-600 mt-1">Link berhasil disalin!</p>}
              <a href={`/gallery/${formData.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-neutral-800 hover:underline mt-3">
                Buka Galeri Klien <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
