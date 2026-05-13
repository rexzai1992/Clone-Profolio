"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, WheelEvent } from "react";
import type { FigureItem } from "@/data/site-config";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ImageReveal } from "@/components/image-reveal";

interface InfiniteCarouselProps {
  items: FigureItem[];
  heading?: string;
}

interface DragState {
  down: boolean;
  startX: number;
  startOffset: number;
}

function wrapOffset(offset: number, loopWidth: number) {
  let next = offset;
  while (next <= -2 * loopWidth) {
    next += loopWidth;
  }
  while (next > 0) {
    next -= loopWidth;
  }
  return next;
}

export function InfiniteCarousel({ items, heading = "Collectible Gallery" }: InfiniteCarouselProps) {
  const reducedMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const laneRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef<DragState>({ down: false, startX: 0, startOffset: 0 });
  const wheelTimerRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const snapTargetRef = useRef<number | null>(null);
  const activeRawIndexRef = useRef(0);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [activeRawIndex, setActiveRawIndex] = useState(0);

  const duplicated = useMemo(
    () =>
      [...items, ...items, ...items].map((item, index) => ({
        ...item,
        rawIndex: index,
        sourceIndex: index % items.length
      })),
    [items]
  );

  const [itemStep, setItemStep] = useState(340);
  const loopWidth = itemStep * items.length;

  const updateSizing = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const itemWidth = Math.max(210, Math.min(420, viewport.clientWidth * 0.24));
    const gap = Math.max(12, Math.min(34, viewport.clientWidth * 0.016));
    setItemStep(itemWidth + gap);
    offsetRef.current = wrapOffset(offsetRef.current || -loopWidth, Math.max(loopWidth, 1));
  }, [loopWidth]);

  const alignToNearest = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || loopWidth <= 0) {
      return;
    }

    const center = viewport.clientWidth / 2;
    const approxIndex = Math.round((center - itemStep / 2 - offsetRef.current) / itemStep);
    const target = center - itemStep / 2 - approxIndex * itemStep;
    snapTargetRef.current = wrapOffset(target, loopWidth);
  }, [itemStep, loopWidth]);

  useEffect(() => {
    updateSizing();
    window.addEventListener("resize", updateSizing);
    return () => window.removeEventListener("resize", updateSizing);
  }, [updateSizing]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    if (offsetRef.current === 0) {
      offsetRef.current = -loopWidth;
    }

    let previous = performance.now();
    const tick = (time: number) => {
      const lane = laneRef.current;
      const viewport = viewportRef.current;
      if (!lane || !viewport) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const delta = Math.min(32, time - previous);
      previous = time;

      if (!dragRef.current.down && !reducedMotion) {
        offsetRef.current -= delta * 0.046;
      }

      if (!dragRef.current.down && Math.abs(velocityRef.current) > 0.01) {
        offsetRef.current += velocityRef.current;
        velocityRef.current *= 0.92;
      }

      if (snapTargetRef.current !== null && !dragRef.current.down) {
        const next = snapTargetRef.current;
        const eased = offsetRef.current + (next - offsetRef.current) * 0.12;
        offsetRef.current = eased;
        if (Math.abs(next - offsetRef.current) < 0.7) {
          offsetRef.current = next;
          snapTargetRef.current = null;
        }
      }

      offsetRef.current = wrapOffset(offsetRef.current, loopWidth);
      lane.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;

      const viewportCenter = viewport.clientWidth / 2;
      let minDistance = Number.POSITIVE_INFINITY;
      let candidateRaw = 0;

      for (let i = 0; i < duplicated.length; i += 1) {
        const center = i * itemStep + offsetRef.current + itemStep / 2;
        const distance = Math.abs(center - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          candidateRaw = i;
        }
      }

      if (candidateRaw !== activeRawIndexRef.current) {
        activeRawIndexRef.current = candidateRaw;
        setActiveRawIndex(candidateRaw);
        setActiveItemIndex(candidateRaw % items.length);
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (wheelTimerRef.current !== null) {
        window.clearTimeout(wheelTimerRef.current);
        wheelTimerRef.current = null;
      }
    };
  }, [duplicated, itemStep, items.length, loopWidth, reducedMotion]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!viewportRef.current) {
      return;
    }

    dragRef.current.down = true;
    dragRef.current.startX = event.clientX;
    dragRef.current.startOffset = offsetRef.current;
    velocityRef.current = 0;
    snapTargetRef.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.down) {
      return;
    }

    const dx = event.clientX - dragRef.current.startX;
    offsetRef.current = dragRef.current.startOffset + dx * 1.04;
    velocityRef.current = dx * 0.015;
  }, []);

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.down) {
      return;
    }
    dragRef.current.down = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    alignToNearest();
  }, [alignToNearest]);

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      const delta = event.deltaX + event.deltaY;
      if (Math.abs(delta) < 0.4) {
        return;
      }

      offsetRef.current -= delta * 0.84;
      velocityRef.current = -delta * 0.012;
      snapTargetRef.current = null;
      if (wheelTimerRef.current !== null) {
        window.clearTimeout(wheelTimerRef.current);
      }
      wheelTimerRef.current = window.setTimeout(() => {
        alignToNearest();
        wheelTimerRef.current = null;
      }, 130);
      event.preventDefault();
    },
    [alignToNearest]
  );

  const activeItem = items[activeItemIndex];

  return (
    <section
      className="infinite-carousel"
      style={{ "--carousel-bg": activeItem?.color ?? "#f4f4f4" } as CSSProperties}
      aria-label="Infinite product carousel"
    >
      <header className="infinite-carousel__header">
        <p>{heading}</p>
        <span>{`${(activeItemIndex + 1).toString().padStart(2, "0")} / ${items.length.toString().padStart(2, "0")}`}</span>
      </header>

      <div
        ref={viewportRef}
        className="infinite-carousel__viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <div ref={laneRef} className="infinite-carousel__lane">
          {duplicated.map((item) => (
            <article
              key={`${item.id}-${item.rawIndex}`}
              className={`infinite-carousel__item ${item.rawIndex === activeRawIndex ? "is-active" : ""}`}
            >
              <a href={item.href} onClick={(event) => event.preventDefault()}>
                <ImageReveal
                  src={item.imageSrc}
                  alt={item.name}
                  width={420}
                  height={600}
                  sizes="(max-width: 768px) 52vw, 24vw"
                  wrapperClassName="infinite-carousel__image-frame"
                  imageClassName="infinite-carousel__image"
                />
              </a>
            </article>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem?.id ?? "active"}
          className="infinite-carousel__caption"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <strong>{activeItem?.name}</strong>
          <span>{activeItem?.caption}</span>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
