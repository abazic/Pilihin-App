'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';

const packages = [
  { id: 'solo', name: 'Solo Graduate', desc: '1 orang · 1 jam', price: 250000 },
  { id: 'duo', name: 'Duo Graduate', desc: '2 orang · 2 jam', price: 400000 },
  { id: 'group', name: 'Group Session', desc: '3–5 orang · 2 jam', price: 700000 },
  { id: 'large', name: 'Large Group', desc: '6–10 orang · 2 jam', price: 900000 },
  { id: 'extended', name: 'Extended Group', desc: 'Lebih dari 10 orang · Rp100.000/orang', price: 100000 },
  { id: 'video', name: 'Video Package', desc: 'Shoot & edit video graduation', price: 600000 },
];
const addons = [
  { id: 'extra_hour', name: 'Extra 60 menit', price: 100000 },
  { id: 'extra_location', name: 'Extra lokasi', price: 100000 },
  { id: 'extra_photos', name: 'Extra 10 foto edited', price: 50000 },
  { id: 'same_day', name: 'Same Day Edit', price: 300000 },
];
const money = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export default function BookingPage() {
  const [name, setName] = useState('');
  const [wa, setWa] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locations, setLocations] = useState('');
  const [pkg, setPkg] = useState('solo');
  const [participants, setParticipants] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chosen = packages.find((p) => p.id === pkg)!;
  const base = useMemo(() => pkg === 'extended' ? chosen.price * participants : chosen.price, [pkg, chosen.price, participants]);
  const addonTotal = addons.filter((a) => selected.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
  const total = base + addonTotal;
  const locationsArray = locations.split('\n').map((s) => s.trim()).filter(Boolean);
  const field = 'mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-amber-700 dark:border-white/10 dark:bg-[#171714] dark:text-white';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (locationsArray.length === 0) {
      setError('Isi setidaknya satu lokasi sesi.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, whatsapp: wa, date, time, locations: locationsArray, package: pkg, participants, addons: selected, notes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Booking gagal');
      window.location.href = data.whatsappUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1c1c1c] dark:bg-[#11110f] dark:text-stone-100">
      <AppHeader
        navigation={
          <>
            <Link href="/" className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400">Home</Link>
            <Link href="/pricelist" className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400">Pricelist</Link>
            <span aria-current="page" className="font-medium text-amber-700 dark:text-amber-400">Booking</span>
            <Link href="/#portfolio" className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400">Portfolio</Link>
            <Link href="/#services" className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400">Service</Link>
            <Link href="/#contact" className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400">Contact</Link>
          </>
        }
        actions={
          <Link href="/admin" className="rounded-full bg-black px-4 py-2 text-sm text-white transition hover:bg-neutral-700 dark:bg-stone-100 dark:text-neutral-900">
            Dashboard
          </Link>
        }
      />
      <section className="mx-auto max-w-6xl px-5 py-12 md:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[.28em] text-amber-800 dark:text-amber-400">Photo Session Reservation</p>
          <h1 className="mt-4 font-serif text-4xl md:text-6xl">Book your moment.</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-500">Isi detail sesi. Booking akan masuk sebagai permintaan dan menunggu konfirmasi admin.</p>
        </div>
        <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-7">
            <section className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1b1b18]">
              <h2 className="font-serif text-2xl">01 · Your details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm">Nama lengkap<input className={field} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="Nama kamu" /></label>
                <label className="text-sm">WhatsApp<input className={field} value={wa} onChange={(e) => setWa(e.target.value)} required placeholder="08xx / +62" inputMode="tel" /></label>
                <label className="text-sm">Tanggal<input className={field} type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} required /></label>
                <label className="text-sm">Jam mulai<input className={field} type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></label>
              </div>
              <label className="mt-4 block text-sm">Lokasi sesi <span className="text-neutral-400">(satu lokasi per baris)</span>
                <textarea className={field} rows={3} value={locations} onChange={(e) => setLocations(e.target.value)} placeholder={'Contoh: Gedung wisuda\nTaman kampus'} required />
              </label>
              <p className="mt-1 text-xs text-neutral-400">Isi semua lokasi yang ingin digunakan.</p>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1b1b18]">
              <h2 className="font-serif text-2xl">02 · Choose your package</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {packages.map((p) => (
                  <button type="button" key={p.id} onClick={() => { setPkg(p.id); setParticipants(p.id === 'extended' ? 11 : 1); }} className={'rounded-xl border p-4 text-left transition ' + (pkg === p.id ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/20' : 'border-black/10 dark:border-white/10')}>
                    <span className="block font-medium">{p.name}</span>
                    <span className="mt-1 block text-xs text-neutral-500">{p.desc}</span>
                    <span className="mt-3 block font-serif text-xl">{p.id === 'extended' ? money(p.price) + ' / orang' : money(p.price)}</span>
                  </button>
                ))}
              </div>
              {pkg === 'extended' && (
                <label className="mt-4 block text-sm">Jumlah peserta
                  <input className={field} type="number" min={11} max={100} value={participants} onChange={(e) => setParticipants(Math.max(11, Math.min(100, Number(e.target.value) || 11)))} />
                </label>
              )}
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1b1b18]">
              <h2 className="font-serif text-2xl">03 · Add-ons</h2>
              <div className="mt-4 space-y-3">
                {addons.map((a) => (
                  <label key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-black/10 p-4 text-sm dark:border-white/10">
                    <span className="flex gap-3"><input type="checkbox" checked={selected.includes(a.id)} onChange={(e) => setSelected((s) => e.target.checked ? [...s, a.id] : s.filter((k) => k !== a.id))} />{a.name}</span>
                    <span className="font-medium">+{money(a.price)}</span>
                  </label>
                ))}
              </div>
              <label className="mt-5 block text-sm">Catatan tambahan
                <textarea className={field} rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Request, referensi, atau detail lainnya" />
              </label>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-black/10 bg-[#f1efe9] p-6 dark:border-white/10 dark:bg-[#24231f] lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[.2em] text-neutral-500">Booking summary</p>
            <h2 className="mt-2 font-serif text-2xl">{chosen.name}</h2>
            <div className="mt-5 space-y-3 border-t border-black/10 pt-4 text-sm dark:border-white/10">
              <div className="flex justify-between gap-3"><span>Package</span><span>{money(base)}</span></div>
              {addons.filter((a) => selected.includes(a.id)).map((a) => <div className="flex justify-between gap-3" key={a.id}><span>{a.name}</span><span>{money(a.price)}</span></div>)}
            </div>
            <div className="mt-5 flex justify-between border-t border-black/10 pt-4 dark:border-white/10"><span className="font-medium">Total estimate</span><strong className="font-serif text-2xl">{money(total)}</strong></div>
            <p className="mt-3 text-xs leading-5 text-neutral-500">Harga final dan ketersediaan jadwal dikonfirmasi admin. Extended Group dihitung per peserta.</p>
            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="mt-6 w-full rounded-full bg-black px-5 py-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-stone-100 dark:text-neutral-900">{loading ? 'Mengirim…' : 'Send booking via WhatsApp ↗'}</button>
            <p className="mt-3 text-center text-xs text-neutral-500">Dengan mengirim, booking tersimpan sebagai Pending.</p>
          </aside>
        </form>
        <div className="mt-10 rounded-2xl bg-[#eeeae2] p-6 text-sm leading-6 text-neutral-600 dark:bg-[#24231f] dark:text-neutral-300">
          <strong>Ketentuan sesi:</strong> hadir 10–15 menit lebih awal. Toleransi keterlambatan maksimal 45 menit; keterlambatan dapat mengurangi durasi sesi. Perubahan jam dapat memengaruhi pencahayaan. Hubungi fotografer jika terlambat.
        </div>
      </section>
    </main>
  );
}
