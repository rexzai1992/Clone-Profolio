"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ImageReveal } from "@/components/image-reveal";
import { getFigureSlugFromHref, type FigureItem } from "@/data/site-config";
import { useSiteContent } from "@/context/site-content-context";

interface FigureDetailViewProps {
  figure: FigureItem;
}

const DETAIL_BACK_TRANSITION_MS = 450;

export function FigureDetailView({ figure }: FigureDetailViewProps) {
  const { site } = useSiteContent();
  const router = useRouter();
  const leaveTimerRef = useRef<number | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isEntered, setIsEntered] = useState(false);

  const currentFigure = useMemo(() => {
    const slug = getFigureSlugFromHref(figure.href);
    return site.figures.find((item) => getFigureSlugFromHref(item.href) === slug) ?? figure;
  }, [figure, site.figures]);

  const figureOrdinal = useMemo(() => {
    const foundIndex = site.figures.findIndex((item) => item.id === currentFigure.id);
    return foundIndex >= 0 ? `${String(foundIndex + 1).padStart(2, "0")}/${String(site.figures.length).padStart(2, "0")}` : "--/--";
  }, [currentFigure.id, site.figures]);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsEntered(true));
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current !== null) {
        window.clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  const handleBack = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const isModified =
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || event.currentTarget.target === "_blank";
      if (isModified) {
        return;
      }

      event.preventDefault();
      if (isLeaving) {
        return;
      }

      setIsLeaving(true);
      if (leaveTimerRef.current !== null) {
        window.clearTimeout(leaveTimerRef.current);
      }
      leaveTimerRef.current = window.setTimeout(() => {
        router.push("/figures", { transitionTypes: ["figure-open"] });
        leaveTimerRef.current = null;
      }, DETAIL_BACK_TRANSITION_MS);
    },
    [isLeaving, router]
  );

  return (
    <main
      className={["figure-detail", isLeaving ? "is-leaving" : "", isEntered ? "is-entered" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="figure-detail__header">
        <a href="/figures" className="figure-detail__back" onClick={handleBack}>
          Back to Index
        </a>
      </header>

      <section className="figure-detail__content" aria-label={`${currentFigure.name} details`}>
        <figure className="figure-detail__media">
          <ImageReveal
            src={currentFigure.imageSrc}
            previewSrc={currentFigure.thumbSrc}
            alt={currentFigure.name}
            width={1240}
            height={1740}
            sizes="(max-width: 960px) 100vw, 56vw"
            priority
            revealOnView={false}
            wrapperClassName="figure-detail__media-reveal"
            imageClassName="figure-detail__media-img"
          />
        </figure>

        <article className="figure-detail__info">
          <p>{currentFigure.group}</p>
          <h1>{currentFigure.name}</h1>
          <h2>{currentFigure.caption}</h2>

          <div className="figure-detail__actions">
            <span>{`Photo ${figureOrdinal}`}</span>
            <a href="/figures" onClick={handleBack}>
              Back to Index
            </a>
            <a href={currentFigure.href} target="_blank" rel="noreferrer">
              Open Reference
            </a>
          </div>

          <dl>
            <div>
              <dt>Series</dt>
              <dd>{currentFigure.series}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{currentFigure.group}</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}
