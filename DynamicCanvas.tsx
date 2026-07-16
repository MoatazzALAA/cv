// components/canvas/DynamicCanvas.tsx
//
// The state router for the Right Panel. Owns which of the five canvas states
// is active and renders it inside the shared, locked enter/exit transition.
// This component is content-agnostic — it never fetches profile/experience/
// skills/certification data itself. Its only external dependency is the
// global transition tokens, needed to drive the animation.

"use client";

import { useState, useMemo, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TransitionTokens, NavTarget, HomeContent, CompanyEntry, ThemeTokens, SkillCategory, Certification } from "@/types";
import { parseCubicBezier } from "@/utils/parseCubicBezier";
import HomeSection from "@/components/canvas/HomeSection";
import ExperienceDirectory from "@/components/canvas/ExperienceDirectory";
import CompanyDetail from "@/components/canvas/CompanyDetail";
import SkillsMatrix from "@/components/canvas/SkillsMatrix";
import CredentialsTimeline from "@/components/canvas/CredentialsTimeline";

// ── View state model ─────────────────────────────────────────────────────
// Every state the canvas can be in. CompanyDetail carries the slug it's
// displaying — this is what lets a single "companyDetail" case in the
// renderer stand in for any of the five companies without per-company logic.
export type ViewState =
  | { type: "home" }
  | { type: "experience" }
  | { type: "companyDetail"; slug: string }
  | { type: "skills" }
  | { type: "certifications" };

// Maps a HomeContent navLink `target` (the string union already defined on
// HomeNavLink) to the corresponding ViewState. Keeps that mapping in one
// place rather than letting each caller re-derive it.
export function targetToViewState(target: NavTarget): ViewState {
  switch (target) {
    case "experience":
      return { type: "experience" };
    case "skills":
      return { type: "skills" };
    case "certifications":
      return { type: "certifications" };
  }
}

// Stable identity per view, used both as the AnimatePresence/React key and
// to detect "this is actually a different view" (so navigating between two
// different companies re-triggers the transition, not just Directory<->Detail).
function viewKey(view: ViewState): string {
  return view.type === "companyDetail" ? `companyDetail:${view.slug}` : view.type;
}

interface DynamicCanvasProps {
  // Sourced from GlobalDesignConfig.transitions. This component is a Client
  // Component (it owns interactive view-switching state), so it cannot fetch
  // this itself via the adapter — a Server Component ancestor must fetch
  // GlobalDesignConfig and pass `transitions` down. See sequencing note below.
  transitionConfig: TransitionTokens;
  // Same reasoning: HomeSection needs HomeContent but is itself a Client
  // Component (it calls onNavigate), so its data is fetched by a Server
  // Component ancestor and threaded down through here as a plain prop —
  // no client-side fetching, no context, per current architecture.
  homeContent: HomeContent;
  // Same reasoning: ExperienceDirectory needs the company list but is a
  // Client Component (hover state, onSelectCompany), so this is threaded
  // down as a plain prop from the same Server Component ancestor.
  experiences: CompanyEntry[];
  // Needed so CompanyDetail can explicitly resolve accentColor against the
  // global default rather than depending on implicit CSS variable fallback.
  theme: ThemeTokens;
  skills: SkillCategory[];
  certifications: Certification[];
}

export default function DynamicCanvas({ transitionConfig, homeContent, experiences, theme, skills, certifications }: DynamicCanvasProps) {
  const [activeView, setActiveView] = useState<ViewState>({ type: "home" });

  // Separates the "find the selected company" lookup from render logic —
  // not a performance necessity at this scale, just cleaner structure.
  const selectedCompany = useMemo(() => {
    if (activeView.type !== "companyDetail") return null;
    return experiences.find((entry) => entry.id === activeView.slug) ?? null;
  }, [activeView, experiences]);

  const transition = {
    duration: transitionConfig.globalDurationMs / 1000,
    ease: parseCubicBezier(transitionConfig.globalEasing),
  };

  const handleNavigate = (target: NavTarget) => {
    setActiveView(targetToViewState(target));
  };

  const handleSelectCompany = (slug: string) => {
    setActiveView({ type: "companyDetail", slug });
  };

  function renderActiveView(): ReactNode {
    switch (activeView.type) {
      case "home":
        // handleNavigate passed directly — only one consumer exists right
        // now, so a context is unnecessary infrastructure. If multiple
        // unrelated components end up needing navigation, promote this to
        // a context then, not preemptively.
        return <HomeSection homeContent={homeContent} onNavigate={handleNavigate} />;

      case "experience":
        return (
          <ExperienceDirectory
            companies={experiences}
            onSelectCompany={handleSelectCompany}
          />
        );

      case "companyDetail": {
        // No fabricated fallback UI if the slug doesn't match anything —
        // this shouldn't happen via normal navigation (slugs come straight
        // from CompanyEntry.id), but a stale/direct link shouldn't crash.
        if (!selectedCompany) return null;

        return (
          <CompanyDetail
            company={selectedCompany}
            theme={theme}
            onBack={() => setActiveView({ type: "experience" })}
          />
        );
      }

      case "skills":
        return <SkillsMatrix categories={skills} />;

      case "certifications":
        return <CredentialsTimeline certifications={certifications} />;

      default:
        return null;
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey(activeView)}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={transition}
      >
        {renderActiveView()}
      </motion.div>
    </AnimatePresence>
  );
}
