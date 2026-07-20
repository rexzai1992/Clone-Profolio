export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface HeroSlide {
  id: string;
  status: string;
  title: string;
  subtitle: string;
  detailA: string;
  detailB: string;
  cta: string;
  ctaHref: string;
  imageSrc: string;
  imagePreviewSrc?: string;
  imageMobileSrc?: string;
  imageAlt: string;
  theme: {
    bgA: string;
    bgB: string;
    accent: string;
  };
}

export interface PortfolioItem {
  id: string;
  type: "game" | "dev";
  title: string;
  summary: string;
  stack: string[];
  cta: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

export interface FigureItem {
  id: string;
  group: "Featured Work" | "Selected Systems" | "Development" | "Interactive Games";
  href: string;
  externalHref: string;
  color: string;
  whiteText: boolean;
  thumbSrc: string;
  imageSrc: string;
  series: string;
  name: string;
  caption: string;
}

export interface SectionContent {
  kicker: string;
  heading: string;
  lead?: string;
  lines?: string[];
  imageSrc?: string;
  imageAlt?: string;
}

export interface SiteConfig {
  brandName: string;
  ownerName: string;
  heroSpeedSeconds: number;
  navItems: NavItem[];
  heroSlides: HeroSlide[];
  figures: FigureItem[];
  featured: PortfolioItem[];
  games: PortfolioItem[];
  devs: PortfolioItem[];
  sections: {
    featured: SectionContent;
    games: SectionContent;
    dev: SectionContent;
    news: SectionContent;
    about: SectionContent;
    contact: SectionContent;
  };
}

const HERO_IMAGE = "/images/kaynx1-hero-anime.png";
const GAMES_IMAGE = "/images/kaynx1-games.png";
const SERVICES_IMAGE = "/images/kaynx1-services.png";
const HERO_ANIME_IMAGE = HERO_IMAGE;
const GAMES_HERO_ANIME_IMAGE = "/images/kaynx1-camera-hero-anime-v2.png";
const SERVICES_HERO_ANIME_IMAGE = "/images/kaynx1-hardware-hero-anime.png";

export const SITE_CONFIG: SiteConfig = {
  brandName: "KAYNX1",
  ownerName: "Izzul Fitree",
  heroSpeedSeconds: 6,
  navItems: [
    { id: "top", label: "Home", href: "/" },
    { id: "portfolio", label: "Portfolio", href: "/dev" },
    { id: "about", label: "Resume", href: "/about" },
    { id: "contact", label: "Contact", href: "/contact" }
  ],
  heroSlides: [
    {
      id: "kaynx1-intro",
      status: "Open to work · Malaysia",
      title: "KAYNX1",
      subtitle: "Technical Product Developer",
      detailA: "AI automation · Computer vision · Interactive systems",
      detailB: "Designing, building, deploying and supporting real products",
      cta: "View selected work",
      ctaHref: "/dev",
      imageSrc: HERO_ANIME_IMAGE,
      imageMobileSrc: HERO_ANIME_IMAGE,
      imageAlt: "Anime illustration of the Kaynx1 technical creator with a laptop, camera and projector",
      theme: { bgA: "#07090d", bgB: "#182338", accent: "#f4f7ff" }
    },
    {
      id: "ai-genius",
      status: "10 live interactive demos",
      title: "AI GENIUS",
      subtitle: "Camera-powered interactive experiences",
      detailA: "Camera vision · Motion capture · AR · Realtime play",
      detailB: "Building and documenting interactive systems for real spaces",
      cta: "Explore the games",
      ctaHref: "/dev",
      imageSrc: GAMES_HERO_ANIME_IMAGE,
      imageMobileSrc: GAMES_HERO_ANIME_IMAGE,
      imageAlt: "Anime illustration of the Kaynx1 creator using a professional mirrorless camera",
      theme: { bgA: "#0d121a", bgB: "#24344f", accent: "#eef4ff" }
    },
    {
      id: "services",
      status: "Software · Hardware · Support",
      title: "BUILD BETTER",
      subtitle: "Practical technology that keeps work moving",
      detailA: "PC hardware · Business apps · Integrations · Deployment",
      detailB: "From component-level fixes to production-ready systems",
      cta: "View services",
      ctaHref: "https://izzul.xyz/",
      imageSrc: SERVICES_HERO_ANIME_IMAGE,
      imageMobileSrc: SERVICES_HERO_ANIME_IMAGE,
      imageAlt: "Anime illustration of the Kaynx1 creator repairing an open desktop computer",
      theme: { bgA: "#080a10", bgB: "#1a2340", accent: "#ffffff" }
    }
  ],
  figures: [
    {
      id: "ai-genius",
      group: "Featured Work",
      href: "/figures/ai-genius/",
      externalHref: "https://aigenius.pages.dev/",
      color: "#17263f",
      whiteText: true,
      thumbSrc: "/images/games/aether-mirror.jpg",
      imageSrc: GAMES_IMAGE,
      series: "INTERACTIVE AI",
      name: "AI Genius",
      caption: "Ten live vision, motion and music experiences"
    },
    {
      id: "custom-apps",
      group: "Featured Work",
      href: "/figures/custom-apps/",
      externalHref: "https://izzul.xyz/",
      color: "#19345c",
      whiteText: true,
      thumbSrc: SERVICES_IMAGE,
      imageSrc: SERVICES_IMAGE,
      series: "PRODUCT DEVELOPMENT",
      name: "Custom Applications",
      caption: "Operational software, automation and integrations"
    },
    {
      id: "vps-deck",
      group: "Selected Systems",
      href: "/figures/vps-deck/",
      externalHref: "https://github.com/rexzai1992/Vps-Deck-Main",
      color: "#101820",
      whiteText: true,
      thumbSrc: HERO_IMAGE,
      imageSrc: HERO_IMAGE,
      series: "INFRASTRUCTURE",
      name: "VPS Deck",
      caption: "Server operations made as easy as a click"
    },
    {
      id: "tailgate-cctv",
      group: "Selected Systems",
      href: "/figures/tailgate-cctv/",
      externalHref: "https://github.com/rexzai1992/Tailgate-CCTV",
      color: "#223047",
      whiteText: true,
      thumbSrc: "/images/games/face-analysis.jpg",
      imageSrc: "/images/games/face-analysis.jpg",
      series: "COMPUTER VISION",
      name: "Tailgate CCTV",
      caption: "Vision-assisted entry and safety monitoring"
    }
  ],
  featured: [
    {
      id: "featured-ai-genius",
      type: "game",
      title: "AI Genius",
      summary: "A live portfolio of ten browser-based interactive experiences using body, hand, face, motion, AR and music input.",
      stack: ["Computer Vision", "Realtime", "Web Games"],
      cta: "Open live showcase",
      href: "https://aigenius.pages.dev/",
      imageSrc: GAMES_IMAGE,
      imageAlt: "AI Genius live interactive demo showcase"
    },
    {
      id: "featured-services",
      type: "dev",
      title: "Custom App Development",
      summary: "Premium applications and automation for teams that need better operations, clearer workflows and faster product delivery.",
      stack: ["Next.js", "APIs", "Cloudflare", "Automation"],
      cta: "View services",
      href: "https://izzul.xyz/",
      imageSrc: SERVICES_IMAGE,
      imageAlt: "Kaynx1 custom application development service"
    }
  ],
  games: [
    ["body-shape", "Body Shape Challenge", "Interactive body-tracking movement challenge.", "Pose Tracking", "https://body-shape-challenge.pages.dev", "body-shape-challenge"],
    ["hand-particle", "Hand Particle", "Hand-controlled particle interaction demo.", "Hand Tracking", "https://hand-partical.pages.dev", "hand-partical"],
    ["aether-mirror", "Aether Mirror", "Futuristic mirror-style realtime AI visual experience.", "AI Mirror", "https://mecha-mirror.pages.dev/", "aether-mirror"],
    ["face-analysis", "Face Analysis", "Realtime facial detection and visual intelligence demo.", "Face AI", "https://face-analysis.pages.dev", "face-analysis"],
    ["rhythm-arena", "Rhythm Arena", "Motion and timing-based rhythm interaction experience.", "Rhythm Game", "https://rhythem-area.pages.dev", "rhythem-arena"],
    ["fruit-ninja", "Fruit Ninja", "Fast motion-based slicing game experience.", "Motion Game", "https://fruit-ninja-3fe.pages.dev", "fruit-ninja"],
    ["air-harp", "Air Harp", "A virtual harp controlled through hand movement.", "Music Interaction", "https://musical-air-harp.pages.dev", "air-harp"],
    ["ar-goalkeeper", "AR Goal Keeper", "An augmented-reality goalkeeping challenge.", "AR Experience", "https://ar-goal-keeper.pages.dev/", "ar-goal-keeper"],
    ["archery", "3D Archery", "Tournament-style 3D archery aiming and pull challenge.", "Sports Game", "https://3darchery.pages.dev/", "3d-archery"],
    ["bowling", "3D Bowling", "A 3D bowling challenge with smooth aim-and-roll play.", "Sports Game", "https://3d-bowling-2qz.pages.dev", "3d-bowling"]
  ].map(([id, title, summary, category, href, image]) => ({
    id,
    type: "game" as const,
    title,
    summary,
    stack: [category, "Realtime", "Interactive Web"],
    cta: "Play live",
    href,
    imageSrc: `/images/games/${image}.jpg`,
    imageAlt: `${title} interactive game preview`
  })),
  devs: [
    {
      id: "dev-2fast",
      type: "dev",
      title: "2Fast WhatsApp Automation",
      summary: "Multi-tenant WhatsApp Business automation with onboarding, campaigns, templates, webhooks and lead management.",
      stack: ["React", "TypeScript", "PostgreSQL", "Meta Cloud API"],
      cta: "View platform",
      href: "https://2fast.xyz/",
      imageSrc: SERVICES_IMAGE,
      imageAlt: "2Fast WhatsApp automation platform"
    },
    {
      id: "dev-vps-deck",
      type: "dev",
      title: "VPS Deck",
      summary: "A visual control plane that makes VPS monitoring and day-to-day server operations accessible.",
      stack: ["Go", "Linux", "Monitoring", "Automation"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/Vps-Deck-Main",
      imageSrc: HERO_IMAGE,
      imageAlt: "VPS Deck infrastructure management project"
    },
    {
      id: "dev-photobooth",
      type: "dev",
      title: "Event Photobooth Platform",
      summary: "Automated capture, branded output, QR retrieval and print workflows designed for events and attractions.",
      stack: ["TypeScript", "Camera", "QR Workflow", "Printing"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/Photobooth-2fast.xyz",
      imageSrc: "/images/games/aether-mirror.jpg",
      imageAlt: "Interactive event photobooth experience"
    },
    {
      id: "dev-tailgate",
      type: "dev",
      title: "Tailgate CCTV",
      summary: "Computer-vision monitoring for entry flows, occupancy behaviour and tailgating events.",
      stack: ["Python", "OpenCV", "Tracking", "CCTV"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/Tailgate-CCTV",
      imageSrc: "/images/games/face-analysis.jpg",
      imageAlt: "Computer vision security monitoring project"
    },
    {
      id: "dev-nric",
      type: "dev",
      title: "NRIC Reader Integration",
      summary: "A practical hardware and software bridge for reading Malaysian identity cards through ACS devices.",
      stack: ["Python", "Smart Card", "Hardware", "Desktop"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/NRIC-Reader-ACS-Driver-",
      imageSrc: HERO_IMAGE,
      imageAlt: "Smart card reader hardware integration"
    },
    {
      id: "dev-agentportal",
      type: "dev",
      title: "Agent Portal",
      summary: "A TypeScript product workspace built around streamlined customer and operational workflows.",
      stack: ["TypeScript", "Product UI", "APIs", "Operations"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/Agentportal",
      imageSrc: SERVICES_IMAGE,
      imageAlt: "Agent Portal product interface"
    }
  ],
  sections: {
    featured: { kicker: "Selected", heading: "Signature Work" },
    games: { kicker: "Interactive Portfolio", heading: "Games That Respond To You" },
    dev: { kicker: "Development", heading: "Systems Built For Real Work" },
    news: {
      kicker: "Now",
      heading: "Building Across Software And Space",
      lead: "2026",
      imageSrc: HERO_IMAGE,
      imageAlt: "Kaynx1 technology installation concept",
      lines: [
        "## Available for ambitious technical work",
        "AI automation, interactive installations and product engineering",
        "Kaynx1 brings software, devices and real-world operations together.",
        "Current work spans computer vision, messaging platforms, kiosks, access systems and interactive experiences."
      ]
    },
    about: {
      kicker: "Resume",
      heading: "Izzul Fitree — Technical Product Developer",
      lead: "I design, build, deploy and support software platforms and physical technology installations, combining engineering depth with practical product and business instincts.",
      imageSrc: HERO_ANIME_IMAGE,
      imageAlt: "Anime illustration of Izzul Fitree as the Kaynx1 technical creator",
      lines: [
        "## Experience",
        "### Product Developer / Technical Support — Crave Asia Sdn Bhd",
        "January 2025 — Present · AI solutions, automation workflows, kiosks, POS, payment terminals, access control, projection mapping, product demos and technical support.",
        "### Marketing Executive / Technical Operations Support — Kiddo Heritage Sdn Bhd",
        "December 2024 — Present · Digital campaigns, theme-park operations, arcade and attraction support, events, ticketing and visitor-experience improvements.",
        "## Core skills",
        "AI automation · React · TypeScript · Node.js · Python · PostgreSQL · OpenCV · MediaPipe · WhatsApp Business API · Telegram bots · Cloudflare · Hardware integration",
        "## Education",
        "Diploma in Marketing — Politeknik Sultan Abdul Halim Mu'adzam Shah (POLIMAS). Head of Department Award twice and Best Student in Economics.",
        "## Languages",
        "Malay — Native · English — Professional · Mandarin — Basic",
        "LINK: GitHub profile | https://github.com/rexzai1992",
        "## Focus areas",
        "Custom applications · AI automation · Computer vision · Interactive games · Kiosks, POS and projection mapping",
        "LINK: Explore services | https://izzul.xyz/"
      ]
    },
    contact: {
      kicker: "Contact",
      heading: "Let’s Build Something Useful.",
      lead: "Available for product development, AI automation, interactive experiences and technical integration work in Malaysia and remotely.",
      lines: [
        "## Start a conversation",
        "Tell me what is slowing your team down, what you want customers to experience, or what system needs to work better.",
        "LINK: Email Izzul | mailto:izzul@2fast.xyz",
        "LINK: Explore services | https://izzul.xyz/",
        "LINK: GitHub | https://github.com/rexzai1992",
        "LINK: AI Genius games | https://aigenius.pages.dev/",
        "Malaysia · +60 11-1117 1350"
      ]
    }
  }
};

export function getFigureSlugFromHref(href: string): string {
  return href.split("/").filter(Boolean).pop() ?? "";
}

export function getFigureBySlug(slug: string): FigureItem | undefined {
  return SITE_CONFIG.figures.find((figure) => getFigureSlugFromHref(figure.href) === slug);
}

export function getPortfolioItemBySlug(slug: string): PortfolioItem | undefined {
  return [...SITE_CONFIG.devs, ...SITE_CONFIG.games].find((item) => item.id === slug);
}
