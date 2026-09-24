'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { extractFolderId } from '@/lib/gdrive';
import { 
  FileText, 
  Bell, 
  ChevronDown, 
  User as UserIcon, 
  Calendar, 
  Link as LinkIcon, 
  ExternalLink, 
  Trash2,
  Image as ImageIcon,
  Clock,
  Copy,
  Check,
  Plus,
  Phone,
  X,
  MessageSquare,
  CheckCircle2,
  Edit2
} from 'lucide-react';

interface FormDataState {
  clientName: string;
  eventDate: string;
  gdriveUrl: string;
  maxPhotos: number | string;
  expireDate: string;
  notes: string;
}

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export default function HomePage() {
  // 1. State Form Input Klien
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

  // 2. State Profil Admin & WhatsApp
  const [adminInfo, setAdminInfo] = useState({
    name: 'Admin Nyala Karya',
    whatsapp: '6281234567890'
  });
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isEditingAdmin, setIsEditingAdmin] = useState<boolean>(false);

  // 3. State Notifikasi
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: 'Foto Dipilih Klien', desc: 'Ahmad Rizki telah selesai memilih 20 foto.', time: '10 min lalu', read: false },
    { id: 2, title: 'Galeri Mendekati Expired', desc: 'Galeri Wisuda Al-Azhar berakhir besok.', time: '2 jam lalu', read: false },
    { id: 3, title: 'Klien Baru Ditambahkan', desc: 'Link galeri Budi & Siska telah aktif.', time: '1 hari lalu', read: true },
  ]);

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

  // Reset / Tambah Klien Baru
  const handleResetForm = () => {
    setFormData({
      clientName: '',
      eventDate: '',
      gdriveUrl: '',
      maxPhotos: '',
      expireDate: '',
      notes: ''
    });
    setCreatedSlug('');
  };

  // 4. Simpan / Tambah Data Klien ke Supabase
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
          max_photos: formData.maxPhotos ? Number(formData.maxPhotos) : null,
          event_date: formData.eventDate || null,
          expire_date: formData.expireDate || null,
          notes: formData.notes || null
        },
      ]);

      if (error) {
        alert('Gagal menyimpan data: ' + error.message);
      } else {
        setCreatedSlug(generatedSlug);
        
        // Tambahkan ke notifikasi lokal
        setNotifications(prev => [
          {
            id: Date.now(),
            title: 'Klien Baru Berhasil Dibuat',
            desc: `Galeri untuk "${formData.clientName}" siap digunakan.`,
            time: 'Baru saja',
            read: false
          },
          ...prev
        ]);

        alert('Data klien berhasil disimpan! Link galeri telah dibuat.');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan saat mengekstrak link atau menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  // Hapus / Reset Form
  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus / mengosongkan data form ini?')) {
      handleResetForm();
      alert('Form berhasil dikosongkan.');
    }
  };

  // Salin Link Galeri
  const handleCopyLink = () => {
    if (!createdSlug) return;
    const fullUrl = `${window.location.origin}/gallery/${createdSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tandai Semua Notifikasi Dibaca
  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-gray-800 flex flex-col">
      
      {/* Topbar / Header Utama */}
      <header className="bg-white border-b border-gray-200 h-20 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Logo Brand */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="font-serif italic text-2xl font-bold tracking-tight text-gray-900">Nyala Karya</span>
            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Photo & Video</span>
          </div>

          {/* Tombol Tambah Klien Baru di Header */}
          <button
            onClick={handleResetForm}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <Plus size={14} /> Tambah Klien Baru
          </button>
        </div>

        {/* Notifikasi & Profil Admin */}
        <div className="flex items-center gap-4 relative">
          
          {/* 1. TOMBOL NOTIFIKASI */}
          <div className="relative">
            <button 
              type="button" 
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full relative transition-colors"
            >
              <Bell size={20} />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Dropdown Notifikasi */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-gray-900">Notifikasi</h4>
                    {unreadNotifCount > 0 && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                        {unreadNotifCount} Baru
                      </span>
                    )}
                  </div>
                  {unreadNotifCount > 0 && (
                    <button 
                      onClick={markAllNotifsRead}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} /> Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-gray-400 text-center">Tidak ada notifikasi.</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3.5 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-gray-900">{n.title}</span>
                          <span className="text-[10px] text-gray-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{n.desc}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. TOMBOL ADMIN (NAMA & WHATSAPP) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <img src="https://i.pravatar.cc/150?img=33" alt="Admin" className="w-8 h-8 rounded-full border border-gray-200" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-none">{adminInfo.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">+{adminInfo.whatsapp}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {/* Dropdown Menu Admin */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 p-4 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <h4 className="font-semibold text-sm text-gray-900">Profil Admin</h4>
                  <button 
                    onClick={() => setIsEditingAdmin(!isEditingAdmin)} 
                    className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
                  >
                    <Edit2 size={12} /> {isEditingAdmin ? 'Batal' : 'Edit'}
                  </button>
                </div>

                {/* Form Edit Admin / Mode Tampil */}
                {isEditingAdmin ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">Nama Admin</label>
                      <input 
                        type="text" 
                        value={adminInfo.name}
                        onChange={(e) => setAdminInfo({ ...adminInfo, name: e.target.value })}
                        className="w-full text-xs p-2 border border-gray-300 rounded-lg outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">No. WhatsApp (Tanpa +)</label>
                      <input 
                        type="text" 
                        value={adminInfo.whatsapp}
                        onChange={(e) => setAdminInfo({ ...adminInfo, whatsapp: e.target.value })}
                        className="w-full text-xs p-2 border border-gray-300 rounded-lg outline-none focus:border-black"
                      />
                    </div>
                    <button 
                      onClick={() => setIsEditingAdmin(false)}
                      className="w-full py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium"
                    >
                      Simpan Profil
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Phone size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">WhatsApp Studio</p>
                        <p className="text-xs font-mono font-medium text-gray-800">+{adminInfo.whatsapp}</p>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${adminInfo.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <MessageSquare size={14} /> Buka WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
        
        {/* Judul Halaman & Tombol Tambah */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-gray-900 mb-1">
              {createdSlug ? 'Edit / Kelola Klien' : 'Tambah Klien Baru'}
            </h1>
            <p className="text-gray-500 text-sm">
              {createdSlug 
                ? 'Perbarui detail klien dan salin link galeri yang siap dibagikan.' 
                : 'Isi formulir di bawah ini untuk membuatkan link galeri pemilihan foto klien.'}
            </p>
          </div>
          
          <button
            onClick={handleResetForm}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus size={15} /> Buat Klien Baru
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* KOLOM KIRI: Form Input */}
          <div className="flex-1 space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Bagian 1: Informasi Klien */}
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
                      placeholder="Contoh: Ahmad Rizki & Keluarga"
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none transition-all"
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

              {/* Bagian 2: Pengaturan Galeri */}
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
                       className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50 focus:bg-white outline-none transition-all"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
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
                      <p className="text-[11px] text-gray-400 mt-1">Batas jumlah foto pilihan klien.</p>
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
                      <p className="text-[11px] text-gray-400 mt-1">Tanggal akses galeri ditutup.</p>
                   </div>
                </div>
              </div>

              {/* Bagian 3: Catatan */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                 <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                  <FileText size={18} className="text-gray-400" /> Catatan <span className="text-gray-400 font-normal text-sm">(Opsional)</span>
                </h2>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  maxLength={500}
                  placeholder="Contoh: Mohon pilih foto terbaik dan hindari foto blur."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-700 resize-none outline-none focus:border-gray-400"
                ></textarea>
                <div className="text-right text-[11px] text-gray-400 mt-1">{formData.notes.length}/500</div>
              </div>

              {/* Tombol Aksi Bawah */}
              <div className="flex items-center justify-between pt-2">
                 <button 
                   type="button" 
                   onClick={handleDelete}
                   className="flex items-center gap-2 px-4 py-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-medium border border-red-100 transition-colors"
                 >
                   <Trash2 size={16} /> Reset Form
                 </button>
                 <div className="flex gap-3">
                   <button 
                     type="button" 
                     onClick={handleResetForm}
                     className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                   >
                     Batal
                   </button>
                   
                   {/* Tombol Simpan / Tambah Klien */}
                   <button 
                     type="submit" 
                     disabled={loading}
                     className="flex items-center gap-2 px-6 py-2.5 text-white bg-[#2a2a2a] hover:bg-black rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                   >
                     {loading ? 'Menyimpan...' : createdSlug ? 'Perbarui Data Klien' : 'Simpan & Buat Galeri'}
                   </button>
                 </div>
              </div>

            </form>
          </div>

          {/* KOLOM KANAN: Ringkasan & Preview */}
          <aside className="w-full xl:w-[400px] shrink-0 space-y-6">
            
            {/* Banner Cover Klien */}
            <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop" 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                 <div>
                    <h3 className="text-white font-medium text-lg leading-tight">{formData.clientName || 'Nama Klien'}</h3>
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
                     <div className="w-[45%] text-gray-500 flex items-center gap-2"><LinkIcon size={14}/> Link GDrive</div>
                     <div className="flex-1 font-medium text-gray-900 truncate text-blue-600">
                        {formData.gdriveUrl ? `${formData.gdriveUrl.substring(0, 22)}...` : '-'}
                     </div>
                  </div>
                  <div className="flex text-sm">
                     <div className="w-[45%] text-gray-500 flex items-center gap-2"><ImageIcon size={14}/> Maks. Foto</div>
                     <div className="flex-1 font-medium text-gray-900">{formData.maxPhotos ? `${formData.maxPhotos} foto` : '-'}</div>
                  </div>
                  <div className="flex text-sm">
                     <div className="w-[45%] text-gray-500 flex items-center gap-2"><Clock size={14}/> Masa Berlaku</div>
                     <div className="flex-1 font-medium text-gray-900">{formatDateString(formData.expireDate)}</div>
                  </div>
               </div>
            </div>

            {/* Box Link Galeri & Preview */}
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
                     <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover opacity-80" alt="Preview"/>
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover opacity-80" alt="Preview"/>
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1627556704302-624286467c65?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover opacity-80" alt="Preview"/>
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                     <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover opacity-50" alt="Preview"/>
                     <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-md">+15</div>
                  </div>
               </div>

               {/* Card Link Galeri Aktif */}
               <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 overflow-hidden">
                     <div className="mt-0.5 shrink-0"><LinkIcon size={16} className="text-gray-400" /></div>
                     <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-gray-800">Link Galeri Klien</p>
                        {createdSlug ? (
                          <p className="text-[11px] text-blue-600 font-mono truncate mt-0.5">
                            {typeof window !== 'undefined' ? `${window.location.origin}/gallery/${createdSlug}` : `/gallery/${createdSlug}`}
                          </p>
                        ) : (
                          <p className="text-[11px] text-gray-400 mt-0.5">Simpan data untuk menghasilkan link galeri.</p>
                        )}
                     </div>
                  </div>
                  {createdSlug && (
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="shrink-0 px-2.5 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center gap-1 transition-colors shadow-xs font-medium"
                    >
                      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  )}
               </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}
