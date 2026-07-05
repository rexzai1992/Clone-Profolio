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
import { usePathname } from "next/navigation";
import type { FigureItem } from "@/data/site-config";
import { useMotion } from "@/context/motion-context";
import { useSiteContent } from "@/context/site-content-context";

type FigureMode = "grid" | "index";

interface DragState {
  isDown: boolean;
  startX: number;
  offset: number;
}

interface LenisLike {
  scrollTo: (target: number, options?: { duration?: number; immediate?: boolean }) => void;
}

const FIGURE_GROUPS: FigureItem["group"][] = ["Pre-Order", "Released products"];
const HOVER_LEAVE_GRACE_MS = 1200;
const FIGURE_SWITCH_GRACE_MS = 120;
const CARD_NAV_TRANSITION_MS = 450;
const FIGURE_READY_TIMEOUT_MS = 1200;
const FIGURE_READY_COUNT = 4;
const FIGURE_EAGER_COUNT = 6;

interface FiguresIndexProps {
  onNavigate?: (href: string) => void;
}

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

function normalizePath(path: string | null) {
  if (!path) {
    return "/";
  }
  if (path === "/") {
    return "/";
  }
  return path.replace(/\/+$/, "");
}

function getFigureTextColor(figure: FigureItem | undefined, isHovering: boolean, mode: FigureMode) {
  if (mode === "index" || !isHovering || !figure) {
    return "black";
  }

  return figure.whiteText ? "white" : "black";
}

