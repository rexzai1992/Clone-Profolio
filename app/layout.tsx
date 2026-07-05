import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FirstLoadIntro } from "@/components/first-load-intro";
import { RouteTransitionOverlay } from "@/components/route-transition-overlay";
import { MotionProvider } from "@/context/motion-context";
import { SiteContentProvider } from "@/context/site-content-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIMEYOI",
  description: "MIMEYOI scale figures with cinematic showcase motion."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>
          <SiteContentProvider>
            <FirstLoadIntro />
            {children}
            <RouteTransitionOverlay />
          </SiteContentProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
