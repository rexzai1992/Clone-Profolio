"use client";

import { motion } from "framer-motion";
import { SITE_CONFIG } from "@/data/site-config";
import { InfiniteCarousel } from "@/components/infinite-carousel";
import { ImageReveal } from "@/components/image-reveal";

const cardViewport = { once: true, amount: 0.15, margin: "0px 0px -10% 0px" };

export function FiguresIndex() {
  return (
    <section id="figures" className="figures-page" aria-label="Collectible gallery">
      <InfiniteCarousel items={SITE_CONFIG.figures} />

      <div className="figures-page__content">
        <header className="figures-page__header">
          <motion.p
            className="figures-page__kicker"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={cardViewport}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Product Archive
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={cardViewport}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            Quiet premium collectible index.
          </motion.h2>
        </header>

        <div className="figures-page__grid">
          {SITE_CONFIG.figures.map((figure, index) => (
            <motion.article
              key={figure.id}
              className="figure-card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={cardViewport}
              transition={{
                duration: 0.62,
                delay: index * 0.04,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <a href={figure.href} onClick={(event) => event.preventDefault()}>
                <ImageReveal
                  src={figure.imageSrc}
                  alt={`${figure.name} collectible`}
                  width={860}
                  height={1160}
                  sizes="(max-width: 768px) 82vw, (max-width: 1280px) 42vw, 30vw"
                  wrapperClassName="figure-card__image-wrap"
                  imageClassName="figure-card__image"
                  delay={index * 0.03}
                />
              </a>
              <div className="figure-card__body">
                <p>{`${(index + 1).toString().padStart(2, "0")} / ${figure.series}`}</p>
                <h3>{figure.name}</h3>
                <span>{figure.caption}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

