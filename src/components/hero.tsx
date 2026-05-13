"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SITE_CONFIG, type HeroSlide } from "@/data/site-config";
import { useMotion } from "@/context/motion-context";

interface HeroProps {
  onNavigate: (href: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const {
    uiState,
    isReducedMotion,
    heroPreset,
    setActiveHeroIndex,
    triggerTransition
  } = useMotion();

  const { heroSlides } = SITE_CONFIG;
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [lockSwitch, setLockSwitch] = useState(false);
  const lockTimerRef = useRef<number | null>(null);
  const prevClearTimerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const wheelResetTimerRef = useRef<number | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const wheelAccumulatorRef = useRef(0);
  const wheelDirectionRef = useRef<-1 | 0 | 1>(0);

  const activeSlide = heroSlides[uiState.activeHeroIndex] as HeroSlide;

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current !== null) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const clearLockTimer = useCallback(() => {
    if (lockTimerRef.current !== null) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  }, []);

  const clearPrevTimer = useCallback(() => {
    if (prevClearTimerRef.current !== null) {
      window.clearTimeout(prevClearTimerRef.current);
      prevClearTimerRef.current = null;
    }
  }, []);

  const clearWheelResetTimer = useCallback(() => {
    if (wheelResetTimerRef.current !== null) {
      window.clearTimeout(wheelResetTimerRef.current);
      wheelResetTimerRef.current = null;
    }
  }, []);

  const resetWheelAccumulator = useCallback(() => {
    wheelAccumulatorRef.current = 0;
    wheelDirectionRef.current = 0;
  }, []);

  const nextIndex = useMemo(
    () => (uiState.activeHeroIndex + 1) % heroSlides.length,
    [uiState.activeHeroIndex, heroSlides.length]
  );

  const previousIndex = useMemo(
    () => (uiState.activeHeroIndex - 1 + heroSlides.length) % heroSlides.length,
    [uiState.activeHeroIndex, heroSlides.length]
  );

  const activateSlide = useCallback(
    (index: number) => {
      if (lockSwitch || index === uiState.activeHeroIndex) {
        return;
      }

      const max = heroSlides.length;
      const boundedIndex = ((index % max) + max) % max;
      setPrevIndex(uiState.activeHeroIndex);
      setActiveHeroIndex(boundedIndex);
      triggerTransition(heroPreset.switchLockMs);
      clearPrevTimer();
      prevClearTimerRef.current = window.setTimeout(() => {
        setPrevIndex(null);
        prevClearTimerRef.current = null;
      }, 1000);

      if (!isReducedMotion) {
        setLockSwitch(true);
        clearLockTimer();
        lockTimerRef.current = window.setTimeout(() => {
          setLockSwitch(false);
          lockTimerRef.current = null;
        }, heroPreset.switchLockMs);
      }
    },
    [
      lockSwitch,
      uiState.activeHeroIndex,
      heroSlides.length,
      setActiveHeroIndex,
      triggerTransition,
      heroPreset.switchLockMs,
      isReducedMotion,
      clearLockTimer,
      clearPrevTimer
    ]
  );

  useEffect(() => {
    if (uiState.isLoading || uiState.isNavOpen || isReducedMotion) {
      clearAutoTimer();
      return;
    }

    clearAutoTimer();
    autoTimerRef.current = window.setTimeout(() => {
      activateSlide(nextIndex);
    }, heroPreset.autoCycleMs);

    return clearAutoTimer;
  }, [
    uiState.activeHeroIndex,
    uiState.isLoading,
    uiState.isNavOpen,
    nextIndex,
    activateSlide,
    heroPreset.autoCycleMs,
    isReducedMotion,
    clearAutoTimer
  ]);

  useEffect(() => {
    return () => {
      clearAutoTimer();
      clearLockTimer();
      clearPrevTimer();
      clearWheelResetTimer();
    };
  }, [clearAutoTimer, clearLockTimer, clearPrevTimer, clearWheelResetTimer]);

  const getNormalizedWheelDelta = useCallback(
    (deltaX: number, deltaY: number, deltaMode: number) => {
      let deltaPx = deltaY + deltaX;

      if (deltaMode === 1) {
        deltaPx *= heroPreset.wheelLineStepPx;
      } else if (deltaMode === 2) {
        deltaPx *= window.innerHeight;
      }

      return Math.max(-heroPreset.wheelClampPx, Math.min(heroPreset.wheelClampPx, deltaPx));
    },
    [heroPreset.wheelClampPx, heroPreset.wheelLineStepPx]
  );

