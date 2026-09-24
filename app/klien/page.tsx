"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  Bell,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

// Tipe Data Klien
interface Klien {
  id: string;
  nama: string;
  kategori: string;
  email: string;
  telepon: string;
  tanggalAcara: string;
  jumlahFotoMaks: number;
  status: "AKTIF" | "SELESAI" | "PENDING";
}

export default function KelolaKlienPage() {
  const pathname = usePathname();

  // Menu Navigasi Sidebar (Konsisten dengan Dashboard)
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Kelola Klien", href: "/klien", icon: Users },
    { name: "Riwayat Pesanan", href: "/pesanan", icon: ClipboardList },
    { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  ];

  // Dummy Data Klien
  const [klienList, setKlienList] = useState<Klien[]>([
    {
      id: "1",
      nama: "Ahmad Rizki & Keluarga",
      kategori: "Wedding",
      email: "ahmad.rizki@example.com",
      telepon: "+62 812-3456-7890",
      tanggalAcara: "12 Agustus 2025",
      jumlahFotoMaks: 20,
      status: "AKTIF",
    },
    {
      id: "2",
      nama: "Siti Nurhaliza",
      kategori: "Wisuda",
      email: "siti.nurhaliza@example.com",
      telepon: "+62 857-1234-5678",
      tanggalAcara: "5 Agustus 2025",
      jumlahFotoMaks: 15,
      status: "AKTIF",
    },
    {
      id: "3",
      nama: "Keluarga Hadi",
      kategori: "Family Session",
      email: "hadi.family@example.com",
      telepon: "+62 819-8765-4321",
      tanggalAcara: "28 Juli 2025",
      jumlahFotoMaks: 30,
      status: "SELESAI",
    },
    {
      id: "4",
      nama: "Bapak Wahyu",
      kategori: "Corporate Event",
      email: "wahyu@corp.co.id",
      telepon: "+62 821-9988-7766",
      tanggalAcara: "18 Juli 2025",
      jumlahFotoMaks: 25,
      status: "SELESAI",
    },
    {
      id: "5",
      nama: "Dina & Aris",
      kategori: "Prewedding",
      email: "dina.aris@example.com",
      telepon: "+62 813-1122-3344",
      tanggalAcara: "2 September 2025",
      jumlahFotoMaks: 40,
      status: "PENDING",
    },
  ]);

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Filter Logic
  const filteredKlien = klienList.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" ? true : item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Handler Hapus
  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data klien ini?")) {
      setKlienList((prev) => prev.filter((k) => k.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f6f6] font-sans text-stone-800">
      {/* Sidebar Navigasi */}
      <aside className="w-64 bg-white border-r border-stone-200/80 flex flex-col justify-between p-6 shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="mb-10 px-2">
            <h1 className="text-2xl font-serif font-bold italic text-stone-900 tracking-wide">
              Nyala Karya
            </h1>
            <p className="text-[10px] tracking-widest text-stone-400 font-sans uppercase font-semibold mt-0.5">
              PHOTO & VIDEO
            </p>
          </div>

          {/* Navigasi Utama */}
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

        {/* Estetika / Aksen Bawah Sidebar */}
        <div className="text-xs text-stone-400 italic px-2">
          Semoga harimu penuh kreativitas
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar / Header */}
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

        {/* Content Area */}
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Header Halaman & Tombol Aksi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900">
                Kelola Klien
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Kelola data klien, jadwal sesi, dan kuota pemilihan foto mereka.
              </p>
            </div>
            <Link
              href="/klien/tambah"
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm transition w-fit"
            >
              <Plus className="w-4 h-4" />
              Tambah Klien Baru
            </Link>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Input Pencarian */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, kategori, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Aktif</option>
                <option value="PENDING">Pending</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pr-2">No</th>
                    <th className="pb-3 px-2">Nama Klien</th>
                    <th className="pb-3 px-2">Kontak</th>
                    <th className="pb-3 px-2">Tanggal Acara</th>
                    <th className="pb-3 px-2">Maks Foto</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 pl-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredKlien.length > 0 ? (
                    filteredKlien.map((klien, index) => (
                      <tr key={klien.id} className="hover:bg-stone-50/50 transition">
                        <td className="py-4 pr-2 text-stone-400">{index + 1}</td>
                        <td className="py-4 px-2 font-semibold text-stone-900">
                          {klien.nama}
                          <span className="block text-[10px] font-normal text-stone-400 mt-0.5">
                            {klien.kategori}
                          </span>
                        </td>
                        <td className="py-4 px-2 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-stone-600">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{klien.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-400 text-[10px]">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{klien.telepon}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>{klien.tanggalAcara}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 font-semibold text-stone-800">
                          {klien.jumlahFotoMaks} foto
                        </td>
                        <td className="py-4 px-2">
                          {klien.status === "AKTIF" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-semibold">
                              AKTIF
                            </span>
                          )}
                          {klien.status === "PENDING" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-50 text-amber-600 font-semibold">
                              PENDING
                            </span>
                          )}
                          {klien.status === "SELESAI" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] bg-stone-100 text-stone-500 font-semibold">
                              SELESAI
                            </span>
                          )}
                        </td>
                        <td className="py-4 pl-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/klien/${klien.id}`}
                              title="Lihat Detail"
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/klien/edit/${klien.id}`}
                              title="Edit Data"
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(klien.id)}
                              title="Hapus Klien"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-stone-400">
                        Tidak ada data klien yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs text-stone-500">
              <span>Menampilkan {filteredKlien.length} dari {klienList.length} klien</span>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="p-1.5 bg-stone-100 rounded-lg text-stone-400 cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-stone-800 px-2">1</span>
                <button
                  disabled
                  className="p-1.5 bg-stone-100 rounded-lg text-stone-400 cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
