import type { Metadata } from "next";
import { Jost } from "next/font/google";
import type { ReactNode } from "react";
import { MotionProvider } from "@/context/motion-context";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-primary",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Kaynx1 | Izzul",
  description: "Kaynx1 game and dev portfolio with cinematic motion-first presentation."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={jost.variable}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
