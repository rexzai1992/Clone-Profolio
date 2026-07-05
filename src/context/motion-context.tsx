"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import {
  DEFAULT_UI_STATE,
  HERO_TRANSITION_PRESET,
  LOADER_PRESET,
  MOTION_TOKENS,
  type HeroTransitionPreset,
  type LoaderPreset,
  type MotionTokens,
  type UIState
} from "@/types/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface MotionContextValue {
  uiState: UIState;
  tokens: MotionTokens;
  loaderPreset: LoaderPreset;
  heroPreset: HeroTransitionPreset;
  isReducedMotion: boolean;
  openNav: () => void;
  closeNav: () => void;
  toggleNav: () => void;
  toggleDoor: () => void;
  closeDoor: () => void;
  setClockMode: (value: boolean) => void;
  setActiveHeroIndex: (index: number) => void;
  triggerTransition: (durationMs?: number) => void;
  completeFirstLoadIntro: () => void;
  beginRouteOverlay: (fromPath: string, toPath: string) => void;
  markRouteOverlayCovered: () => void;
  revealRouteOverlay: () => void;
  clearRouteOverlay: () => void;
}

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({ children }: PropsWithChildren) {
  const isReducedMotion = useReducedMotion();
  const [uiState, setUiState] = useState<UIState>(DEFAULT_UI_STATE);

  const transitionTimerRef = useRef<number | null>(null);
  const loaderTimerRef = useRef<number | null>(null);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const triggerTransition = useCallback(
    (durationMs: number = MOTION_TOKENS.durations.navOpenMs) => {
      const lockedDuration = isReducedMotion ? 0 : durationMs;
      clearTransitionTimer();

      if (lockedDuration <= 0) {
        setUiState((prev) => ({ ...prev, isTransitioning: false }));
        return;
      }

      setUiState((prev) => ({ ...prev, isTransitioning: true }));
      transitionTimerRef.current = window.setTimeout(() => {
        setUiState((prev) => ({ ...prev, isTransitioning: false }));
        transitionTimerRef.current = null;
      }, lockedDuration);
    },
    [clearTransitionTimer, isReducedMotion]
  );

  const openNav = useCallback(() => {
    setUiState((prev) => ({
      ...prev,
      isNavOpen: true,
      isDoorOpen: false
    }));
    triggerTransition(MOTION_TOKENS.durations.navOpenMs);
  }, [triggerTransition]);

  const closeNav = useCallback(() => {
    setUiState((prev) => ({
      ...prev,
      isNavOpen: false,
      isDoorOpen: false
    }));
    triggerTransition(MOTION_TOKENS.durations.navOpenMs);
  }, [triggerTransition]);

  const toggleNav = useCallback(() => {
    setUiState((prev) => {
      const nextNavOpen = !prev.isNavOpen;
      return {
        ...prev,
        isNavOpen: nextNavOpen,
        isDoorOpen: nextNavOpen ? false : prev.isDoorOpen
      };
    });
    triggerTransition(MOTION_TOKENS.durations.navOpenMs);
  }, [triggerTransition]);

  const toggleDoor = useCallback(() => {
    setUiState((prev) => {
      if (!prev.isNavOpen) {
        return prev;
      }
      return {
        ...prev,
        isDoorOpen: !prev.isDoorOpen
      };
    });
    triggerTransition(MOTION_TOKENS.durations.navOpenMs);
  }, [triggerTransition]);

  const closeDoor = useCallback(() => {
    setUiState((prev) => ({ ...prev, isDoorOpen: false }));
  }, []);

  const setClockMode = useCallback((value: boolean) => {
    setUiState((prev) => {
      if (prev.isClockMode === value) {
        return prev;
      }
      return { ...prev, isClockMode: value };
    });
  }, []);

  const setActiveHeroIndex = useCallback((index: number) => {
    setUiState((prev) => ({ ...prev, activeHeroIndex: index }));
  }, []);

  const completeFirstLoadIntro = useCallback(() => {
    setUiState((prev) => {
      if (prev.isFirstLoadIntroDone && !prev.isLoading) {
        return prev;
      }
      return {
        ...prev,
        isFirstLoadIntroDone: true,
        isLoading: false
      };
    });
  }, []);

  const beginRouteOverlay = useCallback((fromPath: string, toPath: string) => {
    setUiState((prev) => ({
      ...prev,
      routeOverlayActive: true,
      routeOverlayPhase: "covering",
      routeOverlayFrom: fromPath,
      routeOverlayTo: toPath
    }));
  }, []);

  const revealRouteOverlay = useCallback(() => {
    setUiState((prev) => {
      if (!prev.routeOverlayActive || prev.routeOverlayPhase !== "covered") {
        return prev;
      }

      return {
        ...prev,
        routeOverlayPhase: "revealing"
      };
    });
  }, []);

  const markRouteOverlayCovered = useCallback(() => {
    setUiState((prev) => {
      if (!prev.routeOverlayActive || prev.routeOverlayPhase !== "covering") {
        return prev;
      }

      return {
        ...prev,
        routeOverlayPhase: "covered"
      };
    });
  }, []);

  const clearRouteOverlay = useCallback(() => {
    setUiState((prev) => {
      if (!prev.routeOverlayActive && prev.routeOverlayPhase === "idle") {
        return prev;
      }

      return {
        ...prev,
        routeOverlayActive: false,
        routeOverlayPhase: "idle",
        routeOverlayFrom: null,
        routeOverlayTo: null
      };
    });
  }, []);

  useEffect(() => {
    if (loaderTimerRef.current !== null) {
      window.clearTimeout(loaderTimerRef.current);
      loaderTimerRef.current = null;
    }

    if (isReducedMotion) {
      loaderTimerRef.current = window.setTimeout(() => {
        setUiState((prev) => ({ ...prev, isLoading: false }));
        loaderTimerRef.current = null;
      }, 40);
      return;
    }

    loaderTimerRef.current = window.setTimeout(() => {
      setUiState((prev) => ({ ...prev, isLoading: false }));
      loaderTimerRef.current = null;
    }, LOADER_PRESET.totalMs);
  }, [isReducedMotion]);

  useEffect(() => {
    return () => {
      clearTransitionTimer();
      if (loaderTimerRef.current !== null) {
        window.clearTimeout(loaderTimerRef.current);
      }
    };
  }, [clearTransitionTimer]);

  const value = useMemo<MotionContextValue>(
    () => ({
      uiState,
      tokens: MOTION_TOKENS,
      loaderPreset: LOADER_PRESET,
      heroPreset: HERO_TRANSITION_PRESET,
      isReducedMotion,
      openNav,
      closeNav,
      toggleNav,
      toggleDoor,
      closeDoor,
      setClockMode,
      setActiveHeroIndex,
      triggerTransition,
      completeFirstLoadIntro,
      beginRouteOverlay,
      markRouteOverlayCovered,
      revealRouteOverlay,
      clearRouteOverlay
    }),
    [
      uiState,
      isReducedMotion,
      openNav,
      closeNav,
      toggleNav,
      toggleDoor,
      closeDoor,
      setClockMode,
      setActiveHeroIndex,
      triggerTransition,
      completeFirstLoadIntro,
      beginRouteOverlay,
      markRouteOverlayCovered,
      revealRouteOverlay,
      clearRouteOverlay
    ]
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): MotionContextValue {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error("useMotion must be used inside MotionProvider");
  }
  return context;
}
