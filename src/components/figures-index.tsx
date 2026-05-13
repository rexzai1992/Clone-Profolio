"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent
} from "react";
import { SITE_CONFIG, type FigureItem } from "@/data/site-config";
import { useMotion } from "@/context/motion-context";

type FigureMode = "grid" | "index";

interface DragState {
  isDown: boolean;
  startX: number;
  offset: number;
}

const FIGURE_GROUPS: FigureItem["group"][] = ["Pre-Order", "Released products"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function wrapValue(min: number, max: number, value: number) {
  const range = max - min;
  if (range === 0) {
    return min;
  }

  return ((((value - min) % range) + range) % range) + min;
}

function getFigureTextColor(figure: FigureItem | undefined, isHovering: boolean, mode: FigureMode) {
  if (mode === "index" || !isHovering || !figure) {
    return "black";
  }

  return figure.whiteText ? "white" : "black";
}

export function FiguresIndex() {
  const { uiState, isReducedMotion, tokens } = useMotion();
  const railRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imageInnerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragStateRef = useRef<DragState>({ isDown: false, startX: 0, offset: 0 });
  const hasDraggedRef = useRef(false);
  const autoPauseUntilRef = useRef(0);
  const animationRafRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const revealReadyRef = useRef(false);
  const initialFigureId = SITE_CONFIG.figures[0]?.id ?? "";
  const activeFigureIdRef = useRef(initialFigureId);
  const [mode, setMode] = useState<FigureMode>("grid");
  const [activeFigureId, setActiveFigureId] = useState(initialFigureId);
  const [isHoveringFigure, setIsHoveringFigure] = useState(false);
  const [isSectionActive, setIsSectionActive] = useState(false);
  const [hasRailInteraction, setHasRailInteraction] = useState(false);

  const activeFigure = useMemo(
    () => SITE_CONFIG.figures.find((figure) => figure.id === activeFigureId) ?? SITE_CONFIG.figures[0],
    [activeFigureId]
  );

  const figuresByGroup = useMemo(
    () =>
      FIGURE_GROUPS.map((group) => ({
        group,
        figures: SITE_CONFIG.figures.filter((figure) => figure.group === group)
      })).filter((group) => group.figures.length > 0),
    []
  );

  const isRailEngaged = mode === "grid" && (isHoveringFigure || hasRailInteraction);
  const figureCharacter = isRailEngaged && activeFigure ? activeFigure.color : "#ffffff";
  const figureText = getFigureTextColor(activeFigure, isRailEngaged, mode);

  const setActiveFigure = useCallback((figureId: string) => {
    if (activeFigureIdRef.current === figureId) {
      return;
    }

    activeFigureIdRef.current = figureId;
    setActiveFigureId(figureId);
  }, []);

  const engageRail = useCallback(() => {
    setHasRailInteraction(true);
  }, []);

  const getNormalizedWheelDelta = useCallback(
    (deltaX: number, deltaY: number, deltaMode: number) => {
      const rawDelta = deltaY + deltaX;
      let deltaPx = rawDelta;

      if (deltaMode === 1) {
        deltaPx *= tokens.figures.wheelLineStepPx;
      } else if (deltaMode === 2) {
        deltaPx *= window.innerHeight;
      }

      return clamp(deltaPx, -tokens.figures.wheelClampPx, tokens.figures.wheelClampPx);
    },
    [tokens.figures.wheelClampPx, tokens.figures.wheelLineStepPx]
  );

  const pauseAutoSlide = useCallback((durationMs = 2200) => {
    autoPauseUntilRef.current = performance.now() + durationMs;
  }, []);

  const stopOffsetAnimation = useCallback(() => {
    if (animationRafRef.current !== null) {
      window.cancelAnimationFrame(animationRafRef.current);
      animationRafRef.current = null;
    }
  }, []);

  const syncFigurePositions = useCallback(() => {
    const rail = railRef.current;
    const firstItem = itemRefs.current[0];
    if (!rail || !firstItem || mode !== "grid") {
      return;
    }

    const width = firstItem.getBoundingClientRect().width;
    const windowWidth = window.innerWidth;
    const totalWidth = width * SITE_CONFIG.figures.length;
    const innerCalc = width + windowWidth;
    const innerTravel = (windowWidth / 1920) * -80;

    if (!width || !totalWidth) {
      return;
    }

    const placements = itemRefs.current.map((item, index) => {
      if (!item) {
        return null;
      }

      const x = wrapValue(-windowWidth, totalWidth - windowWidth, width * index + offsetRef.current);
      const innerX = ((x + width) / innerCalc - 0.5) * innerTravel;
      const isVisible = x >= width * -1.1 && x <= windowWidth * 1.1;
      const centerDistance = Math.abs(x + width / 2 - windowWidth / 2);

      return { centerDistance, index, isVisible, x, innerX };
    });

    const closest = placements.reduce<{ centerDistance: number; index: number } | null>((current, placement) => {
      if (!placement?.isVisible) {
        return current;
      }

      if (!current || placement.centerDistance < current.centerDistance) {
        return { centerDistance: placement.centerDistance, index: placement.index };
      }

      return current;
    }, null);

    placements.forEach((placement) => {
      if (!placement) {
        return;
      }

      const item = itemRefs.current[placement.index];
      const imageInner = imageInnerRefs.current[placement.index];
      if (!item) {
        return;
      }

      item.style.transform = `translate3d(${placement.x}px, 0, 0)`;
      item.classList.toggle("is-active", revealReadyRef.current && placement.isVisible);
      item.classList.toggle("is-centered", revealReadyRef.current && closest?.index === placement.index);

      if (imageInner) {
        imageInner.style.transform = `translate3d(${placement.innerX}px, 0, 0)`;
      }
    });

    const centeredFigure = closest ? SITE_CONFIG.figures[closest.index] : null;
    if (revealReadyRef.current && centeredFigure) {
      setActiveFigure(centeredFigure.id);
    }
  }, [mode, setActiveFigure]);

  const moveRailBy = useCallback(
    (distance: number) => {
      offsetRef.current += distance;
      targetOffsetRef.current = offsetRef.current;
      syncFigurePositions();
    },
    [syncFigurePositions]
  );

  const animateRailTo = useCallback(
    (targetOffset: number, durationMs = 1500) => {
      stopOffsetAnimation();
      targetOffsetRef.current = targetOffset;

      const startOffset = offsetRef.current;
      const distance = targetOffset - startOffset;
      if (Math.abs(distance) < 0.01 || isReducedMotion) {
        offsetRef.current = targetOffset;
        syncFigurePositions();
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - progress, 3);
        offsetRef.current = startOffset + distance * eased;
        syncFigurePositions();

        if (progress < 1) {
          animationRafRef.current = window.requestAnimationFrame(tick);
          return;
        }

        offsetRef.current = targetOffset;
        animationRafRef.current = null;
        syncFigurePositions();
      };

      animationRafRef.current = window.requestAnimationFrame(tick);
    },
    [isReducedMotion, stopOffsetAnimation, syncFigurePositions]
  );

  const animateRailBy = useCallback(
    (distance: number, durationMs = 1500) => {
      animateRailTo(targetOffsetRef.current + distance, durationMs);
    },
    [animateRailTo]
  );

  const runRevealSequence = useCallback(() => {
    revealReadyRef.current = false;
    itemRefs.current.forEach((item) => item?.classList.remove("is-active"));
    syncFigurePositions();

    const timers: number[] = [];
    const firstItem = itemRefs.current[0];
    const width = firstItem?.getBoundingClientRect().width ?? 0;
    const windowWidth = window.innerWidth;

    const visibleItems = itemRefs.current
      .map((item) => {
        if (!item || !width) {
          return null;
        }

        const matrix = new DOMMatrixReadOnly(window.getComputedStyle(item).transform);
        return { item, x: matrix.m41 };
      })
      .filter((entry): entry is { item: HTMLDivElement; x: number } =>
        Boolean(entry && entry.x >= width * -1.1 && entry.x <= windowWidth * 1.1)
      )
      .sort((a, b) => a.x - b.x);

    visibleItems.forEach(({ item }, index) => {
      timers.push(window.setTimeout(() => item.classList.add("is-active"), 100 * (index + 1)));
    });

    timers.push(
      window.setTimeout(() => {
        revealReadyRef.current = true;
        syncFigurePositions();
      }, 720)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [syncFigurePositions]);

  useLayoutEffect(() => {
    if (mode !== "grid") {
      return;
    }

    const firstItem = itemRefs.current[0];
    if (!firstItem) {
      return;
    }

    let raf = 0;
    let clearReveal: (() => void) | undefined;

    const setup = () => {
      window.cancelAnimationFrame(raf);
      clearReveal?.();
      stopOffsetAnimation();

      const width = firstItem.getBoundingClientRect().width;
      offsetRef.current = window.innerWidth / 2 - width / 2 - 100;
      targetOffsetRef.current = offsetRef.current;
      syncFigurePositions();

      const start = performance.now();
      const animateIntro = (now: number) => {
        const progress = Math.min(1, (now - start) / 2000);
        const eased = 1 - Math.pow(1 - progress, 2);
        offsetRef.current = window.innerWidth / 2 - width / 2 - 100 + 100 * eased;
        targetOffsetRef.current = offsetRef.current;
        syncFigurePositions();

        if (progress < 1) {
          raf = window.requestAnimationFrame(animateIntro);
        }
      };

      raf = window.requestAnimationFrame(animateIntro);
      clearReveal = runRevealSequence();
    };

    setup();

    window.addEventListener("resize", setup);
    return () => {
      window.cancelAnimationFrame(raf);
      stopOffsetAnimation();
      clearReveal?.();
      window.removeEventListener("resize", setup);
    };
  }, [mode, runRevealSequence, stopOffsetAnimation, syncFigurePositions]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionActive(Boolean(entry?.isIntersecting && entry.intersectionRatio > 0.28));
      },
      { threshold: [0, 0.28, 0.55] }
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isSectionActive) {
      document.body.removeAttribute("data-kaynx-color");
      return;
    }

    document.body.setAttribute("data-kaynx-color", figureText);
    return () => {
      document.body.removeAttribute("data-kaynx-color");
    };
  }, [figureText, isSectionActive]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-kaynx-noclock", mode === "index");

    return () => {
      document.documentElement.classList.remove("is-kaynx-noclock");
    };
  }, [mode]);

  useEffect(() => {
    if (isReducedMotion || mode !== "grid" || uiState.isNavOpen) {
      return;
    }

    let raf = 0;
    let previousTime = performance.now();
    const tick = (currentTime: number) => {
      const elapsedSeconds = Math.min(64, currentTime - previousTime) / 1000;
      previousTime = currentTime;

      if (currentTime >= autoPauseUntilRef.current) {
        moveRailBy(-tokens.figures.autoDriftPxPerSec * elapsedSeconds);
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [isReducedMotion, mode, moveRailBy, tokens.figures.autoDriftPxPerSec, uiState.isNavOpen]);

  const processWheelDelta = useCallback(
    (deltaPx: number) => {
      if (mode !== "grid" || Math.abs(deltaPx) < 0.5) {
        return false;
      }

      engageRail();
      pauseAutoSlide(tokens.figures.interactionPauseMs);
      animateRailBy(-deltaPx * tokens.figures.wheelTravelMultiplier, 1300);
      return true;
    },
    [
      animateRailBy,
      engageRail,
      mode,
      pauseAutoSlide,
      tokens.figures.interactionPauseMs,
      tokens.figures.wheelTravelMultiplier
    ]
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const nativeWheelHandler = (event: globalThis.WheelEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !section.contains(target)) {
        return;
      }

      const deltaPx = getNormalizedWheelDelta(event.deltaX, event.deltaY, event.deltaMode);
      if (!processWheelDelta(deltaPx)) {
        return;
      }

      event.preventDefault();
    };

    section.addEventListener("wheel", nativeWheelHandler, { passive: false });
    return () => {
      section.removeEventListener("wheel", nativeWheelHandler);
    };
  }, [getNormalizedWheelDelta, processWheelDelta]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (mode !== "grid" || !railRef.current) {
        return;
      }

      engageRail();
      pauseAutoSlide(tokens.figures.interactionPauseMs);
      stopOffsetAnimation();
      dragStateRef.current = {
        isDown: true,
        startX: event.clientX,
        offset: offsetRef.current
      };
      hasDraggedRef.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.add("is-drag");
    },
    [engageRail, mode, pauseAutoSlide, stopOffsetAnimation, tokens.figures.interactionPauseMs]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rail = railRef.current;
      const dragState = dragStateRef.current;
      if (!rail || !dragState.isDown || mode !== "grid") {
        return;
      }

      const distance = event.clientX - dragState.startX;
      if (Math.abs(distance) > 4) {
        hasDraggedRef.current = true;
      }

      engageRail();
      pauseAutoSlide(tokens.figures.interactionPauseMs);
      offsetRef.current = dragState.offset + distance * tokens.figures.dragTravelMultiplier;
      targetOffsetRef.current = offsetRef.current;
      syncFigurePositions();
    },
    [
      engageRail,
      mode,
      pauseAutoSlide,
      syncFigurePositions,
      tokens.figures.dragTravelMultiplier,
      tokens.figures.interactionPauseMs
    ]
  );

  const stopDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    dragStateRef.current.isDown = false;
    pauseAutoSlide(tokens.figures.interactionPauseMs);
    event.currentTarget.classList.remove("is-drag");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, [pauseAutoSlide, tokens.figures.interactionPauseMs]);

  const handleFigureEnter = useCallback(
    (figure: FigureItem) => {
      setActiveFigure(figure.id);
      setIsHoveringFigure(true);
    },
    [setActiveFigure]
  );

  const handleFigureLeave = useCallback(() => {
    setIsHoveringFigure(false);
  }, []);

  const handleFigureClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    if (hasDraggedRef.current) {
      event.preventDefault();
      hasDraggedRef.current = false;
      return;
    }

    event.preventDefault();
  }, []);

  return (
    <section
      id="figures"
      ref={sectionRef}
      className="figures-index"
      data-nav={mode}
      data-active={isRailEngaged ? "true" : "false"}
      data-text={figureText}
      aria-label="Scale figures reference gallery"
      style={
        {
          "--figure-character": figureCharacter,
          "--figure-ink": figureText === "white" ? "#ffffff" : "#000000"
        } as CSSProperties
      }
    >
      <ul className="figures-index__nav" aria-label="Figure view mode">
        {(["grid", "index"] as FigureMode[]).map((viewMode) => (
          <li key={viewMode}>
            <button
              type="button"
              className={mode === viewMode ? "is-active" : ""}
              onClick={() => {
                setMode(viewMode);
                setIsHoveringFigure(false);
                setHasRailInteraction(false);
              }}
            >
              {viewMode === "grid" ? "Grid" : "Index"}
            </button>
          </li>
        ))}
      </ul>

      <div className="figures-index__list">
        <div
          ref={railRef}
          className="figures-index__grid-rail"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onPointerLeave={stopDrag}
        >
          {SITE_CONFIG.figures.map((figure, index) => (
            <div
              className="figures-index__grid-item"
              key={figure.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
            >
              <a
                href={figure.href}
                className="figures-index__link"
                onClick={handleFigureClick}
                onMouseEnter={() => handleFigureEnter(figure)}
                onMouseLeave={handleFigureLeave}
                onFocus={() => handleFigureEnter(figure)}
                onBlur={handleFigureLeave}
                style={{ "--figure-card-color": figure.color } as CSSProperties}
                data-white={figure.whiteText ? "true" : "false"}
              >
                <div className="figures-index__image">
                  <div className="figures-index__image-wrap">
                    <div
                      className="figures-index__image-inner"
                      ref={(node) => {
                        imageInnerRefs.current[index] = node;
                      }}
                    >
                      <img src={figure.imageSrc} data-thumb-src={figure.thumbSrc} alt="" loading="lazy" draggable={false} />
                    </div>
                  </div>
                </div>
                <div className="figures-index__main">
                  <p>{figure.series}</p>
                  <h3>{figure.name}</h3>
                  <span>{figure.caption}</span>
                </div>
              </a>
            </div>
          ))}
        </div>

        <div className="figures-index__index">
          {figuresByGroup.map(({ group, figures }) => (
            <div className="figures-index__index-wrap" key={group}>
              <h2>{group}</h2>
              <div className="figures-index__index-info" aria-live="polite">
                <span>{activeFigure?.name}</span>
                <span>{activeFigure?.caption}</span>
              </div>
              <div className="figures-index__index-grid">
                {figures.map((figure) => (
                  <a
                    href={figure.href}
                    className="figures-index__index-link"
                    key={figure.id}
                    onClick={handleFigureClick}
                    onMouseEnter={() => handleFigureEnter(figure)}
                    onFocus={() => handleFigureEnter(figure)}
                  >
                    <img src={figure.thumbSrc} alt={`${figure.name} reference placeholder`} loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          ))}
          <button className="figures-index__totop" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            To Top
          </button>
        </div>
      </div>
    </section>
  );
}
