'use client';

import { useEffect, useState } from 'react';
import PortfolioImage from '@/components/PortfolioImage';

type Photo = { id: string; url: string; fullUrl?: string; name: string };

export default function PortfolioGallery({
  photos: initialPhotos,
  folderId,
  initialPageToken,
}: {
  photos: Photo[];
  folderId: string;
  initialPageToken: string | null;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [pageToken, setPageToken] = useState(initialPageToken);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const loadMore = async () => {
    if (!pageToken || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadError('');
    try {
      const params = new URLSearchParams({
        folderId,
        pageToken,
        pageSize: '20',
      });
      const response = await fetch(`/api/portfolio-photos?${params.toString()}`);
      if (!response.ok) throw new Error('Gagal memuat foto berikutnya.');
      const data = await response.json();
      setPhotos((current) => [...current, ...(data.photos || [])]);
      setPageToken(data.nextPageToken || null);
    } catch {
      setLoadError('Foto berikutnya gagal dimuat. Coba lagi.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const close = () => setActiveIndex(null);
  const previous = () => setActiveIndex((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
  const next = () => setActiveIndex((current) => current === null ? null : (current + 1) % photos.length);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeIndex]);

  return (
    <>
      <div className="columns-2 gap-4 space-y-4 md:columns-3 md:gap-6 md:space-y-6">
        {photos.map((photo, index) => (
          <figure key={photo.id} className="mb-4 break-inside-avoid overflow-hidden md:mb-6">
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              onContextMenu={(event) => event.preventDefault()}
              className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
              aria-label={`Perbesar foto ${index + 1}`}
            >
              <PortfolioImage
                src={photo.url}
                alt={photo.name.replace(/\.[^/.]+$/, '')}
                loading="lazy"
                className="block h-auto w-full object-contain transition duration-700 hover:scale-[1.02]"
              />
            </button>
          </figure>
        ))}
      </div>

      {pageToken && (
        <div className="mt-10 flex flex-col items-center gap-3">
          {loadError && <p role="alert" className="text-sm text-red-600">{loadError}</p>}
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="rounded-full border border-black/15 px-6 py-3 text-sm transition hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-60 dark:border-white/20 dark:hover:bg-white dark:hover:text-black"
          >
            {isLoadingMore ? 'Memuat foto...' : 'Muat foto lainnya'}
          </button>
        </div>
      )}

      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan foto portfolio"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md md:p-8"
          onClick={close}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Tutup tampilan foto"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-2xl text-white hover:bg-white/20"
          >×</button>
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); previous(); }}
            aria-label="Foto sebelumnya"
            className="absolute left-2 z-10 rounded-full bg-white/10 px-4 py-3 text-3xl text-white hover:bg-white/20 md:left-6"
          >‹</button>
          <div className="flex h-full w-full items-center justify-center" onClick={(event) => event.stopPropagation()}>
            <img
              src={photos[activeIndex].fullUrl || photos[activeIndex].url}
              alt={photos[activeIndex].name.replace(/\.[^/.]+$/, '')}
              draggable={false}
              onContextMenu={(event) => event.preventDefault()}
              onDragStart={(event) => event.preventDefault()}
              className="max-h-full max-w-full select-none object-contain"
            />
          </div>
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); next(); }}
            aria-label="Foto berikutnya"
            className="absolute right-2 z-10 rounded-full bg-white/10 px-4 py-3 text-3xl text-white hover:bg-white/20 md:right-6"
          >›</button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70">
            {activeIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
