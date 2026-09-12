"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { PortfolioItem } from "@/data/site-config";
import { ImageReveal } from "@/components/image-reveal";
import { useSiteContent } from "@/context/site-content-context";

export type PageSectionId = "featured" | "games" | "dev" | "news" | "about" | "contact";

function shouldRender(only: PageSectionId | undefined, sectionId: PageSectionId) {
  return !only || only === sectionId;
}

function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0
}: {
  children: ReactNode;
  as?: "div" | "p" | "h2";
  className?: string;
  delay?: number;
}) {
  return (
    <Tag
      className={`scroll-reveal ${className}`.trim()}
      data-reveal
      style={delay ? ({ transitionDelay: `${delay}s, ${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

function PortfolioCard({ item, index }: { item: PortfolioItem; index: number }) {
  return (
    <Reveal className="portfolio-card-wrap" delay={index * 0.12}>
      <article className="portfolio-card" data-type={item.type}>
        <div className="portfolio-card__media">
          <ImageReveal
            src={item.imageSrc}
            alt={item.imageAlt}
            width={1280}
            height={720}
            sizes="(max-width: 1024px) 100vw, 50vw"
            wrapperClassName="portfolio-card__image-wrap"
            imageClassName="portfolio-card__image"
            delay={0.06 + index * 0.08}
          />
        </div>
        <div className="portfolio-card__body">
          <p className="portfolio-card__label">{`${(index + 1).toString().padStart(2, "0")} / ${item.type}`}</p>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          <ul>
            {item.stack.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <a
            className="portfolio-card__cta"
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noreferrer" : undefined}
          >
            {item.cta}
          </a>
        </div>
      </article>
    </Reveal>
  );
}

const RESUME_SKILLS = [
  ["AI & Automation", ["AI Workflow Dev", "Prompt Engineering", "Stable Diffusion", "ControlNet", "Computer Vision", "ML Integration"]],
  ["Development", ["React", "TypeScript", "Node.js", "Python", "REST APIs", "Webhooks", "PostgreSQL", "Supabase", "Firebase", "Git / GitHub"]],
  ["Computer Vision", ["OpenCV", "MediaPipe", "Motion Tracking", "Hand / Pose", "Object Detection"]],
  ["Messaging", ["WhatsApp Business API", "WhatsApp Cloud API", "Embedded Signup", "Telegram Bots", "Chatbots"]],
  ["Systems & Hardware", ["Kiosks", "POS", "Turnstile Access", "Payment Terminals", "Projection Mapping", "Watchout", "AV Setup", "PC Troubleshooting"]],
  ["Tools", ["VS Code", "Claude Code", "OpenAI Codex", "Postman", "Cloudflare", "Canva", "CapCut"]]
] as const;

const RESUME_PROJECTS = [
  {
    title: "2Fast — WhatsApp Automation Platform",
    role: "Founder / Dev",
    summary: "Multi-tenant WhatsApp Business automation platform with embedded-signup onboarding, broadcast campaigns, template management, webhook processing and a real-time dashboard.",
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL", "Supabase", "Meta Cloud API", "Cloudflare"]
  },
  {
    title: "AI Genius — AI Image Generation",
    role: "Founder / Dev",
    summary: "Offline AI artwork and coloring-page generator for theme parks and events, with QR retrieval, queue management, face enhancement and automated printing.",
    tags: ["Stable Diffusion", "ControlNet", "Python", "OpenCV", "React", "WebSocket"]
  },
  {
    title: "Motion Capture & Floor Projection Games",
    role: "Developer",
    summary: "Computer-vision experiences with full-body, hand and gesture tracking plus motion-driven floor projections and real-time multi-person interaction.",
    tags: ["OpenCV", "MediaPipe", "PixiJS", "Three.js", "Python"]
  },
  {
    title: "Telegram Server Management Bot",
    role: "Developer",
    summary: "Infrastructure monitoring and remote administration for CPU, memory, disk, services, logs, alerts and remote restarts across multiple servers.",
    tags: ["Telegram Bot API", "Node.js", "Linux", "SSH", "REST API"]
  },
  {
    title: "Projection Mapping & Event Photobooth",
    role: "Specialist",
    summary: "Multi-projector mapping installations and automated photobooth systems with instant capture, QR retrieval and branded print management.",
    tags: ["Watchout", "Projection Mapping", "AV Systems", "QR Workflow"]
  }
] as const;

function ResumeTags({ items }: { items: readonly string[] }) {
  return <div className="resume-tags">{items.map((item) => <span key={item}>{item}</span>)}</div>;
}

export function PageSections({ only }: { only?: PageSectionId }) {
  const { site } = useSiteContent();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [newsTitle, newsSubtitle, ...newsBody] = site.sections.news.lines ?? [];
  const aboutImage = site.sections.about.imageSrc ?? site.heroSlides[0]?.imageSrc;
  const contactLines = site.sections.contact.lines ?? [];
  const contactTitle = contactLines.find((line) => line.startsWith("## "))?.slice(3) ?? "Start a conversation";
  const contactCopy = contactLines.find((line) => !/^(## |### |LINK: |FIELD: |UPLOAD: |SUBMIT: |THANKS: )/.test(line));
  const contactLinks = contactLines
    .filter((line) => line.startsWith("LINK: "))
    .map((line) => {
      const [label, href] = line.slice(6).split(" | ");
      return { label, href };
    });
  const contactLocation = contactLines.find(
    (line) => !line.startsWith("LINK: ") && line !== contactCopy && !line.startsWith("## ") && !line.startsWith("### ")
  );
  const contactImage = site.heroSlides[2]?.imageSrc ?? aboutImage;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const revealNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!revealNodes.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
            return;
          }
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: [0, 0.2, 0.6] }
    );

    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [only]);

  return (
    <div ref={rootRef}>
      {shouldRender(only, "featured") ? (
        <section id="featured" className="section section--featured">
          <header className="section__header">
            <Reveal as="p" className="section__kicker" delay={0.06}>
              {site.sections.featured.kicker}
            </Reveal>
            <Reveal as="h2" delay={0.12}>
              {site.sections.featured.heading}
            </Reveal>
          </header>
          <div className="section__grid section__grid--2">
            {site.featured.map((item, index) => (
              <PortfolioCard item={item} key={item.id} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "games") ? (
        <section id="games" className="section">
          <header className="section__header">
            <Reveal as="p" className="section__kicker" delay={0.06}>
              {site.sections.games.kicker}
            </Reveal>
            <Reveal as="h2" delay={0.12}>
              {site.sections.games.heading}
            </Reveal>
          </header>
          <div className="section__grid section__grid--2">
            {site.games.map((item, index) => (
              <PortfolioCard item={item} key={item.id} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "dev") ? (
        <section id="dev" className="section">
          <header className="section__header">
            <Reveal as="p" className="section__kicker" delay={0.06}>
              {site.sections.dev.kicker}
            </Reveal>
            <Reveal as="h2" delay={0.12}>
              {site.sections.dev.heading}
            </Reveal>
          </header>
          <div className="section__grid section__grid--2">
            {site.devs.map((item, index) => (
              <PortfolioCard item={item} key={item.id} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldRender(only, "about") ? (
        <section id="about" className="section section--about">
          <Reveal className="resume-sheet" delay={0.06}>
            <header className="resume-sheet__header">
              <p className="resume-sheet__eyebrow"><span /> Systems · AI · Automation <b>/</b> Status: open to work</p>
              <h1><strong>IZZUL</strong> FITREE</h1>
              <p className="resume-sheet__roles">Technical Product Developer <b>/</b> AI Automation Specialist <b>/</b> Business Systems Integrator</p>
              <div className="resume-sheet__contact">
                <span>Malaysia</span>
                <a href="mailto:izzul@2fast.xyz">izzul@2fast.xyz</a>
                <a href="https://2fast.xyz" target="_blank" rel="noreferrer">2fast.xyz</a>
                <a href="https://github.com/rexzai1992" target="_blank" rel="noreferrer">github.com/rexzai1992</a>
              </div>
            </header>

            <div className="resume-sheet__grid">
              <main className="resume-sheet__main">
                <section className="resume-block">
                  <h2><span>01</span> Profile</h2>
                  <p className="resume-profile">Technical Product Developer building across the full lifecycle — <strong>design, build, deploy and support</strong> — for software platforms and physical installations. Hands-on with <strong>AI automation, WhatsApp Business solutions, computer-vision experiences and interactive entertainment tech</strong>, plus kiosks, POS, access control and projection mapping.</p>
                </section>

                <section className="resume-block">
                  <h2><span>02</span> Experience</h2>
                  <div className="resume-timeline">
                    <article>
                      <div className="resume-job__heading"><h3>Product Developer / Technical Support</h3><time>Jan 2025 — Present</time></div>
                      <a href="https://crave.asia" target="_blank" rel="noreferrer">Crave Asia Sdn Bhd</a>
                      <ul><li>Develop AI-powered business solutions and end-to-end automation workflows.</li><li>Configure and deploy kiosks, POS systems, payment terminals and turnstile access control.</li><li>Deliver projection mapping, UI/UX testing, product demos, technical training and support.</li></ul>
                      <p className="resume-impact"><b>Impact</b> Shipped kiosk and POS deployments and automation workflows that improved operational efficiency.</p>
                    </article>
                    <article>
                      <div className="resume-job__heading"><h3>Marketing Executive / Technical Operations Support</h3><time>Dec 2024 — Present</time></div>
                      <strong className="resume-company">Kiddo Heritage Sdn Bhd</strong>
                      <ul><li>Run digital campaigns and produce multi-platform social content.</li><li>Support theme-park operations, arcade machines, attractions, events and ticketing.</li><li>Monitor customer feedback and improve the visitor experience.</li></ul>
                      <p className="resume-impact"><b>Impact</b> Supported Wonderpark campaigns and produced content that increased customer engagement.</p>
                    </article>
                  </div>
                </section>

                <section className="resume-block">
                  <h2><span>03</span> Selected Projects</h2>
                  <div className="resume-projects">
                    {RESUME_PROJECTS.map((project) => <article key={project.title}><div><h3>{project.title}</h3><span>{project.role}</span></div><p>{project.summary}</p><ResumeTags items={project.tags} /></article>)}
                  </div>
                </section>
              </main>

              <aside className="resume-sheet__side">
                <section className="resume-block">
                  <h2><span>04</span> Skills</h2>
                  {RESUME_SKILLS.map(([group, skills]) => <div className="resume-skill-group" key={group}><h3>// {group}</h3><ResumeTags items={skills} /></div>)}
                </section>
                <section className="resume-block">
                  <h2><span>05</span> Education</h2>
                  <h3 className="resume-education">Diploma in Marketing</h3>
                  <p>Politeknik Sultan Abdul Halim Mu&apos;adzam Shah (POLIMAS)</p>
                  <ul className="resume-awards"><li>Head of Department Award (×2)</li><li>Best Student in Economics</li></ul>
                </section>
                <section className="resume-block">
                  <h2><span>06</span> Languages</h2>
                  <div className="resume-languages"><p><span>Malay</span><b>Native</b></p><p><span>English</span><b>Professional</b></p><p><span>Mandarin</span><b>Basic</b></p></div>
                </section>
              </aside>
            </div>
            <footer className="resume-sheet__footer"><span>Izzul Fitree</span><span>&gt; Technical Product Developer · Résumé 2026</span></footer>
          </Reveal>
        </section>
      ) : null}

      {shouldRender(only, "news") ? (
        <section id="news" className="section section--news">
          <header className="section__header">
            <Reveal as="p" className="section__kicker" delay={0.06}>
              {site.sections.news.kicker}
            </Reveal>
            <Reveal as="h2" delay={0.12}>
              {site.sections.news.heading}
            </Reveal>
          </header>
          <Reveal className="news-panel" delay={0.1}>
            {site.sections.news.lead ? <p className="news-panel__date">{site.sections.news.lead}</p> : null}
            {newsTitle ? <h3>{newsTitle.replace(/^##\s+/, "")}</h3> : null}
            {site.sections.news.imageSrc ? (
              <figure className="news-panel__figure">
                <ImageReveal
                  src={site.sections.news.imageSrc}
                  alt={site.sections.news.imageAlt ?? newsTitle ?? site.sections.news.heading}
                  width={1280}
                  height={720}
                  sizes="(max-width: 1024px) 100vw, 720px"
                  wrapperClassName="news-panel__image-wrap"
                  imageClassName="news-panel__image"
                />
              </figure>
            ) : null}
            {newsSubtitle ? <h4>{newsSubtitle}</h4> : null}
            {newsBody.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </Reveal>
        </section>
      ) : null}

      {shouldRender(only, "contact") ? (
        <section id="contact" className="section section--contact">
          <div className="contact-hero">
            <div className="contact-hero__copy">
              <Reveal as="p" className="section__kicker contact-hero__kicker" delay={0.06}>
                {site.sections.contact.kicker} / Available now
              </Reveal>
              <Reveal as="h2" className="contact-hero__heading" delay={0.12}>
                {site.sections.contact.heading}
              </Reveal>
              {site.sections.contact.lead ? (
                <Reveal as="p" className="contact-hero__lead" delay={0.16}>
                  {site.sections.contact.lead}
                </Reveal>
              ) : null}
              <Reveal className="contact-hero__availability" delay={0.2}>
                <span aria-hidden="true" /> Usually replies within 24 hours
              </Reveal>
            </div>
            <div className="contact-hero__visual" aria-hidden={!contactImage}>
              {contactImage ? (
                <ImageReveal
                  src={contactImage}
                  alt="Kaynx1 creative technology workspace illustration"
                  fill
                  sizes="(max-width: 900px) 100vw, 45vw"
                  wrapperClassName="contact-hero__image-wrap"
                  imageClassName="contact-hero__image"
                  delay={0.1}
                />
              ) : null}
              <span>KX / CONTACT</span>
            </div>
          </div>

          <Reveal className="contact-directory" delay={0.16}>
            <div className="contact-directory__intro">
              <p className="contact-directory__eyebrow">{contactTitle}</p>
              {contactCopy ? <p>{contactCopy}</p> : null}
              {contactLocation ? <span>{contactLocation}</span> : null}
            </div>
            <div className="contact-directory__links">
              {contactLinks.map(({ label, href }, index) => (
                <a href={href} key={`${label}-${href}`} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
                  <span className="contact-directory__index">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{label}</strong>
                  <span className="contact-directory__arrow">↗</span>
                </a>
              ))}
            </div>
          </Reveal>
        </section>
      ) : null}
    </div>
  );
}
