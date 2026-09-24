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
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";

export default function KelolaKlien() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("SEMUA");

  // Menu Navigasi Sidebar
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Kelola Klien", href: "/klien", icon: Users },
    { name: "Riwayat Pesanan", href: "/pesanan", icon: ClipboardList },
    { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  ];

  // Mock Data Klien
  const clientData = [
    {
      id: "1",
      nama: "Ahmad Rizki & Keluarga",
      email: "ahmad.rizki@gmail.com",
      telepon: "0812-3456-7890",
      kategori: "Wedding",
      tanggal: "12 Agustus 2025",
      jumlahFoto: 20,
      status: "AKTIF",
    },
    {
      id: "2",
      nama: "Siti Nurhaliza",
      email: "siti.nurhaliza@gmail.com",
      telepon: "0821-9876-5432",
      kategori: "Wisuda",
      tanggal: "5 Agustus 2025",
      jumlahFoto: 15,
      status: "AKTIF",
    },
    {
      id: "3",
      nama: "Keluarga Hadi",
      email: "hadi.family@gmail.com",
      telepon: "0857-1122-3344",
      kategori: "Family Session",
      tanggal: "28 Juli 2025",
      jumlahFoto: 30,
      status: "SELESAI",
    },
    {
      id: "4",
      nama: "Bapak Wahyu",
      email: "wahyu.corporate@gmail.com",
      telepon: "0813-5566-7788",
      kategori: "Event Corporate",
      tanggal: "18 Juli 2025",
      jumlahFoto: 25,
      status: "DRAFT",
    },
    {
      id: "5",
      nama: "Dina & Bayu",
      email: "dina.bayu@gmail.com",
      telepon: "0896-4433-2211",
      kategori: "Pre-Wedding",
      tanggal: "10 Juli 2025",
      jumlahFoto: 20,
      status: "SELESAI",
    },
  ];

  // Filter Data Klien berdasarkan Search dan Status
  const filteredClients = clientData.filter((client) => {
    const matchSearch =
      client.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.kategori.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      selectedStatus === "SEMUA" || client.status === selectedStatus;

    return matchSearch && matchStatus;
  });

  return (
    <div className="flex min-h-screen bg-[#f6f6f6] font-sans text-stone-800">
      {/* Sidebar Navigasi */}
      <aside className="w-64 bg-white border-r border-stone-200/80 flex flex-col justify-between p-6">
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
      <main className="flex-1 flex flex-col">
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

        {/* Kelola Klien Area */}
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Header & Aksi Utama */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900">
                Kelola Klien
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Kelola daftar klien, pantau status galeri, dan atur hak akses foto klienmu.
              </p>
            </div>
            <Link
              href="/klien/tambah"
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Klien Baru</span>
            </Link>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">
                  Total Klien
                </span>
                <div className="p-2 bg-stone-100 rounded-xl text-stone-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-stone-900 mt-3">12</div>
              <p className="text-[11px] text-stone-400 mt-1">
                Terdaftar dalam sistem
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">
                  Klien Aktif
                </span>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-stone-900 mt-3">7</div>
              <p className="text-[11px] text-stone-400 mt-1">
                Sedang proses alur foto
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">
                  Selesai
                </span>
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-stone-900 mt-3">4</div>
              <p className="text-[11px] text-stone-400 mt-1">
                Galeri telah diserahkan
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">
                  Draft / Pending
                </span>
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-stone-900 mt-3">1</div>
              <p className="text-[11px] text-stone-400 mt-1">
                Menunggu konfirmasi
              </p>
            </div>
          </div>

          {/* Tabel Utama & Filter Bar */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-6">
            {/* Toolbar: Search & Status Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau acara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {["SEMUA", "AKTIF", "SELESAI", "DRAFT"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      selectedStatus === status
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabel Data Klien */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pr-2">No</th>
                    <th className="pb-3 px-2">Nama Klien</th>
                    <th className="pb-3 px-2">Kontak</th>
                    <th className="pb-3 px-2">Tanggal Acara</th>
                    <th className="pb-3 px-2">Batas Foto</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 pl-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client, index) => (
                      <tr key={client.id} className="hover:bg-stone-50/50 transition">
                        <td className="py-4 pr-2 text-stone-400">
                          {index + 1}
                        </td>
                        <td className="py-4 px-2">
                          <span className="font-semibold text-stone-900 block">
                            {client.nama}
                          </span>
                          <span className="text-[10px] text-stone-400 font-normal">
                            {client.kategori}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="block text-stone-700">
                            {client.email}
                          </span>
                          <span className="text-[10px] text-stone-400 font-normal">
                            {client.telepon}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-stone-600">
                          {client.tanggal}
                        </td>
                        <td className="py-4 px-2 text-stone-600">
                          {client.jumlahFoto} foto
                        </td>
                        <td className="py-4 px-2">
                          {client.status === "AKTIF" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-semibold">
                              AKTIF
                            </span>
                          )}
                          {client.status === "SELESAI" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] bg-blue-50 text-blue-600 font-semibold">
                              SELESAI
                            </span>
                          )}
                          {client.status === "DRAFT" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-50 text-amber-600 font-semibold">
                              DRAFT
                            </span>
                          )}
                        </td>
                        <td className="py-4 pl-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/klien/${client.id}`}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                              title="Lihat Detail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/klien/${client.id}/edit`}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-stone-400 italic"
                      >
                        Tidak ada data klien yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Tabel / Paginasi */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
              <span>
                Menampilkan <b>{filteredClients.length}</b> dari <b>{clientData.length}</b> klien
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-300 cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-stone-800">1</span>
                <button
                  disabled
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-300 cursor-not-allowed"
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
