import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-[#F8F8F6] flex flex-col justify-center items-center px-6 py-12 text-[#222222]">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-[#E5E5E0] shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 font-semibold text-lg">
          403
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-medium tracking-tight text-[#1A1A1A]">
            Akses Ditolak
          </h1>
          <p className="text-sm text-[#666666] leading-relaxed">
            Akun Anda tidak memiliki hak akses admin untuk membuka halaman ini. Silakan kembali ke halaman utama atau hubungi administrator.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full inline-flex justify-center items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#262626] hover:bg-[#383838] transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  )
}
