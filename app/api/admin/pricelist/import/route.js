import { NextResponse } from 'next/server';
import { inflateRawSync } from 'node:zlib';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 20;
const MAX_BYTES = 5 * 1024 * 1024;

function decodeXml(value = '') {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function parseCsv(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

function parseXlsx(buffer) {
  const bytes = Buffer.from(buffer);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (bytes.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('File Excel tidak valid atau rusak.');
  const count = bytes.readUInt16LE(eocd + 10);
  if (count > 2000) throw new Error('File Excel memiliki terlalu banyak komponen.');
  let cursor = bytes.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    if (bytes.readUInt32LE(cursor) !== 0x02014b50) throw new Error('Struktur file Excel tidak valid.');
    const method = bytes.readUInt16LE(cursor + 10);
    const compressedSize = bytes.readUInt32LE(cursor + 20);
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const extraLength = bytes.readUInt16LE(cursor + 30);
    const commentLength = bytes.readUInt16LE(cursor + 32);
    const localOffset = bytes.readUInt32LE(cursor + 42);
    const name = bytes.toString('utf8', cursor + 46, cursor + 46 + nameLength);
    const localNameLength = bytes.readUInt16LE(localOffset + 26);
    const localExtraLength = bytes.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.subarray(start, start + compressedSize);
    const content = method === 0 ? compressed : method === 8 ? inflateRawSync(compressed, { maxOutputLength: 20 * 1024 * 1024 }) : null;
    if (!content) throw new Error('Metode kompresi Excel tidak didukung.');
    entries.set(name, content.toString('utf8'));
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  const sharedXml = entries.get('xl/sharedStrings.xml') || '';
  const shared = [...sharedXml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map(match => [...match[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(item => decodeXml(item[1])).join(''));
  const sheetPath = [...entries.keys()].find(name => /^xl\/worksheets\/sheet\d+\.xml$/.test(name));
  if (!sheetPath) throw new Error('Worksheet tidak ditemukan di file Excel.');
  const sheet = entries.get(sheetPath);
  return [...sheet.matchAll(/<row(?:\s[^>]*)?>([\s\S]*?)<\/row>/g)].map(match => {
    const cells = [];
    for (const cellMatch of match[1].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1]; const body = cellMatch[2];
      const ref = attrs.match(/\br="([A-Z]+)\d+"/)?.[1] || '';
      const index = [...ref].reduce((n, letter) => n * 26 + letter.charCodeAt(0) - 64, 0) - 1;
      const type = attrs.match(/\bt="([^"]+)"/)?.[1];
      const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? [...body.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(x => x[1]).join('');
      cells[index] = type === 's' ? (shared[Number(raw)] || '') : decodeXml(raw);
    }
    return cells.map(value => value ?? '');
  });
}

function normalizeRows(rows) {
  if (rows.length > 3001) throw new Error('Maksimal 3.000 baris data per impor.');
  if (rows.length < 2) throw new Error('Spreadsheet harus memiliki header dan minimal satu baris data.');
  const normalize = value => String(value || '').trim().toLowerCase().replace(/[ _-]+/g, '');
  const headers = rows[0].map(normalize);
  const find = (...aliases) => headers.findIndex(header => aliases.includes(header));
  const columns = {
    service: find('service', 'layanan', 'jenisservice'),
    category: find('kategori', 'category', 'type', 'jenis'),
    name: find('nama', 'name', 'namapaket', 'item'),
    price: find('harga', 'price'),
    detail: find('detail', 'keterangan', 'deskripsi', 'description'),
    duration: find('durasi', 'duration'),
    locations: find('lokasi', 'locations'),
    photos: find('foto', 'photos', 'jumlahfoto'),
    extras: find('extras', 'tambahan', 'fasilitas'),
    serviceDescription: find('deskripsiservice', 'servicedescription'),
  };
  if (columns.service < 0 || columns.name < 0 || columns.price < 0) throw new Error('Kolom wajib belum lengkap. Minimal: Service, Nama, Harga.');
  const services = new Map();
  rows.slice(1).forEach((row, index) => {
    const get = key => columns[key] < 0 ? '' : String(row[columns[key]] ?? '').trim();
    const title = get('service'); const name = get('name'); const price = get('price');
    if (!title || !name || !price) throw new Error('Baris ' + (index + 2) + ': Service, Nama, dan Harga wajib diisi.');
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'service';
    if (!services.has(id)) services.set(id, { id, title, description: get('serviceDescription'), showInService: true, photoPackages: [], videoPackages: [], addons: [] });
    const service = services.get(id);
    const category = normalize(get('category'));
    const item = { name, price, detail: get('detail'), duration: get('duration'), locations: get('locations'), photos: get('photos'), extras: get('extras') };
    if (['video', 'videopackage', 'paketvideo'].includes(category)) service.videoPackages.push(item);
    else if (['addon', 'addons', 'tambahan'].includes(category)) service.addons.push({ name, price });
    else service.photoPackages.push(item);
  });
  return [...services.values()];
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Silakan login kembali.' }, { status: 401 });
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 });

    const form = await request.formData();
    let rows;
    const file = form.get('file');
    const sheetUrl = String(form.get('sheetUrl') || '').trim();
    if (file instanceof File) {
      if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Ukuran file maksimal 5 MB.' }, { status: 413 });
      const name = file.name.toLowerCase();
      if (!name.endsWith('.xlsx') && !name.endsWith('.csv')) return NextResponse.json({ error: 'Format file harus .xlsx atau .csv.' }, { status: 400 });
      const buffer = await file.arrayBuffer();
      rows = name.endsWith('.csv') ? parseCsv(Buffer.from(buffer).toString('utf8').replace(/^\uFEFF/, '')) : parseXlsx(buffer);
    } else if (sheetUrl) {
      let parsed;
      try { parsed = new URL(sheetUrl); } catch { return NextResponse.json({ error: 'Link Google Sheets tidak valid.' }, { status: 400 }); }
      if (!['https:', 'http:'].includes(parsed.protocol)) return NextResponse.json({ error: 'Gunakan link Google Sheets yang diawali http:// atau https://.' }, { status: 400 });
      const pathMatch = parsed.pathname.match(/^\/spreadsheets\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
      const driveId = parsed.hostname === 'drive.google.com' && /^\/(?:open|file\/d\/)/.test(parsed.pathname)
        ? (parsed.searchParams.get('id') || parsed.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1])
        : null;
      if (!['docs.google.com', 'drive.google.com'].includes(parsed.hostname) || (!pathMatch && !driveId)) {
        return NextResponse.json({ error: 'Link tidak dikenali. Salin link spreadsheet dari Google Sheets melalui tombol Bagikan, lalu tempelkan link lengkapnya.' }, { status: 400 });
      }
      const id = pathMatch?.[1] || driveId;
      const hashGid = parsed.hash.match(/(?:^#|&)gid=(\d+)/)?.[1];
      const gid = parsed.searchParams.get('gid') || hashGid || '0';
      const urls = [
        'https://docs.google.com/spreadsheets/d/' + id + '/export?format=csv&gid=' + encodeURIComponent(gid),
        'https://docs.google.com/spreadsheets/d/' + id + '/gviz/tq?tqx=out:csv&gid=' + encodeURIComponent(gid),
      ];
      let csv = '';
      let lastStatus = 0;
      let lastIssue = '';
      for (const exportUrl of urls) {
        try {
          const response = await fetch(exportUrl, {
            signal: AbortSignal.timeout(12000),
            redirect: 'follow',
            headers: { 'Accept': 'text/csv,text/plain,*/*' },
          });
          const finalHost = new URL(response.url).hostname;
          if (finalHost !== 'docs.google.com' && !finalHost.endsWith('.googleusercontent.com')) {
            lastIssue = 'Redirect Google Sheets menuju host yang tidak dikenal.';
            continue;
          }
          lastStatus = response.status;
          const body = await response.text();
          if (Buffer.byteLength(body, 'utf8') > MAX_BYTES) throw new Error('Ukuran spreadsheet maksimal 5 MB.');
          if (response.ok && body.trim() && !body.trimStart().startsWith('<') && !body.includes('google.accounts')) {
            csv = body;
            break;
          }
          lastIssue = body.trimStart().startsWith('<')
            ? 'Google mengembalikan halaman HTML, bukan CSV. Spreadsheet mungkin meminta login atau belum bisa diekspor.'
            : 'Google Sheets merespons HTTP ' + response.status + '.';
        } catch (error) {
          if (error instanceof Error && error.message.includes('maksimal 5 MB')) throw error;
          lastIssue = error instanceof Error ? error.message : 'Koneksi ke Google Sheets gagal.';
        }
      }
      if (!csv) {
        if (lastStatus === 401 || lastStatus === 403) {
          throw new Error('Google menolak ekspor (HTTP ' + lastStatus + '). Pastikan link yang dimasukkan adalah link /edit dari spreadsheet yang benar, lalu cek kembali akses umum Viewer. Jika akun Google Workspace membatasi berbagi ke luar organisasi, admin Workspace perlu mengizinkannya.');
        }
        throw new Error('Gagal mengambil CSV dari Google Sheets' + (lastStatus ? ' (HTTP ' + lastStatus + ')' : '') + '. ' + (lastIssue || 'Periksa link dan akses spreadsheet.'));
      }
      rows = parseCsv(csv);
    } else return NextResponse.json({ error: 'Pilih file atau masukkan link Google Sheets.' }, { status: 400 });

    const services = normalizeRows(rows);
    return NextResponse.json({ services, rowCount: rows.length - 1 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal memproses spreadsheet.' }, { status: 400 });
  }
}
