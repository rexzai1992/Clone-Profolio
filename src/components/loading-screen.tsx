"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface LoadingScreenProps {
  /** Fires when the mask reveal starts so the page underneath can begin its entrance. */
  onReveal?: () => void;
  /** Fires when the whole sequence is over and the overlay can unmount. */
  onComplete?: () => void;
}

// mimeyoi.co timing: logo wipe 0.2s-2.0s, page mask reveal 1.8s-3.3s.
const REVEAL_MS = 1800;
const TOTAL_MS = 3400;
const REDUCED_TOTAL_MS = 200;

export function LoadingScreen({ onReveal, onComplete }: LoadingScreenProps) {
  const reducedMotion = useReducedMotion();
  const [isDone, setIsDone] = useState(false);

  useLayoutEffect(() => {
    document.body.setAttribute("data-kx-loading", "true");
    return () => {
      document.body.removeAttribute("data-kx-loading");
    };
  }, []);

  useEffect(() => {
    const revealMs = reducedMotion ? 0 : REVEAL_MS;
    const totalMs = reducedMotion ? REDUCED_TOTAL_MS : TOTAL_MS;

    const revealTimer = window.setTimeout(() => {
      onReveal?.();
    }, revealMs);
    const doneTimer = window.setTimeout(() => {
      document.body.removeAttribute("data-kx-loading");
      setIsDone(true);
      onComplete?.();
    }, totalMs);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete, onReveal, reducedMotion]);

  if (isDone) {
    return null;
  }

  return (
    <>
      <div className="first-load-intro__veil" aria-hidden="true" />
      <div className="first-load-intro" aria-hidden="true">
        <p className="first-load-intro__logo">MIMEYOI</p>
      </div>
    </>
  );
}
