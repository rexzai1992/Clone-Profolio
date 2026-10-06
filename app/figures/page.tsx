import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Figures — Kaynx1"
};

export default function FiguresPage() {
  return <SiteShell page="figures" />;
}
