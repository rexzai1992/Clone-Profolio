"use client";

import type { CSSProperties } from "react";
import type { HeroSlide, NavItem } from "@/data/site-config";
import { ImageReveal } from "@/components/image-reveal";

interface NavigationOverlayProps {
  brandName: string;
  navItems: NavItem[];
  isNavOpen: boolean;
  isDoorOpen: boolean;
  activeSlide: HeroSlide;
  onNavigate: (href: string) => void;
  onToggleDoor: () => void;
}

export function NavigationOverlay({
  brandName,
  navItems,
  isNavOpen,
  isDoorOpen,
  activeSlide,
  onNavigate,
  onToggleDoor
}: NavigationOverlayProps) {
  return (
    <aside
      className={["nav-overlay", isNavOpen ? "is-open" : "", isDoorOpen ? "is-door-open" : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!isNavOpen}
    >
      <div
        className="nav-overlay__panel"
        style={
          {
            "--overlay-a": activeSlide.theme.bgA,
            "--overlay-b": activeSlide.theme.bgB
          } as CSSProperties
        }
      >
        <div className="nav-overlay__col nav-overlay__col--left">
          <div className="nav-overlay__mobile-meta" aria-hidden="true">
            <span>IF</span>
            <time dateTime="2026-09">Sep<br />©2026</time>
          </div>
          <p className="nav-overlay__caption"><span className="nav-overlay__caption-desktop">{brandName}</span><span className="nav-overlay__caption-mobile">Top</span></p>
          <ul>
            {navItems.map((item, index) => (
              <li key={item.id} style={{ "--i": index } as CSSProperties}>
                <a
                  href={item.href}
                  tabIndex={isNavOpen ? 0 : -1}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(item.href);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-overlay__mobile-footer">
            <a href="https://github.com/rexzai1992" target="_blank" rel="noreferrer" tabIndex={isNavOpen ? 0 : -1}>GitHub</a>
            <a href="/about" tabIndex={isNavOpen ? 0 : -1} onClick={(event) => { event.preventDefault(); onNavigate("/about"); }}>Resume</a>
            <a href="/contact" tabIndex={isNavOpen ? 0 : -1} onClick={(event) => { event.preventDefault(); onNavigate("/contact"); }}>Contact</a>
          </div>
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
            <button type="button" tabIndex={isNavOpen ? 0 : -1} onClick={() => onNavigate(activeSlide.ctaHref)}>
              {activeSlide.cta}
            </button>
            <button
              className="nav-overlay__door-btn"
              type="button"
              tabIndex={isNavOpen ? 0 : -1}
              onClick={onToggleDoor}
            >
              Toggle focus mode
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
