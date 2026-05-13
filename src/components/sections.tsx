"use client";

import { motion } from "framer-motion";
import { SITE_CONFIG, type PortfolioItem } from "@/data/site-config";
import { ImageReveal } from "@/components/image-reveal";

export type PageSectionId = "featured" | "games" | "dev" | "about" | "contact";

function shouldRender(only: PageSectionId | undefined, sectionId: PageSectionId) {
  return !only || only === sectionId;
}

const sectionViewport = { once: true, amount: 0.2, margin: "0px 0px -10% 0px" };
const EASE_SOFT = [0.22, 1, 0.36, 1] as const;

function sectionTitleMotion(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: sectionViewport,
    transition: { duration: 0.65, delay, ease: EASE_SOFT }
  };
}

function PortfolioCard({ item, index }: { item: PortfolioItem; index: number }) {
  return (
    <motion.article
      className="portfolio-card"
      data-type={item.type}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={sectionViewport}
      transition={{
        duration: 0.65,
        delay: index * 0.12,
        ease: EASE_SOFT
      }}
    >
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
    </motion.article>
  );
}

export function PageSections({ only }: { only?: PageSectionId }) {
  return (
    <>
      {shouldRender(only, "featured") ? (
        <section id="featured" className="section section--featured">
          <header className="section__header">
            <motion.p className="section__kicker" {...sectionTitleMotion(0.06)}>
              Featured
            </motion.p>
            <motion.h2 {...sectionTitleMotion(0.12)}>Signature Work</motion.h2>
          </header>
          <div className="section__grid section__grid--2">
            {SITE_CONFIG.featured.map((item, index) => (
              <PortfolioCard item={item} key={item.id} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "games") ? (
        <section id="games" className="section">
          <header className="section__header">
            <motion.p className="section__kicker" {...sectionTitleMotion(0.06)}>
              Game Projects
            </motion.p>
            <motion.h2 {...sectionTitleMotion(0.12)}>Playable Direction</motion.h2>
          </header>
          <div className="section__grid section__grid--2">
            {SITE_CONFIG.games.map((item, index) => (
              <PortfolioCard item={item} key={item.id} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "dev") ? (
        <section id="dev" className="section">
          <header className="section__header">
            <motion.p className="section__kicker" {...sectionTitleMotion(0.06)}>
              Dev Projects
            </motion.p>
            <motion.h2 {...sectionTitleMotion(0.12)}>Production Engineering</motion.h2>
          </header>
          <div className="section__grid section__grid--2">
            {SITE_CONFIG.devs.map((item, index) => (
              <PortfolioCard item={item} key={item.id} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "about") ? (
        <section id="about" className="section section--about">
          <header className="section__header">
            <motion.p className="section__kicker" {...sectionTitleMotion(0.06)}>
              About mimeyoi
            </motion.p>
            <motion.h2 {...sectionTitleMotion(0.12)}>
              Figure brand crafting detailed collectible worlds.
            </motion.h2>
          </header>
          <motion.p
            className="section__lead"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={sectionViewport}
            transition={{ duration: 0.65, delay: 0.14, ease: EASE_SOFT }}
          >
            MIMEYOI presents premium scale figures with cinematic presentation. This page keeps the
            reference motion tone and minimalist structure for product-focused storytelling.
          </motion.p>
        </section>
      ) : null}

      {shouldRender(only, "contact") ? (
        <section id="contact" className="section section--contact">
          <header className="section__header">
            <motion.p className="section__kicker" {...sectionTitleMotion(0.06)}>
              Contact
            </motion.p>
            <motion.h2 {...sectionTitleMotion(0.12)}>Let&apos;s build something serious.</motion.h2>
          </header>
          <motion.div
            className="contact-panel"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={sectionViewport}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_SOFT }}
          >
            <p>Email placeholder</p>
            <p>Discord placeholder</p>
            <p>Location placeholder</p>
          </motion.div>
        </section>
      ) : null}
    </>
  );
}
