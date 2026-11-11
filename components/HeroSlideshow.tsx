'use client';

import { useEffect, useState } from 'react';

interface HeroSlideshowProps {
  images: string[];
  interval?: number;
}

export default function HeroSlideshow({ images, interval = 12000 }: HeroSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        setPreviousIndex(current);
        return (current + 1) % images.length;
      });
    }, interval);

    return () => window.clearInterval(timer);
  }, [images.length, interval]);

  useEffect(() => {
    if (previousIndex === null) return;

    setIsFading(false);
    const frame = window.requestAnimationFrame(() => setIsFading(true));
    const cleanup = window.setTimeout(() => {
      setPreviousIndex(null);
      setIsFading(false);
    }, 1900);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(cleanup);
    };
  }, [previousIndex]);

  const image = images[activeIndex];

  return (
    <div
      className="absolute inset-0 select-none"
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      aria-label="Pilihin Fotomu portfolio slideshow"
    >
      {previousIndex !== null && images[previousIndex] && (
        <img
          src={images[previousIndex]}
          alt=""
          draggable={false}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      <img
        key={image}
        src={image}
        alt="Pilihin Fotomu portfolio photography"
        draggable={false}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-in-out ${previousIndex !== null && !isFading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}
