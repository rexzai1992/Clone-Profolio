"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingScreen } from "@/components/loading-screen";
import { useMotion } from "@/context/motion-context";

export function FirstLoadIntro() {
  const { completeFirstLoadIntro } = useMotion();
  const pathname = usePathname();
  const [showIntro, setShowIntro] = useState(true);
  const isAdminPath = pathname?.startsWith("/admin");

  const handleReveal = useCallback(() => {
    completeFirstLoadIntro();
  }, [completeFirstLoadIntro]);

  const handleComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  if (isAdminPath || !showIntro) {
    return null;
  }

  return <LoadingScreen onReveal={handleReveal} onComplete={handleComplete} />;
}
