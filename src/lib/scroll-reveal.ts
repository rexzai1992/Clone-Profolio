// Low ratios are included so blocks several screens tall still get callbacks while scrolling.
export const SCROLL_REVEAL_THRESHOLDS = [0, 0.01, 0.02, 0.05, 0.1, 0.2, 0.6];

export function shouldScrollReveal(entry: IntersectionObserverEntry) {
  if (!entry.isIntersecting) {
    return false;
  }

  // A block taller than ~5 screens can never be 20% visible (the resume on mobile stayed
  // invisible), so filling 20% of the viewport counts too.
  const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;
  return entry.intersectionRatio >= 0.2 || entry.intersectionRect.height >= viewportHeight * 0.2;
}
