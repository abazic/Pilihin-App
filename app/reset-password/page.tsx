'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { KeyRound } from 'lucide-react';

type ResetStatus =
  | 'validating'
  | 'ready'
  | 'invalid'
  | 'success'
  | 'error';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ResetStatus>('validating');

  useEffect(() => {
    let mounted = true;

    const validateRecoverySession = async () => {
      const urlError =
        searchParams.get('error_description') ||
        searchParams.get('error');

      if (urlError) {
        if (!mounted) return;

        setError(urlError.replace(/\+/g, ' '));
        setStatus('invalid');
        return;
      }

      const isRecoveryFlow =
        searchParams.get('type') === 'recovery';

      if (!isRecoveryFlow) {
        if (!mounted) return;

        setError(
          'Halaman reset password hanya dapat diakses melalui link pemulihan password.'
        );
        setStatus('invalid');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        setError(
          'Sesi pemulihan tidak valid atau sudah kedaluwarsa. Silakan minta link reset baru dari halaman login.'
        );
        setStatus('invalid');
        return;
      }

      setError('');
      setStatus('ready');
    };

    validateRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setError('');
        setStatus('ready');
      }

      if (event === 'SIGNED_OUT') {
        setError(
          'Sesi pemulihan tidak ditemukan atau telah berakhir.'
        );
        setStatus('invalid');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [searchParams, supabase.auth]);

  const handleResetPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      setStatus('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok.');
      setStatus('error');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        throw updateError;
      }

      setSuccessMsg(
        'Password berhasil diperbarui! Mengalihkan ke halaman login...'
      );
      setStatus('success');

      // Recovery session tidak perlu dipertahankan setelah
      // password berhasil diganti.
      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Terjadi kesalahan: ${err.message}`);
      } else {
        setError(
          'Terjadi kesalahan saat memperbarui password.'
        );
      }

      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'validating') {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
        <p className="text-sm text-gray-500 animate-pulse">
          Memvalidasi akses keamanan...
        </p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-medium text-gray-800">
              Link Reset Tidak Valid
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              {error}
            </p>
          </div>

          <button
            onClick={() => router.replace('/login')}
            className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            Kembali ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-medium text-gray-800">
            Buat Password Baru
          </h1>

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

        <form
          onSubmit={handleResetPassword}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Password Baru
            </label>

          <input
  type="password"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
  required
  minLength={6}
  autoComplete="new-password"
  className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none transition-all"
  placeholder="Minimal 6 karakter"
  disabled={loading || status === 'success'}
/>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Konfirmasi Password Baru
            </label>

           <input
  type="password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  required
  minLength={6}
  autoComplete="new-password"
  className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 outline-none transition-all"
  placeholder="Ulangi password baru"
  disabled={loading || status === 'success'}
/>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              status === 'success'
            }
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#2a2a2a] hover:bg-black text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? (
              'Menyimpan...'
            ) : (
              <>
                <KeyRound size={16} />
                Simpan Password Baru
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
          <p className="text-sm text-gray-500 animate-pulse">
            Memuat halaman...
          </p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
