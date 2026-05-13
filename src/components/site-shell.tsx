"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Lenis from "lenis";
import { useRouter } from "next/navigation";
import { SITE_CONFIG } from "@/data/site-config";
import { useMotion } from "@/context/motion-context";
import { AutoHideHeader } from "@/components/auto-hide-header";
import { NavigationOverlay } from "@/components/nav-overlay";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { Preloader } from "@/components/preloader";
import { PageSections, type PageSectionId } from "@/components/sections";
import { FiguresIndex } from "@/components/figures-index";
import { PageTransition } from "@/components/page-transition";

type SitePage = "home" | "figures" | "portfolio";

interface SiteShellProps {
  page?: SitePage;
  section?: PageSectionId;
}

export function SiteShell({ page = "home", section }: SiteShellProps) {
  const {
    uiState,
    isReducedMotion,
    toggleNav,
    closeNav,
    toggleDoor,
    setActiveHeroIndex,
    triggerTransition
  } = useMotion();

  const router = useRouter();
  const routeTimerRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false);

  const activeSlide = SITE_CONFIG.heroSlides[uiState.activeHeroIndex] ?? SITE_CONFIG.heroSlides[0];

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
      if (href.startsWith("/") && !href.includes("#")) {
        closeNav();
        const currentPath = window.location.pathname;
        if (href === currentPath) {
          lenisRef.current?.scrollTo(0, { immediate: isReducedMotion });
          return;
        }

        if (routeTimerRef.current !== null) {
          window.clearTimeout(routeTimerRef.current);
        }

        if (isReducedMotion) {
          router.push(href);
          return;
        }

        setIsRouteTransitioning(true);
        triggerTransition(800);
        routeTimerRef.current = window.setTimeout(() => {
          router.push(href);
          routeTimerRef.current = null;
        }, 380);
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
    [closeNav, isReducedMotion, router, triggerTransition]
  );

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
      if (routeTimerRef.current !== null) {
        window.clearTimeout(routeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRouteTransitioning) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsRouteTransitioning(false);
    }, 820);
    return () => window.clearTimeout(timer);
  }, [isRouteTransitioning]);

  const pageContent = useMemo(() => {
    if (page === "figures") {
      return <FiguresIndex />;
    }

    if (page === "portfolio") {
      return <PageSections only={section} />;
    }

    return (
      <HeroSlideshow
        slides={SITE_CONFIG.heroSlides}
        activeIndex={uiState.activeHeroIndex}
        slideDurationMs={Math.round(SITE_CONFIG.heroSpeedSeconds * 1000)}
        ready={!uiState.isLoading}
        onChange={setActiveHeroIndex}
        onNavigate={navigate}
      />
    );
  }, [navigate, page, section, setActiveHeroIndex, uiState.activeHeroIndex, uiState.isLoading]);

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
      <Preloader
        isActive={uiState.isLoading}
        brandName={SITE_CONFIG.brandName}
        textureSrc={activeSlide.imageSrc}
        reducedMotion={isReducedMotion}
      />

      <AutoHideHeader
        navItems={SITE_CONFIG.navItems}
        isNavOpen={uiState.isNavOpen}
        onToggleNav={toggleNav}
        onNavigate={navigate}
      />

      <NavigationOverlay
        navItems={SITE_CONFIG.navItems}
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

      <PageTransition isActive={isRouteTransitioning} brandName={SITE_CONFIG.brandName} />
    </div>
  );
}
