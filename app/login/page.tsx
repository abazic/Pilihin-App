'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false); // State untuk toggle form

  const router = useRouter();
  const supabase = createClient();

  // Fungsi Login (Seperti semula)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.user) {
        setError('Login gagal: user tidak ditemukan.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Terjadi kesalahan: ${err.message}`);
      } else {
        setError('Terjadi kesalahan saat mengekstrak link atau menyimpan data.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Kirim Email Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Masukkan email Anda terlebih dahulu.');
      setLoading(false);
      return;
    }

    try {
      // Mengarahkan ke rute callback untuk validasi kode PKCE sebelum ke /reset-password
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccessMsg('Link reset password telah dikirim ke email Anda. Silakan cek inbox/spam.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Terjadi kesalahan: ${err.message}`);
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        {/* Logo & Judul */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-4">
            <span className="font-serif italic text-3xl font-bold tracking-tight text-gray-900">Pilihin Fotomu</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">by Abazic</span>
          </div>
          <h1 className="text-xl font-medium text-gray-800">
            {isResetMode ? 'Reset Password' : 'Login Admin'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isResetMode 
              ? 'Masukkan email untuk menerima link reset.' 
              : 'Masuk untuk mengelola klien dan galeri.'}
          </p>
        </div>

        {/* Notifikasi */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 text-center">
            {successMsg}
          </div>
        )}

        {/* Form Bergantian berdasarkan State isResetMode */}
        {isResetMode ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#2a2a2a] hover:bg-black text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Mengirim...' : (
                <>
                  <Mail size={16} /> Kirim Link Reset
                </>
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setIsResetMode(false);
                setError('');
                setSuccessMsg('');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={16} /> Kembali ke Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nyalakarya.com"
                required
              className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none transition-all"              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Lupa password?
                </button>
              </div>
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
        )}

      </div>
    </div>
  );
}
