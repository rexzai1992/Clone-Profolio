"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import {
  SITE_CONFIG,
  type FigureItem,
  type HeroSlide,
  type PortfolioItem,
  type SectionContent,
  type SiteConfig
} from "@/data/site-config";
import { validateContentDocument, validateSiteConfig } from "@/lib/content-schema";
import styles from "@/components/admin/admin-panel.module.css";

type AdminArea = "hero" | "figures" | "projects" | "sections" | "site";
type SectionKey = keyof SiteConfig["sections"];
type PortfolioGroupKey = "featured" | "games" | "devs";
type ImageFitMode = "cover" | "contain";

interface ImageRecommendation {
  recommended: string;
  aspectLabel: string;
  aspectRatio: number;
  minWidth: number;
  minHeight: number;
  fit: ImageFitMode;
  note: string;
  tolerance?: number;
  ratioRange?: [number, number];
}

interface ImageInfo {
  status: "idle" | "loading" | "loaded" | "error";
  width: number;
  height: number;
}

const SECTION_LABELS: Record<SectionKey, string> = {
  featured: "Featured",
  games: "Games",
  dev: "Dev",
  news: "News",
  about: "About",
  contact: "Contact"
};

const GROUP_LABELS: Record<PortfolioGroupKey, string> = {
  featured: "Featured",
  games: "Games",
  devs: "Dev"
};

const AREA_LABELS: Array<{ id: AdminArea; label: string; hint: string }> = [
  { id: "hero", label: "Hero", hint: "Slides and main images" },
  { id: "figures", label: "Figures", hint: "Product text and photos" },
  { id: "projects", label: "Projects", hint: "Featured, games, dev cards" },
  { id: "sections", label: "Sections", hint: "Headings and page copy" },
  { id: "site", label: "Site", hint: "Brand and navigation" }
];

const SECTIONS_WITH_LEAD = new Set<SectionKey>(["about", "news", "contact"]);

const IMAGE_RECOMMENDATIONS = {
  heroDesktop: {
    recommended: "1920 x 1080 minimum, 3840 x 2160 ideal",
    aspectLabel: "16:9 landscape",
    aspectRatio: 16 / 9,
    minWidth: 1920,
    minHeight: 1080,
    fit: "cover",
    note: "Used full-screen on desktop. Keep the important subject near the center because the edges can crop."
  },
  heroPreview: {
    recommended: "768 x 432 minimum, 1536 x 864 ideal",
    aspectLabel: "16:9 landscape",
    aspectRatio: 16 / 9,
    minWidth: 768,
    minHeight: 432,
    fit: "cover",
    note: "Small hero preview and thumbnail. Use the same crop as the desktop hero when possible."
  },
  heroMobile: {
    recommended: "1080 x 1920 ideal",
    aspectLabel: "9:16 portrait",
    aspectRatio: 9 / 16,
    minWidth: 780,
    minHeight: 1320,
    fit: "cover",
    note: "Used below tablet width. Put the main subject in the vertical center area."
  },
  figureMain: {
    recommended: "1000 x 1225 minimum",
    aspectLabel: "portrait product art",
    aspectRatio: 1000 / 1225,
    minWidth: 1000,
    minHeight: 1225,
    fit: "cover",
    note: "Used on product cards and detail pages. Portrait images work best.",
    ratioRange: [0.7, 0.85]
  },
  figureThumb: {
    recommended: "488 x 600 ideal",
    aspectLabel: "244:300 portrait",
    aspectRatio: 244 / 300,
    minWidth: 244,
    minHeight: 300,
    fit: "cover",
    note: "Used in figure pickers and grid cards. Match the main image crop if possible.",
    ratioRange: [0.75, 0.86]
  },
  projectCard: {
    recommended: "1920 x 1080 ideal",
    aspectLabel: "16:9 landscape",
    aspectRatio: 16 / 9,
    minWidth: 1280,
    minHeight: 720,
    fit: "cover",
    note: "Used on featured, game, and dev cards. Wrong shapes will crop on the card."
  }
} satisfies Record<string, ImageRecommendation>;

