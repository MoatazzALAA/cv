// adapters/schemas.ts
//
// Runtime validation for the Content Layer. TypeScript's `satisfies` only checks
// shape at compile time — it can't catch a hand-edited JSON file, a bad CMS write,
// or a malformed API response once the adapter is swapped later. These Zod schemas
// re-validate every content domain at the actual point of ingestion (jsonAdapter.ts),
// so a structural mistake fails loudly and immediately instead of surfacing as a
// silent `undefined` deep inside a component.
//
// Each schema mirrors its corresponding interface in types/index.ts field-for-field.
// If a type changes there, the matching schema below must change too — they are
// two representations of one contract, not two independent sources of truth.

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────

export const ContactLinkSchema = z.object({
  type: z.enum(["email", "linkedin", "phone", "custom"]),
  label: z.string(),
  value: z.string(),
  icon: z.string(),
});

export const ProfileSchema = z.object({
  fullName: z.string(),
  title: z.string(),
  avatar: z.object({
    src: z.string(),
    alt: z.string(),
  }),
  contactLinks: z.array(ContactLinkSchema),
});

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────

export const EducationEntrySchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
});

export const LanguageEntrySchema = z.object({
  name: z.string(),
  proficiency: z.enum(["native", "fluent", "professional", "conversational"]),
});

export const HomeNavLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  target: z.enum(["experience", "skills", "certifications"]),
});

export const ContentMetadataSchema = z.object({
  lastUpdated: z.string(),
});

export const HomeContentSchema = z.object({
  version: z.string(),
  schemaVersion: z.string().optional(),
  metadata: ContentMetadataSchema,
  summary: z.string(),
  education: z.array(EducationEntrySchema),
  languages: z.array(LanguageEntrySchema),
  navLinks: z.array(HomeNavLinkSchema),
});

// ─────────────────────────────────────────────────────────────
// EXPERIENCE
// ─────────────────────────────────────────────────────────────

export const CompanyDesignConfigSchema = z.object({
  industry: z.enum(["aviation", "legal", "operations", "retail", "other"]).optional(),
  background_image_path: z.string().optional(),
  watermark_svg_path: z.string().optional(),
  overlay_opacity: z.number().min(0).max(1).optional(),
  brand_accent_color: z.string().optional(),
  watermark_placement: z.enum(["center", "bottom-right", "bottom-left"]).optional(),
  max_metrics_allowed: z.number().optional(),
  animation_overrides: z.record(z.never()).optional(),
});

export const CompanyMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const CompanyEntrySchema = z.object({
  id: z.string(),
  companyName: z.string(),
  roleTitle: z.string(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(), // covers both concrete years and the literal "present"
  }),
  directoryContext: z.string(),
  narrative: z.string(),
  systemsUsed: z.array(z.string()),
  metrics: z.array(CompanyMetricSchema),
  design_config: CompanyDesignConfigSchema.optional(),
});

export const ExperiencesContentSchema = z.object({
  version: z.string(),
  schemaVersion: z.string().optional(),
  metadata: ContentMetadataSchema,
  companies: z.array(CompanyEntrySchema),
});

// ─────────────────────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────────────────────

export const SkillSchema = z.object({
  id: z.string(),
  label: z.string(),
  weightTier: z.enum(["primary", "secondary"]),
  relatedExperienceIds: z.array(z.string()).optional(),
});

export const SkillCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(SkillSchema),
});

export const SkillsContentSchema = z.object({
  version: z.string(),
  schemaVersion: z.string().optional(),
  metadata: ContentMetadataSchema,
  categories: z.array(SkillCategorySchema),
});

// ─────────────────────────────────────────────────────────────
// CERTIFICATIONS
// ─────────────────────────────────────────────────────────────

export const CertificationSchema = z.object({
  id: z.string(),
  year: z.string().nullable(),
  title: z.string(),
  issuer: z.string().nullable(),
  verifyUrl: z.string().nullable(),
  relatedExperienceIds: z.array(z.string()).optional(),
});

export const CertificatesContentSchema = z.object({
  version: z.string(),
  schemaVersion: z.string().optional(),
  metadata: ContentMetadataSchema,
  certifications: z.array(CertificationSchema),
});

// ─────────────────────────────────────────────────────────────
// GLOBAL DESIGN CONFIG
// ─────────────────────────────────────────────────────────────

export const ThemeTokensSchema = z.object({
  background: z.string(),
  surface: z.string(),
  textPrimary: z.string(),
  textSecondary: z.string(),
  accentDefault: z.string(),
});

export const TransitionTokensSchema = z.object({
  globalEasing: z.string(),
  globalDurationMs: z.number(),
  illuminationDurationMs: z.number(),
});

export const GlobalDesignConfigSchema = z.object({
  theme: ThemeTokensSchema,
  transitions: TransitionTokensSchema,
});

// ─────────────────────────────────────────────────────────────
// PROJECTS (reserved — validated for completeness even though unused in v1.0)
// ─────────────────────────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  fullDescription: z.string().optional(),
  technologies: z.array(z.string()),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  githubUrl: z.string().optional(),
  liveDemoUrl: z.string().optional(),
  documentationUrl: z.string().optional(),
  featured: z.boolean().optional(),
});
