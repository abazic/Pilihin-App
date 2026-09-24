"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
} from "lucide-react";

export default function TambahKlienPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [formData, setFormData] = useState({
    clientName: "",
    eventDate: "",
    gdriveUrl: "",
    maxPhotos: 20,
    expireDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Navigasi Sidebar
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Kelola Klien", href: "/klien", icon: Users },
    { name: "Riwayat Pesanan", href: "/pesanan", icon: ClipboardList },
    { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName || !formData.gdriveUrl) {
      alert("Mohon isi Nama Klien dan Link Google Drive!");
      return;
    }

    setLoading(true);

    const folderId = extractFolderId(formData.gdriveUrl);
    
    // Pembuatan Slug Unik Otomatis
    const slug = `${formData.clientName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase.from("galleries").insert([
      {
        client_name: formData.clientName,
        event_date: formData.eventDate || null,
        gdrive_url: formData.gdriveUrl,
        folder_id: folderId || "",
        max_photos: Number(formData.maxPhotos) || 20,
        expire_date: formData.expireDate || null,
        notes: formData.notes,
        slug: slug,
        selected_photos: [],
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Gagal menambahkan klien: " + error.message);
    } else {
      alert("Klien baru berhasil ditambahkan!");
      router.push("/klien");
    }
  };

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

        {/* Area Form Tambah */}
        <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
          <div>
            <Link
              href="/klien"
              className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 mb-4 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Klien
            </Link>
            <h1 className="text-3xl font-serif text-stone-900 font-semibold">
              Tambah Klien Baru
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Buat galeri foto baru untuk klien dan atur batas pemilihan foto.
            </p>
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
                        placeholder="Contoh: Ahmad Rizki & Keluarga"
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
                        placeholder="https://drive.google.com/drive/folders/..."
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
                      <p className="text-[10px] text-stone-400 mt-1">
                        Jumlah maksimal foto yang dapat dipilih oleh klien.
                      </p>
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
                      <p className="text-[10px] text-stone-400 mt-1">
                        Setelah tanggal ini, link galeri tidak dapat diakses.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Catatan */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <FileText className="w-4 h-4 text-stone-400" /> Catatan{" "}
                    <span className="text-stone-400 font-normal text-xs">
                      (Opsional)
                    </span>
                  </h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Contoh: Mohon pilih foto terbaik dan hindari foto blur."
                    rows={4}
                    maxLength={500}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 transition resize-none"
                  ></textarea>
                  <div className="text-right text-[10px] text-stone-400">
                    {formData.notes.length}/500
                  </div>
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
                    disabled={loading}
                    className="px-6 py-2.5 text-xs font-medium text-white bg-stone-900 hover:bg-black rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {loading ? "Menyimpan..." : "Simpan Klien Baru"}
                  </button>
                </div>
              </form>
            </div>

            {/* Panel Ringkasan (Kanan) */}
            <aside className="w-full xl:w-96 shrink-0 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-5">
                <h3 className="font-semibold text-stone-900 text-sm">
                  Ringkasan Klien Baru
                </h3>

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
                      <Calendar className="w-3.5 h-3.5" /> Tanggal Acara
                    </span>
                    <span className="font-semibold text-stone-800">
                      {formData.eventDate || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-stone-100">
                    <span className="text-stone-400 flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5" /> Maks. Foto
                    </span>
                    <span className="font-semibold text-stone-800">
                      {formData.maxPhotos} foto
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

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-500 leading-relaxed">
                  💡 Klien akan menerima link unik setelah disimpan untuk memilih foto dari folder Google Drive yang ditautkan.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