function cloneSite(site: SiteConfig): SiteConfig {
  return JSON.parse(JSON.stringify(site)) as SiteConfig;
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(value: string[] | undefined): string {
  return (value ?? []).join("\n");
}

function getRatioLabel(width: number, height: number): string {
  const divisor = greatestCommonDivisor(width, height);
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

function greatestCommonDivisor(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);

  while (b > 0) {
    const next = a % b;
    a = b;
    b = next;
  }

  return a || 1;
}

function getImageCheck(info: ImageInfo, recommendation: ImageRecommendation): { tone: "muted" | "good" | "warning"; text: string } {
  if (info.status === "idle") {
    return { tone: "muted", text: "Current image: add a URL or upload an image to check its size." };
  }
  if (info.status === "loading") {
    return { tone: "muted", text: "Current image: checking dimensions..." };
  }
  if (info.status === "error") {
    return { tone: "warning", text: "Current image: could not read dimensions. Check that the image URL opens." };
  }

  const actualRatio = info.width / info.height;
  const [minRatio, maxRatio] = recommendation.ratioRange ?? [
    recommendation.aspectRatio * (1 - (recommendation.tolerance ?? 0.08)),
    recommendation.aspectRatio * (1 + (recommendation.tolerance ?? 0.08))
  ];
  const ratioFits = actualRatio >= minRatio && actualRatio <= maxRatio;
  const sizeFits = info.width >= recommendation.minWidth && info.height >= recommendation.minHeight;
  const dimensions = `${info.width} x ${info.height} (${getRatioLabel(info.width, info.height)})`;

  if (ratioFits && sizeFits) {
    return { tone: "good", text: `Current image: ${dimensions}. Good fit for this slot.` };
  }

  if (ratioFits) {
    return {
      tone: "warning",
      text: `Current image: ${dimensions}. Shape is good, but it is smaller than recommended and may look soft.`
    };
  }

  return {
    tone: "warning",
    text: `Current image: ${dimensions}. This will ${recommendation.fit === "cover" ? "crop" : "add empty space"} because it is not ${recommendation.aspectLabel}.`
  };
}

function clampIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
}

