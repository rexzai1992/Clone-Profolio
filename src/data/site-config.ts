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
  imageSrc: string;
  imageAlt: string;
}

export interface FigureItem {
  id: string;
  group: "Pre-Order" | "Released products";
  href: string;
  color: string;
  whiteText: boolean;
  thumbSrc: string;
  imageSrc: string;
  series: string;
  name: string;
  caption: string;
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
}

export const SITE_CONFIG: SiteConfig = {
  brandName: "Kaynx1",
  ownerName: "Izzul",
  heroSpeedSeconds: 5,
  navItems: [
    { id: "top", label: "Top", href: "/" },
    { id: "figures", label: "Scale Figures", href: "/figures" },
    { id: "about", label: "About Izzul", href: "/about" },
    { id: "news", label: "News", href: "/news" },
    { id: "contact", label: "Contact", href: "/contact" }
  ],
  heroSlides: [
    {
      id: "slide-a",
      status: "Phase 01",
      title: "Kaynx1",
      subtitle: "Cinematic game and developer portfolio direction.",
      detailA: "Brand: Kaynx1",
      detailB: "Owner: Izzul",
      cta: "Explore",
      ctaHref: "/figures",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/kv_z23_v1.jpg",
      imageMobileSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/kv_z23_sp_v1.jpg",
      imageAlt: "Generic hero placeholder A",
      theme: {
        bgA: "#222024",
        bgB: "#4a4345",
        accent: "#f2f2f2"
      }
    },
    {
      id: "slide-b",
      status: "Game Work",
      title: "Interactive Worlds",
      subtitle: "Playable concepts, visual polish, and fast iteration loops.",
      detailA: "Gameplay prototypes",
      detailB: "Animation-focused UX",
      cta: "View Games",
      ctaHref: "/games",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/kv_katsuragi_v3.jpg",
      imageMobileSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/kv_katsuragi_sp_v3.jpg",
      imageAlt: "Generic hero placeholder B",
      theme: {
        bgA: "#16181d",
        bgB: "#3a404a",
        accent: "#f7f7f7"
      }
    },
    {
      id: "slide-c",
      status: "Dev Work",
      title: "Production Systems",
      subtitle: "Deploy pipelines, APIs, and robust product delivery.",
      detailA: "Cloud + automation",
      detailB: "Frontend + backend",
      cta: "View Dev",
      ctaHref: "/dev",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2025/08/kv_aoba_minami_v2.jpg",
      imageMobileSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/kv_aoba_sp_v2.jpg",
      imageAlt: "Generic hero placeholder C",
      theme: {
        bgA: "#1d1a1a",
        bgB: "#4d4640",
        accent: "#fcfcfc"
      }
    }
  ],
  figures: [
    {
      id: "z23",
      group: "Pre-Order",
      href: "/figures/z23/",
      color: "#1a1818",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/index-z23-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/index-z23.jpg",
      series: "AZUR LANE",
      name: "Z23",
      caption: "Philosophy Sensei"
    },
    {
      id: "katsuragi",
      group: "Released products",
      href: "/figures/katsuragi/",
      color: "#19a4d0",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2025/09/cover_katsuragi_v2-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2025/09/cover_katsuragi_v2.jpg",
      series: "AZUR LANE",
      name: "KATSURAGI",
      caption: "Night-Illuminating Festival"
    },
    {
      id: "aoba-minami",
      group: "Released products",
      href: "/figures/aoba-minami/",
      color: "#55c3cd",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2025/08/mimeyoi-Aoba-Minami-nsc02-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2025/08/mimeyoi-Aoba-Minami-nsc02.jpg",
      series: "SORA-IRO UTILITY",
      name: "Aoba Minami",
      caption: "Nice Shot Challenge!!"
    },
    {
      id: "le-malin-lapin",
      group: "Released products",
      href: "/figures/le-malin-lapin/",
      color: "#A62648",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2024/08/mimeyoi-LeMalin-bunny13_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2024/08/mimeyoi-LeMalin-bunny13_top-1.jpg",
      series: "AZUR LANE",
      name: "Le Malin",
      caption: "Listless Lapin"
    },
    {
      id: "kashino",
      group: "Released products",
      href: "/figures/kashino/",
      color: "#cb90dd",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2024/03/mimeyoi-kashino16_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2024/03/mimeyoi-kashino16_top-1.jpg",
      series: "AZUR LANE",
      name: "Kashino",
      caption: "Hot Springs Relaxation"
    },
    {
      id: "eimi",
      group: "Released products",
      href: "/figures/eimi/",
      color: "#F896A4",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2023/12/mimeyoi_eimi00_revised_2_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2023/12/mimeyoi_eimi00_revised_2_top-1.jpg",
      series: "Blue Archive",
      name: "Eimi",
      caption: "Izumimoto Eimi"
    },
    {
      id: "javelin",
      group: "Released products",
      href: "/figures/javelin/",
      color: "#A459E2",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2023/06/mimeyoi_Javelin02_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2023/06/mimeyoi_Javelin02_top-1.jpg",
      series: "AZUR LANE",
      name: "Javelin",
      caption: "Blissful Purity"
    },
    {
      id: "shoukaku",
      group: "Released products",
      href: "/figures/shoukaku/",
      color: "#593D76",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2023/01/mimeyoi_Shoukaku_rq15_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2023/01/mimeyoi_Shoukaku_rq15_top-1.jpg",
      series: "AZUR LANE",
      name: "Shoukaku",
      caption: "Sororal Wings"
    },
    {
      id: "super-sonico",
      group: "Released products",
      href: "/figures/super-sonico/",
      color: "#FDFAF4",
      whiteText: false,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2022/12/17477_02_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2022/12/17477_02_top-1.jpg",
      series: "SUPER SONICO",
      name: "SUPER SONICO",
      caption: "1♡th Merry Christmas!"
    },
    {
      id: "rin-shirane",
      group: "Released products",
      href: "/figures/rin-shirane/",
      color: "#293CAD",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2022/11/2089_top-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2022/11/2089_top.jpg",
      series: "Little Armory",
      name: "Rin Shirane",
      caption: "Beach Shootout"
    },
    {
      id: "zuikaku",
      group: "Released products",
      href: "/figures/zuikaku/",
      color: "#A2081B",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2022/09/mimeyoi_Zuikaku_rq16_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2022/09/mimeyoi_Zuikaku_rq16_top-1.jpg",
      series: "AZUR LANE",
      name: "Zuikaku",
      caption: "The Wind's True Name"
    },
    {
      id: "bremerton",
      group: "Released products",
      href: "/figures/bremerton/",
      color: "#73C6BE",
      whiteText: false,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2022/04/mimeyoi-Bremerton05_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2022/04/mimeyoi-Bremerton05_top-1.jpg",
      series: "AZUR LANE",
      name: "Bremerton",
      caption: "Scorching - Hot Training"
    },
    {
      id: "taihou",
      group: "Released products",
      href: "/figures/taihou/",
      color: "#8D0512",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2022/01/mimeyoi_Taihou_rq16_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2022/01/mimeyoi_Taihou_rq16_top-1.jpg",
      series: "AZUR LANE",
      name: "Taihou",
      caption: "Enraptured Companion"
    },
    {
      id: "bache",
      group: "Released products",
      href: "/figures/bache/",
      color: "#FCB238",
      whiteText: false,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2021/09/mimeyoi-Bache05_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2021/09/mimeyoi-Bache05_top-1.jpg",
      series: "AZUR LANE",
      name: "Bache",
      caption: "Fletcher-class destroyer"
    },
    {
      id: "ning-hai",
      group: "Released products",
      href: "/figures/ning-hai/",
      color: "#7E5ABC",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2021/03/mimeyoi_NINGHAI_tfed_07_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2021/03/mimeyoi_NINGHAI_tfed_07_top-1.jpg",
      series: "AZUR LANE",
      name: "NING HAI",
      caption: "Summer Hunger"
    },
    {
      id: "le-malin",
      group: "Released products",
      href: "/figures/le-malin/",
      color: "#000000",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2021/02/mimeyoi-LeMalin02_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2021/02/mimeyoi-LeMalin02_top-1.jpg",
      series: "AZUR LANE",
      name: "Le Malin",
      caption: "The blade that protect Vichya Dominion"
    },
    {
      id: "prince-of-wales",
      group: "Released products",
      href: "/figures/prince-of-wales/",
      color: "#FFEACB",
      whiteText: false,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2020/09/mimeyoi_tfed_POW_rq15_top-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2020/09/mimeyoi_tfed_POW_rq15_top.jpg",
      series: "AZUR LANE",
      name: "Prince of Wales",
      caption: "The Laureate's Victory Lap"
    },
    {
      id: "duke-of-york",
      group: "Released products",
      href: "/figures/duke-of-york/",
      color: "#392D30",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2020/03/39139_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2020/03/39139_top-1.jpg",
      series: "AZUR LANE",
      name: "Duke of York",
      caption: "Prestige of the Glorious Formula"
    },
    {
      id: "chocola",
      group: "Released products",
      href: "/figures/chocola/",
      color: "#F89FA1",
      whiteText: true,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2020/01/15449_top-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2020/01/15449_top.jpg",
      series: "NEKOPARA",
      name: "Chocola",
      caption: "Race Queen ver."
    },
    {
      id: "vanilla",
      group: "Released products",
      href: "/figures/vanilla/",
      color: "#E5DCF8",
      whiteText: false,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2020/01/15472_top-1-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2020/01/15472_top-1.jpg",
      series: "NEKOPARA",
      name: "Vanilla",
      caption: "Race Queen ver."
    },
    {
      id: "ping-hai",
      group: "Released products",
      href: "/figures/ping-hai/",
      color: "#FAD7D8",
      whiteText: false,
      thumbSrc: "https://mimeyoi.co/wp/wp-content/uploads/2019/11/28736_top-244x300.jpg",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2019/11/28736_top.jpg",
      series: "AZUR LANE",
      name: "PING HAI",
      caption: "Merry Summer"
    }
  ],
  featured: [
    {
      id: "featured-01",
      type: "game",
      title: "Featured Concept",
      summary: "Hero gameplay concept placeholder. Replace with your media anytime.",
      stack: ["WebGL", "Motion", "Interaction"],
      cta: "Open Case",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/kv_z23_v1-1024x576.jpg",
      imageAlt: "Reference photo placeholder for game project"
    },
    {
      id: "featured-02",
      type: "dev",
      title: "Featured Build",
      summary: "Production engineering placeholder with cinematic presentation.",
      stack: ["Next.js", "Cloudflare", "Automation"],
      cta: "Read Build",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/kv_katsuragi_v3-1024x576.jpg",
      imageAlt: "Reference photo placeholder for dev project"
    }
  ],
  games: [
    {
      id: "game-01",
      type: "game",
      title: "Game Placeholder 01",
      summary: "Drop your own screenshot and game details here.",
      stack: ["Physics", "Realtime", "UX"],
      cta: "Preview",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2025/08/kv_aoba_minami_v2-1024x576.jpg",
      imageAlt: "Reference photo placeholder for game project"
    },
    {
      id: "game-02",
      type: "game",
      title: "Game Placeholder 02",
      summary: "Designed for handoff once your real media is ready.",
      stack: ["Pose", "Audio", "Scoring"],
      cta: "Preview",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/kv_z23_v1-1024x576.jpg",
      imageAlt: "Reference photo placeholder for game project"
    }
  ],
  devs: [
    {
      id: "dev-01",
      type: "dev",
      title: "Dev Placeholder 01",
      summary: "System architecture and deployment portfolio slot.",
      stack: ["API", "Database", "Workers"],
      cta: "Inspect",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2026/02/kv_katsuragi_v3-1024x576.jpg",
      imageAlt: "Reference photo placeholder for developer project"
    },
    {
      id: "dev-02",
      type: "dev",
      title: "Dev Placeholder 02",
      summary: "Scalable product engineering and delivery slot.",
      stack: ["CI/CD", "Observability", "Performance"],
      cta: "Inspect",
      imageSrc: "https://mimeyoi.co/wp/wp-content/uploads/2025/08/kv_aoba_minami_v2-1024x576.jpg",
      imageAlt: "Reference photo placeholder for developer project"
    }
  ]
};
