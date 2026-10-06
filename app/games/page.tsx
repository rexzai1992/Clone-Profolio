import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Games — Kaynx1"
};

export default function GamesPage() {
  return <SiteShell page="figures" collection="all" />;
}
