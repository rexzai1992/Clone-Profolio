"use client";

import { useEffect, useRef, useState, type TransitionEvent } from "react";
import { usePathname } from "next/navigation";
import { useMotion } from "@/context/motion-context";

const COVER_MS = 650;
const REVEAL_MS = 750;

export function RouteTransitionOverlay() {
  const pathname = usePathname();
  const { clearRouteOverlay, isReducedMotion, markRouteOverlayCovered, uiState } = useMotion();
  const isAdminPath = pathname?.startsWith("/admin");
  const isActive = uiState.routeOverlayActive;
  const phase = uiState.routeOverlayPhase;
  const fallbackTimerRef = useRef<number | null>(null);
  // The overlay must paint one frame at translateY(100%) before the covering
  // transform applies, otherwise the CSS transition never runs.
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setArmed(false);
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setArmed(true));
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isActive]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform") {
      return;
    }

    if (phase === "covering") {
      markRouteOverlayCovered();
      return;
    }
    if (phase === "revealing") {
      clearRouteOverlay();
    }
  };

  // Safety net: transitionend can be skipped (tab hidden, reduced motion), so
  // advance the phase on a timer as well.
  useEffect(() => {
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    if (!isActive) {
      return;
    }

    if (phase === "covering") {
      fallbackTimerRef.current = window.setTimeout(
        markRouteOverlayCovered,
        isReducedMotion ? 20 : COVER_MS + 120
      );
    } else if (phase === "revealing") {
      fallbackTimerRef.current = window.setTimeout(
        clearRouteOverlay,
        isReducedMotion ? 20 : REVEAL_MS + 120
      );
    }

    return () => {
      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [clearRouteOverlay, isActive, isReducedMotion, markRouteOverlayCovered, phase]);

  if (isAdminPath || !isActive) {
    return null;
  }

  return (
    <div
      className="route-transition-overlay"
      data-phase={armed ? phase : undefined}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden="true"
    />
  );
}
