"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { SITE_CONFIG, type HeroSlide, type NavItem } from "@/data/site-config";
import { ImageReveal } from "@/components/image-reveal";

interface NavigationOverlayProps {
  navItems: NavItem[];
  isNavOpen: boolean;
  isDoorOpen: boolean;
  activeSlide: HeroSlide;
  onNavigate: (href: string) => void;
  onClose: () => void;
  onToggleDoor: () => void;
}

export function NavigationOverlay({
  navItems,
  isNavOpen,
  isDoorOpen,
  activeSlide,
  onNavigate,
  onClose,
  onToggleDoor
}: NavigationOverlayProps) {
  return (
    <AnimatePresence>
      {isNavOpen ? (
        <motion.aside
          className={`nav-overlay ${isDoorOpen ? "is-door-open" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden={!isNavOpen}
        >
          <motion.div
            className="nav-overlay__panel"
            initial={{ y: 18 }}
            animate={{ y: 0 }}
            exit={{ y: -12 }}
            transition={{ duration: 0.56, ease: [0.76, 0, 0.24, 1] }}
            style={
              {
                "--overlay-a": activeSlide.theme.bgA,
                "--overlay-b": activeSlide.theme.bgB
              } as CSSProperties
            }
          >
            <button className="nav-overlay__close" type="button" onClick={onClose} aria-label="Close navigation">
              Close
            </button>

            <div className="nav-overlay__col nav-overlay__col--left">
              <p className="nav-overlay__caption">{SITE_CONFIG.brandName}</p>
              <ul>
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <a
                      href={item.href}
                      onClick={(event) => {
                        event.preventDefault();
                        onNavigate(item.href);
                      }}
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="nav-overlay__col nav-overlay__col--right">
              <ImageReveal
                src={activeSlide.imageSrc}
                alt={activeSlide.imageAlt}
                width={920}
                height={1100}
                sizes="(max-width: 1024px) 100vw, 44vw"
                revealOnView={false}
                wrapperClassName="nav-overlay__preview"
                imageClassName="nav-overlay__preview-img"
              />
              <div className="nav-overlay__info">
                <strong>{activeSlide.title}</strong>
                <p>{activeSlide.subtitle}</p>
                <button type="button" onClick={() => onNavigate(activeSlide.ctaHref)}>
                  {activeSlide.cta}
                </button>
                <button className="nav-overlay__door-btn" type="button" onClick={onToggleDoor}>
                  Toggle focus mode
                </button>
              </div>
            </div>
          </motion.div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

