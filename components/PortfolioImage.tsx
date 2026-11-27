'use client';

import Image from 'next/image';

interface PortfolioImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  width?: number | null;
  height?: number | null;
}

export default function PortfolioImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  width,
  height,
}: PortfolioImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width || 1200}
      height={height || 800}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={75}
      loading={loading}
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      className={className}
    />
  );
}
