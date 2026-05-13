"use client";

import { SITE_CONFIG, type NavItem } from "@/data/site-config";

interface HeaderProps {
  navItems: NavItem[];
  isNavOpen: boolean;
  onToggleNav: () => void;
  onNavigate: (href: string) => void;
}

function getMonthAndYear() {
  const now = new Date();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(now);
  const year = now.getFullYear();
  return { month, year };
}

export function Header({ navItems, isNavOpen, onToggleNav, onNavigate }: HeaderProps) {
  const { month, year } = getMonthAndYear();

  return (
    <header className="site-header">
      <a href="/" className="site-header__brand" onClick={(event) => {
        event.preventDefault();
        onNavigate("/");
      }}>
        <span className="site-header__mark" aria-hidden="true">
          KX
        </span>
        <span className="site-header__name">{SITE_CONFIG.brandName}</span>
      </a>

      <nav className="site-header__desktop-nav" aria-label="Primary">
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

      <div className="site-header__meta">
        <p className="site-header__lang">EN</p>
        <small className="site-header__stamp">
          {month}
          <br />
          &copy;{year}
        </small>
      </div>

      <button
        className="site-header__toggle"
        type="button"
        aria-label={isNavOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isNavOpen}
        onClick={onToggleNav}
      >
        <span />
        <span />
      </button>
    </header>
  );
}
