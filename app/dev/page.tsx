import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Work & Games — Kaynx1"
};

export default function DevPage() {
  return <SiteShell page="figures" collection="all" />;
}
