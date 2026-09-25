/**
 * Memeriksa apakah tanggal galeri sudah kedaluwarsa berdasarkan zona waktu Africa/Cairo.
 * @param {string|Date} expireDate - Tanggal kadaluwarsa dari database (misal: "2026-09-25")
 * @returns {boolean} - true jika sudah expired, false jika masih aktif/kosong
 */
export function isGalleryExpired(expireDate) {
  if (!expireDate) return false;

  // Format tanggal hari ini di Kairo ke ISO Date YYYY-MM-DD
  const nowInCairo = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  // Pastikan expireDate dipotong ke format YYYY-MM-DD jika inputnya timestamp/ISO string
  const cleanExpireDate = String(expireDate).slice(0, 10);

  return nowInCairo > cleanExpireDate;
}
