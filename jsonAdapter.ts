// adapters/jsonAdapter.ts
//
// Concrete implementation of the ContentAdapter contract (types/index.ts, Section 6).
// This is the ONLY file in the codebase that knows content currently lives in local
// JSON. Every hook and component downstream depends on the ContentAdapter interface,
// never on this file directly — swapping this for a FirebaseAdapter later requires
// zero changes anywhere else in the tree.
//
// Every return value is validated at runtime via the Zod schemas in schemas.ts before
// it leaves this file. TypeScript's `satisfies` only protects us at compile time —
// it can't catch a hand-edited JSON file or a future CMS write. Zod closes that gap:
// if content ever drifts from its contract, `.parse()` throws immediately, here,
// with a clear error — not silently, three components downstream.

import type {
  ContentAdapter,
  Profile,
  HomeContent,
  ExperiencesContent,
  SkillsContent,
  CertificatesContent,
  GlobalDesignConfig,
  Project,
} from "@/types";

import {
  ProfileSchema,
  HomeContentSchema,
  ExperiencesContentSchema,
  SkillsContentSchema,
  CertificatesContentSchema,
  GlobalDesignConfigSchema,
} from "@/adapters/schemas";

import profileData from "@/content/profile.json";
import homeData from "@/content/home.json";
import experiencesData from "@/content/experiences.json";
import skillsData from "@/content/skills.json";
import certificatesData from "@/content/certificates.json";
import designConfigData from "@/content/design_config.json";

export class JSONAdapter implements ContentAdapter {
  async getProfile(): Promise<Profile> {
    return ProfileSchema.parse(profileData);
  }

  async getHomeContent(): Promise<HomeContent> {
    return HomeContentSchema.parse(homeData);
  }

  async getExperiences(): Promise<ExperiencesContent> {
    return ExperiencesContentSchema.parse(experiencesData);
  }

  async getSkills(): Promise<SkillsContent> {
    return SkillsContentSchema.parse(skillsData);
  }

  async getCertifications(): Promise<CertificatesContent> {
    return CertificatesContentSchema.parse(certificatesData);
  }

  async getGlobalDesignConfig(): Promise<GlobalDesignConfig> {
    return GlobalDesignConfigSchema.parse(designConfigData);
  }

  async getProjects(): Promise<Project[]> {
    // Reserved for a future phase per the frozen contract — no content file
    // exists yet, and no v1.0 component calls this. Nothing to validate yet.
    return [];
  }
}

// Singleton instance consumed by hooks/components.
// Swapping to a different adapter later means changing only this export.
export const contentAdapter: ContentAdapter = new JSONAdapter();
