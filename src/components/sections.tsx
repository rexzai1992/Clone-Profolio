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
          <a
            className="portfolio-card__cta"
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noreferrer" : undefined}
          >
            {item.cta}
          </a>
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
  if (line.startsWith("LINK: ")) {
    const [label, href] = line.slice(6).split(" | ");
    const external = href?.startsWith("http");
    return (
      <a className="contact-link" href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
        {label}
      </a>
    );
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

function groupAboutLines(lines: string[]) {
  const groups: Array<{ title: string; lines: string[] }> = [];
  let current: { title: string; lines: string[] } | null = null;

  lines.forEach((line) => {
    if (line.startsWith("## ")) {
      current = { title: line.slice(3), lines: [] };
      groups.push(current);
      return;
    }

    if (!current) {
      current = { title: "Profile", lines: [] };
      groups.push(current);
    }
    current.lines.push(line);
  });

  return groups;
}

export function PageSections({ only }: { only?: PageSectionId }) {
  const { site } = useSiteContent();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [newsTitle, newsSubtitle, ...newsBody] = site.sections.news.lines ?? [];
  const aboutGroups = groupAboutLines(site.sections.about.lines ?? []);
  const aboutImage = site.sections.about.imageSrc ?? site.heroSlides[0]?.imageSrc;
  const contactLines = site.sections.contact.lines ?? [];
  const contactTitle = contactLines.find((line) => line.startsWith("## "))?.slice(3) ?? "Start a conversation";
  const contactCopy = contactLines.find((line) => !/^(## |### |LINK: |FIELD: |UPLOAD: |SUBMIT: |THANKS: )/.test(line));
  const contactLinks = contactLines
    .filter((line) => line.startsWith("LINK: "))
    .map((line) => {
      const [label, href] = line.slice(6).split(" | ");
      return { label, href };
    });
  const contactLocation = contactLines.find(
    (line) => !line.startsWith("LINK: ") && line !== contactCopy && !line.startsWith("## ") && !line.startsWith("### ")
  );
  const contactImage = site.heroSlides[2]?.imageSrc ?? aboutImage;

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
          <div className="resume-hero">
            <div className="resume-hero__copy">
              <Reveal as="p" className="section__kicker about-profile__kicker" delay={0.06}>
                {site.sections.about.kicker}
              </Reveal>
              <Reveal as="h2" className="resume-hero__heading" delay={0.12}>
                {site.sections.about.heading}
              </Reveal>
              <Reveal as="p" className="resume-hero__lead" delay={0.16}>
                {site.sections.about.lead}
              </Reveal>
              <Reveal className="resume-hero__status" delay={0.2}>
                <span className="resume-hero__status-dot" aria-hidden="true" />
                Available for selected projects · Malaysia / Remote
              </Reveal>
            </div>

            <div className="resume-hero__visual" aria-hidden={!aboutImage}>
              {aboutImage ? (
                <ImageReveal
                  src={aboutImage}
                  alt={site.sections.about.imageAlt ?? `${site.ownerName} profile artwork`}
                  fill
                  sizes="(max-width: 900px) 100vw, 42vw"
                  wrapperClassName="resume-hero__image-wrap"
                  imageClassName="resume-hero__image"
                  delay={0.08}
                />
              ) : null}
              <span className="resume-hero__visual-label">KAYNX1 / PROFILE 01</span>
            </div>
            <p className="resume-hero__monogram" aria-hidden="true">KX</p>
          </div>

          {aboutGroups.length ? (
            <Reveal className="resume-layout" delay={0.18}>
              <aside className="resume-aside">
                <p className="resume-aside__label">Profile / 2026</p>
                <p className="resume-aside__statement">I turn operational problems into software people can actually use.</p>
                <div className="resume-aside__links">
                  <a href="mailto:izzul@2fast.xyz">Email me <span>↗</span></a>
                  <a href="https://github.com/rexzai1992" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
                </div>
              </aside>
              <div className="resume-list">
                {aboutGroups.map((group, groupIndex) => (
                  <article className="resume-entry" key={group.title} data-kind={groupIndex === 0 ? "experience" : "detail"}>
                    <p className="resume-entry__index">{String(groupIndex + 1).padStart(2, "0")}</p>
                    <h3>{group.title}</h3>
                    <div className="resume-entry__body">
                      {group.lines.map((line, index) => (
                        <ContactLine key={`${line}-${index}`} line={line} />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </Reveal>
          ) : null}
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
          <div className="contact-hero">
            <div className="contact-hero__copy">
              <Reveal as="p" className="section__kicker contact-hero__kicker" delay={0.06}>
                {site.sections.contact.kicker} / Available now
              </Reveal>
              <Reveal as="h2" className="contact-hero__heading" delay={0.12}>
                {site.sections.contact.heading}
              </Reveal>
              {site.sections.contact.lead ? (
                <Reveal as="p" className="contact-hero__lead" delay={0.16}>
                  {site.sections.contact.lead}
                </Reveal>
              ) : null}
              <Reveal className="contact-hero__availability" delay={0.2}>
                <span aria-hidden="true" /> Usually replies within 24 hours
              </Reveal>
            </div>
            <div className="contact-hero__visual" aria-hidden={!contactImage}>
              {contactImage ? (
                <ImageReveal
                  src={contactImage}
                  alt="Kaynx1 creative technology workspace illustration"
                  fill
                  sizes="(max-width: 900px) 100vw, 45vw"
                  wrapperClassName="contact-hero__image-wrap"
                  imageClassName="contact-hero__image"
                  delay={0.1}
                />
              ) : null}
              <span>KX / CONTACT</span>
            </div>
          </div>

          <Reveal className="contact-directory" delay={0.16}>
            <div className="contact-directory__intro">
              <p className="contact-directory__eyebrow">{contactTitle}</p>
              {contactCopy ? <p>{contactCopy}</p> : null}
              {contactLocation ? <span>{contactLocation}</span> : null}
            </div>
            <div className="contact-directory__links">
              {contactLinks.map(({ label, href }, index) => (
                <a href={href} key={`${label}-${href}`} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
                  <span className="contact-directory__index">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{label}</strong>
                  <span className="contact-directory__arrow">↗</span>
                </a>
              ))}
            </div>
          </Reveal>
        </section>
      ) : null}
    </div>
  );
}
