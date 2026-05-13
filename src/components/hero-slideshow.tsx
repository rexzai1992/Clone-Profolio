"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { type HeroSlide } from "@/data/site-config";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ImageReveal } from "@/components/image-reveal";

interface HeroSlideshowProps {
  slides: HeroSlide[];
  activeIndex: number;
  slideDurationMs: number;
  ready: boolean;
  onNavigate: (href: string) => void;
  onChange: (nextIndex: number) => void;
}

function formatSlideNumber(value: number) {
  return value.toString().padStart(2, "0");
}

function MotionWords({
  text,
  delay = 0,
  duration = 0.5,
  canAnimate = true
}: {
  text: string;
  delay?: number;
  duration?: number;
  canAnimate?: boolean;
}) {
  return (
    <span className="motion-words" aria-label={text}>
      {text.split(" ").map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={canAnimate ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={canAnimate ? { opacity: 0, y: -12 } : { opacity: 0 }}
          transition={{
            duration,
            delay: delay + index * 0.04,
            ease: [0.22, 1, 0.36, 1]
          }}
          aria-hidden="true"
        >
          {word}
          {index < text.split(" ").length - 1 ? "\u00a0" : ""}
        </motion.span>
      ))}
    </span>
  );
}

export function HeroSlideshow({
  slides,
  activeIndex,
  slideDurationMs,
  ready,
  onNavigate,
  onChange
}: HeroSlideshowProps) {
  const reducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [stamp, setStamp] = useState({ month: "---", year: "----" });
  const sectionRef = useRef<HTMLElement | null>(null);
  const canAnimate = hasMounted && hasEntered && !reducedMotion;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      setHasEntered(true);
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    const now = new Date();
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(now);
    setStamp({ month, year: String(now.getFullYear()) });
  }, [hasMounted]);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const pointerSpringX = useSpring(pointerX, { stiffness: 90, damping: 20, mass: 0.7 });
  const pointerSpringY = useSpring(pointerY, { stiffness: 90, damping: 20, mass: 0.7 });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, -32]);
  const parallaxX = useTransform(pointerSpringX, (value) => (reducedMotion ? 0 : value));
  const parallaxY = useTransform([pointerSpringY, scrollY], ([pointer, scroll]) =>
    reducedMotion ? 0 : (pointer as number) + (scroll as number)
  );

  const activeSlide = slides[activeIndex];
  const totalSlides = slides.length;
  const heroPreState = { opacity: 0.6, scale: 1.06, clipPath: "circle(12% at 50% 50%)" };
  const heroFinalState = { opacity: 1, scale: 1, clipPath: "circle(140% at 50% 50%)" };
  const textPreState = { opacity: 0, y: 16 };
  const textFinalState = { opacity: 1, y: 0 };
  const showFinalState = reducedMotion || hasEntered;

  const goTo = useCallback(
    (nextIndex: number) => {
      if (totalSlides < 2) {
        return;
      }

      const bounded = ((nextIndex % totalSlides) + totalSlides) % totalSlides;
      onChange(bounded);
    },
    [onChange, totalSlides]
  );

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (!ready || !hasMounted || reducedMotion || totalSlides < 2) {
      return;
    }

    const timer = window.setTimeout(goNext, slideDurationMs);
    return () => window.clearTimeout(timer);
  }, [activeIndex, goNext, hasMounted, ready, reducedMotion, slideDurationMs, totalSlides]);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (reducedMotion) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      pointerX.set(nx * 22);
      pointerY.set(ny * 18);
    },
    [pointerX, pointerY, reducedMotion]
  );

  const onPointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  const slideLabel = useMemo(
    () => `${formatSlideNumber(activeIndex + 1)} / ${formatSlideNumber(totalSlides)}`,
    [activeIndex, totalSlides]
  );

  return (
    <section
      id="top"
      ref={sectionRef}
      className="hero-slideshow"
      aria-label="Featured works"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="hero-slideshow__media">
        <AnimatePresence mode="sync">
          <motion.article
            key={activeSlide.id}
            className="hero-slideshow__slide"
            initial={canAnimate ? heroPreState : false}
            animate={showFinalState ? heroFinalState : heroPreState}
            exit={canAnimate ? { opacity: 0.32, scale: 0.97, filter: "blur(2px)" } : { opacity: 0 }}
            transition={{ duration: canAnimate ? 1.15 : 0.15, ease: [0.76, 0, 0.24, 1] }}
            style={{ "--hero-bg-a": activeSlide.theme.bgA, "--hero-bg-b": activeSlide.theme.bgB } as CSSProperties}
          >
            <motion.div className="hero-slideshow__image-layer" style={{ x: parallaxX, y: parallaxY }}>
              <ImageReveal
                src={activeSlide.imageSrc}
                alt={activeSlide.imageAlt}
                fill
                sizes="100vw"
                priority={activeIndex === 0}
                revealOnView={false}
                wrapperClassName="hero-slideshow__image-reveal"
                imageClassName="hero-slideshow__image"
              />
            </motion.div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="hero-slideshow__overlay">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${activeSlide.id}`}
            className="hero-slideshow__text-block"
            initial={canAnimate ? textPreState : false}
            animate={showFinalState ? textFinalState : textPreState}
            exit={canAnimate ? { opacity: 0, y: -18 } : { opacity: 0 }}
            transition={{ duration: canAnimate ? 0.7 : 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="hero-slideshow__status">
              <MotionWords text={activeSlide.status} delay={0.1} duration={0.55} canAnimate={canAnimate} />
            </p>
            <h1 className="hero-slideshow__title">
              <MotionWords text={activeSlide.title} delay={0.16} duration={0.7} canAnimate={canAnimate} />
            </h1>
            <p className="hero-slideshow__subtitle">
              <MotionWords text={activeSlide.subtitle} delay={0.24} duration={0.56} canAnimate={canAnimate} />
            </p>
            <button className="hero-slideshow__cta" type="button" onClick={() => onNavigate(activeSlide.ctaHref)}>
              {activeSlide.cta}
            </button>
          </motion.div>
        </AnimatePresence>

        <div className="hero-slideshow__meta">
          <p className="hero-slideshow__stamp">
            <span>{stamp.month}</span>
            <span>&copy;{stamp.year}</span>
          </p>
          <p>{activeSlide.detailA}</p>
          <p>{activeSlide.detailB}</p>
          <span>{slideLabel}</span>
        </div>
      </div>

      <div className="hero-slideshow__footer">
        <div className="hero-slideshow__slide-meter">
          <span>{slideLabel}</span>
          <div className="hero-slideshow__progress-track">
            <motion.div
              key={`progress-${activeSlide.id}-${ready}`}
              className="hero-slideshow__progress-fill"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: ready && canAnimate ? 1 : 0 }}
              transition={{
                duration: canAnimate ? slideDurationMs / 1000 : 0.01,
                ease: "linear"
              }}
            />
          </div>
        </div>

        <div className="hero-slideshow__controls" role="tablist" aria-label="Hero slides">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => goTo(index)}
            >
              <strong>{slide.title}</strong>
              <small>{slide.subtitle.split("·")[0]?.trim() ?? slide.status}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
