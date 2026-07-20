"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Lenis from "lenis";
import { usePathname, useRouter } from "next/navigation";
import { useMotion } from "@/context/motion-context";
import { useSiteContent } from "@/context/site-content-context";
import { AutoHideHeader } from "@/components/auto-hide-header";
import { NavigationOverlay } from "@/components/nav-overlay";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { PageSections, type PageSectionId } from "@/components/sections";
import { FiguresIndex } from "@/components/figures-index";
import { LiveClock } from "@/components/live-clock";
import type { FigureItem, PortfolioItem } from "@/data/site-config";

type SitePage = "home" | "figures" | "portfolio";
type CarouselCollection = "figures" | "games" | "work" | "all";
const FIGURES_IDLE_HIDE_DELAY_MS = 1200;
const ROUTE_PUSH_DELAY_MS = 300;
const FIGURE_DETAIL_PUSH_DELAY_MS = 0;
const ROUTE_TRANSITION_MS = 760;
const ROUTE_TRANSITION_CLEANUP_MS = 900;

function normalizePath(path: string) {
  if (!path) {
    return "/";
  }
  if (path === "/") {
    return "/";
  }
  return path.replace(/\/+$/, "");
}

interface SiteShellProps {
  page?: SitePage;
  section?: PageSectionId;
  collection?: CarouselCollection;
}

const CAROUSEL_THEMES = [
  { color: "#1a1818", whiteText: true },
  { color: "#19a4d0", whiteText: true },
  { color: "#55c3cd", whiteText: false },
  { color: "#a62648", whiteText: true },
  { color: "#cb90dd", whiteText: false },
  { color: "#f896a4", whiteText: false },
  { color: "#a459e2", whiteText: true },
  { color: "#593d76", whiteText: true },
  { color: "#fdfaf4", whiteText: false },
  { color: "#293cad", whiteText: true },
  { color: "#ee5f32", whiteText: true },
  { color: "#84c657", whiteText: false },
  { color: "#ffc857", whiteText: false },
  { color: "#3c6e71", whiteText: true },
  { color: "#6c2f74", whiteText: true },
  { color: "#e8d7c1", whiteText: false }
];

function toCarouselItems(items: PortfolioItem[], group: FigureItem["group"], themeOffset = 0): FigureItem[] {
  return items.map((item, index) => {
    const theme = CAROUSEL_THEMES[(index + themeOffset) % CAROUSEL_THEMES.length];
    return {
      id: item.id,
      group,
      href: `/portfolio/${item.id}`,
      externalHref: item.href,
      color: theme.color,
      whiteText: theme.whiteText,
      thumbSrc: item.imageSrc,
      imageSrc: item.imageSrc,
      series: item.stack[0]?.toUpperCase() ?? item.type.toUpperCase(),
      name: item.title,
      caption: item.summary
    };
  });
}

