import { redirect } from 'next/navigation';

export default function RootPage() {
  // Langsung arahkan pengunjung dari / ke /admin
  // Middleware nanti akan mengecek apakah mereka sudah login atau belum
  redirect('/admin');
}
