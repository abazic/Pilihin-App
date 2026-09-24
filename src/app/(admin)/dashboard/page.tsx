import React from 'react';
import { 
  Users, Image as ImageIcon, CheckCircle, Clock, 
  ArrowUpRight, Plus, Eye, MoreHorizontal, Bell 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Klien', count: 12, sub: '↑ 3 dari bulan lalu', icon: Users },
    { title: 'Total Galeri', count: 11, sub: '↑ 2 dari bulan lalu', icon: ImageIcon },
    { title: 'Pesanan Selesai', count: 8, sub: '↑ 2 dari bulan lalu', icon: CheckCircle },
    { title: 'Menunggu Edit', count: 3, sub: '↓ 1 dari bulan lalu', icon: Clock },
  ];

  const recentClients = [
    { id: '1', name: 'Ahmad Rizki & Keluarga', category: 'Wedding', date: '12 Agustus 2025', max: '20 foto', status: 'Aktif' },
    { id: '2', name: 'Siti Nurhaliza', category: 'Wisuda', date: '5 Agustus 2025', max: '15 foto', status: 'Aktif' },
    { id: '3', name: 'Keluarga Hadi', category: 'Family Session', date: '28 Juli 2025', max: '30 foto', status: 'Aktif' },
    { id: '4', name: 'Bapak Wahyu', category: 'Dokumentasi Acara', date: '15 Juli 2025', max: '25 foto', status: 'Nonaktif' },
    { id: '5', name: 'Nadia & Reza', category: 'Prewedding', date: '2 Juli 2025', max: '20 foto', status: 'Aktif' },
  ];

  return (
    <div className="p-8 bg-[#F8F7F5] min-h-screen text-[#2D2D2D] font-sans">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Selamat datang, Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola galeri, pantau pesanan, dan atur semua kebutuhan klienmu di sini.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Rabu, 27 Agustus 2025 • 10:24 WIB</span>
          <button className="p-2 bg-white rounded-full border shadow-sm relative">
            <Bell size={18} />
            <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1 right-1"></span>
          </button>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border shadow-sm">
            <div className="w-7 h-7 bg-amber-800 rounded-full text-white flex items-center justify-center font-bold text-xs">A</div>
            <span className="font-medium text-gray-700">Admin</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                <Icon size={20} className="text-gray-700" />
              </div>
              <p className="text-xs text-gray-500 font-medium">{item.title}</p>
              <h3 className="text-2xl font-bold mt-1">{item.count}</h3>
              <p className="text-xs text-gray-400 mt-2">{item.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Table & Gallery Cards */}
        <div className="lg:col-span-2 space-y-8">
          {/* Table Klien Terbaru */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Klien Terbaru</h2>
              <Link href="/clients" className="text-xs text-gray-500 hover:underline">Lihat Semua →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-400 font-normal">
                    <th className="py-2">No</th>
                    <th className="py-2">Nama Klien</th>
                    <th className="py-2">Tanggal Acara</th>
                    <th className="py-2">Jumlah Foto Maks</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentClients.map((client, idx) => (
                    <tr key={client.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 text-gray-400">{idx + 1}</td>
                      <td className="py-3">
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-gray-400">{client.category}</p>
                      </td>
                      <td className="py-3 text-gray-600">{client.date}</td>
                      <td className="py-3 text-gray-600">{client.max}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          client.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/clients/${client.id}/edit`} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium">
                            Lihat
                          </Link>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreHorizontal size={16} className="text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Ringkasan & Activity Feed */}
        <div className="space-y-6">
          {/* Ringkasan Bulan Ini Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-base mb-1">Ringkasan Bulan Ini</h2>
            <p className="text-xs text-gray-400 mb-4">Total Foto Dipilih</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold">246</span>
              <span className="text-xs text-gray-400">dari 12 galeri</span>
            </div>
            {/* Mock Chart Bars */}
            <div className="flex items-end gap-1.5 h-20 pt-4 border-t">
              {[30, 45, 20, 60, 80, 50, 90, 40, 100, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-200 hover:bg-neutral-800 rounded-t transition" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          {/* Aksi Cepat */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-base mb-4">Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/clients/new" className="p-3 border rounded-xl flex items-center justify-between text-xs font-medium hover:border-black transition">
                <span>Tambah Klien</span>
                <Plus size={14} />
              </Link>
              <Link href="/clients" className="p-3 border rounded-xl flex items-center justify-between text-xs font-medium hover:border-black transition">
                <span>Lihat Semua Klien</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