export function SiteShell({ page = "home", section, collection = "figures" }: SiteShellProps) {
  const { site } = useSiteContent();
  const {
    uiState,
    isReducedMotion,
    toggleNav,
    closeNav,
    toggleDoor,
    setActiveHeroIndex,
    triggerTransition,
    beginRouteOverlay,
    revealRouteOverlay
  } = useMotion();

  const pathname = usePathname();
  const router = useRouter();
  const routeTimerRef = useRef<number | null>(null);
  const pendingHomeRouteRef = useRef<{ href: string; to: string; transitionTypes: string[] } | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const idleModeRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false);
  const [isIdleMode, setIsIdleMode] = useState(false);
  const isFiguresPage = page === "figures";
  const introReady = uiState.isFirstLoadIntroDone;

  const activeSlide = site.heroSlides[uiState.activeHeroIndex] ?? site.heroSlides[0];
  const carouselItems = useMemo(() => {
    if (collection === "games") {
      return toCarouselItems(site.games, "Interactive Games");
    }
    if (collection === "work") {
      return toCarouselItems(site.devs, "Development");
    }
    if (collection === "all") {
      return [
        ...toCarouselItems(site.devs, "Development"),
        ...toCarouselItems(site.games, "Interactive Games", site.devs.length)
      ];
    }
    return site.figures;
  }, [collection, site.devs, site.figures, site.games]);

  const rootClassName = useMemo(
    () =>
      [
        "site-root",
        uiState.isLoading ? "is-loading" : "",
        uiState.isNavOpen ? "is-nav-open" : "",
        isRouteTransitioning ? "is-route-transitioning" : ""
      ]
        .filter(Boolean)
        .join(" "),
    [isRouteTransitioning, uiState.isLoading, uiState.isNavOpen]
  );

  const navigate = useCallback(
    (href: string) => {
      if (/^https?:\/\//.test(href)) {
        closeNav();
        window.open(href, "_blank", "noopener,noreferrer");
        return;
      }

      if (href.startsWith("/") && !href.includes("#")) {
        closeNav();
        const currentPath = window.location.pathname;
        const normalizedCurrentPath = normalizePath(currentPath);
        const normalizedHref = normalizePath(href);
        if (normalizedHref === normalizedCurrentPath) {
          lenisRef.current?.scrollTo(0, { immediate: isReducedMotion });
          return;
        }

        if (routeTimerRef.current !== null) {
          window.clearTimeout(routeTimerRef.current);
        }
        pendingHomeRouteRef.current = null;

        const isFigureDetailRoute = /^\/(?:figures|portfolio)\/[^/]+\/?$/.test(normalizedHref);
        const isHomeToFiguresRoute = page === "home" && /^\/(?:figures?|games|dev)(?:\/|$)/.test(normalizedHref);
        const transitionTypes = isFigureDetailRoute ? ["figure-open"] : ["route-change"];
        const pushDelay = isFigureDetailRoute ? FIGURE_DETAIL_PUSH_DELAY_MS : ROUTE_PUSH_DELAY_MS;
        const pushRoute = () => {
          router.push(href, { transitionTypes });
        };

        if (isReducedMotion) {
          pushRoute();
          return;
        }

        setIsRouteTransitioning(true);
        triggerTransition(ROUTE_TRANSITION_MS);
        if (isHomeToFiguresRoute) {
          beginRouteOverlay(normalizedCurrentPath, normalizedHref);
          pendingHomeRouteRef.current = {
            href,
            to: normalizedHref,
            transitionTypes
          };
          return;
        }

        if (pushDelay <= 0) {
          pushRoute();
          return;
        }

        routeTimerRef.current = window.setTimeout(() => {
          pushRoute();
          routeTimerRef.current = null;
        }, pushDelay);
        return;
      }

      const [path, hash] = href.split("#");
      if (path && path !== window.location.pathname) {
        closeNav();
        router.push(href);
        return;
      }

      const id = hash || href.replace("#", "");
      const target = document.getElementById(id);
      if (!target) {
        if (href === "#top") {
          lenisRef.current?.scrollTo(0, { immediate: isReducedMotion });
        }
        return;
      }

      if (lenisRef.current && !isReducedMotion) {
        lenisRef.current.scrollTo(target, { offset: -84, duration: 1.1 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top, behavior: isReducedMotion ? "auto" : "smooth" });
      }

      closeNav();
    },
    [beginRouteOverlay, closeNav, isReducedMotion, page, router, triggerTransition]
  );

  useEffect(() => {
    const pendingRoute = pendingHomeRouteRef.current;
    if (
      isReducedMotion ||
      !pendingRoute ||
      !uiState.routeOverlayActive ||
      uiState.routeOverlayPhase !== "covered" ||
      normalizePath(uiState.routeOverlayTo ?? "") !== pendingRoute.to
    ) {
      return;
    }

    router.push(pendingRoute.href, { transitionTypes: pendingRoute.transitionTypes });
    pendingHomeRouteRef.current = null;
  }, [isReducedMotion, router, uiState.routeOverlayActive, uiState.routeOverlayPhase, uiState.routeOverlayTo]);

  useEffect(() => {
    if (
      isReducedMotion ||
      !uiState.routeOverlayActive ||
      uiState.routeOverlayPhase !== "covered" ||
      !uiState.routeOverlayTo
    ) {
      return;
    }

    const normalizedTarget = normalizePath(uiState.routeOverlayTo);
    if (normalizePath(pathname) !== normalizedTarget) {
      return;
    }

    if (["/figure", "/figures", "/games", "/dev"].includes(normalizedTarget)) {
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      revealRouteOverlay();
    });
    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [
    isReducedMotion,
    pathname,
    revealRouteOverlay,
    uiState.routeOverlayActive,
    uiState.routeOverlayPhase,
    uiState.routeOverlayTo
  ]);

  useEffect(() => {
    const prefetchTargets = new Set<string>();
    site.navItems.forEach((item) => {
      if (item.href.startsWith("/")) {
        prefetchTargets.add(item.href);
      }
    });
    site.heroSlides.forEach((slide) => {
      if (slide.ctaHref.startsWith("/")) {
        prefetchTargets.add(slide.ctaHref);
      }
    });

    prefetchTargets.forEach((target) => {
      router.prefetch(target);
    });
  }, [router, site.heroSlides, site.navItems]);

  useEffect(() => {
    if (uiState.activeHeroIndex >= site.heroSlides.length) {
      setActiveHeroIndex(0);
    }
  }, [setActiveHeroIndex, site.heroSlides.length, uiState.activeHeroIndex]);

  useEffect(() => {
    idleModeRef.current = isIdleMode;
  }, [isIdleMode]);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const scheduleIdle = useCallback(() => {
    clearIdleTimer();
    if (!isFiguresPage || uiState.isLoading || uiState.isNavOpen || isRouteTransitioning) {
      return;
    }

    idleTimerRef.current = window.setTimeout(() => {
      idleModeRef.current = true;
      setIsIdleMode(true);
      idleTimerRef.current = null;
    }, FIGURES_IDLE_HIDE_DELAY_MS);
  }, [clearIdleTimer, isFiguresPage, isRouteTransitioning, uiState.isLoading, uiState.isNavOpen]);

  const markActive = useCallback(() => {
    if (!isFiguresPage) {
      return;
    }

    if (idleModeRef.current) {
      idleModeRef.current = false;
      setIsIdleMode(false);
    }
    scheduleIdle();
  }, [isFiguresPage, scheduleIdle]);

  useEffect(() => {
    if (!isFiguresPage || uiState.isLoading || uiState.isNavOpen || isRouteTransitioning) {
      idleModeRef.current = false;
      setIsIdleMode(false);
      clearIdleTimer();
      return;
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        clearIdleTimer();
        return;
      }
      markActive();
    };

    markActive();

    window.addEventListener("pointerdown", markActive, { passive: true });
    window.addEventListener("touchstart", markActive, { passive: true });
    window.addEventListener("wheel", markActive, { passive: true });
    window.addEventListener("scroll", markActive, { passive: true });
    window.addEventListener("keydown", markActive);
    window.addEventListener("pointermove", markActive, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearIdleTimer();
      window.removeEventListener("pointerdown", markActive);
      window.removeEventListener("touchstart", markActive);
      window.removeEventListener("wheel", markActive);
      window.removeEventListener("scroll", markActive);
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("pointermove", markActive);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [clearIdleTimer, isFiguresPage, isRouteTransitioning, markActive, uiState.isLoading, uiState.isNavOpen]);

  useEffect(() => {
    if (isReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.08,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.95,
      touchMultiplier: 1
    });

    lenisRef.current = lenis;
    Object.assign(window, { __kaynxLenis: lenis });
    let raf = 0;
    const onFrame = (time: number) => {
      lenis.raf(time);
      raf = window.requestAnimationFrame(onFrame);
    };
    raf = window.requestAnimationFrame(onFrame);

    return () => {
      window.cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
      Object.assign(window, { __kaynxLenis: undefined });
    };
  }, [isReducedMotion]);

  useEffect(() => {
    if (!uiState.isNavOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.setProperty("overflow", "hidden");
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [uiState.isNavOpen]);

  useEffect(() => {
    return () => {
      clearIdleTimer();
      if (routeTimerRef.current !== null) {
        window.clearTimeout(routeTimerRef.current);
      }
      pendingHomeRouteRef.current = null;
    };
  }, [clearIdleTimer]);

  useEffect(() => {
    if (!isRouteTransitioning) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsRouteTransitioning(false);
    }, ROUTE_TRANSITION_CLEANUP_MS);
    return () => window.clearTimeout(timer);
  }, [isRouteTransitioning]);

  const pageContent = useMemo(() => {
    if (page === "figures") {
      const carouselCopy =
        collection === "all"
          ? { sectionId: "portfolio", eyebrow: "Selected Portfolio", heading: "Work & Games", ariaLabel: "Kaynx1 work and games portfolio carousel" }
          : collection === "games"
          ? { sectionId: "games", eyebrow: "Interactive Portfolio", heading: "Games", ariaLabel: "Kaynx1 interactive games carousel" }
          : collection === "work"
            ? { sectionId: "work", eyebrow: "Development", heading: "Selected Work", ariaLabel: "Kaynx1 development work carousel" }
            : { sectionId: "figures", eyebrow: "Portfolio", heading: "Selected Work", ariaLabel: "Kaynx1 selected work gallery" };

      return <FiguresIndex items={carouselItems} onNavigate={navigate} showDescriptions={collection !== "all"} {...carouselCopy} />;
    }

    if (page === "portfolio") {
      return <PageSections only={section} />;
    }

      return (
        <HeroSlideshow
          slides={site.heroSlides}
          activeIndex={uiState.activeHeroIndex}
          slideDurationMs={Math.round(site.heroSpeedSeconds * 1000)}
          ready={!uiState.isLoading}
          introReady={introReady}
          isRouteExiting={isRouteTransitioning && page === "home"}
          onChange={setActiveHeroIndex}
          onNavigate={navigate}
        />
      );
  }, [
    introReady,
    navigate,
    page,
    carouselItems,
    collection,
    section,
    setActiveHeroIndex,
    site.heroSlides,
    site.heroSpeedSeconds,
    uiState.activeHeroIndex,
    uiState.isLoading
  ]);

  return (
    <div
      className={rootClassName}
      data-page={page}
      data-reduced-motion={isReducedMotion ? "true" : "false"}
      style={
        {
          "--theme-a": activeSlide.theme.bgA,
          "--theme-b": activeSlide.theme.bgB,
          "--theme-accent": activeSlide.theme.accent
        } as CSSProperties
      }
    >
      <AutoHideHeader
        brandName={site.brandName}
        navItems={site.navItems}
        isNavOpen={uiState.isNavOpen}
        forceHidden={isFiguresPage && isIdleMode && !uiState.isNavOpen}
        introReady={introReady}
        tone={page === "home" ? "light" : "dark"}
        onToggleNav={toggleNav}
        onNavigate={navigate}
      />

      <NavigationOverlay
        brandName={site.brandName}
        navItems={site.navItems}
        isNavOpen={uiState.isNavOpen}
        isDoorOpen={uiState.isDoorOpen}
        activeSlide={activeSlide}
        onNavigate={navigate}
        onClose={closeNav}
        onToggleDoor={toggleDoor}
      />

      <main className="site-main" aria-busy={uiState.isLoading}>
        {pageContent}
      </main>

      {isFiguresPage ? <LiveClock show={isIdleMode && !uiState.isNavOpen && !uiState.isLoading} /> : null}
    </div>
  );
}
