"use client";

import { SITE_CONFIG, type PortfolioItem } from "@/data/site-config";

export type PageSectionId = "featured" | "games" | "dev" | "about" | "contact";

function shouldRender(only: PageSectionId | undefined, sectionId: PageSectionId) {
  return !only || only === sectionId;
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <article className="portfolio-card" data-type={item.type} data-inview>
      <div className="portfolio-card__media">
        <img src={item.imageSrc} alt={item.imageAlt} loading="lazy" />
      </div>
      <div className="portfolio-card__body">
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
  );
}

export function PageSections({ only }: { only?: PageSectionId }) {
  return (
    <>
      {shouldRender(only, "featured") ? (
        <section id="featured" className="section section--featured" data-inview>
          <header className="section__header">
            <p className="section__kicker">Featured</p>
            <h2>Signature Work</h2>
          </header>
          <div className="section__grid section__grid--2">
            {SITE_CONFIG.featured.map((item) => (
              <PortfolioCard item={item} key={item.id} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "games") ? (
        <section id="games" className="section" data-inview>
          <header className="section__header">
            <p className="section__kicker">Game Projects</p>
            <h2>Playable Direction</h2>
          </header>
          <div className="section__grid section__grid--2">
            {SITE_CONFIG.games.map((item) => (
              <PortfolioCard item={item} key={item.id} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "dev") ? (
        <section id="dev" className="section" data-inview>
          <header className="section__header">
            <p className="section__kicker">Dev Projects</p>
            <h2>Production Engineering</h2>
          </header>
          <div className="section__grid section__grid--2">
            {SITE_CONFIG.devs.map((item) => (
              <PortfolioCard item={item} key={item.id} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "about") ? (
        <section id="about" className="section section--about" data-inview>
          <header className="section__header">
            <p className="section__kicker">About Izzul</p>
            <h2>Cinematic UX with delivery-first engineering.</h2>
          </header>
          <p className="section__lead">
            Kaynx1 is the portfolio direction for {SITE_CONFIG.ownerName}. This phase keeps a high-fidelity
            motion language inspired by the reference and leaves media slots ready for your own visuals.
          </p>
        </section>
      ) : null}

      {shouldRender(only, "contact") ? (
        <section id="contact" className="section section--contact" data-inview>
          <header className="section__header">
            <p className="section__kicker">Contact</p>
            <h2>Let&apos;s build something serious.</h2>
          </header>
          <div className="contact-panel">
            <p>Email placeholder</p>
            <p>Discord placeholder</p>
            <p>Location placeholder</p>
          </div>
        </section>
      ) : null}
    </>
  );
}
