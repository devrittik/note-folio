import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

export interface CarouselImage {
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface Props {
  images: CarouselImage[];
  label: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export default function ImageCarousel({ images, label }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({ active: false, x: 0, y: 0, left: 0, top: 0 });
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(images.length > 1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [isDragging, setIsDragging] = useState(false);

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

  const closeLightbox = useCallback(() => {
    dragRef.current.active = false;
    setIsDragging(false);
    dialogRef.current?.close();
  }, []);

  const navigateLightbox = useCallback((direction: -1 | 1) => {
    if (activeIndex === null || images.length < 2) return;
    dragRef.current.active = false;
    setIsDragging(false);
    setActiveIndex((activeIndex + direction + images.length) % images.length);
    setZoom(MIN_ZOOM);
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') navigateLightbox(-1);
      if (event.key === 'ArrowRight') navigateLightbox(1);
      if (event.key === '+' || event.key === '=') setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP));
      if (event.key === '-') setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP));
      if (event.key === '0') setZoom(MIN_ZOOM);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, navigateLightbox]);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setZoom(MIN_ZOOM);
    window.requestAnimationFrame(() => {
      dialogRef.current?.showModal();
      closeButtonRef.current?.focus();
    });
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || activeIndex === null) return;
    window.requestAnimationFrame(() => {
      if (zoom <= MIN_ZOOM) {
        stage.scrollTo({ left: 0, top: 0 });
      } else {
        stage.scrollTo({
          left: (stage.scrollWidth - stage.clientWidth) / 2,
          top: (stage.scrollHeight - stage.clientHeight) / 2
        });
      }
    });
  }, [zoom, activeIndex]);

  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage || zoom <= MIN_ZOOM || event.button !== 0) return;
    dragRef.current = {
      active: true,
      x: event.clientX,
      y: event.clientY,
      left: stage.scrollLeft,
      top: stage.scrollTop
    };
    stage.setPointerCapture(event.pointerId);
    setIsDragging(true);
    event.preventDefault();
  };

  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    const drag = dragRef.current;
    if (!stage || !drag.active) return;
    stage.scrollLeft = drag.left - (event.clientX - drag.x);
    stage.scrollTop = drag.top - (event.clientY - drag.y);
    event.preventDefault();
  };

  const stopPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstFigure = track?.querySelector<HTMLElement>('.carousel-figure');
    if (!track || !firstFigure) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0');
    track.scrollBy({ left: direction * (firstFigure.offsetWidth + gap), behavior: 'smooth' });
  };

  if (!images.length) return null;
  const activeImage = activeIndex === null ? undefined : images[activeIndex];

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
            <button className="carousel-open" type="button" onClick={() => openLightbox(index)} aria-label={`Open full image ${index + 1}: ${image.alt}`}>
              <img src={image.url} alt={image.alt} width={image.width} height={image.height} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
              <span className="image-open-cue" aria-hidden="true">VIEW ↗</span>
            </button>
            <figcaption>
              <span>FIG / {String(index + 1).padStart(2, '0')}</span>
              {image.caption && <span>{image.caption}</span>}
            </figcaption>
          </figure>
        ))}
      </div>

      <dialog
        className="lightbox-dialog"
        ref={dialogRef}
        aria-label={`${label} image viewer`}
        onClose={() => { dragRef.current.active = false; setIsDragging(false); setActiveIndex(null); setZoom(MIN_ZOOM); }}
        onClick={(event) => { if (event.target === dialogRef.current) closeLightbox(); }}
      >
        {activeImage && (
          <div className="lightbox-shell">
            <div className="lightbox-toolbar">
              <span>FIG / {String(activeIndex! + 1).padStart(2, '0')} // {String(images.length).padStart(2, '0')}</span>
              <div className="lightbox-controls">
                <button type="button" onClick={() => navigateLightbox(-1)} disabled={images.length < 2} aria-label="Previous full image">←</button>
                <button type="button" onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out">−</button>
                <button type="button" onClick={() => setZoom(MIN_ZOOM)} aria-label="Reset zoom">{Math.round(zoom * 100)}%</button>
                <button type="button" onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">＋</button>
                <button type="button" onClick={() => navigateLightbox(1)} disabled={images.length < 2} aria-label="Next full image">→</button>
                <button className="lightbox-close" ref={closeButtonRef} type="button" onClick={closeLightbox} aria-label="Close image viewer">×</button>
              </div>
            </div>

            <div
              className={`lightbox-stage${zoom > MIN_ZOOM ? ' is-zoomed' : ''}${isDragging ? ' is-dragging' : ''}`}
              ref={stageRef}
              onPointerDown={startPan}
              onPointerMove={movePan}
              onPointerUp={stopPan}
              onPointerCancel={stopPan}
            >
              <div className="lightbox-image-canvas" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
                <img
                  src={activeImage.url}
                  alt={activeImage.alt}
                  width={activeImage.width}
                  height={activeImage.height}
                  draggable={false}
                />
              </div>
            </div>

            <div className="lightbox-caption">
              <span>{activeImage.alt}</span>
              {activeImage.caption && <span>{activeImage.caption}</span>}
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
