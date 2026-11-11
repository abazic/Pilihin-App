'use client';

interface PortfolioImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export default function PortfolioImage({ src, alt, className = '', loading = 'lazy' }: PortfolioImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      className={className}
    />
  );
}
