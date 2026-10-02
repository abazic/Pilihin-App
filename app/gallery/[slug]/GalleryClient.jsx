// app/gallery/[slug]/GalleryClient.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, HelpCircle, User, Check, Camera, CheckCircle,
  Send, Maximize2, X, ChevronLeft, ChevronRight,
  Lock, CheckCircle2,
} from "lucide-react";

export default function GalleryClient({ galleryData, initialPhotos, existingSelection }) {
  const [selectedPhotos, setSelectedPhotos] = useState(() => {
    if (existingSelection?.selected_photos?.length > 0) {
      return existingSelection.selected_photos;
    }
    return [];
  });

  const [isLocked, setIsLocked]   = useState(existingSelection?.is_locked ?? false);
  const [sentViaWa, setSentViaWa] = useState(existingSelection?.sent_via_wa ?? false);
  const [locking, setLocking]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewIndex, setPreviewIndex] = useState(null);

  const maxPhotos = galleryData?.max_photos ?? initialPhotos.length;
  const isLimitReached = selectedPhotos.length >= maxPhotos;

  const filteredPhotos = initialPhotos.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectPhoto = (photo) => {
    if (isLocked) return;
    setSelectedPhotos((prev) => {
      const already = prev.some((p) => p.name === photo.name);
      if (already) return prev.filter((p) => p.name !== photo.name);
      if (prev.length >= maxPhotos) return prev;
      return [...prev, { name: photo.name, url: photo.url }];
    });
  };

  const closePreview = useCallback(() => setPreviewIndex(null), []);
  const showPrev = useCallback(
    () => setPreviewIndex((i) => (i > 0 ? i - 1 : i)),
    []
  );
  const showNext = useCallback(
    () => setPreviewIndex((i) => (i < filteredPhotos.length - 1 ? i + 1 : i)),
    [filteredPhotos.length]
  );

  useEffect(() => {
    if (previewIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewIndex, closePreview, showPrev, showNext]);

  const handleSendToWhatsApp = async () => {
    if (selectedPhotos.length === 0) return;
    setSaving(true);
    try {
      const response = await fetch("/api/gallery/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: galleryData?.slug,
          gallery_id: galleryData?.id,
          selectedPhotos: selectedPhotos,
          sent_via_wa: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert("Gagal menyimpan pilihan: " + data.error);
        return;
      }
      setSentViaWa(true);
      const photoListText = selectedPhotos
        .map((p, i) => (i + 1) + ". " + p.name)
        .join("\n");
      const message =
        "Halo Admin, saya telah selesai memilih foto.\n\n" +
        "*Detail Klien:* " + (galleryData?.client_name || "Klien") + "\n" +
        "*Total Foto Terpilih:* " + selectedPhotos.length + " Foto\n\n" +
        "*Daftar Nama Foto:*\n" + photoListText + "\n\n" +
        "Mohon diproses untuk tahap selanjutnya. Terima kasih!";
      if (galleryData?.admin_whatsapp) {
        const waUrl = "https://wa.me/" + galleryData.admin_whatsapp + "?text=" + encodeURIComponent(message);
        window.open(waUrl, "_blank");
      }
    } catch (error) {
      console.error("Error saving selection:", error);
      alert("Terjadi kesalahan jaringan, coba lagi nanti.");
    } finally {
      setSaving(false);
    }
  };

  const handleLockSelection = async () => {
  if (selectedPhotos.length === 0) return;

  if (isLocked) {
    // Batalkan kunci
    const confirmed = window.confirm("Buka kunci pilihan? Kamu bisa mengubah pilihan lagi.");
    if (!confirmed) return;
    setLocking(true);
    try {
      const response = await fetch("/api/gallery/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: galleryData?.slug,
          gallery_id: galleryData?.id,
          selectedPhotos: selectedPhotos,
          is_locked: false,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert("Gagal membuka kunci: " + data.error);
        return;
      }
      setIsLocked(false);
    } catch (error) {
      console.error("Error unlocking selection:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLocking(false);
    }
    return;
  }

  // Kunci pilihan
  const confirmed = window.confirm(
    "Kunci pilihan? Setelah dikunci, kamu tidak bisa mengubah pilihan lagi.\n\n" +
    "Total: " + selectedPhotos.length + " foto dipilih."
  );
  if (!confirmed) return;
  setLocking(true);
  try {
    const response = await fetch("/api/gallery/selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: galleryData?.slug,
        gallery_id: galleryData?.id,
        selectedPhotos: selectedPhotos,
        is_locked: true,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      alert("Gagal mengunci pilihan: " + data.error);
      return;
    }
    setIsLocked(true);
  } catch (error) {
    console.error("Error locking selection:", error);
    alert("Terjadi kesalahan jaringan.");
  } finally {
    setLocking(false);
  }
  };

  const previewPhoto = previewIndex !== null ? filteredPhotos[previewIndex] : null;
  const isPreviewSelected =
    previewPhoto && selectedPhotos.some((p) => p.name === previewPhoto.name);

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-gray-800 pb-28">
      <header className="bg-[#f7f7f7] border-b border-gray-200 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-2xl font-bold tracking-tight">Pilihin Fotomu</span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-gray-400 font-semibold border-l border-gray-300 pl-2 ml-2">
            by Abazic
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-600">
          {isLocked && (
            <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <Lock size={12} /> Terkunci
            </span>
          )}
          {sentViaWa && !isLocked && (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={12} /> Terkirim ke WA
            </span>
          )}
          <a
            href={"https://wa.me/" + (galleryData?.admin_whatsapp ?? "")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-900 text-sm"
          >
            <HelpCircle size={16} /> Bantuan
          </a>
          <button className="hover:text-gray-900">
            <User size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-8 mt-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
            {galleryData?.client_name ?? "Galeri Foto"}
          </p>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Pilih Foto Favoritmu</h1>
          {isLocked ? (
            <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <Lock size={15} />
              <span>Pilihan foto sudah <strong>dikunci</strong> dan tidak dapat diubah lagi. Hubungi admin jika ada perubahan.</span>
            </div>
          ) : (
            <p className="text-gray-500 leading-relaxed text-sm">
              Tandai foto yang ingin kamu pilih, maksimal <strong>{maxPhotos}</strong> foto.
              Klik ikon perbesar untuk melihat foto lebih detail.
            </p>
          )}
        </div>

        <div className="relative w-full mb-6">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama foto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {filteredPhotos.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">
            {initialPhotos.length === 0
              ? "Belum ada foto di galeri ini."
              : "Tidak ada foto yang cocok dengan pencarian."}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredPhotos.map((photo, index) => {
              const isSelected = selectedPhotos.some((p) => p.name === photo.name);
              const isDisabled = isLocked || (!isSelected && isLimitReached);
              return (
                <div
                  key={photo.id}
                  onClick={() => !isDisabled && toggleSelectPhoto(photo)}
                  className={
                    "relative group aspect-square rounded-xl overflow-hidden " +
                    (isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer")
                  }
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />
                  <div className="absolute top-3 left-3">
                    <div className={
                      "w-5 h-5 rounded flex items-center justify-center border transition-colors " +
                      (isSelected
                        ? "bg-blue-600 border-blue-600"
                        : "bg-transparent border-white/70 group-hover:border-white")
                    }>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreviewIndex(index); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                    aria-label="Perbesar foto"
                  >
                    <Maximize2 size={13} />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white text-xs font-medium tracking-wide">
                      {photo.name.replace(/\.[^/.]+$/, "")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Camera size={16} className="text-gray-400" />
              {initialPhotos.length} foto
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={16} className="text-gray-400" />
              <span className="font-medium text-gray-900">{selectedPhotos.length}</span> / {maxPhotos} dipilih
            </div>
          </div>

          <div className="flex items-center gap-2">
              <button
  onClick={handleLockSelection}
  disabled={locking || selectedPhotos.length === 0}
  className={
    "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-white " +
    (isLocked
      ? "bg-red-500 hover:bg-red-600"
      : "bg-amber-500 hover:bg-amber-600")
  }
>
  <Lock size={15} />
  {locking ? (isLocked ? "Membuka..." : "Mengunci...") : (isLocked ? "Buka Kunci" : "Kunci Pilihan")}
</button>
          
            {!(isLocked && sentViaWa) && (
              <button
                onClick={handleSendToWhatsApp}
                disabled={saving || selectedPhotos.length === 0}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Send size={16} />
                {saving ? "Menyimpan..." : sentViaWa ? "Kirim Ulang" : "Kirim ke WhatsApp"}
              </button>
            )}
          </div>
        </div>
      </div>

      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
          onClick={closePreview}
        >
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
          {previewIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); showPrev(); }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          {previewIndex < filteredPhotos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showNext(); }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              aria-label="Selanjutnya"
            >
              <ChevronRight size={22} />
            </button>
          )}
          <div
            className="max-w-3xl w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewPhoto.url}
              alt={previewPhoto.name}
              className="max-h-[75vh] w-auto rounded-lg object-contain"
            />
            <div className="flex items-center gap-4">
              <p className="text-white/80 text-sm">{previewPhoto.name.replace(/\.[^/.]+$/, "")}</p>
              <button
                onClick={() => !isLocked && toggleSelectPhoto(previewPhoto)}
                disabled={isLocked || (!isPreviewSelected && isLimitReached)}
                className={
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed " +
                  (isPreviewSelected
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-900 hover:bg-gray-100")
                }
              >
                <Check size={14} />
                {isPreviewSelected ? "Terpilih" : "Pilih Foto Ini"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
