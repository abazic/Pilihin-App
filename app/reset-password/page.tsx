'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { KeyRound } from 'lucide-react';

// Pisahkan logic form ke komponen terpisah agar bisa dibungkus Suspense
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // 1. Tangkap error dari URL (Supabase mengirim ini jika link kedaluwarsa)
    const urlError = searchParams.get('error_description') || searchParams.get('error');
    if (urlError) {
      // Format pesan error bawaan Supabase agar lebih enak dibaca (opsional)
      const cleanError = urlError.replace(/\+/g, ' ');
      setError(cleanError);
      setIsValidating(false);
      return;
    }

    // 2. Cek apakah ini benar-benar datang dari flow recovery 
    const isRecoveryFlow = searchParams.get('type') === 'recovery';

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // VALIDASI SEMANTIK: Jika punya sesi TAPI bukan dari flow recovery
        if (!isRecoveryFlow) {
          // Arahkan kembali user "iseng" yang mencoba buka /reset-password ke dashboard/pengaturan
          router.replace('/pengaturan');
          return;
        }
        
        setIsValidating(false); // Valid, izinkan form render
      } else {
        setError('Sesi pemulihan tidak valid atau sudah kedaluwarsa. Silakan minta link reset baru di halaman login.');
        setIsValidating(false);
      }
    };

    checkInitialSession();

    // 3. Listener dibiarkan saja sebagai fallback yang aman
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidating(false);
        setError('');
      } else if (event === 'SIGNED_OUT') {
        setError('Sesi tidak ditemukan atau Anda telah logout.');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, searchParams, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccessMsg('Password berhasil diperbarui! Mengalihkan ke halaman login...');
      
      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace('/login');
      }, 2500);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Terjadi kesalahan: ${err.message}`);
      } else {
        setError('Terjadi kesalahan saat memperbarui password.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
        <p className="text-sm text-gray-500 animate-pulse">Memvalidasi akses keamanan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-xl font-medium text-gray-800">Buat Password Baru</h1>
          <p className="text-sm text-gray-500 mt-1">
            Silakan masukkan password baru untuk akun admin Anda.
          </p>
        </div>

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

        {error && (error.includes('kedaluwarsa') || error.includes('Sesi')) ? (
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            Kembali ke Halaman Login
          </button>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none transition-all"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none transition-all"
                placeholder="Ulangi password baru"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#2a2a2a] hover:bg-black text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Menyimpan...' : (
                <>
                  <KeyRound size={16} /> Simpan Password Baru
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// WAJIB: Bungkus dengan Suspense untuk menghindari Next.js deopt/build error
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
        <p className="text-sm text-gray-500 animate-pulse">Memuat halaman...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
