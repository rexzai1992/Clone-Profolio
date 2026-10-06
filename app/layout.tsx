import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FirstLoadIntro } from "@/components/first-load-intro";
import { RouteTransitionOverlay } from "@/components/route-transition-overlay";
import { MotionProvider } from "@/context/motion-context";
import { SiteContentProvider } from "@/context/site-content-context";
import "./globals.css";

export const metadata: Metadata = {
  // Without this, relative og:image URLs were baked in as http://localhost:3000 at build time.
  metadataBase: new URL("https://kaynx1.com"),
  title: "Kaynx1 — Izzul Fitree",
  description:
    "Technical product development, AI automation, computer vision, interactive games and business systems by Izzul Fitree.",
  // Google AdSense ownership check for kaynx1.com. Shows no ads here — ads run
  // only on public.kaynx1.com's timetable pages.
  other: {
    "google-adsense-account": "ca-pub-4843649883093955"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-scroll-behavior lets Next jump to the top on navigation despite scroll-behavior: smooth.
    <html lang="en" data-scroll-behavior="smooth">
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
