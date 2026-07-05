import { notFound } from "next/navigation";
import { FigureDetailView } from "@/components/figure-detail-view";
import { SITE_CONFIG, getFigureBySlug, getFigureSlugFromHref } from "@/data/site-config";

interface FigureDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SITE_CONFIG.figures.map((figure) => ({
    slug: getFigureSlugFromHref(figure.href)
  }));
}

export default async function FigureDetailPage({ params }: FigureDetailPageProps) {
  const { slug } = await params;
  const figure = getFigureBySlug(slug);

  if (!figure) {
    notFound();
  }

  return <FigureDetailView figure={figure} />;
}
