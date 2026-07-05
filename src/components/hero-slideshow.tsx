"use client";

import { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, WheelEvent } from "react";
import { type HeroSlide } from "@/data/site-config";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface HeroSlideshowProps {
  slides: HeroSlide[];
  activeIndex: number;
  slideDurationMs: number;
  ready: boolean;
  introReady?: boolean;
  isRouteExiting?: boolean;
  onNavigate: (href: string) => void;
  onChange: (nextIndex: number) => void;
}

// Art direction like mimeyoi: portrait SP image below 768px, landscape KV above.
function HeroMedia({ slide, priority }: { slide: HeroSlide; priority: boolean }) {
  const shared = { alt: slide.imageAlt, fill: true, sizes: "100vw", priority };
  const { props: desktop } = getImageProps({ ...shared, src: slide.imageSrc });
  const mobileSrc = slide.imageMobileSrc;
  const mobile = mobileSrc ? getImageProps({ ...shared, src: mobileSrc }).props : null;

  return (
    <div className="hero-slideshow__media">
      <picture>
        {mobile ? <source media="(max-width: 768px)" srcSet={mobile.srcSet} /> : null}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img {...desktop} />
      </picture>
    </div>
  );
}

function Words({ text, delaySeconds }: { text: string; delaySeconds: number }) {
  return (
    <>
      {text.split(" ").map((word, index) => (
        <span
          className="c-word"
          key={`${word}-${index}`}
          style={{ "--in-delay": `${delaySeconds}s`, "--wi": index } as CSSProperties}
        >
          <span>{word}</span>
        </span>
      ))}
    </>
  );
}

export function HeroSlideshow({
  slides,
  activeIndex,
  slideDurationMs,
  ready,
  introReady = true,
  isRouteExiting = false,
  onNavigate,
  onChange
}: HeroSlideshowProps) {
  const reducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isSwitchLocked, setIsSwitchLocked] = useState(false);
  const switchUnlockTimerRef = useRef<number | null>(null);
  const wheelCarryRef = useRef(0);
  const previousActiveIndexRef = useRef(activeIndex);
  const switchLockMs = reducedMotion ? 80 : 1000;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (switchUnlockTimerRef.current !== null) {
        window.clearTimeout(switchUnlockTimerRef.current);
      }
    };
  }, []);

  const totalSlides = slides.length;
  const canAutoPlay = ready && hasMounted && totalSlides > 1;

  useEffect(() => {
    if (previousActiveIndexRef.current !== activeIndex) {
      setPrevIndex(previousActiveIndexRef.current);
      previousActiveIndexRef.current = activeIndex;
    }
  }, [activeIndex]);

  // Warm the next slide's image so the wipe never reveals an unloaded frame.
  useEffect(() => {
    if (!hasMounted || totalSlides < 2) {
      return;
    }

    const nextSlide = slides[(activeIndex + 1) % totalSlides];
    if (!nextSlide) {
      return;
    }

    const desktopImage = new window.Image();
    desktopImage.decoding = "async";
    desktopImage.src = nextSlide.imageSrc;

    if (nextSlide.imageMobileSrc) {
      const mobileImage = new window.Image();
      mobileImage.decoding = "async";
      mobileImage.src = nextSlide.imageMobileSrc;
    }
  }, [activeIndex, hasMounted, slides, totalSlides]);

  const commitSlideChange = useCallback(
    (nextIndex: number, force = false) => {
      if (totalSlides < 2) {
        return;
      }

      const bounded = ((nextIndex % totalSlides) + totalSlides) % totalSlides;
      if (bounded === activeIndex) {
        return;
      }

      if (!force && isSwitchLocked) {
        return;
      }

      setIsSwitchLocked(true);
      if (switchUnlockTimerRef.current !== null) {
        window.clearTimeout(switchUnlockTimerRef.current);
      }
      switchUnlockTimerRef.current = window.setTimeout(() => {
        setIsSwitchLocked(false);
        switchUnlockTimerRef.current = null;
      }, switchLockMs);

      onChange(bounded);
    },
    [activeIndex, isSwitchLocked, onChange, switchLockMs, totalSlides]
  );

  useEffect(() => {
    if (!canAutoPlay) {
      return;
    }

    const timer = window.setTimeout(() => {
      commitSlideChange(activeIndex + 1, true);
    }, slideDurationMs);
    return () => window.clearTimeout(timer);
  }, [activeIndex, canAutoPlay, commitSlideChange, slideDurationMs]);

  const onWheel = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (!canAutoPlay || isSwitchLocked) {
        return;
      }

      const delta = event.deltaY + event.deltaX;
      if (Math.abs(delta) < 2) {
        return;
      }

      wheelCarryRef.current += delta;
      if (Math.abs(wheelCarryRef.current) < 40) {
        return;
      }

      commitSlideChange(activeIndex + (wheelCarryRef.current > 0 ? 1 : -1));
      wheelCarryRef.current = 0;
    },
    [activeIndex, canAutoPlay, commitSlideChange, isSwitchLocked]
  );

  const activeSlide = slides[activeIndex];

  return (
    <section
      id="top"
      className={`hero-slideshow ${isRouteExiting ? "is-exiting" : ""}`}
      aria-label="Featured works"
      data-intro={reducedMotion || introReady ? "true" : "false"}
      data-playing={canAutoPlay ? "true" : "false"}
      style={
        {
          "--character": activeSlide.theme.bgA,
          "--speed": `${slideDurationMs / 1000}s`
        } as CSSProperties
      }
      onWheel={onWheel}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const isPrev = prevIndex === index && !isActive;

        return (
          <article
            key={slide.id}
            className={`hero-slideshow__slide ${isActive ? "is-active" : ""} ${isPrev ? "is-prev" : ""}`}
            style={{ "--slide-bg": slide.theme.bgA } as CSSProperties}
            aria-hidden={!isActive}
          >
            <HeroMedia slide={slide} priority={index === 0} />

            <div className="hero-slideshow__text">
              <p className="hero-slideshow__status">
                <Words text={slide.status} delaySeconds={0.5} />
              </p>
              <h1 className="hero-slideshow__title">
                <Words text={slide.title} delaySeconds={0.6} />
              </h1>
              <p className="hero-slideshow__subtitle">
                <Words text={slide.subtitle} delaySeconds={0.7} />
              </p>
              <button className="hero-slideshow__cta" type="button" onClick={() => onNavigate(slide.ctaHref)}>
                {slide.cta}
              </button>
            </div>

            <div className="hero-slideshow__meta">
              <p>{slide.detailA}</p>
              <p>{slide.detailB}</p>
              <span>{`${String(index + 1).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`}</span>
            </div>
          </article>
        );
      })}

      <div className="hero-slideshow__control" role="tablist" aria-label="Hero slides">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            className={`_item ${index === activeIndex ? "is-active" : ""}`}
            onClick={() => commitSlideChange(index)}
          >
            <span className="_title">{slide.title}</span>
            <span className="_caption">{slide.subtitle.split("·")[0]?.trim() ?? slide.status}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
