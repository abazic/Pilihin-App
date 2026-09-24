"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { extractFolderId } from "@/lib/gdrive";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  Bell,
  ArrowLeft,
  User as UserIcon,
  Calendar,
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Clock,
  Image as ImageIcon,
  Save,
  Trash2,
} from "lucide-react";

export default function EditKlienPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const clientId = params.id;

  const [formData, setFormData] = useState({
    clientName: "",
    eventDate: "",
    gdriveUrl: "",
    maxPhotos: 20,
    expireDate: "",
    notes: "",
    slug: "",
    selectedPhotosCount: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Navigasi Sidebar
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Kelola Klien", href: "/klien", icon: Users },
    { name: "Riwayat Pesanan", href: "/pesanan", icon: ClipboardList },
    { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  ];

  // Fetch Data Klien Berdasarkan ID
  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("galleries")
      .select("*")
      .eq("id", clientId)
      .single();

    if (error) {
      alert("Gagal mengambil data klien: " + error.message);
      router.push("/klien");
    } else if (data) {
      setFormData({
        clientName: data.client_name || "",
        eventDate: data.event_date || "",
        gdriveUrl: data.gdrive_url || "",
        maxPhotos: data.max_photos || 20,
        expireDate: data.expire_date || "",
        notes: data.notes || "",
        slug: data.slug || "",
        selectedPhotosCount: data.selected_photos?.length || 0,
      });
    }
    setLoading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Perubahan ke Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName || !formData.gdriveUrl) {
      alert("Mohon isi Nama Klien dan Link Google Drive!");
      return;
    }

    setSaving(true);
    const folderId = extractFolderId(formData.gdriveUrl);

    const { error } = await supabase
      .from("galleries")
      .update({
        client_name: formData.clientName,
        event_date: formData.eventDate || null,
        gdrive_url: formData.gdriveUrl,
        folder_id: folderId || "",
        max_photos: Number(formData.maxPhotos) || 20,
        expire_date: formData.expireDate || null,
        notes: formData.notes,
      })
      .eq("id", clientId);

    setSaving(false);

    if (error) {
      alert("Gagal memperbarui data klien: " + error.message);
    } else {
      alert("Data klien berhasil diperbarui!");
      router.push("/klien");
    }
  };

  // Fungsi Hapus Klien
  const handleDelete = async () => {
    if (confirm(`Apakah kamu yakin ingin menghapus klien "${formData.clientName}"?`)) {
      const { error } = await supabase
        .from("galleries")
        .delete()
        .eq("id", clientId);

      if (error) {
        alert("Gagal menghapus klien: " + error.message);
      } else {
        alert("Klien berhasil dihapus!");
        router.push("/klien");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f6f6f6] items-center justify-center font-sans text-stone-500 text-sm">
        Memuat data klien...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f6f6] font-sans text-stone-800">
      {/* 1. Sidebar Navigasi */}
      <aside className="w-64 bg-white border-r border-stone-200/80 flex flex-col justify-between p-6 fixed h-full z-10">
        <div>
          <div className="mb-10 px-2">
            <h1 className="text-2xl font-serif font-bold italic text-stone-900 tracking-wide">
              Nyala Karya
            </h1>
            <p className="text-[10px] tracking-widest text-stone-400 font-sans uppercase font-semibold mt-0.5">
              PHOTO & VIDEO
            </p>
          </div>

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-stone-900 text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="text-xs text-stone-400 italic px-2">
          Setiap momen punya ceritanya.
        </div>
      </aside>

      {/* 2. Konten Utama */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Topbar Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-end px-8 gap-4 sticky top-0 z-10">
          <button className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 pl-2 border-l border-stone-200">
            <div className="w-8 h-8 rounded-full bg-stone-300 overflow-hidden flex items-center justify-center font-bold text-stone-700 text-xs">
              AD
            </div>
            <span className="text-sm font-semibold text-stone-800">Admin</span>
          </div>
        </header>

        {/* Area Form Edit */}
        <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/klien"
                className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 mb-4 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Klien
              </Link>
              <h1 className="text-3xl font-serif text-stone-900 font-semibold">
                Edit Data Klien
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                Perbarui rincian informasi klien atau ganti folder Google Drive.
              </p>
            </div>

            {/* Tombol Hapus */}
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl border border-red-200 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus Klien
            </button>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Form Input (Kiri) */}
            <div className="flex-1 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Informasi Klien */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <UserIcon className="w-4 h-4 text-stone-400" /> Informasi Klien
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-2">
                        Nama Klien <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-2">
                        Tanggal Acara
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="date"
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Pengaturan Galeri */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <LinkIcon className="w-4 h-4 text-stone-400" /> Pengaturan Galeri
                  </h2>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-2">
                      Link Google Drive Folder <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="gdriveUrl"
                        value={formData.gdriveUrl}
                        onChange={handleInputChange}
                        required
                        className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
                      />
                      {formData.gdriveUrl && (
                        <a
                          href={formData.gdriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-50 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-2">
                        Maksimum Foto yang Bisa Dipilih
                      </label>
                      <input
                        type="number"
                        name="maxPhotos"
                        min="1"
                        value={formData.maxPhotos}
                        onChange={handleInputChange}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-2">
                        Masa Berlaku Link
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="date"
                          name="expireDate"
                          value={formData.expireDate}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Catatan */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <FileText className="w-4 h-4 text-stone-400" /> Catatan
                  </h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={500}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 transition resize-none"
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Link
                    href="/klien"
                    className="px-5 py-2.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl transition"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 text-xs font-medium text-white bg-stone-900 hover:bg-black rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? "Memperbarui..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>

            {/* Panel Ringkasan & Akses Langsung Galeri (Kanan) */}
            <aside className="w-full xl:w-96 shrink-0 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-stone-900 text-sm">
                    Ringkasan Galeri
                  </h3>
                  {formData.slug && (
                    <Link
                      href={`/galeri/${formData.slug}`}
                      target="_blank"
                      className="text-stone-400 hover:text-stone-900 transition"
                      title="Lihat Halaman Klien"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-stone-100">
                    <span className="text-stone-400 flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5" /> Nama Klien
                    </span>
                    <span className="font-semibold text-stone-800 text-right truncate max-w-[150px]">
                      {formData.clientName || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-stone-100">
                    <span className="text-stone-400 flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5" /> Foto Terpilih
                    </span>
                    <span className="font-semibold text-stone-800">
                      {formData.selectedPhotosCount} / {formData.maxPhotos}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-stone-100">
                    <span className="text-stone-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Masa Berlaku
                    </span>
                    <span className="font-semibold text-stone-800">
                      {formData.expireDate || "-"}
                    </span>
                  </div>
                </div>

                {formData.slug && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      Link Halaman Klien (Slug)
                    </label>
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 break-all select-all font-mono">
                      /galeri/{formData.slug}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
