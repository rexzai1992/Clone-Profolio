export interface MotionTokens {
  easing: {
    primary: string;
    gentle: string;
    elastic: string;
    quickOut: string;
  };
  durations: {
    loaderDelayMs: number;
    loaderMotionMs: number;
    loaderTotalMs: number;
    navOpenMs: number;
    navLayerStaggerMs: number;
    heroSwitchMs: number;
    sectionRevealMs: number;
  };
  skew: {
    mobileDeg: number;
    desktopDeg: number;
  };
  blur: {
    mobile: string;
    desktop: string;
  };
  figures: {
    wheelTravelMultiplier: number;
    dragTravelMultiplier: number;
    wheelLineStepPx: number;
    wheelClampPx: number;
    autoDriftPxPerSec: number;
    interactionPauseMs: number;
  };
}

export interface UIState {
  isLoading: boolean;
  isFirstLoadIntroDone: boolean;
  isNavOpen: boolean;
  isDoorOpen: boolean;
  isClockMode: boolean;
  activeHeroIndex: number;
  isTransitioning: boolean;
  routeOverlayActive: boolean;
  routeOverlayPhase: "idle" | "covering" | "covered" | "revealing";
  routeOverlayFrom: string | null;
  routeOverlayTo: string | null;
}

export interface LoaderPreset {
  maskSteps: number[];
  bubbleSteps: number[];
  overlayFrom: number;
  overlayTo: number;
  stageDelayMs: number;
  motionMs: number;
  totalMs: number;
}

export interface HeroTransitionPreset {
  autoCycleMs: number;
  switchLockMs: number;
  textStaggerMs: number;
  imageScaleFrom: number;
  imageScaleTo: number;
  wheelTriggerPx: number;
  wheelImmediatePx: number;
  wheelLineStepPx: number;
  wheelClampPx: number;
  wheelResetMs: number;
}

export const MOTION_TOKENS: MotionTokens = {
  // mimeyoi.co easing set
  easing: {
    primary: "cubic-bezier(0.785, 0.135, 0.15, 0.86)",
    gentle: "cubic-bezier(0.23, 1, 0.32, 1)",
    elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    quickOut: "cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  },
  durations: {
    loaderDelayMs: 200,
    loaderMotionMs: 1500,
    loaderTotalMs: 3400,
    navOpenMs: 800,
    navLayerStaggerMs: 200,
    heroSwitchMs: 1000,
    sectionRevealMs: 700
  },
  skew: {
    mobileDeg: 6,
    desktopDeg: 3
  },
  blur: {
    mobile: "8px",
    desktop: "12px"
  },
  figures: {
    wheelTravelMultiplier: 2.8,
    dragTravelMultiplier: 2.3,
    wheelLineStepPx: 16,
    wheelClampPx: 56,
    autoDriftPxPerSec: 32,
    interactionPauseMs: 1800
  }
};

export const LOADER_PRESET: LoaderPreset = {
  maskSteps: [0, 22, 100],
  bubbleSteps: [0, 6, 200],
  overlayFrom: 1,
  overlayTo: 0,
  stageDelayMs: MOTION_TOKENS.durations.loaderDelayMs,
  motionMs: MOTION_TOKENS.durations.loaderMotionMs,
  totalMs: MOTION_TOKENS.durations.loaderTotalMs
};

export const HERO_TRANSITION_PRESET: HeroTransitionPreset = {
  autoCycleMs: 4600,
  switchLockMs: MOTION_TOKENS.durations.heroSwitchMs,
  textStaggerMs: 90,
  imageScaleFrom: 1.04,
  imageScaleTo: 1,
  wheelTriggerPx: 92,
  wheelImmediatePx: 96,
  wheelLineStepPx: 16,
  wheelClampPx: 96,
  wheelResetMs: 620
};

export const DEFAULT_UI_STATE: UIState = {
  isLoading: true,
  isFirstLoadIntroDone: false,
  isNavOpen: false,
  isDoorOpen: false,
  isClockMode: false,
  activeHeroIndex: 0,
  isTransitioning: false,
  routeOverlayActive: false,
  routeOverlayPhase: "idle",
  routeOverlayFrom: null,
  routeOverlayTo: null
};
