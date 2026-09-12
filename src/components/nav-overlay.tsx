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
          <p className="nav-overlay__caption">{brandName}</p>
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
