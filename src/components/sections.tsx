"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { PortfolioItem } from "@/data/site-config";
import { ImageReveal } from "@/components/image-reveal";
import { useSiteContent } from "@/context/site-content-context";

export type PageSectionId = "featured" | "games" | "dev" | "news" | "about" | "contact";

function shouldRender(only: PageSectionId | undefined, sectionId: PageSectionId) {
  return !only || only === sectionId;
}

function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0
}: {
  children: ReactNode;
  as?: "div" | "p" | "h2";
  className?: string;
  delay?: number;
}) {
  return (
    <Tag
      className={`scroll-reveal ${className}`.trim()}
      data-reveal
      style={delay ? ({ transitionDelay: `${delay}s, ${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

function PortfolioCard({ item, index }: { item: PortfolioItem; index: number }) {
  return (
    <Reveal className="portfolio-card-wrap" delay={index * 0.12}>
      <article className="portfolio-card" data-type={item.type}>
        <div className="portfolio-card__media">
          <ImageReveal
            src={item.imageSrc}
            alt={item.imageAlt}
            width={1280}
            height={720}
            sizes="(max-width: 1024px) 100vw, 50vw"
            wrapperClassName="portfolio-card__image-wrap"
            imageClassName="portfolio-card__image"
            delay={0.06 + index * 0.08}
          />
        </div>
        <div className="portfolio-card__body">
          <p className="portfolio-card__label">{`${(index + 1).toString().padStart(2, "0")} / ${item.type}`}</p>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          <ul>
            {item.stack.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <button type="button">{item.cta}</button>
        </div>
      </article>
    </Reveal>
  );
}

function ContactLine({ line }: { line: string }) {
  if (line.startsWith("## ")) {
    return <h3>{line.slice(3)}</h3>;
  }
  if (line.startsWith("### ")) {
    return <h4>{line.slice(4)}</h4>;
  }
  if (line.startsWith("FIELD: ")) {
    return (
      <label className="contact-form-field">
        <span>{line.slice(7)}</span>
        <input disabled aria-label={line.slice(7)} />
      </label>
    );
  }
  if (line.startsWith("UPLOAD: ")) {
    return (
      <label className="contact-form-field contact-form-field--upload">
        <span>{line.slice(8)}</span>
        <input disabled aria-label={line.slice(8)} />
      </label>
    );
  }
  if (line.startsWith("SUBMIT: ")) {
    return (
      <button className="contact-submit" type="button" disabled>
        {line.slice(8)}
      </button>
    );
  }
  if (line.startsWith("THANKS: ")) {
    const [title, message] = line.slice(8).split(" / ");
    return (
      <div className="contact-thanks">
        <strong>{title}</strong>
        {message ? <span>{message}</span> : null}
      </div>
    );
  }

  return <p>{line}</p>;
}

export function PageSections({ only }: { only?: PageSectionId }) {
  const { site } = useSiteContent();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [newsTitle, newsSubtitle, ...newsBody] = site.sections.news.lines ?? [];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const revealNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!revealNodes.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
            return;
          }
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: [0, 0.2, 0.6] }
    );

    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [only]);

  return (
    <div ref={rootRef}>
      {shouldRender(only, "featured") ? (
        <section id="featured" className="section section--featured">
          <header className="section__header">
            <Reveal as="p" className="section__kicker" delay={0.06}>
              {site.sections.featured.kicker}
            </Reveal>
            <Reveal as="h2" delay={0.12}>
              {site.sections.featured.heading}
            </Reveal>
          </header>
          <div className="section__grid section__grid--2">
            {site.featured.map((item, index) => (
              <PortfolioCard item={item} key={item.id} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "games") ? (
        <section id="games" className="section">
          <header className="section__header">
            <Reveal as="p" className="section__kicker" delay={0.06}>
              {site.sections.games.kicker}
            </Reveal>
            <Reveal as="h2" delay={0.12}>
              {site.sections.games.heading}
            </Reveal>
          </header>
          <div className="section__grid section__grid--2">
            {site.games.map((item, index) => (
              <PortfolioCard item={item} key={item.id} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "dev") ? (
        <section id="dev" className="section">
          <header className="section__header">
            <Reveal as="p" className="section__kicker" delay={0.06}>
              {site.sections.dev.kicker}
            </Reveal>
            <Reveal as="h2" delay={0.12}>
              {site.sections.dev.heading}
            </Reveal>
          </header>
          <div className="section__grid section__grid--2">
            {site.devs.map((item, index) => (
              <PortfolioCard item={item} key={item.id} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "about") ? (
        <section id="about" className="section section--about">
          <header className="section__header">
            <Reveal as="p" className="section__kicker" delay={0.06}>
              {site.sections.about.kicker}
            </Reveal>
            <Reveal as="h2" delay={0.12}>
              {site.sections.about.heading}
            </Reveal>
          </header>
          <Reveal as="p" className="section__lead" delay={0.14}>
            {site.sections.about.lead}
          </Reveal>
        </section>
      ) : null}

      {shouldRender(only, "news") ? (
        <section id="news" className="section section--news">
          <header className="section__header">
            <Reveal as="p" className="section__kicker" delay={0.06}>
              {site.sections.news.kicker}
            </Reveal>
            <Reveal as="h2" delay={0.12}>
              {site.sections.news.heading}
            </Reveal>
          </header>
          <Reveal className="news-panel" delay={0.1}>
            {site.sections.news.lead ? <p className="news-panel__date">{site.sections.news.lead}</p> : null}
            {newsTitle ? <h3>{newsTitle.replace(/^##\s+/, "")}</h3> : null}
            {site.sections.news.imageSrc ? (
              <figure className="news-panel__figure">
                <ImageReveal
                  src={site.sections.news.imageSrc}
                  alt={site.sections.news.imageAlt ?? newsTitle ?? site.sections.news.heading}
                  width={1280}
                  height={720}
                  sizes="(max-width: 1024px) 100vw, 720px"
                  wrapperClassName="news-panel__image-wrap"
                  imageClassName="news-panel__image"
                />
              </figure>
            ) : null}
            {newsSubtitle ? <h4>{newsSubtitle}</h4> : null}
            {newsBody.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </Reveal>
        </section>
      ) : null}

      {shouldRender(only, "contact") ? (
        <section id="contact" className="section section--contact">
          <header className="section__header">
            <Reveal as="p" className="section__kicker" delay={0.06}>
              {site.sections.contact.kicker}
            </Reveal>
            <Reveal as="h2" delay={0.12}>
              {site.sections.contact.heading}
            </Reveal>
          </header>
          {site.sections.contact.lead ? (
            <Reveal as="p" className="section__lead" delay={0.14}>
              {site.sections.contact.lead}
            </Reveal>
          ) : null}
          <Reveal className="contact-panel" delay={0.1}>
            {(site.sections.contact.lines ?? []).map((line, index) => (
              <ContactLine key={`${line}-${index}`} line={line} />
            ))}
          </Reveal>
        </section>
      ) : null}
    </div>
  );
}
