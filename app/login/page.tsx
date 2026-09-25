'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Jika berhasil, arahkan ke dashboard admin
      router.push('/admin');
      router.refresh(); // Refresh state Next.js agar middleware membaca sesi baru
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Menggunakan setError agar notifikasi muncul di UI sesuai desain kamu, bukan sekadar alert
        setError(`Terjadi kesalahan: ${err.message}`);
      } else {
        setError('Terjadi kesalahan saat mengekstrak link atau menyimpan data.');
      }
    } finally {
      // Pastikan loading berhenti baik saat berhasil maupun gagal
      setLoading(false); 
    }
  }; // <-- Kurung kurawal penutup fungsi handleLogin yang sebelumnya hilang

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        {/* Logo & Judul */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-4">
            <span className="font-serif italic text-3xl font-bold tracking-tight text-gray-900">Abazic Art.chive</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Photo & Video</span>
          </div>
          <h1 className="text-xl font-medium text-gray-800">Login Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Masuk untuk mengelola klien dan galeri.</p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nyalakarya.com"
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#2a2a2a] hover:bg-black text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Memverifikasi...' : (
              <>
                <Lock size={16} /> Masuk ke Dashboard
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
