// types/index.ts
// Strict data contracts for the Content Layer.
// Presentation components import ONLY from this file — never from raw JSON shapes.
// If a field isn't declared here, it cannot legally exist as a prop anywhere in the tree.

// ─────────────────────────────────────────────────────────────
// PROFILE (Left Panel — profile.json)
// ─────────────────────────────────────────────────────────────

export type ContactLinkType = "email" | "linkedin" | "phone" | "custom";

export interface ContactLink {
  type: ContactLinkType;
  label: string;
  value: string;
  icon: string; // key into the locked icon set, never a raw icon component
}

export interface Profile {
  fullName: string;
  title: string;
  avatar: {
    src: string;
    alt: string;
  };
  contactLinks: ContactLink[];
}

// ─────────────────────────────────────────────────────────────
// HOME (State 0 — home.json)
// ─────────────────────────────────────────────────────────────

export type LanguageProficiency =
  | "native"
  | "fluent"
  | "professional"
  | "conversational";

export interface EducationEntry {
  id: string; // stable identifier — used as the React key, not derived from field values
  degree: string;
  institution: string;
  year: string;
}

export interface LanguageEntry {
  name: string;
  proficiency: LanguageProficiency;
}

export type NavTarget = "experience" | "skills" | "certifications";

export interface HomeNavLink {
  id: string; // stable identifier — routing/logic should key off this, never off `label`
  label: string;
  target: NavTarget;
}

export interface ContentMetadata {
  lastUpdated: string; // ISO 8601 date string — informational only, not rendered
}

export interface HomeContent {
  version: string;
  schemaVersion?: string; // distinct from content `version` — reserved for future structural migrations
  metadata: ContentMetadata;
  summary: string;
  education: EducationEntry[];
  languages: LanguageEntry[];
  navLinks: HomeNavLink[];
}

// ─────────────────────────────────────────────────────────────
// EXPERIENCE (States 1 & 2 — experiences.json)
// ─────────────────────────────────────────────────────────────

export type WatermarkPlacement = "center" | "bottom-right" | "bottom-left";

export type CompanyIndustry = "aviation" | "legal" | "operations" | "retail" | "other";

export interface CompanyDesignConfig {
  industry?: CompanyIndustry; // classification only — not a visual override by itself.
  // Enables future AI-driven theming/iconography to key off industry rather than
  // parsing company names. A company can set this with no other field present,
  // in which case it still falls back to the global theme for all visual values.
  background_image_path?: string;
  watermark_svg_path?: string;
  overlay_opacity?: number; // 0.0–1.0, UI enforces a soft visual ceiling regardless of value
  brand_accent_color?: string; // hex; falls back to global accentDefault if omitted
  watermark_placement?: WatermarkPlacement;
  max_metrics_allowed?: number; // soft guardrail, defaults to 4 in the component
  animation_overrides?: Record<string, never>; // reserved for future phases — intentionally empty today
}

export interface CompanyMetric {
  label: string;
  value: string;
}

export interface CompanyEntry {
  id: string; // slug, e.g. "nile-air" — used for routing
  companyName: string;
  roleTitle: string;
  dateRange: {
    start: string;
    end: string | "present";
  };
  directoryContext: string; // short line shown in the Directory row
  narrative: string; // rich text, unbounded length by design
  systemsUsed: string[];
  metrics: CompanyMetric[];
  design_config?: CompanyDesignConfig; // optional — absence means pure global-theme defaults
}

export interface ExperiencesContent {
  version: string;
  schemaVersion?: string; // distinct from content `version` — reserved for future structural migrations
  metadata: ContentMetadata;
  companies: CompanyEntry[];
}

// ─────────────────────────────────────────────────────────────
// SKILLS (State 3 — skills.json)
// ─────────────────────────────────────────────────────────────

export type SkillWeightTier = "primary" | "secondary";

export interface Skill {
  id: string; // stable identifier — never derive logic from `label`
  label: string;
  weightTier: SkillWeightTier;
  relatedExperienceIds?: string[]; // optional pointers into CompanyEntry.id — not rendered in v1.0,
  // reserved for future filtering / cross-highlighting / AI contextualization
}

export interface SkillCategory {
  id: string; // stable identifier — never derive logic from `name`
  name: string;
  skills: Skill[];
}

export interface SkillsContent {
  version: string;
  schemaVersion?: string; // distinct from content `version` — reserved for future structural migrations
  metadata: ContentMetadata;
  categories: SkillCategory[]; // length is intentionally unbounded — the Skills Matrix
  // renders however many categories exist; no component may assume a fixed count.
}

// ─────────────────────────────────────────────────────────────
// CERTIFICATIONS (State 4 — certificates.json)
// ─────────────────────────────────────────────────────────────

export interface Certification {
  id: string;
  year: string | null; // null when the CV/source doesn't specify a date —
  // presentation layer decides whether to hide the field or show a fallback.
  title: string;
  issuer: string | null; // null when the CV/source doesn't specify an issuer.
  verifyUrl: string | null;
  relatedExperienceIds?: string[]; // same semantic relationship layer used on Skill —
  // optional pointers into CompanyEntry.id, reserved for future filtering/AI features,
  // not rendered in v1.0.
}

export interface CertificatesContent {
  version: string;
  schemaVersion?: string; // distinct from content `version` — reserved for future structural migrations
  metadata: ContentMetadata;
  certifications: Certification[];
}

// ─────────────────────────────────────────────────────────────
// GLOBAL DESIGN CONFIG (design_config.json)
// ─────────────────────────────────────────────────────────────

export interface ThemeTokens {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accentDefault: string;
}

export interface TransitionTokens {
  globalEasing: string;
  globalDurationMs: number;
  illuminationDurationMs: number;
}

export interface GlobalDesignConfig {
  theme: ThemeTokens;
  transitions: TransitionTokens;
}

// ─────────────────────────────────────────────────────────────
// PROJECTS (future state — not rendered in v1.0 UI)
// Reserved so the Content Layer and ContentAdapter contract are
// forward-compatible without requiring a structural revision later.
// No component in the frozen v1.0 tree consumes this yet.
// ─────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  technologies: string[];
  coverImage?: string;
  gallery?: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  documentationUrl?: string;
  featured?: boolean;
}

// ─────────────────────────────────────────────────────────────
// DATA ADAPTER CONTRACT (Section 6 — implemented by adapters/*)
// Every adapter (JSON today, Firebase/CMS tomorrow) must satisfy this
// exact interface. Components and hooks depend on this type, never on
// a concrete adapter implementation.
// ─────────────────────────────────────────────────────────────

export interface ContentAdapter {
  getProfile(): Promise<Profile>;
  getHomeContent(): Promise<HomeContent>;
  getExperiences(): Promise<ExperiencesContent>;
  getSkills(): Promise<SkillsContent>;
  getCertifications(): Promise<CertificatesContent>;
  getGlobalDesignConfig(): Promise<GlobalDesignConfig>;
  getProjects(): Promise<Project[]>; // reserved for future phase — not called by any v1.0 component
}