function TextField({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "url";
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input value={value} type={type} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className={styles.toggleField}>
      <input checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function ImagePreview({ src, alt, compact = false }: { src?: string; alt?: string; compact?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const canRenderImage = Boolean(src) && failedSrc !== src;

  return (
    <div className={compact ? styles.previewImageCompact : styles.previewImage}>
      {canRenderImage ? <img src={src} alt={alt ?? ""} onError={() => setFailedSrc(src ?? null)} /> : <span>{src ? "Image unavailable" : "No image"}</span>}
    </div>
  );
}

function ImageField({
  label,
  value,
  alt,
  recommendation,
  onChange,
  onUpload
}: {
  label: string;
  value: string;
  alt?: string;
  recommendation: ImageRecommendation;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo>({ status: "idle", width: 0, height: 0 });
  const imageCheck = getImageCheck(imageInfo, recommendation);

  useEffect(() => {
    if (!value) {
      setImageInfo({ status: "idle", width: 0, height: 0 });
      return;
    }

    let cancelled = false;
    const image = new window.Image();
    setImageInfo({ status: "loading", width: 0, height: 0 });

    image.onload = () => {
      if (!cancelled) {
        setImageInfo({ status: "loaded", width: image.naturalWidth, height: image.naturalHeight });
      }
    };
    image.onerror = () => {
      if (!cancelled) {
        setImageInfo({ status: "error", width: 0, height: 0 });
      }
    };
    image.src = value;

    return () => {
      cancelled = true;
    };
  }, [value]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className={styles.imageField}>
      <ImagePreview src={value} alt={alt} compact />
      <div className={styles.imageFieldBody}>
        <div className={styles.imageGuidance}>
          <strong>Recommended size</strong>
          <span>{recommendation.recommended}</span>
          <span>{recommendation.aspectLabel}</span>
          <small>
            Fit: {recommendation.fit}. The site will not stretch the image, but the wrong shape can crop or leave space.
          </small>
          <small>{recommendation.note}</small>
        </div>
        <TextField label={label} value={value} type="url" onChange={onChange} />
        <p className={`${styles.imageCheck} ${styles[`imageCheck${imageCheck.tone[0].toUpperCase()}${imageCheck.tone.slice(1)}`]}`}>
          {imageCheck.text}
        </p>
        <div className={styles.uploadRow}>
          <label className={styles.uploadButton}>
            {isUploading ? "Uploading..." : "Upload image"}
            <input accept="image/jpeg,image/png,image/webp,image/gif" type="file" onChange={handleFile} disabled={isUploading} />
          </label>
          {value ? (
            <a className={styles.inlineLink} href={value} target="_blank" rel="noreferrer">
              Open image
            </a>
          ) : null}
        </div>
        {uploadError ? <p className={styles.inlineError}>{uploadError}</p> : null}
      </div>
    </div>
  );
}

function EditorHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className={styles.editorHeader}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

function PickerButton({
  active,
  title,
  meta,
  imageSrc,
  imageAlt,
  onClick
}: {
  active: boolean;
  title: string;
  meta: string;
  imageSrc?: string;
  imageAlt?: string;
  onClick: () => void;
}) {
  return (
    <button className={`${styles.pickerButton} ${active ? styles.activePicker : ""}`} type="button" onClick={onClick}>
      {imageSrc ? <img src={imageSrc} alt={imageAlt ?? ""} /> : <span className={styles.pickerInitial}>{title.slice(0, 1)}</span>}
      <span>
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
    </button>
  );
}

function SegmentButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button className={`${styles.segmentButton} ${active ? styles.activeSegment : ""}`} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function HeroPreview({ slide }: { slide: HeroSlide }) {
  return (
    <div className={styles.previewStack}>
      <div
        className={styles.heroPreview}
        style={{
          background: `linear-gradient(135deg, ${slide.theme.bgA}, ${slide.theme.bgB})`,
          color: slide.theme.accent
        }}
      >
        <img src={slide.imageSrc} alt={slide.imageAlt} />
        <div className={styles.heroPreviewCopy}>
          <span>{slide.status}</span>
          <h3>{slide.title}</h3>
          <p>{slide.subtitle}</p>
          <small>{slide.detailA}</small>
          <small>{slide.detailB}</small>
          <strong>{slide.cta}</strong>
        </div>
      </div>
      <div className={styles.imageTriptych}>
        <div>
          <span>Desktop</span>
          <ImagePreview src={slide.imageSrc} alt={slide.imageAlt} compact />
        </div>
        <div>
          <span>Preview</span>
          <ImagePreview src={slide.imagePreviewSrc} alt={slide.imageAlt} compact />
        </div>
        <div>
          <span>Mobile</span>
          <ImagePreview src={slide.imageMobileSrc} alt={slide.imageAlt} compact />
        </div>
      </div>
    </div>
  );
}

function FigurePreview({ figure }: { figure: FigureItem }) {
  return (
    <div className={styles.previewStack}>
      <div
        className={styles.figurePreview}
        style={{
          background: figure.color,
          color: figure.whiteText ? "#ffffff" : "#171717"
        }}
      >
        <img src={figure.imageSrc} alt={`${figure.name} ${figure.caption}`} />
        <div>
          <span>{figure.group}</span>
          <small>{figure.series}</small>
          <h3>{figure.name}</h3>
          <p>{figure.caption}</p>
        </div>
      </div>
      <div className={styles.imageTriptych}>
        <div>
          <span>Main</span>
          <ImagePreview src={figure.imageSrc} alt={figure.name} compact />
        </div>
        <div>
          <span>Thumb</span>
          <ImagePreview src={figure.thumbSrc} alt={figure.name} compact />
        </div>
      </div>
    </div>
  );
}

function ProjectPreview({ item, label }: { item: PortfolioItem; label: string }) {
  return (
    <div className={styles.projectPreview}>
      <ImagePreview src={item.imageSrc} alt={item.imageAlt} />
      <div className={styles.projectPreviewBody}>
        <span>{label}</span>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <div className={styles.tagRow}>
          {item.stack.map((tag) => (
            <small key={tag}>{tag}</small>
          ))}
        </div>
        <strong>{item.cta}</strong>
      </div>
    </div>
  );
}

function SectionPreview({ section, content }: { section: SectionKey; content: SectionContent }) {
  const previewLines = (content.lines ?? []).filter((line): line is string => Boolean(line));
  const cleanLine = (line: string) =>
    line
      .replace(/^##\s+/, "")
      .replace(/^###\s+/, "")
      .replace(/^FIELD:\s+/, "")
      .replace(/^UPLOAD:\s+/, "")
      .replace(/^SUBMIT:\s+/, "")
      .replace(/^THANKS:\s+/, "");

  return (
    <div className={styles.sectionPreview}>
      <span>{content.kicker}</span>
      <h3>{content.heading}</h3>
      {content.lead ? <p>{content.lead}</p> : null}
      {content.imageSrc ? <ImagePreview src={content.imageSrc} alt={content.imageAlt ?? content.heading} /> : null}
      {content.lines?.length ? (
        <ul>
          {previewLines.map((line) => (
            <li key={line}>{cleanLine(line)}</li>
          ))}
        </ul>
      ) : null}
      <small>{SECTION_LABELS[section]} page copy preview</small>
    </div>
  );
}

function SitePreview({ site }: { site: SiteConfig }) {
  return (
    <div className={styles.sitePreview}>
      <div className={styles.browserBar}>
        <span />
        <span />
        <span />
      </div>
      <header>
        <strong>{site.brandName}</strong>
        <nav>
          {site.navItems.map((item) => (
            <span key={item.id}>{item.label}</span>
          ))}
        </nav>
      </header>
      <div className={styles.sitePreviewHero}>
        <span>{site.ownerName}</span>
        <h3>{site.heroSlides[0]?.title ?? "Hero"}</h3>
        <p>Hero changes every {site.heroSpeedSeconds} seconds.</p>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [site, setSite] = useState<SiteConfig>(() => cloneSite(SITE_CONFIG));
  const [status, setStatus] = useState<string>("Loading admin content...");
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [activeArea, setActiveArea] = useState<AdminArea>("hero");
  const [selectedHero, setSelectedHero] = useState(0);
  const [selectedFigure, setSelectedFigure] = useState(0);
  const [activeProjectGroup, setActiveProjectGroup] = useState<PortfolioGroupKey>("featured");
  const [selectedProject, setSelectedProject] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionKey>("featured");

  const validation = useMemo(() => validateSiteConfig(site), [site]);
  const heroIndex = clampIndex(selectedHero, site.heroSlides.length);
  const figureIndex = clampIndex(selectedFigure, site.figures.length);
  const projectIndex = clampIndex(selectedProject, site[activeProjectGroup].length);
  const selectedHeroSlide = site.heroSlides[heroIndex];
  const selectedFigureItem = site.figures[figureIndex];
  const selectedProjectItem = site[activeProjectGroup][projectIndex];
  const selectedSectionContent = site.sections[activeSection];

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const sessionResponse = await fetch("/api/admin/session", { cache: "no-store" });
        if (sessionResponse.status === 401) {
          window.location.assign("/admin/login/?next=/admin/");
          return;
        }
        if (!sessionResponse.ok) {
          throw new Error("Could not verify admin session.");
        }

        const response = await fetch("/api/admin/content", { cache: "no-store" });
        if (response.status === 404) {
          if (!cancelled) {
            setSite(cloneSite(SITE_CONFIG));
            setStatus("No saved content yet. Editing fallback content.");
            setIsReady(true);
          }
          return;
        }
        if (!response.ok) {
          throw new Error("Could not load saved content.");
        }

        const payload: unknown = await response.json();
        const result = validateContentDocument(payload);
        if (!result.ok || !result.value) {
          throw new Error(result.errors[0] ?? "Saved content is invalid.");
        }

        if (!cancelled) {
          setSite(cloneSite(result.value.site));
          setSavedAt(result.value.updatedAt);
          setStatus("Saved content loaded.");
          setIsReady(true);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Could not load admin content.");
          setStatus("Using fallback content.");
          setIsReady(true);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSite = (patch: Partial<SiteConfig>) => {
    setSite((current) => ({ ...current, ...patch }));
  };

  const updateSection = (section: SectionKey, patch: Partial<SectionContent>) => {
    setSite((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [section]: { ...current.sections[section], ...patch }
      }
    }));
  };

  const updateHero = (index: number, patch: Partial<HeroSlide>) => {
    setSite((current) => ({
      ...current,
      heroSlides: current.heroSlides.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    }));
  };

  const updateFigure = (index: number, patch: Partial<FigureItem>) => {
    setSite((current) => ({
      ...current,
      figures: current.figures.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    }));
  };

  const updatePortfolio = (group: PortfolioGroupKey, index: number, patch: Partial<PortfolioItem>) => {
    setSite((current) => ({
      ...current,
      [group]: current[group].map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    }));
  };

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form
    });

    const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!response.ok || !payload?.url) {
      throw new Error(payload?.error ?? "Upload failed.");
    }

    setStatus(`Uploaded ${file.name}.`);
    return payload.url;
  };

  const handleSave = async () => {
    const result = validateSiteConfig(site);
    if (!result.ok || !result.value) {
      setError(result.errors[0] ?? "Content is invalid.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ site: result.value })
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const errorPayload = payload as { error?: string; errors?: string[] } | null;
        throw new Error(errorPayload?.errors?.[0] ?? errorPayload?.error ?? "Save failed.");
      }

      const documentResult = validateContentDocument(payload);
      if (!documentResult.ok || !documentResult.value) {
        throw new Error(documentResult.errors[0] ?? "Save response was invalid.");
      }

      setSite(cloneSite(documentResult.value.site));
      setSavedAt(documentResult.value.updatedAt);
      setStatus("Saved. Public site will use the updated content on refresh.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/admin/login/");
  };

  const renderHeroEditor = () => {
    if (!selectedHeroSlide) {
      return null;
    }

    return (
      <>
        <EditorHeader eyebrow="Hero editor" title={selectedHeroSlide.title}>
          Pick a slide, edit the copy, and watch the preview update immediately.
        </EditorHeader>
        <div className={styles.pickerGrid}>
          {site.heroSlides.map((slide, index) => (
            <PickerButton
              active={index === heroIndex}
              imageAlt={slide.imageAlt}
              imageSrc={slide.imagePreviewSrc ?? slide.imageSrc}
              key={slide.id}
              meta={slide.status}
              title={slide.title}
              onClick={() => setSelectedHero(index)}
            />
          ))}
        </div>
        <div className={styles.formSection}>
          <div className={styles.formGrid}>
            <TextField label="Status" value={selectedHeroSlide.status} onChange={(value) => updateHero(heroIndex, { status: value })} />
            <TextField label="Title" value={selectedHeroSlide.title} onChange={(value) => updateHero(heroIndex, { title: value })} />
            <TextField label="Subtitle" value={selectedHeroSlide.subtitle} onChange={(value) => updateHero(heroIndex, { subtitle: value })} />
            <TextField label="CTA" value={selectedHeroSlide.cta} onChange={(value) => updateHero(heroIndex, { cta: value })} />
            <TextField label="CTA href" value={selectedHeroSlide.ctaHref} onChange={(value) => updateHero(heroIndex, { ctaHref: value })} />
            <TextField label="Alt text" value={selectedHeroSlide.imageAlt} onChange={(value) => updateHero(heroIndex, { imageAlt: value })} />
          </div>
          <TextAreaField label="Detail A" value={selectedHeroSlide.detailA} onChange={(value) => updateHero(heroIndex, { detailA: value })} />
          <TextAreaField label="Detail B" value={selectedHeroSlide.detailB} onChange={(value) => updateHero(heroIndex, { detailB: value })} />
          <div className={styles.formGrid}>
            <TextField label="Theme start" value={selectedHeroSlide.theme.bgA} onChange={(value) => updateHero(heroIndex, { theme: { ...selectedHeroSlide.theme, bgA: value } })} />
            <TextField label="Theme end" value={selectedHeroSlide.theme.bgB} onChange={(value) => updateHero(heroIndex, { theme: { ...selectedHeroSlide.theme, bgB: value } })} />
            <TextField label="Text color" value={selectedHeroSlide.theme.accent} onChange={(value) => updateHero(heroIndex, { theme: { ...selectedHeroSlide.theme, accent: value } })} />
          </div>
          <ImageField
            alt={selectedHeroSlide.imageAlt}
            label="Desktop image URL"
            recommendation={IMAGE_RECOMMENDATIONS.heroDesktop}
            value={selectedHeroSlide.imageSrc}
            onChange={(value) => updateHero(heroIndex, { imageSrc: value })}
            onUpload={uploadImage}
          />
          <ImageField
            alt={selectedHeroSlide.imageAlt}
            label="Preview image URL"
            recommendation={IMAGE_RECOMMENDATIONS.heroPreview}
            value={selectedHeroSlide.imagePreviewSrc ?? ""}
            onChange={(value) => updateHero(heroIndex, { imagePreviewSrc: value || undefined })}
            onUpload={uploadImage}
          />
          <ImageField
            alt={selectedHeroSlide.imageAlt}
            label="Mobile image URL"
            recommendation={IMAGE_RECOMMENDATIONS.heroMobile}
            value={selectedHeroSlide.imageMobileSrc ?? ""}
            onChange={(value) => updateHero(heroIndex, { imageMobileSrc: value || undefined })}
            onUpload={uploadImage}
          />
        </div>
      </>
    );
  };

  const renderFigureEditor = () => {
    if (!selectedFigureItem) {
      return null;
    }

    return (
      <>
        <EditorHeader eyebrow="Figure editor" title={selectedFigureItem.name}>
          Existing figure routes stay fixed, but the visible words and images can change.
        </EditorHeader>
        <div className={styles.pickerGrid}>
          {site.figures.map((figure, index) => (
            <PickerButton
              active={index === figureIndex}
              imageAlt={figure.name}
              imageSrc={figure.thumbSrc}
              key={figure.id}
              meta={figure.group}
              title={figure.name}
              onClick={() => setSelectedFigure(index)}
            />
          ))}
        </div>
        <div className={styles.formSection}>
          <div className={styles.formGrid}>
            <SelectField
              label="Group"
              options={["Featured Work", "Selected Systems"]}
              value={selectedFigureItem.group}
              onChange={(value) => updateFigure(figureIndex, { group: value as FigureItem["group"] })}
            />
            <TextField label="Series" value={selectedFigureItem.series} onChange={(value) => updateFigure(figureIndex, { series: value })} />
            <TextField label="Name" value={selectedFigureItem.name} onChange={(value) => updateFigure(figureIndex, { name: value })} />
            <TextField label="Caption" value={selectedFigureItem.caption} onChange={(value) => updateFigure(figureIndex, { caption: value })} />
            <TextField label="Project URL" type="url" value={selectedFigureItem.externalHref} onChange={(value) => updateFigure(figureIndex, { externalHref: value })} />
            <TextField label="Tile color" value={selectedFigureItem.color} onChange={(value) => updateFigure(figureIndex, { color: value })} />
            <ToggleField label="Use light text on tile" checked={selectedFigureItem.whiteText} onChange={(value) => updateFigure(figureIndex, { whiteText: value })} />
          </div>
          <ImageField
            alt={selectedFigureItem.name}
            label="Main image URL"
            recommendation={IMAGE_RECOMMENDATIONS.figureMain}
            value={selectedFigureItem.imageSrc}
            onChange={(value) => updateFigure(figureIndex, { imageSrc: value })}
            onUpload={uploadImage}
          />
          <ImageField
            alt={selectedFigureItem.name}
            label="Thumb image URL"
            recommendation={IMAGE_RECOMMENDATIONS.figureThumb}
            value={selectedFigureItem.thumbSrc}
            onChange={(value) => updateFigure(figureIndex, { thumbSrc: value })}
            onUpload={uploadImage}
          />
        </div>
      </>
    );
  };

  const renderProjectEditor = () => {
    if (!selectedProjectItem) {
      return null;
    }

    return (
      <>
        <EditorHeader eyebrow="Project editor" title={selectedProjectItem.title}>
          Switch between portfolio groups and preview each card before saving.
        </EditorHeader>
        <div className={styles.segmented}>
          {(["featured", "games", "devs"] as PortfolioGroupKey[]).map((group) => (
            <SegmentButton
              active={activeProjectGroup === group}
              key={group}
              onClick={() => {
                setActiveProjectGroup(group);
                setSelectedProject(0);
              }}
            >
              {GROUP_LABELS[group]}
            </SegmentButton>
          ))}
        </div>
        <div className={styles.pickerGrid}>
          {site[activeProjectGroup].map((item, index) => (
            <PickerButton
              active={index === projectIndex}
              imageAlt={item.imageAlt}
              imageSrc={item.imageSrc}
              key={item.id}
              meta={item.cta}
              title={item.title}
              onClick={() => setSelectedProject(index)}
            />
          ))}
        </div>
        <div className={styles.formSection}>
          <div className={styles.formGrid}>
            <TextField label="Title" value={selectedProjectItem.title} onChange={(value) => updatePortfolio(activeProjectGroup, projectIndex, { title: value })} />
            <TextField label="CTA" value={selectedProjectItem.cta} onChange={(value) => updatePortfolio(activeProjectGroup, projectIndex, { cta: value })} />
            <TextField label="Project URL" type="url" value={selectedProjectItem.href} onChange={(value) => updatePortfolio(activeProjectGroup, projectIndex, { href: value })} />
            <TextField
              label="Alt text"
              value={selectedProjectItem.imageAlt}
              onChange={(value) => updatePortfolio(activeProjectGroup, projectIndex, { imageAlt: value })}
            />
          </div>
          <TextAreaField
            label="Summary"
            rows={4}
            value={selectedProjectItem.summary}
            onChange={(value) => updatePortfolio(activeProjectGroup, projectIndex, { summary: value })}
          />
          <TextAreaField
            label="Stack tags, one per line"
            value={joinLines(selectedProjectItem.stack)}
            onChange={(value) => updatePortfolio(activeProjectGroup, projectIndex, { stack: splitLines(value) })}
          />
          <ImageField
            alt={selectedProjectItem.imageAlt}
            label="Image URL"
            recommendation={IMAGE_RECOMMENDATIONS.projectCard}
            value={selectedProjectItem.imageSrc}
            onChange={(value) => updatePortfolio(activeProjectGroup, projectIndex, { imageSrc: value })}
            onUpload={uploadImage}
          />
        </div>
      </>
    );
  };

  const renderSectionsEditor = () => (
    <>
      <EditorHeader eyebrow="Page copy" title={SECTION_LABELS[activeSection]}>
        Edit the visible headings and page text with a simple live preview.
      </EditorHeader>
      <div className={styles.segmented}>
        {(Object.keys(site.sections) as SectionKey[]).map((section) => (
          <SegmentButton active={activeSection === section} key={section} onClick={() => setActiveSection(section)}>
            {SECTION_LABELS[section]}
          </SegmentButton>
        ))}
      </div>
      <div className={styles.formSection}>
        <TextField
          label="Kicker"
          value={selectedSectionContent.kicker}
          onChange={(value) => updateSection(activeSection, { kicker: value })}
        />
        <TextAreaField
          label="Heading"
          value={selectedSectionContent.heading}
          onChange={(value) => updateSection(activeSection, { heading: value })}
        />
        {SECTIONS_WITH_LEAD.has(activeSection) ? (
          <TextAreaField
            label={activeSection === "news" ? "Date or intro" : "Lead"}
            value={site.sections[activeSection].lead ?? ""}
            rows={5}
            onChange={(value) => updateSection(activeSection, { lead: value })}
          />
        ) : null}
        {activeSection === "news" || activeSection === "about" || activeSection === "contact" ? (
          <TextAreaField
            label={`${SECTION_LABELS[activeSection]} lines, one per line`}
            value={joinLines(site.sections[activeSection].lines)}
            rows={5}
            onChange={(value) => updateSection(activeSection, { lines: splitLines(value) })}
          />
        ) : null}
        {activeSection === "news" ? (
          <>
            <TextField
              label="Image alt text"
              value={site.sections.news.imageAlt ?? ""}
              onChange={(value) => updateSection("news", { imageAlt: value })}
            />
            <ImageField
              alt={site.sections.news.imageAlt}
              label="News image URL"
              recommendation={IMAGE_RECOMMENDATIONS.projectCard}
              value={site.sections.news.imageSrc ?? ""}
              onChange={(value) => updateSection("news", { imageSrc: value || undefined })}
              onUpload={uploadImage}
            />
          </>
        ) : null}
        {activeSection === "about" ? (
          <>
            <TextField
              label="Profile image alt text"
              value={site.sections.about.imageAlt ?? ""}
              onChange={(value) => updateSection("about", { imageAlt: value })}
            />
            <ImageField
              alt={site.sections.about.imageAlt}
              label="Profile image URL"
              recommendation={IMAGE_RECOMMENDATIONS.projectCard}
              value={site.sections.about.imageSrc ?? ""}
              onChange={(value) => updateSection("about", { imageSrc: value || undefined })}
              onUpload={uploadImage}
            />
          </>
        ) : null}
      </div>
    </>
  );

  const renderSiteEditor = () => (
    <>
      <EditorHeader eyebrow="Site settings" title="Brand and navigation">
        These labels are reflected across the header, menu, and admin preview.
      </EditorHeader>
      <div className={styles.formSection}>
        <div className={styles.formGrid}>
          <TextField label="Brand name" value={site.brandName} onChange={(value) => updateSite({ brandName: value })} />
          <TextField label="Owner name" value={site.ownerName} onChange={(value) => updateSite({ ownerName: value })} />
          <TextField
            label="Hero speed seconds"
            value={site.heroSpeedSeconds}
            type="number"
            onChange={(value) => updateSite({ heroSpeedSeconds: Number(value) || 1 })}
          />
        </div>
        <div className={styles.navEditorList}>
          {site.navItems.map((item, index) => (
            <div className={styles.navEditorRow} key={item.id}>
              <span>{item.href}</span>
              <TextField
                label="Navigation label"
                value={item.label}
                onChange={(value) =>
                  setSite((current) => ({
                    ...current,
                    navItems: current.navItems.map((navItem, itemIndex) =>
                      itemIndex === index ? { ...navItem, label: value } : navItem
                    )
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderEditor = () => {
    if (activeArea === "hero") {
      return renderHeroEditor();
    }
    if (activeArea === "figures") {
      return renderFigureEditor();
    }
    if (activeArea === "projects") {
      return renderProjectEditor();
    }
    if (activeArea === "sections") {
      return renderSectionsEditor();
    }
    return renderSiteEditor();
  };

  const renderPreview = () => {
    if (activeArea === "hero" && selectedHeroSlide) {
      return <HeroPreview slide={selectedHeroSlide} />;
    }
    if (activeArea === "figures" && selectedFigureItem) {
      return <FigurePreview figure={selectedFigureItem} />;
    }
    if (activeArea === "projects" && selectedProjectItem) {
      return <ProjectPreview item={selectedProjectItem} label={GROUP_LABELS[activeProjectGroup]} />;
    }
    if (activeArea === "sections") {
      return <SectionPreview content={selectedSectionContent} section={activeSection} />;
    }
    return <SitePreview site={site} />;
  };

  return (
    <main className={styles.dashboard}>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Portfolio Admin</p>
          <h1>Visual Content Studio</h1>
          <p>{savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}` : status}</p>
        </div>
        <div className={styles.actions}>
          <a className={styles.secondaryButton} href="/" target="_blank" rel="noreferrer">
            View site
          </a>
          <button className={styles.secondaryButton} type="button" onClick={handleLogout}>
            Logout
          </button>
          <button className={styles.primaryButton} type="button" onClick={handleSave} disabled={isSaving || !isReady || !validation.ok}>
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}
      {!validation.ok ? <p className={styles.error}>{validation.errors[0]}</p> : null}
      <p className={styles.notice}>{status}</p>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarLabel}>Edit content</p>
          <div className={styles.areaList}>
            {AREA_LABELS.map((area) => (
              <button
                className={`${styles.areaButton} ${activeArea === area.id ? styles.activeArea : ""}`}
                key={area.id}
                type="button"
                onClick={() => setActiveArea(area.id)}
              >
                <strong>{area.label}</strong>
                <span>{area.hint}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.editorPane}>{renderEditor()}</section>

        <aside className={styles.previewPane}>
          <div className={styles.previewSticky}>
            <div className={styles.previewHeader}>
              <p className={styles.eyebrow}>Live preview</p>
              <h2>{AREA_LABELS.find((area) => area.id === activeArea)?.label}</h2>
            </div>
            {renderPreview()}
          </div>
        </aside>
      </div>
    </main>
  );
}
