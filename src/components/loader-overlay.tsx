"use client";

import { SITE_CONFIG } from "@/data/site-config";

export function LoaderOverlay() {
  return (
    <div className="loader-overlay" aria-hidden="true">
      <div className="loader-overlay__center">
        <span className="loader-overlay__mark">KX</span>
        <span className="loader-overlay__brand">{SITE_CONFIG.brandName}</span>
      </div>
    </div>
  );
}