  const processWheelDelta = useCallback(
    (deltaPx: number) => {
      if (uiState.isLoading || uiState.isNavOpen || lockSwitch) {
        return false;
      }

      if (Math.abs(deltaPx) < 1) {
        return false;
      }

      const direction = deltaPx > 0 ? 1 : -1;
      const magnitude = Math.abs(deltaPx);
      if (wheelDirectionRef.current !== direction) {
        wheelDirectionRef.current = direction;
        wheelAccumulatorRef.current = 0;
      }

      wheelAccumulatorRef.current += magnitude;

      if (magnitude >= heroPreset.wheelImmediatePx) {
        resetWheelAccumulator();
        activateSlide(direction > 0 ? nextIndex : previousIndex);
        return true;
      }

      clearWheelResetTimer();
      wheelResetTimerRef.current = window.setTimeout(() => {
        resetWheelAccumulator();
        wheelResetTimerRef.current = null;
      }, heroPreset.wheelResetMs);

      if (wheelAccumulatorRef.current < heroPreset.wheelTriggerPx) {
        return true;
      }

      resetWheelAccumulator();
      activateSlide(direction > 0 ? nextIndex : previousIndex);
      return true;
    },
    [
      activateSlide,
      clearWheelResetTimer,
      heroPreset.wheelResetMs,
      heroPreset.wheelImmediatePx,
      heroPreset.wheelTriggerPx,
      lockSwitch,
      nextIndex,
      previousIndex,
      resetWheelAccumulator,
      uiState.isLoading,
      uiState.isNavOpen
    ]
  );

  useEffect(() => {
    const heroNode = heroRef.current;
    if (!heroNode) {
      return;
    }

    const nativeHandler = (event: globalThis.WheelEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !heroNode.contains(target)) {
        return;
      }

      const deltaPx = getNormalizedWheelDelta(event.deltaX, event.deltaY, event.deltaMode);
      if (!processWheelDelta(deltaPx)) {
        return;
      }

      event.preventDefault();
    };

    heroNode.addEventListener("wheel", nativeHandler, { passive: false });
    return () => {
      heroNode.removeEventListener("wheel", nativeHandler);
    };
  }, [getNormalizedWheelDelta, processWheelDelta]);

  return (
    <section id="top" ref={heroRef} className="hero" aria-label="Hero showcase">
      <div className="hero__slides" style={{ "--hero-speed": `${SITE_CONFIG.heroSpeedSeconds}s` } as CSSProperties}>
        {heroSlides.map((slide, index) => {
          const isActive = index === uiState.activeHeroIndex;
          const isPrev = prevIndex === index;

          return (
            <article
              key={slide.id}
              className={`hero__slide ${isActive ? "is-active" : ""} ${isPrev ? "is-prev" : ""}`}
              style={{
                "--slide-a": slide.theme.bgA,
                "--slide-b": slide.theme.bgB,
                "--slide-accent": slide.theme.accent
              } as CSSProperties}
            >
              <div className="hero__image-wrap" aria-hidden="true">
                <picture>
                  {slide.imageMobileSrc ? <source srcSet={slide.imageMobileSrc} media="(max-width: 767px)" /> : null}
                  <img className="hero__image" src={slide.imageSrc} alt="" />
                </picture>
                <div className="hero__image-orb" />
              </div>

              <div className="hero__content">
                <p className="hero__status">{slide.status}</p>
                <h1 className="hero__title">{slide.title}</h1>
                <p className="hero__subtitle">{slide.subtitle}</p>
                <button className="hero__cta" type="button" onClick={() => onNavigate(slide.ctaHref)}>
                  {slide.cta}
                </button>
              </div>

              <ul className="hero__credit">
                <li>{slide.detailA}</li>
                <li>{slide.detailB}</li>
              </ul>
            </article>
          );
        })}
      </div>

      <div className="hero__controls" role="tablist" aria-label="Hero slides">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            className={`hero__control ${index === uiState.activeHeroIndex ? "is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={index === uiState.activeHeroIndex}
            onClick={() => activateSlide(index)}
          >
            <strong>{slide.title}</strong>
            <span>{slide.subtitle}</span>
          </button>
        ))}
      </div>

      <button className="hero__scroll" type="button" onClick={() => onNavigate(activeSlide.ctaHref)}>
        Scroll
      </button>

      <div className="hero__stamp">
        <strong>{activeSlide.title}</strong>
        <span>{activeSlide.subtitle}</span>
      </div>
    </section>
  );
}
