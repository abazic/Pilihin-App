'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
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
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#11110f]">
      <AppHeader />
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        
        {/* Logo & Judul */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-4">
            <span className="font-serif italic text-3xl font-bold tracking-tight text-gray-900 dark:text-white">inStories creative</span>
          </div>
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">
            {isResetMode ? 'Reset Password' : 'Login Admin'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isResetMode 
              ? 'Masukkan email untuk menerima link reset.' 
              : 'Masuk untuk mengelola klien dan galeri.'}
          </p>
        </div>

        {/* Notifikasi */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-900 text-center">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-3 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-sm rounded-lg border border-green-100 dark:border-green-900 text-center">
            {successMsg}
          </div>
        )}

        {/* Form Bergantian berdasarkan State isResetMode */}
        {isResetMode ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="admin@pilihin-app.com"
  required
  className="w-full p-3 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-950 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-gray-200 dark:focus:ring-neutral-700 focus:border-gray-500 dark:focus:border-neutral-500 outline-none transition-all"
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
              className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={16} /> Kembali ke Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pilihin-app.com"
                required
              className="w-full p-3 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-950 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-gray-200 dark:focus:ring-neutral-700 focus:border-gray-500 dark:focus:border-neutral-500 outline-none transition-all"              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
  className="w-full p-3 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-950 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-gray-200 dark:focus:ring-neutral-700 focus:border-gray-500 dark:focus:border-neutral-500 outline-none transition-all"
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
      </main>
    </div>
  );
}
