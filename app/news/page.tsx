import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "News — Kaynx1"
};

export default function NewsPage() {
  return <SiteShell page="portfolio" section="news" />;
}
