import type {
  FigureItem,
  NavItem,
  PortfolioItem,
  SectionContent,
  SiteConfig
} from "@/data/site-config";
import { SITE_CONFIG } from "@/data/site-config";

export const CONTENT_VERSION = 1;
export const CONTENT_OBJECT_KEY = "content/site-config.json";
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export interface ContentDocument {
  version: typeof CONTENT_VERSION;
  updatedAt: string;
  site: SiteConfig;
}

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readString(value: unknown, path: string, errors: string[], required = true): string {
  if (typeof value === "string") {
    return value;
  }

  if (!required && value === undefined) {
    return "";
  }

  errors.push(`${path} must be a string.`);
  return "";
}

function readNumber(value: unknown, path: string, errors: string[]): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  errors.push(`${path} must be a number.`);
  return 0;
}

function readBoolean(value: unknown, path: string, errors: string[]): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  errors.push(`${path} must be true or false.`);
  return false;
}

function readStringArray(value: unknown, path: string, errors: string[]): string[] {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be a list.`);
    return [];
  }

  return value.map((item, index) => readString(item, `${path}[${index}]`, errors));
}

function validateNavItem(value: unknown, path: string, errors: string[]): NavItem {
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`);
  }

  return {
    id: readString(record.id, `${path}.id`, errors),
    label: readString(record.label, `${path}.label`, errors),
    href: readString(record.href, `${path}.href`, errors)
  };
}

function validateHeroSlide(value: unknown, path: string, errors: string[]): SiteConfig["heroSlides"][number] {
  const record = isRecord(value) ? value : {};
  const theme = isRecord(record.theme) ? record.theme : {};
  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`);
  }
  if (!isRecord(record.theme)) {
    errors.push(`${path}.theme must be an object.`);
  }

  return {
    id: readString(record.id, `${path}.id`, errors),
    status: readString(record.status, `${path}.status`, errors),
    title: readString(record.title, `${path}.title`, errors),
    subtitle: readString(record.subtitle, `${path}.subtitle`, errors),
    detailA: readString(record.detailA, `${path}.detailA`, errors),
    detailB: readString(record.detailB, `${path}.detailB`, errors),
    cta: readString(record.cta, `${path}.cta`, errors),
    ctaHref: readString(record.ctaHref, `${path}.ctaHref`, errors),
    imageSrc: readString(record.imageSrc, `${path}.imageSrc`, errors),
    imagePreviewSrc: readString(record.imagePreviewSrc, `${path}.imagePreviewSrc`, errors, false) || undefined,
    imageMobileSrc: readString(record.imageMobileSrc, `${path}.imageMobileSrc`, errors, false) || undefined,
    imageAlt: readString(record.imageAlt, `${path}.imageAlt`, errors),
    theme: {
      bgA: readString(theme.bgA, `${path}.theme.bgA`, errors),
      bgB: readString(theme.bgB, `${path}.theme.bgB`, errors),
      accent: readString(theme.accent, `${path}.theme.accent`, errors)
    }
  };
}

function validateFigure(value: unknown, path: string, errors: string[]): FigureItem {
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`);
  }

  return {
    id: readString(record.id, `${path}.id`, errors),
    group: readString(record.group, `${path}.group`, errors) as FigureItem["group"],
    href: readString(record.href, `${path}.href`, errors),
    color: readString(record.color, `${path}.color`, errors),
    whiteText: readBoolean(record.whiteText, `${path}.whiteText`, errors),
    thumbSrc: readString(record.thumbSrc, `${path}.thumbSrc`, errors),
    imageSrc: readString(record.imageSrc, `${path}.imageSrc`, errors),
    series: readString(record.series, `${path}.series`, errors),
    name: readString(record.name, `${path}.name`, errors),
    caption: readString(record.caption, `${path}.caption`, errors)
  };
}

function validatePortfolioItem(value: unknown, path: string, errors: string[]): PortfolioItem {
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`);
  }

  return {
    id: readString(record.id, `${path}.id`, errors),
    type: readString(record.type, `${path}.type`, errors) as PortfolioItem["type"],
    title: readString(record.title, `${path}.title`, errors),
    summary: readString(record.summary, `${path}.summary`, errors),
    stack: readStringArray(record.stack, `${path}.stack`, errors),
    cta: readString(record.cta, `${path}.cta`, errors),
    imageSrc: readString(record.imageSrc, `${path}.imageSrc`, errors),
    imageAlt: readString(record.imageAlt, `${path}.imageAlt`, errors)
  };
}

function validateSection(value: unknown, path: string, errors: string[]): SectionContent {
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`);
  }

  return {
    kicker: readString(record.kicker, `${path}.kicker`, errors),
    heading: readString(record.heading, `${path}.heading`, errors),
    lead: readString(record.lead, `${path}.lead`, errors, false) || undefined,
    lines: Array.isArray(record.lines) ? readStringArray(record.lines, `${path}.lines`, errors) : undefined,
    imageSrc: readString(record.imageSrc, `${path}.imageSrc`, errors, false) || undefined,
    imageAlt: readString(record.imageAlt, `${path}.imageAlt`, errors, false) || undefined
  };
}

