// app/gallery/[slug]/GalleryClient.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, HelpCircle, User, Check, Camera, CheckCircle,
  Send, Maximize2, X, ChevronLeft, ChevronRight,
  CheckCircle2,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

export default function GalleryClient({ galleryData, initialPhotos, initialPageToken, folderId, existingSelection }) {
  const [selectedPhotos, setSelectedPhotos] = useState(() => {
    if (existingSelection?.selected_photos?.length > 0) {
      return existingSelection.selected_photos;
    }
    return [];
  });

  const [sentViaWa, setSentViaWa] = useState(existingSelection?.sent_via_wa ?? false);
  const [saving, setSaving]       = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const skipInitialAutoSave = useRef(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewIndex, setPreviewIndex] = useState(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [pageToken, setPageToken] = useState(initialPageToken);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");

  const maxPhotos = galleryData?.max_photos ?? 1000;
  const isLimitReached = selectedPhotos.length >= maxPhotos;

  const filteredPhotos = photos.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadMorePhotos = async () => {
    if (!pageToken || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadMoreError("");
    try {
      const params = new URLSearchParams({ folderId, pageToken, pageSize: "24" });
      const response = await fetch("/api/portfolio-photos?" + params.toString());
      if (!response.ok) throw new Error("Gagal memuat foto berikutnya.");
      const data = await response.json();
      setPhotos((current) => [...current, ...(data.photos || [])]);
      setPageToken(data.nextPageToken || null);
    } catch (error) {
      setLoadMoreError(error instanceof Error ? error.message : "Gagal memuat foto berikutnya.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const toggleSelectPhoto = (photo) => {
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

  const persistSelection = useCallback(async (photos, sentViaWhatsApp = false) => {
    const response = await fetch("/api/gallery/selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: galleryData?.slug,
        gallery_id: galleryData?.id,
        selectedPhotos: photos,
        sent_via_wa: sentViaWhatsApp,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Gagal menyimpan pilihan.");
    return data;
  }, [galleryData?.slug, galleryData?.id]);

  useEffect(() => {
    if (skipInitialAutoSave.current) {
      skipInitialAutoSave.current = false;
      return;
    }
    setAutoSaveStatus("saving");
    const timeout = setTimeout(async () => {
      try {
        await persistSelection(selectedPhotos, false);
        setAutoSaveStatus("saved");
      } catch (error) {
        console.error("Auto-save selection error:", error);
        setAutoSaveStatus("error");
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [selectedPhotos, persistSelection]);

  const handleSendToWhatsApp = async () => {
    if (selectedPhotos.length === 0) return;
    setSaving(true);
    try {
      await persistSelection(selectedPhotos, true);
      setSentViaWa(true);
      setAutoSaveStatus("saved");
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
      alert("Gagal menyimpan pilihan: " + (error instanceof Error ? error.message : "Coba lagi nanti."));
    } finally {
      setSaving(false);
    }
  };


  const previewPhoto = previewIndex !== null ? filteredPhotos[previewIndex] : null;
  const isPreviewSelected =
    previewPhoto && selectedPhotos.some((p) => p.name === previewPhoto.name);

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0f0f0f] font-sans text-gray-800 dark:text-gray-200 pb-28">
      <AppHeader
        actions={
          <div className="flex items-center gap-3 md:gap-6 text-sm text-gray-600 dark:text-gray-300">
            {sentViaWa && (
              <span className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-2.5 py-1 rounded-full">
                <CheckCircle2 size={12} /> Terkirim ke WA
              </span>
            )}
            <a href={"https://wa.me/" + (galleryData?.admin_whatsapp ?? "")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white text-sm">
              <HelpCircle size={16} /> Bantuan
            </a>
            <button className="hidden sm:block hover:text-gray-900 dark:hover:text-white" aria-label="Profil">
              <User size={20} />
            </button>
          </div>
        }
      />

      <main className="max-w-4xl mx-auto px-6 md:px-8 mt-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-2">
            {galleryData?.client_name ?? "Galeri Foto"}
          </p>
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white mb-2">Pilih Foto Favoritmu</h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
            Tandai foto yang ingin kamu pilih, maksimal <strong className="text-gray-700 dark:text-gray-200">{maxPhotos}</strong> foto.
            Klik ikon perbesar untuk melihat foto lebih detail.
          </p>
        </div>

        <div className="mb-4 text-xs" aria-live="polite">
          {autoSaveStatus === "saving" ? (
            <span className="text-neutral-500 dark:text-neutral-400">Menyimpan pilihan otomatis...</span>
          ) : autoSaveStatus === "error" ? (
            <span className="text-red-600 dark:text-red-400">Pilihan belum tersimpan. Periksa koneksi lalu coba ubah pilihan lagi.</span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">Pilihan tersimpan otomatis</span>
          )}
        </div>

        <div className="relative w-full mb-6">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Cari nama foto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-neutral-700"
          />
        </div>

        {filteredPhotos.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-16">
            {photos.length === 0
              ? "Belum ada foto di galeri ini."
              : "Tidak ada foto yang cocok dengan pencarian."}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredPhotos.map((photo, index) => {
              const isSelected = selectedPhotos.some((p) => p.name === photo.name);
              const isDisabled = !isSelected && isLimitReached;
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

        {pageToken && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {loadMoreError && <p role="alert" className="text-sm text-red-600">{loadMoreError}</p>}
            <button
              type="button"
              onClick={loadMorePhotos}
              disabled={isLoadingMore}
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              {isLoadingMore ? "Memuat foto..." : "Muat foto lainnya"}
            </button>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1.5">
              <Camera size={16} className="text-gray-400 dark:text-gray-500" />
              {photos.length} foto dimuat
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">{selectedPhotos.length}</span> / {maxPhotos} dipilih
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
                onClick={handleSendToWhatsApp}
                disabled={saving || selectedPhotos.length === 0}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Send size={16} />
                {saving ? "Menyimpan..." : sentViaWa ? "Kirim Ulang" : "Kirim ke WhatsApp"}
            </button>
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
              src={previewPhoto.fullUrl || previewPhoto.url}
              alt={previewPhoto.name}
              className="max-h-[75vh] w-auto rounded-lg object-contain"
            />
            <div className="flex items-center gap-4">
              <p className="text-white/80 text-sm">{previewPhoto.name.replace(/\.[^/.]+$/, "")}</p>
              <button
                onClick={() => toggleSelectPhoto(previewPhoto)}
                disabled={!isPreviewSelected && isLimitReached}
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
