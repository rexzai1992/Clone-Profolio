"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SITE_CONFIG, type NavItem } from "@/data/site-config";

interface AutoHideHeaderProps {
  navItems: NavItem[];
  isNavOpen: boolean;
  onToggleNav: () => void;
  onNavigate: (href: string) => void;
}

export function AutoHideHeader({
  navItems,
  isNavOpen,
  onToggleNav,
  onNavigate
}: AutoHideHeaderProps) {
  const [isHidden, setIsHidden] = useState(false);
  const lastYRef = useRef(0);
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isNavOpen) {
      setIsHidden(false);
      return;
    }

    const clearIdle = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastYRef.current;

      if (y < 10 || delta < -3) {
        setIsHidden(false);
      } else if (delta > 3) {
        setIsHidden(true);
      }

      clearIdle();
      idleTimerRef.current = window.setTimeout(() => {
        setIsHidden(false);
        idleTimerRef.current = null;
      }, 180);

      lastYRef.current = y;
    };

    lastYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearIdle();
      window.removeEventListener("scroll", onScroll);
    };
  }, [isNavOpen]);

  return (
    <motion.header
      className={`auto-header ${isNavOpen ? "is-open" : ""}`}
      animate={isHidden && !isNavOpen ? { y: "-102%", opacity: 0 } : { y: "0%", opacity: 1 }}
      transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        className="auto-header__brand"
        href="/"
        aria-label={SITE_CONFIG.brandName}
        onClick={(event) => {
          event.preventDefault();
          onNavigate("/");
        }}
      >
        <span className="auto-header__mark brand-mark" aria-hidden="true" />
        <span className="auto-header__name">{SITE_CONFIG.brandName}</span>
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
    </motion.header>
  );
}
