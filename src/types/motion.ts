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
  isNavOpen: boolean;
  isDoorOpen: boolean;
  isClockMode: boolean;
  activeHeroIndex: number;
  isTransitioning: boolean;
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
  easing: {
    primary: "cubic-bezier(0.23, 1, 0.32, 1)",
    gentle: "cubic-bezier(0.075, 0.82, 0.165, 1)",
    elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    quickOut: "cubic-bezier(0.6, -0.28, 0.735, 0.045)"
  },
  durations: {
    loaderDelayMs: 1800,
    loaderMotionMs: 1500,
    loaderTotalMs: 3500,
    navOpenMs: 1000,
    navLayerStaggerMs: 200,
    heroSwitchMs: 1400,
    sectionRevealMs: 900
  },
  skew: {
    mobileDeg: 6,
    desktopDeg: 3
  },
  blur: {
    mobile: "10px",
    desktop: "16px"
  },
  figures: {
    wheelTravelMultiplier: 3.4,
    dragTravelMultiplier: 2.8,
    wheelLineStepPx: 16,
    wheelClampPx: 64,
    autoDriftPxPerSec: 42,
    interactionPauseMs: 2400
  }
};

export const LOADER_PRESET: LoaderPreset = {
  maskSteps: [0, 46, 100],
  bubbleSteps: [0, 0, 240],
  overlayFrom: 0.22,
  overlayTo: 0,
  stageDelayMs: MOTION_TOKENS.durations.loaderDelayMs,
  motionMs: MOTION_TOKENS.durations.loaderMotionMs,
  totalMs: MOTION_TOKENS.durations.loaderTotalMs
};

export const HERO_TRANSITION_PRESET: HeroTransitionPreset = {
  autoCycleMs: 5000,
  switchLockMs: MOTION_TOKENS.durations.heroSwitchMs,
  textStaggerMs: 120,
  imageScaleFrom: 1.08,
  imageScaleTo: 1,
  wheelTriggerPx: 120,
  wheelImmediatePx: 96,
  wheelLineStepPx: 16,
  wheelClampPx: 108,
  wheelResetMs: 760
};

export const DEFAULT_UI_STATE: UIState = {
  isLoading: true,
  isNavOpen: false,
  isDoorOpen: false,
  isClockMode: false,
  activeHeroIndex: 0,
  isTransitioning: false
};
