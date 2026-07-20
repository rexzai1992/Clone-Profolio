"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ImageReveal } from "@/components/image-reveal";
import type { PortfolioItem } from "@/data/site-config";

interface PortfolioDetailViewProps {
  item: PortfolioItem;
  nextItem: PortfolioItem;
  index: number;
  total: number;
}

const LEAVE_MS = 420;

export function PortfolioDetailView({ item, nextItem, index, total }: PortfolioDetailViewProps) {
  const router = useRouter();
  const timerRef = useRef<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const category = item.type === "game" ? "Interactive Game" : "Development";

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setEntered(true)));
    return () => {
      window.cancelAnimationFrame(raf);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const navigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      if (leaving) return;
      setLeaving(true);
      timerRef.current = window.setTimeout(() => router.push(href, { transitionTypes: ["figure-open"] }), LEAVE_MS);
    },
    [leaving, router]
  );

  return (
    <main className={`case-study ${entered ? "is-entered" : ""} ${leaving ? "is-leaving" : ""}`}>
      <header className="case-study__header">
        <a href="/" aria-label="Kaynx1 home" onClick={(event) => navigate(event, "/")}>
          <BrandLogo />
          <span>KAYNX1</span>
        </a>
        <a href="/dev" onClick={(event) => navigate(event, "/dev")}>Back to portfolio</a>
      </header>

      <section className="case-study__hero">
        <div className="case-study__intro">
          <p className="case-study__eyebrow">{category} · {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</p>
          <h1>{item.title}</h1>
          <p className="case-study__summary">{item.summary}</p>
          <ul aria-label="Technologies used">
            {item.stack.map((technology) => <li key={technology}>{technology}</li>)}
          </ul>
          <a className="case-study__primary" href={item.href} target="_blank" rel="noreferrer">
            {item.cta} <span>↗</span>
          </a>
        </div>
        <figure className="case-study__media">
          <ImageReveal
            src={item.imageSrc}
            alt={item.imageAlt}
            width={1600}
            height={1000}
            sizes="(max-width: 900px) 100vw, 56vw"
            priority
            revealOnView={false}
            wrapperClassName="case-study__image-wrap"
            imageClassName="case-study__image"
          />
        </figure>
      </section>

      <section className="case-study__details" aria-label="Project overview">
        <p className="case-study__section-index">01 / Overview</p>
        <div>
          <h2>{item.type === "game" ? "An experience designed around movement." : "A practical system built around real work."}</h2>
          <p>{item.summary}</p>
        </div>
        <dl>
          <div><dt>Role</dt><dd>{item.type === "game" ? "Interaction design & development" : "Product development & technical delivery"}</dd></div>
          <div><dt>Focus</dt><dd>{item.stack.join(" · ")}</dd></div>
          <div><dt>Delivery</dt><dd>{item.type === "game" ? "Live browser experience" : "Application / source project"}</dd></div>
        </dl>
      </section>

      <a className="case-study__next" href={`/portfolio/${nextItem.id}`} onClick={(event) => navigate(event, `/portfolio/${nextItem.id}`)}>
        <span>Next {nextItem.type === "game" ? "game" : "project"}</span>
        <strong>{nextItem.title}</strong>
        <span aria-hidden="true">→</span>
      </a>
    </main>
  );
}
