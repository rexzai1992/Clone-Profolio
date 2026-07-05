"use client";

import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/data/site-config";

interface AutoHideHeaderProps {
  brandName: string;
  navItems: NavItem[];
  isNavOpen: boolean;
  forceHidden?: boolean;
  introReady?: boolean;
  tone?: "light" | "dark";
  onToggleNav: () => void;
  onNavigate: (href: string) => void;
}

export function AutoHideHeader({
  brandName,
  navItems,
  isNavOpen,
  forceHidden = false,
  introReady = true,
  onToggleNav,
  onNavigate
}: AutoHideHeaderProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [didIntroReveal, setDidIntroReveal] = useState(false);
  const lastYRef = useRef(0);

  useEffect(() => {
    if (isNavOpen) {
      setIsHidden(false);
      return;
    }

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastYRef.current;

      if (y < 10 || delta < -4) {
        setIsHidden(false);
      } else if (delta > 4) {
        setIsHidden(true);
      }

      lastYRef.current = y;
    };

    lastYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [isNavOpen]);

  const shouldShow = introReady && (isNavOpen || (!isHidden && !forceHidden));
  const useIntroTiming = introReady && !didIntroReveal;

  useEffect(() => {
    if (!shouldShow || !useIntroTiming) {
      return;
    }

    const timer = window.setTimeout(() => setDidIntroReveal(true), 900);
    return () => window.clearTimeout(timer);
  }, [shouldShow, useIntroTiming]);

  return (
    <header
      className={[
        "auto-header",
        isNavOpen ? "is-open" : "",
        shouldShow ? "is-shown" : "",
        useIntroTiming ? "is-intro" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a
        className="auto-header__brand"
        href="/"
        aria-label={brandName}
        onClick={(event) => {
          event.preventDefault();
          onNavigate("/");
        }}
      >
        <span className="auto-header__mark brand-mark" aria-hidden="true" />
        <span className="auto-header__name">{brandName}</span>
      </a>

      <nav className="auto-header__nav" aria-label="Primary">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
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
      </nav>

      <div className="auto-header__right">
        <span className="auto-header__lang">JA</span>
        <button
          className="auto-header__menu"
          type="button"
          aria-label={isNavOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isNavOpen}
          onClick={onToggleNav}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
