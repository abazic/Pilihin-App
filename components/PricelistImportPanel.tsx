'use client';

import { useState } from 'react';

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-gray-100';

type ImportedService = {
  id: string; title: string; description: string; showInService: boolean;
  photoPackages: Record<string, string>[]; videoPackages: Record<string, string>[]; addons: Record<string, string>[];
};

function mergeByName<T extends Record<string, any>>(current: T[], incoming: T[]) {
  const result = [...current];
  incoming.forEach(item => {
    const index = result.findIndex(existing => String(existing.name || '').trim().toLowerCase() === String(item.name || '').trim().toLowerCase());
    if (index >= 0) result[index] = { ...result[index], ...item };
    else result.push(item);
  });
  return result;
}

export default function PricelistImportPanel({ current, onApply }: {
  current: { services?: ImportedService[] };
  onApply: (services: ImportedService[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [preview, setPreview] = useState<ImportedService[] | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const parse = async (source: 'file' | 'sheet') => {
    setBusy(true); setMessage(''); setPreview(null);
    try {
      const body = new FormData();
      if (source === 'file' && file) body.append('file', file);
      else if (source === 'sheet') body.append('sheetUrl', sheetUrl.trim());
      else throw new Error('Pilih file Excel/CSV terlebih dahulu.');
      const response = await fetch('/api/admin/pricelist/import', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal membaca file.');
      if (!Array.isArray(result.services) || result.services.length === 0) throw new Error('Tidak ada data service yang bisa diimpor.');
      setPreview(result.services);
      setMessage(`${result.rowCount} baris terbaca. Periksa preview sebelum menerapkan.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memproses file.');
    } finally { setBusy(false); }
  };

  const apply = () => {
    if (!preview) return;
    if (mode === 'replace') {
      if (!window.confirm('Ganti SELURUH data service, paket foto, paket video, dan add-on yang sekarang dengan data impor? Perubahan belum tersimpan ke database sampai tombol Simpan Pricelist ditekan.')) return;
      onApply(preview);
    } else {
      const existing = current.services || [];
      const merged = [...existing];
      preview.forEach(imported => {
        const index = merged.findIndex(item => item.id === imported.id || item.title.trim().toLowerCase() === imported.title.trim().toLowerCase());
        if (index < 0) merged.push(imported);
        else {
          const old = merged[index];
          merged[index] = {
            ...old,
            ...imported,
            photoPackages: mergeByName(old.photoPackages || [], imported.photoPackages || []),
            videoPackages: mergeByName(old.videoPackages || [], imported.videoPackages || []),
            addons: mergeByName(old.addons || [], imported.addons || []),
          };
        }
      });
      onApply(merged);
    }
    setPreview(null); setFile(null); setSheetUrl('');
    setMessage('Data impor diterapkan ke formulir pricelist. Klik “Simpan Pricelist” untuk menyimpan ke database.');
  };

  return (
    <section className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/10">
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white">Import Pricelist dari Spreadsheet</h2>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Upload Excel (.xlsx) atau CSV, atau ambil dari Google Sheets yang sudah dibagikan sebagai viewer.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Upload file Excel / CSV</label>
          <input type="file" accept=".xlsx,.csv" onChange={event => setFile(event.target.files?.[0] || null)} className={inputClass} />
          <button type="button" disabled={!file || busy} onClick={() => void parse('file')} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-gray-900">{busy ? 'Memproses...' : 'Baca File & Preview'}</button>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Link Google Sheets</label>
          <input type="url" value={sheetUrl} onChange={event => setSheetUrl(event.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." className={inputClass} />
          <button type="button" disabled={!sheetUrl.trim() || busy} onClick={() => void parse('sheet')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-neutral-700">{busy ? 'Memproses...' : 'Ambil dari Google Sheets'}</button>
          <p className="text-[11px] text-gray-500">Sheet harus memiliki akses “Anyone with the link – Viewer”. Tab pertama yang dibaca.</p>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400">
        <p className="font-semibold text-gray-800 dark:text-gray-200">Format kolom yang didukung</p>
        <p className="mt-1">Service, Kategori (photo/video/addon), Nama, Harga, Detail, Durasi, Lokasi, Foto, Extras, Deskripsi Service. Baris pertama wajib berisi header. Nama kolom boleh menggunakan bahasa Indonesia atau Inggris.</p>
      </div>
      {message && <p role="status" className="text-sm text-gray-700 dark:text-gray-300">{message}</p>}
      {preview && <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">{preview.length} service terdeteksi · Preview</p>
          <label className="flex items-center gap-2 text-sm">Mode impor
            <select value={mode} onChange={event => setMode(event.target.value as 'merge' | 'replace')} className="rounded-lg border border-gray-300 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-950">
              <option value="merge">Gabungkan / perbarui yang cocok</option>
              <option value="replace">Ganti seluruh pricelist</option>
            </select>
          </label>
        </div>
        <div className="max-h-72 space-y-2 overflow-auto rounded-lg border border-gray-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
          {preview.map(service => <div key={service.id} className="border-b border-gray-100 pb-2 last:border-0 dark:border-neutral-800">
            <p className="font-semibold text-sm">{service.title}</p>
            <p className="text-xs text-gray-500">{service.photoPackages.length} paket foto · {service.videoPackages.length} paket video · {service.addons.length} add-on</p>
            {[...service.photoPackages, ...service.videoPackages, ...service.addons].slice(0, 4).map((item, index) => <p key={index} className="mt-1 text-xs text-gray-600 dark:text-gray-400">{item.name} — {item.price}</p>)}
          </div>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={apply} className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800">Terapkan ke Form Pricelist</button>
          <button type="button" onClick={() => { setPreview(null); setMessage('Preview dibatalkan. Data pricelist tidak berubah.'); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-neutral-700">Batal</button>
        </div>
      </div>}
    </section>
  );
}
