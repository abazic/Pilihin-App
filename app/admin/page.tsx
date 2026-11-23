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
  Phone, MessageSquare, CheckCircle2, ListFilter, Megaphone,
  Lock, Send, Image, ChevronDown as ChevronDownIcon,
} from 'lucide-react';

const DEFAULT_PRICELIST = {
  title: 'Graduation Photoshoot 2026',
  subtitle: 'Rayakan perjalanan panjangmu lewat foto yang layak untuk dikenang.',
  packages: [{"name":"Solo Graduate","price":"Rp 250K","detail":"1 Graduate","duration":"1 jam","locations":"1 lokasi","photos":"20 foto edited","extras":"Unlimited shots"},{"name":"Duo Graduate","price":"Rp 400K","detail":"2 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"30 foto edited","extras":"Unlimited shots"},{"name":"Group Session","price":"Rp 700K","detail":"3–5 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"60 foto edited","extras":"Unlimited shots"},{"name":"Large Group","price":"Rp 900K","detail":"6–10 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"100 foto edited","extras":"Unlimited shots"},{"name":"Extended Group","price":"Rp 100K/person","detail":">10 Graduates","duration":"3–4 jam","locations":"1 lokasi","photos":"100 foto edited","extras":"Unlimited shots"}],
  addons: [{"name":"Extra 60 menit","price":"+Rp 100K"},{"name":"Extra lokasi","price":"+Rp 100K"},{"name":"Extra 10 foto edited","price":"+Rp 50K"},{"name":"Same Day Edit","price":"+Rp 300K"},{"name":"Family >5 orang","price":"+Rp 50K/orang"}],
  video: { name: 'Shoot & Edit', price: 'Rp 600K', duration: '', description: 'Video dokumentasi graduation' },
  whatsappMessage: 'Halo kak, bisa booking foto graduation?',
  services: [{"id":"graduation","title":"Graduation Photography","description":"Sesi foto dan video untuk merayakan kelulusan.","showInService":true,"photoPackages":[{"name":"Solo Graduate","price":"Rp 250K","detail":"1 Graduate","duration":"1 jam","locations":"1 lokasi","photos":"20 foto edited","extras":"Unlimited shots"},{"name":"Duo Graduate","price":"Rp 400K","detail":"2 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"30 foto edited","extras":"Unlimited shots"},{"name":"Group Session","price":"Rp 700K","detail":"3–5 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"60 foto edited","extras":"Unlimited shots"},{"name":"Large Group","price":"Rp 900K","detail":"6–10 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"100 foto edited","extras":"Unlimited shots"},{"name":"Extended Group","price":"Rp 100K/person","detail":">10 Graduates","duration":"3–4 jam","locations":"1 lokasi","photos":"100 foto edited","extras":"Unlimited shots"}],"videoPackages":[{"name":"Shoot & Edit","price":"Rp 600K","detail":"Video dokumentasi graduation"}],"addons":[{"name":"Extra 60 menit","price":"+Rp 100K"},{"name":"Extra lokasi","price":"+Rp 100K"},{"name":"Extra 10 foto edited","price":"+Rp 50K"},{"name":"Same Day Edit","price":"+Rp 300K"},{"name":"Family >5 orang","price":"+Rp 50K/orang"}]},{"id":"wedding-events","title":"Wedding & Events","description":"Dokumentasi foto dan video untuk pernikahan serta berbagai acara.","showInService":true,"photoPackages":[],"videoPackages":[],"addons":[]},{"id":"personal-projects","title":"Personal Projects","description":"Sesi fotografi dan videografi untuk kebutuhan personal maupun kreatif.","showInService":true,"photoPackages":[],"videoPackages":[],"addons":[]}],
};
type PricePackage = { name: string; price: string; detail: string; duration: string; locations: string; photos: string; extras: string };
type PriceAddon = { name: string; price: string };
type PriceServiceItem = { name: string; price: string; detail?: string; duration?: string; locations?: string; photos?: string; extras?: string };
type PriceService = { id: string; title: string; description: string; showInService: boolean; headerImageUrl?: string; photoPackages: PriceServiceItem[]; videoPackages: PriceServiceItem[]; addons: PriceAddon[] };
type PricelistData = { title: string; subtitle: string; packages: PricePackage[]; addons: PriceAddon[]; video: { name: string; price: string; duration?: string; description: string }; whatsappMessage: string; services: PriceService[] };

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

function toDateInputDisplay(value: string | null | undefined): string {
  if (!value) return '';
  const match = value.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function toIsoDate(value: string): string | null {
  const match = value.trim().match(/^(\\d{2})\\/(\\d{2})\\/(\\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return `${year}-${month}-${day}`;
}


type AdminBooking = {
  id: string; booking_code: string; customer_name: string; whatsapp: string;
  session_date: string; session_time: string; locations: string[]; package_name: string;
  participants: number; addons: { name: string; price: number }[]; total_price: number;
  notes: string | null; status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  admin_notes: string | null;
};
const bookingStatusText: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected', completed: 'Completed',
};
function AdminBookingsPanel() {
  const [items, setItems] = useState<AdminBooking[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const syncSheets = async () => {
    setSyncingSheets(true);
    try {
      const response = await fetch('/api/admin/bookings', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sinkronisasi gagal.');
      setMessage(data.synced + ' booking berhasil disinkronkan ke Google Sheets.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sinkronisasi gagal.');
    } finally { setSyncingSheets(false); }
  };
  const load = async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/bookings');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memuat booking.');
      setItems(data.bookings || []);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memuat booking.');
    } finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  const shown = items.filter(booking =>
    (filter === 'all' || booking.status === filter) &&
    (!search || [booking.booking_code, booking.customer_name, booking.whatsapp]
      .some(value => value.toLowerCase().includes(search.toLowerCase())))
  );
  const update = async (booking: AdminBooking, status: AdminBooking['status']) => {
    setBusy(true);
    try {
      const note = (document.getElementById('admin-booking-note-' + booking.id) as HTMLTextAreaElement | null)?.value || '';
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, status, admin_notes: note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update booking gagal.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Update booking gagal.');
      setBusy(false);
    }
  };
  const deleteBooking = async (booking: AdminBooking) => {
    const confirmed = window.confirm(`Hapus booking ${booking.booking_code} atas nama ${booking.customer_name}? Data ini akan dihapus permanen.`);
    if (!confirmed) return;
    setDeletingId(booking.id);
    setMessage('');
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menghapus booking.');
      setItems(current => current.filter(item => item.id !== booking.id));
      setMessage('Booking ' + booking.booking_code + ' berhasil dihapus.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menghapus booking.');
    } finally {
      setDeletingId(null);
    }
  };
  const confirmedBookings = items.filter(item => item.status === 'confirmed');
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const calendarDays = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarOffset = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const bookingsByDate = confirmedBookings.reduce<Record<string, AdminBooking[]>>((groups, booking) => {
    const dateKey = booking.session_date?.slice(0, 10);
    if (dateKey) groups[dateKey] = [...(groups[dateKey] || []), booking];
    return groups;
  }, {});
  const money = (amount: number) => 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  const pill = (status: string) => 'rounded-full px-3 py-1 text-xs font-medium ' +
    (status === 'confirmed' ? 'bg-green-100 text-green-700' : status === 'rejected' ? 'bg-red-100 text-red-700' : status === 'completed' ? 'bg-neutral-200 text-neutral-700' : 'bg-amber-100 text-amber-800');
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[.25em] text-amber-800 dark:text-amber-400">Admin · Reservation</p><h1 className="mt-2 font-serif text-3xl text-gray-900 dark:text-white">Photo Bookings</h1><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Kelola permintaan booking, konfirmasi jadwal, dan status sesi.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={syncSheets} disabled={syncingSheets || busy} className={`rounded-lg px-4 py-2 text-sm ${BTN_SECONDARY} disabled:opacity-50`}>{syncingSheets ? 'Syncing...' : 'Sync Spreadsheet'}</button><button type="button" onClick={load} disabled={busy} className={`rounded-lg px-4 py-2 text-sm ${BTN_SECONDARY} disabled:opacity-50`}>{busy ? 'Memuat...' : 'Refresh'}</button></div>
      </header>
      <div className="grid gap-3 sm:grid-cols-4">
        {(['pending','confirmed','rejected','completed'] as const).map(status => <div key={status} className={`${CARD} rounded-xl p-4`}><p className="text-xs uppercase text-gray-500 dark:text-gray-400">{bookingStatusText[status]}</p><p className="mt-1 font-serif text-3xl">{items.filter(item => item.status === status).length}</p></div>)}
      </div>
      <section className={`${CARD} rounded-2xl p-4 sm:p-5 space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kalender Booking Terkonfirmasi</h2><p className="text-xs text-gray-500 dark:text-gray-400">Menampilkan jadwal booking dengan status Confirmed.</p></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1))} className={`rounded-lg px-3 py-2 text-sm ${BTN_SECONDARY}`} aria-label="Bulan sebelumnya">‹</button>
            <span className="min-w-32 text-center text-sm font-medium text-gray-800 dark:text-gray-200">{calendarMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
            <button type="button" onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1))} className={`rounded-lg px-3 py-2 text-sm ${BTN_SECONDARY}`} aria-label="Bulan berikutnya">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Min","Sen","Sel","Rab","Kam","Jum","Sab"].map(day => <div key={day} className="py-2 text-[11px] font-semibold uppercase text-gray-400">{day}</div>)}
          {Array.from({ length: calendarOffset }, (_, index) => <div key={`empty-${index}`} className="min-h-16 rounded-lg bg-gray-50/60 dark:bg-neutral-950/40 sm:min-h-24" />)}
          {Array.from({ length: calendarDays }, (_, index) => {
            const day = index + 1;
            const dateKey = `${calendarYear}-${String(calendarMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayBookings = bookingsByDate[dateKey] || [];
            const today = new Date();
            const isToday = today.getFullYear() === calendarYear && today.getMonth() === calendarMonthIndex && today.getDate() === day;
            return <div key={dateKey} className={`min-h-16 rounded-lg border p-1 text-left sm:min-h-24 sm:p-2 ${isToday ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/20" : "border-gray-100 dark:border-neutral-800"}`}>
              <div className={`text-xs font-medium ${isToday ? "text-amber-700 dark:text-amber-400" : "text-gray-600 dark:text-gray-300"}`}>{day}</div>
              <div className="mt-1 space-y-1">
                {dayBookings.slice(0, 2).map(booking => <div key={booking.id} title={`${booking.customer_name} · ${booking.session_time}`} className="truncate rounded bg-green-100 px-1 py-1 text-[9px] leading-tight text-green-800 dark:bg-green-950/60 dark:text-green-300 sm:text-[11px]">{booking.session_time} {booking.customer_name}</div>)}
                {dayBookings.length > 2 && <p className="px-1 text-[9px] text-gray-500">+{dayBookings.length - 2} lainnya</p>}
              </div>
            </div>;
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{confirmedBookings.length} booking confirmed · Jadwal ditampilkan berdasarkan tanggal sesi.</p>
      </section>
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Cari nama, kode booking, WhatsApp" className={`${INPUT} min-w-[220px] flex-1`} />
        <select value={filter} onChange={event => setFilter(event.target.value)} className={`${INPUT} sm:w-52`}><option value="all">Semua status</option>{Object.entries(bookingStatusText).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select>
      </div>
      {message && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
      {busy && items.length === 0 ? <p className="py-12 text-center text-sm text-gray-500">Memuat booking...</p> : shown.length === 0 ? <p className={`${CARD} rounded-2xl border-dashed p-12 text-center text-sm text-gray-500 dark:text-gray-400`}>Belum ada booking yang cocok.</p> : <div className="space-y-4">
        {shown.map(booking => <article key={booking.id} className={`${CARD} rounded-2xl p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs tracking-wider text-gray-400">{booking.booking_code}</p><h2 className="mt-1 text-xl font-medium text-gray-900 dark:text-white">{booking.customer_name}</h2><p className="text-sm text-gray-500">{booking.session_date} · {booking.session_time}</p></div><span className={pill(booking.status)}>{bookingStatusText[booking.status]}</span></div>
          <div className="mt-4 grid gap-2 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-2">
            <p><span className="text-gray-500">WhatsApp:</span> {booking.whatsapp}</p><p><span className="text-gray-500">Paket:</span> {booking.package_name} ({booking.participants} peserta)</p>
            <p><span className="text-gray-500">Lokasi:</span> {booking.locations?.join(' / ') || '-'}</p><p><span className="text-gray-500">Add-ons:</span> {booking.addons?.map(addon => addon.name).join(', ') || '-'}</p>
            <p className="font-semibold">Total: {money(booking.total_price)}</p><p><span className="text-gray-500">Catatan klien:</span> {booking.notes || '-'}</p>
          </div>
          <label className="mt-4 block text-xs text-gray-500">Catatan admin<textarea id={'admin-booking-note-' + booking.id} defaultValue={booking.admin_notes || ''} rows={2} className={`${INPUT} mt-2`} /></label>
          <div className="mt-3 flex flex-wrap gap-2"><a href={'https://wa.me/' + booking.whatsapp.replace(/\\D/g,'')} target="_blank" rel="noopener noreferrer" className="rounded-full border border-green-700/30 px-4 py-2 text-sm text-green-700 dark:text-green-400">Chat klien ↗</a>{(['pending','confirmed','rejected','completed'] as const).map(status => <button type="button" key={status} disabled={busy} onClick={() => update(booking,status)} className="rounded-full border border-gray-300 px-3 py-2 text-xs transition hover:bg-gray-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800">{status === 'confirmed' ? 'Confirm' : status === 'rejected' ? 'Reject' : status === 'completed' ? 'Complete' : 'Set pending'}</button>)}<button type="button" disabled={busy || deletingId !== null} onClick={() => deleteBooking(booking)} className="rounded-full border border-red-300 px-3 py-2 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30">{deletingId === booking.id ? 'Menghapus...' : <><Trash2 size={13} className="mr-1 inline" />Hapus</>}</button></div>
        </article>)}
      </div>}
    </section>
  );
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
  const [adminInfo, setAdminInfo] = useState({ name: 'Admin inStories creative', whatsapp: DEFAULT_WHATSAPP_NUMBER });
  const [isProfileOpen, setIsProfileOpen]   = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen]       = useState<boolean>(false);
  const [notifications, setNotifications]   = useState<NotificationItem[]>([]);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'clients' | 'portfolio' | 'pricelist' | 'contact' | 'bookings'>('bookings');
  useEffect(() => { if (new URLSearchParams(window.location.search).get('section') === 'bookings') setActiveTab('bookings'); }, []);
  const [portfolioCategories, setPortfolioCategories] = useState<PortfolioCategory[]>([]);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioFolderUrl, setPortfolioFolderUrl] = useState('');
  const [portfolioPhotos, setPortfolioPhotos] = useState<{ id: string; name: string; url: string }[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioSaving, setPortfolioSaving] = useState(false);
  const [portfolioMessage, setPortfolioMessage] = useState('');
  const [editingPortfolioSlug, setEditingPortfolioSlug] = useState<string | null>(null);
  const [pricelist, setPricelist] = useState<PricelistData>(DEFAULT_PRICELIST);
  const [pricelistSaving, setPricelistSaving] = useState(false);
  const [pricelistMessage, setPricelistMessage] = useState('');
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);


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

  const loadPricelist = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/pricelist');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal memuat pricelist.');
      setPricelist({ ...DEFAULT_PRICELIST, ...result.pricelist, services: Array.isArray(result.pricelist?.services) ? result.pricelist.services : DEFAULT_PRICELIST.services });
    } catch (error) { setPricelistMessage(error instanceof Error ? error.message : 'Gagal memuat pricelist.'); }
  }, []);

  useEffect(() => { loadPricelist(); }, [loadPricelist]);

  const savePricelist = async () => {
    setPricelistSaving(true); setPricelistMessage('');
    try {
      const response = await fetch('/api/admin/pricelist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pricelist }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan pricelist.');
      setPricelist({ ...DEFAULT_PRICELIST, ...result.pricelist, services: Array.isArray(result.pricelist?.services) ? result.pricelist.services : DEFAULT_PRICELIST.services });
      setPricelistMessage('Pricelist berhasil disimpan dan halaman publik diperbarui.');
    } catch (error) { setPricelistMessage(error instanceof Error ? error.message : 'Gagal menyimpan pricelist.'); }
    finally { setPricelistSaving(false); }
  };

  const updatePricePackage = (index: number, field: keyof PricePackage, value: string) => setPricelist(prev => ({ ...prev, packages: prev.packages.map((item, i) => i === index ? { ...item, [field]: value } : item) }));
  const updatePriceAddon = (index: number, field: keyof PriceAddon, value: string) => setPricelist(prev => ({ ...prev, addons: prev.addons.map((item, i) => i === index ? { ...item, [field]: value } : item) }));


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
      const [{ data, error }, { data: socialData }] = await Promise.all([
        supabase.from('settings').select('value').eq('key', 'whatsapp_number').maybeSingle(),
        supabase.from('settings').select('value').eq('key', 'social_media_links').maybeSingle(),
      ]);
      if (!error && data?.value) setAdminInfo(prev => ({ ...prev, whatsapp: data.value }));
      try {
        const parsed = typeof socialData?.value === 'string' ? JSON.parse(socialData.value) : socialData?.value;
        setSocialLinks(Array.isArray(parsed) ? parsed : []);
      } catch { setSocialLinks([]); }
    }
    loadAdminSettings();
  }, [supabase]);

  const handleSaveAdminProfile = async () => {
    try {
      const cleanSocialLinks = socialLinks
        .map(item => ({ platform: item.platform.trim(), url: item.url.trim() }))
        .filter(item => item.platform && /^https?:\/\//i.test(item.url));
      const response = await fetch('/api/admin/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: adminInfo.whatsapp.replace(/\D/g, ''),
          socialLinks: cleanSocialLinks,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan kontak.');
      setAdminInfo(prev => ({ ...prev, whatsapp: result.whatsapp }));
      setSocialLinks(result.socialLinks);
      alert('Kontak berhasil diperbarui!');
    } catch (error) {
      alert(error instanceof Error ? 'Gagal menyimpan contact: ' + error.message : 'Terjadi kesalahan saat menyimpan contact.');
    }
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
      clientName: client.client_name || '', eventDate: toDateInputDisplay(client.event_date),
      gdriveUrl: client.folder_id ? `https://drive.google.com/drive/folders/${client.folder_id}` : '',
      maxPhotos: client.max_photos || '', expireDate: toDateInputDisplay(client.expire_date), notes: client.notes || ''
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
      if ((formData.eventDate && !toIsoDate(formData.eventDate)) || (formData.expireDate && !toIsoDate(formData.expireDate))) { alert('Format tanggal harus dd/mm/yyyy dan tanggal harus valid.'); setLoading(false); return; }\n      const payload = {
        client_name: formData.clientName, folder_id: folderId, slug: generatedSlug,
        max_photos: formData.maxPhotos ? Number(formData.maxPhotos) : null,
        event_date: formData.eventDate ? toIsoDate(formData.eventDate) : null, expire_date: formData.expireDate ? toIsoDate(formData.expireDate) : null, notes: formData.notes || null
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
            <button type="button" onClick={() => setActiveTab('bookings')}
              className={`whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'border-amber-700 text-gray-900 dark:border-amber-400 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
              Booking
            </button>
            <button type="button" onClick={() => setActiveTab('clients')}
              className={`whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium transition-colors ${activeTab === 'clients' ? 'border-amber-700 text-gray-900 dark:border-amber-400 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
              Data Klien
            </button>
            <button type="button" onClick={() => setActiveTab('portfolio')}
              className={`whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium transition-colors ${activeTab === 'portfolio' ? 'border-amber-700 text-gray-900 dark:border-amber-400 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
              Portofolio
            </button>
            <button type="button" onClick={() => setActiveTab('contact')}
              className={`whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium transition-colors ${activeTab === 'contact' ? 'border-amber-700 text-gray-900 dark:border-amber-400 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
              Edit Contact
            </button>
            <button type="button" onClick={() => setActiveTab('pricelist')}
              className={`whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium transition-colors ${activeTab === 'pricelist' ? 'border-amber-700 text-gray-900 dark:border-amber-400 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
              Pricelist
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
              <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl z-40 p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="pb-3 border-b border-gray-100 dark:border-neutral-800">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Profil Admin</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg"><Phone size={16} /></div>
                    <div><p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">WhatsApp Studio</p><p className="text-xs font-mono font-medium text-gray-800 dark:text-gray-200">+{adminInfo.whatsapp}</p></div>
                  </div>
                  <a href={`https://wa.me/${adminInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"><MessageSquare size={14} /> Buka WhatsApp</a>
                  <button type="button" onClick={() => { setActiveTab('contact'); setIsProfileOpen(false); }} className={`w-full rounded-lg px-3 py-2 text-xs font-medium ${BTN_SECONDARY}`}>Kelola Kontak</button>
                </div>
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
                  <input type="text" name="eventDate" inputMode="numeric" value={formData.eventDate} onChange={handleInputChange} placeholder="dd/mm/yyyy" maxLength={10} className={`${INPUT} pl-9 pr-4 py-2.5`} />
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
                  <input type="text" name="expireDate" inputMode="numeric" value={formData.expireDate} onChange={handleInputChange} placeholder="dd/mm/yyyy" maxLength={10} className={`${INPUT} pl-9 pr-4 py-2.5`} />
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
        {activeTab === 'contact' && (
          <section className={`${CARD} rounded-2xl p-6 sm:p-8 space-y-6`}>
            <div>
              <h1 className="text-3xl font-serif text-gray-900 dark:text-white">Edit Contact</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Kelola nomor WhatsApp admin dan tautan social media yang tampil di bagian Contact website.</p>
            </div>
            <div className="max-w-2xl space-y-5">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-neutral-800">
                <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">WhatsApp Admin</h2>
                <label className="block text-sm text-gray-700 dark:text-gray-300">Nomor WhatsApp (kode negara, tanpa tanda +)
                  <input type="tel" value={adminInfo.whatsapp} onChange={e => setAdminInfo(prev => ({ ...prev, whatsapp: e.target.value }))} placeholder="6281234567890" className={`${INPUT} mt-2`} />
                </label>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Contoh: 6281234567890. Hanya angka yang akan disimpan.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div><h2 className="font-semibold text-gray-900 dark:text-white">Social Media</h2><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Isi nama akun yang akan ditampilkan dan URL profil. Ikon akan dikenali otomatis dari URL.</p></div>
                  <button type="button" onClick={() => setSocialLinks(prev => [...prev, { platform: '', url: '' }])} className={`rounded-lg px-3 py-2 text-xs ${BTN_SECONDARY}`}><Plus size={13} className="mr-1 inline" />Tambah</button>
                </div>
                {socialLinks.map((item, index) => (
                  <div key={index} className="grid gap-2 rounded-lg border border-gray-200 p-3 dark:border-neutral-700 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
                    <input aria-label="Nama akun" placeholder="@pilihinfotomu" value={item.platform} onChange={e => setSocialLinks(prev => prev.map((social, i) => i === index ? { ...social, platform: e.target.value } : social))} className={INPUT} />
                    <input aria-label="URL social media" type="url" placeholder="https://..." value={item.url} onChange={e => setSocialLinks(prev => prev.map((social, i) => i === index ? { ...social, url: e.target.value } : social))} className={INPUT} />
                    <button type="button" onClick={() => setSocialLinks(prev => prev.filter((_, i) => i !== index))} className="rounded-lg px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">Hapus</button>
                  </div>
                ))}
                {socialLinks.length === 0 && <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400 dark:border-neutral-700">Belum ada akun social media. Klik Tambah untuk menambahkan.</p>}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={handleSaveAdminProfile} className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900">Simpan Contact</button>
                <a href={`https://wa.me/${adminInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={`rounded-xl px-5 py-3 text-sm ${BTN_SECONDARY}`}>Tes WhatsApp ↗</a>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'pricelist' && (
          <section className={`${CARD} rounded-2xl p-6 sm:p-8 space-y-8`}>
            <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-serif text-gray-900 dark:text-white">Kelola Pricelist & Service</h1><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Service adalah jenis pekerjaan fotografi. Di dalamnya, atur paket foto, paket video, dan add-on.</p></div><Link href="/pricelist" target="_blank" className={`${BTN_SECONDARY} rounded-lg px-4 py-2 text-sm`}>Preview halaman ↗</Link></div>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Jenis Service</h2><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Contoh: Graduation Photography, Wedding & Events, Personal Projects.</p></div><button type="button" onClick={()=>setPricelist(p=>({...p,services:[...(p.services||[]),{id:'service-'+Date.now(),title:'Service Baru',description:'',showInService:true,photoPackages:[],videoPackages:[],addons:[]}]}))} className={`rounded-lg px-4 py-2 text-sm ${BTN_SECONDARY}`}><Plus size={14} className="mr-1 inline"/>Tambah Jenis Service</button></div>
            {(pricelist.services||[]).map((service,si)=><article key={service.id} className="space-y-5 rounded-xl border border-gray-200 p-4 dark:border-neutral-800">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-gray-400">SERVICE {si+1}</span><button type="button" onClick={()=>{if(window.confirm('Hapus service '+service.title+' beserta semua paketnya?'))setPricelist(p=>({...p,services:p.services.filter(s=>s.id!==service.id)}));}} className="text-xs text-red-500">Hapus Service</button></div>
              <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Nama Jenis Service<input value={service.title} onChange={e=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,title:e.target.value}:s)}))} placeholder="Contoh: Wedding & Events" className={`${INPUT} mt-1`}/></label><label className="flex items-center gap-2 self-end pb-3 text-sm"><input type="checkbox" checked={service.showInService!==false} onChange={e=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,showInService:e.target.checked}:s)}))}/>Tampilkan di homepage Service</label><label className="text-sm sm:col-span-2">Link foto background header<input type="url" value={service.headerImageUrl||''} onChange={e=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,headerImageUrl:e.target.value}:s)}))} placeholder="https://.../foto-header.jpg" className={`${INPUT} mt-1`}/><span className="mt-1 block text-xs text-gray-500">Gunakan URL gambar langsung (JPG, PNG, atau WebP). Kosongkan untuk memakai background default.</span>{service.headerImageUrl&&<img src={service.headerImageUrl} alt="Preview background service" className="mt-3 h-32 w-full rounded-lg object-cover" onError={e=>{e.currentTarget.style.display='none';}}/>}</label><label className="text-sm sm:col-span-2">Deskripsi<textarea rows={2} value={service.description||''} onChange={e=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,description:e.target.value}:s)}))} placeholder="Deskripsi jenis layanan..." className={`${INPUT} mt-1`}/></label></div>
              {([['photoPackages','Photo Packages'],['videoPackages','Video Packages']] as const).map(([field,heading])=><div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-neutral-950" key={field}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{heading}</h3><button type="button" onClick={()=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,[field]:[...(s[field]||[]),{name:'Paket Baru',price:'',detail:'',duration:'',locations:'',photos:'',extras:''}]}:s)}))} className={`rounded-lg px-3 py-2 text-xs ${BTN_SECONDARY}`}><Plus size={13} className="mr-1 inline"/>Tambah Paket</button></div>
                {(service[field]||[]).length===0&&<p className="text-xs text-gray-500">Belum ada {heading.toLowerCase()}.</p>}
                {(service[field]||[]).map((item,ii)=><div key={ii} className="space-y-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-gray-400">PAKET {ii+1}</span><button type="button" onClick={()=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,[field]:s[field].filter((_,i)=>i!==ii)}:s)}))} className="text-xs text-red-500">Hapus Paket</button></div><div className="grid gap-3 sm:grid-cols-2">{([['name','Nama Paket'],['price','Harga'],['detail','Keterangan'],['duration','Durasi'],['locations','Lokasi'],['photos','Jumlah foto'],['extras','Fasilitas / detail tambahan']] as const).map(([key,label])=><label key={key} className="text-xs">{label}<input value={item[key]||''} onChange={e=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,[field]:s[field].map((it,i)=>i===ii?{...it,[key]:e.target.value}:it)}:s)}))} className={`${INPUT} mt-1`}/></label>)}</div></div>)}
              </div>)}
              <div className="space-y-3 rounded-lg border border-dashed border-gray-300 p-4 dark:border-neutral-700"><div className="flex items-center justify-between"><h3 className="font-semibold">Add-ons (opsional)</h3><button type="button" onClick={()=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,addons:[...(s.addons||[]),{name:'Add-on Baru',price:''}]}:s)}))} className={`rounded-lg px-3 py-2 text-xs ${BTN_SECONDARY}`}><Plus size={13} className="mr-1 inline"/>Tambah Add-on</button></div>{(service.addons||[]).map((item,ii)=><div key={ii} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"><label className="text-xs">Nama<input value={item.name} onChange={e=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,addons:s.addons.map((it,i)=>i===ii?{...it,name:e.target.value}:it)}:s)}))} className={`${INPUT} mt-1`}/></label><label className="text-xs">Harga<input value={item.price} onChange={e=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,addons:s.addons.map((it,i)=>i===ii?{...it,price:e.target.value}:it)}:s)}))} className={`${INPUT} mt-1`}/></label><button type="button" onClick={()=>setPricelist(p=>({...p,services:p.services.map(s=>s.id===service.id?{...s,addons:s.addons.filter((_,i)=>i!==ii)}:s)}))} className="pb-2 text-xs text-red-500">Hapus</button></div>)}</div>
            </article>)}
            <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5 dark:border-neutral-800"><button type="button" onClick={savePricelist} disabled={pricelistSaving} className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-gray-900">{pricelistSaving?'Menyimpan...':'Simpan Pricelist'}</button>{pricelistMessage&&<p className="text-sm text-gray-600 dark:text-gray-300">{pricelistMessage}</p>}</div>
          </section>
        )}
        {activeTab === 'portfolio' && (
          <section className={`${CARD} rounded-2xl p-6 sm:p-8 space-y-8`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif text-gray-900 dark:text-white mb-2">Edit Portofolio</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Buat satu kategori untuk setiap jenis layanan. Setiap kategori memiliki judul, folder Google Drive, dan halaman galeri publik sendiri.</p>
              </div>
              <Link href="/pricelist" target="_blank" className={`rounded-lg px-4 py-2 text-sm ${BTN_SECONDARY}`}>Lihat Pricelist ↗</Link>
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

        {activeTab === 'bookings' && <AdminBookingsPanel />}
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
