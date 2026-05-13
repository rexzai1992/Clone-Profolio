import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_JP } from "next/font/google";
import type { ReactNode } from "react";
import { MotionProvider } from "@/context/motion-context";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap"
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Kaynx1 | Izzul",
  description: "Kaynx1 game and dev portfolio with cinematic motion-first presentation."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${notoSansJP.variable} ${cormorant.variable}`}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
