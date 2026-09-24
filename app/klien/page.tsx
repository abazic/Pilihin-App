'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { extractFolderId } from '@/lib/gdrive';
import { 
  Home, 
  FileText, 
  Settings, 
  Bell, 
  ChevronDown, 
  ArrowLeft, 
  User as UserIcon, 
  Calendar, 
  Link as LinkIcon, 
  ExternalLink, 
  Trash2,
  Image as ImageIcon,
  Clock,
  Copy,
  Check
} from 'lucide-react';

interface FormDataState {
  clientName: string;
  eventDate: string;
  gdriveUrl: string;
  maxPhotos: number | string;
  expireDate: string;
  notes: string;
}

export default function AdminPage() {
  // 1. Inisialisasi Form Kosong
  const [formData, setFormData] = useState<FormDataState>({
    clientName: '',
    eventDate: '',
    gdriveUrl: '',
    maxPhotos: '',
    expireDate: '',
    notes: ''
  });
  
  const [createdSlug, setCreatedSlug] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '-';
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

  // 2. Fungsi Simpan Klien
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.gdriveUrl) {
      alert('Mohon isi Nama Klien dan Link Google Drive!');
      return;
    }

    setLoading(true);

    try {
      const folderId = extractFolderId(formData.gdriveUrl);
      const generatedSlug = `${formData.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { error } = await supabase.from('galleries').insert([
        {
          client_name: formData.clientName,
          folder_id: folderId,
          slug: generatedSlug,
          // Kolom opsional Supabase jika sudah dikonfigurasi:
          // event_date: formData.eventDate || null,
          // max_photos: formData.maxPhotos ? Number(formData.maxPhotos) : null,
          // expire_date: formData.expireDate || null,
          // notes: formData.notes || null,
        },
      ]);

      if (error) {
        alert('Gagal menyimpan perubahan: ' + error.message);
      } else {
        setCreatedSlug(generatedSlug);
        alert('Klien berhasil disimpan! Link galeri siap dikirim ke klien.');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan saat mengekstrak link atau menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Hapus / Kosongkan Klien
  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus / mengosongkan data klien ini?')) {
      setFormData({
        clientName: '',
        eventDate: '',
        gdriveUrl: '',
        maxPhotos: '',
        expireDate: '',
        notes: ''
      });
      setCreatedSlug('');
      alert('Data klien berhasil dikosongkan.');
    }
  };

  // Salin Link Galeri ke Clipboard
  const handleCopyLink = () => {
    if (!createdSlug) return;
    const fullUrl = `${window.location.origin}/gallery/${createdSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-[#f7f7f7] font-sans text-gray-800">
      
      {/* 1. Sidebar Kiri (Navigasi) */}
      <aside className="w-[260px] bg-[#ececec] border-r border-gray-200 flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="p-8 pb-10">
          <div className="flex flex-col">
             <span className="font-serif italic text-3xl font-bold tracking-tight">Nyala Karya</span>
             <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mt-1">Photo & Video</span>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            <Home size={18} /> Dashboard
          </Link>
          <Link href="/klien" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-[#2a2a2a] rounded-lg shadow-sm">
            <ImageIcon size={18} /> Kelola Klien
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            <FileText size={18} /> Riwayat Pesanan
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            <Settings size={18} /> Pengaturan
          </Link>
        </nav>

        {/* Quote / Footer Sidebar */}
        <div className="p-8 pt-0 relative overflow-hidden h-48 mt-auto">
            <div className="relative z-10">
               <p className="font-serif italic text-gray-500 text-lg leading-snug">Setiap momen<br/>punya ceritanya.</p>
               <div className="w-6 h-px bg-gray-400 mt-4"></div>
            </div>
            {/* Dekorasi Bunga/Daun placeholder */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 opacity-20 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1596489377759-99e2a77a445d?auto=format&fit=crop&q=80&w=200&ixlib=rb-4.0.3')"}}></div>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 ml-[260px] flex flex-col">
        
        {/* 2. Topbar */}
        <header className="bg-[#f7f7f7] border-b border-gray-200 h-16 flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <button type="button" className="text-gray-500 hover:text-gray-900 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="https://i.pravatar.cc/150?img=33" alt="Admin" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium text-gray-700">Admin</span>
              <ChevronDown size={14} className="text-gray-500" />
            </div>
          </div>
        </header>

        {/* 3. Area Form */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          
          {/* Header Konten */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
              <ArrowLeft size={16} /> Kembali ke Daftar Klien
            </Link>
            <h1 className="text-3xl font-serif text-gray-900 mb-2">Edit Klien</h1>
            <p className="text-gray-500 text-sm">Atur informasi klien dan pengaturan galeri mereka.</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* KOLOM KIRI: Form Input */}
            <div className="flex-1 space-y-6">
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Bagian: Informasi Klien */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-6">
                    <UserIcon size={18} className="text-gray-400" /> Informasi Klien
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Nama Klien *</label>
                      <input 
                        type="text" 
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama klien"
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Tanggal Acara</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="date" 
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bagian: Pengaturan Galeri */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-6">
                    <LinkIcon size={18} className="text-gray-400" /> Pengaturan Galeri
                  </h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm text-gray-700 mb-2">Link Google Drive *</label>
                    <div className="flex gap-2">
                       <input 
                         type="url" 
                         name="gdriveUrl"
                         value={formData.gdriveUrl}
                         onChange={handleInputChange}
                         placeholder="https://drive.google.com/drive/folders/..."
                         required
                         className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 focus:bg-white outline-none"
                       />
                       <button 
                         type="button" 
                         onClick={() => formData.gdriveUrl && window.open(formData.gdriveUrl, '_blank')}
                         className="p-2.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
                         title="Buka Drive"
                       >
                         <ExternalLink size={18} />
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div>
                        <label className="block text-sm text-gray-700 mb-2">Maksimum Foto yang Bisa Dipilih</label>
                        <input 
                          type="number" 
                          name="maxPhotos"
                          value={formData.maxPhotos}
                          onChange={handleInputChange}
                          placeholder="20"
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Jumlah maksimal foto yang dapat dipilih oleh klien.</p>
                     </div>
                     <div>
                        <label className="block text-sm text-gray-700 mb-2">Masa Berlaku Link</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="date" 
                            name="expireDate"
                            value={formData.expireDate}
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">Setelah tanggal ini, link tidak dapat diakses.</p>
                     </div>
                  </div>
                </div>

                {/* Bagian: Catatan */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                   <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                    <FileText size={18} className="text-gray-400" /> Catatan <span className="text-gray-400 font-normal text-sm">(Opsional)</span>
                  </h2>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    maxLength={500}
                    placeholder="Contoh: Mohon pilih foto terbaik dan hindari foto blur. Untuk foto grup, pilih yang paling jelas."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-700 resize-none outline-none"
                  ></textarea>
                  <div className="text-right text-[11px] text-gray-400 mt-1">{formData.notes.length}/500</div>
                </div>

                {/* Tombol Aksi Bawah */}
                <div className="flex items-center justify-between pt-4">
                   <button 
                     type="button" 
                     onClick={handleDelete}
                     className="flex items-center gap-2 px-4 py-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium border border-red-100 transition-colors"
                   >
                     <Trash2 size={16} /> Hapus Klien
                   </button>
                   <div className="flex gap-3">
                     <button 
                       type="button" 
                       onClick={handleDelete}
                       className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                     >
                       Batal
                     </button>
                     <button 
                       type="submit" 
                       disabled={loading}
                       className="px-6 py-2.5 text-white bg-[#2a2a2a] hover:bg-black rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                     >
                       {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                     </button>
                   </div>
                </div>

              </form>
            </div>

            {/* KOLOM KANAN: Ringkasan & Preview */}
            <aside className="w-full xl:w-[400px] shrink-0 space-y-6">
              
              {/* Banner / Cover Klien */}
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop" 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div>
                      <h3 className="text-white font-medium text-lg">{formData.clientName || 'Nama Klien'}</h3>
                      <p className="text-gray-300 text-xs mt-1">{formatDateString(formData.eventDate)}</p>
                   </div>
                   <span className="bg-emerald-500/90 backdrop-blur text-white text-xs px-3 py-1 rounded-full font-medium">Aktif</span>
                </div>
              </div>

              {/* Box Ringkasan */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                 <h3 className="font-semibold text-gray-900 mb-5">Ringkasan Pengaturan</h3>
                 <div className="space-y-4">
                    <div className="flex text-sm">
                       <div className="w-[45%] text-gray-500 flex items-center gap-2"><UserIcon size={14}/> Nama Klien</div>
                       <div className="flex-1 font-medium text-gray-900 truncate">{formData.clientName || '-'}</div>
                    </div>
                    <div className="flex text-sm">
                       <div className="w-[45%] text-gray-500 flex items-center gap-2"><Calendar size={14}/> Tanggal Acara</div>
                       <div className="flex-1 font-medium text-gray-900">{formatDateString(formData.eventDate)}</div>
                    </div>
                    <div className="flex text-sm">
                       <div className="w-[45%] text-gray-500 flex items-center gap-2"><LinkIcon size={14}/> Link Google Drive</div>
                       <div className="flex-1 font-medium text-gray-900 truncate text-blue-600">
                          {formData.gdriveUrl ? `${formData.gdriveUrl.substring(0, 25)}...` : '-'}
                       </div>
                    </div>
                    <div className="flex text-sm">
                       <div className="w-[45%] text-gray-500 flex items-center gap-2"><ImageIcon size={14}/> Maks. Foto Dipilih</div>
                       <div className="flex-1 font-medium text-gray-900">{formData.maxPhotos ? `${formData.maxPhotos} foto` : '-'}</div>
                    </div>
                    <div className="flex text-sm">
                       <div className="w-[45%] text-gray-500 flex items-center gap-2"><Clock size={14}/> Masa Berlaku Link</div>
                       <div className="flex-1 font-medium text-gray-900">{formatDateString(formData.expireDate)}</div>
                    </div>
                 </div>
              </div>

              {/* Box Preview */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Preview Galeri</h3>
                    {createdSlug ? (
                      <Link href={`/gallery/${createdSlug}`} target="_blank" className="text-gray-400 hover:text-gray-700">
                        <ExternalLink size={16} />
                      </Link>
                    ) : (
                      <ExternalLink size={16} className="text-gray-300" />
                    )}
                 </div>
                 
                 <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer" alt="Preview"/>
                    </div>
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer" alt="Preview"/>
                    </div>
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1627556704302-624286467c65?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer" alt="Preview"/>
                    </div>
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                       <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover opacity-50" alt="Preview"/>
                       <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-md">+15</div>
                    </div>
                 </div>

                 {/* Link Galeri Aktif & Tombol Salin Link */}
                 <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 overflow-hidden">
                       <div className="mt-0.5 shrink-0"><LinkIcon size={16} className="text-gray-400" /></div>
                       <div className="overflow-hidden">
                          <p className="text-sm font-medium text-gray-800">Link Galeri Klien</p>
                          {createdSlug ? (
                            <p className="text-xs text-blue-600 font-mono truncate mt-0.5">
                              {typeof window !== 'undefined' ? `${window.location.origin}/gallery/${createdSlug}` : `/gallery/${createdSlug}`}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 mt-0.5">Simpan data klien untuk membuat link galeri aktif.</p>
                          )}
                       </div>
                    </div>
                    {createdSlug && (
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="shrink-0 px-2 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-100 flex items-center gap-1 transition-colors"
                      >
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        <span>{copied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    )}
                 </div>
              </div>

            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
