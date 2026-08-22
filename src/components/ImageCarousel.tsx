import { useCallback, useEffect, useRef, useState } from 'react';

export interface CarouselImage {
  url: string;
  alt: string;
  caption?: string;
}

interface Props {
  images: CarouselImage[];
  label: string;
}

export default function ImageCarousel({ images, label }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(images.length > 1);

  const updateNavigation = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maximum = track.scrollWidth - track.clientWidth;
    setCanPrevious(track.scrollLeft > 2);
    setCanNext(track.scrollLeft < maximum - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateNavigation();
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(track);
    track.addEventListener('scroll', updateNavigation, { passive: true });

    return () => {
      observer.disconnect();
      track.removeEventListener('scroll', updateNavigation);
    };
  }, [updateNavigation]);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstFigure = track?.querySelector<HTMLElement>('.carousel-figure');
    if (!track || !firstFigure) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0');
    track.scrollBy({ left: direction * (firstFigure.offsetWidth + gap), behavior: 'smooth' });
  };

  if (!images.length) return null;

  return (
    <section className="image-carousel" aria-label={label}>
      <div className="carousel-toolbar">
        <span>{label} // {String(images.length).padStart(2, '0')} FIGURES</span>
        <div className="carousel-controls">
          <button type="button" onClick={() => move(-1)} disabled={!canPrevious} aria-label="Previous image">←</button>
          <button type="button" onClick={() => move(1)} disabled={!canNext} aria-label="Next image">→</button>
        </div>
      </div>
      <div className="carousel-track" ref={trackRef} tabIndex={0}>
        {images.map((image, index) => (
          <figure className="carousel-figure" key={`${image.url}-${index}`}>
            <img src={image.url} alt={image.alt} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
            <figcaption>
              <span>FIG / {String(index + 1).padStart(2, '0')}</span>
              {image.caption && <span>{image.caption}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
