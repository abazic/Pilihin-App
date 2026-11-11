// app/admin/page.tsx
'use client';

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { extractFolderId } from '@/lib/gdrive';
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';
import BroadcastModal from '@/components/BroadcastModal';
import AppHeader from '@/components/AppHeader';
import {
  FileText, Bell, ChevronDown, User as UserIcon, Calendar,
  Link as LinkIcon, ExternalLink, Trash2, Copy, Check, Plus,
  Phone, MessageSquare, CheckCircle2, Edit2, ListFilter, Megaphone,
  Lock, Send, Image, ChevronDown as ChevronDownIcon,
} from 'lucide-react';

// ─── Interface ────────────────────────────────────────────────────────────────
interface FormDataState {
  clientName: string; eventDate: string; gdriveUrl: string;
  maxPhotos: number | string; expireDate: string; notes: string;
}
interface NotificationItem {
  id: number; title: string; desc: string; time: string; read: boolean;
}
interface ClientItem {
  id: string | number; client_name: string; folder_id: string; slug: string;
  max_photos: number | null; event_date: string | null;
  expire_date: string | null; notes: string | null; created_at?: string;
}
interface PortfolioCategory { title: string; slug: string; folderId: string; }
interface PhotoSelection {
  id: string;
  gallery_id: number;
  slug: string;
  selected_photos: { name: string; url: string }[];
  is_locked: boolean;
  sent_via_wa: boolean;
  sent_at: string | null;
  client_note: string | null;
  created_at: string;
  updated_at: string;
  galleries?: { client_name: string; max_photos: number | null };
}

// ─── Class bantu (supaya konsisten di light & dark) ───────────────────────────
const CARD = 'bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm';
const INPUT = 'w-full p-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-gray-500 dark:focus:border-neutral-500 transition-all';
const BTN_GHOST = 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800';
const BTN_SECONDARY = 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-700';
const TH = 'py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-neutral-800/40';

function formatTimeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function HomePage() {
  const [formData, setFormData] = useState<FormDataState>({
    clientName: '', eventDate: '', gdriveUrl: '',
    maxPhotos: '', expireDate: '', notes: ''
  });
  const supabase = createClient();
  const [editingId, setEditingId]     = useState<string | number | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string>('');
  const [copiedSlug, setCopiedSlug]   = useState<string | null>(null);
  const [loading, setLoading]         = useState<boolean>(false);
  const [clientsList, setClientsList] = useState<ClientItem[]>([]);
  const [fetchingClients, setFetchingClients] = useState<boolean>(false);
  const [adminInfo, setAdminInfo] = useState({ name: 'Admin Pilihin Fotomu', whatsapp: DEFAULT_WHATSAPP_NUMBER });
  const [isProfileOpen, setIsProfileOpen]   = useState<boolean>(false);
  const [isEditingAdmin, setIsEditingAdmin] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen]       = useState<boolean>(false);
  const [notifications, setNotifications]   = useState<NotificationItem[]>([]);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'clients' | 'portfolio'>('clients');
  const [portfolioCategories, setPortfolioCategories] = useState<PortfolioCategory[]>([]);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioFolderUrl, setPortfolioFolderUrl] = useState('');
  const [portfolioPhotos, setPortfolioPhotos] = useState<{ id: string; name: string; url: string }[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioSaving, setPortfolioSaving] = useState(false);
  const [portfolioMessage, setPortfolioMessage] = useState('');
  const [editingPortfolioSlug, setEditingPortfolioSlug] = useState<string | null>(null);


  const [selections, setSelections]                 = useState<PhotoSelection[]>([]);
  const [fetchingSelections, setFetchingSelections] = useState<boolean>(false);
  const [expandedSlug, setExpandedSlug]             = useState<string | null>(null);
  const [copiedSelId, setCopiedSelId]               = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setFetchingClients(true);
    try {
      const { data, error } = await supabase
        .from('galleries').select('*').order('created_at', { ascending: false });
      if (!error && data) setClientsList(data);
    } catch (err) { console.error('Gagal mengambil daftar klien:', err); }
    finally { setFetchingClients(false); }
  }, [supabase]);

  const fetchSelections = useCallback(async () => {
    setFetchingSelections(true);
    try {
      const { data, error } = await supabase
        .from('photo_selections')
        .select(`*, galleries ( client_name, max_photos )`)
        .order('updated_at', { ascending: false });
      if (!error && data) setSelections(data as PhotoSelection[]);
      else if (error) console.error('Gagal fetch selections:', error);
    } finally {
      setFetchingSelections(false);
    }
  }, [supabase]);

  const loadPortfolioCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/portfolio');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal memuat kategori portofolio.');
      setPortfolioCategories(result.categories || []);
    } catch (error) {
      setPortfolioMessage(error instanceof Error ? error.message : 'Gagal memuat kategori portofolio.');
    }
  }, []);


  useEffect(() => { loadPortfolioCategories(); }, [loadPortfolioCategories]);

  const fetchPortfolioPhotos = async () => {
    if (!portfolioFolderUrl.trim()) {
      setPortfolioMessage('Masukkan link folder Google Drive terlebih dahulu.');
      return;
    }
    setPortfolioLoading(true);
    setPortfolioMessage('');
    try {
      const response = await fetch(`/api/admin/portfolio-photos?folderId=${encodeURIComponent(portfolioFolderUrl)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal mengambil foto.');
      setPortfolioPhotos(result.photos || []);
      setPortfolioMessage(result.photos?.length ? `${result.photos.length} foto ditemukan.` : 'Folder terbaca, tetapi belum ada foto yang ditemukan.');
    } catch (error) {
      setPortfolioMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil foto.');
    } finally {
      setPortfolioLoading(false);
    }
  };

  const savePortfolioCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = portfolioTitle.trim();
    const folderId = extractFolderId(portfolioFolderUrl);
    if (!title || !folderId) {
      setPortfolioMessage('Judul dan link folder Google Drive wajib diisi dengan benar.');
      return;
    }
    const slug = title.toLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const duplicate = portfolioCategories.some(item => item.slug === slug && item.slug !== editingPortfolioSlug);
    if (duplicate) {
      setPortfolioMessage('Judul tersebut sudah digunakan. Pilih judul lain.');
      return;
    }
    const next = editingPortfolioSlug
      ? portfolioCategories.map(item => item.slug === editingPortfolioSlug ? { title, slug, folderId } : item)
      : [...portfolioCategories, { title, slug, folderId }];
    setPortfolioSaving(true);
    setPortfolioMessage('');
    try {
      const response = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: next })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan portofolio.');
      setPortfolioCategories(result.categories || next);
      setPortfolioTitle('');
      setPortfolioFolderUrl('');
      setPortfolioPhotos([]);
      setEditingPortfolioSlug(null);
      setPortfolioMessage('Kategori portofolio berhasil disimpan.');
    } catch (error) {
      setPortfolioMessage(error instanceof Error ? error.message : 'Gagal menyimpan portofolio.');
    } finally {
      setPortfolioSaving(false);
    }
  };

  const editPortfolioCategory = (category: PortfolioCategory) => {
    setEditingPortfolioSlug(category.slug);
    setPortfolioTitle(category.title);
    setPortfolioFolderUrl(`https://drive.google.com/drive/folders/${category.folderId}`);
    setPortfolioPhotos([]);
    setPortfolioMessage('');
  };

  const deletePortfolioCategory = async (slug: string) => {
    if (!window.confirm('Hapus kategori portofolio ini dari homepage? Foto di Google Drive tidak akan ikut terhapus.')) return;
    const next = portfolioCategories.filter(item => item.slug !== slug);
    setPortfolioSaving(true);
    try {
      const response = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: next })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menghapus kategori.');
      setPortfolioCategories(result.categories || next);
      if (editingPortfolioSlug === slug) {
        setEditingPortfolioSlug(null);
        setPortfolioTitle('');
        setPortfolioFolderUrl('');
        setPortfolioPhotos([]);
      }
      setPortfolioMessage('Kategori portofolio berhasil dihapus.');
    } catch (error) {
      setPortfolioMessage(error instanceof Error ? error.message : 'Gagal menghapus kategori.');
    } finally {
      setPortfolioSaving(false);
    }
  };

  const movePortfolioCategory = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= portfolioCategories.length) return;
    const next = [...portfolioCategories];
    [next[index], next[target]] = [next[target], next[index]];
    setPortfolioSaving(true);
    try {
      const response = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: next })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal mengubah urutan.');
      setPortfolioCategories(result.categories || next);
      setPortfolioMessage('Urutan portofolio diperbarui.');
    } catch (error) {
      setPortfolioMessage(error instanceof Error ? error.message : 'Gagal mengubah urutan.');
    } finally {
      setPortfolioSaving(false);
    }
  };

  useEffect(() => { fetchClients(); }, [fetchClients]);
  useEffect(() => { fetchSelections(); }, [fetchSelections]);

  useEffect(() => {
    const channel = supabase
      .channel('photo-selections-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'photo_selections' },
        () => fetchSelections()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchSelections, supabase]);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (!error && data) {
      setNotifications(data.map(n => ({
        id: n.id, title: n.title, desc: n.body,
        time: formatTimeAgo(n.created_at), read: n.read,
      })));
    }
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase.channel('notifications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications, supabase]);

  useEffect(() => {
    async function loadAdminSettings() {
      const { data, error } = await supabase.from('settings').select('value').eq('key', 'whatsapp_number').single();
      if (!error && data?.value) setAdminInfo(prev => ({ ...prev, whatsapp: data.value }));
    }
    loadAdminSettings();
  }, [supabase]);

  const handleSaveAdminProfile = async () => {
    try {
      const { error } = await supabase.from('settings').upsert({
        key: 'whatsapp_number', value: adminInfo.whatsapp, updated_at: new Date().toISOString()
      });
      if (error) alert('Gagal menyimpan: ' + error.message);
      else { alert('Profil berhasil diperbarui!'); setIsEditingAdmin(false); }
    } catch { alert('Terjadi kesalahan.'); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'clientName') {
      setCreatedSlug(`${value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const formatDateString = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try { return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return dateStr; }
  };

  const handleResetForm = () => {
    setFormData({ clientName: '', eventDate: '', gdriveUrl: '', maxPhotos: '', expireDate: '', notes: '' });
    setCreatedSlug(''); setEditingId(null);
  };

  const handleEditClient = (client: ClientItem) => {
    setEditingId(client.id);
    setFormData({
      clientName: client.client_name || '', eventDate: client.event_date || '',
      gdriveUrl: client.folder_id ? `https://drive.google.com/drive/folders/${client.folder_id}` : '',
      maxPhotos: client.max_photos || '', expireDate: client.expire_date || '', notes: client.notes || ''
    });
    setCreatedSlug(client.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClientFromList = async (id: string | number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data klien ini?')) return;
    try {
      const { error } = await supabase.from('galleries').delete().eq('id', id);
      if (error) alert('Gagal menghapus: ' + error.message);
      else { alert('Klien berhasil dihapus.'); if (editingId === id) handleResetForm(); fetchClients(); }
    } catch { alert('Terjadi kesalahan.'); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.gdriveUrl) { alert('Mohon isi Nama Klien dan Link Google Drive!'); return; }
    setLoading(true);
    try {
      const folderId = extractFolderId(formData.gdriveUrl);
      const generatedSlug = createdSlug || `${formData.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        client_name: formData.clientName, folder_id: folderId, slug: generatedSlug,
        max_photos: formData.maxPhotos ? Number(formData.maxPhotos) : null,
        event_date: formData.eventDate || null, expire_date: formData.expireDate || null, notes: formData.notes || null
      };
      if (editingId) {
        const { error } = await supabase.from('galleries').update(payload).eq('id', editingId);
        if (error) alert('Gagal memperbarui: ' + error.message);
        else { alert('Berhasil diperbarui!'); handleResetForm(); fetchClients(); }
      } else {
        const { error } = await supabase.from('galleries').insert([payload]);
        if (error) alert('Gagal menyimpan: ' + error.message);
        else {
          setCreatedSlug(generatedSlug);
          await supabase.from('notifications').insert([{ title: 'Klien Baru Berhasil Dibuat', body: `Galeri untuk "${formData.clientName}" siap digunakan.`, read: false }]);
          alert('Berhasil disimpan!'); handleResetForm(); fetchClients();
        }
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? `Terjadi kesalahan: ${err.message}` : 'Terjadi kesalahan.');
    } finally { setLoading(false); }
  };

  const handleCopyLink = (slug: string) => {
    if (!slug) return;
    navigator.clipboard.writeText(`${window.location.origin}/gallery/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const markAllNotifsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('read', false);
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleDuplicateClient = async (client: ClientItem) => {
    try {
      const generatedSlug = `${client.client_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error } = await supabase.from('galleries').insert([{
        client_name: `${client.client_name} (Copy)`, folder_id: client.folder_id, slug: generatedSlug,
        max_photos: client.max_photos, event_date: client.event_date, expire_date: client.expire_date, notes: client.notes
      }]);
      if (error) alert('Gagal menduplikat: ' + error.message);
      else { alert('Berhasil diduplikat!'); fetchClients(); }
    } catch { alert('Terjadi kesalahan.'); }
  };

  const handleCopySelectionText = (sel: PhotoSelection) => {
    const clientName  = sel.galleries?.client_name ?? sel.slug;
    const totalPhotos = sel.selected_photos.length;
    const fotoList    = sel.selected_photos.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
    const text =
      `*Detail Klien:* ${clientName}\n` +
      `*Total Foto Terpilih:* ${totalPhotos} Foto\n\n` +
      `*Daftar Nama Foto:*\n${fotoList}`;
    navigator.clipboard.writeText(text);
    setCopiedSelId(sel.id);
    setTimeout(() => setCopiedSelId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0f0f0f] font-sans text-gray-800 dark:text-gray-200 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <AppHeader
        navigation={
          <>
            <button type="button" onClick={() => setActiveTab('clients')}
              className={`whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium transition-colors ${activeTab === 'clients' ? 'border-amber-700 text-gray-900 dark:border-amber-400 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
              Data Klien
            </button>
            <button type="button" onClick={() => setActiveTab('portfolio')}
              className={`whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium transition-colors ${activeTab === 'portfolio' ? 'border-amber-700 text-gray-900 dark:border-amber-400 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
              Portofolio
            </button>

          </>
        }
        actions={
        <>
          <div className="flex items-center gap-4 relative">

          <div className="relative">
            <button type="button"
              onClick={() => { setIsBroadcastOpen(true); setIsNotifOpen(false); setIsProfileOpen(false); }}
              className={`p-2 rounded-full transition-colors ${BTN_GHOST}`} title="Broadcast">
              <Megaphone size={20} />
            </button>
          </div>

          <div className="relative">
            <button type="button"
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
              className={`p-2 rounded-full relative transition-colors ${BTN_GHOST}`}>
              <Bell size={20} />
              {unreadNotifCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900" />}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl z-40 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-800/50">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Notifikasi</h4>
                    {unreadNotifCount > 0 && <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">{unreadNotifCount} Baru</span>}
                  </div>
                  {unreadNotifCount > 0 && (
                    <button onClick={markAllNotifsRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                      <CheckCircle2 size={12} /> Tandai dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                  {notifications.length === 0
                    ? <p className="p-4 text-xs text-gray-400 dark:text-gray-500 text-center">Tidak ada notifikasi.</p>
                    : notifications.map(n => (
                      <div key={n.id} className={`p-3.5 hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors ${!n.read ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">{n.title}</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">{n.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{n.desc}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              className="flex items-center gap-3 p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer">
              <img src="https://i.pravatar.cc/150?img=33" alt="Admin" className="w-8 h-8 rounded-full border border-gray-200 dark:border-neutral-700" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-none">{adminInfo.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">+{adminInfo.whatsapp}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl z-40 p-4 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-neutral-800">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Profil Admin</h4>
                  <button onClick={() => setIsEditingAdmin(!isEditingAdmin)} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white flex items-center gap-1">
                    <Edit2 size={12} /> {isEditingAdmin ? 'Batal' : 'Edit'}
                  </button>
                </div>
                {isEditingAdmin ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">Nama Admin</label>
                      <input type="text" value={adminInfo.name} onChange={e => setAdminInfo({ ...adminInfo, name: e.target.value })}
                        className="w-full text-xs p-2 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:border-black dark:focus:border-neutral-500 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">No. WhatsApp (Tanpa +)</label>
                      <input type="text" value={adminInfo.whatsapp} onChange={e => setAdminInfo({ ...adminInfo, whatsapp: e.target.value })}
                        className="w-full text-xs p-2 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:border-black dark:focus:border-neutral-500 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100" />
                    </div>
                    <button onClick={handleSaveAdminProfile} className="w-full py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-medium">Simpan Profil</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg"><Phone size={16} /></div>
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">WhatsApp Studio</p>
                        <p className="text-xs font-mono font-medium text-gray-800 dark:text-gray-200">+{adminInfo.whatsapp}</p>
                      </div>
                    </div>
                    <a href={`https://wa.me/${adminInfo.whatsapp}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors">
                      <MessageSquare size={14} /> Buka WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        </>
      } />

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-10">
        {activeTab === 'clients' && (
          <>


        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-gray-900 dark:text-white mb-1">{editingId ? 'Edit Data Klien' : 'Form Data Klien'}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{editingId ? 'Perbarui data klien dan klik simpan.' : 'Isi formulir di bawah ini untuk membuatkan link galeri pemilihan foto klien.'}</p>
          </div>
          {editingId && (
            <button onClick={handleResetForm} className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-xl shadow-sm transition-all self-start sm:self-auto border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800`}>
              <Plus size={15} /> Buat Klien Baru
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className={`${CARD} p-6 rounded-2xl`}>
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-6"><UserIcon size={18} className="text-gray-400 dark:text-gray-500" /> Informasi Klien</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Nama Klien *</label>
                <input type="text" name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="Contoh: Ahmad Rizki & Keluarga" required className={INPUT} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Tanggal Acara</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className={`${INPUT} pl-9 pr-4 py-2.5 dark:scheme-dark`} />
                </div>
              </div>
            </div>
          </div>

          <div className={`${CARD} p-6 rounded-2xl`}>
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-6"><LinkIcon size={18} className="text-gray-400 dark:text-gray-500" /> Pengaturan Galeri</h2>
            <div className="mb-6">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Link Google Drive *</label>
              <div className="flex gap-2">
                <input type="url" name="gdriveUrl" value={formData.gdriveUrl} onChange={handleInputChange} placeholder="https://drive.google.com/drive/folders/..." required className={`${INPUT} flex-1 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-neutral-950`} />
                <button type="button" onClick={() => formData.gdriveUrl && window.open(formData.gdriveUrl, '_blank')}
                  className="p-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800" title="Buka Drive">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Link Slug / Galeri {editingId && '(Bisa diubah)'}</label>
              <div className="flex gap-2">
                <input type="text" value={createdSlug} onChange={e => setCreatedSlug(e.target.value)} placeholder="nama-klien-1234"
                  className={`${INPUT} flex-1 font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-neutral-950`} />
                {editingId && (
                  <button type="button"
                    onClick={() => setCreatedSlug(`${formData.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="p-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800" title="Generate Ulang">🔄</button>
                )}
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Preview: /gallery/{createdSlug}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Maksimum Foto yang Bisa Dipilih</label>
                <input type="number" name="maxPhotos" value={formData.maxPhotos} onChange={handleInputChange} placeholder="20" className={INPUT} />
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Batas jumlah foto pilihan klien.</p>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Masa Berlaku Link</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input type="date" name="expireDate" value={formData.expireDate} onChange={handleInputChange} className={`${INPUT} pl-9 pr-4 py-2.5 dark:scheme-dark`} />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Tanggal akses galeri ditutup.</p>
              </div>
            </div>
          </div>

          <div className={`${CARD} p-6 rounded-2xl`}>
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4"><FileText size={18} className="text-gray-400 dark:text-gray-500" /> Catatan <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">(Opsional)</span></h2>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} maxLength={500} placeholder="Contoh: Mohon pilih foto terbaik dan hindari foto blur." rows={4}
              className={`${INPUT} p-3 resize-none text-gray-700 dark:text-gray-200`} />
            <div className="text-right text-[11px] text-gray-400 dark:text-gray-500 mt-1">{formData.notes.length}/500</div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={handleResetForm} className="flex items-center gap-2 px-4 py-2.5 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900 transition-colors">
              <Trash2 size={16} /> Reset Form
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={handleResetForm} className="px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl text-sm font-medium transition-colors">Batal</button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-white bg-[#2a2a2a] dark:bg-neutral-100 dark:text-neutral-900 hover:bg-black dark:hover:bg-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-sm">
                {loading ? 'Menyimpan...' : editingId ? 'Perbarui Data Klien' : 'Simpan Klien Baru'}
              </button>
            </div>
          </div>
        </form>

        {/* ── Tabel klien ─────────────────────────────────────────────────── */}
        <section className={`${CARD} rounded-2xl p-6 sm:p-8 space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-neutral-800 pb-5">
            <div>
              <h2 className="text-xl font-serif text-gray-900 dark:text-white flex items-center gap-2"><ListFilter size={20} className="text-gray-500 dark:text-gray-400" /> Ringkasan Klien & Link Galeri</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Klik <span className="font-semibold text-gray-700 dark:text-gray-200">Edit</span> untuk memperbarui informasi klien.</p>
            </div>
            <button onClick={fetchClients} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto ${BTN_SECONDARY}`}>Refresh Daftar</button>
          </div>

          {fetchingClients ? (
            <div className="text-center py-12 text-sm text-gray-400 dark:text-gray-500">Memuat data klien...</div>
          ) : clientsList.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400 dark:text-gray-500">Belum ada data klien.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-800">
                    <th className={TH}>Nama Klien</th><th className={TH}>Tanggal Acara</th>
                    <th className={TH}>Maks. Foto</th><th className={TH}>Masa Berlaku</th>
                    <th className={TH}>Link Galeri</th><th className={`${TH} text-right`}>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 text-sm">
                  {clientsList.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50/80 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">{client.client_name}</td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">{formatDateString(client.event_date)}</td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">{client.max_photos ? `${client.max_photos} Foto` : '-'}</td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">{formatDateString(client.expire_date)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate max-w-[150px]">/gallery/{client.slug}</span>
                          <button onClick={() => handleCopyLink(client.slug)} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded text-gray-500 dark:text-gray-400 transition-colors" title="Salin Link">
                            {copiedSlug === client.slug ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                          </button>
                          <Link href={`/gallery/${client.slug}`} target="_blank" className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded text-gray-500 dark:text-gray-400 transition-colors" title="Buka Galeri"><ExternalLink size={14} /></Link>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditClient(client)} className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${BTN_SECONDARY}`}>Edit</button>
                          <button onClick={() => handleDuplicateClient(client)} className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 rounded-lg transition-colors">Duplikat</button>
                          <button onClick={() => handleDeleteClientFromList(client.id)} className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors" title="Hapus"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Pilihan Foto Klien ──────────────────────────────────────────── */}
        <section className={`${CARD} rounded-2xl p-6 sm:p-8 space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-neutral-800 pb-5">
            <div>
              <h2 className="text-xl font-serif text-gray-900 dark:text-white flex items-center gap-2">
                <Image size={20} className="text-gray-500 dark:text-gray-400" /> Pilihan Foto Klien
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Foto yang sudah dipilih dan/atau dikunci oleh klien. Update otomatis secara realtime.
              </p>
            </div>
            <button onClick={fetchSelections} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto ${BTN_SECONDARY}`}>
              Refresh
            </button>
          </div>

                    {fetchingSelections ? (
            <div className="text-center py-12 text-sm text-gray-400 dark:text-gray-500">Memuat pilihan foto...</div>
          ) : selections.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400 dark:text-gray-500">
              Belum ada klien yang mengirimkan pilihan foto.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-800">
                    <th className={TH}>Klien</th>
                    <th className={TH}>Foto Dipilih</th>
                    <th className={TH}>Status</th>
                    <th className={TH}>Dikirim via WA</th>
                    <th className={TH}>Terakhir Update</th>
                    <th className={TH}>Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 text-sm">
                  {selections.map(sel => (
                    <Fragment key={sel.id}>
                      <tr className="hover:bg-gray-50/80 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                          <div>{sel.galleries?.client_name ?? sel.slug}</div>
                          <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500">/gallery/{sel.slug}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-gray-900 dark:text-white">{sel.selected_photos.length}</span>
                          {sel.galleries?.max_photos && (
                            <span className="text-gray-400 dark:text-gray-500"> / {sel.galleries.max_photos}</span>
                          )}
                          <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">foto</span>
                        </td>

                        <td className="py-3.5 px-4">
                          {sel.is_locked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 rounded-full text-[11px] font-semibold">
                              <Lock size={10} /> Terkunci
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 rounded-full text-[11px] font-semibold">
                              Belum Dikunci
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {sel.sent_via_wa ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-full text-[11px] font-semibold">
                                <Send size={10} /> Sudah Dikirim
                              </span>
                              {sel.sent_at && (
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">{formatTimeAgo(sel.sent_at)}</div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-gray-500 rounded-full text-[11px]">
                              Belum Dikirim
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 text-xs">
                          {formatTimeAgo(sel.updated_at)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedSlug(expandedSlug === sel.slug ? null : sel.slug)}
                              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                            >
                              Lihat Foto
                              <ChevronDownIcon
                                size={14}
                                className={`transition-transform duration-200 ${expandedSlug === sel.slug ? 'rotate-180' : ''}`}
                              />
                            </button>
                            <button
                              onClick={() => handleCopySelectionText(sel)}
                              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${BTN_SECONDARY}`}
                              title="Salin teks pilihan"
                            >
                              {copiedSelId === sel.id
                                ? <><Check size={12} className="text-emerald-600 dark:text-emerald-400" /> Tersalin!</>
                                : <><Copy size={12} /> Salin</>
                              }
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedSlug === sel.slug && (
                        <tr>
                          <td colSpan={6} className="px-4 pb-5 pt-1 bg-gray-50/60 dark:bg-neutral-950/60">
                            {sel.selected_photos.length === 0 ? (
                              <p className="text-xs text-gray-400 dark:text-gray-500 py-3">Belum ada foto dipilih.</p>
                            ) : (
                              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2 mt-2">
                                {sel.selected_photos.map((photo, idx) => (
                                  <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800">
                                    <img
                                      src={photo.url}
                                      alt={photo.name}
                                      loading="lazy"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                                      <p className="text-white text-[9px] font-medium px-1.5 py-1 w-full truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                        {photo.name.replace(/\.[^/.]+$/, '')}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>


          </>
        )}
        {activeTab === 'portfolio' && (
          <section className={`${CARD} rounded-2xl p-6 sm:p-8 space-y-8`}>
            <div>
              <h1 className="text-3xl font-serif text-gray-900 dark:text-white mb-2">Edit Portofolio</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Buat satu kategori untuk setiap jenis layanan. Setiap kategori memiliki judul, folder Google Drive, dan halaman galeri publik sendiri.</p>
            </div>

            <form onSubmit={savePortfolioCategory} className="space-y-4 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 sm:p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white">{editingPortfolioSlug ? 'Edit Kategori Portofolio' : 'Tambah Kategori Portofolio'}</h2>
              <div>
                <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">Nama / Judul Portofolio</label>
                <input value={portfolioTitle} onChange={e => setPortfolioTitle(e.target.value)} placeholder="Contoh: Graduation Sessions" className={INPUT} required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">Link Folder Google Drive</label>
                <input value={portfolioFolderUrl} onChange={e => setPortfolioFolderUrl(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." className={INPUT} required />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={fetchPortfolioPhotos} disabled={portfolioLoading || !portfolioFolderUrl.trim()} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${BTN_SECONDARY} disabled:opacity-50`}>{portfolioLoading ? 'Memuat foto...' : 'Preview Folder'}</button>
                <button type="submit" disabled={portfolioSaving} className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-gray-900">{portfolioSaving ? 'Menyimpan...' : editingPortfolioSlug ? 'Simpan Perubahan' : 'Tambah Portofolio'}</button>
                {editingPortfolioSlug && <button type="button" onClick={() => { setEditingPortfolioSlug(null); setPortfolioTitle(''); setPortfolioFolderUrl(''); setPortfolioPhotos([]); setPortfolioMessage(''); }} className={`rounded-xl px-4 py-2.5 text-sm ${BTN_SECONDARY}`}>Batal Edit</button>}
              </div>
              {portfolioMessage && <p className="text-sm text-gray-600 dark:text-gray-300">{portfolioMessage}</p>}
              {portfolioPhotos.length > 0 && (
                <div className="pt-3">
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{portfolioPhotos.length} foto ditemukan. Preview susunan foto:</p>
                  <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
                    {portfolioPhotos.map((photo, index) => <div key={photo.id} className="mb-3 break-inside-avoid overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800"><img src={photo.url} alt={photo.name} loading="lazy" className={`w-full object-cover ${index % 4 === 0 ? 'aspect-[3/4]' : index % 4 === 1 ? 'aspect-square' : index % 4 === 2 ? 'aspect-[4/5]' : 'aspect-[5/4]'}`} /><p className="truncate px-2 py-2 text-[11px] text-gray-600 dark:text-gray-300">{photo.name}</p></div>)}
                  </div>
                </div>
              )}
            </form>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Kategori</h2><span className="text-xs text-gray-500 dark:text-gray-400">Urutan pertama tampil sebagai unggulan</span></div>
              {portfolioCategories.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada kategori. Tambahkan kategori pertama melalui formulir di atas.</p>
              ) : portfolioCategories.map((category, index) => (
                <div key={category.slug} className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0"><p className="font-medium text-gray-900 dark:text-white">{index === 0 ? '★ ' : ''}{category.title}</p><p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">/portfolio/{category.slug}</p></div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => movePortfolioCategory(index, -1)} disabled={index === 0 || portfolioSaving} className={`rounded-lg px-3 py-2 text-xs ${BTN_SECONDARY} disabled:opacity-40`}>Naik</button>
                    <button type="button" onClick={() => movePortfolioCategory(index, 1)} disabled={index === portfolioCategories.length - 1 || portfolioSaving} className={`rounded-lg px-3 py-2 text-xs ${BTN_SECONDARY} disabled:opacity-40`}>Turun</button>
                    <button type="button" onClick={() => editPortfolioCategory(category)} className={`rounded-lg px-3 py-2 text-xs ${BTN_SECONDARY}`}>Edit</button>
                    <button type="button" onClick={() => deletePortfolioCategory(category.slug)} disabled={portfolioSaving} className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100 disabled:opacity-40 dark:bg-red-950/30 dark:text-red-400">Hapus</button>
                    <Link href={`/portfolio/${category.slug}`} target="_blank" className={`rounded-lg px-3 py-2 text-xs ${BTN_SECONDARY}`}>Lihat Halaman</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        clientsList={clientsList}
        adminWhatsapp={adminInfo.whatsapp}
        appBaseUrl={typeof window !== 'undefined' ? window.location.origin : 'https://pilihin-app.vercel.app'}
      />
    </div>
  );
}
