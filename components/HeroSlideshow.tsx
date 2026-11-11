'use client';

import { useEffect, useState } from 'react';

interface HeroSlideshowProps {
  images: string[];
  interval?: number;
}

export default function HeroSlideshow({ images, interval = 7000 }: HeroSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [images.length, interval]);

  const image = images[activeIndex];

  return (
    <>
      <img
        key={image}
        src={image}
        alt="Pilihin Fotomu portfolio photography"
        className="h-full w-full object-cover"
        style={{ animation: 'heroPhotoFade 900ms ease-in-out' }}
      />
      <style jsx>{`
        @keyframes heroPhotoFade {
          from { opacity: 0.35; transform: scale(1.015); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
