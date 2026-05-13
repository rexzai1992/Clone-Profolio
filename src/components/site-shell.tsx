"use client";

import { useCallback, useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { SITE_CONFIG } from "@/data/site-config";
import { useMotion } from "@/context/motion-context";
import { Header } from "@/components/header";
import { Clock } from "@/components/clock";
import { LoaderOverlay } from "@/components/loader-overlay";
import { NavigationOverlay } from "@/components/nav-overlay";
import { Hero } from "@/components/hero";
import { FiguresIndex } from "@/components/figures-index";
import { PageSections, type PageSectionId } from "@/components/sections";
import { useScrollInview } from "@/hooks/use-scroll-inview";

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
    setClockMode
  } = useMotion();

  const router = useRouter();
  const inactivityRef = useRef<number | null>(null);
  useScrollInview(!isReducedMotion && page === "portfolio");

  const activeSlide = SITE_CONFIG.heroSlides[uiState.activeHeroIndex];

  const rootClassName = useMemo(
    () =>
      [
        "site-root",
        uiState.isLoading ? "is-loading" : "",
        uiState.isNavOpen ? "is-nav" : "",
        uiState.isDoorOpen ? "is-door" : "",
        uiState.isClockMode ? "is-clock" : "",
        uiState.isTransitioning ? "is-transitioning" : ""
      ]
        .filter(Boolean)
        .join(" "),
    [uiState]
  );

  const navigate = useCallback(
    (href: string) => {
      if (href.startsWith("/") && !href.includes("#")) {
        closeNav();
        if (href === "/" && window.location.pathname === "/") {
          window.scrollTo({ top: 0, behavior: isReducedMotion ? "auto" : "smooth" });
          return;
        }

        router.push(href);
        return;
      }

      const [path, hash] = href.split("#");
      if (path && path !== window.location.pathname) {
        closeNav();
        router.push(href);
        return;
      }

      const id = href.replace("#", "");
      const target = document.getElementById(id);
      if (!target) {
        if (href === "#top") {
          router.push("/");
        }
        return;
      }

      const top = target.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({
        top,
        behavior: isReducedMotion ? "auto" : "smooth"
      });

      closeNav();
    },
    [closeNav, isReducedMotion, router]
  );

  const pageContent = useMemo(() => {
    if (page === "figures") {
      return <FiguresIndex />;
    }

    if (page === "portfolio") {
      return <PageSections only={section} />;
    }

    return <Hero onNavigate={navigate} />;
  }, [navigate, page, section]);

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
    if (isReducedMotion) {
      return;
    }

    const clearInactivity = () => {
      if (inactivityRef.current !== null) {
        window.clearTimeout(inactivityRef.current);
        inactivityRef.current = null;
      }
    };

    const restartInactivity = () => {
      clearInactivity();
      setClockMode(false);
      inactivityRef.current = window.setTimeout(() => {
        setClockMode(true);
        inactivityRef.current = null;
      }, 10000);
    };

    const events = ["mousemove", "scroll", "touchstart", "keydown", "mousedown"];
    events.forEach((eventName) => {
      window.addEventListener(eventName, restartInactivity, { passive: true });
    });

    restartInactivity();

    return () => {
      clearInactivity();
      events.forEach((eventName) => {
        window.removeEventListener(eventName, restartInactivity);
      });
    };
  }, [setClockMode, isReducedMotion]);

  return (
    <div
      className={rootClassName}
      data-reduced-motion={isReducedMotion ? "true" : "false"}
      style={
        {
          "--theme-a": activeSlide.theme.bgA,
          "--theme-b": activeSlide.theme.bgB,
          "--theme-accent": activeSlide.theme.accent
        } as CSSProperties
      }
    >
      <LoaderOverlay />

      <Header
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

      <Clock />

      <main className="site-main" aria-busy={uiState.isLoading}>
        {pageContent}
      </main>
    </div>
  );
}
