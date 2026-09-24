'use client';

import React, { useState, useEffect } from 'react';
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
  Copy,
  Check,
  Plus,
  Phone,
  MessageSquare,
  CheckCircle2,
  Edit2,
  ListFilter
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

interface ClientItem {
  id: string | number;
  client_name: string;
  folder_id: string;
  slug: string;
  max_photos: number | null;
  event_date: string | null;
  expire_date: string | null;
  notes: string | null;
  created_at?: string;
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
  
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string>('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // State Daftar Ringkasan Klien
  const [clientsList, setClientsList] = useState<ClientItem[]>([]);
  const [fetchingClients, setFetchingClients] = useState<boolean>(false);

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

  // Fetch daftar klien dari Supabase
  const fetchClients = async () => {
    setFetchingClients(true);
    try {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setClientsList(data);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar klien:', err);
    } finally {
      setFetchingClients(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDateString = (dateStr: string | null) => {
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

  // Reset Form Input
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
    setEditingId(null);
  };

  // Select Klien untuk Diedit
  const handleEditClient = (client: ClientItem) => {
    setEditingId(client.id);
    setFormData({
      clientName: client.client_name || '',
      eventDate: client.event_date || '',
      gdriveUrl: client.folder_id ? `https://drive.google.com/drive/folders/${client.folder_id}` : '',
      maxPhotos: client.max_photos || '',
      expireDate: client.expire_date || '',
      notes: client.notes || ''
    });
    setCreatedSlug(client.slug);

    // Scroll mulus ke form atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hapus Data Klien dari Supabase
  const handleDeleteClientFromList = async (id: string | number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data klien ini?')) return;

    try {
      const { error } = await supabase.from('galleries').delete().eq('id', id);
      if (error) {
        alert('Gagal menghapus klien: ' + error.message);
      } else {
        alert('Klien berhasil dihapus.');
        if (editingId === id) handleResetForm();
        fetchClients();
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus data.');
    }
  };

  // 4. Simpan / Perbarui Data Klien ke Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.gdriveUrl) {
      alert('Mohon isi Nama Klien dan Link Google Drive!');
      return;
    }

    setLoading(true);

    try {
      const folderId = extractFolderId(formData.gdriveUrl);
      const generatedSlug = createdSlug || `${formData.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        client_name: formData.clientName,
        folder_id: folderId,
        slug: generatedSlug,
        max_photos: formData.maxPhotos ? Number(formData.maxPhotos) : null,
        event_date: formData.eventDate || null,
        expire_date: formData.expireDate || null,
        notes: formData.notes || null
      };

      if (editingId) {
        // Mode Edit / Update
        const { error } = await supabase.from('galleries').update(payload).eq('id', editingId);

        if (error) {
          alert('Gagal memperbarui data: ' + error.message);
        } else {
          alert('Data klien berhasil diperbarui!');
          handleResetForm();
          fetchClients();
        }
      } else {
        // Mode Tambah Baru
        const { error } = await supabase.from('galleries').insert([payload]);

        if (error) {
          alert('Gagal menyimpan data: ' + error.message);
        } else {
          setCreatedSlug(generatedSlug);
          
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

          alert('Data klien berhasil disimpan!');
          handleResetForm();
          fetchClients();
        }
      }
    } catch (err: any) {
      alert('Terjadi kesalahan saat mengekstrak link atau menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  // Salin Link Galeri
  const handleCopyLink = (slug: string) => {
    if (!slug) return;
    const fullUrl = `${window.location.origin}/gallery/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
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
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-10">
        
        {/* Judul Halaman & Tombol Form Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-gray-900 mb-1">
              {editingId ? 'Edit Data Klien' : 'Form Data Klien'}
            </h1>
            <p className="text-gray-500 text-sm">
              {editingId 
                ? 'Perbarui data klien dan klik simpan untuk memperbarui database.' 
                : 'Isi formulir di bawah ini untuk membuatkan link galeri pemilihan foto klien.'}
            </p>
          </div>
          
          {editingId && (
            <button
              onClick={handleResetForm}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl shadow-sm transition-all self-start sm:self-auto"
            >
              <Plus size={15} /> Buat Klien Baru
            </button>
          )}
        </div>

        {/* Form Input Klien (Lebar Penuh) */}
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
               onClick={handleResetForm}
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
               
               {/* Tombol Simpan Klien Baru */}
               <button 
                 type="submit" 
                 disabled={loading}
                 className="flex items-center gap-2 px-6 py-2.5 text-white bg-[#2a2a2a] hover:bg-black rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
               >
                 {loading ? 'Menyimpan...' : editingId ? 'Perbarui Data Klien' : 'Simpan Klien Baru'}
               </button>
             </div>
          </div>

        </form>

        {/* ========================================================= */}
        {/* SEKSI RINGKASAN & DAFTAR KLIEN TERDAFTAR */}
        {/* ========================================================= */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-xl font-serif text-gray-900 flex items-center gap-2">
                <ListFilter size={20} className="text-gray-500" /> Ringkasan Klien & Link Galeri
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Daftar semua klien yang tersimpan. Klik tombol <span className="font-semibold text-gray-700">Edit</span> untuk memperbarui informasi klien pada form di atas.
              </p>
            </div>
            <button
              onClick={fetchClients}
              className="text-xs font-medium text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
            >
              Refresh Daftar
            </button>
          </div>

          {fetchingClients ? (
            <div className="text-center py-12 text-sm text-gray-400">Memuat data klien...</div>
          ) : clientsList.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              Belum ada data klien yang tersimpan. Isi form di atas dan simpan klien baru.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-4">Nama Klien</th>
                    <th className="py-3 px-4">Tanggal Acara</th>
                    <th className="py-3 px-4">Maks. Foto</th>
                    <th className="py-3 px-4">Masa Berlaku</th>
                    <th className="py-3 px-4">Link Galeri</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {clientsList.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-gray-900">{client.client_name}</td>
                      <td className="py-3.5 px-4 text-gray-600">{formatDateString(client.event_date)}</td>
                      <td className="py-3.5 px-4 text-gray-600">{client.max_photos ? `${client.max_photos} Foto` : '-'}</td>
                      <td className="py-3.5 px-4 text-gray-600">{formatDateString(client.expire_date)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-blue-600 truncate max-w-[150px]">
                            /gallery/{client.slug}
                          </span>
                          <button
                            onClick={() => handleCopyLink(client.slug)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors"
                            title="Salin Link"
                          >
                            {copiedSlug === client.slug ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                          <Link
                            href={`/gallery/${client.slug}`}
                            target="_blank"
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors"
                            title="Buka Galeri"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClient(client)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClientFromList(client.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Klien"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
