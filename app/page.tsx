"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  Bell,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Plus,
  ChevronRight,
  Link2,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";

export default function Dashboard() {
  const pathname = usePathname();

  // Menu Navigasi Sidebar
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Kelola Klien", href: "/klien", icon: Users },
    { name: "Riwayat Pesanan", href: "/pesanan", icon: ClipboardList },
    { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  ];

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

        {/* Dashboard Area */}
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Header Dashboard & Tanggal */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900">
                Selamat datang, Admin
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Kelola galeri, pantau pesanan, dan atur semua kebutuhan klienmu di sini.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 bg-white px-4 py-2.5 rounded-xl border border-stone-200/80 shadow-sm w-fit">
              <Calendar className="w-4 h-4 text-stone-400" />
              <span>Rabu, 27 Agustus 2025</span>
              <span className="text-stone-300">|</span>
              <span>10.24 WIB</span>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">Total Klien</span>
                <div className="p-2 bg-stone-100 rounded-xl text-stone-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-stone-900 mt-3">12</div>
              <p className="text-[11px] text-stone-400 mt-1">+3 dari bulan lalu</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">Total Galeri</span>
                <div className="p-2 bg-stone-100 rounded-xl text-stone-600">
                  <ImageIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-stone-900 mt-3">11</div>
              <p className="text-[11px] text-stone-400 mt-1">+2 dari bulan lalu</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">Pesanan Selesai</span>
                <div className="p-2 bg-stone-100 rounded-xl text-stone-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-stone-900 mt-3">8</div>
              <p className="text-[11px] text-stone-400 mt-1">+2 dari bulan lalu</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">Menunggu Edit</span>
                <div className="p-2 bg-stone-100 rounded-xl text-stone-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-stone-900 mt-3">3</div>
              <p className="text-[11px] text-stone-400 mt-1">+1 dari bulan lalu</p>
            </div>
          </div>

          {/* Grid Utama: Tabel Klien Terbaru & Ringkasan/Aktivitas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tabel Klien Terbaru (2 Kolom) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-stone-900">Klien Terbaru</h3>
                <Link
                  href="/klien"
                  className="text-xs font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition"
                >
                  Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider font-semibold">
                      <th className="pb-3 pr-2">No</th>
                      <th className="pb-3 px-2">Nama Klien</th>
                      <th className="pb-3 px-2">Tanggal Acara</th>
                      <th className="pb-3 px-2">Jumlah Foto Maks</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 pl-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    <tr>
                      <td className="py-3.5 pr-2 text-stone-400">1</td>
                      <td className="py-3.5 px-2 font-semibold text-stone-900">
                        Ahmad Rizki & Keluarga
                        <span className="block text-[10px] font-normal text-stone-400">
                          Wedding
                        </span>
                      </td>
                      <td className="py-3.5 px-2">12 Agustus 2025</td>
                      <td className="py-3.5 px-2">20 foto</td>
                      <td className="py-3.5 px-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-semibold">
                          AKTIF
                        </span>
                      </td>
                      <td className="py-3.5 pl-2 text-right">
                        <Link
                          href="/klien/1"
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 transition"
                        >
                          Lihat
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pr-2 text-stone-400">2</td>
                      <td className="py-3.5 px-2 font-semibold text-stone-900">
                        Siti Nurhaliza
                        <span className="block text-[10px] font-normal text-stone-400">
                          Wisuda
                        </span>
                      </td>
                      <td className="py-3.5 px-2">5 Agustus 2025</td>
                      <td className="py-3.5 px-2">15 foto</td>
                      <td className="py-3.5 px-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-semibold">
                          AKTIF
                        </span>
                      </td>
                      <td className="py-3.5 pl-2 text-right">
                        <Link
                          href="/klien/2"
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 transition"
                        >
                          Lihat
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pr-2 text-stone-400">3</td>
                      <td className="py-3.5 px-2 font-semibold text-stone-900">
                        Keluarga Hadi
                        <span className="block text-[10px] font-normal text-stone-400">
                          Family Session
                        </span>
                      </td>
                      <td className="py-3.5 px-2">28 Juli 2025</td>
                      <td className="py-3.5 px-2">30 foto</td>
                      <td className="py-3.5 px-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-semibold">
                          AKTIF
                        </span>
                      </td>
                      <td className="py-3.5 pl-2 text-right">
                        <Link
                          href="/klien/3"
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 transition"
                        >
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kolom Kanan: Ringkasan Bulan Ini & Aktivitas Terbaru */}
            <div className="space-y-6">
              {/* Ringkasan Bulan Ini */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
                <h3 className="font-semibold text-stone-900 text-sm">
                  Ringkasan Bulan Ini
                </h3>
                <div>
                  <div className="text-xs text-stone-400">Total Foto Dipilih</div>
                  <div className="text-2xl font-bold text-stone-900">246</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    dari 12 galeri
                  </div>
                </div>
              </div>

              {/* Aktivitas Terbaru */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-stone-900 text-sm">
                    Aktivitas Terbaru
                  </h3>
                  <span className="text-[11px] text-stone-400">Lihat Semua</span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">
                        Klien baru ditambahkan
                      </p>
                      <p className="text-stone-400 text-[11px]">Siti Nurhaliza (Wisuda)</p>
                      <span className="text-[10px] text-stone-300">1 jam lalu</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">
                        Galeri selesai diedit
                      </p>
                      <p className="text-stone-400 text-[11px]">
                        Keluarga Hadi (Family Session)
                      </p>
                      <span className="text-[10px] text-stone-300">4 jam lalu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Bawah: Galeri Terbaru & Aksi Cepat */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Galeri Terbaru (2 Kolom) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-stone-900">Galeri Terbaru</h3>
                <Link
                  href="/klien"
                  className="text-xs font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition"
                >
                  Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: "Ahmad Rizki & K...", date: "12 Agt 2025", photos: "20 foto" },
                  { name: "Siti Nurhaliza", date: "5 Agt 2025", photos: "15 foto" },
                  { name: "Keluarga Hadi", date: "28 Jul 2025", photos: "30 foto" },
                  { name: "Bapak Wahyu", date: "18 Jul 2025", photos: "25 foto" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group border border-stone-100 rounded-xl overflow-hidden hover:shadow-md transition"
                  >
                    <div className="h-28 bg-stone-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-stone-300 flex items-center justify-center text-stone-400 text-xs">
                        [Foto Pratinjau]
                      </div>
                    </div>
                    <div className="p-3 bg-white space-y-1">
                      <p className="font-semibold text-xs text-stone-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-stone-400">{item.date}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-medium">
                        {item.photos}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aksi Cepat (1 Kolom) */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <h3 className="font-semibold text-stone-900 text-sm">Aksi Cepat</h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <Link
                  href="/klien/tambah"
                  className="flex items-center gap-2 p-3 bg-stone-50 hover:bg-stone-100 rounded-xl text-stone-700 font-medium border border-stone-100 transition"
                >
                  <Plus className="w-4 h-4 text-stone-500" />
                  Tambah Klien
                </Link>

                <Link
                  href="/klien"
                  className="flex items-center gap-2 p-3 bg-stone-50 hover:bg-stone-100 rounded-xl text-stone-700 font-medium border border-stone-100 transition"
                >
                  <Users className="w-4 h-4 text-stone-500" />
                  Lihat Klien
                </Link>

                <Link
                  href="/galeri"
                  className="flex items-center gap-2 p-3 bg-stone-50 hover:bg-stone-100 rounded-xl text-stone-700 font-medium border border-stone-100 transition"
                >
                  <ImageIcon className="w-4 h-4 text-stone-500" />
                  Kelola Galeri
                </Link>

                <Link
                  href="/pengaturan"
                  className="flex items-center gap-2 p-3 bg-stone-50 hover:bg-stone-100 rounded-xl text-stone-700 font-medium border border-stone-100 transition"
                >
                  <Settings className="w-4 h-4 text-stone-500" />
                  Pengaturan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