function cloneSection(section: SectionContent): SectionContent {
  return {
    kicker: section.kicker,
    heading: section.heading,
    lead: section.lead,
    lines: section.lines ? [...section.lines] : undefined,
    imageSrc: section.imageSrc,
    imageAlt: section.imageAlt
  };
}

function isLegacyContactSection(section: SectionContent) {
  return (
    section.kicker === "Contact" &&
    section.heading === "Let's build something serious." &&
    section.lines?.join("\n") === "Email placeholder\nDiscord placeholder\nLocation placeholder"
  );
}

function validateSectionWithDefault(
  value: unknown,
  path: string,
  errors: string[],
  fallback: SectionContent
): SectionContent {
  if (value === undefined) {
    return cloneSection(fallback);
  }

  return validateSection(value, path, errors);
}

function validateArray<T>(
  value: unknown,
  path: string,
  errors: string[],
  validator: (item: unknown, itemPath: string, errors: string[]) => T
): T[] {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be a list.`);
    return [];
  }

  return value.map((item, index) => validator(item, `${path}[${index}]`, errors));
}

export function validateSiteConfig(value: unknown): ValidationResult<SiteConfig> {
  const errors: string[] = [];
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    errors.push("site must be an object.");
  }

  const sections = isRecord(record.sections) ? record.sections : {};
  if (!isRecord(record.sections)) {
    errors.push("site.sections must be an object.");
  }

  const site: SiteConfig = {
    brandName: readString(record.brandName, "site.brandName", errors),
    ownerName: readString(record.ownerName, "site.ownerName", errors),
    heroSpeedSeconds: readNumber(record.heroSpeedSeconds, "site.heroSpeedSeconds", errors),
    navItems: validateArray(record.navItems, "site.navItems", errors, validateNavItem),
    heroSlides: validateArray(record.heroSlides, "site.heroSlides", errors, validateHeroSlide),
    figures: validateArray(record.figures, "site.figures", errors, validateFigure),
    featured: validateArray(record.featured, "site.featured", errors, validatePortfolioItem),
    games: validateArray(record.games, "site.games", errors, validatePortfolioItem),
    devs: validateArray(record.devs, "site.devs", errors, validatePortfolioItem),
    sections: {
      featured: validateSection(sections.featured, "site.sections.featured", errors),
      games: validateSection(sections.games, "site.sections.games", errors),
      dev: validateSection(sections.dev, "site.sections.dev", errors),
      news: validateSectionWithDefault(sections.news, "site.sections.news", errors, SITE_CONFIG.sections.news),
      about: validateSection(sections.about, "site.sections.about", errors),
      contact: validateSection(sections.contact, "site.sections.contact", errors)
    }
  };

  if (site.heroSpeedSeconds <= 0) {
    errors.push("site.heroSpeedSeconds must be greater than 0.");
  }
  if (isLegacyContactSection(site.sections.contact)) {
    site.sections.contact = cloneSection(SITE_CONFIG.sections.contact);
  }
  if (!site.navItems.length) {
    errors.push("site.navItems must include at least one item.");
  }
  if (!site.heroSlides.length) {
    errors.push("site.heroSlides must include at least one slide.");
  }
  if (!site.figures.length) {
    errors.push("site.figures must include at least one figure.");
  }

  return { ok: errors.length === 0, value: errors.length === 0 ? site : undefined, errors };
}

export function validateContentDocument(value: unknown): ValidationResult<ContentDocument> {
  const errors: string[] = [];
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    errors.push("content document must be an object.");
  }

  if (record.version !== CONTENT_VERSION) {
    errors.push(`content document version must be ${CONTENT_VERSION}.`);
  }

  const siteResult = validateSiteConfig(record.site);
  errors.push(...siteResult.errors);

  const updatedAt = readString(record.updatedAt, "updatedAt", errors);
  const document: ContentDocument | undefined =
    errors.length === 0 && siteResult.value
      ? {
          version: CONTENT_VERSION,
          updatedAt,
          site: siteResult.value
        }
      : undefined;

  return { ok: errors.length === 0, value: document, errors };
}

export function createContentDocument(site: SiteConfig, updatedAt = new Date().toISOString()): ContentDocument {
  return {
    version: CONTENT_VERSION,
    updatedAt,
    site
  };
}

export function isAllowedUploadType(type: string): type is (typeof ALLOWED_UPLOAD_TYPES)[number] {
  return ALLOWED_UPLOAD_TYPES.includes(type as (typeof ALLOWED_UPLOAD_TYPES)[number]);
}
