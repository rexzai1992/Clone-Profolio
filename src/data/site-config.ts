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
  visibility?: "public" | "private";
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
  group:
    | "Featured Work"
    | "Selected Systems"
    | "Business Platforms"
    | "Infrastructure & Automation"
    | "AI & Computer Vision"
    | "Hardware Integrations"
    | "Security & Developer Tools"
    | "Creative Technology"
    | "Interactive Games";
  href: string;
  externalHref: string;
  visibility?: "public" | "private";
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

const HERO_IMAGE = "/images/kaynx1-hero-anime.webp";
const GAMES_IMAGE = "/images/kaynx1-games.webp";
const SERVICES_IMAGE = "/images/kaynx1-services.webp";
const PRODUCT_DEVELOPER_HERO = "/images/heroes/technical-product-developer-v5.webp";
const INTERACTIVE_AI_HERO = "/images/heroes/interactive-ai-experience.webp";
const TECH_SUPPORT_HERO = "/images/heroes/software-hardware-support-v5.webp";

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
      imageSrc: PRODUCT_DEVELOPER_HERO,
      imageMobileSrc: PRODUCT_DEVELOPER_HERO,
      imageAlt: "Technical product developer working in a professional software and hardware studio",
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
      imageSrc: INTERACTIVE_AI_HERO,
      imageMobileSrc: INTERACTIVE_AI_HERO,
      imageAlt: "Visitor interacting with a camera-powered AI projection experience",
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
      imageSrc: TECH_SUPPORT_HERO,
      imageMobileSrc: TECH_SUPPORT_HERO,
      imageAlt: "Technician diagnosing an integrated computer and electronic control system at a hardware workbench",
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
      thumbSrc: "/images/figures/ai-genius-cover.webp",
      imageSrc: "/images/figures/ai-genius-cover.webp",
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
      thumbSrc: "/images/figures/custom-applications-cover.webp",
      imageSrc: "/images/figures/custom-applications-cover.webp",
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
      thumbSrc: "/images/figures/vps-deck-cover.webp",
      imageSrc: "/images/figures/vps-deck-cover.webp",
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
      thumbSrc: "/images/figures/tailgate-cctv-cover.webp",
      imageSrc: "/images/figures/tailgate-cctv-cover.webp",
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
      imageSrc: "/images/projects/ai-genius-featured-v2.webp",
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
      imageSrc: "/images/projects/custom-app-development-v2.webp",
      imageAlt: "Kaynx1 custom application development service"
    }
  ],
  games: [
    ["body-shape", "Body Shape Challenge", "Interactive body-tracking movement challenge.", "Pose Tracking", "https://body-shape-challenge.pages.dev", "body-shape-challenge-cover-v2.webp"],
    ["hand-particle", "Hand Particle", "Hand-controlled particle interaction demo.", "Hand Tracking", "https://hand-partical.pages.dev", "hand-particle-cover-v2.webp"],
    ["aether-mirror", "Aether Mirror", "Futuristic mirror-style realtime AI visual experience.", "AI Mirror", "https://mecha-mirror.pages.dev/", "aether-mirror-cover-v2.webp"],
    ["face-analysis", "Face Analysis", "Realtime facial detection and visual intelligence demo.", "Face AI", "https://face-analysis.pages.dev", "face-analysis-cover-v2.webp"],
    ["rhythm-arena", "Rhythm Arena", "Motion and timing-based rhythm interaction experience.", "Rhythm Game", "https://rhythem-area.pages.dev", "rhythm-arena-cover-v2.webp"],
    ["fruit-ninja", "Fruit Ninja", "Fast motion-based slicing game experience.", "Motion Game", "https://fruit-ninja-3fe.pages.dev", "fruit-ninja-cover-v2.webp"],
    ["air-harp", "Air Harp", "A virtual harp controlled through hand movement.", "Music Interaction", "https://musical-air-harp.pages.dev", "air-harp-cover-v2.webp"],
    ["ar-goalkeeper", "AR Goal Keeper", "An augmented-reality goalkeeping challenge.", "AR Experience", "https://ar-goal-keeper.pages.dev/", "ar-goalkeeper-cover-v2.webp"],
    ["archery", "3D Archery", "Tournament-style 3D archery aiming and pull challenge.", "Sports Game", "https://3darchery.pages.dev/", "3d-archery-cover-v2.webp"],
    ["bowling", "3D Bowling", "A 3D bowling challenge with smooth aim-and-roll play.", "Sports Game", "https://3d-bowling-2qz.pages.dev", "3d-bowling-cover-v2.webp"]
  ].map(([id, title, summary, category, href, image]) => ({
    id,
    type: "game" as const,
    title,
    summary,
    stack: [category, "Realtime", "Interactive Web"],
    cta: "Play live",
    href,
    imageSrc: `/images/projects/${image}`,
    imageAlt: `${title} interactive game preview`
  })),
  devs: [
    {
      id: "dev-public-transport-live",
      type: "dev",
      title: "Public Transport Live",
      summary: "A live Malaysia and Singapore public-transport map and journey planner with realtime vehicles, multimodal routing, stop alerts, crowd reports and an Android app.",
      stack: ["TypeScript", "GTFS Realtime", "Journey Planning", "Capacitor"],
      cta: "Open live project",
      href: "https://public.kaynx1.com/",
      imageSrc: "/images/projects/public-transport-live-v2.webp",
      imageAlt: "Public Transport Live map showing Kuala Lumpur rail routes and journey-planning coverage"
    },
    {
      id: "dev-2fast",
      type: "dev",
      title: "2Fast WhatsApp Automation",
      summary: "Multi-tenant WhatsApp Business automation with onboarding, campaigns, templates, webhooks and lead management.",
      stack: ["React", "TypeScript", "PostgreSQL", "Meta Cloud API"],
      cta: "View platform",
      href: "https://2fast.xyz/",
      imageSrc: "/images/projects/2fast-whatsapp.webp",
      imageAlt: "2Fast WhatsApp automation platform"
    },
    {
      id: "dev-vps-deck",
      type: "dev",
      title: "VPS Deck",
      summary: "A visual control plane that makes VPS monitoring and day-to-day server operations accessible.",
      stack: ["Go", "Linux", "Monitoring", "Automation"],
      cta: "Open live project",
      href: "https://vps.izzul.xyz/",
      imageSrc: "/images/projects/vps-deck.webp",
      imageAlt: "VPS Deck infrastructure management project"
    },
    {
      id: "dev-photobooth",
      type: "dev",
      title: "Deep Blue Photobooth",
      summary: "An event photobooth platform with guided capture, layout selection, editing, gallery management, QR downloads, cloud media storage and Windows kiosk deployment.",
      stack: ["React", "Cloudflare R2", "Supabase", "Electron Kiosk"],
      cta: "Open live project",
      href: "https://photobooth.izzul.xyz/",
      imageSrc: "/images/projects/deep-blue-photobooth-v2.webp",
      imageAlt: "Deep Blue Photobooth capture kiosk, event gallery and print workflow"
    },
    {
      id: "dev-tailgate",
      type: "dev",
      title: "Tailgate CCTV",
      summary: "Computer-vision monitoring for entry flows, occupancy behaviour and tailgating events.",
      stack: ["Python", "OpenCV", "Tracking", "CCTV"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/Tailgate-CCTV",
      imageSrc: "/images/projects/tailgate-cctv.webp",
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
      imageSrc: "/images/projects/nric-reader.webp",
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
      imageSrc: "/images/projects/agent-portal.webp",
      imageAlt: "Agent Portal product interface"
    },
    {
      id: "dev-cardbiz",
      type: "dev",
      title: "CardBiz ECR Terminal",
      summary: "An Android test application for integrating payment terminals over USB serial and wireless ECR protocols.",
      stack: ["Kotlin", "Android", "USB Serial", "Payment ECR"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/cardbiz",
      imageSrc: "/images/projects/cardbiz-ecr-cover.webp",
      imageAlt: "CardBiz Android payment terminal integration repository"
    },
    {
      id: "dev-watermark-remover",
      type: "dev",
      title: "Gemini Watermark Remover",
      summary: "A focused TypeScript utility for cleaning AI-generated media and streamlining creative export workflows.",
      stack: ["TypeScript", "Image Processing", "AI Tools", "Web App"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/Gemini-Watermark-remover",
      imageSrc: "/images/projects/pixelmend-cover-v2.webp",
      imageAlt: "Gemini Watermark Remover repository"
    },
    {
      id: "dev-heartbeat-agent",
      type: "dev",
      title: "PC Heartbeat Agent",
      summary: "A lightweight Python agent for monitoring the health and availability of multiple computers.",
      stack: ["Python", "Monitoring", "Fleet Health", "Automation"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/Pc-multi-heart-beat-agent",
      imageSrc: "/images/projects/heartbeat-agent-cover.webp",
      imageAlt: "PC multi heartbeat monitoring agent repository"
    },
    {
      id: "dev-nfc-reader",
      type: "dev",
      title: "NFC Reader",
      summary: "A Python hardware integration for reading and processing NFC card data in operational workflows.",
      stack: ["Python", "NFC", "Hardware", "Integration"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/Nfc-Reader",
      imageSrc: "/images/projects/nfc-reader-cover.webp",
      imageAlt: "NFC Reader hardware integration repository"
    },
    {
      id: "dev-pp-plastic",
      type: "dev",
      title: "PP Plastic Platform",
      summary: "A TypeScript business application built to digitise practical company and operational workflows.",
      stack: ["TypeScript", "Business App", "Product UI", "Operations"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/PP-Plastic",
      imageSrc: "/images/projects/pp-plastic-cover.webp",
      imageAlt: "PP Plastic business platform repository"
    },
    {
      id: "dev-ai-artventure",
      type: "dev",
      title: "AI Artventure",
      summary: "An AI-powered creative experience that turns generative technology into an approachable interactive product.",
      stack: ["TypeScript", "Generative AI", "Creative Tech", "Interactive"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/Ai-artventure",
      imageSrc: "/images/projects/ai-artventure-cover.webp",
      imageAlt: "AI Artventure creative technology repository"
    },
    {
      id: "dev-phonedesk",
      type: "dev",
      visibility: "private",
      title: "PhoneDesk",
      summary: "A local-first desktop application for managing Android phones and iPhones from macOS and Windows.",
      stack: ["Rust", "Desktop", "Device Management", "Local First"],
      cta: "Request a walkthrough",
      href: "/contact",
      imageSrc: "/images/projects/phonedesk-cover.webp",
      imageAlt: "PhoneDesk desktop device management application"
    },
    {
      id: "dev-pentest-bot",
      type: "dev",
      visibility: "private",
      title: "Pentest Bot",
      summary: "An authorization-gated scanner designed for safe, URL-first assessment of public web applications.",
      stack: ["Python", "Security", "Automation", "Web Assessment"],
      cta: "Request a walkthrough",
      href: "/contact",
      imageSrc: "/images/projects/pentest-bot-cover.webp",
      imageAlt: "Pentest Bot security assessment interface"
    },
    {
      id: "dev-event-pal",
      type: "dev",
      visibility: "private",
      title: "Event Pal",
      summary: "An event operations platform for organizing experiences, coordinating workflows and keeping delivery on track.",
      stack: ["TypeScript", "Event Operations", "Workflow", "Web Platform"],
      cta: "Request a walkthrough",
      href: "/contact",
      imageSrc: "/images/projects/event-pal-cover.webp",
      imageAlt: "Event Pal operations platform"
    },
    {
      id: "dev-qr-order-kds",
      type: "dev",
      visibility: "private",
      title: "QROrder Pro KDS",
      summary: "A connected QR ordering platform with point-of-sale and kitchen display workflows for food operations.",
      stack: ["TypeScript", "QR Ordering", "POS", "Kitchen Display"],
      cta: "Request a walkthrough",
      href: "/contact",
      imageSrc: "/images/projects/qr-order-kds-cover.webp",
      imageAlt: "QR ordering, POS and kitchen display platform"
    },
    {
      id: "dev-debugshot",
      type: "dev",
      visibility: "private",
      title: "DebugShot",
      summary: "A Chrome extension that captures structured page-debugging reports for faster technical investigation.",
      stack: ["TypeScript", "Chrome Extension", "Debugging", "Developer Tools"],
      cta: "Request a walkthrough",
      href: "/contact",
      imageSrc: "/images/projects/debugshot-cover.webp",
      imageAlt: "DebugShot browser debugging extension"
    },
    {
      id: "dev-pdf-pro",
      type: "dev",
      visibility: "private",
      title: "PDF Pro",
      summary: "A focused document utility for practical PDF processing and streamlined file workflows.",
      stack: ["TypeScript", "PDF", "Documents", "Productivity"],
      cta: "Request a walkthrough",
      href: "/contact",
      imageSrc: "/images/projects/pdf-pro-cover.webp",
      imageAlt: "PDF Pro document processing application"
    },
    {
      id: "dev-ai-photo-generator",
      type: "dev",
      title: "AI Photo Generator",
      summary: "A locally controlled Stable Diffusion and ComfyUI image-generation platform with uploads, style workflows, job queues, staff controls and public showcase galleries.",
      stack: ["Python", "Stable Diffusion", "ComfyUI", "Realtime Queue"],
      cta: "View on GitHub",
      href: "https://github.com/rexzai1992/AUTOMATIC-1111-With-Controller",
      imageSrc: "/images/projects/ai-photo-generator-showcase-v2.webp",
      imageAlt: "AI Photo Generator uploader, generation queue and showcase gallery"
    },
    {
      id: "dev-muet-pro",
      type: "dev",
      visibility: "private",
      title: "MUET Pro",
      summary: "An education platform for generating and organizing MUET practice questions and learning material.",
      stack: ["TypeScript", "Education", "Question Generation", "Web App"],
      cta: "Request a walkthrough",
      href: "/contact",
      imageSrc: "/images/projects/muet-pro-cover.webp",
      imageAlt: "MUET Pro education and question-generation platform"
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
      imageSrc: PRODUCT_DEVELOPER_HERO,
      imageAlt: "Technical product developer working in a professional software and hardware studio",
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
        "Malaysia"
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
