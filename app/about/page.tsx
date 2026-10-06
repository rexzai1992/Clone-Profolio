import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Resume — Kaynx1"
};

export default function AboutPage() {
  return <SiteShell page="portfolio" section="about" />;
}
