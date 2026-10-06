import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Contact — Kaynx1"
};

export default function ContactPage() {
  return <SiteShell page="portfolio" section="contact" />;
}
