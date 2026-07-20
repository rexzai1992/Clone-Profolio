import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioDetailView } from "@/components/portfolio-detail-view";
import { SITE_CONFIG, getPortfolioItemBySlug } from "@/data/site-config";

interface PortfolioDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [...SITE_CONFIG.devs, ...SITE_CONFIG.games].map((item) => ({ slug: item.id }));
}

export async function generateMetadata({ params }: PortfolioDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getPortfolioItemBySlug(slug);
  if (!item) return {};

  return {
    title: `${item.title} — Kaynx1`,
    description: item.summary,
    openGraph: {
      title: `${item.title} — Kaynx1`,
      description: item.summary,
      images: [{ url: item.imageSrc }]
    }
  };
}

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const { slug } = await params;
  const item = getPortfolioItemBySlug(slug);
  if (!item) notFound();

  const collection = item.type === "game" ? SITE_CONFIG.games : SITE_CONFIG.devs;
  const index = collection.findIndex((entry) => entry.id === item.id);
  const nextItem = collection[(index + 1) % collection.length];

  return <PortfolioDetailView item={item} index={index} total={collection.length} nextItem={nextItem} />;
}
