// app/gallery/[slug]/GalleryClient.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, HelpCircle, User, Check, Camera, CheckCircle,
  Send, Maximize2, X, ChevronLeft, ChevronRight,
  Lock, CheckCircle2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

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
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0f0f0f] font-sans text-gray-800 dark:text-gray-200 pb-28">
      <header className="bg-[#f7f7f7] dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Pilihin Fotomu</span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold border-l border-gray-300 dark:border-neutral-700 pl-2 ml-2">
            by Abazic
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-600 dark:text-gray-300">
          <ThemeToggle />
          {isLocked && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 border
