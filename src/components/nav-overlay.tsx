"use client";

import type { CSSProperties } from "react";
import { SITE_CONFIG, type HeroSlide, type NavItem } from "@/data/site-config";

interface NavigationOverlayProps {
  navItems: NavItem[];
  isNavOpen: boolean;
  isDoorOpen: boolean;
  activeSlide: HeroSlide;
  onNavigate: (href: string) => void;
  onClose: () => void;
  onToggleDoor: () => void;
}

function MotionWord({ text }: { text: string }) {
  return (
    <span className="nav-overlay__word" aria-label={text}>
      {Array.from(text).map((letter, index) => (
        <span key={`${letter}-${index}`} style={{ "--letter": index } as CSSProperties} aria-hidden="true">
          {letter === " " ? "\u00a0" : letter}
        </span>
      ))}
    </span>
  );
}

export function NavigationOverlay({
  navItems,
  isNavOpen,
  isDoorOpen,
  activeSlide,
  onNavigate,
  onToggleDoor
}: NavigationOverlayProps) {
  return (
    <aside className="nav-overlay" aria-hidden={!isNavOpen}>
      <div className="nav-overlay__bg" />

      <div className="nav-overlay__inner">
        <div className="nav-overlay__list-panel">
          <p className="nav-overlay__top">Top</p>
          <ul className="nav-overlay__main-list">
            {navItems.map((item, index) => (
              <li key={item.id} style={{ "--stagger": index } as CSSProperties}>
                <a
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(item.href);
                  }}
                >
                  <MotionWord text={item.label} />
                </a>
              </li>
            ))}
          </ul>

          <ul className="nav-overlay__sub-list">
            <li>
              <a href="/contact" onClick={(event) => {
                event.preventDefault();
                onNavigate("/contact");
              }}>
                <MotionWord text={`Work with ${SITE_CONFIG.ownerName}`} />
              </a>
            </li>
            <li>
              <a href="/about" onClick={(event) => {
                event.preventDefault();
                onNavigate("/about");
              }}>
                <MotionWord text={`About ${SITE_CONFIG.brandName}`} />
              </a>
            </li>
          </ul>
        </div>

        <div className="nav-overlay__door-panel">
          <div className="nav-overlay__door-info">
            <h3>{activeSlide.title}</h3>
            <p>{activeSlide.subtitle}</p>
          </div>
          <div
            className="nav-overlay__door-image"
            style={{
              "--door-a": activeSlide.theme.bgA,
              "--door-b": activeSlide.theme.bgB
            } as CSSProperties}
          >
            <img src={activeSlide.imageSrc} alt={activeSlide.imageAlt} />
            <div className="nav-overlay__door-orb" />
          </div>
          <button className="nav-overlay__door-cta" type="button" onClick={() => onNavigate(activeSlide.ctaHref)}>
            {activeSlide.cta}
          </button>
        </div>
      </div>

      <button className="nav-overlay__mobile-door-toggle" type="button" onClick={onToggleDoor}>
        <span className="sr-only">Toggle door panel</span>
      </button>
    </aside>
  );
}
