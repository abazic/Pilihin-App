"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  Bell,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Filter,
  MoreVertical,
} from "lucide-react";

interface Client {
  id: string | number;
  client_name: string;
  event_date: string;
  max_photos: number;
  slug: string;
  gdrive_url?: string;
  created_at?: string;
  selected_photos?: string[];
}

export default function KelolaKlienPage() {
  const pathname = usePathname();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Navigasi Sidebar
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Kelola Klien", href: "/klien", icon: Users },
    { name: "Riwayat Pesanan", href: "/pesanan", icon: ClipboardList },
    { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  ];

  // Fetch Data Klien dari Supabase
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("galleries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data klien:", error.message);
      // Data dummy sebagai penolong visual jika database masih kosong
      setClients([
        {
          id: "1",
          client_name: "Ahmad Rizki & Keluarga",
          event_date: "2025-08-12",
          max_photos: 20,
          slug: "ahmad-rizki-keluarga",
          gdrive_url: "https://drive.google.com/...",
          selected_photos: ["1", "2", "3"],
        },
        {
          id: "2",
          client_name: "Siti Nurhaliza",
          event_date: "2025-08-05",
          max_photos: 15,
          slug: "siti-nurhaliza",
          gdrive_url: "https://drive.google.com/...",
          selected_photos: [],
        },
        {
          id: "3",
          client_name: "Keluarga Hadi",
          event_date: "2025-07-28",
          max_photos: 30,
          slug: "keluarga-hadi",
          gdrive_url: "https://drive.google.com/...",
          selected_photos: ["1", "2"],
        },
      ]);
    } else if (data) {
      setClients(data);
    }
    setLoading(false);
  };

  // Fungsi Hapus Klien
  const handleDelete = async (id: string | number, name: string) => {
    if (confirm(`Apakah kamu yakin ingin menghapus klien "${name}"?`)) {
      const { error } = await supabase.from("galleries").delete().eq("id", id);
      if (error) {
        alert("Gagal menghapus: " + error.message);
      } else {
        alert("Klien berhasil dihapus!");
        setClients(clients.filter((c) => c.id !== id));
      }
    }
  };

  // Filter Klien berdasarkan Search Bar
  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.client_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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

        {/* Dashboard Area */}
        <div className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Header & Button Tambah */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif text-stone-900 font-semibold">
                Kelola Klien
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                Daftar seluruh klien, tautan galeri, dan status pemilihan foto.
              </p>
            </div>
            <Link
              href="/klien/tambah"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-sm font-medium rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Tambah Klien Baru
            </Link>
          </div>

          {/* Baris Filter & Pencarian */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Input Pencarian */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari nama klien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-stone-300 transition"
              />
            </div>

            {/* Total Counter */}
            <div className="text-xs font-medium text-stone-500">
              Total Klien:{" "}
              <span className="font-bold text-stone-900">
                {filteredClients.length}
              </span>
            </div>
          </div>

          {/* Tabel Daftar Klien */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-stone-400 text-sm animate-pulse">
                Memuat data klien...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-sm">
                Belum ada data klien yang ditemukan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-400 uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-6">No</th>
                      <th className="py-3.5 px-4">Nama Klien</th>
                      <th className="py-3.5 px-4">Tanggal Acara</th>
                      <th className="py-3.5 px-4">Maks. Foto</th>
                      <th className="py-3.5 px-4">Foto Terpilih</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {filteredClients.map((client, index) => {
                      const selectedCount = client.selected_photos?.length || 0;
                      const isComplete = selectedCount >= client.max_photos;

                      return (
                        <tr key={client.id} className="hover:bg-stone-50/60 transition">
                          <td className="py-4 px-6 text-stone-400">{index + 1}</td>
                          <td className="py-4 px-4 font-semibold text-stone-900">
                            {client.client_name}
                          </td>
                          <td className="py-4 px-4 text-stone-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              {client.event_date || "-"}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-stone-600">
                            {client.max_photos} foto
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-stone-900">
                              {selectedCount}
                            </span>{" "}
                            / {client.max_photos}
                          </td>
                          <td className="py-4 px-4">
                            {isComplete ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> SELESAI
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-amber-50 text-amber-600 font-semibold">
                                <Clock className="w-3 h-3" /> PROSES
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Preview Galeri Klien */}
                              <Link
                                href={`/galeri/${client.slug}`}
                                target="_blank"
                                title="Buka Galeri Klien"
                                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              {/* Edit Klien */}
                              <Link
                                href={`/klien/edit/${client.id}`}
                                title="Edit Klien"
                                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>

                              {/* Hapus Klien */}
                              <button
                                onClick={() => handleDelete(client.id, client.client_name)}
                                title="Hapus Klien"
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