export function FiguresIndex({ onNavigate }: FiguresIndexProps) {
  const { site } = useSiteContent();
  const figures = site.figures;
  const { uiState, isReducedMotion, revealRouteOverlay, tokens } = useMotion();
  const pathname = usePathname();
  const railRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imageInnerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragStateRef = useRef<DragState>({ isDown: false, startX: 0, offset: 0 });
  const hasDraggedRef = useRef(false);
  const autoPauseUntilRef = useRef(0);
  const animationRafRef = useRef<number | null>(null);
  const hoverLeaveTimerRef = useRef<number | null>(null);
  const figureSwitchLeaveTimerRef = useRef<number | null>(null);
  const cardNavigateTimerRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const revealReadyRef = useRef(false);
  const loadedFigureIdsRef = useRef<Record<string, true>>({});
  const initialFigureId = figures[0]?.id ?? "";
  const activeFigureIdRef = useRef(initialFigureId);
  const isHoveringFigureRef = useRef(false);
  const [mode, setMode] = useState<FigureMode>("grid");
  const [activeFigureId, setActiveFigureId] = useState(initialFigureId);
  const [isHoveringFigure, setIsHoveringFigure] = useState(false);
  const [isSectionActive, setIsSectionActive] = useState(false);
  const [hasRailInteraction, setHasRailInteraction] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isCardTransitioning, setIsCardTransitioning] = useState(false);
  const [leavingFigureId, setLeavingFigureId] = useState<string | null>(null);
  const [loadedFigureIds, setLoadedFigureIds] = useState<Record<string, true>>({});

  const activeFigure = useMemo(
    () => figures.find((figure) => figure.id === activeFigureId) ?? figures[0],
    [activeFigureId, figures]
  );

  const figuresByGroup = useMemo(
    () =>
      FIGURE_GROUPS.map((group) => ({
        group,
        figures: figures.filter((figure) => figure.group === group)
      })).filter((group) => group.figures.length > 0),
    [figures]
  );

  const isColorEngaged = mode === "grid" && isHoveringFigure;
  const isCardHighlightEngaged = mode === "grid" && isHoveringFigure;
  const figureCharacter = isColorEngaged && activeFigure ? activeFigure.color : "#ffffff";
  const figureText = getFigureTextColor(activeFigure, isColorEngaged, mode);
  const firstFigureIds = useMemo(() => figures.slice(0, FIGURE_READY_COUNT).map((figure) => figure.id), [figures]);
  const isIncomingCoveredRoute =
    uiState.routeOverlayActive &&
    normalizePath(uiState.routeOverlayTo) === normalizePath(pathname) &&
    (uiState.routeOverlayPhase === "covering" || uiState.routeOverlayPhase === "covered");
  const isIncomingFigureOverlayRoute =
    uiState.routeOverlayActive &&
    normalizePath(uiState.routeOverlayTo) === normalizePath(pathname) &&
    /^\/figures?(?:\/|$)/.test(normalizePath(pathname));

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

  const setFigureHovering = useCallback((isHovering: boolean) => {
    isHoveringFigureRef.current = isHovering;
    setIsHoveringFigure((current) => (current === isHovering ? current : isHovering));
  }, []);

  const markFigureImageLoaded = useCallback((figureId: string) => {
    setLoadedFigureIds((current) => {
      if (current[figureId]) {
        return current;
      }
      return { ...current, [figureId]: true };
    });
  }, []);

  useEffect(() => {
    loadedFigureIdsRef.current = loadedFigureIds;
  }, [loadedFigureIds]);

  useEffect(() => {
    if (figures.some((figure) => figure.id === activeFigureId)) {
      return;
    }

    setActiveFigure(figures[0]?.id ?? "");
  }, [activeFigureId, figures, setActiveFigure]);

  useEffect(() => {
    firstFigureIds.forEach((figureId) => {
      const figure = figures.find((item) => item.id === figureId);
      if (!figure) {
        return;
      }
      const img = new window.Image();
      img.decoding = "async";
      img.src = figure.imageSrc;
    });
  }, [figures, firstFigureIds]);

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

  const clearHoverLeaveTimer = useCallback(() => {
    if (hoverLeaveTimerRef.current !== null) {
      window.clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
  }, []);

  const clearFigureSwitchLeaveTimer = useCallback(() => {
    if (figureSwitchLeaveTimerRef.current !== null) {
      window.clearTimeout(figureSwitchLeaveTimerRef.current);
      figureSwitchLeaveTimerRef.current = null;
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
    const totalWidth = width * figures.length;
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

      // Keep a deterministic base left slot in CSS and move from that slot with transform.
      // This prevents temporary overlap at x=0 if JS transform updates are delayed.
      item.style.transform = `translate3d(${placement.x - width * placement.index}px, 0, 0)`;
      item.classList.toggle("is-active", revealReadyRef.current && placement.isVisible);
      item.classList.toggle("is-centered", revealReadyRef.current && closest?.index === placement.index);

      if (imageInner) {
        imageInner.style.transform = `translate3d(${placement.innerX}px, 0, 0)`;
      }
    });

    const centeredFigure = closest ? figures[closest.index] : null;
    // Keep hovered card as the source of truth for active color/text while hovering.
    if (revealReadyRef.current && centeredFigure && !isHoveringFigureRef.current) {
      setActiveFigure(centeredFigure.id);
    }
  }, [figures, mode, setActiveFigure]);

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
      const row = Math.floor(index / 4);
      const column = index % 4;
      const delayMs = 180 + row * 280 + column * 70;
      item.style.setProperty("--card-delay", `${delayMs}ms`);
      item.style.setProperty("--image-delay", `${delayMs + 100}ms`);
      item.style.setProperty("--title-delay", `${delayMs + 150}ms`);
      timers.push(window.setTimeout(() => item.classList.add("is-active"), delayMs));
    });

    const longestDelay = Math.max(...visibleItems.map((_, index) => 180 + Math.floor(index / 4) * 280 + (index % 4) * 70), 0);
    timers.push(
      window.setTimeout(() => {
        revealReadyRef.current = true;
        setHasRailInteraction(true);
        syncFigurePositions();
      }, longestDelay + 420)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [syncFigurePositions]);

  useLayoutEffect(() => {
    if (mode !== "grid" || isIncomingCoveredRoute) {
      return;
    }

    let introRaf = 0;
    let bootstrapRaf = 0;
    let clearReveal: (() => void) | undefined;

    const setup = () => {
      window.cancelAnimationFrame(introRaf);
      window.cancelAnimationFrame(bootstrapRaf);
      clearReveal?.();
      stopOffsetAnimation();
      autoPauseUntilRef.current = 0;

      const firstItem = itemRefs.current[0];
      if (!firstItem) {
        bootstrapRaf = window.requestAnimationFrame(setup);
        return;
      }

      const width = firstItem.getBoundingClientRect().width;
      if (!width) {
        bootstrapRaf = window.requestAnimationFrame(setup);
        return;
      }

      const settledOffset = window.innerWidth / 2 - width / 2;
      const introOffset = settledOffset + 160;
      offsetRef.current = introOffset;
      targetOffsetRef.current = introOffset;
      syncFigurePositions();

      const start = performance.now();
      const animateIntro = (now: number) => {
        const progress = Math.min(1, (now - start) / 1850);
        const eased = 1 - Math.pow(1 - progress, 2);
        offsetRef.current = introOffset + (settledOffset - introOffset) * eased;
        targetOffsetRef.current = offsetRef.current;
        syncFigurePositions();

        if (progress < 1) {
          introRaf = window.requestAnimationFrame(animateIntro);
        }
      };

      introRaf = window.requestAnimationFrame(animateIntro);
      clearReveal = runRevealSequence();
    };

    setup();

    window.addEventListener("resize", setup);
    return () => {
      window.cancelAnimationFrame(introRaf);
      window.cancelAnimationFrame(bootstrapRaf);
      stopOffsetAnimation();
      clearReveal?.();
      window.removeEventListener("resize", setup);
    };
  }, [isIncomingCoveredRoute, mode, runRevealSequence, stopOffsetAnimation, syncFigurePositions]);

  useEffect(() => {
    if (!isIncomingFigureOverlayRoute || uiState.routeOverlayPhase !== "covered") {
      return;
    }

    let raf = 0;
    const start = performance.now();

    const checkReady = () => {
      const firstItems = itemRefs.current.slice(0, FIGURE_READY_COUNT);
      const wrapperEntries = firstItems
        .map((item) => {
          if (!item) {
            return null;
          }
          const wrapper = item.querySelector<HTMLElement>(".figures-index__image-wrap");
          const skeleton = item.querySelector<HTMLElement>(".figures-index__image-skeleton");
          return wrapper ? { item, skeleton, wrapper } : null;
        })
        .filter((entry): entry is { item: HTMLDivElement; skeleton: HTMLElement | null; wrapper: HTMLElement } => Boolean(entry));

      const wrappers = wrapperEntries.map((entry) => entry.wrapper);

      const wrappersVisible =
        wrappers.length === FIGURE_READY_COUNT &&
        wrappers.every((wrapper) => {
          const rect = wrapper.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

      const allPriorityLoaded = firstFigureIds.every((figureId) => Boolean(loadedFigureIdsRef.current[figureId]));
      const timedOut = performance.now() - start >= FIGURE_READY_TIMEOUT_MS;
      const skeletonVisible = wrapperEntries.some((entry) => {
        if (entry.wrapper.dataset.loaded === "true" || !entry.skeleton) {
          return false;
        }
        const style = window.getComputedStyle(entry.skeleton);
        const rect = entry.skeleton.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && Number.parseFloat(style.opacity || "0") > 0.01 && rect.width > 0 && rect.height > 0;
      });

      if ((wrappersVisible && allPriorityLoaded) || (timedOut && wrappersVisible && skeletonVisible)) {
        revealRouteOverlay();
        return;
      }

      raf = window.requestAnimationFrame(checkReady);
    };

    raf = window.requestAnimationFrame(checkReady);
    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [
    firstFigureIds,
    isIncomingFigureOverlayRoute,
    revealRouteOverlay,
    uiState.routeOverlayPhase
  ]);

  useEffect(() => {
    if (hasEntered) {
      return;
    }

    const currentPath = normalizePath(pathname);
    const overlayTargetPath = normalizePath(uiState.routeOverlayTo);
    const isIncomingCoveredRoute = uiState.routeOverlayActive && overlayTargetPath === currentPath;

    if (isIncomingCoveredRoute && (uiState.routeOverlayPhase === "covering" || uiState.routeOverlayPhase === "covered")) {
      return;
    }

    const delayMs = isIncomingCoveredRoute && uiState.routeOverlayPhase === "revealing" ? 0 : 16;
    const timer = window.setTimeout(() => {
      setHasEntered(true);
    }, delayMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [
    hasEntered,
    pathname,
    uiState.routeOverlayActive,
    uiState.routeOverlayPhase,
    uiState.routeOverlayTo
  ]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const revealNodes = Array.from(section.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!revealNodes.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
            return;
          }
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: [0, 0.2, 0.6] }
    );

    revealNodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
    };
  }, [mode]);

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

    document.body.setAttribute("data-kaynx-color", "black");
    return () => {
      document.body.removeAttribute("data-kaynx-color");
    };
  }, [isSectionActive]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-kaynx-noclock", mode === "index");

    return () => {
      document.documentElement.classList.remove("is-kaynx-noclock");
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "grid" || uiState.isNavOpen) {
      return;
    }

    const autoDriftSpeed = isReducedMotion
      ? tokens.figures.autoDriftPxPerSec * 0.72
      : tokens.figures.autoDriftPxPerSec;

    let raf = 0;
    let previousTime = performance.now();
    const tick = (currentTime: number) => {
      const elapsedSeconds = Math.min(64, currentTime - previousTime) / 1000;
      previousTime = currentTime;

      if (currentTime >= autoPauseUntilRef.current && !dragStateRef.current.isDown) {
        moveRailBy(-autoDriftSpeed * elapsedSeconds);
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
      stopOffsetAnimation();
      dragStateRef.current = {
        isDown: true,
        startX: event.clientX,
        offset: offsetRef.current
      };
      hasDraggedRef.current = false;
      event.currentTarget.classList.add("is-drag");
    },
    [engageRail, mode, stopOffsetAnimation]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rail = railRef.current;
      const dragState = dragStateRef.current;
      if (!rail || !dragState.isDown || mode !== "grid") {
        return;
      }

      const distance = event.clientX - dragState.startX;
      if (Math.abs(distance) > 8) {
        hasDraggedRef.current = true;
        pauseAutoSlide(tokens.figures.interactionPauseMs);
      }

      engageRail();
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
    event.currentTarget.classList.remove("is-drag");
  }, []);

  const handleFigureEnter = useCallback(
    (figure: FigureItem) => {
      clearHoverLeaveTimer();
      clearFigureSwitchLeaveTimer();
      setActiveFigure(figure.id);
      setFigureHovering(true);
    },
    [clearFigureSwitchLeaveTimer, clearHoverLeaveTimer, setActiveFigure, setFigureHovering]
  );

  const handleFigureImageLeave = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Element && nextTarget.closest(".figures-index__image")) {
        return;
      }

      clearFigureSwitchLeaveTimer();
      figureSwitchLeaveTimerRef.current = window.setTimeout(() => {
        setFigureHovering(false);
        figureSwitchLeaveTimerRef.current = null;
      }, FIGURE_SWITCH_GRACE_MS);
    },
    [clearFigureSwitchLeaveTimer, setFigureHovering]
  );

  const handleFigureBlur = useCallback(() => {
    clearFigureSwitchLeaveTimer();
    setFigureHovering(false);
  }, [clearFigureSwitchLeaveTimer, setFigureHovering]);

  const handleRailEnter = useCallback(() => {
    clearHoverLeaveTimer();
    clearFigureSwitchLeaveTimer();
  }, [clearFigureSwitchLeaveTimer, clearHoverLeaveTimer]);

  const handleRailLeave = useCallback(() => {
    clearFigureSwitchLeaveTimer();
    setFigureHovering(false);
    clearHoverLeaveTimer();
    hoverLeaveTimerRef.current = window.setTimeout(() => {
      const rail = railRef.current;
      if (!rail || !rail.matches(":hover")) {
        setFigureHovering(false);
      }
      hoverLeaveTimerRef.current = null;
    }, HOVER_LEAVE_GRACE_MS);
  }, [clearFigureSwitchLeaveTimer, clearHoverLeaveTimer, setFigureHovering]);

  useEffect(() => {
    if (mode !== "grid") {
      return;
    }

    const clearHighlightWhenOffPhoto = (event: globalThis.MouseEvent | globalThis.PointerEvent) => {
      if (!isHoveringFigureRef.current) {
        return;
      }

      const target = event.target;
      if (target instanceof Element && target.closest(".figures-index__image")) {
        return;
      }

      clearFigureSwitchLeaveTimer();
      setFigureHovering(false);
    };

    document.addEventListener("pointermove", clearHighlightWhenOffPhoto, true);
    document.addEventListener("mousemove", clearHighlightWhenOffPhoto, true);
    return () => {
      document.removeEventListener("pointermove", clearHighlightWhenOffPhoto, true);
      document.removeEventListener("mousemove", clearHighlightWhenOffPhoto, true);
    };
  }, [clearFigureSwitchLeaveTimer, mode, setFigureHovering]);

  useEffect(() => {
    return () => {
      clearHoverLeaveTimer();
      clearFigureSwitchLeaveTimer();
      if (cardNavigateTimerRef.current !== null) {
        window.clearTimeout(cardNavigateTimerRef.current);
        cardNavigateTimerRef.current = null;
      }
    };
  }, [clearFigureSwitchLeaveTimer, clearHoverLeaveTimer]);

  const handleFigureClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string, figureId: string) => {
      if (hasDraggedRef.current) {
        event.preventDefault();
        hasDraggedRef.current = false;
        return;
      }

      const isModifiedClick =
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0 ||
        event.currentTarget.target === "_blank";
      if (isModifiedClick || typeof onNavigate !== "function") {
        return;
      }

      event.preventDefault();
      if (mode !== "grid") {
        onNavigate(href);
        return;
      }

      if (isCardTransitioning) {
        return;
      }

      clearFigureSwitchLeaveTimer();
      clearHoverLeaveTimer();
      setFigureHovering(false);
      setLeavingFigureId(figureId);
      setIsCardTransitioning(true);

      if (cardNavigateTimerRef.current !== null) {
        window.clearTimeout(cardNavigateTimerRef.current);
      }
      cardNavigateTimerRef.current = window.setTimeout(() => {
        onNavigate(href);
        cardNavigateTimerRef.current = null;
      }, CARD_NAV_TRANSITION_MS);
    },
    [clearFigureSwitchLeaveTimer, clearHoverLeaveTimer, isCardTransitioning, mode, onNavigate, setFigureHovering]
  );

  const handleToTop = useCallback(() => {
    const win = window as Window & { __kaynxLenis?: LenisLike };
    if (win.__kaynxLenis) {
      win.__kaynxLenis.scrollTo(0, { duration: 0.9 });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <section
      id="figures"
      ref={sectionRef}
      className="figures-index"
      data-nav={mode}
      data-entered={hasEntered ? "true" : "false"}
      data-active={isCardHighlightEngaged ? "true" : "false"}
      data-hovering={isColorEngaged ? "true" : "false"}
      data-transitioning={isCardTransitioning ? "true" : "false"}
      data-route-waiting={isIncomingFigureOverlayRoute && uiState.routeOverlayPhase === "covered" ? "true" : "false"}
      data-text={figureText}
      aria-label="Scale figures reference gallery"
      style={
        {
          "--figure-character": figureCharacter,
          "--figure-ink": figureText === "white" ? "#ffffff" : "#000000"
        } as CSSProperties
      }
    >
      <header className="figures-index__heading">
        <p>Collection</p>
        <h1>Scale Figures</h1>
      </header>

      <ul className="figures-index__nav" aria-label="Figure view mode">
        {(["grid", "index"] as FigureMode[]).map((viewMode) => (
          <li key={viewMode}>
            <button
              type="button"
              className={mode === viewMode ? "is-active" : ""}
              onClick={() => {
                if (cardNavigateTimerRef.current !== null) {
                  window.clearTimeout(cardNavigateTimerRef.current);
                  cardNavigateTimerRef.current = null;
                }
                setMode(viewMode);
                setFigureHovering(false);
                setHasRailInteraction(false);
                setIsCardTransitioning(false);
                setLeavingFigureId(null);
              }}
            >
              {viewMode === "grid" ? "Grid" : "Index"}
            </button>
          </li>
        ))}
      </ul>

      <div className="figures-index__list">
        <span className="figures-index__transition-overlay" aria-hidden="true" />
        <div
          ref={railRef}
          className="figures-index__grid-rail"
          onMouseEnter={handleRailEnter}
          onMouseLeave={handleRailLeave}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onPointerLeave={stopDrag}
        >
          {figures.map((figure, index) => (
            <div
              className="figures-index__grid-item"
              key={figure.id}
              data-leaving={leavingFigureId === figure.id ? "true" : "false"}
              style={{ left: `calc(${index} * 42.77778vh)` }}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
            >
              <div className="figures-index__entry">
                <a
                  href={figure.href}
                  className="figures-index__link"
                  onClick={(event) => handleFigureClick(event, figure.href, figure.id)}
                  onFocus={() => handleFigureEnter(figure)}
                  onBlur={handleFigureBlur}
                  style={{ "--figure-card-color": figure.color } as CSSProperties}
                  data-white={figure.whiteText ? "true" : "false"}
                >
                  <div
                    className="figures-index__image"
                    onMouseEnter={() => handleFigureEnter(figure)}
                    onMouseLeave={handleFigureImageLeave}
                  >
                    <div className="figures-index__image-wrap" data-loaded={loadedFigureIds[figure.id] ? "true" : "false"}>
                      <span className="figures-index__image-skeleton" aria-hidden="true" />
                      <div
                        className="figures-index__image-inner"
                        ref={(node) => {
                          imageInnerRefs.current[index] = node;
                        }}
                      >
                        <img
                          className={loadedFigureIds[figure.id] ? "is-loaded" : ""}
                          src={figure.imageSrc}
                          data-thumb-src={figure.thumbSrc}
                          alt=""
                          loading={index < FIGURE_EAGER_COUNT ? "eager" : "lazy"}
                          fetchPriority={index < FIGURE_EAGER_COUNT ? "high" : "auto"}
                          decoding="async"
                          draggable={false}
                          ref={(node) => {
                            // Cached images finish before hydration, so onLoad never
                            // fires for them - detect the already-complete state here.
                            if (node?.complete && node.naturalWidth > 0) {
                              markFigureImageLoaded(figure.id);
                            }
                          }}
                          onLoad={() => markFigureImageLoaded(figure.id)}
                          onError={() => markFigureImageLoaded(figure.id)}
                        />
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
            </div>
          ))}
        </div>

        <div className="figures-index__index">
          {figuresByGroup.map(({ group, figures }) => (
            <div className="figures-index__index-wrap scroll-reveal" data-reveal key={group}>
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
                    onClick={(event) => handleFigureClick(event, figure.href, figure.id)}
                    onMouseEnter={() => handleFigureEnter(figure)}
                    onFocus={() => handleFigureEnter(figure)}
                  >
                    <img src={figure.thumbSrc} alt={`${figure.name} reference placeholder`} loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          ))}
          <button className="figures-index__totop scroll-reveal" data-reveal type="button" onClick={handleToTop}>
            To Top
          </button>
        </div>
      </div>
    </section>
  );
}
