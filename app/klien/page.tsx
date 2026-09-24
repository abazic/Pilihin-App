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
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

// Tipe Data Klien
interface Klien {
  id: string;
  nama: string;
  kategori: string;
  tanggalAcara: string;
  jumlahFotoMaks: number;
  status: "AKTIF" | "SELESAI" | "MENUNGGU";
  email: string;
  noHp: string;
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

  // State Data Klien
  const [dataKlien, setDataKlien] = useState<Klien[]>([
    {
      id: "1",
      nama: "Ahmad Rizki & Keluarga",
      kategori: "Wedding",
      tanggalAcara: "12 Agustus 2025",
      jumlahFotoMaks: 20,
      status: "AKTIF",
      email: "ahmad.rizki@example.com",
      noHp: "081234567890",
    },
    {
      id: "2",
      nama: "Siti Nurhaliza",
      kategori: "Wisuda",
      tanggalAcara: "5 Agustus 2025",
      jumlahFotoMaks: 15,
      status: "AKTIF",
      email: "siti.n@example.com",
      noHp: "082345678901",
    },
    {
      id: "3",
      nama: "Keluarga Hadi",
      kategori: "Family Session",
      tanggalAcara: "28 Juli 2025",
      jumlahFotoMaks: 30,
      status: "SELESAI",
      email: "hadi.family@example.com",
      noHp: "083456789012",
    },
    {
      id: "4",
      nama: "Bapak Wahyu",
      kategori: "Corporate Event",
      tanggalAcara: "18 Juli 2025",
      jumlahFotoMaks: 25,
      status: "MENUNGGU",
      email: "wahyu@corporate.id",
      noHp: "084567890123",
    },
  ]);

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // State Modal Tambah Klien
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formBaru, setFormBaru] = useState({
    nama: "",
    kategori: "Wedding",
    tanggalAcara: "",
    jumlahFotoMaks: 20,
    email: "",
    noHp: "",
  });

  // Filter Logic
  const filteredKlien = dataKlien.filter((klien) => {
    const matchSearch =
      klien.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      klien.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
      klien.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" || klien.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Handler Tambah Klien
  const handleTambahKlien = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBaru.nama || !formBaru.tanggalAcara) return;

    const newKlienObj: Klien = {
      id: Date.now().toString(),
      nama: formBaru.nama,
      kategori: formBaru.kategori,
      tanggalAcara: formBaru.tanggalAcara,
      jumlahFotoMaks: Number(formBaru.jumlahFotoMaks),
      status: "AKTIF",
      email: formBaru.email || "-",
      noHp: formBaru.noHp || "-",
    };

    setDataKlien([newKlienObj, ...dataKlien]);
    setFormBaru({
      nama: "",
      kategori: "Wedding",
      tanggalAcara: "",
      jumlahFotoMaks: 20,
      email: "",
      noHp: "",
    });
    setIsModalOpen(false);
  };

  // Handler Hapus Klien
  const handleHapusKlien = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus klien ini?")) {
      setDataKlien(dataKlien.filter((item) => item.id !== id));
    }
  };

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

        {/* Main Content Area */}
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Page Header & Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900">
                Kelola Klien
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Atur daftar klien, batas pemilihan foto, dan kelola proyek fotografi kamu.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-sm transition w-fit"
            >
              <Plus className="w-4 h-4" />
              Tambah Klien Baru
            </button>
          </div>

          {/* Filter, Search & Section Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-6">
            {/* Toolbar Filter & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari nama, kategori, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 mr-1" />
                {["ALL", "AKTIF", "MENUNGGU", "SELESAI"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      statusFilter === st
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {st === "ALL" ? "Semua Status" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabel Klien */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pr-2">No</th>
                    <th className="pb-3 px-2">Nama Klien</th>
                    <th className="pb-3 px-2">Kontak</th>
                    <th className="pb-3 px-2">Tanggal Acara</th>
                    <th className="pb-3 px-2">Maks. Foto</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 pl-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredKlien.length > 0 ? (
                    filteredKlien.map((klien, idx) => (
                      <tr key={klien.id} className="hover:bg-stone-50/50 transition">
                        <td className="py-3.5 pr-2 text-stone-400">{idx + 1}</td>
                        <td className="py-3.5 px-2 font-semibold text-stone-900">
                          {klien.nama}
                          <span className="block text-[10px] font-normal text-stone-400">
                            {klien.kategori}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="block text-stone-700">{klien.email}</span>
                          <span className="text-[10px] text-stone-400">{klien.noHp}</span>
                        </td>
                        <td className="py-3.5 px-2">{klien.tanggalAcara}</td>
                        <td className="py-3.5 px-2">{klien.jumlahFotoMaks} foto</td>
                        <td className="py-3.5 px-2">
                          {klien.status === "AKTIF" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-semibold">
                              AKTIF
                            </span>
                          )}
                          {klien.status === "MENUNGGU" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-50 text-amber-600 font-semibold">
                              MENUNGGU
                            </span>
                          )}
                          {klien.status === "SELESAI" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] bg-stone-100 text-stone-600 font-semibold">
                              SELESAI
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 pl-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/klien/${klien.id}`}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                              title="Lihat Detail Galeri"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleHapusKlien(klien.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                              title="Hapus Klien"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        Tidak ada data klien yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Tambah Klien */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-lg max-w-md w-full space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-semibold text-stone-900 text-base">
                Tambah Klien Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTambahKlien} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nama Klien / Pasangan
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Ahmad & Diana"
                  value={formBaru.nama}
                  onChange={(e) => setFormBaru({ ...formBaru, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Kategori Acara
                  </label>
                  <select
                    value={formBaru.kategori}
                    onChange={(e) => setFormBaru({ ...formBaru, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Wisuda">Wisuda</option>
                    <option value="Family Session">Family Session</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Jumlah Max Foto
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formBaru.jumlahFotoMaks}
                    onChange={(e) => setFormBaru({ ...formBaru, jumlahFotoMaks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Tanggal Acara
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: 15 September 2025"
                  value={formBaru.tanggalAcara}
                  onChange={(e) => setFormBaru({ ...formBaru, tanggalAcara: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Email Klien
                  </label>
                  <input
                    type="email"
                    placeholder="email@klien.com"
                    value={formBaru.email}
                    onChange={(e) => setFormBaru({ ...formBaru, email: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="081234567..."
                    value={formBaru.noHp}
                    onChange={(e) => setFormBaru({ ...formBaru, noHp: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold transition"
                >
                  Simpan Klien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
